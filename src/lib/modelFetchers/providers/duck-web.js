import { BaseModelFetcher } from "../baseModelFetcher.js";
import { fetchWithEnhancedRetry } from "../errorHandler.js";
import { getCustomModels, addCustomModel, deleteCustomModel } from "../../localDb.js";

export class DuckWebModelFetcher extends BaseModelFetcher {
  constructor(providerId, connection, config = {}) {
    super(providerId, connection, config);
    this.baseUrl = connection.providerSpecificData?.baseUrl || "https://duck.ai";
    this.apiKey = connection.apiKey;
    this.prefix = connection.providerSpecificData?.prefix;
  }

  async performFetch() {
    if (!this.baseUrl) {
      throw new Error("No base URL configured for Duck.ai provider");
    }

    const url = `${this.baseUrl}/duckchat/v1/status`;
    const response = await fetchWithEnhancedRetry(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      providerId: this.providerId,
    });

    const data = await response.json();
    const models = data.models || [
      { id: "gpt-4o-mini", name: "GPT-4o Mini", capabilities: ["text", "vision", "tools"] },
      { id: "gpt-5-mini", name: "GPT-5 Mini", capabilities: ["text", "vision", "tools"] },
      { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", capabilities: ["text", "vision", "tools"] },
      { id: "meta-llama/Llama-4-Scout-17B-16E-Instruct", name: "Llama 4 Scout", capabilities: ["text"] },
      { id: "mistral-small-2603", name: "Mistral Small", capabilities: ["text"] },
      { id: "tinfoil/gpt-oss-120b", name: "GPT-OSS 120B", capabilities: ["text"] },
    ];
    return models;
  }

  async updateDatabase(models) {
    const customModels = await getCustomModels(this.providerId);
    const existingCustomIds = new Set(customModels.map((m) => m.id));

    for (const model of models) {
      const modelId = model.id;
      const modelName = model.name || model.id;

      await addCustomModel({
        providerAlias: this.providerId,
        id: modelId,
        name: modelName,
        type: "llm",
        description: model.description || `Free Duck.ai model: ${modelName}`,
        contextLength: model.contextLength || 8192,
        maxTokens: model.maxTokens || null,
        priceInput: 0.0,
        priceOutput: 0.0,
        capabilities: model.capabilities || ["text"],
        isDefault: model.id === "gpt-4o-mini",
        upstreamModelId: model.id,
        rateMultiplier: 1.0,
        quotaFamily: "free",
        isVL: model.capabilities?.includes("vision") || false,
        isReasoning: model.capabilities?.includes("tools") || false,
        maxOutputTokens: model.maxTokens || 4096,
      });

      existingCustomIds.delete(modelId);
    }

    for (const modelId of existingCustomIds) {
      await deleteCustomModel(this.providerId, modelId);
    }
  }
}
