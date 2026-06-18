import crypto from "crypto";
import { WebUIExecutor } from "./webui-base.js";
import { PROVIDERS } from "../config/providers.js";
import { SSE_HEADERS_NO_BUFFER } from "../utils/sseConstants.js";

const CHATGPT_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36";

/**
 * ChatGPT Web Executor — Chat2API proxy integration
 *
 * This executor communicates with a Chat2API proxy (expected at
 * localhost:8700/v1) that translates OpenAI-format requests to
 * ChatGPT's web API and back.
 */
export class ChatGPTWebExecutor extends WebUIExecutor {
  constructor() {
    super("chatgpt-web", PROVIDERS["chatgpt-web"] || {
      baseUrl: "http://localhost:8700/v1",
      format: "openai",
    });
  }

  buildUrl(model, stream, urlIndex = 0, credentials = null) {
    const base = (this.config.baseUrl || "http://localhost:8700/v1").replace(/\/+$/, "");
    return `${base}/chat/completions`;
  }

  transformRequest(model, body, stream, credentials) {
    return { ...body, model, stream: !!stream };
  }

  buildWebPayload(model, messages, stream, credentials) {
    return { messages, stream: !!stream };
  }

  async buildWebHeaders(credentials) {
    const headers = {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      "User-Agent": CHATGPT_USER_AGENT,
    };
    if (credentials?.accessToken) {
      headers["Authorization"] = `Bearer ${credentials.accessToken}`;
    } else if (credentials?.apiKey) {
      headers["Authorization"] = `Bearer ${credentials.apiKey}`;
    }
    return headers;
  }

  async execute({ model, body, stream, credentials, signal, log }) {
    const messages = body?.messages;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return this.errorResponse("Missing or empty messages array", 400);
    }

    try {
      const url = this.buildUrl(model, stream, 0, credentials);
      const headers = await this.buildWebHeaders(credentials);
      const payload = this.transformRequest(model, body, stream, credentials);

      log?.info?.("CHATGPT-WEB", `Proxy request to ${model}, endpoint=${url}`);

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal,
      });

      if (!response.ok) {
        return this.handleWebError(response, response.status, log);
      }

      if (!response.body) {
        return this.errorResponse("Empty response body", 502);
      }

      const cid = `chatcmpl-chatgpt-web-${crypto.randomUUID().slice(0, 12)}`;
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
      }

      return {
        response: new Response(response.body, {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
        url,
        headers,
        transformedBody: payload,
      };
    } catch (err) {
      log?.error?.("CHATGPT-WEB", `Error: ${err.message || String(err)}`);
      return this.errorResponse(`chatgpt-web failed: ${err.message || String(err)}`, 502);
    }
  }

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
          const lineEnd = buffer.indexOf("\n");
          if (lineEnd < 0) break;
          const line = buffer.slice(0, lineEnd);
          buffer = buffer.slice(lineEnd + 1);
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(":")) continue;
          if (trimmed.startsWith("data: ")) {
            const data = trimmed.slice(6);
            if (data === "[DONE]") {
              yield { done: true };
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const choice = parsed.choices?.[0];
              if (choice?.delta?.content) {
                yield { delta: choice.delta.content };
              }
              if (choice?.finish_reason) {
                yield { done: true };
                return;
              }
            } catch {
              // skip invalid JSON
            }
          }
        }
      }
      yield { done: true };
    } finally {
      reader.releaseLock();
    }
  }

  handleWebError(response, status, logger) {
    let errMsg = `Chat2API returned HTTP ${status}`;
    if (status === 401 || status === 403) errMsg = "Chat2API auth failed — access token may be expired";
    else if (status === 429) errMsg = "Chat2API rate limited";
    logger?.warn?.("CHATGPT-WEB", errMsg);
    return this.errorResponse(errMsg, status);
  }
}

export default ChatGPTWebExecutor;
