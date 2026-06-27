/**
 * Context Manager - Manages conversation context with multiple strategies.
 *
 * Strategies:
 *   1. Sliding Window  – Keep most recent N messages, always preserve system messages
 *   2. Token Limit     – Truncate history by estimated token count, preserve system messages
 *   3. Summary Compression – Summarize early conversation via LLM, keep summary + recent messages
 *
 * Ported from Chat2API contextManagementService.ts
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Estimate token count for a string or multipart content array.
 * Approximation: 1 token ~ 3 characters.
 * @param {string|Array<{type:string,text?:string}>|null|undefined} content
 * @returns {number}
 */
function estimateTokens(content) {
  if (content === null || content === undefined) return 0;

  if (typeof content === "string") {
    return Math.ceil(content.length / 3);
  }

  if (Array.isArray(content)) {
    return content.reduce((total, part) => {
      if (part.type === "text" && part.text) {
        return total + Math.ceil(part.text.length / 3);
      }
      return total;
    }, 0);
  }

  return 0;
}

/**
 * Extract the textual content of a message.
 * @param {{role:string,content:string|Array}} message
 * @returns {string}
 */
function getMessageContent(message) {
  if (typeof message.content === "string") return message.content;
  if (Array.isArray(message.content)) {
    return message.content
      .filter((part) => part.type === "text" && part.text)
      .map((part) => part.text)
      .join("\n");
  }
  return "";
}

// ---------------------------------------------------------------------------
// Default configurations
// ---------------------------------------------------------------------------

/** @type {import("./types.js").SlidingWindowConfig} */
const DEFAULT_SLIDING_WINDOW = { enabled: true, maxMessages: 20 };

/** @type {import("./types.js").TokenLimitConfig} */
const DEFAULT_TOKEN_LIMIT = { enabled: false, maxTokens: 4000 };

/** @type {import("./types.js").SummaryConfig} */
const DEFAULT_SUMMARY = {
  enabled: false,
  keepRecentMessages: 20,
  summaryPrompt:
    "Please summarize the following conversation concisely, keeping key information and context:",
};

/** @type {import("./types.js").ContextManagementConfig} */
const DEFAULT_CONTEXT_MANAGEMENT = {
  enabled: false,
  strategies: {
    slidingWindow: DEFAULT_SLIDING_WINDOW,
    tokenLimit: DEFAULT_TOKEN_LIMIT,
    summary: DEFAULT_SUMMARY,
  },
  executionOrder: ["slidingWindow", "tokenLimit", "summary"],
};

// ---------------------------------------------------------------------------
// Strategy helpers (private)
// ---------------------------------------------------------------------------

/**
 * Sliding Window strategy – keep the most recent N messages, always
 * preserving system messages.
 * @param {Array} messages
 * @param {{enabled:boolean,maxMessages:number}} config
 * @returns {{messages:Array,originalCount:number,processedCount:number,strategyName:string,trimmed:boolean}}
 */
function slidingWindow(messages, config) {
  const originalCount = messages.length;
  const cfg = { ...DEFAULT_SLIDING_WINDOW, ...config };

  if (!cfg.enabled || originalCount <= cfg.maxMessages) {
    return {
      messages,
      originalCount,
      processedCount: originalCount,
      strategyName: "slidingWindow",
      trimmed: false,
    };
  }

  const systemMessages = messages.filter((m) => m.role === "system");
  const nonSystem = messages.filter((m) => m.role !== "system");
  const maxNon = cfg.maxMessages - systemMessages.length;
  const kept = nonSystem.slice(-maxNon);
  const result = [...systemMessages, ...kept];

  console.log(
    `[ContextManager:slidingWindow] Trimmed ${originalCount} -> ${result.length} ` +
      `(system=${systemMessages.length}, nonSystem=${kept.length})`
  );

  return {
    messages: result,
    originalCount,
    processedCount: result.length,
    strategyName: "slidingWindow",
    trimmed: result.length < originalCount,
  };
}

/**
 * Token Limit strategy – truncate history by estimated token count, always
 * preserving system messages.
 * @param {Array} messages
 * @param {{enabled:boolean,maxTokens:number}} config
 * @returns {{messages:Array,originalCount:number,processedCount:number,strategyName:string,trimmed:boolean}}
 */
function tokenLimit(messages, config) {
  const originalCount = messages.length;
  const cfg = { ...DEFAULT_TOKEN_LIMIT, ...config };

  if (!cfg.enabled) {
    return {
      messages,
      originalCount,
      processedCount: originalCount,
      strategyName: "tokenLimit",
      trimmed: false,
    };
  }

  const systemMessages = messages.filter((m) => m.role === "system");
  const nonSystem = messages.filter((m) => m.role !== "system");

  const systemTokens = systemMessages.reduce(
    (sum, m) => sum + estimateTokens(m.content),
    0
  );

  const available = cfg.maxTokens - systemTokens;

  if (available <= 0) {
    console.warn(
      `[ContextManager:tokenLimit] System messages exceed limit (${systemTokens} > ${cfg.maxTokens})`
    );
    return {
      messages: systemMessages,
      originalCount,
      processedCount: systemMessages.length,
      strategyName: "tokenLimit",
      trimmed: true,
    };
  }

  const kept = [];
  let used = 0;
  for (let i = nonSystem.length - 1; i >= 0; i--) {
    const tokens = estimateTokens(nonSystem[i].content);
    if (used + tokens <= available) {
      kept.unshift(nonSystem[i]);
      used += tokens;
    } else {
      break;
    }
  }

  const result = [...systemMessages, ...kept];

  console.log(
    `[ContextManager:tokenLimit] Trimmed ${originalCount} -> ${result.length} ` +
      `(tokens=${systemTokens + used}/${cfg.maxTokens})`
  );

  return {
    messages: result,
    originalCount,
    processedCount: result.length,
    strategyName: "tokenLimit",
    trimmed: result.length < originalCount,
  };
}

/**
 * Summary Compression strategy – summarize early messages via an LLM
 * callback, keep summary + recent messages.
 * @param {Array} messages
 * @param {{enabled:boolean,keepRecentMessages:number,summaryPrompt?:string}} config
 * @param {function} providerCallback - async (messages, prompt?) => summaryText
 * @returns {Promise<{messages:Array,originalCount:number,processedCount:number,strategyName:string,trimmed:boolean}>}
 */
async function summarize(messages, config, providerCallback) {
  const originalCount = messages.length;
  const cfg = { ...DEFAULT_SUMMARY, ...config };

  if (!cfg.enabled) {
    return {
      messages,
      originalCount,
      processedCount: originalCount,
      strategyName: "summary",
      trimmed: false,
    };
  }

  if (originalCount <= cfg.keepRecentMessages) {
    return {
      messages,
      originalCount,
      processedCount: originalCount,
      strategyName: "summary",
      trimmed: false,
    };
  }

  if (!providerCallback) {
    console.warn(
      "[ContextManager:summary] No provider callback, falling back to sliding window"
    );
    const fallback = messages.slice(-cfg.keepRecentMessages);
    return {
      messages: fallback,
      originalCount,
      processedCount: fallback.length,
      strategyName: "summary",
      trimmed: true,
    };
  }

  const systemMessages = messages.filter((m) => m.role === "system");
  const nonSystem = messages.filter((m) => m.role !== "system");

  const recent = nonSystem.slice(-cfg.keepRecentMessages);
  const old = nonSystem.slice(0, -cfg.keepRecentMessages);

  if (old.length === 0) {
    return {
      messages,
      originalCount,
      processedCount: originalCount,
      strategyName: "summary",
      trimmed: false,
    };
  }

  try {
    console.log(
      `[ContextManager:summary] Summarizing ${old.length} old messages`
    );

    const summary = await providerCallback(old, cfg.summaryPrompt);
    const summaryMsg = {
      role: "system",
      content: `[Conversation Summary]\n${summary}`,
    };

    const result = [...systemMessages, summaryMsg, ...recent];

    console.log(
      `[ContextManager:summary] Compressed ${originalCount} -> ${result.length} ` +
        `(summarized ${old.length} messages)`
    );

    return {
      messages: result,
      originalCount,
      processedCount: result.length,
      strategyName: "summary",
      trimmed: true,
    };
  } catch (err) {
    console.error("[ContextManager:summary] Failed to generate summary:", err);
    const fallback = [...systemMessages, ...recent];
    return {
      messages: fallback,
      originalCount,
      processedCount: fallback.length,
      strategyName: "summary",
      trimmed: true,
    };
  }
}

// ---------------------------------------------------------------------------
// ContextManager class
// ---------------------------------------------------------------------------

/**
 * Orchestrates multiple context-management strategies in a configurable order.
 */
export class ContextManager {
  /**
   * @param {object} [config]
   * @param {number}  [config.maxMessages=20]        - Sliding window size
   * @param {number}  [config.maxTokens=4000]         - Token limit
   * @param {number}  [config.keepRecentMessages=20]  - Messages kept after summarization
   * @param {string[]} [config.executionOrder]        - Strategy run order
   * @param {string}  [config.summaryPrompt]          - Custom prompt for summarization
   * @param {boolean} [config.enabled=false]          - Master enable switch
   */
  constructor(config = {}) {
    this.config = {
      enabled: config.enabled ?? false,
      strategies: {
        slidingWindow: {
          enabled: config.enabled ?? false,
          maxMessages: config.maxMessages ?? DEFAULT_SLIDING_WINDOW.maxMessages,
        },
        tokenLimit: {
          enabled: config.enabled ?? false,
          maxTokens: config.maxTokens ?? DEFAULT_TOKEN_LIMIT.maxTokens,
        },
        summary: {
          enabled: config.enabled ?? false,
          keepRecentMessages:
            config.keepRecentMessages ?? DEFAULT_SUMMARY.keepRecentMessages,
          summaryPrompt:
            config.summaryPrompt ?? DEFAULT_SUMMARY.summaryPrompt,
        },
      },
      executionOrder:
        config.executionOrder ?? DEFAULT_CONTEXT_MANAGEMENT.executionOrder,
    };
  }

  /**
   * Run the full context-management pipeline.
   *
   * @param {Array} messages - Array of chat messages ({role, content})
   * @param {function} [providerCallback] - async (msgs, prompt?) => summaryText
   * @returns {Promise<{messages:Array, originalCount:number, finalCount:number, strategyResults:Array, summaryGenerated:boolean}>}
   */
  async manageContext(messages, providerCallback) {
    const originalCount = messages.length;
    const strategyResults = [];

    if (!this.config.enabled) {
      return {
        messages,
        originalCount,
        finalCount: originalCount,
        strategyResults: [],
        summaryGenerated: false,
      };
    }

    console.log(
      `[ContextManager] Processing ${originalCount} messages ` +
        `order=[${this.config.executionOrder.join(", ")}]`
    );

    let current = [...messages];
    let summaryGenerated = false;

    for (const name of this.config.executionOrder) {
      let result;

      switch (name) {
        case "slidingWindow":
          result = slidingWindow(current, this.config.strategies.slidingWindow);
          break;
        case "tokenLimit":
          result = tokenLimit(current, this.config.strategies.tokenLimit);
          break;
        case "summary":
          result = await summarize(
            current,
            this.config.strategies.summary,
            providerCallback
          );
          if (result.trimmed) summaryGenerated = true;
          break;
        default:
          console.warn(`[ContextManager] Unknown strategy: ${name}`);
          continue;
      }

      strategyResults.push(result);
      current = result.messages;

      if (result.trimmed) {
        console.log(
          `[ContextManager] ${name}: ${result.originalCount} -> ${result.processedCount}`
        );
      }
    }

    console.log(
      `[ContextManager] Done: ${originalCount} -> ${current.length} messages`
    );

    return {
      messages: current,
      originalCount,
      finalCount: current.length,
      strategyResults,
      summaryGenerated,
    };
  }

  /**
   * Apply only the sliding window strategy.
   * @param {Array} messages
   * @returns {Array}
   */
  slidingWindow(messages) {
    return slidingWindow(messages, this.config.strategies.slidingWindow).messages;
  }

  /**
   * Apply only the token limit strategy.
   * @param {Array} messages
   * @returns {Array}
   */
  tokenLimit(messages) {
    return tokenLimit(messages, this.config.strategies.tokenLimit).messages;
  }

  /**
   * Apply only the summary compression strategy.
   * @param {Array} messages
   * @param {function} providerCallback - async (msgs, prompt?) => summaryText
   * @returns {Promise<Array>}
   */
  async summarize(messages, providerCallback) {
    const result = await summarize(
      messages,
      this.config.strategies.summary,
      providerCallback
    );
    return result.messages;
  }

  /**
   * Estimate total tokens across an array of messages.
   * @param {Array} messages
   * @returns {number}
   */
  static estimateTotalTokens(messages) {
    return messages.reduce((sum, m) => sum + estimateTokens(m.content), 0);
  }
}

// ---------------------------------------------------------------------------
// Convenience function
// ---------------------------------------------------------------------------

/**
 * Convenience wrapper for simple one-shot context management.
 *
 * @param {Array} messages - Chat messages
 * @param {object} [options]
 * @param {number}  [options.maxMessages=20]
 * @param {number}  [options.maxTokens=4000]
 * @param {number}  [options.keepRecentMessages=20]
 * @param {string[]} [options.executionOrder]
 * @param {string}  [options.summaryPrompt]
 * @param {function} [providerCallback] - async (msgs, prompt?) => summaryText
 * @returns {Promise<Array>} Processed messages
 */
export async function manageConversationContext(
  messages,
  options = {},
  providerCallback
) {
  const manager = new ContextManager({ ...options, enabled: true });
  const result = await manager.manageContext(messages, providerCallback);
  return result.messages;
}
