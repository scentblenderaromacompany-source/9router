import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ModelFetcherScheduler } from '@/lib/modelFetchers/scheduler';

vi.mock('@/lib/localDb', () => ({
  getProviderConnections: vi.fn(() => []),
  getSettings: vi.fn(() => ({ modelFetchInterval: 3600000 })),
}));

vi.mock('@/shared/constants/providers', () => ({
  getProviderByAlias: vi.fn(() => null),
}));

describe('ModelFetcherScheduler', () => {
  let scheduler;

  beforeEach(() => {
    scheduler = new ModelFetcherScheduler();
  });

  afterEach(() => {
    scheduler.stop();
  });

  it('should initialize fetchers', () => {
    expect(scheduler.fetchers).toEqual({});
  });

  it('should get fetcher class', () => {
    const fetcherClass = scheduler.getFetcherClass('openai');
    expect(fetcherClass).toBeDefined();
  });

  it('should return null for unknown provider', () => {
    const fetcherClass = scheduler.getFetcherClass('unknown');
    expect(fetcherClass).toBeNull();
  });

  it('should check if scheduler is running', () => {
    expect(scheduler.isSchedulerRunning()).toBe(false);
  });
});
