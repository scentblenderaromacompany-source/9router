import { WebUIExecutor } from "./webui-base.js";
import { PROVIDERS } from "../config/providers.js";

const CHATGPT_API = "https://chatgpt.com";
const CHATGPT_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36";

const MODEL_MAP = {
  "gpt-5.5": { slug: "gpt-5-5", isFree: true },
  "gpt-5.3-mini": { slug: "gpt-5-3-mini", isFree: true },
  "gpt-5.4": { slug: "gpt-5-4", isFree: false },
  "gpt-4o": { slug: "gpt-4o", isFree: false },
  "gpt-4o-mini": { slug: "gpt-4o-mini", isFree: false },
  "gpt-4-turbo": { slug: "gpt-4-turbo", isFree: false },
  "o1": { slug: "o1", isFree: false },
  "o1-mini": { slug: "o1-mini", isFree: false },
  "o3": { slug: "o3", isFree: false },
  "o3-mini": { slug: "o3-mini", isFree: false },
  "o4-mini": { slug: "o4-mini", isFree: false },
};

function generateUUID() {
  return crypto.randomUUID();
}

/**
 * ChatGPT Web Executor - Direct web API integration
 * 
 * This executor communicates directly with ChatGPT's web interface,
 * handling the full authentication flow including sentinel tokens.
 * 
 * IMPORTANT: This requires solving Turnstile challenges manually
 * when prompted. Free tier uses GPT-5.5 (not GPT-4o).
 */
export class ChatGPTWebExecutor extends WebUIExecutor {
  constructor() {
    super("chatgpt-web", PROVIDERS["chatgpt-web"] || {
      baseUrl: CHATGPT_API,
      format: "openai",
    });
    this.sessions = new Map(); // Cache session tokens
  }

  buildUrl(model, stream, urlIndex = 0, credentials = null) {
    return `${CHATGPT_API}/backend-anon/f/conversation`;
  }

  async buildWebPayload(model, messages, stream, credentials) {
    const modelInfo = MODEL_MAP[model] || { slug: "auto", isFree: true };
    const content = this.parseMessages(messages);
    const messageId = generateUUID();
    
    return {
      action: "next",
      messages: [
        {
          id: messageId,
          author: { role: "user" },
          create_time: Date.now() / 1000,
          content: {
            content_type: "text",
            parts: [content],
          },
          metadata: {
            selected_github_repos: [],
            selected_all_github_repos: false,
            serialization_metadata: { custom_symbol_offsets: [] },
          },
        },
      ],
      parent_message_id: "client-created-root",
      model: modelInfo.slug,
      client_prepare_state: "success",
      timezone_offset_min: 300,
      timezone: "America/Chicago",
      conversation_mode: { kind: "primary_assistant" },
      enable_message_followups: true,
      system_hints: [],
      supports_buffering: true,
      supported_encodings: ["v1"],
      client_contextual_info: {
        is_dark_mode: false,
        time_since_loaded: 0,
        page_height: 770,
        page_width: 1512,
        pixel_ratio: 2,
        screen_height: 982,
        screen_width: 1512,
        app_name: "chatgpt.com",
      },
      no_auth_ad_preferences: {
        personalization_enabled: true,
        history_enabled: true,
        bazaar_consent_set: false,
      },
      paragen_cot_summary_display_override: "allow",
      force_parallel_switch: "auto",
    };
  }

  async buildWebHeaders(credentials) {
    const deviceId = generateUUID();
    const sessionId = generateUUID();
    const traceId = generateUUID();
    
    const headers = {
      Accept: "text/event-stream",
      "Content-Type": "application/json",
      "oai-client-build-number": "7511904",
      "oai-client-version": "prod-a5747f44f9bfe551e0bc9db0a31f22a497f6568a",
      "oai-device-id": deviceId,
      "oai-echo-logs": "0,7272",
      "oai-language": "en-US",
      "oai-session-id": sessionId,
      "oai-telemetry": "[1,null]",
      "User-Agent": CHATGPT_USER_AGENT,
      "x-openai-target-path": "/backend-api/f/conversation",
      "x-openai-target-route": "/backend-api/f/conversation",
      "x-oai-turn-trace-id": traceId,
    };

    // If we have a conduit token, add it
    if (credentials?.accessToken) {
      headers["x-conduit-token"] = credentials.accessToken;
    }

    // Add sentinel tokens if available
    if (credentials?.providerSpecificData?.sentinelToken) {
      headers["openai-sentinel-chat-requirements-token"] = credentials.providerSpecificData.sentinelToken;
    }
    if (credentials?.providerSpecificData?.proofToken) {
      headers["openai-sentinel-proof-token"] = credentials.providerSpecificData.proofToken;
    }
    if (credentials?.providerSpecificData?.turnstileToken) {
      headers["openai-sentinel-turnstile-token"] = credentials.providerSpecificData.turnstileToken;
    }

    return headers;
  }

  /**
   * Get conduit token from prepare endpoint
   */
  async getConduitToken(signal) {
    try {
      const response = await fetch(`${CHATGPT_API}/backend-anon/f/conversation/prepare`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": CHATGPT_USER_AGENT,
        },
        body: JSON.stringify({}),
        signal,
      });
      
      if (!response.ok) {
        throw new Error(`Prepare endpoint returned ${response.status}`);
      }
      
      const data = await response.json();
      return data.conduit_token;
    } catch (err) {
      console.error("Failed to get conduit token:", err);
      return null;
    }
  }

  /**
   * Get sentinel tokens (requires Turnstile challenge)
   */
  async getSentinelTokens(signal) {
    try {
      // Step 1: Prepare
      const prepareResponse = await fetch(`${CHATGPT_API}/backend-anon/sentinel/chat-requirements/prepare`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": CHATGPT_USER_AGENT,
        },
        signal,
      });
      
      if (!prepareResponse.ok) {
        throw new Error(`Sentinel prepare returned ${prepareResponse.status}`);
      }
      
      const prepareData = await prepareResponse.json();
      const prepareToken = prepareData.token;
      
      // Step 2: Solve Turnstile (this needs manual intervention or auto-solve)
      // For now, return the prepare token - user must solve Turnstile manually
      return {
        prepareToken,
        requiresTurnstile: true,
        message: "Turnstile challenge required. Please solve in browser.",
      };
    } catch (err) {
      console.error("Failed to get sentinel tokens:", err);
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
            
            // Handle different response types
            if (data.type === "server_ste_metadata") {
              // Stream metadata - skip
              continue;
            }
            
            if (data.type === "message_stream_complete") {
              yield { done: true };
              return;
            }
            
            // Handle delta format: {"p": "", "o": "add", "v": {...}}
            if (data.v?.message?.content?.parts) {
              const parts = data.v.message.content.parts;
              const content = parts.join("");
              if (content) {
                yield { delta: content };
              }
            }
            
            // Handle full message
            if (data.v?.message?.content?.content_type === "text") {
              const content = data.v.message.content.parts?.join("") || "";
              if (content) {
                yield { fullMessage: content };
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

  handleWebError(response, status, logger) {
    let errMsg = `ChatGPT returned HTTP ${status}`;
    if (status === 401 || status === 403) errMsg = "ChatGPT auth failed — access token may be expired";
    else if (status === 429) errMsg = "ChatGPT rate limited";
    else if (status === 403) errMsg = "ChatGPT blocked request — Turnstile challenge may be required";
    
    logger?.warn?.("CHATGPT-WEB", errMsg);
    return this.errorResponse(errMsg, status);
  }
}

export default ChatGPTWebExecutor;
