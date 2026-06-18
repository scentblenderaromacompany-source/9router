import { describe, it, expect } from "vitest";
import { PROVIDER_MODELS } from "open-sse/config/providerModels.js";
import { isValidModel, getDefaultModel, findModelName } from "open-sse/config/providerModels.js";

// Test model data validation and completeness
describe("Model Data Validation", () => {
  it("should validate model existence for all providers", () => {
    const results = [];
    for (const [providerId, models] of Object.entries(PROVIDER_MODELS)) {
      if (models.length > 0) {
        const defaultModel = getDefaultModel(providerId);
        const isValid = isValidModel(providerId, defaultModel);
        results.push({ providerId, hasDefault: !!defaultModel, isValid: isValid });
      }
    }
    
    const allValid = results.every(r => r.isValid);
    expect(allValid).toBe(true);
  });

  it("should have valid model names for all providers", () => {
    const results = [];
    for (const [providerId, models] of Object.entries(PROVIDER_MODELS)) {
      models.forEach(model => {
        const foundName = findModelName(providerId, model.id);
        results.push({
          providerId,
          modelId: model.id,
          expectedName: model.name,
          foundName: foundName,
          matches: foundName === model.name
        });
      });
    }
    
    const allMatch = results.every(r => r.matches);
    expect(allMatch).toBe(true);
  });

  it("should have unique model IDs across all providers", () => {
    const allModelIds = [];
    for (const [providerId, models] of Object.entries(PROVIDER_MODELS)) {
      allModelIds.push(...models.map(m => m.id));
    }
    
    const uniqueIds = new Set(allModelIds);
    expect(allModelIds.length).toBe(uniqueIds.size);
  });

  it("should have valid model kinds across all providers", () => {
    const validKinds = ["llm", "embedding", "tts", "stt", "image", "imageToText", "video", "music", "webSearch", "webFetch"];
    const invalidModels = [];
    
    for (const [providerId, models] of Object.entries(PROVIDER_MODELS)) {
      models.forEach(model => {
        if (model.kind && !validKinds.includes(model.kind)) {
          invalidModels.push({ providerId, modelId: model.id, kind: model.kind });
        }
      });
    }
    
    expect(invalidModels).toHaveLength(0);
  });

  it("should have valid model types across all providers", () => {
    const validTypes = ["llm", "embedding", "tts", "stt", "image", "imageToText", "video", "music", "webSearch", "webFetch"];
    const invalidModels = [];
    
    for (const [providerId, models] of Object.entries(PROVIDER_MODELS)) {
      models.forEach(model => {
        if (model.type && !validTypes.includes(model.type)) {
          invalidModels.push({ providerId, modelId: model.id, type: model.type });
        }
      });
    }
    
    expect(invalidModels).toHaveLength(0);
  });

  it("should have valid quota families across all providers", () => {
    const validQuotaFamilies = ["normal", "free", "limited", "enterprise"];
    const invalidModels = [];
    
    for (const [providerId, models] of Object.entries(PROVIDER_MODELS)) {
      models.forEach(model => {
        if (model.quotaFamily && !validQuotaFamilies.includes(model.quotaFamily)) {
          invalidModels.push({ providerId, modelId: model.id, quotaFamily: model.quotaFamily });
        }
      });
    }
    
    expect(invalidModels).toHaveLength(0);
  });
});

// Test model parsing and validation functions
describe("Model Parsing and Validation", () => {
  it("should validate model existence correctly", () => {
    expect(isValidModel("openai", "gpt-4")).toBe(true);
    expect(isValidModel("openai", "non-existent-model")).toBe(false);
  });

  it("should handle passthrough providers", () => {
    expect(isValidModel("openai-compatible-custom", "any-model")).toBe(true);
  });

  it("should get default model correctly", () => {
    expect(getDefaultModel("openai")).toBe("gpt-5.4");
    expect(getDefaultModel("non-existent-provider")).toBeNull();
  });

  it("should find model name correctly", () => {
    expect(findModelName("openai", "gpt-4")).toBe("GPT-4");
    expect(findModelName("non-existent-provider", "some-model")).toBe("some-model");
  });
});

// Test model metadata completeness
describe("Model Metadata Completeness", () => {
  it("should have model kind for all models", () => {
    const modelsWithoutKind = [];
    for (const [providerId, models] of Object.entries(PROVIDER_MODELS)) {
      models.forEach(model => {
        if (!model.kind && !model.type) {
          modelsWithoutKind.push({ providerId, modelId: model.id });
        }
      });
    }
    
    expect(modelsWithoutKind).toHaveLength(0);
  });

  it("should have model names for all models", () => {
    const modelsWithoutName = [];
    for (const [providerId, models] of Object.entries(PROVIDER_MODELS)) {
      models.forEach(model => {
        if (!model.name) {
          modelsWithoutName.push({ providerId, modelId: model.id });
        }
      });
    }
    
    expect(modelsWithoutName).toHaveLength(0);
  });

  it("should have valid model parameters when specified", () => {
    const modelsWithInvalidParams = [];
    for (const [providerId, models] of Object.entries(PROVIDER_MODELS)) {
      models.forEach(model => {
        if (model.params) {
          if (!Array.isArray(model.params)) {
            modelsWithInvalidParams.push({ providerId, modelId: model.id, issue: "params not array" });
          }
        }
      });
    }
    
    expect(modelsWithInvalidParams).toHaveLength(0);
  });
});
