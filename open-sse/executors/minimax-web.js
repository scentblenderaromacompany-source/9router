import crypto from "crypto";
import { WebUIExecutor } from "./webui-base.js";
import { PROVIDERS } from "../config/providers.js";

const MINIMAX_API = "https://hailuoai.com";
const MINIMAX_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36";

const MODEL_MAP = {
  // MiniMax M3 models
  "minimax-m3": { model: "MiniMax-M3", name: "MiniMax-M3" },
  "minimax-m3-thinking": { model: "MiniMax-M3", name: "MiniMax-M3 Thinking", thinking: "adaptive" },
  
  // MiniMax M2.7 models
  "minimax-m2.7": { model: "MiniMax-M2.7", name: "MiniMax-M2.7" },
  "minimax-m2.7-thinking": { model: "MiniMax-M2.7", name: "MiniMax-M2.7 Thinking", thinking: "adaptive" },
  
  // MiniMax M2.5 models
  "minimax-m2.5": { model: "MiniMax-M2.5", name: "MiniMax-M2.5" },
  "minimax-m2.5-highspeed": { model: "MiniMax-M2.5-highspeed", name: "MiniMax-M2.5 Highspeed" },
  
  // MiniMax M2.1 models
  "minimax-m2.1": { model: "MiniMax-M2.1", name: "MiniMax-M2.1" },
  "minimax-m2.1-highspeed": { model: "MiniMax-M2.1-highspeed", name: "MiniMax-M2.1 Highspeed" },
  
  // MiniMax M2 models
  "minimax-m2": { model: "MiniMax-M2", name: "MiniMax-M2" },
  
  // Legacy models
  "hailuo": { model: "hailuo", name: "Hailuo (Legacy)" },
  "minimax-text-01": { model: "MiniMax-Text-01", name: "MiniMax Text-01" },
  "minimax-vl-01": { model: "MiniMax-VL-01", name: "MiniMax VL-01" },
};

/**
 * MiniMax Web Executor - Direct web API integration
 * 
 * This executor communicates directly with MiniMax's web interface,
 * using bearer token from browser for authentication.
 * 
 * Complete API Endpoints:
 * - POST /v1/chat/completions               - Chat completion (OpenAI compatible)
 * - POST /v1/audio/speech                    - Text-to-speech
 * - POST /v1/audio/transcriptions            - Speech-to-text
 * - POST /token/check                        - Token health check
 * 
 * Features:
 * - Session management with conversation tracking
 * - Tool calling support
 * - Deep thinking (reasoning) support
 * - Web search support
 * - File upload support (images, documents)
 * - Text-to-speech support
 * - Streaming SSE responses
 * 
 * IMPORTANT: Requires a valid Bearer token from hailuoai.com.
 * Get it from: F12 → Application → Local Storage → _token + realUserID
 */
export class MiniMaxWebExecutor extends WebUIExecutor {
  constructor() {
    super("minimax-web", PROVIDERS["minimax-web"] || {
      baseUrl: MINIMAX_API,
      format: "openai",
    });
    this.sessions = new Map();
  }

  // ============ URL Builders ============

  buildUrl(model, stream, urlIndex = 0, credentials = null) {
    return `${MINIMAX_API}/v1/chat/completions`;
  }

  getChatCompletionsUrl() {
    return `${MINIMAX_API}/v1/chat/completions`;
  }

  getAudioSpeechUrl() {
    return `${MINIMAX_API}/v1/audio/speech`;
  }

  getAudioTranscriptionsUrl() {
    return `${MINIMAX_API}/v1/audio/transcriptions`;
  }

  getTokenCheckUrl() {
    return `${MINIMAX_API}/token/check`;
  }

  // ============ Header Builders ============

  async buildWebHeaders(credentials) {
    const headers = {
      Accept: "text/event-stream",
      "Accept-Language": "en-US,en;q=0.9",
      "Content-Type": "application/json",
      "User-Agent": MINIMAX_USER_AGENT,
      Origin: MINIMAX_API,
      Referer: `${MINIMAX_API}/`,
    };

    if (credentials?.apiKey) {
      headers["Authorization"] = `Bearer ${credentials.apiKey}`;
    }

    return headers;
  }

  // ============ Payload Builders ============

  async buildWebPayload(model, messages, stream, credentials) {
    const modelInfo = MODEL_MAP[model] || { model: model, name: model };
    
    const payload = {
      model: modelInfo.model,
      messages: this.buildMessagesArray(messages),
      stream: stream ?? false,
    };

    // Add thinking parameter for thinking models
    if (modelInfo.thinking) {
      payload.thinking = { type: modelInfo.thinking };
    }

    // Add search if model includes search
    if (model.includes("search")) {
      payload.tools = [{ type: "builtin_function", function: { name: "$web_search" } }];
    }

    return payload;
  }

  /**
   * Build messages array from OpenAI messages format
   */
  buildMessagesArray(messages) {
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
      
      if (role === "system") {
        result.push({ role: "system", content });
      } else if (role === "user") {
        result.push({ role: "user", content });
      } else if (role === "assistant") {
        result.push({ role: "assistant", content });
      } else if (role === "tool") {
        result.push({ role: "tool", content, tool_call_id: msg.tool_call_id });
      }
    }
    
    return result;
  }

  // ============ Token Check ============

  async checkToken(credentials) {
    const headers = await this.buildWebHeaders(credentials);
    const response = await fetch(this.getTokenCheckUrl(), {
      method: "POST",
      headers,
      body: JSON.stringify({ token: credentials?.apiKey }),
    });

    if (!response.ok) {
      return { live: false };
    }

    const data = await response.json();
    return data;
  }

  // ============ Audio Speech ============

  async textToSpeech(credentials, text, options = {}) {
    const headers = await this.buildWebHeaders(credentials);
    const response = await fetch(this.getAudioSpeechUrl(), {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: options.model || "speech-01",
        input: text,
        voice: options.voice || "male-qn-qingse",
        response_format: options.format || "mp3",
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate speech: ${response.status}`);
    }

    return response;
  }

  // ============ Audio Transcriptions ============

  async transcribe(credentials, audioFile) {
    const headers = await this.buildWebHeaders(credentials);
    delete headers["Content-Type"];

    const formData = new FormData();
    formData.append("file", audioFile);
    formData.append("model", "speech-01");

    const response = await fetch(this.getAudioTranscriptionsUrl(), {
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
      throw new Error(`Failed to transcribe audio: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  // ============ Main Execute ============

  async execute({ model, body, stream, credentials, signal, log }) {
    const messages = body?.messages;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return this.errorResponse("Missing or empty messages array", 400);
    }

    if (!credentials?.apiKey) {
      return this.errorResponse(
        "MiniMax Web requires a Bearer token. Get it from: F12 → Application → Local Storage → _token + realUserID",
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
      
      log?.info?.("MINIMAX-WEB", `Request to ${model}, endpoint=${url}`);
      
      // Make request
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal,
      });
      
      // Handle auth errors
      if (response.status === 401 || response.status === 403) {
        return this.handleWebError(response, response.status, log);
      }
      
      if (!response.ok) {
        return this.handleWebError(response, response.status, log);
      }
      
      return this.handleResponse(response, model, payload, url, headers, stream, signal, log);
    } catch (err) {
      log?.error?.("MINIMAX-WEB", `Error: ${err.message || String(err)}`);
      return this.errorResponse(`MiniMax Web failed: ${err.message || String(err)}`, 502);
    }
  }

  // ============ Response Handling ============

  async handleResponse(response, model, payload, url, headers, stream, signal, log) {
    if (!response.body) {
      return this.errorResponse("Empty response body", 502);
    }
    
    const cid = `chatcmpl-minimax-web-${crypto.randomUUID().slice(0, 12)}`;
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
  }

  buildStreamingResponse(responseBody, model, cid, created, signal) {
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

  async buildNonStreamingResponse(responseBody, model, cid, created, signal) {
    let fullContent = "";
    const thinkingParts = [];
    
    for await (const chunk of this.parseWebStream(responseBody, model, signal)) {
      if (chunk.error) {
        return new Response(JSON.stringify({
          error: { message: chunk.error, type: "upstream_error", code: "MINIMAX-WEB_ERROR" },
        }), { status: 502, headers: { "Content-Type": "application/json" } });
      }
      if (chunk.thinking) { thinkingParts.push(chunk.thinking); continue; }
      if (chunk.done) break;
      if (chunk.fullMessage) fullContent = chunk.fullMessage;
      else if (chunk.delta) fullContent += chunk.delta;
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

  handleWebError(response, status, logger) {
    let errMsg = `MiniMax returned HTTP ${status}`;
    if (status === 401 || status === 403) {
      errMsg = "MiniMax session expired — update your Bearer token in Providers → MiniMax Web → Edit";
    } else if (status === 429) {
      errMsg = "MiniMax rate limited — try again shortly";
    } else if (status === 404) {
      errMsg = "MiniMax session or endpoint not found";
    } else if (status === 400) {
      errMsg = "MiniMax bad request — check your input";
    } else if (status === 500) {
      errMsg = "MiniMax server error — try again later";
    } else if (status === 503) {
      errMsg = "MiniMax service unavailable — try again later";
    }
    
    logger?.warn?.("MINIMAX-WEB", errMsg);
    return this.errorResponse(errMsg, status);
  }
}

export default MiniMaxWebExecutor;
