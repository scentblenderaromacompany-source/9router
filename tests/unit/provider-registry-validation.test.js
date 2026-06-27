import { describe, it, expect, vi } from "vitest";
import REGISTRY from "open-sse/providers/registry/index.js";
import { PROVIDER_MODELS } from "open-sse/config/providerModels.js";

// Test that all provider registry files are properly structured
describe("Provider Registry Validation", () => {
  it("should have all required fields in each provider entry", () => {
    const requiredFields = ["id", "alias", "category", "display"];
    
    REGISTRY.forEach((provider, index) => {
      requiredFields.forEach(field => {
        expect(provider[field], `Provider ${index} (${provider.id}) should have ${field}`).toBeDefined();
      });
    });
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

  it("should have valid category values", () => {
    const validCategories = ["free", "freeTier", "apikey", "oauth", "webCookie"];
    REGISTRY.forEach(provider => {
      expect(validCategories).toContain(provider.category);
    });
  });

  it("should have valid display object structure", () => {
    REGISTRY.forEach(provider => {
      expect(provider.display.name).toBeDefined();
      expect(provider.display.icon).toBeDefined();
      expect(provider.display.color).toBeDefined();
      expect(provider.display.textIcon).toBeDefined();
      expect(provider.display.website).toBeDefined();
    });
  });
});

// Test model data completeness and validation
describe("Model Data Completeness", () => {
  it("should have models for all providers with model data", () => {
    const providersWithoutModels = REGISTRY.filter(p => !p.models || p.models.length === 0);
    expect(providersWithoutModels).toHaveLength(0);
  });

  it("should have unique model IDs within each provider", () => {
    REGISTRY.forEach(provider => {
      if (provider.models) {
        const modelIds = provider.models.map(m => m.id);
        const uniqueIds = new Set(modelIds);
        expect(modelIds.length).toBe(uniqueIds.size);
      }
    });
  });

  it("should have valid model structure", () => {
    REGISTRY.forEach(provider => {
      if (provider.models) {
        provider.models.forEach(model => {
          expect(model.id).toBeDefined();
          expect(model.name).toBeDefined();
          expect(typeof model.id).toBe("string");
          expect(typeof model.name).toBe("string");
        });
      }
    });
  });

  it("should have valid model kinds", () => {
    const validKinds = ["llm", "embedding", "tts", "stt", "image", "imageToText", "video", "music", "webSearch", "webFetch"];
    REGISTRY.forEach(provider => {
      if (provider.models) {
        provider.models.forEach(model => {
          if (model.kind) {
            expect(validKinds).toContain(model.kind);
          }
        });
      }
    });
  });

  it("should have valid model types", () => {
    const validTypes = ["llm", "embedding", "tts", "stt", "image", "imageToText", "video", "music", "webSearch", "webFetch"];
    REGISTRY.forEach(provider => {
      if (provider.models) {
        provider.models.forEach(model => {
          if (model.type) {
            expect(validTypes).toContain(model.type);
          }
        });
      }
    });
  });
});

// Test that all models are properly exported in PROVIDER_MODELS
describe("PROVIDER_MODELS Export Validation", () => {
  it("should have entries for all providers in PROVIDER_MODELS", () => {
    const providerIds = REGISTRY.map(p => p.id);
    const providerAliases = REGISTRY.map(p => p.alias);
    const allProviderKeys = [...providerIds, ...providerAliases];
    
    allProviderKeys.forEach(key => {
      expect(PROVIDER_MODELS[key], `PROVIDER_MODELS should have entry for ${key}`).toBeDefined();
      expect(Array.isArray(PROVIDER_MODELS[key])).toBe(true);
    });
  });

  it("should have models for all providers in PROVIDER_MODELS", () => {
    const providerIds = REGISTRY.map(p => p.id);
    const providerAliases = REGISTRY.map(p => p.alias);
    const allProviderKeys = [...providerIds, ...providerAliases];
    
    allProviderKeys.forEach(key => {
      const models = PROVIDER_MODELS[key];
      expect(models.length).toBeGreaterThan(0);
    });
  });
});

// Test model normalization
describe("Model Normalization", () => {
  import { normalizeModel } from "open-sse/providers/models/schema.js";

  it("should normalize string model IDs", () => {
    const normalized = normalizeModel("gpt-4");
    expect(normalized.id).toBe("gpt-4");
    expect(normalized.name).toBe("GPT-4");
  });

  it("should preserve model names when provided", () => {
    const normalized = normalizeModel({ id: "gpt-4", name: "GPT-4 Custom" });
    expect(normalized.id).toBe("gpt-4");
    expect(normalized.name).toBe("GPT-4 Custom");
  });
});
