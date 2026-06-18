import { fetchWithRetry, fetchWithEnhancedRetry, FetchError, CircuitBreaker } from "./errorHandler.js";
import { RateLimiter } from "./rateLimiter.js";
import { ModelCache } from "./cache.js";
import { getProviderByAlias } from "../../shared/constants/providers.js";
import { MODEL_FETCHER_CONFIG } from "../../shared/constants/modelFetcherConfig.js";
import { getCustomModels, addCustomModel, deleteCustomModel } from "../localDb.js";

export class BaseModelFetcher {
  constructor(providerId, connection, config = {}) {
    this.providerId = providerId;
    this.connection = connection;
    this.config = {
      maxRetries: MODEL_FETCHER_CONFIG.RETRY_CONFIG.MAX_RETRIES,
      timeout: MODEL_FETCHER_CONFIG.RETRY_CONFIG.TIMEOUT,
      cacheTimeout: MODEL_FETCHER_CONFIG.CACHE_CONFIG.DEFAULT_TTL,
      rateLimit: MODEL_FETCHER_CONFIG.RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE,
      enableFallback: true,
      fallbackProvider: null,
      enableCircuitBreaker: true,
      circuitBreakerThreshold: 5,
      circuitBreakerTimeout: 60000,
      enableLogging: true,
      logLevel: "info",
      ...config,
    };
    this.cache = new ModelCache();
    this.rateLimiter = new RateLimiter(this.config.rateLimit, providerId);
    this.providerInfo = getProviderByAlias(providerId);
    this.circuitBreaker = this.config.enableCircuitBreaker
      ? new CircuitBreaker(this.config.circuitBreakerThreshold, this.config.circuitBreakerTimeout)
      : null;
    this.providerId = providerId;
    this.circuitBreaker.providerId = providerId;
  }

  async fetchModels() {
    const cacheKey = this.getCacheKey();
    const cached = await this.cache.get(cacheKey);
    if (cached && !this.shouldRefetch(cached)) {
      this.log("info", `Using cached models for ${this.providerId}`, { cacheKey });
      return cached.data;
    }

    this.log("info", `Fetching models for ${this.providerId}`, { cacheKey });

    try {
      await this.rateLimiter.acquire();
      const models = await this.fetchModelsFromProvider();
      await this.cache.set(cacheKey, models, this.config.cacheTimeout);
      this.log("info", `Successfully fetched ${models.length} models for ${this.providerId}`);
      return models;
    } catch (error) {
      this.log("error", `Failed to fetch models for ${this.providerId}: ${error.message}`, { error });
      await this.handleFetchError(error);
      throw error;
    }
  }

  async fetchModelsFromProvider() {
    if (this.circuitBreaker) {
      return this.circuitBreaker.execute(() => this.performFetch());
    }
    return this.performFetch();
  }

  async performFetch() {
    throw new Error("Subclasses must implement performFetch");
  }

  getCacheKey() {
    return `${this.providerId}:${this.connection.id}`;
  }

  shouldRefetch(cached) {
    return Date.now() - cached.timestamp > this.config.cacheTimeout;
  }

  async validateModels(models) {
    if (!Array.isArray(models)) {
      this.log("warn", `Invalid models format for ${this.providerId}: expected array, got ${typeof models}`);
      return [];
    }

    const validModels = models.filter((model) => model && model.id);
    if (validModels.length !== models.length) {
      this.log("warn", `Filtered out ${models.length - validModels.length} invalid models for ${this.providerId}`);
    }

    return validModels;
  }

  async enrichModelData(models) {
    return models.map((model) => ({
      id: model.id,
      name: model.name || model.id,
      provider: this.providerId,
      connectionId: this.connection.id,
      ...model,
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

  async fetchAndUpdate() {
    try {
      const models = await this.fetchModels();
      const enriched = await this.enrichModelData(models);
      await this.updateDatabase(enriched);
      return { success: true, models: enriched };
    } catch (error) {
      this.log("error", `Failed to fetch and update models for ${this.providerId}: ${error.message}`, { error });
      return { success: false, error: error.message };
    }
  }

  async handleFetchError(error) {
    if (!this.config.enableFallback || !this.config.fallbackProvider) {
      return;
    }

    this.log("info", `Attempting fallback to ${this.config.fallbackProvider} for ${this.providerId}`);

    try {
      const fallbackFetcher = new this.constructor(this.config.fallbackProvider, this.connection, this.config);
      const fallbackModels = await fallbackFetcher.fetchModels();
      this.log("info", `Fallback successful for ${this.providerId}: fetched ${fallbackModels.length} models`);
      return fallbackModels;
    } catch (fallbackError) {
      this.log("error", `Fallback failed for ${this.providerId}: ${fallbackError.message}`, { fallbackError });
    }
  }

  log(level, message, metadata = {}) {
    if (!this.config.enableLogging) return;

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      providerId: this.providerId,
      message,
      metadata,
    };

    switch (level) {
      case "error":
        console.error(JSON.stringify(logEntry));
        break;
      case "warn":
        console.warn(JSON.stringify(logEntry));
        break;
      case "info":
        if (this.config.logLevel === "info" || this.config.logLevel === "debug") {
          console.log(JSON.stringify(logEntry));
        }
        break;
      case "debug":
        if (this.config.logLevel === "debug") {
          console.log(JSON.stringify(logEntry));
        }
        break;
    }
  }
}
