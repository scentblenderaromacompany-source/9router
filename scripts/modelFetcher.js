#!/usr/bin/env node

import { ModelFetcherScheduler } from "@/lib/modelFetchers/scheduler";

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const scheduler = new ModelFetcherScheduler();

  switch (command) {
    case "run":
      await scheduler.run();
      break;
    case "start":
      await scheduler.start();
      console.log("Model fetcher scheduler started. Press Ctrl+C to stop.");
      process.on("SIGINT", () => {
        scheduler.stop();
        process.exit(0);
      });
      break;
    case "stop":
      scheduler.stop();
      break;
    case "status":
      const isRunning = scheduler.isSchedulerRunning();
      console.log(`Model fetcher scheduler is ${isRunning ? "running" : "stopped"}`);
      break;
    default:
      console.log("Usage: node modelFetcher.js <command>");
      console.log("Commands: run, start, stop, status");
      process.exit(1);
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
