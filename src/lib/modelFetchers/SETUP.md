# Model Fetcher System Setup Guide

## Overview

This guide provides step-by-step instructions for setting up and using the Model Fetcher System in 9Router.

## Prerequisites

### System Requirements

- Node.js 18+ (or Bun)
- TypeScript support (if using TypeScript)
- Access to provider APIs (API keys/tokens)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd 9router
```

2. **Install dependencies**

```bash
npm install
# or
bun install
```

3. **Build the application**

```bash
npm run build
# or
npm run build:bun
```

## Configuration

### 1. Set Up Provider Connections

Before using the model fetcher, you need to configure provider connections:

1. **Access the 9Router dashboard**
2. **Navigate to Settings > Provider Connections**
3. **Add your providers** (OpenAI, Anthropic, Gemini, etc.)
4. **Configure API keys and base URLs**

### 2. Configure Model Fetcher Settings

Update the model fetcher settings in the database:

```javascript
// Example: Update settings via API
POST /api/settings
{
  "modelFetchInterval": 3600000,
  "modelCacheMaxAge": 3600000
}
```

### 3. Set Up Environment Variables

Create a `.env` file with sensitive information:

```env
# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Anthropic
ANTHROPIC_API_KEY=your-anthropic-api-key

# Gemini
GEMINI_API_KEY=your-gemini-api-key

# Other providers as needed
```

## Usage

### 1. Manual Model Fetching

#### Using the CLI

```bash
# Run a single fetch cycle
node scripts/modelFetcher.js run

# Start the scheduler (runs every hour)
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

### 2. Running Examples

Run the example scripts to understand the system:

```bash
# Run manual fetch example
node examples/modelFetcherExample.js manual

# Run scheduler example
node examples/modelFetcherExample.js scheduler

# Run provider-specific example
node examples/modelFetcherExample.js providers
```

## Provider Support

The Model Fetcher System supports the following provider types:

### OpenAI-Compatible Providers

- OpenAI
- Groq
- Together
- XAI
- Mistral
- Perplexity
- Fireworks
- Cerebras
- Cohere
- Nebius
- SiliconFlow
- Hyperbolic
- Ollama
- And more...

### Anthropic-Compatible Providers

- Claude
- Anthropic

### Gemini Providers

- Google Gemini

### Custom Resolvers

- Kiro (OAuth)
- Qoder (OAuth)
- Gemini CLI (OAuth)
- Ollama Local
- And other custom providers

## Advanced Configuration

### Custom Fetcher Configuration

You can customize fetcher behavior by extending the base fetcher:

```javascript
import { BaseModelFetcher } from '@/lib/modelFetchers/baseModelFetcher';

export class CustomModelFetcher extends BaseModelFetcher {
  constructor(providerId, connection, config = {}) {
    super(providerId, connection, {
      maxRetries: 5,
      timeout: 60000,
      cacheTimeout: 7200000,
      rateLimit: 20,
      ...config,
    });
  }

  async fetchModelsFromProvider() {
    // Custom implementation
  }

  async updateDatabase(models) {
    // Custom database update logic
  }
}
```

### Rate Limiting

Configure rate limiting for providers:

```javascript
// Update settings
await updateSettings({
  modelFetchInterval: 1800000, // 30 minutes
  modelCacheMaxAge: 7200000,   // 2 hours
});
```

### Error Handling

The system implements comprehensive error handling:

1. **Retry Logic**
   - Exponential backoff
   - Maximum 3 retries by default
   - Configurable timeout

2. **Error Classification**
   - HTTP errors (5xx, 429) are retryable
   - Network timeouts are retryable
   - Authentication errors are non-retryable

## Monitoring and Troubleshooting

### Check System Status

```bash
# Check if scheduler is running
node scripts/modelFetcher.js status

# Check logs
# Check application logs for model fetch errors
```

### Common Issues and Solutions

#### Issue: Provider not found

**Solution:**
1. Verify the provider is configured in the system
2. Check if the provider ID is correct
3. Ensure the provider is active

#### Issue: Authentication errors

**Solution:**
1. Check API keys/tokens are valid
2. Verify provider-specific authentication requirements
3. Ensure the provider configuration is correct

#### Issue: Rate limiting

**Solution:**
1. Increase rate limit in settings
2. Wait for rate limit reset
3. Check provider-specific rate limits

#### Issue: Cache issues

**Solution:**
1. Clear cache if stale data persists
2. Adjust cache TTL
3. Check cache configuration

### Debug Logging

Enable debug logging by adding to your code:

```javascript
console.log("Model fetchers initialized:", Object.keys(scheduler.fetchers));
```

## Testing

### Unit Tests

Run unit tests for the model fetcher system:

```bash
npm test -- --testPathPattern=modelFetcher
```

### Integration Tests

Run integration tests:

```bash
npm test -- --testPathPattern=modelFetcher-scheduler
```

### Manual Testing

1. **Test manual fetching**
   - Run a single fetch cycle
   - Verify models are fetched and stored

2. **Test scheduler**
   - Start the scheduler
   - Verify periodic fetches
   - Stop the scheduler

3. **Test error handling**
   - Simulate API errors
   - Verify retry logic
   - Verify error reporting

## Performance Optimization

### Cache Optimization

1. **Adjust cache TTL**
   - Increase cache duration for stable providers
   - Decrease cache duration for frequently changing providers

2. **Monitor cache performance**
   - Check cache hit/miss ratios
   - Adjust cache size as needed

### Rate Limit Optimization

1. **Adjust rate limits**
   - Increase rate limits for trusted providers
   - Decrease rate limits for unknown providers

2. **Monitor rate limit usage**
   - Check for rate limit errors
   - Adjust rate limits as needed

### Request Optimization

1. **Batch requests**
   - Group requests for multiple providers
   - Use parallel processing

2. **Request compression**
   - Enable HTTP compression
   - Use efficient data formats

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

## Future Enhancements

### Planned Features

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

## Support

### Getting Help

1. **Documentation**
   - Read the Model Fetcher System README
   - Check the 9Router documentation

2. **Community**
   - Join the 9Router community
   - Report issues on GitHub

3. **Support**
   - Contact support if you need assistance
   - Check the FAQ for common issues

### Reporting Issues

Report issues by creating a GitHub issue with:

1. **Error description**
2. **Steps to reproduce**
3. **Logs**
4. **Configuration**
5. **Expected vs actual behavior**

## License

This system is part of the 9Router project and is licensed under the same terms as the main application.

## Copyright

© 2024 9Router Team
All rights reserved.
