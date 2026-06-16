#!/usr/bin/env node

/**
 * Example: Model Fetcher Usage
 *
 * This script demonstrates how to use the Model Fetcher System
 * to fetch model information from various providers.
 */

const { ModelFetcherScheduler } = require('@/lib/modelFetchers/scheduler');
const { OpenAIModelFetcher } = require('@/lib/modelFetchers/providers/openai');
const { AnthropicModelFetcher } = require('@/lib/modelFetchers/providers/anthropic');
const { GeminiModelFetcher } = require('@/lib/modelFetchers/providers/gemini');

async function exampleManualFetch() {
  console.log('=== Manual Model Fetch Example ===');

  // Example connection
  const connection = {
    id: 'test-connection',
    provider: 'openai',
    providerSpecificData: {
      baseUrl: 'https://api.openai.com/v1',
      prefix: '/v1',
    },
    apiKey: 'your-api-key-here',
    isActive: true,
  };

  // Create fetcher
  const fetcher = new OpenAIModelFetcher('openai', connection);

  try {
    // Fetch models
    const models = await fetcher.fetchModels();
    console.log(`Fetched ${models.length} models from OpenAI`);

    // Update database
    const result = await fetcher.fetchAndUpdate();
    if (result.success) {
      console.log('Successfully updated database with models:', result.models.length);
    } else {
      console.error('Failed to update database:', result.error);
    }
  } catch (error) {
    console.error('Error fetching models:', error.message);
  }
}

async function exampleSchedulerUsage() {
  console.log('\n=== Scheduler Usage Example ===');

  const scheduler = new ModelFetcherScheduler();

  // Run a single fetch cycle
  console.log('Running manual fetch cycle...');
  const result = await scheduler.run();
  console.log('Fetch cycle completed:', result);

  // Start scheduler (runs every hour by default)
  console.log('\nStarting scheduler...');
  await scheduler.start();

  // Stop after 5 seconds
  setTimeout(async () => {
    console.log('\nStopping scheduler...');
    scheduler.stop();
    process.exit(0);
  }, 5000);
}

async function exampleProviderSpecific() {
  console.log('\n=== Provider-Specific Fetch Example ===');

  const connections = [
    {
      id: 'anthropic-connection',
      provider: 'anthropic',
      providerSpecificData: {
        baseUrl: 'https://api.anthropic.com/v1',
        prefix: '/v1',
      },
      apiKey: 'your-anthropic-key',
      isActive: true,
    },
    {
      id: 'gemini-connection',
      provider: 'gemini',
      providerSpecificData: {
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        prefix: '/v1beta',
      },
      apiKey: 'your-gemini-key',
      isActive: true,
    },
  ];

  for (const connection of connections) {
    const scheduler = new ModelFetcherScheduler();
    const fetcherClass = scheduler.getFetcherClass(connection.provider);

    if (fetcherClass) {
      const fetcher = new fetcherClass(connection.provider, connection);
      const result = await fetcher.fetchAndUpdate();

      if (result.success) {
        console.log(`Successfully fetched ${result.models.length} models for ${connection.provider}`);
      } else {
        console.error(`Failed to fetch models for ${connection.provider}:`, result.error);
      }
    } else {
      console.log(`No fetcher found for provider: ${connection.provider}`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'manual':
        await exampleManualFetch();
        break;
      case 'scheduler':
        await exampleSchedulerUsage();
        break;
      case 'providers':
        await exampleProviderSpecific();
        break;
      default:
        console.log('Usage: node example.js <command>');
        console.log('Commands: manual, scheduler, providers');
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
