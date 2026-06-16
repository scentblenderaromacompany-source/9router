#!/usr/bin/env node

/**
 * Demonstration script for the Model Fetching System
 *
 * This script demonstrates how the Model Fetching System works in practice,
 * showing the complete flow from fetching to database updates.
 */

const { ModelFetcherScheduler } = require('@/lib/modelFetchers/scheduler');
const { OpenAIModelFetcher } = require('@/lib/modelFetchers/providers/openai');

async function demonstrateManualFetch() {
  console.log('=== Manual Fetch Demonstration ===');
  console.log('\nThis demonstrates a manual fetch of models from an OpenAI-compatible provider.');

  // Example connection (replace with real provider configuration)
  const connection = {
    id: 'demo-connection',
    provider: 'openai',
    providerSpecificData: {
      baseUrl: 'https://api.openai.com/v1',
      prefix: '/v1',
    },
    apiKey: 'your-api-key-here', // Replace with real API key
    isActive: true,
  };

  // Create fetcher
  const fetcher = new OpenAIModelFetcher('openai', connection);

  try {
    console.log('\n1. Fetching models from provider endpoint...');
    const models = await fetcher.fetchModels();
    console.log(`   ✓ Fetched ${models.length} models from OpenAI`);

    console.log('\n2. Enriching model data...');
    const enriched = await fetcher.enrichModelData(models);
    console.log(`   ✓ Enriched ${enriched.length} models with provider information`);

    console.log('\n3. Updating database...');
    const result = await fetcher.fetchAndUpdate();

    if (result.success) {
      console.log(`   ✓ Successfully updated database with ${result.models.length} models`);
      console.log('   ✓ Database updated with model metadata (context length, pricing, capabilities, etc.)');
    } else {
      console.log(`   ✗ Failed to update database: ${result.error}`);
    }
  } catch (error) {
    console.log(`\n   ✗ Error during fetch: ${error.message}`);
  }
}

async function demonstrateScheduler() {
  console.log('\n=== Scheduler Demonstration ===');
  console.log('\nThis demonstrates the scheduled model fetching functionality.');

  const scheduler = new ModelFetcherScheduler();

  console.log('\n1. Running manual fetch cycle...');
  const result = await scheduler.run();

  console.log('\n2. Fetch cycle results:');
  console.log(`   - Total providers processed: ${result.total}`);
  console.log(`   - Successfully fetched: ${result.successful}`);
  console.log(`   - Failed: ${result.failed}`);

  if (result.details.length > 0) {
    console.log('\n3. Detailed results:');
    for (const detail of result.details) {
      if (detail.success) {
        console.log(`   ✓ ${detail.provider}: Fetched ${detail.models.length} models`);
      } else {
        console.log(`   ✗ ${detail.provider}: ${detail.error}`);
      }
    }
  }

  console.log('\n4. Starting scheduler (will run every hour by default)...');
  await scheduler.start();

  console.log('\n   Scheduler is now running. Press Ctrl+C to stop.');
  console.log('   (This demo will stop after 5 seconds)');

  // Stop after 5 seconds
  setTimeout(async () => {
    console.log('\n5. Stopping scheduler...');
    scheduler.stop();
    console.log('   ✓ Scheduler stopped successfully');
    process.exit(0);
  }, 5000);
}

async function demonstrateErrorHandling() {
  console.log('\n=== Error Handling Demonstration ===');
  console.log('\nThis demonstrates how the system handles errors gracefully.');

  // Example connection with invalid API key (for demonstration)
  const connection = {
    id: 'error-demo-connection',
    provider: 'openai',
    providerSpecificData: {
      baseUrl: 'https://api.openai.com/v1',
      prefix: '/v1',
    },
    apiKey: 'invalid-api-key', // This will cause an error
    isActive: true,
  };

  const fetcher = new OpenAIModelFetcher('openai', connection);

  try {
    console.log('\n1. Attempting to fetch models with invalid API key...');
    const result = await fetcher.fetchAndUpdate();

    if (!result.success) {
      console.log(`   ✓ Error handled gracefully: ${result.error}`);
      console.log('   ✓ System continued running despite error');
      console.log('   ✓ Other providers can still be fetched successfully');
    }
  } catch (error) {
    console.log(`\n   ✗ Unexpected error: ${error.message}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'manual':
        await demonstrateManualFetch();
        break;
      case 'scheduler':
        await demonstrateScheduler();
        break;
      case 'error':
        await demonstrateErrorHandling();
        break;
      default:
        console.log('Usage: node demo.js <command>');
        console.log('Commands: manual, scheduler, error');
        console.log('\nExamples:');
        console.log('  node demo.js manual   - Demonstrate manual model fetching');
        console.log('  node demo.js scheduler - Demonstrate scheduled fetching');
        console.log('  node demo.js error    - Demonstrate error handling');
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
