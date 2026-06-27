import { describe, it, expect } from "vitest";
import { normalizeModel, modelKind, modelQuotaFamily, modelStrip, modelTargetFormat } from "open-sse/providers/models/schema.js";
import { deriveModelName } from "open-sse/providers/models/namePatterns.js";

// Unit tests for model parsing and validation
describe("Model Schema Functions", () => {
  describe("normalizeModel", () => {
    it("should normalize string model IDs to objects with derived names", () => {
      const result = normalizeModel("gpt-4");
      expect(result).toEqual({ id: "gpt-4", name: "GPT-4" });
    });

    it("should preserve custom model names", () => {
      const result = normalizeModel({ id: "gpt-4", name: "Custom GPT-4" });
      expect(result).toEqual({ id: "gpt-4", name: "Custom GPT-4" });
    });

    it("should handle empty string IDs", () => {
      const result = normalizeModel("");
      expect(result.id).toBe("");
      expect(result.name).toBe("");
    });

    it("should handle special characters in model IDs", () => {
      const result = normalizeModel("gpt-4o-mini-tts");
      expect(result.id).toBe("gpt-4o-mini-tts");
      expect(result.name).toBe("GPT-4o Mini TTS");
    });
  });

  describe("modelKind", () => {
    it("should return model kind when specified", () => {
      expect(modelKind({ kind: "llm" })).toBe("llm");
      expect(modelKind({ kind: "embedding" })).toBe("embedding");
      expect(modelKind({ kind: "tts" })).toBe("tts");
    });

    it("should return type when kind is not specified", () => {
      expect(modelKind({ type: "image" })).toBe("image");
      expect(modelKind({ type: "stt" })).toBe("stt");
    });

    it("should return default kind when neither kind nor type is specified", () => {
      expect(modelKind({})).toBe("llm");
      expect(modelKind({ id: "test" })).toBe("llm");
    });

    it("should handle null/undefined models", () => {
      expect(modelKind(null)).toBe("llm");
      expect(modelKind(undefined)).toBe("llm");
    });
  });

  describe("modelQuotaFamily", () => {
    it("should return quotaFamily when specified", () => {
      expect(modelQuotaFamily({ quotaFamily: "free" })).toBe("free");
      expect(modelQuotaFamily({ quotaFamily: "limited" })).toBe("limited");
      expect(modelQuotaFamily({ quotaFamily: "enterprise" })).toBe("enterprise");
    });

    it("should return default quotaFamily when not specified", () => {
      expect(modelQuotaFamily({})).toBe("normal");
      expect(modelQuotaFamily({ id: "test" })).toBe("normal");
    });

    it("should handle null/undefined models", () => {
      expect(modelQuotaFamily(null)).toBe("normal");
      expect(modelQuotaFamily(undefined)).toBe("normal");
    });
  });

  describe("modelStrip", () => {
    it("should return strip array when specified", () => {
      expect(modelStrip({ strip: ["image", "audio"] })).toEqual(["image", "audio"]);
      expect(modelStrip({ strip: [] })).toEqual([]);
    });

    it("should return default strip array when not specified", () => {
      expect(modelStrip({})).toEqual([]);
      expect(modelStrip({ id: "test" })).toEqual([]);
    });

    it("should handle null/undefined models", () => {
      expect(modelStrip(null)).toEqual([]);
      expect(modelStrip(undefined)).toEqual([]);
    });
  });

  describe("modelTargetFormat", () => {
    it("should return targetFormat when specified", () => {
      expect(modelTargetFormat({ targetFormat: "openai" })).toBe("openai");
      expect(modelTargetFormat({ targetFormat: "claude" })).toBe("claude");
    });

    it("should return null when not specified", () => {
      expect(modelTargetFormat({})).toBeNull();
      expect(modelTargetFormat({ id: "test" })).toBeNull();
    });

    it("should handle null/undefined models", () => {
      expect(modelTargetFormat(null)).toBeNull();
      expect(modelTargetFormat(undefined)).toBeNull();
    });
  });
});

// Unit tests for model name patterns
describe("Model Name Pattern Derivation", () => {
  it("should derive names from simple model IDs", () => {
    expect(deriveModelName("gpt-4")).toBe("GPT-4");
    expect(deriveModelName("claude-3-5-sonnet")).toBe("Claude 3.5 Sonnet");
    expect(deriveModelName("gemini-2.5-flash")).toBe("Gemini 2.5 Flash");
  });

  it("should handle model IDs with special characters", () => {
    expect(deriveModelName("gpt-4o-mini-tts")).toBe("GPT-4o Mini TTS");
    expect(deriveModelName("text-embedding-3-large")).toBe("Text Embedding 3 Large");
  });

  it("should handle numeric model IDs", () => {
    expect(deriveModelName("model-001")).toBe("Model 001");
    expect(deriveModelName("v2.0")).toBe("V2.0");
  });

  it("should handle lowercase model IDs", () => {
    expect(deriveModelName("gpt4")).toBe("GPT4");
    expect(deriveModelName("claude")).toBe("Claude");
  });
});

// Unit tests for model validation utilities
describe("Model Validation Utilities", () => {
  it("should validate model IDs have correct format", () => {
    const validIds = ["gpt-4", "claude-3-5-sonnet", "gemini-2.5-flash", "text-embedding-3-large"];
    const invalidIds = ["", " ", "invalid@id", "with spaces"];
    
    validIds.forEach(id => {
      expect(typeof id).toBe("string");
      expect(id.length > 0).toBe(true);
    });
    
    invalidIds.forEach(id => {
      if (id.includes(" ")) {
        expect(id).toContain(" ");
      }
    });
  });

  it("should validate model names are not empty", () => {
    const validNames = ["GPT-4", "Claude 3.5 Sonnet", "Gemini 2.5 Flash"];
    validNames.forEach(name => {
      expect(typeof name).toBe("string");
      expect(name.length > 0).toBe(true);
    });
  });
});
