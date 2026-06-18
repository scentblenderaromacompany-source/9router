import { BaseModelFetcher } from "../baseModelFetcher.js";
import { fetchWithEnhancedRetry } from "../errorHandler.js";
import { getCustomModels, addCustomModel, deleteCustomModel } from "../../localDb.js";

export class GrokImagineModelFetcher extends BaseModelFetcher {
  constructor(providerId, connection, config = {}) {
    super(providerId, connection, config);
    this.baseUrl = connection.providerSpecificData?.baseUrl || "https://grok.x.ai";
    this.apiKey = connection.apiKey;
    this.prefix = connection.providerSpecificData?.prefix;
  }

  async performFetch() {
    if (!this.baseUrl) {
      throw new Error("No base URL configured for Grok Imagine provider");
    }

    const url = `${this.baseUrl}/api/v1/models`;
    const response = await fetchWithEnhancedRetry(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      providerId: this.providerId,
    });

    const data = await response.json();
    const models = data.models || [
      { id: "grok-imagine", name: "Grok Imagine", capabilities: ["text2img"], params: ["width", "height", "seed"] },
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
        type: "image",
        description: model.description || `Free Grok Imagine model: ${modelName}`,
        contextLength: model.contextLength || null,
        maxTokens: model.maxTokens || null,
        priceInput: 0.0,
        priceOutput: 0.0,
        capabilities: model.capabilities || ["text2img"],
        isDefault: model.id === "grok-imagine",
        upstreamModelId: model.id,
        rateMultiplier: 1.0,
        quotaFamily: "free",
        isVL: false,
        isReasoning: false,
        maxOutputTokens: model.maxTokens || 1024,
      });

      existingCustomIds.delete(modelId);
    }

    for (const modelId of existingCustomIds) {
      await deleteCustomModel(this.providerId, modelId);
    }
  }
}
