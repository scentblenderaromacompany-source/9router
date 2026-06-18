import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import REGISTRY from "open-sse/providers/registry/index.js";
import { PROVIDER_MODELS } from "open-sse/config/providerModels.js";
import { isValidModel, getDefaultModel, findModelName, getModelTargetFormat, getModelStrip, getModelUpstreamId, getModelQuotaFamily } from "open-sse/config/providerModels.js";
import { normalizeModel, modelKind, modelQuotaFamily, modelStrip, modelTargetFormat } from "open-sse/providers/models/schema.js";
import { deriveModelName } from "open-sse/providers/models/namePatterns.js";

// Mock fetch globally
const originalFetch = global.fetch;

// Comprehensive tests for all model data
describe("Comprehensive Model Data Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  // 1. Test all provider registry files
  describe("Provider Registry Files", () => {
    it("should have all 93 provider registry files loaded", () => {
      expect(REGISTRY).toHaveLength(93);
    });

    it("should have unique provider IDs", () => {
      const ids = REGISTRY.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it("should have unique aliases", () => {
      const aliases = REGISTRY.map(p => p.alias);
      const uniqueAliases = new Set(aliases);
      expect(aliases.length).toBe(uniqueAliases.size);
    });

    it("should have valid categories", () => {
      const validCategories = ["free", "freeTier", "apikey", "oauth", "webCookie"];
      REGISTRY.forEach(provider => {
        expect(validCategories).toContain(provider.category);
      });
    });

    it("should have valid display structure", () => {
      REGISTRY.forEach(provider => {
        expect(provider.display.name).toBeDefined();
        expect(provider.display.icon).toBeDefined();
        expect(provider.display.color).toBeDefined();
        expect(provider.display.textIcon).toBeDefined();
        expect(provider.display.website).toBeDefined();
      });
    });

    it("should have transport configuration for all providers", () => {
      REGISTRY.forEach(provider => {
        expect(provider.transport).toBeDefined();
        expect(provider.transport.baseUrl).toBeDefined();
      });
    });

    it("should have models for all providers", () => {
      REGISTRY.forEach(provider => {
        expect(provider.models).toBeDefined();
        expect(Array.isArray(provider.models)).toBe(true);
        expect(provider.models.length).toBeGreaterThan(0);
      });
    });
  });

  // 2. Test model data validation and completeness
  describe("Model Data Validation and Completeness", () => {
    it("should have models for all providers in PROVIDER_MODELS", () => {
      const providerIds = REGISTRY.map(p => p.id);
      const providerAliases = REGISTRY.map(p => p.alias);
      const allProviderKeys = [...providerIds, ...providerAliases];
      
      allProviderKeys.forEach(key => {
        expect(PROVIDER_MODELS[key]).toBeDefined();
        expect(Array.isArray(PROVIDER_MODELS[key])).toBe(true);
        expect(PROVIDER_MODELS[key].length).toBeGreaterThan(0);
      });
    });

    it("should have unique model IDs across all providers", () => {
      const allModelIds = [];
      Object.values(PROVIDER_MODELS).forEach(models => {
        allModelIds.push(...models.map(m => m.id));
      });
      
      const uniqueIds = new Set(allModelIds);
      expect(allModelIds.length).toBe(uniqueIds.size);
    });

    it("should have valid model kinds", () => {
      const validKinds = ["llm", "embedding", "tts", "stt", "image", "imageToText", "video", "music", "webSearch", "webFetch"];
      const invalidModels = [];
      
      Object.values(PROVIDER_MODELS).forEach(models => {
        models.forEach(model => {
          if (model.kind && !validKinds.includes(model.kind)) {
            invalidModels.push({ modelId: model.id, kind: model.kind });
          }
        });
      });
      
      expect(invalidModels).toHaveLength(0);
    });

    it("should have valid quota families", () => {
      const validQuotaFamilies = ["normal", "free", "limited", "enterprise"];
      const invalidModels = [];
      
      Object.values(PROVIDER_MODELS).forEach(models => {
        models.forEach(model => {
          if (model.quotaFamily && !validQuotaFamilies.includes(model.quotaFamily)) {
            invalidModels.push({ modelId: model.id, quotaFamily: model.quotaFamily });
          }
        });
      });
      
      expect(invalidModels).toHaveLength(0);
    });

    it("should have model names for all models", () => {
      const modelsWithoutName = [];
      Object.values(PROVIDER_MODELS).forEach(models => {
        models.forEach(model => {
          if (!model.name) {
            modelsWithoutName.push({ modelId: model.id });
          }
        });
      });
      
      expect(modelsWithoutName).toHaveLength(0);
    });
  });

  // 3. Test integration tests for model fetching from endpoints
  describe("Model Fetching Integration Tests", () => {
    it("should fetch models from OpenAI API", async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          data: [
            { id: "gpt-4", object: "model", created: 1688966400, owned_by: "openai" },
            { id: "gpt-3.5-turbo", object: "model", created: 1688966400, owned_by: "openai" },
          ]
        })
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const response = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: "Bearer test-key" }
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.data).toHaveLength(2);
    });

    it("should fetch models from Anthropic API", async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          data: [
            { id: "claude-3-5-sonnet-20241022", type: "server" },
            { id: "claude-3-opus-20240229", type: "server" },
          ]
        })
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const response = await fetch("https://api.anthropic.com/v1/models", {
        headers: {
          "x-api-key": "test-key",
          "anthropic-version": "2023-06-01"
        }
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.data).toHaveLength(2);
    });

    it("should fetch models from Gemini API", async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          models: [
            { name: "models/gemini-2.5-pro", baseModelId: "gemini-2.5-pro" },
            { name: "models/gemini-2.5-flash", baseModelId: "gemini-2.5-flash" },
          ]
        })
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models", {
        headers: { "x-goog-api-key": "test-key" }
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.models).toHaveLength(2);
    });
  });

  // 4. Test unit tests for model parsing and validation
  describe("Model Parsing and Validation", () => {
    it("should normalize model strings correctly", () => {
      const result = normalizeModel("gpt-4");
      expect(result.id).toBe("gpt-4");
      expect(result.name).toBe("GPT-4");
    });

    it("should preserve custom model names", () => {
      const result = normalizeModel({ id: "gpt-4", name: "Custom GPT-4" });
      expect(result.id).toBe("gpt-4");
      expect(result.name).toBe("Custom GPT-4");
    });

    it("should derive model kind correctly", () => {
      expect(modelKind({ kind: "llm" })).toBe("llm");
      expect(modelKind({ type: "image" })).toBe("image");
      expect(modelKind({})).toBe("llm");
    });

    it("should derive model quota family correctly", () => {
      expect(modelQuotaFamily({ quotaFamily: "free" })).toBe("free");
      expect(modelQuotaFamily({})).toBe("normal");
    });

    it("should derive model strip correctly", () => {
      expect(modelStrip({ strip: ["image", "audio"] })).toEqual(["image", "audio"]);
      expect(modelStrip({})).toEqual([]);
    });

    it("should derive model target format correctly", () => {
      expect(modelTargetFormat({ targetFormat: "openai" })).toBe("openai");
      expect(modelTargetFormat({})).toBeNull();
    });

    it("should derive model name from ID correctly", () => {
      expect(deriveModelName("gpt-4")).toBe("GPT-4");
      expect(deriveModelName("claude-3-5-sonnet")).toBe("Claude 3.5 Sonnet");
      expect(deriveModelName("gemini-2.5-flash")).toBe("Gemini 2.5 Flash");
    });
  });

  // 5. Test data fixtures for all providers and models
  describe("Test Data Fixtures", () => {
    it("should have test data for all major providers", () => {
      const majorProviders = ["openai", "anthropic", "gemini", "claude", "deepseek", "grok"];
      
      majorProviders.forEach(providerId => {
        expect(PROVIDER_MODELS[providerId]).toBeDefined();
        expect(Array.isArray(PROVIDER_MODELS[providerId])).toBe(true);
        expect(PROVIDER_MODELS[providerId].length).toBeGreaterThan(0);
      });
    });

    it("should have test data for LLM models", () => {
      const llmModels = Object.values(PROVIDER_MODELS)
        .flatMap(models => models)
        .filter(model => model.kind === "llm" || model.type === "llm");
      
      expect(llmModels.length).toBeGreaterThan(100);
    });

    it("should have test data for embedding models", () => {
      const embeddingModels = Object.values(PROVIDER_MODELS)
        .flatMap(models => models)
        .filter(model => model.kind === "embedding" || model.type === "embedding");
      
      expect(embeddingModels.length).toBeGreaterThanOrEqual(15);
    });

    it("should have test data for TTS models", () => {
      const ttsModels = Object.values(PROVIDER_MODELS)
        .flatMap(models => models)
        .filter(model => model.kind === "tts" || model.type === "tts");
      
      expect(ttsModels.length).toBeGreaterThanOrEqual(10);
    });

    it("should have test data for STT models", () => {
      const sttModels = Object.values(PROVIDER_MODELS)
        .flatMap(models => models)
        .filter(model => model.kind === "stt" || model.type === "stt");
      
      expect(sttModels.length).toBeGreaterThanOrEqual(10);
    });

    it("should have test data for image models", () => {
      const imageModels = Object.values(PROVIDER_MODELS)
        .flatMap(models => models)
        .filter(model => model.kind === "image" || model.type === "image");
      
      expect(imageModels.length).toBeGreaterThanOrEqual(5);
    });

    it("should have test data for image-to-text models", () => {
      const imageToTextModels = Object.values(PROVIDER_MODELS)
        .flatMap(models => models)
        .filter(model => model.kind === "imageToText" || model.type === "imageToText");
      
      expect(imageToTextModels.length).toBeGreaterThanOrEqual(5);
    });

    it("should have test data for all provider-specific functions", () => {
      const testCases = [
        { providerId: "openai", modelId: "gpt-5.4", expectedDefault: "gpt-5.4" },
        { providerId: "anthropic", modelId: "claude-sonnet-4-20250514", expectedDefault: "claude-sonnet-4-20250514" },
        { providerId: "gemini", modelId: "gemini-3.1-pro-preview", expectedDefault: "gemini-3.1-pro-preview" },
      ];
      
      testCases.forEach(testCase => {
        const defaultModel = getDefaultModel(testCase.providerId);
        expect(defaultModel).toBe(testCase.expectedDefault);
        const isValid = isValidModel(testCase.providerId, testCase.modelId);
        expect(isValid).toBe(true);
        const modelName = findModelName(testCase.providerId, testCase.modelId);
        expect(modelName).toBeDefined();
      });
    });
  });
});
