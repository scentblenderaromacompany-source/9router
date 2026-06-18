// Enhanced error handling with better categorization and retry logic
export class FetchError extends Error {
  constructor(message, status, retryable = true, category = "unknown", providerId = null) {
    super(message);
    this.name = "FetchError";
    this.status = status;
    this.retryable = retryable;
    this.category = category;
    this.providerId = providerId;
    this.timestamp = Date.now();
  }
}

export class CircuitBreaker {
  constructor(failureThreshold = 5, resetTimeout = 60000) {
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
  }

  async execute(operation) {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = "HALF_OPEN";
        console.log(`Circuit breaker for provider ${this.providerId} moving to HALF_OPEN state`);
      } else {
        throw new FetchError(
          `Circuit breaker is OPEN for provider ${this.providerId}. Too many failures.",
          null,
          false,
          "circuit_breaker",
          this.providerId
        );
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = "CLOSED";
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
      console.log(`Circuit breaker for provider ${this.providerId} opened due to ${this.failureCount} failures`);
    }
  }
}

export async function fetchWithEnhancedRetry(url, options, maxRetries = 3, providerId = null) {
  let lastError;
  const startTime = Date.now();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let category = "http_error";
        let retryable = response.status >= 500 || response.status === 429;

        if (response.status === 404) {
          category = "not_found";
          retryable = false;
        } else if (response.status === 401 || response.status === 403) {
          category = "auth_error";
          retryable = false;
        } else if (response.status === 429) {
          category = "rate_limit";
        } else if (response.status >= 500) {
          category = "server_error";
        }

        const error = new FetchError(
          `HTTP ${response.status}: ${errorText}`, 
          response.status,
          retryable,
          category,
          providerId
        );
        throw error;
      }

      const duration = Date.now() - startTime;
      console.log(`Successfully fetched from ${url} in ${duration}ms (attempt ${attempt})`);
      return response;
    } catch (error) {
      lastError = error;
      const duration = Date.now() - startTime;
      console.log(`Failed to fetch from ${url} after ${duration}ms (attempt ${attempt}): ${error.message}`);

      if (!(error instanceof FetchError) || !error.retryable) {
        throw error;
      }

      if (attempt < maxRetries) {
        const delay = 1000 * Math.pow(2, attempt - 1);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

export function isRetryableError(error) {
  if (error instanceof FetchError) {
    return error.retryable;
  }
  return error.message.includes("timeout") || error.message.includes("network");
}

export function categorizeError(error) {
  if (error instanceof FetchError) {
    return error.category;
  }
  if (error.message.includes("timeout")) return "timeout";
  if (error.message.includes("network")) return "network";
  if (error.message.includes("parse")) return "parse";
  return "unknown";
}
