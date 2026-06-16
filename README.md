# 9Router Model Fetching System

This document provides an overview of the Model Fetching System implemented in 9Router, a web dashboard for managing AI provider connections.

## Overview

The Model Fetching System is a comprehensive solution for:

1. **Pulling model information** from various provider endpoints
2. **Supporting different endpoint formats** (OpenAI-compatible, custom formats, etc.)
3. **Creating a scheduled task or API endpoint** to periodically update model information
4. **Handling rate limiting and error handling** for endpoint calls
5. **Creating a cache system** for model information to reduce endpoint calls

## System Architecture

The system is organized into the following components:

### Core Libraries

- **`src/lib/modelFetchers/`** - Core model fetching libraries
  - `baseModelFetcher.js` - Abstract base class
  - `errorHandler.js` - Error handling and retry logic
  - `rateLimiter.js` - Rate limiting implementation
  - `cache.js` - Caching system
  - `scheduler.js` - Scheduled task manager

- **`src/lib/modelFetchers/providers/`** - Provider-specific fetchers
  - `openai.js` - OpenAI-compatible providers
  - `anthropic.js` - Anthropic-compatible providers
  - `gemini.js` - Gemini providers

### Configuration

- **`src/shared/constants/`** - Configuration constants
  - `modelFetcherConfig.js` - Model fetcher configuration

### API Endpoint

- **`src/app/api/model-fetch/`** - REST API for manual model fetching
  - `route.js` - API endpoint implementation

### CLI Script

- **`scripts/modelFetcher.js`** - Command-line interface for controlling the model fetcher

### Documentation

- **`src/lib/modelFetchers/README.md`** - System overview and usage instructions
- **`src/lib/modelFetchers/SETUP.md`** - Setup and configuration guide
- **`src/lib/modelFetchers/DESIGN.md`** - Design and architecture documentation

### Examples

- **`examples/modelFetcherExample.js`** - Example usage scripts
- **`demoModelFetcher.js`** - Demonstration scripts

### Tests

- **`tests/unit/model-fetcher.test.js`** - Unit tests for model fetcher
- **`tests/unit/model-fetcher-scheduler.test.js`** - Unit tests for scheduler
- **`testModelFetcher.js`** - Integration test script

## Key Features

### 1. Comprehensive Provider Support

The system supports a wide range of providers:

- **OpenAI-Compatible:** OpenAI, Groq, Together, XAI, Mistral, Perplexity, Fireworks, Cerebras, Cohere, Nebius, SiliconFlow, Hyperbolic, Ollama, and more...
- **Anthropic-Compatible:** Claude, Anthropic
- **Gemini:** Google Gemini
- **Custom Resolvers:** Kiro, Qoder, Gemini CLI, Ollama Local, and other custom providers

### 2. Robust Error Handling

- **Retry Logic:** Exponential backoff with up to 3 retries
- **Error Classification:** Retryable vs non-retryable errors
- **Graceful Degradation:** Continue with other providers if one fails
- **Detailed Logging:** Comprehensive error reporting for debugging

### 3. Rate Limiting

- **Token Bucket Algorithm:** Prevents API abuse
- **Configurable Limits:** Adjustable per provider
- **Monitoring:** Tracks rate limit usage

### 4. Efficient Caching

- **TTL-based Caching:** Configurable cache duration
- **In-Memory Storage:** Fast access times
- **Automatic Expiration:** Prevents stale data

### 5. Scheduled and Manual Fetching

- **Scheduler:** Runs periodic fetch cycles (configurable interval)
- **API Endpoint:** Manual triggering via REST API
- **CLI Interface:** Command-line control

## Usage Instructions

### 1. Manual Fetching

#### Using the CLI

```bash
# Run a single fetch cycle
node scripts/modelFetcher.js run

# Start the scheduler (runs every hour by default)
node scripts/modelFetcher.js start

# Stop the scheduler
node scripts/modelFetcher.js stop

# Check scheduler status
node scripts/modelFetcher.js status
```

#### Using the API

```bash
# Fetch all providers
POST /api/model-fetch

# Fetch specific provider
POST /api/model-fetch
Content-Type: application/json

{
  "providerId": "openai"
}

# Check scheduler status
GET /api/model-fetch
```

### 2. Configuration

Update model fetcher settings:

```javascript
// Update settings via API
POST /api/settings
{
  "modelFetchInterval": 3600000,
  "modelCacheMaxAge": 3600000
}
```

### 3. Provider Configuration

Ensure your providers are configured in the 9Router dashboard:

1. Navigate to Settings > Provider Connections
2. Add your providers (OpenAI, Anthropic, Gemini, etc.)
3. Configure API keys and base URLs

## Quick Start

### 1. Install Dependencies

```bash
npm install
# or
bun install
```

### 2. Build the Application

```bash
npm run build
# or
npm run build:bun
```

### 3. Configure Providers

Add your providers in the 9Router dashboard:

1. Navigate to Settings > Provider Connections
2. Add your providers (OpenAI, Anthropic, Gemini, etc.)
3. Configure API keys and base URLs

### 4. Start the Model Fetcher

```bash
node scripts/modelFetcher.js start
```

### 5. Test the System

Run the test scripts:

```bash
node testModelFetcher.js
node examples/modelFetcherExample.js manual
node examples/modelFetcherExample.js scheduler
node examples/modelFetcherExample.js providers
```

### 6. Run Tests

Run unit tests:

```bash
npm test -- --testPathPattern=modelFetcher
```

## Testing

### 1. Unit Tests

Run unit tests:

```bash
npm test -- --testPathPattern=modelFetcher
```

### 2. Integration Tests

Run integration tests:

```bash
npm test -- --testPathPattern=modelFetcher-scheduler
```

### 3. Manual Testing

1. **Test manual fetching:** Run a single fetch cycle
2. **Test scheduler:** Start and stop the scheduler
3. **Test error handling:** Simulate API errors
4. **Test caching:** Verify cache functionality

## Performance Considerations

### 1. Concurrent Processing

- Multiple providers fetched in parallel
- Efficient resource utilization
- Non-blocking operations

### 2. Caching Benefits

- Reduces endpoint calls
- Minimizes database writes
- Faster response times

### 3. Rate Limit Management

- Prevents API abuse
- Ensures smooth request distribution
- Avoids throttling

## Security Considerations

### 1. API Key Management

- Encrypt API keys
- Use environment variables
- Rotate keys regularly

### 2. Access Control

- Validate provider access
- Check authentication
- Implement rate limiting

## Future Enhancements

### 1. Additional Provider Support

- Add support for new provider types
- Extend custom resolver framework

### 2. Advanced Features

- Model pricing updates
- Capability detection
- Model ranking and filtering

### 3. Performance Improvements

- Async/await optimization
- Memory-efficient caching
- Parallel processing

## Migration Guide

### From Previous System

If migrating from the previous model fetching system:

1. **Database Migration:** Custom models are automatically migrated
2. **Configuration:** Update settings to match new configuration
3. **Testing:** Run manual tests to verify functionality

## Conclusion

The Model Fetching System provides a robust, scalable solution for pulling model information from provider endpoints and updating the local model database. It implements comprehensive error handling, rate limiting, caching, and monitoring to ensure reliable operation. The system is designed to be extensible, allowing for easy addition of new provider types and features.

## Support

For support, please:

1. **Check the documentation:** Read the README and SETUP guides
2. **Run tests:** Verify the system works correctly
3. **Report issues:** Create GitHub issues with detailed error information
4. **Contact support:** Reach out for assistance with implementation

## License

This system is part of the 9Router project and is licensed under the same terms as the main application.

## Copyright

© 2024 9Router Team
All rights reserved.
