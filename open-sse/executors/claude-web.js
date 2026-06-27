import crypto from "crypto";
import { WebUIExecutor } from "./webui-base.js";
import { PROVIDERS } from "../config/providers.js";

const CLAUDE_API = "https://claude.ai";
const CLAUDE_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const MODEL_MAP = {
  "claude-sonnet-4-6": { slug: "claude-sonnet-4-6-20260214", name: "Claude Sonnet 4.6" },
  "claude-opus-4-6": { slug: "claude-opus-4-6-20260214", name: "Claude Opus 4.6" },
  "claude-haiku-4-5": { slug: "claude-haiku-4-5-20251015", name: "Claude Haiku 4.5" },
  "claude-sonnet-4": { slug: "claude-sonnet-4-20250514", name: "Claude Sonnet 4" },
  "claude-opus-4": { slug: "claude-opus-4-20250514", name: "Claude Opus 4" },
  "claude-3-5-sonnet": { slug: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet" },
  "claude-3-5-haiku": { slug: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku" },
};

/**
 * Claude Web Executor - Direct web API integration
 * 
 * This executor communicates directly with Claude's web interface,
 * using sessionKey cookie for authentication.
 * 
 * IMPORTANT: Requires a valid sessionKey from claude.ai browser cookies.
 * Get it from: F12 → Application → Cookies → sessionKey
 */
export class ClaudeWebExecutor extends WebUIExecutor {
  constructor() {
    super("claude-web", PROVIDERS["claude-web"] || {
      baseUrl: CLAUDE_API,
      format: "openai",
    });
    this.organizations = new Map();
    this.conversations = new Map();
  }

  buildUrl(model, stream, urlIndex = 0, credentials = null) {
    return `${CLAUDE_API}/api/organizations`;
  }

  async buildWebPayload(model, messages, stream, credentials) {
    const modelInfo = MODEL_MAP[model] || { slug: model, name: model };
    const prompt = this.buildPrompt(messages);
    
    return {
      prompt,
      timezone: "UTC",
      model: modelInfo.slug,
    };
  }

  async buildWebHeaders(credentials) {
    const headers = {
      Accept: "text/event-stream",
      "Accept-Language": "en-US,en;q=0.9",
      "Content-Type": "application/json",
      "User-Agent": CLAUDE_USER_AGENT,
    };

    // Session key is passed as cookie
    if (credentials?.apiKey) {
      headers["Cookie"] = `sessionKey=${credentials.apiKey}`;
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
        parts.push(`System: ${content}`);
      } else if (role === "user") {
        parts.push(`Human: ${content}`);
      } else if (role === "assistant") {
        parts.push(`Assistant: ${content}`);
      }
    }
    
    parts.push("Assistant:");
    return parts.join("\n\n");
  }

  /**
   * Get organization ID for account
   */
  async getOrganizationId(credentials, signal) {
    const cacheKey = credentials?.apiKey || "default";
    if (this.organizations.has(cacheKey)) {
      return this.organizations.get(cacheKey);
    }

    const headers = await this.buildWebHeaders(credentials);
    const response = await fetch(`${CLAUDE_API}/api/organizations`, {
      method: "GET",
      headers,
      signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to get organizations: ${response.status}`);
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      const orgId = data[0].uuid || data[0].id;
      this.organizations.set(cacheKey, orgId);
      return orgId;
    }

    throw new Error("No organization found for this account");
  }

  /**
   * Create a new conversation
   */
  async createConversation(orgId, credentials, signal) {
    const headers = await this.buildWebHeaders(credentials);
    const response = await fetch(
      `${CLAUDE_API}/api/organizations/${orgId}/chat_conversations`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({}),
        signal,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create conversation: ${response.status}`);
    }

    const data = await response.json();
    return data.uuid || data.id;
  }

  /**
   * Override execute to handle Claude's specific flow
   */
  async execute({ model, body, stream, credentials, signal, log }) {
    const messages = body?.messages;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return this.errorResponse("Missing or empty messages array", 400);
    }

    if (!credentials?.apiKey) {
      return this.errorResponse(
        "Claude Web requires a sessionKey. Get it from: F12 → Application → Cookies → sessionKey",
        401
      );
    }

    try {
      // Get organization ID
      const orgId = await this.getOrganizationId(credentials, signal);
      log?.info?.("CLAUDE-WEB", `Organization: ${orgId}`);

      // Create conversation
      const conversationId = await this.createConversation(orgId, credentials, signal);
      log?.info?.("CLAUDE-WEB", `Conversation: ${conversationId}`);

      // Build payload
      const payload = await this.buildWebPayload(model, messages, stream, credentials);
      
      // Build headers
      const headers = await this.buildWebHeaders(credentials);
      
      // Build URL for completion
      const url = `${CLAUDE_API}/api/organizations/${orgId}/chat_conversations/${conversationId}/completion`;
      
      log?.info?.("CLAUDE-WEB", `Request to ${model}, endpoint=${url}`);
      
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
      const cid = `chatcmpl-claude-web-${crypto.randomUUID().slice(0, 12)}`;
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
    } catch (err) {
      log?.error?.("CLAUDE-WEB", `Error: ${err.message || String(err)}`);
      return this.errorResponse(`Claude Web failed: ${err.message || String(err)}`, 502);
    }
  }

  /**
   * Parse Claude's SSE stream
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
            
            // Claude returns {"completion": "text"} format
            if (data.completion) {
              yield { delta: data.completion };
            }
            
            // Check for stop reason
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
    let errMsg = `Claude returned HTTP ${status}`;
    if (status === 401 || status === 403) {
      errMsg = "Claude session expired — update your sessionKey in Providers → Claude Web → Edit";
    } else if (status === 429) {
      errMsg = "Claude rate limited — try again shortly";
    } else if (status === 404) {
      errMsg = "Claude organization or conversation not found";
    }
    
    logger?.warn?.("CLAUDE-WEB", errMsg);
    return this.errorResponse(errMsg, status);
  }
}

export default ClaudeWebExecutor;
