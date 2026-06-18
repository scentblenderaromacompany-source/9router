import crypto from "crypto";
import { WebUIExecutor } from "./webui-base.js";
import { PROVIDERS } from "../config/providers.js";

const ZAI_WEB_API = "https://chat.z.ai";
const ZAI_FE_VERSION = "prod-fe-1.1.66";
const ZAI_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36";

const MODEL_MAP = {
  "glm-4.7": { webModel: "glm-4.7", isFree: true },
  "glm-4.7-flash": { webModel: "glm-4.7-flash", isFree: true },
  "glm-4.5-flash": { webModel: "glm-4.5-flash", isFree: true },
  "glm-5.1": { webModel: "glm-5.1", isFree: false },
  "glm-5-turbo": { webModel: "glm-5-turbo", isFree: false },
  "glm-5": { webModel: "glm-5", isFree: false },
  "glm-4.6": { webModel: "glm-4.6", isFree: false },
  "glm-4.5": { webModel: "glm-4.5", isFree: false },
  "glm-4.5-air": { webModel: "glm-4.5-air", isFree: false },
  "glm-4.5-airx": { webModel: "glm-4.5-airx", isFree: false },
};

function toB64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 32768) {
    bin += String.fromCharCode.apply(null, Array.from(bytes.slice(i, i + 32768)));
  }
  return btoa(bin);
}

function computeSignature(requestId, message, timestamp) {
  const payload = `requestId:${requestId},timestamp:${timestamp},user_id:`;
  const b64 = toB64(message);
  const data = `${payload}|${b64}|${timestamp}`;
  const windowKey = Math.floor(Number(timestamp) / 300000);
  return crypto.createHmac("sha256", String(windowKey)).update(data).digest("hex");
}

function makeUrlParams(requestId, timestamp) {
  const p = new URLSearchParams({
    timestamp,
    requestId,
    user_id: "",
    version: ZAI_FE_VERSION,
    platform: "web",
    token: "",
    user_agent: ZAI_USER_AGENT,
    language: "en-US",
    languages: "en-US,en",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cookie_enabled: "true",
    screen_width: "1920",
    screen_height: "1080",
    screen_resolution: "1920x1080",
    viewport_height: "900",
    viewport_width: "1920",
    viewport_size: "1920x900",
    color_depth: "24",
    pixel_ratio: "2",
    current_url: "https://chat.z.ai/",
    pathname: "/",
    search: "",
    hash: "",
    host: "chat.z.ai",
    hostname: "chat.z.ai",
    protocol: "https:",
    referrer: "",
    title: "Z.ai - Advanced AI Chatbot & Agent powered by GLM-5.2",
    timezone_offset: String(new Date().getTimezoneOffset()),
    local_time: new Date().toString(),
    utc_time: new Date().toUTCString(),
    is_mobile: "false",
    is_touch: "false",
    max_touch_points: "0",
    browser_name: "Chrome",
    os_name: "Mac OS",
  });
  return p.toString();
}

export class ZAIWebExecutor extends WebUIExecutor {
  constructor() {
    super("z-ai-web", PROVIDERS["z-ai-web"] || {
      baseUrl: ZAI_WEB_API,
      format: "openai",
    });
    this._sig = null;
    this._guestToken = null;
  }

  async execute(opts) {
    const { model, body, stream, credentials, signal, log } = opts;
    const messages = body?.messages;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return this.errorResponse("Missing or empty messages array", 400);
    }

    try {
      const payload = await this.buildWebPayload(model, messages, stream, credentials);
      const headers = await this.buildWebHeaders(credentials);
      const url = this.buildUrl(model, stream, 0, credentials);

      log?.info?.(this.providerId.toUpperCase(), `Request to ${model}, endpoint=${url}`);

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

      const cid = `chatcmpl-${this.providerId}-${crypto.randomUUID().slice(0, 12)}`;
      const created = Math.floor(Date.now() / 1000);

      if (stream) {
        const sseStream = this.buildStreamingResponse(response.body, model, cid, created, signal);
        return {
          response: new Response(sseStream, { status: 200, headers: {} }),
          url, headers, transformedBody: payload,
        };
      } else {
        const result = await this.buildNonStreamingResponse(response.body, model, cid, created, signal);
        return { response: result, url, headers, transformedBody: payload };
      }
    } catch (err) {
      log?.error?.(this.providerId.toUpperCase(), `Error: ${err.message || String(err)}`);
      return this.errorResponse(`${this.providerId} failed: ${err.message || String(err)}`, 502);
    }
  }

  buildUrl(model, stream, urlIndex = 0, credentials = null) {
    let url = `${ZAI_WEB_API}/api/v2/chat/completions`;
    if (this._sig) {
      url += `?${this._sig.urlParams}&signature_timestamp=${this._sig.timestamp}`;
    }
    return url;
  }

  buildWebPayload(model, messages, stream, credentials) {
    const modelInfo = MODEL_MAP[model] || { webModel: "glm-4.7", isFree: true };
    const content = this.parseMessages(messages);
    const chatId = crypto.randomUUID();
    const messageId = crypto.randomUUID();
    const requestId = crypto.randomUUID();
    const timestamp = String(Date.now());
    const signature = computeSignature(requestId, content, timestamp);
    const urlParams = makeUrlParams(requestId, timestamp);

    this._sig = { timestamp, urlParams, signature };

    return {
      stream: stream !== undefined ? stream : true,
      model: modelInfo.webModel,
      messages: [{ role: "user", content }],
      signature_prompt: content,
      params: {},
      extra: {},
      features: {
        image_generation: false,
        web_search: false,
        auto_web_search: false,
        preview_mode: true,
        flags: [],
        vlm_tools_enable: false,
        vlm_web_search_enable: false,
        vlm_website_mode: false,
        enable_thinking: true,
      },
      variables: {
        "{{USER_NAME}}": "Guest",
        "{{USER_LOCATION}}": "Unknown",
        "{{CURRENT_DATETIME}}": new Date().toISOString().replace("T", " ").slice(0, 19),
        "{{CURRENT_DATE}}": new Date().toISOString().slice(0, 10),
        "{{CURRENT_TIME}}": new Date().toTimeString().slice(0, 8),
        "{{CURRENT_WEEKDAY}}": new Date().toLocaleDateString("en-US", { weekday: "long" }),
        "{{CURRENT_TIMEZONE}}": Intl.DateTimeFormat().resolvedOptions().timeZone,
        "{{USER_LANGUAGE}}": "en-US",
      },
      chat_id: chatId,
      id: crypto.randomUUID(),
      current_user_message_id: messageId,
      current_user_message_parent_id: null,
      background_tasks: { title_generation: true, tags_generation: true },
    };
  }

  async buildWebHeaders(credentials) {
    const headers = {
      Accept: "application/json",
      "Accept-Language": "en-US",
      "Content-Type": "application/json",
      "User-Agent": ZAI_USER_AGENT,
      "X-FE-Version": ZAI_FE_VERSION,
    };

    let token = credentials?.apiKey || credentials?.accessToken;

    if (!token) {
      if (!this._guestToken) {
        try {
          const res = await fetch(`${ZAI_WEB_API}/api/v1/auths/`, {
            method: "GET",
            headers: { Accept: "application/json", "User-Agent": ZAI_USER_AGENT },
          });
          if (res.ok) {
            const d = await res.json();
            this._guestToken = d.token;
          }
        } catch { /* will fail with clear error */ }
      }
      token = this._guestToken;
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (this._sig?.signature) {
      headers["X-Signature"] = this._sig.signature;
    }

    return headers;
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
          const end = buffer.indexOf("\n\n");
          if (end < 0) break;

          const block = buffer.slice(0, end);
          buffer = buffer.slice(end + 2);

          let eventType = "";
          let eventData = "";

          for (const line of block.split("\n")) {
            if (line.startsWith("event: ")) eventType = line.slice(7);
            else if (line.startsWith("data: ")) eventData = line.slice(6);
          }

          if (!eventData || eventData === "[DONE]") continue;

          try {
            const d = JSON.parse(eventData);
            if (d.type === "chat:completion") {
              const c = d.data?.data;
              if (c?.error) { yield { error: c.error.detail || "Z.AI error", done: true }; return; }
              if (c?.choices?.[0]?.delta?.content) yield { delta: c.choices[0].delta.content };
              if (c?.choices?.[0]?.message?.content) yield { fullMessage: c.choices[0].message.content };
              if (c?.done) { yield { done: true }; return; }
            }
          } catch { /* skip */ }
        }
      }
      yield { done: true };
    } finally {
      reader.releaseLock();
    }
  }

  handleWebError(response, status, logger) {
    let msg = `Z.AI returned HTTP ${status}`;
    if (status === 401 || status === 403) msg = "Z.AI auth failed — token may be expired";
    else if (status === 429) msg = "Z.AI rate limited";
    else if (status === 500) msg = "Z.AI internal error — the v2 web API requires browser-specific request signing. Use the 'z-ai' provider with an API key for reliable access, or get a fresh guest token from chat.z.ai.";
    logger?.warn?.("Z-AI-WEB", msg);
    return this.errorResponse(msg, status);
  }
}

export default ZAIWebExecutor;
