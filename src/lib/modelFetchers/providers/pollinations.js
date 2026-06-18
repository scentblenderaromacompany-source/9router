import { BaseModelFetcher } from "../baseModelFetcher.js";
import { fetchWithEnhancedRetry } from "../errorHandler.js";
import { getCustomModels, addCustomModel, deleteCustomModel } from "../../localDb.js";

export class PollinationsModelFetcher extends BaseModelFetcher {
  constructor(providerId, connection, config = {}) {
    super(providerId, connection, config);
    this.baseUrl = connection.providerSpecificData?.baseUrl || "https://image.pollinations.ai";
    this.apiKey = connection.apiKey;
    this.prefix = connection.providerSpecificData?.prefix;
  }

  async performFetch() {
    if (!this.baseUrl) {
      throw new Error("No base URL configured for Pollinations provider");
    }

    const url = `${this.baseUrl}/models`;
    const response = await fetchWithEnhancedRetry(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      providerId: this.providerId,
    });

    const data = await response.json();
    const models = data.models || [
      { id: "flux", name: "Flux", capabilities: ["text2img"], params: ["width", "height", "seed", "model"] },
      { id: "flux-realism", name: "Flux Realism", capabilities: ["text2img"], params: ["width", "height", "seed"] },
      { id: "flux-anime", name: "Flux Anime", capabilities: ["text2img"], params: ["width", "height", "seed"] },
      { id: "flux-3d", name: "Flux 3D", capabilities: ["text2img"], params: ["width", "height", "seed"] },
      { id: "flux-cablyai", name: "Flux CablyAI", capabilities: ["text2img"], params: ["width", "height", "seed"] },
      { id: "flux-black-forest", name: "Flux Black Forest", capabilities: ["text2img"], params: ["width", "height", "seed"] },
      { id: "kontext", name: "Kontext", capabilities: ["text2img"], params: ["width", "height", "seed"] },
      { id: "nanobanana", name: "NanoBanana", capabilities: ["text2img"], params: ["width", "height", "seed"] },
      { id: "seedream", name: "Seedream", capabilities: ["text2img"], params: ["width", "height", "seed"] },
      { id: "gptimage", name: "GPT Image", capabilities: ["text2img"], params: ["width", "height", "seed"] },
      { id: "grok", name: "Grok Imagine", capabilities: ["text2img"], params: ["width", "height", "seed"] },
      { id: "qwen", name: "Qwen Image", capabilities: ["text2img"], params: ["width", "height", "seed"] },
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
        description: model.description || `Free Pollinations model: ${modelName}`,
        contextLength: model.contextLength || null,
        maxTokens: model.maxTokens || null,
        priceInput: 0.0,
        priceOutput: 0.0,
        capabilities: model.capabilities || ["text2img"],
        isDefault: model.id === "flux",
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
