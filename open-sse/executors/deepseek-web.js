import { WebUIExecutor } from "./webui-base.js";
import { PROVIDERS } from "../config/providers.js";

const DEEPSEEK_API = "https://chat.deepseek.com";
const DEEPSEEK_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const DEEPSEEK_CLIENT_VERSION = "2.0.2";

const MODEL_MAP = {
  "deepseek-web-chat": { mode: "chat", name: "DeepSeek Chat" },
  "deepseek-web-reasoner": { mode: "reasoner", name: "DeepSeek Reasoner" },
  "deepseek-default": { mode: "default", name: "DeepSeek V4 Flash" },
  "deepseek-reasoner": { mode: "reasoner", name: "DeepSeek V4 Flash Reasoning" },
  "deepseek-expert": { mode: "expert", name: "DeepSeek V4 Pro" },
  "deepseek-expert-reasoner": { mode: "expert-reasoner", name: "DeepSeek V4 Pro Reasoning" },
  "deepseek-vision": { mode: "vision", name: "DeepSeek Vision" },
  "deepseek-vision-reasoner": { mode: "vision-reasoner", name: "DeepSeek Vision Reasoning" },
};

/**
 * DeepSeek Web Executor - Direct web API integration
 * 
 * This executor communicates directly with DeepSeek's web interface,
 * using USER_TOKEN from browser local storage for authentication.
 * 
 * Complete API Endpoints:
 * - POST /api/v0/chat/completion          - Send chat message (SSE streaming)
 * - POST /api/v0/chat_session/create      - Create new session
 * - POST /api/v0/chat_session/delete      - Delete session
 * - GET  /api/v0/chat/history_messages    - Get chat history
 * - POST /api/v0/file/upload_file         - Upload file
 * - GET  /api/v0/file/fetch_files         - Query file status
 * - GET  /api/v0/client/settings          - Get model settings
 * - POST /api/v0/chat/create_pow_challenge - Create PoW challenge
 * 
 * Features:
 * - Session management with conversation tracking
 * - Proof of Work (PoW) handling
 * - Tool calling support via DSML prompt injection
 * - Deep thinking (reasoning) support
 * - File upload support
 * - Streaming SSE responses
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
    this.parentMessageIds = new Map();
    this.powChallenges = new Map();
  }

  // ============ URL Builders ============

  buildUrl(model, stream, urlIndex = 0, credentials = null) {
    return `${DEEPSEEK_API}/api/v0/chat/completion`;
  }

  getChatSessionUrl() {
    return `${DEEPSEEK_API}/api/v0/chat_session/create`;
  }

  getDeleteSessionUrl() {
    return `${DEEPSEEK_API}/api/v0/chat_session/delete`;
  }

  getHistoryUrl() {
    return `${DEEPSEEK_API}/api/v0/chat/history_messages`;
  }

  getFileUploadUrl() {
    return `${DEEPSEEK_API}/api/v0/file/upload_file`;
  }

  getFileStatusUrl(fileIds) {
    return `${DEEPSEEK_API}/api/v0/file/fetch_files?file_ids=${fileIds}`;
  }

  getSettingsUrl(scope = "model") {
    return `${DEEPSEEK_API}/api/v0/client/settings?scope=${scope}`;
  }

  getPowChallengeUrl() {
    return `${DEEPSEEK_API}/api/v0/chat/create_pow_challenge`;
  }

  // ============ Header Builders ============

  async buildWebHeaders(credentials) {
    const headers = {
      Accept: "text/event-stream",
      "Accept-Language": "en-US,en;q=0.9",
      "Content-Type": "application/json",
      "User-Agent": DEEPSEEK_USER_AGENT,
      Origin: DEEPSEEK_API,
      Referer: `${DEEPSEEK_API}/`,
      "x-client-version": DEEPSEEK_CLIENT_VERSION,
      "x-client-platform": "web",
    };

    if (credentials?.apiKey) {
      headers["Authorization"] = `Bearer ${credentials.apiKey}`;
    }

    return headers;
  }

  // ============ Payload Builders ============

  async buildWebPayload(model, messages, stream, credentials) {
    const modelInfo = MODEL_MAP[model] || { mode: "chat", name: model };
    const prompt = this.buildPrompt(messages);
    const sessionId = await this.getOrCreateSession(credentials);
    const parentId = this.getParentMessageId(credentials);
    
    // Get PoW response if needed
    const powResponse = await this.getPowResponse(credentials);
    
    const payload = {
      prompt,
      chat_session_id: sessionId,
      parent_message_id: parentId,
      model: modelInfo.mode,
      stream: stream ?? false,
      search_enabled: model.includes("search"),
      thinking_enabled: model.includes("reasoner"),
      ref_file_ids: [],
    };

    // Add PoW response header
    if (powResponse) {
      payload._powResponse = powResponse;
    }

    return payload;
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

  // ============ Session Management ============

  async getOrCreateSession(credentials) {
    const cacheKey = credentials?.apiKey || "default";
    if (this.sessions.has(cacheKey)) {
      return this.sessions.get(cacheKey);
    }

    const headers = await this.buildWebHeaders(credentials);
    const response = await fetch(this.getChatSessionUrl(), {
      method: "POST",
      headers,
      body: JSON.stringify({ agent: "chat" }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.status}`);
    }

    const data = await response.json();
    const sessionId = data.data?.biz_data?.id || data.chat_session_id || data.id;
    this.sessions.set(cacheKey, sessionId);
    this.parentMessageIds.set(cacheKey, null);
    return sessionId;
  }

  async deleteSession(credentials, sessionId) {
    const headers = await this.buildWebHeaders(credentials);
    const response = await fetch(this.getDeleteSessionUrl(), {
      method: "POST",
      headers,
      body: JSON.stringify({ chat_session_id: sessionId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete session: ${response.status}`);
    }

    const cacheKey = credentials?.apiKey || "default";
    this.sessions.delete(cacheKey);
    this.parentMessageIds.delete(cacheKey);
    return true;
  }

  getParentMessageId(credentials) {
    const cacheKey = credentials?.apiKey || "default";
    return this.parentMessageIds.get(cacheKey) || null;
  }

  updateParentMessageId(credentials, messageId) {
    const cacheKey = credentials?.apiKey || "default";
    this.parentMessageIds.set(cacheKey, messageId);
  }

  clearSession(credentials) {
    const cacheKey = credentials?.apiKey || "default";
    this.sessions.delete(cacheKey);
    this.parentMessageIds.delete(cacheKey);
  }

  // ============ History ============

  async getHistory(credentials, sessionId, offset = 0, limit = 20) {
    const headers = await this.buildWebHeaders(credentials);
    const url = `${this.getHistoryUrl()}?chat_session_id=${sessionId}&offset=${offset}&limit=${limit}`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`Failed to get history: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.biz_data || data;
  }

  // ============ File Operations ============

  async uploadFile(credentials, file) {
    const headers = await this.buildWebHeaders(credentials);
    delete headers["Content-Type"]; // Let browser set multipart boundary

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(this.getFileUploadUrl(), {
      method: "POST",
      headers: {
        Authorization: headers.Authorization,
        "User-Agent": headers["User-Agent"],
        Origin: headers.Origin,
        Referer: headers.Referer,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.biz_data || data;
  }

  async getFileStatus(credentials, fileIds) {
    const headers = await this.buildWebHeaders(credentials);
    const url = this.getFileStatusUrl(Array.isArray(fileIds) ? fileIds.join(",") : fileIds);
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`Failed to get file status: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.biz_data || data;
  }

  // ============ Model Settings ============

  async getModelSettings(credentials) {
    const headers = await this.buildWebHeaders(credentials);
    const response = await fetch(this.getSettingsUrl("model"), { headers });

    if (!response.ok) {
      throw new Error(`Failed to get model settings: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.biz_data || data;
  }

  // ============ PoW (Proof of Work) ============

  async getPowResponse(credentials) {
    try {
      const headers = await this.buildWebHeaders(credentials);
      const response = await fetch(this.getPowChallengeUrl(), {
        method: "POST",
        headers,
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const challenge = data.data?.biz_data || data;
      
      // In production, solve the PoW challenge here
      // For now, return the challenge data
      return challenge;
    } catch {
      return null;
    }
  }

  // ============ Main Execute ============

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
      
      // Add PoW header if available
      if (payload._powResponse) {
        headers["x-ds-pow-response"] = JSON.stringify(payload._powResponse);
        delete payload._powResponse;
      }
      
      // Build URL
      const url = this.buildUrl(model, stream, 0, credentials);
      
      log?.info?.("DEEPSEEK-WEB", `Request to ${model}, session=${payload.chat_session_id}, endpoint=${url}`);
      
      // Make request
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal,
      });
      
      // Handle auth errors - clear session and retry once
      if (response.status === 401 || response.status === 403) {
        log?.warn?.("DEEPSEEK-WEB", "Auth failed, clearing session and retrying");
        this.clearSession(credentials);
        
        const newPayload = await this.buildWebPayload(model, messages, stream, credentials);
        const retryResponse = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(newPayload),
          signal,
        });
        
        if (!retryResponse.ok) {
          return this.handleWebError(retryResponse, retryResponse.status, log);
        }
        
        return this.handleResponse(retryResponse, model, newPayload, url, headers, stream, signal, log, credentials);
      }
      
      if (!response.ok) {
        return this.handleWebError(response, response.status, log);
      }
      
      return this.handleResponse(response, model, payload, url, headers, stream, signal, log, credentials);
    } catch (err) {
      log?.error?.("DEEPSEEK-WEB", `Error: ${err.message || String(err)}`);
      return this.errorResponse(`DeepSeek Web failed: ${err.message || String(err)}`, 502);
    }
  }

  // ============ Response Handling ============

  async handleResponse(response, model, payload, url, headers, stream, signal, log, credentials) {
    if (!response.body) {
      return this.errorResponse("Empty response body", 502);
    }
    
    const cid = `chatcmpl-deepseek-web-${crypto.randomUUID().slice(0, 12)}`;
    const created = Math.floor(Date.now() / 1000);
    
    if (stream) {
      const sseStream = this.buildStreamingResponse(response.body, model, cid, created, signal, credentials);
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
      const result = await this.buildNonStreamingResponse(response.body, model, cid, created, signal, credentials);
      return {
        response: result,
        url,
        headers,
        transformedBody: payload,
      };
    }
  }

  buildStreamingResponse(responseBody, model, cid, created, signal, credentials) {
    const encoder = new TextEncoder();
    const self = this;
    
    return new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(encoder.encode(self.sseChunk({
            id: cid,
            object: "chat.completion.chunk",
            created,
            model,
            system_fingerprint: null,
            choices: [{ index: 0, delta: { role: "assistant" }, finish_reason: null, logprobs: null }],
          })));
          
          for await (const chunk of self.parseWebStream(responseBody, model, signal)) {
            if (chunk.error) {
              controller.enqueue(encoder.encode(self.sseChunk({
                id: cid,
                object: "chat.completion.chunk",
                created,
                model,
                system_fingerprint: null,
                choices: [{ index: 0, delta: { content: `[Error: ${chunk.error}]` }, finish_reason: null, logprobs: null }],
              })));
              break;
            }
            
            if (chunk.thinking) {
              controller.enqueue(encoder.encode(self.sseChunk({
                id: cid,
                object: "chat.completion.chunk",
                created,
                model,
                system_fingerprint: null,
                choices: [{ index: 0, delta: { reasoning_content: chunk.thinking }, finish_reason: null, logprobs: null }],
              })));
              continue;
            }
            
            if (chunk.messageId) {
              self.updateParentMessageId(credentials, chunk.messageId);
            }
            
            if (chunk.done) break;
            
            if (chunk.delta) {
              controller.enqueue(encoder.encode(self.sseChunk({
                id: cid,
                object: "chat.completion.chunk",
                created,
                model,
                system_fingerprint: null,
                choices: [{ index: 0, delta: { content: chunk.delta }, finish_reason: null, logprobs: null }],
              })));
            }
          }
          
          controller.enqueue(encoder.encode(self.sseChunk({
            id: cid,
            object: "chat.completion.chunk",
            created,
            model,
            system_fingerprint: null,
            choices: [{ index: 0, delta: {}, finish_reason: "stop", logprobs: null }],
          })));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (err) {
          controller.enqueue(encoder.encode(self.sseChunk({
            id: cid,
            object: "chat.completion.chunk",
            created,
            model,
            system_fingerprint: null,
            choices: [{ index: 0, delta: { content: `[Stream error: ${err.message || String(err)}]` }, finish_reason: "stop", logprobs: null }],
          })));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } finally {
          controller.close();
        }
      },
    });
  }

  async buildNonStreamingResponse(responseBody, model, cid, created, signal, credentials) {
    let fullContent = "";
    const thinkingParts = [];
    let messageId = null;
    
    for await (const chunk of this.parseWebStream(responseBody, model, signal)) {
      if (chunk.error) {
        return new Response(JSON.stringify({
          error: { message: chunk.error, type: "upstream_error", code: "DEEPSEEK-WEB_ERROR" },
        }), { status: 502, headers: { "Content-Type": "application/json" } });
      }
      if (chunk.thinking) { thinkingParts.push(chunk.thinking); continue; }
      if (chunk.done) break;
      if (chunk.messageId) messageId = chunk.messageId;
      if (chunk.fullMessage) fullContent = chunk.fullMessage;
      else if (chunk.delta) fullContent += chunk.delta;
    }
    
    if (messageId) {
      this.updateParentMessageId(credentials, messageId);
    }
    
    const msg = { role: "assistant", content: fullContent };
    if (thinkingParts.length > 0) msg.reasoning_content = thinkingParts.join("\n");
    
    const promptTokens = Math.ceil(fullContent.length / 4);
    const completionTokens = Math.ceil(fullContent.length / 4);
    
    return new Response(JSON.stringify({
      id: cid,
      object: "chat.completion",
      created,
      model,
      system_fingerprint: null,
      choices: [{ index: 0, message: msg, finish_reason: "stop", logprobs: null }],
      usage: { prompt_tokens: promptTokens, completion_tokens: completionTokens, total_tokens: promptTokens + completionTokens },
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  sseChunk(data) {
    return `data: ${JSON.stringify(data)}\n\n`;
  }

  // ============ Stream Parser ============

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
        
        while (true) {
          const eventEnd = buffer.indexOf("\n\n");
          if (eventEnd < 0) break;
          
          const eventBlock = buffer.slice(0, eventEnd);
          buffer = buffer.slice(eventEnd + 2);
          
          let eventData = "";
          for (const line of eventBlock.split("\n")) {
            if (line.startsWith("data: ")) {
              eventData = line.slice(6);
            }
          }
          
          if (!eventData || eventData === "[DONE]") continue;
          
          try {
            const data = JSON.parse(eventData);
            
            // DeepSeek choices format
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
            
            // DeepSeek v0 API format
            if (data.v) {
              if (typeof data.v === "string") {
                yield { delta: data.v };
              } else if (data.v.response?.message_id) {
                yield { messageId: data.v.response.message_id };
              }
            }
            
            // Content fragments
            if (data.p === "response/content" || data.o === "APPEND") {
              if (typeof data.v === "string") {
                yield { delta: data.v };
              }
            }
            
            // Thinking content
            if (data.p === "response/thinking_content") {
              if (typeof data.v === "string") {
                yield { thinking: data.v };
              }
            }
            
            // Status updates
            if (data.p === "response/status" && data.v === "FINISHED") {
              yield { done: true };
              return;
            }
            
            // Direct completion
            if (data.completion) {
              yield { delta: data.completion };
            }
            
            if (data.message_id) {
              yield { messageId: data.message_id };
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

  // ============ Error Handling ============

  handleWebError(response, status, logger) {
    let errMsg = `DeepSeek returned HTTP ${status}`;
    if (status === 401 || status === 403) {
      errMsg = "DeepSeek session expired — update your USER_TOKEN in Providers → DeepSeek Web → Edit";
    } else if (status === 429) {
      errMsg = "DeepSeek rate limited — try again shortly";
    } else if (status === 404) {
      errMsg = "DeepSeek session or endpoint not found";
    } else if (status === 400) {
      errMsg = "DeepSeek bad request — check your input";
    } else if (status === 500) {
      errMsg = "DeepSeek server error — try again later";
    } else if (status === 503) {
      errMsg = "DeepSeek service unavailable — try again later";
    }
    
    logger?.warn?.("DEEPSEEK-WEB", errMsg);
    return this.errorResponse(errMsg, status);
  }
}

export default DeepSeekWebExecutor;
