import crypto from "crypto";
import { WebUIExecutor } from "./webui-base.js";
import { PROVIDERS } from "../config/providers.js";
import { createToolCallState, processStreamContent, flushToolCallBuffer, createBaseChunk } from "../utils/toolCalling/streamToolHandler.js";
import { parseToolCallsFromText } from "../utils/toolCalling/toolParser.js";

const KIMI_API = "https://kimi.com";
const KIMI_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36";

const MODEL_MAP = {
  // Kimi K2.7 models
  "kimi-k2.7": { model: "kimi-k2.7", name: "Kimi K2.7" },
  "kimi-k2.7-thinking": { model: "kimi-k2.7", name: "Kimi K2.7 Thinking", thinking: true },
  "kimi-k2.7-code": { model: "kimi-k2.7-code", name: "Kimi K2.7 Code", thinking: true },
  
  // Kimi K2.6 models
  "kimi-k2.6": { model: "kimi-k2.6", name: "Kimi K2.6" },
  "kimi-k2.6-thinking": { model: "kimi-k2.6", name: "Kimi K2.6 Thinking", thinking: true },
  
  // Kimi K2.5 models
  "kimi-k2.5": { model: "kimi-k2.5", name: "Kimi K2.5" },
  "kimi-k2.5-thinking": { model: "kimi-k2.5", name: "Kimi K2.5 Thinking", thinking: true },
  
  // Kimi K2 models
  "kimi-k2": { model: "kimi-k2", name: "Kimi K2" },
  "kimi-k2-thinking": { model: "kimi-k2", name: "Kimi K2 Thinking", thinking: true },
  
  // Kimi K1.5 models
  "kimi-k1.5": { model: "kimi-k1.5", name: "Kimi K1.5" },
  "kimi-k1.5-thinking": { model: "kimi-k1.5", name: "Kimi K1.5 Thinking", thinking: true },
  
  // Kimi legacy models
  "kimi": { model: "kimi", name: "Kimi Latest" },
  "kimi-vision": { model: "kimi", name: "Kimi Vision", vision: true },
  
  // OK Computer
  "ok-computer": { model: "ok-computer", name: "OK Computer" },
};

/**
 * Kimi Web Executor - Direct web API integration
 * 
 * This executor communicates directly with Kimi's web interface,
 * using bearer token from browser for authentication.
 * 
 * Complete API Endpoints:
 * - POST /api/chat                              - Create new chat session
 * - POST /api/chat/{chat_id}/completion/stream   - Send message (SSE streaming)
 * - POST /api/chat/{chat_id}/completion          - Send message (non-streaming)
 * - GET  /api/chat/{chat_id}                     - Get chat session info
 * - GET  /api/chat/{chat_id}/messages            - Get chat history
 * - DELETE /api/chat/{chat_id}                   - Delete chat session
 * - POST /api/chat/{chat_id}/title               - Generate chat title
 * - POST /api/chat/{chat_id}/share               - Share chat
 * - POST /api/files/upload                       - Upload file
 * - GET  /api/files                              - List files
 * - GET  /api/user/me                            - Get current user info
 * - GET  /api/models                             - List available models
 * - POST /api/search                             - Web search
 * - POST /api/chat/{chat_id}/memory              - Save memory
 * - GET  /api/chat/{chat_id}/memory              - Get memory
 * - POST /api/chat/{chat_id}/regenerate          - Regenerate last response
 * - POST /api/chat/{chat_id}/stop                 - Stop generation
 * - GET  /api/subscription                       - Get subscription info
 * - GET  /api/usage                              - Get usage stats
 * 
 * Features:
 * - Session management with conversation tracking
 * - Tool calling support (web search, code runner, memory)
 * - Deep thinking (reasoning) support
 * - Web search support
 * - File upload support (images, documents)
 * - Memory persistence
 * - Streaming SSE responses
 * 
 * IMPORTANT: Requires a valid Bearer token from kimi.com.
 * Get it from: F12 → Network → any request → Authorization: Bearer token
 */
export class KimiWebExecutor extends WebUIExecutor {
  constructor() {
    super("kimi-web", PROVIDERS["kimi-web"] || {
      baseUrl: KIMI_API,
      format: "openai",
    });
    this.sessions = new Map();
    this.parentMessageIds = new Map();
  }

  // ============ URL Builders ============

  buildUrl(model, stream, urlIndex = 0, credentials = null) {
    const chatId = this.getSessionId(credentials);
    if (chatId && stream) {
      return `${KIMI_API}/api/chat/${chatId}/completion/stream`;
    }
    return `${KIMI_API}/api/chat`;
  }

  getChatSessionUrl() {
    return `${KIMI_API}/api/chat`;
  }

  getChatInfoUrl(chatId) {
    return `${KIMI_API}/api/chat/${chatId}`;
  }

  getChatHistoryUrl(chatId) {
    return `${KIMI_API}/api/chat/${chatId}/messages`;
  }

  getDeleteSessionUrl(chatId) {
    return `${KIMI_API}/api/chat/${chatId}`;
  }

  getFileUploadUrl() {
    return `${KIMI_API}/api/files/upload`;
  }

  getFilesUrl() {
    return `${KIMI_API}/api/files`;
  }

  getUserMeUrl() {
    return `${KIMI_API}/api/user/me`;
  }

  getModelsUrl() {
    return `${KIMI_API}/api/models`;
  }

  getChatTitleUrl(chatId) {
    return `${KIMI_API}/api/chat/${chatId}/title`;
  }

  getShareChatUrl(chatId) {
    return `${KIMI_API}/api/chat/${chatId}/share`;
  }

  getSearchUrl() {
    return `${KIMI_API}/api/search`;
  }

  getMemoryUrl(chatId) {
    return `${KIMI_API}/api/chat/${chatId}/memory`;
  }

  getRegenerateUrl(chatId) {
    return `${KIMI_API}/api/chat/${chatId}/regenerate`;
  }

  getStopUrl(chatId) {
    return `${KIMI_API}/api/chat/${chatId}/stop`;
  }

  getSubscriptionUrl() {
    return `${KIMI_API}/api/subscription`;
  }

  getUsageUrl() {
    return `${KIMI_API}/api/usage`;
  }

  // ============ Header Builders ============

  async buildWebHeaders(credentials) {
    const headers = {
      Accept: "text/event-stream",
      "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
      "Content-Type": "application/json",
      "User-Agent": KIMI_USER_AGENT,
      Origin: KIMI_API,
      Referer: `${KIMI_API}/`,
    };

    if (credentials?.apiKey) {
      headers["Authorization"] = `Bearer ${credentials.apiKey}`;
    }

    return headers;
  }

  // ============ Payload Builders ============

  async buildWebPayload(model, messages, stream, credentials) {
    const modelInfo = MODEL_MAP[model] || { model: model, name: model };
    const chatId = await this.getOrCreateSession(credentials);
    
    const payload = {
      model: modelInfo.model,
      messages: this.buildMessagesArray(messages, modelInfo),
      stream: stream ?? false,
    };

    // Add thinking parameter for thinking models
    if (modelInfo.thinking) {
      payload.thinking = { type: "enabled" };
    }

    // Preserve native builtin_function tools (e.g. $web_search) or client-provided tools
    if (this._pendingTools && this._pendingTools.length > 0) {
      payload.tools = this._pendingTools;
    } else if (model.includes("search")) {
      payload.tools = [{ type: "builtin_function", function: { name: "$web_search" } }];
    }

    return { payload, chatId };
  }

  /**
   * Build messages array from OpenAI messages format
   */
  buildMessagesArray(messages, modelInfo) {
    const result = [];
    
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
      
      // Kimi uses "system" role for system messages
      if (role === "system") {
        result.push({ role: "system", content });
      } else if (role === "user") {
        result.push({ role: "user", content });
      } else if (role === "assistant") {
        result.push({ role: "assistant", content });
      } else if (role === "tool") {
        // Kimi doesn't have a tool role, so we convert to user message
        result.push({ role: "user", content: `[Tool Result] ${content}` });
      }
    }
    
    return result;
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
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.status}`);
    }

    const data = await response.json();
    const chatId = data.data?.id || data.id;
    this.sessions.set(cacheKey, chatId);
    this.parentMessageIds.set(cacheKey, null);
    return chatId;
  }

  async deleteSession(credentials, chatId) {
    const headers = await this.buildWebHeaders(credentials);
    const response = await fetch(this.getDeleteSessionUrl(chatId), {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to delete session: ${response.status}`);
    }

    const cacheKey = credentials?.apiKey || "default";
    this.sessions.delete(cacheKey);
    this.parentMessageIds.delete(cacheKey);
    return true;
  }

  getSessionId(credentials) {
    const cacheKey = credentials?.apiKey || "default";
    return this.sessions.get(cacheKey) || null;
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

  async getHistory(credentials, chatId) {
    const headers = await this.buildWebHeaders(credentials);
    const response = await fetch(this.getChatHistoryUrl(chatId), { headers });

    if (!response.ok) {
      throw new Error(`Failed to get history: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  // ============ Chat Info ============

  async getChatInfo(credentials, chatId) {
    const headers = await this.buildWebHeaders(credentials);
    const response = await fetch(this.getChatInfoUrl(chatId), { headers });

    if (!response.ok) {
      throw new Error(`Failed to get chat info: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
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
    return data.data || data;
  }

  async listFiles(credentials) {
    const headers = await this.buildWebHeaders(credentials);
    const response = await fetch(this.getFilesUrl(), { headers });

    if (!response.ok) {
      throw new Error(`Failed to list files: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  // ============ User Info ============

  async getUserMe(credentials) {
    const headers = await this.buildWebHeaders(credentials);
    const response = await fetch(this.getUserMeUrl(), { headers });

    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  // ============ Models ============

  async getModels(credentials) {
    const headers = await this.buildWebHeaders(credentials);
    const response = await fetch(this.getModelsUrl(), { headers });

    if (!response.ok) {
      throw new Error(`Failed to get models: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  // ============ Chat Operations ============

  async generateTitle(credentials, chatId) {
    const headers = await this.buildWebHeaders(credentials);
    const response = await fetch(this.getChatTitleUrl(chatId), {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to generate title: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  async shareChat(credentials, chatId) {
    const headers = await this.buildWebHeaders(credentials);
    const response = await fetch(this.getShareChatUrl(chatId), {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to share chat: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  // ============ Search ============

  async search(credentials, query) {
    const headers = await this.buildWebHeaders(credentials);
    const response = await fetch(this.getSearchUrl(), {
      method: "POST",
      headers,
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Failed to search: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  // ============ Memory ============

  async saveMemory(credentials, chatId, memory) {
    const headers = await this.buildWebHeaders(credentials);
    const response = await fetch(this.getMemoryUrl(chatId), {
      method: "POST",
      headers,
      body: JSON.stringify({ memory }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save memory: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  async getMemory(credentials, chatId) {
    const headers = await this.buildWebHeaders(credentials);
    const response = await fetch(this.getMemoryUrl(chatId), { headers });

    if (!response.ok) {
      throw new Error(`Failed to get memory: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  // ============ Regenerate ============

  async regenerate(credentials, chatId) {
    const headers = await this.buildWebHeaders(credentials);
    const response = await fetch(this.getRegenerateUrl(chatId), {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to regenerate: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  // ============ Stop Generation ============

  async stopGeneration(credentials, chatId) {
    const headers = await this.buildWebHeaders(credentials);
    const response = await fetch(this.getStopUrl(chatId), {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to stop generation: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  // ============ Subscription ============

  async getSubscription(credentials) {
    const headers = await this.buildWebHeaders(credentials);
    const response = await fetch(this.getSubscriptionUrl(), { headers });

    if (!response.ok) {
      throw new Error(`Failed to get subscription: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  // ============ Usage ============

  async getUsage(credentials) {
    const headers = await this.buildWebHeaders(credentials);
    const response = await fetch(this.getUsageUrl(), { headers });

    if (!response.ok) {
      throw new Error(`Failed to get usage: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  // ============ Main Execute ============

  async execute({ model, body, stream, credentials, signal, log }) {
    this._pendingTools = body?.tools || [];
    const messages = body?.messages;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return this.errorResponse("Missing or empty messages array", 400);
    }

    if (!credentials?.apiKey) {
      return this.errorResponse(
        "Kimi Web requires a Bearer token. Get it from: F12 → Network → any request → Authorization: Bearer token",
        401
      );
    }

    try {
      // Build payload
      const { payload, chatId } = await this.buildWebPayload(model, messages, stream, credentials);
      
      // Build headers
      const headers = await this.buildWebHeaders(credentials);
      
      // Build URL
      const url = stream 
        ? `${KIMI_API}/api/chat/${chatId}/completion/stream`
        : `${KIMI_API}/api/chat/${chatId}/completion`;
      
      log?.info?.("KIMI-WEB", `Request to ${model}, chat=${chatId}, endpoint=${url}`);
      
      // Make request
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal,
      });
      
      // Handle auth errors - clear session and retry once
      if (response.status === 401 || response.status === 403) {
        log?.warn?.("KIMI-WEB", "Auth failed, clearing session and retrying");
        this.clearSession(credentials);
        
        const newChatId = await this.getOrCreateSession(credentials);
        const newUrl = stream 
          ? `${KIMI_API}/api/chat/${newChatId}/completion/stream`
          : `${KIMI_API}/api/chat/${newChatId}/completion`;
        
        const retryResponse = await fetch(newUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
          signal,
        });
        
        if (!retryResponse.ok) {
          return this.handleWebError(retryResponse, retryResponse.status, log);
        }
        
        return this.handleResponse(retryResponse, model, payload, newUrl, headers, stream, signal, log, credentials);
      }
      
      if (!response.ok) {
        return this.handleWebError(response, response.status, log);
      }
      
      return this.handleResponse(response, model, payload, url, headers, stream, signal, log, credentials);
    } catch (err) {
      log?.error?.("KIMI-WEB", `Error: ${err.message || String(err)}`);
      return this.errorResponse(`Kimi Web failed: ${err.message || String(err)}`, 502);
    }
  }

  // ============ Response Handling ============

  async handleResponse(response, model, payload, url, headers, stream, signal, log, credentials) {
    if (!response.body) {
      return this.errorResponse("Empty response body", 502);
    }
    
    const cid = `chatcmpl-kimi-web-${crypto.randomUUID().slice(0, 12)}`;
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
    const useToolParser = this._pendingTools?.length > 0;
    const toolState = useToolParser ? createToolCallState() : null;
    const baseChunk = useToolParser ? createBaseChunk(cid, model, created) : null;
    const modelType = useToolParser ? this._getProviderModelType() : 'default';
    
    return new ReadableStream({
      async start(controller) {
        let isFirstContentChunk = true;
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
              if (useToolParser) {
                const { chunks: toolChunks } = processStreamContent(chunk.delta, toolState, baseChunk, isFirstContentChunk, modelType);
                isFirstContentChunk = false;
                for (const tc of toolChunks) {
                  controller.enqueue(encoder.encode(self.sseChunk(tc)));
                }
              } else {
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
          }
          
          if (useToolParser) {
            const flushChunks = flushToolCallBuffer(toolState, baseChunk, modelType);
            for (const tc of flushChunks) {
              controller.enqueue(encoder.encode(self.sseChunk(tc)));
            }
          }
          
          const finishReason = useToolParser && toolState?.hasEmittedToolCall ? "tool_calls" : "stop";
          controller.enqueue(encoder.encode(self.sseChunk({
            id: cid,
            object: "chat.completion.chunk",
            created,
            model,
            system_fingerprint: null,
            choices: [{ index: 0, delta: {}, finish_reason: finishReason, logprobs: null }],
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
    const useToolParser = this._pendingTools?.length > 0;
    
    for await (const chunk of this.parseWebStream(responseBody, model, signal)) {
      if (chunk.error) {
        return new Response(JSON.stringify({
          error: { message: chunk.error, type: "upstream_error", code: "KIMI-WEB_ERROR" },
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
    
    if (useToolParser && fullContent) {
      const { content: cleanContent, toolCalls } = parseToolCallsFromText(fullContent, this._getProviderModelType());
      if (toolCalls.length > 0) {
        return new Response(JSON.stringify({
          id: cid, object: "chat.completion", created, model, system_fingerprint: null,
          choices: [{ index: 0, message: { role: "assistant", content: cleanContent || null, tool_calls: toolCalls }, finish_reason: "tool_calls", logprobs: null }],
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
    }
    
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
          let eventType = "";
          for (const line of eventBlock.split("\n")) {
            if (line.startsWith("data: ")) {
              eventData = line.slice(6);
            } else if (line.startsWith("event: ")) {
              eventType = line.slice(7);
            }
          }
          
          if (!eventData || eventData === "[DONE]") continue;
          
          try {
            const data = JSON.parse(eventData);
            
            // Kimi cmpl event format
            if (eventType === "cmpl" || data.text) {
              if (typeof data.text === "string") {
                yield { delta: data.text };
              }
              if (data.message_id) {
                yield { messageId: data.message_id };
              }
              continue;
            }
            
            // Kimi thinking format
            if (data.type === "thinking" || data.thinking) {
              const content = data.content || data.thinking;
              if (typeof content === "string") {
                yield { thinking: content };
              }
              continue;
            }
            
            // OpenAI choices format
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
            
            // Direct content
            if (data.content && typeof data.content === "string") {
              yield { delta: data.content };
            }
            
            // Message ID
            if (data.message_id) {
              yield { messageId: data.message_id };
            }
            
            // Done
            if (data.done || data.stop_reason) {
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

  /**
   * Parse tool calls from Kimi model output.
   * Kimi uses bracket protocol for managed tool calling.
   * @param {string} content - Model output text
   * @param {Array} [tools] - Available tools for validation
   * @returns {{content: string, toolCalls: Array}}
   */
  parseToolCalls(content, tools = []) {
    return parseToolCallsFromText(content, this._getProviderModelType());
  }

  _getProviderModelType() {
    return 'kimi';
  }

  handleWebError(response, status, logger) {
    let errMsg = `Kimi returned HTTP ${status}`;
    if (status === 401 || status === 403) {
      errMsg = "Kimi session expired — update your Bearer token in Providers → Kimi Web → Edit";
    } else if (status === 429) {
      errMsg = "Kimi rate limited — try again shortly";
    } else if (status === 404) {
      errMsg = "Kimi session or endpoint not found";
    } else if (status === 400) {
      errMsg = "Kimi bad request — check your input";
    } else if (status === 500) {
      errMsg = "Kimi server error — try again later";
    } else if (status === 503) {
      errMsg = "Kimi service unavailable — try again later";
    }
    
    logger?.warn?.("KIMI-WEB", errMsg);
    return this.errorResponse(errMsg, status);
  }
}

export default KimiWebExecutor;
