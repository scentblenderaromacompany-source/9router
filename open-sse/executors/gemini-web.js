import crypto from "crypto";
import { WebUIExecutor } from "./webui-base.js";

/**
 * GeminiWebExecutor - Google Gemini Web UI integration
 * 
 * Uses browser cookies (__Secure-1PSID + __Secure-1PSIDTS) to access Gemini.
 * Gemini uses a non-standard streaming format (not SSE).
 * 
 * Authentication: cookies from gemini.google.com
 */
export class GeminiWebExecutor extends WebUIExecutor {
  constructor() {
    super("gemini-web", {
      baseUrl: "https://gemini.google.com",
      format: "openai",
    });
    this.sessionId = null;
    this.buildLabel = null;
    this.accessToken = null;
  }

  // ============ URL builders ============

  buildUrl(model, stream, urlIndex = 0, credentials = null) {
    return `${this.config.baseUrl}/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate`;
  }

  getBatchExecuteUrl() {
    return `${this.config.baseUrl}/_/BardChatUi/data/batchexecute`;
  }

  getInitUrl() {
    return `${this.config.baseUrl}/app`;
  }

  // ============ Headers ============

  buildWebHeaders(credentials) {
    const cookies = this.parseCookies(credentials);
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      "Origin": this.config.baseUrl,
      "Referer": `${this.config.baseUrl}/`,
      "X-Same-Domain": "1",
    };

    if (cookies) {
      headers["Cookie"] = cookies;
    }

    return headers;
  }

  /**
   * Parse credentials into cookie string
   * Accepts: string (raw cookie), or object with __Secure-1PSID, __Secure-1PSIDTS
   */
  parseCookies(credentials) {
    if (!credentials) return null;
    
    const apiKey = credentials.apiKey || credentials.accessToken;
    if (!apiKey) return null;

    // If it's already a cookie string
    if (typeof apiKey === "string" && apiKey.includes("__Secure-1PSID")) {
      return apiKey;
    }

    // If it's a JSON string with cookie values
    if (typeof apiKey === "string" && apiKey.startsWith("{")) {
      try {
        const parsed = JSON.parse(apiKey);
        const parts = [];
        if (parsed.__Secure_1PSID || parsed["__Secure-1PSID"]) {
          parts.push(`__Secure-1PSID=${parsed.__Secure_1PSID || parsed["__Secure-1PSID"]}`);
        }
        if (parsed.__Secure_1PSIDTS || parsed["__Secure-1PSIDTS"]) {
          parts.push(`__Secure-1PSIDTS=${parsed.__Secure_1PSIDTS || parsed["__Secure-1PSIDTS"]}`);
        }
        return parts.join("; ") || null;
      } catch { /* fall through */ }
    }

    // If it's a simple token, use as __Secure-1PSID
    return `__Secure-1PSID=${apiKey}`;
  }

  // ============ Payload ============

  buildWebPayload(model, messages, stream, credentials) {
    const prompt = this.parseMessages(messages);
    const modelInfo = this.getModelInfo(model);
    const sessionId = this.sessionId || crypto.randomUUID().replace(/-/g, "").toUpperCase().slice(0, 32);
    const reqid = Math.floor(Math.random() * 90000) + 10000;

    // Build the 81-element sparse array for StreamGenerate
    const innerArray = new Array(81).fill(null);
    innerArray[0] = [prompt, 0, null, null, null, null, 0];
    innerArray[1] = ["en"];
    innerArray[2] = [];
    innerArray[6] = [1];
    innerArray[7] = stream ? 1 : 0;
    innerArray[10] = 1;
    innerArray[11] = 0;
    innerArray[17] = [[0]];
    if (modelInfo.modelId) innerArray[19] = modelInfo.modelId;
    innerArray[27] = 1;
    innerArray[30] = [4];
    innerArray[41] = [1];
    innerArray[53] = 0;
    innerArray[59] = crypto.randomUUID();
    innerArray[61] = [];
    innerArray[68] = 1;
    innerArray[79] = modelInfo.modelNumber || 1;
    innerArray[80] = 1;

    const payload = {
      innerArray,
      sessionId,
      reqid,
      modelInfo,
    };

    return payload;
  }

  /**
   * Get model info for request headers
   */
  getModelInfo(model) {
    const models = {
      "gemini-3-pro": { modelId: "9d8ca3786ebdfbea", capacityTail: 1, modelNumber: 3 },
      "gemini-3-flash": { modelId: "fbb127bbb056c959", capacityTail: 1, modelNumber: 1 },
      "gemini-3-flash-thinking": { modelId: "5bf011840784117a", capacityTail: 1, modelNumber: 1 },
      "gemini-3-lite": { modelId: "cf41b0e0dd7d53e5", capacityTail: 1, modelNumber: 6 },
      "gemini-2.5-pro": { modelId: "e6fa609c3fa255c0", capacityTail: 4, modelNumber: 3 },
      "gemini-2.5-flash": { modelId: "56fdd199312815e2", capacityTail: 4, modelNumber: 1 },
      "gemini-2.0-flash": { modelId: "56fdd199312815e2", capacityTail: 1, modelNumber: 1 },
      "gemini-2.0-flash-lite": { modelId: "cf41b0e0dd7d53e5", capacityTail: 1, modelNumber: 1 },
    };
    return models[model] || { modelId: null, capacityTail: 1, modelNumber: 1 };
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

        // Gemini uses chunked format: {line_count}\n{lines}
        const lines = buffer.split("\n");
        buffer = "";

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Try to parse as JSON array
          try {
            const parsed = JSON.parse(line);
            if (Array.isArray(parsed)) {
              // Look for content in the response
              const result = this.extractContentFromGeminiResponse(parsed);
              if (result.text) {
                yield { delta: result.text };
              }
              if (result.thinking) {
                yield { thinking: result.thinking };
              }
              if (result.done) {
                yield { done: true };
                return;
              }
              if (result.error) {
                yield { error: result.error };
                return;
              }
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

  /**
   * Extract content from Gemini response array
   */
  extractContentFromGeminiResponse(arr) {
    const result = { text: null, thinking: null, done: false, error: null };

    try {
      // The response is typically a nested array
      // Look for the inner JSON string in position [2]
      if (arr.length > 2 && typeof arr[2] === "string") {
        const inner = JSON.parse(arr[2]);
        
        // Check for candidates
        if (inner && inner[4] && Array.isArray(inner[4]) && inner[4][0]) {
          const candidate = inner[4][0];
          
          // Text content is in [1][0]
          if (candidate[1] && Array.isArray(candidate[1]) && candidate[1][0]) {
            result.text = candidate[1][0];
          }
          
          // Completion indicator in [8][0]
          if (candidate[8] && Array.isArray(candidate[8]) && candidate[8][0] === 2) {
            result.done = true;
          }

          // Thinking content in [37][0][0]
          if (candidate[37] && Array.isArray(candidate[37]) && candidate[37][0] && Array.isArray(candidate[37][0]) && candidate[37][0][0]) {
            result.thinking = candidate[37][0][0];
          }
        }

        // Check for errors
        if (inner && inner[5] && inner[5][2] && inner[5][2][0] && inner[5][2][0][1]) {
          result.error = `Gemini error: ${inner[5][2][0][1]}`;
        }
      }

      // Check for context string (final chunk marker)
      if (arr.length > 25 && arr[25] && typeof arr[25] === "string") {
        result.done = true;
      }
    } catch {
      // Parse error, skip
    }

    return result;
  }

  // ============ Error handling ============

  handleWebError(response, status, logger) {
    let errMsg = `Gemini Web returned HTTP ${status}`;
    
    if (status === 401 || status === 403) {
      errMsg = "Gemini Web auth failed — cookies may be expired. Please re-login to gemini.google.com and refresh cookies.";
    } else if (status === 429) {
      errMsg = "Gemini Web rate limited";
    } else if (status === 418) {
      errMsg = "Gemini Web temporary error — retrying may help";
    }

    logger?.warn?.("GEMINI-WEB", errMsg);
    return this.errorResponse(errMsg, status);
  }

  // ============ Full execute override ============

  async execute({ model, body, stream, credentials, signal, log }) {
    const messages = body?.messages;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return this.errorResponse("Missing or empty messages array", 400);
    }

    try {
      const payload = this.buildWebPayload(model, messages, stream, credentials);
      const headers = this.buildWebHeaders(credentials);
      const url = this.buildUrl(model, stream, 0, credentials);

      log?.info?.("GEMINI-WEB", `Request to ${model}, endpoint=${url}`);

      // Build URL-encoded form body
      const formBody = new URLSearchParams();
      formBody.append("f.req", JSON.stringify([null, JSON.stringify(payload.innerArray)]));
      if (this.accessToken) {
        formBody.append("at", this.accessToken);
      }

      // Add query params
      const params = new URLSearchParams({
        hl: "en",
        _reqid: String(payload.reqid),
        rt: "c",
        bl: this.buildLabel || "",
        "f.sid": this.sessionId || "",
      });

      const response = await fetch(`${url}?${params.toString()}`, {
        method: "POST",
        headers,
        body: formBody.toString(),
        signal,
      });

      if (!response.ok) {
        return this.handleWebError(response, response.status, log);
      }

      if (!response.body) {
        return this.errorResponse("Empty response body", 502);
      }

      const cid = `chatcmpl-gemini-web-${crypto.randomUUID().slice(0, 12)}`;
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
      log?.error?.("GEMINI-WEB", `Error: ${err.message || String(err)}`);
      return this.errorResponse(`gemini-web failed: ${err.message || String(err)}`, 502);
    }
  }
}

export default GeminiWebExecutor;
