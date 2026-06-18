import { MODEL_FETCHER_CONFIG } from "../../shared/constants/modelFetcherConfig.js";
const { RATE_LIMIT_CONFIG } = MODEL_FETCHER_CONFIG;

export class RateLimiter {
  constructor(maxRequests = RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE, providerId = null) {
    this.maxRequests = maxRequests;
    this.requests = [];
    this.providerId = providerId;
    this.lastRequestTime = 0;
    this.minRequestInterval = 1000; // Minimum 1 second between requests
  }

  async acquire() {
    const now = Date.now();
    this.requests = this.requests.filter((time) => now - time < 60000);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = 60000 - (now - oldestRequest);
      console.log(`Rate limit reached for ${this.providerId || "unknown"}. Waiting ${waitTime}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return this.acquire();
    }

    // Respect minimum request interval
    if (now - this.lastRequestTime < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - (now - this.lastRequestTime);
      console.log(`Minimum request interval for ${this.providerId || "unknown"}. Waiting ${waitTime}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.requests.push(now);
    this.lastRequestTime = Date.now();
  }

  async waitForSlot() {
    return this.acquire();
  }

  async acquireWithBackoff(baseDelay = 1000) {
    try {
      await this.acquire();
    } catch (error) {
      console.log(`Rate limiter error for ${this.providerId || "unknown"}: ${error.message}`);
      throw error;
    }
  }
}
