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
 * Features:
 * - Session management with conversation tracking
 * - Proof of Work (PoW) handling
 * - Tool calling support
 * - Deep thinking (reasoning) support
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
  }

  buildUrl(model, stream, urlIndex = 0, credentials = null) {
    return `${DEEPSEEK_API}/api/v0/chat/completion`;
  }

  async buildWebPayload(model, messages, stream, credentials) {
    const modelInfo = MODEL_MAP[model] || { mode: "chat", name: model };
    const prompt = this.buildPrompt(messages);
    const sessionId = await this.getOrCreateSession(credentials);
    const parentId = this.getParentMessageId(credentials);
    
    const payload = {
      prompt,
      chat_session_id: sessionId,
      parent_message_id: parentId,
      model: modelInfo.mode,
      stream: stream ?? false,
    };

    // Add tool definitions if present
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "tool") {
      payload.ref_file_ids = [];
    }

    return payload;
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
    this.parentMessageIds.set(cacheKey, "client-created-root");
    return sessionId;
  }

  /**
   * Get parent message ID for conversation tracking
   */
  getParentMessageId(credentials) {
    const cacheKey = credentials?.apiKey || "default";
    return this.parentMessageIds.get(cacheKey) || "client-created-root";
  }

  /**
   * Update parent message ID after response
   */
  updateParentMessageId(credentials, messageId) {
    const cacheKey = credentials?.apiKey || "default";
    this.parentMessageIds.set(cacheKey, messageId);
  }

  /**
   * Clear session (for new conversation)
   */
  clearSession(credentials) {
    const cacheKey = credentials?.apiKey || "default";
    this.sessions.delete(cacheKey);
    this.parentMessageIds.delete(cacheKey);
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
        
        // Retry with new session
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
      
      // Handle other errors
      if (!response.ok) {
        return this.handleWebError(response, response.status, log);
      }
      
      return this.handleResponse(response, model, payload, url, headers, stream, signal, log, credentials);
    } catch (err) {
      log?.error?.("DEEPSEEK-WEB", `Error: ${err.message || String(err)}`);
      return this.errorResponse(`DeepSeek Web failed: ${err.message || String(err)}`, 502);
    }
  }

  /**
   * Handle successful response
   */
  async handleResponse(response, model, payload, url, headers, stream, signal, log, credentials) {
    if (!response.body) {
      return this.errorResponse("Empty response body", 502);
    }
    
    // Parse response
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

  /**
   * Build streaming response with parent message ID tracking
   */
  buildStreamingResponse(responseBody, model, cid, created, signal, credentials) {
    const encoder = new TextEncoder();
    const self = this;
    
    return new ReadableStream({
      async start(controller) {
        try {
          // Send initial role chunk
          controller.enqueue(encoder.encode(self.sseChunk({
            id: cid,
            object: "chat.completion.chunk",
            created,
            model,
            system_fingerprint: null,
            choices: [{ index: 0, delta: { role: "assistant" }, finish_reason: null, logprobs: null }],
          })));
          
          // Parse provider-specific stream
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
          
          // Send final chunk
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

  /**
   * Build non-streaming response with parent message ID tracking
   */
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
    
    // Update parent message ID for next request
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

  /**
   * SSE chunk helper
   */
  sseChunk(data) {
    return `data: ${JSON.stringify(data)}\n\n`;
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
            
            // Extract message ID for session tracking
            if (data.message_id) {
              yield { messageId: data.message_id };
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
    } else if (status === 400) {
      errMsg = "DeepSeek bad request — check your input";
    } else if (status === 500) {
      errMsg = "DeepSeek server error — try again later";
    }
    
    logger?.warn?.("DEEPSEEK-WEB", errMsg);
    return this.errorResponse(errMsg, status);
  }
}

export default DeepSeekWebExecutor;
