import { BaseModelFetcher } from "../baseModelFetcher.js";
import { fetchWithEnhancedRetry } from "../errorHandler.js";
import { getCustomModels, addCustomModel, deleteCustomModel } from "../../localDb.js";

export class GeminiModelFetcher extends BaseModelFetcher {
  constructor(providerId, connection, config = {}) {
    super(providerId, connection, config);
    this.baseUrl = connection.providerSpecificData?.baseUrl;
    this.apiKey = connection.apiKey;
    this.prefix = connection.providerSpecificData?.prefix;
  }

  async performFetch() {
    const url = "https://generativelanguage.googleapis.com/v1beta/models";
    const response = await fetchWithEnhancedRetry(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      authQuery: "key",
      authValue: this.apiKey,
      providerId: this.providerId,
    });

    const data = await response.json();
    const models = data.models || [];
    return models.map((model) => ({
      id: model.name.replace(/^models\//, ""),
      name: model.displayName || model.name,
      description: model.description || "",
      inputTokenLimit: model.inputTokenLimit,
      outputTokenLimit: model.outputTokenLimit,
      supportedGenerationMethods: model.supportedGenerationMethods,
      version: model.version,
      launchDate: model.launchDate,
      architecture: model.architecture,
      tokenization: model.tokenization,
    }));
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
        contextLength: model.inputTokenLimit || null,
        maxTokens: model.outputTokenLimit || null,
        capabilities: {
          supportedMethods: model.supportedGenerationMethods || [],
          architecture: model.architecture,
          tokenization: model.tokenization,
        },
        version: model.version,
        launchDate: model.launchDate,
      });

      existingCustomIds.delete(modelId);
    }

    for (const modelId of existingCustomIds) {
      await deleteCustomModel(this.providerId, modelId);
    }
  }
}
