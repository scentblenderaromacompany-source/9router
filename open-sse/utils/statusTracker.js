/**
 * Status Tracker - Request statistics and usage monitoring
 * Tracks per-model, per-provider, per-account metrics with sliding window
 */

export class StatusTracker {
  constructor() {
    this.statistics = {
      totalRequests: 0,
      successRequests: 0,
      failedRequests: 0,
      avgLatency: 0,
      requestsPerMinute: 0,
      activeConnections: 0,
      modelUsage: {},
      providerUsage: {},
      accountUsage: {},
    };

    this.startTime = null;
    this.isRunning = false;
    this.requestTimestamps = [];
    this.latencySum = 0;
  }

  /**
   * Start tracking (record start time)
   */
  start() {
    this.isRunning = true;
    this.startTime = Date.now();
  }

  /**
   * Stop tracking
   */
  stop() {
    this.isRunning = false;
    this.startTime = null;
    this.statistics.activeConnections = 0;
  }

  /**
   * Get uptime in seconds
   */
  getUptime() {
    return this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0;
  }

  /**
   * Get full statistics object
   */
  getStats() {
    this._cleanupOldTimestamps();
    this.statistics.requestsPerMinute = this.requestTimestamps.length;
    this.statistics.avgLatency = this.statistics.totalRequests > 0
      ? this.latencySum / this.statistics.totalRequests
      : 0;
    return { ...this.statistics };
  }

  /**
   * Record a completed request
   * @param {string} model - Model name
   * @param {string|null} provider - Provider ID
   * @param {string|null} account - Account ID
   * @param {number} latency - Request latency in ms
   * @param {boolean} success - Whether request succeeded
   */
  recordRequest(model, provider, account, latency, success) {
    this.statistics.totalRequests++;
    this.requestTimestamps.push(Date.now());

    if (success) {
      this.statistics.successRequests++;
    } else {
      this.statistics.failedRequests++;
    }

    this.latencySum += latency;

    this.statistics.activeConnections = Math.max(0, this.statistics.activeConnections + (success ? -1 : 0));

    this.statistics.modelUsage[model] = (this.statistics.modelUsage[model] || 0) + 1;

    if (provider) {
      this.statistics.providerUsage[provider] = (this.statistics.providerUsage[provider] || 0) + 1;
    }

    if (account) {
      this.statistics.accountUsage[account] = (this.statistics.accountUsage[account] || 0) + 1;
    }

    this._cleanupOldTimestamps();
  }

  /**
   * Record request start (increments active connections)
   */
  recordRequestStart(model, provider, account) {
    this.statistics.totalRequests++;
    this.statistics.activeConnections++;
    this.requestTimestamps.push(Date.now());

    this.statistics.modelUsage[model] = (this.statistics.modelUsage[model] || 0) + 1;

    if (provider) {
      this.statistics.providerUsage[provider] = (this.statistics.providerUsage[provider] || 0) + 1;
    }

    if (account) {
      this.statistics.accountUsage[account] = (this.statistics.accountUsage[account] || 0) + 1;
    }

    this._cleanupOldTimestamps();
  }

  /**
   * Record request completion (decrements active connections)
   */
  recordRequestComplete(latency, success) {
    if (success) {
      this.statistics.successRequests++;
    } else {
      this.statistics.failedRequests++;
    }

    this.statistics.activeConnections = Math.max(0, this.statistics.activeConnections - 1);
    this.latencySum += latency;
  }

  /**
   * Reset all statistics
   */
  reset() {
    this.statistics = {
      totalRequests: 0,
      successRequests: 0,
      failedRequests: 0,
      avgLatency: 0,
      requestsPerMinute: 0,
      activeConnections: 0,
      modelUsage: {},
      providerUsage: {},
      accountUsage: {},
    };
    this.requestTimestamps = [];
    this.latencySum = 0;
  }

  /**
   * Clean up timestamps older than 1 minute (sliding window)
   */
  _cleanupOldTimestamps() {
    const oneMinuteAgo = Date.now() - 60000;
    this.requestTimestamps = this.requestTimestamps.filter(ts => ts > oneMinuteAgo);
  }
}

export default StatusTracker;
