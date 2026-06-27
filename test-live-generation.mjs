#!/usr/bin/env node

/**
 * Live Content Generation Test
 * Tests actual API calls to generate content
 * 
 * Pollinations.ai - FREE, no API key needed
 * Other providers - need API keys
 */

import { PollinationsExecutor } from "./open-sse/executors/pollinations.js";
import { KreaExecutor } from "./open-sse/executors/krea.js";
import { JimengExecutor } from "./open-sse/executors/jimeng.js";
import { FluxExecutor } from "./open-sse/executors/flux.js";
import { GrokImagineExecutor } from "./open-sse/executors/grok-imagine.js";
import { writeFile } from "fs/promises";

let passed = 0, failed = 0;

async function test(label, fn) {
  try {
    const result = await fn();
    console.log(`✅ ${label}`);
    passed++;
    return result;
  } catch (e) {
    console.log(`❌ ${label}: ${e.message}`);
    failed++;
    return null;
  }
}

console.log("🧪 Live Content Generation Tests\n");

// ============ Pollinations.ai (FREE) ============
console.log("--- Pollinations.ai (FREE, no API key) ---");

const pollinations = new PollinationsExecutor();

// Test 1: Simple image generation (GET URL)
await test("Pollinations: Simple image URL", async () => {
  const res = await pollinations.execute({
    body: { endpoint: "image", prompt: "a cute cat wearing a top hat", simple: true },
    credentials: {},
    log: { info: () => {}, error: () => {} },
  });
  if (res.response.status !== 200) throw new Error(`Status ${res.response.status}`);
  const data = await res.response.json();
  if (!data.data?.[0]?.url) throw new Error("No image URL returned");
  console.log(`   📸 URL: ${data.data[0].url.substring(0, 80)}...`);
  return data;
});

// Test 2: POST image generation (needs API key, skip if not available)
const pollKey = process.env.POLLINATIONS_API_KEY;
if (pollKey) {
  await test("Pollinations: POST image generation", async () => {
    const res = await pollinations.execute({
      body: { endpoint: "image", prompt: "a sunset over mountains" },
      credentials: { apiKey: pollKey },
      log: { info: () => {}, error: () => {} },
    });
    if (res.response.status !== 200) throw new Error(`Status ${res.response.status}`);
    const data = await res.response.json();
    if (!data.data?.[0]?.url) throw new Error("No image URL returned");
    console.log(`   📸 URL: ${data.data[0].url.substring(0, 80)}...`);
    return data;
  });
} else {
  console.log("   ⏭️  POST image (needs POLLINATIONS_API_KEY)");
}

// Test 3: Video generation (returns URL)
await test("Pollinations: Video generation", async () => {
  const res = await pollinations.execute({
    body: { endpoint: "video", prompt: "a butterfly flying" },
    credentials: {},
    log: { info: () => {}, error: () => {} },
  });
  if (res.response.status !== 200) throw new Error(`Status ${res.response.status}`);
  const data = await res.response.json();
  if (!data.data?.[0]?.url) throw new Error("No video URL returned");
  console.log(`   🎬 URL: ${data.data[0].url.substring(0, 80)}...`);
  return data;
});

// Test 4: Embeddings (needs API key)
if (pollKey) {
  await test("Pollinations: Embeddings", async () => {
    const res = await pollinations.execute({
      body: { endpoint: "embeddings", input: "Hello world" },
      credentials: { apiKey: pollKey },
      log: { info: () => {}, error: () => {} },
    });
    if (res.response.status !== 200) throw new Error(`Status ${res.response.status}`);
    const data = await res.response.json();
    if (!data.data?.[0]?.embedding) throw new Error("No embedding returned");
    console.log(`   🔢 Embedding dims: ${data.data[0].embedding.length}`);
    return data;
  });
} else {
  console.log("   ⏭️  Embeddings (needs POLLINATIONS_API_KEY)");
}

// Test 5: List models
await test("Pollinations: List models", async () => {
  const res = await pollinations.execute({
    body: { endpoint: "models" },
    credentials: {},
    log: { info: () => {}, error: () => {} },
  });
  if (res.response.status !== 200) throw new Error(`Status ${res.response.status}`);
  const data = await res.response.json();
  const count = Array.isArray(data) ? data.length : Object.keys(data).length;
  console.log(`   📋 Models: ${count}`);
  return data;
});

// ============ Flux (BFL) - needs API key ============
console.log("\n--- Flux (BFL) - needs API key ---");

const flux = new FluxExecutor();
const fluxKey = process.env.BFL_API_KEY || process.env.FLUX_API_KEY;

if (fluxKey) {
  await test("Flux: Generate image", async () => {
    const res = await flux.execute({
      model: "flux-pro-1.1",
      body: { prompt: "a beautiful landscape", width: 1024, height: 1024 },
      credentials: { apiKey: fluxKey },
      log: { info: () => {}, error: () => {} },
    });
    if (res.response.status !== 200) throw new Error(`Status ${res.response.status}`);
    const data = await res.response.json();
    console.log(`   📸 Result: ${JSON.stringify(data).substring(0, 100)}...`);
    return data;
  });
} else {
  console.log("   ⏭️  Skipped (no BFL_API_KEY set)");
}

// ============ Grok Imagine (xAI) - needs API key ============
console.log("\n--- Grok Imagine (xAI) - needs API key ---");

const grok = new GrokImagineExecutor();
const xaiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;

if (xaiKey) {
  await test("Grok: Generate image", async () => {
    const res = await grok.execute({
      model: "grok-imagine-image",
      body: { prompt: "a futuristic city" },
      credentials: { apiKey: xaiKey },
      log: { info: () => {}, error: () => {} },
    });
    if (res.response.status !== 200) throw new Error(`Status ${res.response.status}`);
    const data = await res.response.json();
    console.log(`   📸 Result: ${JSON.stringify(data).substring(0, 100)}...`);
    return data;
  });
} else {
  console.log("   ⏭️  Skipped (no XAI_API_KEY set)");
}

// ============ Krea AI - needs API key ============
console.log("\n--- Krea AI - needs API key ---");

const krea = new KreaExecutor();
const kreaKey = process.env.KREA_API_KEY;

if (kreaKey) {
  await test("Krea: Generate image", async () => {
    const res = await krea.execute({
      model: "bfl/flux-1-dev",
      body: { prompt: "a magical forest" },
      credentials: { apiKey: kreaKey },
      log: { info: () => {}, error: () => {} },
    });
    if (res.response.status !== 200) throw new Error(`Status ${res.response.status}`);
    const data = await res.response.json();
    console.log(`   📸 Result: ${JSON.stringify(data).substring(0, 100)}...`);
    return data;
  });
} else {
  console.log("   ⏭️  Skipped (no KREA_API_KEY set)");
}

// ============ Jimeng/Dreamina - needs token ============
console.log("\n--- Jimeng/Dreamina - needs token ---");

const jimeng = new JimengExecutor();
const jimengToken = process.env.JIMENG_TOKEN || process.env.DREAMINA_TOKEN;

if (jimengToken) {
  await test("Jimeng: Generate image", async () => {
    const res = await jimeng.execute({
      model: "jimeng-4.5",
      body: { prompt: "a cute puppy", ratio: "1:1" },
      credentials: { apiKey: jimengToken },
      log: { info: () => {}, error: () => {} },
    });
    if (res.response.status !== 200) throw new Error(`Status ${res.response.status}`);
    const data = await res.response.json();
    console.log(`   📸 Result: ${JSON.stringify(data).substring(0, 100)}...`);
    return data;
  });
} else {
  console.log("   ⏭️  Skipped (no JIMENG_TOKEN set)");
}

// ============ Summary ============
await new Promise(r => setTimeout(r, 500));
console.log(`\n${"=".repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log("=".repeat(40));

if (passed > 0) {
  console.log("\n💡 To test paid providers, set these env vars:");
  console.log("   BFL_API_KEY=...      (Flux/Black Forest Labs)");
  console.log("   XAI_API_KEY=...      (Grok Imagine)");
  console.log("   KREA_API_KEY=...     (Krea AI)");
  console.log("   JIMENG_TOKEN=...     (Jimeng/Dreamina)");
}
