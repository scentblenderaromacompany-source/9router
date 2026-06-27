import crypto from "crypto";
import { WebUIExecutor } from "./webui-base.js";
import { PROVIDERS } from "../config/providers.js";
import { parseToolCallsFromText } from "../utils/toolCalling/toolParser.js";

const ZAI_WEB_API = "https://chat.z.ai";
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

/**
 * Z.AI Web Executor - Direct web UI integration
 * 
 * This executor communicates directly with Z.AI's web interface.
 * 
 * IMPORTANT: Z.AI requires Alibaba Cloud CAPTCHA for chat completion.
 * CAPTCHA tokens are single-use and cannot be automated.
 * 
 * For programmatic access, use the developer API with an API key:
 * https://z.ai/manage-apikey/apikey-list
 */
export class ZAIWebExecutor extends WebUIExecutor {
  constructor() {
    super("z-ai-web", PROVIDERS["z-ai-web"] || {
      baseUrl: ZAI_WEB_API,
      format: "openai",
    });
    this.guestTokens = new Map(); // Cache guest tokens
  }

  buildUrl(model, stream, urlIndex = 0, credentials = null) {
    return `${ZAI_WEB_API}/api/v2/chat/completions`;
  }

  async buildWebPayload(model, messages, stream, credentials) {
    const modelInfo = MODEL_MAP[model] || { webModel: "glm-4.7", isFree: true };
    const content = this.parseMessages(messages);
    const chatId = crypto.randomUUID();
    const messageId = crypto.randomUUID();
    
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
      background_tasks: {
        title_generation: true,
        tags_generation: true,
      },
    };
  }

  async buildWebHeaders(credentials) {
    const headers = {
      Accept: "application/json",
      "Accept-Language": "en-US",
      "Content-Type": "application/json",
      "User-Agent": ZAI_USER_AGENT,
      "x-fe-version": "prod-fe-1.1.54",
    };

    // Use guest token or API token
    const token = credentials?.apiKey || credentials?.accessToken;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Add signature if available
    if (credentials?.providerSpecificData?.signature) {
      headers["x-signature"] = credentials.providerSpecificData.signature;
    }

    return headers;
  }

  /**
   * Get guest token from auth endpoint
   */
  async getGuestToken(signal) {
    try {
      const response = await fetch(`${ZAI_WEB_API}/api/v1/auths/`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": ZAI_USER_AGENT,
        },
        signal,
      });
      
      if (!response.ok) {
        throw new Error(`Auth endpoint returned ${response.status}`);
      }
      
      const data = await response.json();
      return data.token;
    } catch (err) {
      console.error("Failed to get guest token:", err);
      return null;
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
        
        // Process SSE events
        while (true) {
          const eventEnd = buffer.indexOf("\n\n");
          if (eventEnd < 0) break;
          
          const eventBlock = buffer.slice(0, eventEnd);
          buffer = buffer.slice(eventEnd + 2);
          
          // Parse event type and data
          let eventType = "";
          let eventData = "";
          
          for (const line of eventBlock.split("\n")) {
            if (line.startsWith("event: ")) {
              eventType = line.slice(7);
            } else if (line.startsWith("data: ")) {
              eventData = line.slice(6);
            }
          }
          
          if (!eventData || eventData === "[DONE]") continue;
          
          try {
            const data = JSON.parse(eventData);
            
            // Handle Z.AI response format
            if (data.type === "chat:completion") {
              const completion = data.data?.data;
              
              if (completion?.error) {
                yield { error: completion.error.detail || "Z.AI error", done: true };
                return;
              }
              
              if (completion?.choices?.[0]?.delta?.content) {
                yield { delta: completion.choices[0].delta.content };
              }
              
              if (completion?.choices?.[0]?.message?.content) {
                yield { fullMessage: completion.choices[0].message.content };
              }
              
              if (completion?.done) {
                yield { done: true };
                return;
              }
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
   * Parse tool calls from Z.AI model output.
   * Z.AI has no native tool support; uses managed bracket protocol.
   * @param {string} content - Model output text
   * @param {Array} [tools] - Available tools for validation
   * @returns {{content: string, toolCalls: Array}}
   */
  parseToolCalls(content, tools = []) {
    return parseToolCallsFromText(content, this._getProviderModelType());
  }

  _getProviderModelType() {
    return 'glm';
  }

  handleWebError(response, status, logger) {
    let errMsg = `Z.AI returned HTTP ${status}`;
    if (status === 401 || status === 403) errMsg = "Z.AI auth failed — token may be expired";
    else if (status === 429) errMsg = "Z.AI rate limited";
    else if (status === 403) errMsg = "Z.AI blocked request — CAPTCHA may be required";
    
    logger?.warn?.("Z-AI-WEB", errMsg);
    return this.errorResponse(errMsg, status);
  }
}

export default ZAIWebExecutor;
