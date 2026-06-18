import { BaseModelFetcher } from "../baseModelFetcher.js";
import { getProviderByAlias } from "../../../shared/constants/providers.js";
import REGISTRY from "../../../../open-sse/providers/registry/index.js";
import { getCustomModels, addCustomModel, deleteCustomModel } from "../../localDb.js";

export class WebUIModelFetcher extends BaseModelFetcher {
  constructor(providerId, connection, config = {}) {
    super(providerId, connection, config);
    this.providerInfo = getProviderByAlias(providerId);
    this.registryEntry = REGISTRY.find(r => r.id === providerId) || null;
  }

  async performFetch() {
    const registryModels = this.registryEntry?.models;
    if (registryModels && registryModels.length > 0) {
      return registryModels.map(m => ({
        id: m.id,
        name: m.name || m.id,
        capabilities: m.capabilities || ["text"],
        params: m.params || [],
        contextLength: m.contextLength || 8192,
        maxTokens: m.maxTokens || 4096,
        description: m.description || `${this.registryEntry?.display?.name || this.providerInfo?.name || this.providerId} model: ${m.name || m.id}`,
        priceInput: 0,
        priceOutput: 0,
        quotaFamily: "free",
      }));
    }

    return [
      { id: "default", name: `${this.registryEntry?.display?.name || this.providerInfo?.name || this.providerId} Default`, capabilities: ["text"], params: ["temperature", "max_tokens"] },
    ];
  }

  getModelType() {
    const kinds = this.registryEntry?.serviceKinds || ["llm"];
    if (kinds.includes("image")) return "image";
    if (kinds.includes("embedding")) return "embedding";
    if (kinds.includes("tts")) return "tts";
    if (kinds.includes("stt")) return "stt";
    if (kinds.includes("search")) return "search";
    return "llm";
  }

  getDefaultModelId() {
    const models = this.registryEntry?.models;
    return models?.[0]?.id || "default";
  }

  async updateDatabase(models) {
    const customModels = await getCustomModels(this.providerId);
    const existingCustomIds = new Set(customModels.map((m) => m.id));
    const modelType = this.getModelType();

    for (const model of models) {
      const modelId = model.id;
      const modelName = model.name || model.id;

      await addCustomModel({
        providerAlias: this.providerId,
        id: modelId,
        name: modelName,
        type: modelType,
        description: model.description || `${this.providerInfo?.display?.name || this.providerId} model: ${modelName}`,
        contextLength: model.contextLength || 8192,
        maxTokens: model.maxTokens || 4096,
        priceInput: model.priceInput ?? 0,
        priceOutput: model.priceOutput ?? 0,
        capabilities: model.capabilities || ["text"],
        isDefault: modelId === this.getDefaultModelId(),
        upstreamModelId: modelId,
        rateMultiplier: 1.0,
        quotaFamily: "free",
        isVL: model.capabilities?.includes("vision") || false,
        isReasoning: model.capabilities?.includes("reasoning") || modelId.includes("reason") || false,
        maxOutputTokens: model.maxTokens || 4096,
      });

      existingCustomIds.delete(modelId);
    }

    for (const modelId of existingCustomIds) {
      await deleteCustomModel(this.providerId, modelId);
    }
  }
}
