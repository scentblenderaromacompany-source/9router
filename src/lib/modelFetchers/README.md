# Model Fetcher System

A system for pulling model information from provider endpoints and updating the local model database.

## Overview

The Model Fetcher System provides a comprehensive solution for:

1. **Fetching model information** from various provider endpoints
2. **Supporting different endpoint formats** (OpenAI-compatible, custom formats, etc.)
3. **Periodic updates** through a scheduled task or API endpoint
4. **Rate limiting and error handling** for endpoint calls
5. **Caching** to reduce endpoint calls and improve performance

## Architecture

### Core Components

1. **BaseModelFetcher** (`src/lib/modelFetchers/baseModelFetcher.js`)
   - Abstract base class for all model fetchers
   - Provides common functionality: caching, rate limiting, error handling
   - Defines the interface for provider-specific fetchers

2. **Error Handler** (`src/lib/modelFetchers/errorHandler.js`)
   - Handles retry logic with exponential backoff
   - Manages timeout and network errors
   - Provides retryable vs non-retryable error classification

3. **Rate Limiter** (`src/lib/modelFetchers/rateLimiter.js`)
   - Implements rate limiting to prevent API abuse
   - Uses token bucket algorithm
   - Supports configurable limits per minute

4. **Cache System** (`src/lib/modelFetchers/cache.js`)
   - In-memory caching with TTL support
   - Configurable cache duration via settings
   - Provides cache statistics

5. **Provider-Specific Fetchers**
   - `src/lib/modelFetchers/providers/openai.js` - OpenAI-compatible providers
   - `src/lib/modelFetchers/providers/anthropic.js` - Anthropic-compatible providers
   - `src/lib/modelFetchers/providers/gemini.js` - Gemini providers

6. **Scheduler** (`src/lib/modelFetchers/scheduler.js`)
   - Manages periodic model fetching
   - Supports manual triggering via API
   - Provides status and control endpoints

7. **API Endpoint** (`src/app/api/model-fetch/route.js`)
   - Provides REST API for manual model fetching
   - Supports fetching by specific provider or all providers
   - Returns detailed results and statistics

### Provider Support

The system supports various provider types:

- **OpenAI-compatible providers** (OpenAI, Groq, Together, etc.)
- **Anthropic-compatible providers** (Claude, etc.)
- **Gemini providers** (Google Gemini)
- **Custom resolvers** for OAuth providers and non-standard APIs

### Configuration

Configuration is managed through:

1. **Settings** (`src/lib/localDb`)
   - `modelFetchInterval` - Interval between fetches (default: 1 hour)
   - `modelCacheMaxAge` - Maximum cache age (default: 1 hour)

2. **Constants** (`src/shared/constants/modelFetcherConfig.js`)
   - Retry configuration
   - Rate limiting configuration
   - Cache configuration
   - Scheduler configuration

## Usage

### Manual Fetching

#### Via CLI

```bash
# Run a single fetch cycle
node scripts/modelFetcher.js run

# Start the scheduler
node scripts/modelFetcher.js start

# Stop the scheduler
node scripts/modelFetcher.js stop

# Check scheduler status
node scripts/modelFetcher.js status
```

#### Via API

```bash
# Fetch all providers
POST /api/model-fetch

# Fetch specific provider
POST /api/model-fetch
{
  "providerId": "openai"
}

# Check scheduler status
GET /api/model-fetch
```

### Configuration

Update settings to configure:

```javascript
// Update model fetch interval (in milliseconds)
await updateSettings({
  modelFetchInterval: 3600000, // 1 hour
  modelCacheMaxAge: 3600000,  // 1 hour
});
```

## Error Handling

The system implements comprehensive error handling:

1. **Retry Logic**
   - Exponential backoff for retryable errors
   - Maximum 3 retries by default
   - Configurable timeout (30 seconds)

2. **Error Classification**
   - HTTP errors (5xx, 429) are retryable
   - Network timeouts are retryable
   - Authentication errors are non-retryable

3. **Graceful Degradation**
   - Failed provider fetches don't stop other fetches
   - Detailed error reporting for failed providers
   - Fallback to cached data when available

## Rate Limiting

The system implements rate limiting to prevent API abuse:

- **Default**: 10 requests per minute per provider
- **Configurable**: Can be adjusted via settings
- **Token bucket algorithm**: Ensures smooth request distribution

## Caching

The system uses an in-memory cache to reduce endpoint calls:

- **TTL-based**: Cache entries expire after configured time
- **Configurable**: Cache duration via settings
- **Statistics**: Cache size and key information available

## Database Updates

Fetched models are stored in the local database:

1. **Custom Models** (`customModels` table)
   - Stores model information for each provider
   - Includes metadata like context length, pricing, capabilities
   - Supports model aliases and custom configurations

2. **Updates**
   - Adds new models
   - Updates existing models
   - Removes models no longer available

## Testing

The system includes comprehensive testing:

1. **Unit Tests**
   - Individual fetcher tests
   - Error handling tests
   - Cache tests

2. **Integration Tests**
   - Scheduler tests
   - API endpoint tests
   - End-to-end tests

## Performance

The system is designed for performance:

1. **Concurrent Fetches**
   - Multiple providers fetched in parallel
   - Rate limiting prevents API abuse

2. **Efficient Caching**
   - Reduces endpoint calls
   - Minimizes database writes

3. **Optimized Requests**
   - HTTP/1.1 with connection pooling
   - Request compression
   - Timeout handling

## Monitoring

The system provides monitoring capabilities:

1. **Scheduler Status**
   - Running/stopped status
   - Fetch statistics (successful/failed)

2. **Error Reporting**
   - Detailed error messages
   - Stack traces for debugging

3. **Performance Metrics**
   - Fetch times
   - Cache hit/miss ratios

## Migration Guide

### From Previous System

If migrating from the previous model fetching system:

1. **Database Migration**
   - Custom models are automatically migrated
   - No data loss during migration

2. **Configuration**
   - Update settings to match new configuration
   - Adjust cache and rate limits as needed

3. **Testing**
   - Run manual tests to verify functionality
   - Check for any provider-specific issues

## Troubleshooting

### Common Issues

1. **Provider not found**
   - Check if the provider is configured in the system
   - Verify provider ID is correct

2. **Authentication errors**
   - Check API keys/tokens are valid
   - Verify provider-specific authentication requirements

3. **Rate limiting**
   - Increase rate limit in settings
   - Wait for rate limit reset

4. **Cache issues**
   - Clear cache if stale data persists
   - Adjust cache TTL

### Debugging

Enable debug logging:

```javascript
console.log("Model fetchers initialized:", Object.keys(scheduler.fetchers));
```

Check scheduler status:

```bash
node scripts/modelFetcher.js status
```

## Future Enhancements

1. **Additional Provider Support**
   - Add support for new provider types
   - Extend custom resolver framework

2. **Advanced Features**
   - Model pricing updates
   - Capability detection
   - Model ranking and filtering

3. **Performance Improvements**
   - Async/await optimization
   - Memory-efficient caching
   - Parallel processing

## License

This system is part of the 9Router project and is licensed under the same terms as the main application.
