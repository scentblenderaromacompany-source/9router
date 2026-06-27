import crypto from "crypto";
import { WebUIExecutor } from "./webui-base.js";
import { PROVIDERS } from "../config/providers.js";
import { createToolCallState, processStreamContent, flushToolCallBuffer, createBaseChunk } from "../utils/toolCalling/streamToolHandler.js";
import { parseToolCallsFromText } from "../utils/toolCalling/toolParser.js";
import { getDeepSeekHash } from "../lib/deepseek/challenge.js";

const DEEPSEEK_API = "https://chat.deepseek.com";

const FAKE_HEADERS = {
  Accept: "*/*",
  "Accept-Encoding": "gzip, deflate, br, zstd",
  "Accept-Language": "en-US,en;q=0.9",
  "Content-Type": "application/json",
  Origin: DEEPSEEK_API,
  Referer: `${DEEPSEEK_API}/`,
  "Sec-Ch-Ua": '"Not/A)Brand";v="99", "Chromium";v="120"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"macOS"',
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "X-App-Version": "2.0.0",
  "X-Client-Locale": "en_US",
  "X-Client-Platform": "web",
  "X-Client-Timezone-Offset": "0",
  "X-Client-Version": "2.0.0",
};

const MODEL_MAP = {
  // V4 Flash models (model_type: "default")
  "deepseek-v4-flash": { modelType: "default", name: "DeepSeek V4 Flash" },
  "deepseek-v4-flash-reasoner": { modelType: "default", name: "DeepSeek V4 Flash Reasoning" },
  "deepseek-v4-flash-search": { modelType: "default", name: "DeepSeek V4 Flash Search" },
  "deepseek-v4-flash-reasoner-search": { modelType: "default", name: "DeepSeek V4 Flash Reasoning+Search" },

  // V4 Pro models (model_type: "expert")
  "deepseek-v4-pro": { modelType: "expert", name: "DeepSeek V4 Pro" },
  "deepseek-v4-pro-reasoner": { modelType: "expert", name: "DeepSeek V4 Pro Reasoning" },
  "deepseek-v4-pro-search": { modelType: "expert", name: "DeepSeek V4 Pro Search" },
  "deepseek-v4-pro-reasoner-search": { modelType: "expert", name: "DeepSeek V4 Pro Reasoning+Search" },

  // Legacy V3.2 models (still supported by web UI)
  "deepseek-chat": { modelType: "default", name: "DeepSeek V3.2 Chat" },
  "deepseek-reasoner": { modelType: "default", name: "DeepSeek V3.2 Reasoner" },
};

function generateRandomString(length, charset = "alphanumeric") {
  const sets = {
    numeric: "0123456789",
    alphabetic: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    alphanumeric: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    hex: "0123456789abcdef",
  };
  const chars = sets[charset] || sets.alphanumeric;
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateCookie() {
  const timestamp = Date.now();
  return `intercom-HWWAFSESTIME=${timestamp}; HWWAFSESID=${generateRandomString(18, "hex")}; Hm_lvt_${uuid()}=${Math.floor(timestamp / 1000)},${Math.floor(timestamp / 1000)},${Math.floor(timestamp / 1000)}; Hm_lpvt_${uuid()}=${Math.floor(timestamp / 1000)}; _frid=${uuid()}; _fr_ssid=${uuid()}; _fr_pvid=${uuid()}`;
}

/**
 * DeepSeek Web Executor - Direct web API integration
 *
 * Uses USER_TOKEN from browser local storage for authentication.
 * Implements token exchange, PoW challenge solving, and DeepSeek-specific
 * prompt format with <｜User｜>/<｜Assistant｜> markers.
 *
 * Get token from: F12 → Application → Local Storage → chat.deepseek.com → USER_TOKEN
 */
export class DeepSeekWebExecutor extends WebUIExecutor {
  constructor() {
    super("deepseek-web", PROVIDERS["deepseek-web"] || {
      baseUrl: DEEPSEEK_API,
      format: "openai",
    });
    this.sessions = new Map();
    this.parentMessageIds = new Map();
    this.tokenCache = new Map();
    this.sessionCache = new Map();
  }

  // ============ Token Exchange ============

  async acquireToken(userToken) {
    if (!userToken) {
      throw new Error("DeepSeek USER_TOKEN not configured");
    }

    const cached = this.tokenCache.get(userToken);
    if (cached && cached.expiresAt > Math.floor(Date.now() / 1000)) {
      return cached.accessToken;
    }

    const headers = {
      ...FAKE_HEADERS,
      Authorization: `Bearer ${userToken}`,
    };
    delete headers["Content-Type"];

    const response = await fetch(`${DEEPSEEK_API}/api/v0/users/current`, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(15000),
    });

    const data = await response.json();

    // API returns HTTP 200 with error code in body
    if (data.code === 40003 || data.code === 401 || data.code === 403) {
      throw new Error("DeepSeek token invalid or expired — update your USER_TOKEN");
    }

    if (data.code !== 0 && data.code !== undefined) {
      throw new Error(`Failed to acquire DeepSeek token: ${data.msg || "unknown error"}`);
    }

    const bizData = data?.data?.biz_data || data?.biz_data;
    if (!bizData?.token) {
      const errorMsg = data?.msg || data?.data?.biz_msg || "No token in response";
      throw new Error(`Failed to acquire DeepSeek token: ${errorMsg}`);
    }

    const accessToken = bizData.token;
    this.tokenCache.set(userToken, {
      accessToken,
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
    });

    return accessToken;
  }

  // ============ PoW Challenge ============

  async getChallenge(accessToken, targetPath) {
    const headers = {
      ...FAKE_HEADERS,
      Authorization: `Bearer ${accessToken}`,
    };

    const response = await fetch(`${DEEPSEEK_API}/api/v0/chat/create_pow_challenge`, {
      method: "POST",
      headers,
      body: JSON.stringify({ target_path: targetPath }),
      signal: AbortSignal.timeout(15000),
    });

    const data = await response.json();
    const bizData = data?.data?.biz_data || data?.biz_data;
    if (!bizData?.challenge) {
      throw new Error(`Failed to get PoW challenge: ${data?.msg || data?.data?.biz_msg || "no challenge data"}`);
    }

    return bizData.challenge;
  }

  async calculateChallengeAnswer(challenge) {
    const { algorithm, challenge: challengeStr, salt, difficulty, expire_at, signature } = challenge;

    if (algorithm !== "DeepSeekHashV1") {
      throw new Error(`Unsupported PoW algorithm: ${algorithm}`);
    }

    const deepSeekHash = await getDeepSeekHash();
    const answer = deepSeekHash.calculateHash(algorithm, challengeStr, salt, difficulty, expire_at);

    if (answer === undefined) {
      throw new Error("PoW challenge calculation failed");
    }

    return Buffer.from(JSON.stringify({
      algorithm,
      challenge: challengeStr,
      salt,
      answer,
      signature,
      target_path: "/api/v0/chat/completion",
    })).toString("base64");
  }

  async getPowHeader(accessToken) {
    try {
      const challenge = await this.getChallenge(accessToken, "/api/v0/chat/completion");
      const answer = await this.calculateChallengeAnswer(challenge);
      return answer;
    } catch (err) {
      console.error("[DeepSeek] PoW failed:", err.message);
      return null;
    }
  }

  // ============ URL Builders ============

  buildUrl(model, stream, urlIndex = 0, credentials = null) {
    return `${DEEPSEEK_API}/api/v0/chat/completion`;
  }

  // ============ Header Builders ============

  buildWebHeaders(credentials, accessToken) {
    const headers = { ...FAKE_HEADERS };

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    } else if (credentials?.apiKey) {
      headers["Authorization"] = `Bearer ${credentials.apiKey}`;
    }

    return headers;
  }

  // ============ Prompt Format ============

  buildPrompt(messages) {
    const processedMessages = [];
    for (const msg of messages) {
      let role = msg.role || "user";
      let text = "";

      if (typeof msg.content === "string") {
        text = msg.content;
      } else if (Array.isArray(msg.content)) {
        text = msg.content
          .filter((c) => c.type === "text")
          .map((c) => c.text || "")
          .join("\n");
      }

      if (!text.trim()) continue;
      processedMessages.push({ role, text });
    }

    if (processedMessages.length === 0) return "";

    // Merge consecutive same-role messages
    const merged = [];
    let current = { ...processedMessages[0] };
    for (let i = 1; i < processedMessages.length; i++) {
      const msg = processedMessages[i];
      if (msg.role === current.role) {
        current.text += `\n\n${msg.text}`;
      } else {
        merged.push(current);
        current = { ...msg };
      }
    }
    merged.push(current);

    // Format with DeepSeek markers
    return merged
      .map((block, index) => {
        if (block.role === "assistant") {
          return `<｜Assistant｜>${block.text}<｜end of sentence｜>`;
        }
        if (block.role === "user" || block.role === "system") {
          return index > 0 ? `<｜User｜>${block.text}` : block.text;
        }
        if (block.role === "tool") {
          return `<｜User｜>${block.text}`;
        }
        return block.text;
      })
      .join("")
      .replace(/!\[.+\]\(.+\)/g, "");
  }

  // ============ Payload Builder ============

  async buildWebPayload(model, messages, stream, credentials) {
    const modelInfo = MODEL_MAP[model] || { modelType: "default", name: model };
    const prompt = this.buildPrompt(messages);
    const sessionId = await this.getOrCreateSession(credentials);
    const parentId = this.getParentMessageId(credentials);

    // Determine search/thinking from model name
    const modelLower = model.toLowerCase();
    const searchEnabled = modelLower.includes("search");
    const thinkingEnabled = modelLower.includes("reasoner") || modelLower.includes("think");

    return {
      chat_session_id: sessionId,
      parent_message_id: null,
      prompt,
      model_type: modelInfo.modelType,
      ref_file_ids: [],
      search_enabled: searchEnabled,
      thinking_enabled: thinkingEnabled,
      preempt: false,
    };
  }

  // ============ Session Management ============

  async getOrCreateSession(credentials) {
    const cacheKey = credentials?.apiKey || "default";
    const cached = this.sessionCache.get(cacheKey);
    if (cached && Date.now() - cached.createdAt < 300000) {
      return cached.sessionId;
    }

    const accessToken = await this.acquireToken(credentials.apiKey);
    const headers = {
      ...FAKE_HEADERS,
      Authorization: `Bearer ${accessToken}`,
      Cookie: generateCookie(),
    };

    const response = await fetch(`${DEEPSEEK_API}/api/v0/chat_session/create`, {
      method: "POST",
      headers,
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(15000),
    });

    const data = await response.json();

    // API returns HTTP 200 with error code in body
    if (data.code !== 0 && data.code !== undefined) {
      throw new Error(`Failed to create DeepSeek session: ${data.msg || "unknown error"}`);
    }

    const bizData = data?.data?.biz_data || data?.biz_data;
    const sessionId = bizData?.chat_session?.id;
    if (!sessionId) {
      throw new Error(`Failed to create DeepSeek session: ${data?.msg || data?.data?.biz_msg || "no session id"}`);
    }

    this.sessionCache.set(cacheKey, { sessionId, createdAt: Date.now() });
    return sessionId;
  }

  async deleteSession(credentials, sessionId) {
    const accessToken = await this.acquireToken(credentials.apiKey);
    const headers = {
      ...FAKE_HEADERS,
      Authorization: `Bearer ${accessToken}`,
    };

    const response = await fetch(`${DEEPSEEK_API}/api/v0/chat_session/delete`, {
      method: "POST",
      headers,
      body: JSON.stringify({ chat_session_id: sessionId }),
      signal: AbortSignal.timeout(15000),
    });

    if (response.ok) {
      const cacheKey = credentials?.apiKey || "default";
      this.sessionCache.delete(cacheKey);
    }
    return response.ok;
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
    this.sessionCache.delete(cacheKey);
    this.parentMessageIds.delete(cacheKey);
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
        "DeepSeek Web requires a USER_TOKEN. Get it from: F12 → Application → Local Storage → chat.deepseek.com → USER_TOKEN",
        401
      );
    }

    try {
      // Token exchange first
      const accessToken = await this.acquireToken(credentials.apiKey);

      // Build payload
      const payload = await this.buildWebPayload(model, messages, stream, credentials);

      // Build headers with access token
      const headers = this.buildWebHeaders(credentials, accessToken);

      // Add PoW header
      const powAnswer = await this.getPowHeader(accessToken);
      if (powAnswer) {
        headers["X-Ds-Pow-Response"] = powAnswer;
      }

      // Add session-specific headers
      const sessionId = payload.chat_session_id;
      headers["Referer"] = `${DEEPSEEK_API}/a/chat/s/${sessionId}`;
      headers["Cookie"] = generateCookie();

      // Build URL
      const url = this.buildUrl(model, stream, 0, credentials);

      log?.info?.("DEEPSEEK-WEB", `Request to ${model}, session=${sessionId}, model_type=${payload.model_type}`);

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
        const retryHeaders = this.buildWebHeaders(credentials, accessToken);
        const retryPow = await this.getPowHeader(accessToken);
        if (retryPow) retryHeaders["X-Ds-Pow-Response"] = retryPow;
        retryHeaders["Referer"] = `${DEEPSEEK_API}/a/chat/s/${newPayload.chat_session_id}`;
        retryHeaders["Cookie"] = generateCookie();

        const retryResponse = await fetch(url, {
          method: "POST",
          headers: retryHeaders,
          body: JSON.stringify(newPayload),
          signal,
        });

        if (!retryResponse.ok) {
          return this.handleWebError(retryResponse, retryResponse.status, log);
        }

        return this.handleResponse(retryResponse, model, newPayload, url, retryHeaders, stream, signal, log, credentials);
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
    const useToolParser = this._pendingTools?.length > 0;
    const toolState = useToolParser ? createToolCallState() : null;
    const baseChunk = useToolParser ? createBaseChunk(cid, model, created) : null;
    const modelType = useToolParser ? this._getProviderModelType() : "default";

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
          for (const line of eventBlock.split("\n")) {
            if (line.startsWith("data: ")) {
              eventData = line.slice(6);
            }
          }

          if (!eventData || eventData === "[DONE]") continue;

          try {
            const data = JSON.parse(eventData);

            // Status updates (check before content to avoid yielding "FINISHED" as text)
            if (data.p === "response/status" && data.v === "FINISHED") {
              yield { done: true };
              return;
            }

            // DeepSeek choices format (OpenAI-compatible)
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
                // Extract content from fragments
                const fragments = data.v.response.fragments || [];
                for (const frag of fragments) {
                  if (frag.content) yield { delta: frag.content };
                }
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

            // Search results - extract citations
            if (data.p === "response/search_results" && data.v?.results) {
              const citations = data.v.results
                .map((r, i) => `[${i + 1}] ${r.title || ""} ${r.url || ""}`.trim())
                .filter(Boolean);
              if (citations.length > 0) {
                yield { delta: "\n\n" + citations.join("\n") };
              }
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

  parseToolCalls(content, tools = []) {
    return parseToolCallsFromText(content, this._getProviderModelType());
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
    } else if (status === 503) {
      errMsg = "DeepSeek service unavailable — try again later";
    }

    logger?.warn?.("DEEPSEEK-WEB", errMsg);
    return this.errorResponse(errMsg, status);
  }
}

export default DeepSeekWebExecutor;
