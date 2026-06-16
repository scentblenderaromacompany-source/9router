import { WebUIExecutor } from "./webui-base.js";
import { PROVIDERS } from "../config/providers.js";

const DEEPSEEK_API = "https://chat.deepseek.com";
const DEEPSEEK_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const MODEL_MAP = {
  "deepseek-web-chat": { mode: "chat", name: "DeepSeek Chat" },
  "deepseek-web-reasoner": { mode: "reasoner", name: "DeepSeek Reasoner" },
};

/**
 * DeepSeek Web Executor - Direct web API integration
 * 
 * This executor communicates directly with DeepSeek's web interface,
 * using USER_TOKEN from browser local storage for authentication.
 * 
 * IMPORTANT: Requires a valid USER_TOKEN from chat.deepseek.com.
 * Get it from: F12 → Application → Local Storage → chat.deepseek.com → USER_TOKEN
 */
export class DeepSeekWebExecutor extends WebUIExecutor {
  constructor() {
    super("deepseek-web", PROVIDERS["deepseek-web"] || {
      baseUrl: DEEPSEEK_API,
      format: "openai",
    });
    this.sessions = new Map();
  }

  buildUrl(model, stream, urlIndex = 0, credentials = null) {
    return `${DEEPSEEK_API}/api/v0/chat/completion`;
  }

  async buildWebPayload(model, messages, stream, credentials) {
    const modelInfo = MODEL_MAP[model] || { mode: "chat", name: model };
    const prompt = this.buildPrompt(messages);
    const sessionId = await this.getOrCreateSession(credentials);
    
    return {
      prompt,
      chat_session_id: sessionId,
      model: modelInfo.mode,
      stream: stream ?? false,
    };
  }

  async buildWebHeaders(credentials) {
    const headers = {
      Accept: "text/event-stream",
      "Accept-Language": "en-US,en;q=0.9",
      "Content-Type": "application/json",
      "User-Agent": DEEPSEEK_USER_AGENT,
      Origin: DEEPSEEK_API,
      Referer: `${DEEPSEEK_API}/`,
    };

    // User token is passed as Bearer token
    if (credentials?.apiKey) {
      headers["Authorization"] = `Bearer ${credentials.apiKey}`;
    }

    return headers;
  }

  /**
   * Build prompt from OpenAI messages format
   */
  buildPrompt(messages) {
    const parts = [];
    for (const msg of messages) {
      let role = msg.role || "user";
      let content = "";
      
      if (typeof msg.content === "string") {
        content = msg.content;
      } else if (Array.isArray(msg.content)) {
        content = msg.content
          .filter((c) => c.type === "text")
          .map((c) => c.text || "")
          .join(" ");
      }
      
      if (!content.trim()) continue;
      
      if (role === "system") {
        parts.push(`[System] ${content}`);
      } else if (role === "user") {
        parts.push(content);
      } else if (role === "assistant") {
        parts.push(`[Assistant] ${content}`);
      } else if (role === "tool") {
        parts.push(`[Tool Result] ${content}`);
      }
    }
    
    return parts.join("\n\n");
  }

  /**
   * Get or create a session for the conversation
   */
  async getOrCreateSession(credentials) {
    const cacheKey = credentials?.apiKey || "default";
    if (this.sessions.has(cacheKey)) {
      return this.sessions.get(cacheKey);
    }

    const headers = await this.buildWebHeaders(credentials);
    const response = await fetch(`${DEEPSEEK_API}/api/v0/chat_session/create`, {
      method: "POST",
      headers,
      body: JSON.stringify({ agent: "chat" }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.status}`);
    }

    const data = await response.json();
    const sessionId = data.id || data.chat_session_id;
    this.sessions.set(cacheKey, sessionId);
    return sessionId;
  }

  /**
   * Override execute to handle DeepSeek's specific flow
   */
  async execute({ model, body, stream, credentials, signal, log }) {
    const messages = body?.messages;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return this.errorResponse("Missing or empty messages array", 400);
    }

    if (!credentials?.apiKey) {
      return this.errorResponse(
        "DeepSeek Web requires a USER_TOKEN. Get it from: F12 → Application → Local Storage → chat.deepseek.com → USER_TOKEN",
        401
      );
    }

    try {
      // Build payload
      const payload = await this.buildWebPayload(model, messages, stream, credentials);
      
      // Build headers
      const headers = await this.buildWebHeaders(credentials);
      
      // Build URL
      const url = this.buildUrl(model, stream, 0, credentials);
      
      log?.info?.("DEEPSEEK-WEB", `Request to ${model}, endpoint=${url}`);
      
      // Make request
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal,
      });
      
      // Handle errors
      if (!response.ok) {
        return this.handleWebError(response, response.status, log);
      }
      
      if (!response.body) {
        return this.errorResponse("Empty response body", 502);
      }
      
      // Parse response
      const cid = `chatcmpl-deepseek-web-${crypto.randomUUID().slice(0, 12)}`;
      const created = Math.floor(Date.now() / 1000);
      
      if (stream) {
        const sseStream = this.buildStreamingResponse(response.body, model, cid, created, signal);
        return {
          response: new Response(sseStream, {
            status: 200,
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
            },
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
      log?.error?.("DEEPSEEK-WEB", `Error: ${err.message || String(err)}`);
      return this.errorResponse(`DeepSeek Web failed: ${err.message || String(err)}`, 502);
    }
  }

  /**
   * Parse DeepSeek's SSE stream
   */
  async *parseWebStream(responseBody, model, signal) {
    const reader = responseBody.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    
    try {
      while (true) {
        if (signal?.aborted) return;
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Process SSE events
        while (true) {
          const eventEnd = buffer.indexOf("\n\n");
          if (eventEnd < 0) break;
          
          const eventBlock = buffer.slice(0, eventEnd);
          buffer = buffer.slice(eventEnd + 2);
          
          // Parse event data
          let eventData = "";
          for (const line of eventBlock.split("\n")) {
            if (line.startsWith("data: ")) {
              eventData = line.slice(6);
            }
          }
          
          if (!eventData || eventData === "[DONE]") continue;
          
          try {
            const data = JSON.parse(eventData);
            
            // DeepSeek returns {"choices": [{"delta": {"content": "text"}}]} format
            if (data.choices && Array.isArray(data.choices)) {
              for (const choice of data.choices) {
                if (choice.delta?.content) {
                  yield { delta: choice.delta.content };
                }
                if (choice.delta?.reasoning_content) {
                  yield { thinking: choice.delta.reasoning_content };
                }
                if (choice.finish_reason) {
                  yield { done: true };
                  return;
                }
              }
            }
            
            // Check for direct completion field
            if (data.completion) {
              yield { delta: data.completion };
            }
            
            if (data.stop_reason || data.done) {
              yield { done: true };
              return;
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
      
      yield { done: true };
    } finally {
      reader.releaseLock();
    }
  }

  handleWebError(response, status, logger) {
    let errMsg = `DeepSeek returned HTTP ${status}`;
    if (status === 401 || status === 403) {
      errMsg = "DeepSeek session expired — update your USER_TOKEN in Providers → DeepSeek Web → Edit";
    } else if (status === 429) {
      errMsg = "DeepSeek rate limited — try again shortly";
    } else if (status === 404) {
      errMsg = "DeepSeek session or endpoint not found";
    }
    
    logger?.warn?.("DEEPSEEK-WEB", errMsg);
    return this.errorResponse(errMsg, status);
  }
}

export default DeepSeekWebExecutor;
