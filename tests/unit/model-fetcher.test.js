import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OpenAIModelFetcher } from '@/lib/modelFetchers/providers/openai';
import { AnthropicModelFetcher } from '@/lib/modelFetchers/providers/anthropic';
import { GeminiModelFetcher } from '@/lib/modelFetchers/providers/gemini';
import { ModelCache } from '@/lib/modelFetchers/cache';
import { RateLimiter } from '@/lib/modelFetchers/rateLimiter';
import { FetchError } from '@/lib/modelFetchers/errorHandler';

vi.mock('@/lib/localDb', () => ({
  getCustomModels: vi.fn(() => []),
  addCustomModel: vi.fn(),
  deleteCustomModel: vi.fn(),
  getSettings: vi.fn(() => ({ modelCacheMaxAge: 3600000 })),
}));

vi.mock('@/shared/constants/providers', () => ({
  getProviderByAlias: vi.fn((providerId) => {
    const providers = {
      openai: { id: 'openai', category: 'apikey' },
      anthropic: { id: 'anthropic', category: 'oauth' },
      gemini: { id: 'gemini', category: 'apikey' },
    };
    return providers[providerId] || null;
  }),
}));

vi.mock('@/lib/modelFetchers/errorHandler', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    fetchWithRetry: vi.fn((url, options) => {
      return Promise.resolve({\n        ok: true,\n        json: () => Promise.resolve({ data: [] }),\n      });\n    }),\n  };
});

describe('Model Fetcher System', () => {
  let cache, rateLimiter;

  beforeEach(() => {
    cache = new ModelCache();
    rateLimiter = new RateLimiter(10);
  });

  describe('BaseModelFetcher', () => {
    it('should fetch models successfully', async () => {
      const connection = {
        id: 'test-connection',
        provider: 'openai',
        providerSpecificData: { baseUrl: 'https://api.openai.com/v1' },
        apiKey: 'test-key',
      };

      const fetcher = new OpenAIModelFetcher('openai', connection);
      const result = await fetcher.fetchModels();

      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle fetch errors', async () => {
      const connection = {
        id: 'test-connection',
        provider: 'openai',
        providerSpecificData: { baseUrl: 'https://api.openai.com/v1' },
        apiKey: 'test-key',
      };

      vi.mocked(fetchWithRetry).mockRejectedValueOnce(new FetchError('Test error', 500));

      const fetcher = new OpenAIModelFetcher('openai', connection);
      const result = await fetcher.fetchAndUpdate();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Test error');
    });
  });

  describe('ModelCache', () => {
    it('should store and retrieve data', async () => {
      await cache.set('test-key', { data: 'test' }, 1000);
      const result = await cache.get('test-key');

      expect(result).toEqual({ data: 'test', timestamp: expect.any(Number), ttl: 1000 });
    });

    it('should expire data', async () => {
      await cache.set('test-key', { data: 'test' }, -1000);
      const result = await cache.get('test-key');

      expect(result).toBeNull();
    });

    it('should clear cache', async () => {
      await cache.set('key1', 'value1', 1000);
      await cache.set('key2', 'value2', 1000);
      await cache.clear();

      const result1 = await cache.get('key1');
      const result2 = await cache.get('key2');

      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });
  });

  describe('RateLimiter', () => {
    it('should allow requests within limit', async () => {
      for (let i = 0; i < 10; i++) {
        await rateLimiter.acquire();
      }
      expect(rateLimiter.requests.length).toBe(10);
    });

    it('should block requests beyond limit', async () => {
      for (let i = 0; i < 10; i++) {
        await rateLimiter.acquire();
      }

      const start = Date.now();
      await rateLimiter.acquire();
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(60000);
    });
  });

  describe('ErrorHandler', () => {
    it('should classify retryable errors', () => {
      const retryableError = new FetchError('Test error', 500);
      const nonRetryableError = new FetchError('Test error', 401);

      expect(retryableError.retryable).toBe(true);
      expect(nonRetryableError.retryable).toBe(false);
    });
  });
});
