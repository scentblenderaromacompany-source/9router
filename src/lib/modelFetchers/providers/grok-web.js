import { WebUIModelFetcher } from "./webui.js";
import { fetchWithEnhancedRetry } from "../errorHandler.js";

export class GrokWebModelFetcher extends WebUIModelFetcher {
  constructor(providerId, connection, config = {}) {
    super(providerId, connection, config);
    this.baseUrl = "https://grok.com";
    this.apiKey = connection.apiKey;
  }

  async performFetch() {
    try {
      const url = `${this.baseUrl}/rest/app-chat/models`;
      const response = await fetchWithEnhancedRetry(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(this.apiKey ? { Cookie: `sso=${this.apiKey}` } : {}),
        },
        providerId: this.providerId,
      });
      const data = await response.json();
      const modelList = Array.isArray(data) ? data : data?.models;
      if (Array.isArray(modelList) && modelList.length > 0) {
        return modelList.map((m) => ({
          id: m.id || m.modelId || m.name || String(m),
          name: m.name || m.displayName || m.id || String(m),
          capabilities: m.capabilities || ["text", "tools"],
        }));
      }
    } catch {
      // fall through to registry models
    }
    return super.performFetch();
  }
}
