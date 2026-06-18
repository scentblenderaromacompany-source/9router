import { WebUIModelFetcher } from "./webui.js";
import { fetchWithEnhancedRetry } from "../errorHandler.js";

export class ClaudeWebModelFetcher extends WebUIModelFetcher {
  constructor(providerId, connection, config = {}) {
    super(providerId, connection, config);
    this.baseUrl = "https://claude.ai";
    this.apiKey = connection.apiKey;
  }

  async performFetch() {
    try {
      const orgUrl = `${this.baseUrl}/api/organizations`;
      const headers = {
        "Content-Type": "application/json",
        ...(this.apiKey ? { Cookie: `sessionKey=${this.apiKey}` } : {}),
      };
      const orgResponse = await fetchWithEnhancedRetry(orgUrl, {
        method: "GET",
        headers,
        providerId: this.providerId,
      });
      const orgs = await orgResponse.json();
      const orgId = Array.isArray(orgs) ? orgs[0]?.uuid : orgs?.organizations?.[0]?.uuid;
      if (orgId) {
        const modelsUrl = `${this.baseUrl}/api/organizations/${orgId}/models`;
        const modelsResponse = await fetchWithEnhancedRetry(modelsUrl, {
          method: "GET",
          headers,
          providerId: this.providerId,
        });
        const modelsData = await modelsResponse.json();
        const modelList = Array.isArray(modelsData) ? modelsData : modelsData?.models;
        if (Array.isArray(modelList) && modelList.length > 0) {
          return modelList.map((m) => ({
            id: m.id || m.name || String(m),
            name: m.name || m.id || String(m),
            capabilities: m.capabilities || ["text", "vision", "tools"],
          }));
        }
      }
    } catch {
      // fall through to registry models
    }
    return super.performFetch();
  }
}
