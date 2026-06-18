import { getSettings } from "../localDb.js";

export class ModelCache {
  constructor() {
    this.memoryCache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      errors: 0,
    };
  }

  async get(key) {
    const cacheEntry = this.memoryCache.get(key);
    if (!cacheEntry) {
      this.stats.misses++;
      return null;
    }

    const settings = await getSettings();
    const maxAge = settings?.modelCacheMaxAge || 3600000;

    if (Date.now() - cacheEntry.timestamp > maxAge) {
      this.memoryCache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Check TTL if specified
    if (cacheEntry.ttl && Date.now() - cacheEntry.timestamp > cacheEntry.ttl) {
      this.memoryCache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return cacheEntry;
  }

  async set(key, data, ttl) {
    try {
      this.memoryCache.set(key, {
        data,
        timestamp: Date.now(),
        ttl,
      });
      this.stats.sets++;
    } catch (error) {
      this.stats.errors++;
      console.error(`Failed to cache data for key ${key}: ${error.message}`);
    }
  }

  async clear() {
    this.memoryCache.clear();
  }

  async getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100
      : 0;

    return {
      size: this.memoryCache.size,
      keys: Array.from(this.memoryCache.keys()),
      stats: {
        ...this.stats,
        hitRate: Math.round(hitRate * 100) / 100,
      },
    };
  }

  async warmup(providerId, fetcher) {
    try {
      console.log(`Warming up cache for provider ${providerId}`);
      const models = await fetcher.fetchModels();
      await this.set(`${providerId}:warmup`, models, 300000); // 5 minutes
      console.log(`Cache warmup completed for provider ${providerId}`);
    } catch (error) {
      console.error(`Cache warmup failed for provider ${providerId}: ${error.message}`);
    }
  }
}
