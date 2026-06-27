import crypto from "crypto";
import { WebUIExecutor } from "./webui-base.js";

/**
 * DuckWebExecutor - Duck.ai (DuckDuckGo AI Chat) integration
 * 
 * Uses VQD challenge tokens for authentication (no API key required).
 * Duck.ai provides free access to GPT-4o, Claude Haiku 4.5, Llama 4 Scout, and Mistral Small.
 * 
 * Authentication: None required (uses challenge-response)
 */
export class DuckWebExecutor extends WebUIExecutor {
  constructor() {
    super("duck-web", {
      baseUrl: "https://duck.ai",
      format: "openai",
    });
    this.pendingHash = null;
    this.feVersion = null;
  }

  // ============ URL builders ============

  buildUrl(model, stream, urlIndex = 0, credentials = null) {
    return `${this.config.baseUrl}/duckchat/v1/chat`;
  }

  getStatusUrl() {
    return `${this.config.baseUrl}/duckchat/v1/status`;
  }

  // ============ Headers ============

  buildWebHeaders(credentials) {
    const headers = {
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
      "Origin": this.config.baseUrl,
      "Referer": `${this.config.baseUrl}/`,
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    };

    // Add VQD hash if available
    if (this.pendingHash) {
      headers["x-vqd-hash-1"] = this.pendingHash;
    }

    // Add FE version
    if (this.feVersion) {
      headers["x-fe-version"] = this.feVersion;
    }

    // Add static headers
    headers["x-fe-signals"] = this.generateFeSignals();

    return headers;
  }

  /**
   * Generate x-fe-signals header
   */
  generateFeSignals() {
    const now = Date.now();
    const signals = {
      start: now - 3200,
      events: [
        { name: "startNewChat", delta: 350 },
        { name: "user_input", delta: 420 },
        { name: "user_submit", delta: 580 },
      ],
      end: 3200,
    };
    return Buffer.from(JSON.stringify(signals)).toString("base64");
  }

  // ============ Payload ============

  buildWebPayload(model, messages, stream, credentials) {
    const payload = {
      model: model,
      metadata: {
        toolChoice: {
          NewsSearch: false,
          VideosSearch: false,
          LocalSearch: false,
          WeatherForecast: false,
          WebSearch: false,
        },
      },
      messages: this.buildMessagesArray(messages),
      canUseTools: true,
      reasoningEffort: "low",
      canUseApproxLocation: null,
      durableStream: {
        messageId: crypto.randomUUID(),
        conversationId: crypto.randomUUID(),
      },
    };

    return payload;
  }

  /**
   * Build messages array from OpenAI messages
   */
  buildMessagesArray(messages) {
    const result = [];
    for (const msg of messages) {
      let role = msg.role;
      if (role === "developer") role = "system";
      
      let content = "";
      if (typeof msg.content === "string") {
        content = msg.content;
      } else if (Array.isArray(msg.content)) {
        content = msg.content
          .filter((c) => c.type === "text")
          .map((c) => String(c.text || ""))
          .join(" ");
      }

      if (!content.trim()) continue;
      result.push({ role, content });
    }
    return result;
  }

  // ============ Stream parsing ============

  async *parseWebStream(responseBody, model, signal) {
    const reader = responseBody.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE lines
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          const data = trimmed.slice(6);
          if (data === "[DONE]") {
            yield { done: true };
            return;
          }

          // Skip non-JSON events
          if (data.startsWith("[CHAT_TITLE") || data.startsWith("[LIMIT") || data.startsWith("[PING")) {
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            
            // Handle error events
            if (parsed.action === "error") {
              if (parsed.status === 418) {
                // Challenge rejected - need new VQD
                yield { error: "Challenge rejected — retrying with new token" };
              } else if (parsed.status === 429) {
                yield { error: "Rate limited" };
              } else {
                yield { error: parsed.type || "Unknown error" };
              }
              return;
            }

            // Handle message content
            if (parsed.message) {
              yield { delta: parsed.message };
            }
          } catch {
            // Not valid JSON, skip
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // ============ Error handling ============

  handleWebError(response, status, logger) {
    let errMsg = `Duck.ai returned HTTP ${status}`;
    
    if (status === 418) {
      errMsg = "Duck.ai challenge rejected — need new VQD token";
    } else if (status === 429) {
      errMsg = "Duck.ai rate limited";
    } else if (status === 403) {
      errMsg = "Duck.ai access denied";
    }

    logger?.warn?.("DUCK-WEB", errMsg);
    return this.errorResponse(errMsg, status);
  }

  // ============ Full execute override ============

  async execute({ model, body, stream, credentials, signal, log }) {
    const messages = body?.messages;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return this.errorResponse("Missing or empty messages array", 400);
    }

    try {
      // First, try to get VQD token if we don't have one
      if (!this.pendingHash) {
        await this.refreshVqdToken(log);
      }

      const payload = this.buildWebPayload(model, messages, stream, credentials);
      const headers = this.buildWebHeaders(credentials);
      const url = this.buildUrl(model, stream, 0, credentials);

      log?.info?.("DUCK-WEB", `Request to ${model}, endpoint=${url}`);

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal,
      });

      // Extract new VQD hash from response headers
      const newHash = response.headers.get("x-vqd-hash-1");
      if (newHash) {
        this.pendingHash = newHash;
      }

      if (!response.ok) {
        // If 418, try to refresh VQD and retry once
        if (response.status === 418) {
          log?.warn?.("DUCK-WEB", "Got 418, refreshing VQD token");
          await this.refreshVqdToken(log);
          headers["x-vqd-hash-1"] = this.pendingHash;
          
          const retryResponse = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
            signal,
          });

          const retryHash = retryResponse.headers.get("x-vqd-hash-1");
          if (retryHash) {
            this.pendingHash = retryHash;
          }

          if (!retryResponse.ok) {
            return this.handleWebError(retryResponse, retryResponse.status, log);
          }

          if (!retryResponse.body) {
            return this.errorResponse("Empty response body", 502);
          }

          const cid = `chatcmpl-duck-web-${crypto.randomUUID().slice(0, 12)}`;
          const created = Math.floor(Date.now() / 1000);

          if (stream) {
            const sseStream = this.buildStreamingResponse(retryResponse.body, model, cid, created, signal);
            return {
              response: new Response(sseStream, {
                status: 200,
                headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
              }),
              url,
              headers,
              transformedBody: payload,
            };
          } else {
            const result = await this.buildNonStreamingResponse(retryResponse.body, model, cid, created, signal);
            return {
              response: result,
              url,
              headers,
              transformedBody: payload,
            };
          }
        }

        return this.handleWebError(response, response.status, log);
      }

      if (!response.body) {
        return this.errorResponse("Empty response body", 502);
      }

      const cid = `chatcmpl-duck-web-${crypto.randomUUID().slice(0, 12)}`;
      const created = Math.floor(Date.now() / 1000);

      if (stream) {
        const sseStream = this.buildStreamingResponse(response.body, model, cid, created, signal);
        return {
          response: new Response(sseStream, {
            status: 200,
            headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
          }),
          url,
          headers,
          transformedBody: payload,
        };
      } else {
        const result = await this.buildNonStreamingResponse(response.body, model, cid, created, signal);
        return {
          response: result,
          url,
          headers,
          transformedBody: payload,
        };
      }
    } catch (err) {
      log?.error?.("DUCK-WEB", `Error: ${err.message || String(err)}`);
      return this.errorResponse(`duck-web failed: ${err.message || String(err)}`, 502);
    }
  }

  /**
   * Refresh VQD token from Duck.ai status endpoint
   */
  async refreshVqdToken(log) {
    try {
      log?.info?.("DUCK-WEB", "Refreshing VQD token");
      
      // First visit homepage to get FE version
      const homeResponse = await fetch(`${this.config.baseUrl}/`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        },
      });
      
      const homeHtml = await homeResponse.text();
      const beMatch = homeHtml.match(/__DDG_BE_VERSION__\s*=\s*"([^"]+)"/);
      const feMatch = homeHtml.match(/__DDG_FE_CHAT_HASH__\s*=\s*"([^"]+)"/);
      
      if (beMatch && feMatch) {
        this.feVersion = `${beMatch[1]}-${feMatch[1]}`;
      } else {
        this.feVersion = "serp_20260424_180649_ET-0bdc33b2a02ebf8f235def65d887787f694720a1";
      }

      // Get VQD token
      const statusResponse = await fetch(this.getStatusUrl(), {
        headers: {
          "Accept": "*/*",
          "x-vqd-accept": "1",
          "Referer": `${this.config.baseUrl}/`,
          "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        },
      });

      const vqdHash = statusResponse.headers.get("x-vqd-hash-1");
      if (vqdHash) {
        this.pendingHash = vqdHash;
        log?.info?.("DUCK-WEB", "VQD token refreshed");
      } else {
        log?.warn?.("DUCK-WEB", "No VQD hash in response");
      }
    } catch (err) {
      log?.warn?.("DUCK-WEB", `Failed to refresh VQD: ${err.message}`);
    }
  }
}

export default DuckWebExecutor;
