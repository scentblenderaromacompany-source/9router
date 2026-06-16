import { BaseExecutor } from "./base.js";
import { PROVIDERS } from "../config/providers.js";

/**
 * ChatGPT Web UI Executor — native integration via access token
 * Communicates with Chat2API proxy which handles web UI authentication
 * Transparently passes OpenAI-compatible requests to Chat2API endpoints
 * Supports tool parsing, streaming, vision, and image generation
 */
export class ChatGPTWebExecutor extends BaseExecutor {
  constructor() {
    super("chatgpt-web", PROVIDERS["chatgpt-web"] || {
      baseUrl: "http://localhost:8700/v1",
      format: "openai"
    });
  }

  /**
   * Build Chat2API proxy URL
   * Supports both chat/completions and responses endpoints
   */
  buildUrl(model, stream, urlIndex = 0, credentials = null) {
    // Get baseUrl from credentials if set, otherwise use provider config
    const baseUrl = credentials?.providerSpecificData?.baseUrl || 
                    this.config.baseUrl || 
                    "http://localhost:8700/v1";
    const normalized = baseUrl.trim().replace(/\/$/, "");
    
    // Check if responses endpoint should be used
    const apiType = credentials?.providerSpecificData?.apiType || "chat";
    const endpoint = apiType === "responses" ? "/responses" : "/chat/completions";
    
    return `${normalized}${endpoint}`;
  }

  /**
   * Build Chat2API request headers
   * Chat2API proxy accepts Bearer token authorization
   */
  buildHeaders(credentials, stream = true) {
    const headers = {
      "Content-Type": "application/json",
    };

    // Use access token for ChatGPT web access
    const token = credentials?.apiKey || credentials?.accessToken;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (stream) {
      headers["Accept"] = "text/event-stream";
    }

    return headers;
  }

  /**
   * Transform request body to Chat2API format
   * Chat2API accepts standard OpenAI chat completions format
   */
  transformRequest(model, body, stream, credentials) {
    // Ensure required fields and proper structure
    const transformed = {
      model: body.model || model,
      messages: body.messages || [],
      stream: stream !== undefined ? stream : body.stream ?? false,
    };

    // Optional OpenAI parameters
    if (body.temperature !== undefined) transformed.temperature = body.temperature;
    if (body.max_tokens !== undefined) transformed.max_tokens = body.max_tokens;
    if (body.top_p !== undefined) transformed.top_p = body.top_p;
    if (body.frequency_penalty !== undefined) transformed.frequency_penalty = body.frequency_penalty;
    if (body.presence_penalty !== undefined) transformed.presence_penalty = body.presence_penalty;
    
    // Tool/function calling support (native in OpenAI format)
    if (body.tools) transformed.tools = body.tools;
    if (body.tool_choice) transformed.tool_choice = body.tool_choice;
    
    // Vision support
    if (body.vision_detail) transformed.vision_detail = body.vision_detail;

    return transformed;
  }
}
