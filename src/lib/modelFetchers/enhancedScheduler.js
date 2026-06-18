import { ModelFetcherScheduler } from "./scheduler.js";
import { getProviderConnections } from "../../localDb.js";
import { getProviderByAlias } from "../../shared/constants/providers.js";
import { OpenAIModelFetcher } from "./providers/openai.js";
import { AnthropicModelFetcher } from "./providers/anthropic.js";
import { GeminiModelFetcher } from "./providers/gemini.js";
import { ClaudeModelFetcher } from "./providers/claude.js";
import { CohereModelFetcher } from "./providers/cohere.js";
import { WebUIModelFetcher } from "./providers/webui.js";
import { DeepseekWebModelFetcher } from "./providers/deepseek-web.js";
import { KimiWebModelFetcher } from "./providers/kimi-web.js";
import { ZAiWebModelFetcher } from "./providers/z-ai-web.js";
import { ChatgptWebModelFetcher } from "./providers/chatgpt-web.js";
import { GrokWebModelFetcher } from "./providers/grok-web.js";
import { MinimaxWebModelFetcher } from "./providers/minimax-web.js";
import { PerplexityWebModelFetcher } from "./providers/perplexity-web.js";
import { ClaudeWebModelFetcher } from "./providers/claude-web.js";
import { GeminiWebModelFetcher } from "./providers/gemini-web.js";
import { BaseModelFetcher } from "./baseModelFetcher.js";
import { MODEL_FETCHER_CONFIG } from "../../shared/constants/modelFetcherConfig.js";
import { getCustomModels } from "../../localDb.js";

export class EnhancedModelFetcherScheduler {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.fetchers = this.initializeFetchers();
    this.stats = {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      lastRunTime: null,
      averageRunTime: 0,
      providerStats: {},
    };
  }

  initializeFetchers() {
    const fetchers = {};

    for (const providerId of Object.keys(getProviderByAlias({}))) {
      const providerInfo = getProviderByAlias(providerId);
      if (!providerInfo) continue;

      const fetcherClass = this.getFetcherClass(providerId);
      if (fetcherClass) {
        fetchers[providerId] = fetcherClass;
        this.stats.providerStats[providerId] = {
          total: 0,
          successful: 0,
          failed: 0,
          lastRun: null,
          averageRunTime: 0,
        };
      }
    }

    return fetchers;
  }

  getFetcherClass(providerId) {
    const providerInfo = getProviderByAlias(providerId);
    if (!providerInfo) return null;

    const providerType = providerInfo.category;

    const WEBUI_FETCHER_MAP = {
      "deepseek-web": DeepseekWebModelFetcher,
      "kimi-web": KimiWebModelFetcher,
      "z-ai-web": ZAiWebModelFetcher,
      "chatgpt-web": ChatgptWebModelFetcher,
      "grok-web": GrokWebModelFetcher,
      "minimax-web": MinimaxWebModelFetcher,
      "perplexity-web": PerplexityWebModelFetcher,
      "claude-web": ClaudeWebModelFetcher,
      "gemini-web": GeminiWebModelFetcher,
    };

    switch (providerType) {
      case "freeTier":
      case "apikey":
        return OpenAIModelFetcher;
      case "oauth":
        return AnthropicModelFetcher;
      case "gemini":
        return GeminiModelFetcher;
      case "claude":
        return ClaudeModelFetcher;
      case "cohere":
        return CohereModelFetcher;
      case "webCookie":
      case "free":
        return WEBUI_FETCHER_MAP[providerId] || WebUIModelFetcher;
      default:
        return OpenAIModelFetcher;
    }
  }

  async run() {
    if (this.isRunning) {
      console.log("Enhanced model fetcher scheduler is already running");
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();
    console.log("Starting enhanced model fetcher scheduler run");

    try {
      const connections = await getProviderConnections();
      const activeConnections = connections.filter((c) => c.isActive);

      const results = await Promise.allSettled(
        activeConnections.map(async (connection) => {
          const providerId = connection.provider;
          const fetcherClass = this.fetchers[providerId];
          if (!fetcherClass) {
            console.log(`No fetcher found for provider: ${providerId}`);
            return { provider: providerId, success: false, error: "No fetcher found" };
          }

          const fetcher = new fetcherClass(providerId, connection);
          return fetcher.fetchAndUpdate();
        })
      );

      const summary = {
        total: results.length,
        successful: results.filter((r) => r.status === "fulfilled" && r.value.success).length,
        failed: results.filter((r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success)).length,
        details: results.map((r) => {
          if (r.status === "fulfilled") return r.value;
          return { provider: "unknown", success: false, error: r.reason.message };
        }),
      };

      this.updateStats(summary, startTime);
      console.log("Enhanced model fetcher scheduler completed:", summary);
      return summary;
    } catch (error) {
      console.error("Enhanced model fetcher scheduler failed:", error);
      this.stats.failedRuns++;
      throw error;
    } finally {
      this.isRunning = false;
      this.stats.lastRunTime = Date.now();
    }
  }

  updateStats(summary, startTime) {
    this.stats.totalRuns++;
    if (summary.successful > 0) {
      this.stats.successfulRuns++;
    } else {
      this.stats.failedRuns++;
    }

    const duration = Date.now() - startTime;
    const totalRuns = this.stats.totalRuns;
    this.stats.averageRunTime = (this.stats.averageRunTime * (totalRuns - 1) + duration) / totalRuns;

    // Update provider-specific stats
    summary.details.forEach((detail) => {
      if (detail.provider && this.stats.providerStats[detail.provider]) {
        const providerStat = this.stats.providerStats[detail.provider];
        providerStat.total++;
        if (detail.success) {
          providerStat.successful++;
        } else {
          providerStat.failed++;
        }
        providerStat.lastRun = Date.now();
        providerStat.averageRunTime = (providerStat.averageRunTime * (providerStat.total - 1) + duration) / providerStat.total;
      }
    });

    console.log(`Enhanced scheduler stats - Total: ${this.stats.totalRuns}, Successful: ${this.stats.successfulRuns}, Failed: ${this.stats.failedRuns}, Avg Duration: ${Math.round(this.stats.averageRunTime)}ms`);
  }

  async start() {
    const settings = await getSettings();
    const interval = settings?.modelFetchInterval || MODEL_FETCHER_CONFIG.SCHEDULER_CONFIG.DEFAULT_INTERVAL;

    await this.run();

    this.intervalId = setInterval(async () => {
      try {
        await this.run();
      } catch (error) {
        console.error("Scheduled enhanced model fetch failed:", error);
      }
    }, interval);

    console.log(`Enhanced model fetcher scheduler started with interval: ${interval}ms`);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log("Enhanced model fetcher scheduler stopped");
  }

  isSchedulerRunning() {
    return this.isRunning || this.intervalId !== null;
  }

  async getStats() {
    const cacheStats = await this.fetchers["openai"]?.cache?.getStats() || null;
    const connections = await getProviderConnections();
    const customModels = await getCustomModels();

    return {
      scheduler: {
        ...this.stats,
        isRunning: this.isSchedulerRunning(),
      },
      cache: cacheStats,
      connections: {
        total: connections.length,
        active: connections.filter((c) => c.isActive).length,
      },
      customModels: {
        total: customModels.length,
        byProvider: customModels.reduce((acc, model) => {
          acc[model.providerAlias] = (acc[model.providerAlias] || 0) + 1;
          return acc;
        }, {}),
      },
    };
  }
}
