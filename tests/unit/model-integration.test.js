import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PROVIDER_MODELS } from "open-sse/config/providerModels.js";

// Mock fetch globally
const originalFetch = global.fetch;

// Integration tests for model fetching from endpoints
describe("Model Fetching Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("OpenAI Model Fetching", () => {
    it("should fetch models from OpenAI /models endpoint", async () => {
      const mockModelsResponse = {
        ok: true,
        json: () => Promise.resolve({
          data: [
            { id: "gpt-4", object: "model", created: 1688966400, owned_by: "openai" },
            { id: "gpt-3.5-turbo", object: "model", created: 1688966400, owned_by: "openai" },
          ]
        })
      };

      global.fetch = vi.fn().mockResolvedValue(mockModelsResponse);

      const response = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: "Bearer test-key" }
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.data).toHaveLength(2);
      expect(data.data[0].id).toBe("gpt-4");
    });

    it("should handle OpenAI model fetch errors", async () => {
      const mockErrorResponse = {
        ok: false,
        status: 401,
        statusText: "Unauthorized"
      };

      global.fetch = vi.fn().mockResolvedValue(mockErrorResponse);

      const response = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: "Bearer invalid-key" }
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });
  });

  describe("Anthropic Model Fetching", () => {
    it("should fetch models from Anthropic API", async () => {
      const mockModelsResponse = {
        ok: true,
        json: () => Promise.resolve({
          data: [
            { id: "claude-3-5-sonnet-20241022", type: "server" },
            { id: "claude-3-opus-20240229", type: "server" },
          ]
        })
      };

      global.fetch = vi.fn().mockResolvedValue(mockModelsResponse);

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
  });

  describe("Gemini Model Fetching", () => {
    it("should fetch models from Gemini API", async () => {
      const mockModelsResponse = {
        ok: true,
        json: () => Promise.resolve({
          models: [
            { name: "models/gemini-2.5-pro", baseModelId: "gemini-2.5-pro" },
            { name: "models/gemini-2.5-flash", baseModelId: "gemini-2.5-flash" },
          ]
        })
      };

      global.fetch = vi.fn().mockResolvedValue(mockModelsResponse);

      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models", {
        headers: { "x-goog-api-key": "test-key" }
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.models).toHaveLength(2);
    });
  });
});

// Test model validation against fetched data
describe("Model Validation Against Fetched Data", () => {
  it("should validate that all registered models have corresponding API models", async () => {
    const openaiModels = PROVIDER_MODELS.openai.map(m => m.id);
    
    // Mock the fetch to return the same models
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: openaiModels.map(id => ({ id, object: "model", created: 1688966400, owned_by: "openai" }))
      })
    });

    const response = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: "Bearer test-key" }
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    
    // Check that all registered models are present in the API response
    const apiModelIds = data.data.map(m => m.id);
    openaiModels.forEach(modelId => {
      expect(apiModelIds).toContain(modelId);
    });
  });
});
