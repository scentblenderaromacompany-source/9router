/**
 * Load Balancer - Account selection with multiple strategies
 * Supports round-robin, fill-first, and failover strategies
 */

const FAIL_THRESHOLD = 3;
const RECOVERY_TIME = 60000; // 1 minute

export class LoadBalancer {
  constructor(strategy = 'round-robin', accounts = [], options = {}) {
    this.strategy = strategy;
    this.accounts = accounts;
    this.providers = options.providers || [];
    this.modelMappings = options.modelMappings || {};
    this.roundRobinIndex = new Map();
    this.failedAccounts = new Map();
  }

  /**
   * Report failure for an account
   */
  reportFailure(accountId) {
    const current = this.failedAccounts.get(accountId) || { count: 0, lastFailTime: 0 };
    this.failedAccounts.set(accountId, {
      count: current.count + 1,
      lastFailTime: Date.now(),
    });
  }

  /**
   * Report success for an account - clears failure state
   */
  reportSuccess(accountId) {
    this.failedAccounts.delete(accountId);
  }

  /**
   * Check if account is in failure state
   */
  isAccountInFailure(accountId) {
    const failure = this.failedAccounts.get(accountId);
    if (!failure) return false;

    if (Date.now() - failure.lastFailTime > RECOVERY_TIME) {
      this.failedAccounts.delete(accountId);
      return false;
    }

    return failure.count >= FAIL_THRESHOLD;
  }

  /**
   * Check if an account is available (active, within daily limit, not failed)
   */
  isAccountAvailable(account) {
    if (account.status !== 'active') return false;

    if (account.dailyLimit && account.todayUsed && account.todayUsed >= account.dailyLimit) return false;

    if (this.isAccountInFailure(account.id)) return false;

    return true;
  }

  /**
   * Check if provider supports the given model (with wildcard matching)
   */
  providerSupportsModel(provider, model) {
    const effectiveModels = provider.supportedModels || provider.effectiveModels || [];
    if (effectiveModels.length === 0) return true;

    const normalizedModel = model.toLowerCase();
    const supported = effectiveModels.some(m => {
      const displayName = (typeof m === 'string' ? m : m.displayName || '').toLowerCase();
      if (displayName.endsWith('*')) {
        return normalizedModel.startsWith(displayName.slice(0, -1));
      }
      return displayName === normalizedModel;
    });

    if (supported) return true;

    const mapping = this.modelMappings[model];
    if (mapping) {
      if (mapping.preferredProviderId) {
        if (mapping.preferredProviderId === provider.id) return true;
        return false;
      }

      const actualModel = (mapping.actualModel || '').toLowerCase();
      const actualSupported = effectiveModels.some(m => {
        const displayName = (typeof m === 'string' ? m : m.displayName || '').toLowerCase();
        if (displayName.endsWith('*')) {
          return actualModel.startsWith(displayName.slice(0, -1));
        }
        return displayName === actualModel;
      });

      if (actualSupported) return true;
    }

    return false;
  }

  /**
   * Map model name to actual model for the given provider
   */
  mapModel(model, provider) {
    const effectiveModels = provider.supportedModels || provider.effectiveModels || [];
    const effectiveModel = effectiveModels.find(m => {
      const displayName = typeof m === 'string' ? m : m.displayName || '';
      return displayName.toLowerCase() === model.toLowerCase();
    });

    if (effectiveModel) {
      return typeof effectiveModel === 'string' ? effectiveModel : effectiveModel.actualModelId || effectiveModel.displayName;
    }

    const mapping = this.modelMappings[model];
    if (mapping && (!mapping.preferredProviderId || mapping.preferredProviderId === provider.id)) {
      return mapping.actualModel || model;
    }

    return model;
  }

  /**
   * Get available accounts filtered by model and provider
   */
  getAvailableAccounts(model, preferredProviderId = null, excludeFailed = false) {
    const candidates = [];
    const providers = this.providers.filter(p => p.enabled !== false);

    for (const provider of providers) {
      if (preferredProviderId && provider.id !== preferredProviderId) continue;

      if (!this.providerSupportsModel(provider, model)) continue;

      const accounts = (this.accounts || [])
        .filter(account => account.providerId === provider.id || account.provider === provider.id)
        .filter(account => this.isAccountAvailable(account))
        .filter(account => !excludeFailed || !this.isAccountInFailure(account.id));

      for (const account of accounts) {
        candidates.push({
          account,
          provider,
          actualModel: this.mapModel(model, provider),
        });
      }
    }

    return candidates;
  }

  /**
   * Select account using round-robin strategy
   */
  selectRoundRobin(candidates) {
    const providerIds = [...new Set(candidates.map(c => c.provider.id))];
    const key = providerIds.join(',');

    const currentIndex = this.roundRobinIndex.get(key) || 0;
    const selected = candidates[currentIndex % candidates.length];

    this.roundRobinIndex.set(key, (currentIndex + 1) % candidates.length);

    return selected;
  }

  /**
   * Select account using fill-first strategy
   * Prefers the account with the least usage
   */
  selectFillFirst(candidates) {
    return candidates.reduce((best, current) => {
      const bestUsed = best.account.todayUsed || 0;
      const currentUsed = current.account.todayUsed || 0;

      if (currentUsed < bestUsed) return current;

      if (currentUsed === bestUsed) {
        const bestLastUsed = best.account.lastUsed || 0;
        const currentLastUsed = current.account.lastUsed || 0;

        if (currentLastUsed < bestLastUsed) return current;
      }

      return best;
    });
  }

  /**
   * Select account using failover strategy
   * Prefers healthy accounts, falls back to least-failed
   */
  selectFailover(candidates) {
    const healthyCandidates = candidates.filter(c => !this.isAccountInFailure(c.account.id));

    if (healthyCandidates.length > 0) {
      return this.selectRoundRobin(healthyCandidates);
    }

    const sortedCandidates = [...candidates].sort((a, b) => {
      const failureA = this.failedAccounts.get(a.account.id);
      const failureB = this.failedAccounts.get(b.account.id);

      const countA = failureA ? failureA.count : 0;
      const countB = failureB ? failureB.count : 0;

      if (countA !== countB) return countA - countB;

      const timeA = failureA ? failureA.lastFailTime : 0;
      const timeB = failureB ? failureB.lastFailTime : 0;

      return timeA - timeB;
    });

    return sortedCandidates[0];
  }

  /**
   * Select an account based on strategy
   * @param {string} model - Requested model name
   * @param {string|null} preferredProvider - Preferred provider ID
   * @param {string|null} preferredAccountId - Preferred account ID
   * @returns {object|null} Selected account selection or null
   */
  selectAccount(model, preferredProvider = null, preferredAccountId = null) {
    const strategy = this.strategy || 'round-robin';
    const candidates = this.getAvailableAccounts(model, preferredProvider, strategy === 'failover');

    if (candidates.length === 0) return null;

    if (preferredAccountId) {
      const preferred = candidates.find(c => c.account.id === preferredAccountId);
      if (preferred && !this.isAccountInFailure(preferredAccountId)) {
        return preferred;
      }
    }

    if (strategy === 'fill-first') {
      return this.selectFillFirst(candidates);
    }

    if (strategy === 'failover') {
      return this.selectFailover(candidates);
    }

    return this.selectRoundRobin(candidates);
  }

  /**
   * Reset round-robin index
   */
  resetRoundRobinIndex() {
    this.roundRobinIndex.clear();
  }

  /**
   * Get count of available accounts for a model
   */
  getAvailableAccountCount(model, providerId = null) {
    return this.getAvailableAccounts(model, providerId).length;
  }

  /**
   * Get all available models across providers
   */
  getAvailableModels() {
    const models = new Set();
    const providers = this.providers.filter(p => p.enabled !== false);

    for (const provider of providers) {
      const accounts = (this.accounts || [])
        .filter(account => account.providerId === provider.id || account.provider === provider.id)
        .filter(account => this.isAccountAvailable(account));

      if (accounts.length > 0) {
        const effectiveModels = provider.supportedModels || provider.effectiveModels || [];
        effectiveModels.forEach(m => {
          models.add(typeof m === 'string' ? m : m.displayName);
        });
      }
    }

    return [...models];
  }
}

export default LoadBalancer;
