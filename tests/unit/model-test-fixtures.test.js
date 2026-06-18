import { describe, it, expect } from "vitest";
import { PROVIDER_MODELS } from "open-sse/config/providerModels.js";

// Test data fixtures for all providers and models
describe("Test Data Fixtures", () => {
  it("should have test data for all providers", () => {
    const providerIds = Object.keys(PROVIDER_MODELS);
    expect(providerIds).toHaveLength(93);
  });

  it("should have at least one model for each provider", () => {
    const providersWithoutModels = Object.entries(PROVIDER_MODELS)
      .filter(([_, models]) => models.length === 0)
      .map(([id]) => id);
    
    expect(providersWithoutModels).toHaveLength(0);
  });

  it("should have test data for common providers", () => {
    const commonProviders = ["openai", "anthropic", "gemini", "claude", "gpt-4", "gpt-3.5-turbo"];
    
    commonProviders.forEach(providerId => {
      expect(PROVIDER_MODELS[providerId], `Missing test data for ${providerId}`).toBeDefined();
    });
  });

  it("should have test data for embedding models", () => {
    const embeddingModels = Object.entries(PROVIDER_MODELS)
      .flatMap(([providerId, models]) => 
        models.filter(model => model.kind === "embedding" || model.type === "embedding")
          .map(model => ({ providerId, modelId: model.id, name: model.name }))
      );
    
    expect(embeddingModels).toHaveLength(20);
    expect(embeddingModels).toContainEqual(expect.objectContaining({ providerId: "openai", modelId: "text-embedding-3-large" }));
  });

  it("should have test data for LLM models", () => {
    const llmModels = Object.entries(PROVIDER_MODELS)
      .flatMap(([providerId, models]) => 
        models.filter(model => model.kind === "llm" || model.type === "llm")
          .map(model => ({ providerId, modelId: model.id, name: model.name }))
      );
    
    expect(llmModels).toHaveLength(120);
    expect(llmModels).toContainEqual(expect.objectContaining({ providerId: "openai", modelId: "gpt-5.4" }));
  });

  it("should have test data for TTS models", () => {
    const ttsModels = Object.entries(PROVIDER_MODELS)
      .flatMap(([providerId, models]) => 
        models.filter(model => model.kind === "tts" || model.type === "tts")
          .map(model => ({ providerId, modelId: model.id, name: model.name }))
      );
    
    expect(ttsModels).toHaveLength(15);
    expect(ttsModels).toContainEqual(expect.objectContaining({ providerId: "openai", modelId: "tts-1" }));
  });

  it("should have test data for STT models", () => {
    const sttModels = Object.entries(PROVIDER_MODELS)
      .flatMap(([providerId, models]) => 
        models.filter(model => model.kind === "stt" || model.type === "stt")
          .map(model => ({ providerId, modelId: model.id, name: model.name }))
      );
    
    expect(sttModels).toHaveLength(15);
    expect(sttModels).toContainEqual(expect.objectContaining({ providerId: "openai", modelId: "whisper-1" }));
  });

  it("should have test data for image models", () => {
    const imageModels = Object.entries(PROVIDER_MODELS)
      .flatMap(([providerId, models]) => 
        models.filter(model => model.kind === "image" || model.type === "image")
          .map(model => ({ providerId, modelId: model.id, name: model.name }))
      );
    
    expect(imageModels).toHaveLength(10);
    expect(imageModels).toContainEqual(expect.objectContaining({ providerId: "openai", modelId: "gpt-image-1" }));
  });

  it("should have test data for image-to-text models", () => {
    const imageToTextModels = Object.entries(PROVIDER_MODELS)
      .flatMap(([providerId, models]) => 
        models.filter(model => model.kind === "imageToText" || model.type === "imageToText")
          .map(model => ({ providerId, modelId: model.id, name: model.name }))
      );
    
    expect(imageToTextModels).toHaveLength(5);
    expect(imageToTextModels).toContainEqual(expect.objectContaining({ providerId: "openai", modelId: "dall-e-3" }));
  });
});

// Test specific provider model data
describe("Provider-Specific Test Data", () => {
  it("should have OpenAI model data", () => {
    const openaiModels = PROVIDER_MODELS.openai;
    expect(openaiModels).toHaveLength(20);
    expect(openaiModels[0].id).toBe("gpt-5.4");
    expect(openaiModels[0].name).toBe("GPT-5.4");
  });

  it("should have Anthropic model data", () => {
    const anthropicModels = PROVIDER_MODELS.anthropic;
    expect(anthropicModels).toHaveLength(3);
    expect(anthropicModels[0].id).toBe("claude-sonnet-4-20250514");
    expect(anthropicModels[0].name).toBe("Claude Sonnet 4");
  });

  it("should have Gemini model data", () => {
    const geminiModels = PROVIDER_MODELS.gemini;
    expect(geminiModels).toHaveLength(20);
    expect(geminiModels[0].id).toBe("gemini-3.1-pro-preview");
    expect(geminiModels[0].name).toBe("Gemini 3.1 Pro Preview");
  });

  it("should have Claude Web model data", () => {
    const claudeWebModels = PROVIDER_MODELS["claude-web"];
    expect(claudeWebModels).toHaveLength(3);
    expect(claudeWebModels[0].id).toBe("claude-3-5-sonnet-20241022");
    expect(claudeWebModels[0].name).toBe("Claude 3.5 Sonnet");
  });

  it("should have DeepSeek model data", () => {
    const deepseekModels = PROVIDER_MODELS.deepseek;
    expect(deepseekModels).toHaveLength(5);
    expect(deepseekModels[0].id).toBe("deepseek-chat");
    expect(deepseekModels[0].name).toBe("DeepSeek Chat");
  });
});

// Test model metadata consistency
describe("Model Metadata Consistency", () => {
  it("should have consistent model kinds across all providers", () => {
    const kindCounts = {};
    Object.values(PROVIDER_MODELS).forEach(models => {
      models.forEach(model => {
        if (model.kind) {
          kindCounts[model.kind] = (kindCounts[model.kind] || 0) + 1;
        }
      });
    });
    
    expect(kindCounts.llm).toBeGreaterThan(100);
    expect(kindCounts.embedding).toBeGreaterThanOrEqual(15);
    expect(kindCounts.tts).toBeGreaterThanOrEqual(10);
    expect(kindCounts.stt).toBeGreaterThanOrEqual(10);
    expect(kindCounts.image).toBeGreaterThanOrEqual(5);
    expect(kindCounts.imageToText).toBeGreaterThanOrEqual(5);
  });

  it("should have valid model parameters for all models", () => {
    const modelsWithParams = Object.values(PROVIDER_MODELS)
      .flatMap(models => models)
      .filter(model => model.params && Array.isArray(model.params));
    
    expect(modelsWithParams.length).toBeGreaterThanOrEqual(30);
  });

  it("should have quota family information for all models", () => {
    const modelsWithQuotaFamily = Object.values(PROVIDER_MODELS)
      .flatMap(models => models)
      .filter(model => model.quotaFamily);
    
    expect(modelsWithQuotaFamily.length).toBeGreaterThanOrEqual(80);
  });
});
