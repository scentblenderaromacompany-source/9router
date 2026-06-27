import crypto from "crypto";
import { BaseExecutor } from "./base.js";
import { SSE_DONE, SSE_HEADERS_NO_BUFFER } from "../utils/sseConstants.js";
import { sseChunk } from "../utils/sse.js";
import { ToolCallingEngine } from "../utils/toolCalling/index.js";
import { ContextManager } from "../utils/contextManager.js";
import { createSession, getSessionContext, updateSession } from "../utils/sessionManager.js";
import { createToolCallState, processStreamContent, flushToolCallBuffer, createBaseChunk } from "../utils/toolCalling/streamToolHandler.js";
import { parseToolCallsFromText } from "../utils/toolCalling/toolParser.js";
import { generateToolPrompt } from "../utils/toolCalling/promptGenerator.js";

/**
 * WebUIExecutor - Base class for web UI proxy executors
 * 
 * Provides common infrastructure for translating OpenAI-format requests
 * to web UI API formats and back.
 * 
 * Subclasses must implement:
 * - buildWebPayload(model, messages, stream, credentials) - Build web API payload
 * - buildWebHeaders(credentials) - Build web API headers
 * - parseWebStream(response, model, signal) - Parse web API SSE/NDJSON stream
 * - handleWebError(response, status) - Handle web API errors
 */
export class WebUIExecutor extends BaseExecutor {
  constructor(providerId, config) {
    super(providerId, config);
    this.providerId = providerId;
    this.toolEngine = new ToolCallingEngine();
    this.contextManager = new ContextManager(config?.contextManagement || {});
  }

  /**
   * Execute a web UI API request
   */
  async execute({ model, body, stream, credentials, signal, log }) {
    this._pendingTools = body?.tools || [];
    const messages = body?.messages;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return this.errorResponse("Missing or empty messages array", 400);
    }

    try {
      // Build web API payload
      const payload = this.buildWebPayload(model, messages, stream, credentials);
      
      // Build headers
      const headers = this.buildWebHeaders(credentials);
      
      // Get endpoint URL
      const url = this.buildUrl(model, stream, 0, credentials);
      
      log?.info?.(this.providerId.toUpperCase(), `Request to ${model}, endpoint=${url}`);
      
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
      const cid = `chatcmpl-${this.providerId}-${crypto.randomUUID().slice(0, 12)}`;
      const created = Math.floor(Date.now() / 1000);
      
      if (stream) {
        const sseStream = this.buildStreamingResponse(response.body, model, cid, created, signal);
        return {
          response: new Response(sseStream, {
            status: 200,
            headers: { ...SSE_HEADERS_NO_BUFFER },
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
      log?.error?.(this.providerId.toUpperCase(), `Error: ${err.message || String(err)}`);
      return this.errorResponse(`${this.providerId} failed: ${err.message || String(err)}`, 502);
    }
  }

  /**
   * Execute a request with tool calling support.
   * Handles tool normalization, context management, prompt injection, and tool call parsing.
   *
   * @param {string} model - Model ID
   * @param {Array} messages - OpenAI messages array
   * @param {Array} [tools] - OpenAI tools array
   * @param {string} [tool_choice] - Tool choice mode
   * @param {boolean} stream - Whether to stream
   * @param {object} credentials - User credentials
   * @param {AbortSignal} signal - Abort signal
   * @param {object} [log] - Logger
   * @returns {Promise<object>} Response with potential tool_calls
   */
  async executeWithTools(model, messages, tools, tool_choice, stream, credentials, signal, log) {
    const normalizedTools = (tools || []).filter(t => t && (t.function || t.type === "builtin_function"));

    if (normalizedTools.length === 0) {
      return this.execute({ model, body: { messages }, stream, credentials, signal, log });
    }

    const modelType = this._getProviderModelType();
    const toolPrompt = generateToolPrompt(normalizedTools, 'bracket');

    // Inject tool prompt into messages
    const preparedMessages = messages.map((msg, i) => {
      if (i === 0 && (msg.role === "system" || msg.role === "developer")) {
        return { ...msg, content: `${typeof msg.content === "string" ? msg.content : ""}\n\n${toolPrompt}` };
      }
      return msg;
    });
    if (!preparedMessages.length || (preparedMessages[0].role !== "system" && preparedMessages[0].role !== "developer")) {
      preparedMessages.unshift({ role: "system", content: toolPrompt });
    }

    log?.info?.(
      this.providerId.toUpperCase(),
      `Tool calling: managed mode, tools=${normalizedTools.length}`
    );

    this._pendingTools = normalizedTools;
    const result = await this.execute({
      model,
      body: { messages: preparedMessages, tool_choice },
      stream,
      credentials,
      signal,
      log,
    });

    if (!result?.response) {
      return result;
    }

    const contentType = result.response.headers?.get?.("content-type") || "";

    if (contentType.includes("application/json")) {
      try {
        const clone = result.response.clone();
        const respBody = await clone.json();
        const content = respBody?.choices?.[0]?.message?.content || "";
        if (content) {
          const { content: cleanContent, toolCalls } = parseToolCallsFromText(content, modelType);
          if (toolCalls.length > 0) {
            const cid = respBody.id || `chatcmpl-${this.providerId}-${crypto.randomUUID().slice(0, 12)}`;
            const created = respBody.created || Math.floor(Date.now() / 1000);
            const toolResponse = {
              id: cid,
              object: "chat.completion",
              created,
              model,
              system_fingerprint: null,
              choices: [{
                index: 0,
                message: { role: "assistant", content: cleanContent || null, tool_calls: toolCalls },
                finish_reason: "tool_calls",
                logprobs: null,
              }],
              usage: respBody.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
            };
            return { ...result, response: new Response(JSON.stringify(toolResponse), { status: 200, headers: { "Content-Type": "application/json" } }) };
          }
        }
      } catch {
        // Not JSON or parse error, return as-is
      }
    }

    return result;
  }

  /**
   * Build streaming response from web API stream
   * @param {ReadableStream} responseBody - Raw response body
   * @param {string} model - Model ID
   * @param {string} cid - Chat completion ID
   * @param {number} created - Created timestamp
   * @param {AbortSignal} signal - Abort signal
   * @param {object} [toolStreamParser] - Optional tool stream parser config {enabled, protocol, tools, toolEngine}
   */
  buildStreamingResponse(responseBody, model, cid, created, signal, toolStreamParser) {
    const encoder = new TextEncoder();
    const providerId = this.providerId;
    const useToolParser = this._pendingTools?.length > 0;
    const toolState = useToolParser ? createToolCallState() : null;
    const baseChunk = useToolParser ? createBaseChunk(cid, model, created) : null;
    const modelType = useToolParser ? this._getProviderModelType() : 'default';
    
    return new ReadableStream({
      async start(controller) {
        let accumulatedContent = "";
        let isFirstContentChunk = true;
        try {
          // Send initial role chunk
          controller.enqueue(encoder.encode(sseChunk({
            id: cid,
            object: "chat.completion.chunk",
            created,
            model,
            system_fingerprint: null,
            choices: [{ index: 0, delta: { role: "assistant" }, finish_reason: null, logprobs: null }],
          })));
          
          // Parse provider-specific stream
          for await (const chunk of this.parseWebStream(responseBody, model, signal)) {
            if (chunk.error) {
              controller.enqueue(encoder.encode(sseChunk({
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
              controller.enqueue(encoder.encode(sseChunk({
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
              if (useToolParser) {
                const { chunks: toolChunks } = processStreamContent(chunk.delta, toolState, baseChunk, isFirstContentChunk, modelType);
                isFirstContentChunk = false;
                for (const tc of toolChunks) {
                  controller.enqueue(encoder.encode(sseChunk(tc)));
                }
              } else {
                controller.enqueue(encoder.encode(sseChunk({
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
          
          // Flush remaining tool call buffer
          if (useToolParser) {
            const flushChunks = flushToolCallBuffer(toolState, baseChunk, modelType);
            for (const tc of flushChunks) {
              controller.enqueue(encoder.encode(sseChunk(tc)));
            }
          }
          
          // Send final chunk
          const finishReason = useToolParser && toolState?.hasEmittedToolCall ? "tool_calls" : "stop";
          controller.enqueue(encoder.encode(sseChunk({
            id: cid,
            object: "chat.completion.chunk",
            created,
            model,
            system_fingerprint: null,
            choices: [{ index: 0, delta: {}, finish_reason: finishReason, logprobs: null }],
          })));
          controller.enqueue(encoder.encode(SSE_DONE));
        } catch (err) {
          controller.enqueue(encoder.encode(sseChunk({
            id: cid,
            object: "chat.completion.chunk",
            created,
            model,
            system_fingerprint: null,
            choices: [{ index: 0, delta: { content: `[Stream error: ${err.message || String(err)}]` }, finish_reason: "stop", logprobs: null }],
          })));
          controller.enqueue(encoder.encode(SSE_DONE));
        } finally {
          controller.close();
        }
      },
    });
  }

  /**
   * Build non-streaming response from web API stream
   * @param {ReadableStream} responseBody - Raw response body
   * @param {string} model - Model ID
   * @param {string} cid - Chat completion ID
   * @param {number} created - Created timestamp
   * @param {AbortSignal} signal - Abort signal
   * @param {object} [toolParserConfig] - Optional tool parser config {protocol, tools}
   */
  async buildNonStreamingResponse(responseBody, model, cid, created, signal, toolParserConfig) {
    let fullContent = "";
    const thinkingParts = [];
    const useToolParser = this._pendingTools?.length > 0;
    
    for await (const chunk of this.parseWebStream(responseBody, model, signal)) {
      if (chunk.error) {
        return new Response(JSON.stringify({
          error: { message: chunk.error, type: "upstream_error", code: `${this.providerId.toUpperCase()}_ERROR` },
        }), { status: 502, headers: { "Content-Type": "application/json" } });
      }
      if (chunk.thinking) { thinkingParts.push(chunk.thinking); continue; }
      if (chunk.done) break;
      if (chunk.fullMessage) fullContent = chunk.fullMessage;
      else if (chunk.delta) fullContent += chunk.delta;
    }
    
    const msg = { role: "assistant", content: fullContent };
    if (thinkingParts.length > 0) msg.reasoning_content = thinkingParts.join("\n");
    
    // Check for tool calls in accumulated content
    if (useToolParser && fullContent) {
      const modelType = this._getProviderModelType();
      const { content: cleanContent, toolCalls } = parseToolCallsFromText(fullContent, modelType);
      if (toolCalls.length > 0) {
        const toolResponse = {
          id: cid,
          object: "chat.completion",
          created,
          model,
          system_fingerprint: null,
          choices: [{
            index: 0,
            message: { role: "assistant", content: cleanContent || null, tool_calls: toolCalls },
            finish_reason: "tool_calls",
            logprobs: null,
          }],
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        };
        return new Response(JSON.stringify(toolResponse), { status: 200, headers: { "Content-Type": "application/json" } });
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

  /**
   * Parse OpenAI messages into text
   */
  parseMessages(messages) {
    const extracted = [];
    for (const msg of messages) {
      let role = String(msg.role || "user");
      if (role === "developer") role = "system";
      let content = "";
      if (typeof msg.content === "string") {
        content = msg.content;
      } else if (Array.isArray(msg.content)) {
        content = msg.content.filter((c) => c.type === "text").map((c) => String(c.text || "")).join(" ");
      }
      if (!content.trim()) continue;
      extracted.push({ role, text: content });
    }
    
    let lastUserIdx = -1;
    for (let i = extracted.length - 1; i >= 0; i--) {
      if (extracted[i].role === "user") { lastUserIdx = i; break; }
    }
    
    const parts = [];
    for (let i = 0; i < extracted.length; i++) {
      const { role, text } = extracted[i];
      parts.push(i === lastUserIdx ? text : `${role}: ${text}`);
    }
    return parts.join("\n\n");
  }

  /**
   * Generate random hex string
   */
  randomHex(bytes) {
    const arr = new Uint8Array(bytes);
    crypto.getRandomValues(arr);
    return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
  }

  /**
   * Create error response
   */
  errorResponse(message, status = 500) {
    const resp = new Response(JSON.stringify({
      error: { message, type: "upstream_error", code: `${this.providerId.toUpperCase()}_ERROR` },
    }), { status, headers: { "Content-Type": "application/json" } });
    return { response: resp, url: "", headers: {}, transformedBody: {} };
  }

  // ============ Tool calling helpers for subclasses ============

  /**
   * Get provider-specific model type for tool parsing
   * @returns {string} Model type identifier for parseToolCallsFromText
   */
  _getProviderModelType() {
    return 'default';
  }

  // ============ Methods to override in subclasses ============

  /**
   * Build web API payload from OpenAI messages
   * @param {string} model - Model ID
   * @param {Array} messages - OpenAI messages array
   * @param {boolean} stream - Streaming enabled
   * @param {object} credentials - User credentials
   * @returns {object} Web API payload
   */
  buildWebPayload(model, messages, stream, credentials) {
    throw new Error("Subclass must implement buildWebPayload()");
  }

  /**
   * Build web API headers
   * @param {object} credentials - User credentials
   * @returns {object} Headers object
   */
  buildWebHeaders(credentials) {
    throw new Error("Subclass must implement buildWebHeaders()");
  }

  /**
   * Parse web API response stream
   * @param {ReadableStream} responseBody - Raw response body
   * @param {string} model - Model ID
   * @param {AbortSignal} signal - Abort signal
   * @yields {object} Chunks with {delta, thinking, done, error, fullMessage}
   */
  async *parseWebStream(responseBody, model, signal) {
    throw new Error("Subclass must implement parseWebStream()");
  }

  /**
   * Handle web API errors
   * @param {Response} response - Error response
   * @param {number} status - HTTP status
   * @param {object} logger - Logger object
   * @returns {object} Error response object
   */
  handleWebError(response, status, logger) {
    let errMsg = `${this.providerId} returned HTTP ${status}`;
    if (status === 401 || status === 403) errMsg = `${this.providerId} auth failed — token/cookie may be expired`;
    else if (status === 429) errMsg = `${this.providerId} rate limited`;
    
    logger?.warn?.(this.providerId.toUpperCase(), errMsg);
    return this.errorResponse(errMsg, status);
  }
}

export default WebUIExecutor;
