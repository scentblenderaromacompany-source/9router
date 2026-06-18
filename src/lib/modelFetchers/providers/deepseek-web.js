import { WebUIModelFetcher } from "./webui.js";
import { fetchWithEnhancedRetry } from "../errorHandler.js";

export class DeepseekWebModelFetcher extends WebUIModelFetcher {
  constructor(providerId, connection, config = {}) {
    super(providerId, connection, config);
    this.baseUrl = connection.providerSpecificData?.baseUrl || "https://chat.deepseek.com";
    this.apiKey = connection.apiKey;
  }

  async performFetch() {
    try {
      const url = `${this.baseUrl}/api/v0/client/settings?scope=model`;
      const response = await fetchWithEnhancedRetry(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
        },
        providerId: this.providerId,
      });
      const data = await response.json();
      const rawModels = data?.data?.models || data?.models;
      if (Array.isArray(rawModels) && rawModels.length > 0) {
        return rawModels.map((m) => ({
          id: m.id || m.model_id || m.name || String(m),
          name: m.name || m.id || m.model_id || String(m),
          capabilities: m.capabilities || ["text", "tools"],
        }));
      }
    } catch {
      // fall through to registry models
    }
    return super.performFetch();
  }
}
