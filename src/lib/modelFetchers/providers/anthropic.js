import { BaseModelFetcher } from "@/lib/modelFetchers/baseModelFetcher";
import { fetchWithEnhancedRetry } from "@/lib/modelFetchers/errorHandler";
import { getCustomModels, addCustomModel, deleteCustomModel } from "@/lib/localDb";

export class AnthropicModelFetcher extends BaseModelFetcher {
  constructor(providerId, connection, config = {}) {
    super(providerId, connection, config);
    this.baseUrl = connection.providerSpecificData?.baseUrl;
    this.apiKey = connection.apiKey;
    this.prefix = connection.providerSpecificData?.prefix;
  }

  async performFetch() {
    if (!this.baseUrl) {
      throw new Error("No base URL configured for Anthropic compatible provider");
    }

    const baseUrl = this.baseUrl.replace(/\/$/, "");
    if (baseUrl.endsWith("/messages")) {
      baseUrl = baseUrl.slice(0, -9);
    }

    const url = `${baseUrl}/models`;
    const response = await fetchWithEnhancedRetry(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "Authorization": `Bearer ${this.apiKey}`,
      },
      providerId: this.providerId,
    });

    const data = await response.json();
    const models = data.data || data.models || [];
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
        description: model.description || "",
        contextLength: model.context_length || model.contextLength || null,
        maxTokens: model.max_tokens || model.maxOutputTokens || null,
        priceInput: model.price_input || model.priceInput || null,
        priceOutput: model.price_output || model.priceOutput || null,
        capabilities: model.capabilities || null,
        isDefault: model.is_default || model.isDefault || false,
        upstreamModelId: model.upstream_model_id || model.upstreamModelId || null,
        rateMultiplier: model.rate_multiplier || model.rateMultiplier || 1.0,
        quotaFamily: model.quota_family || model.quotaFamily || null,
        isVL: model.is_vl || model.isVL || false,
        isReasoning: model.is_reasoning || model.isReasoning || false,
        maxOutputTokens: model.max_output_tokens || model.maxOutputTokens || null,
      });

      existingCustomIds.delete(modelId);
    }

    for (const modelId of existingCustomIds) {
      await deleteCustomModel(this.providerId, modelId);
    }
  }
}
