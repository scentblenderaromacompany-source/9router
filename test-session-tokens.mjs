#!/usr/bin/env node

/**
 * Live Content Generation with Session Tokens
 * 
 * Pollinations.ai - FREE, no token needed
 * Krea AI - Set KREA_SESSION_TOKEN
 * Jimeng/Dreamina - Set JIMENG_SESSION_TOKEN
 * Flux (BFL) - Set FLUX_SESSION_TOKEN
 * Grok Imagine - Set GROK_SESSION_TOKEN
 */

import { PollinationsExecutor } from "./open-sse/executors/pollinations.js";
import { KreaExecutor } from "./open-sse/executors/krea.js";
import { JimengExecutor } from "./open-sse/executors/jimeng.js";
import { FluxExecutor } from "./open-sse/executors/flux.js";
import { GrokImagineExecutor } from "./open-sse/executors/grok-imagine.js";

let passed = 0, failed = 0;

async function test(label, fn) {
  try {
    const result = await fn();
    console.log(`  ✅ ${label}`);
    passed++;
    return result;
  } catch (e) {
    console.log(`  ❌ ${label}: ${e.message}`);
    failed++;
    return null;
  }
}

const log = { info: () => {}, error: () => {} };

console.log("🔑 Session Token Auth Test\n");

// ============ Pollinations (FREE) ============
console.log("1. Pollinations.ai (FREE - no token needed)");
const poll = new PollinationsExecutor();

await test("Image generation", async () => {
  const res = await poll.execute({
    body: { endpoint: "image", prompt: "a red fox in snow", simple: true, width: 512, height: 512 },
    credentials: {}, log,
  });
  const data = await res.response.json();
  if (!data.data?.[0]?.url) throw new Error("No image URL");
  console.log(`     URL: ${data.data[0].url.substring(0, 60)}...`);
});

// ============ Krea AI ============
console.log("\n2. Krea AI (needs session token)");
const kreaKey = process.env.KREA_SESSION_TOKEN || process.env.KREA_API_KEY;

const krea = new KreaExecutor();
if (kreaKey) {
  await test("Image generation", async () => {
    const res = await krea.execute({
      model: "bfl/flux-1-dev",
      body: { prompt: "a dragon in a cave" },
      credentials: { sessionToken: kreaKey },
      log,
    });
    const data = await res.response.json();
    console.log(`     Result: ${JSON.stringify(data).substring(0, 80)}...`);
  });
} else {
  console.log("  ⏭️  Skipped (set KREA_SESSION_TOKEN or KREA_API_KEY)");
}

// ============ Jimeng/Dreamina ============
console.log("\n3. Jimeng/Dreamina (needs session token)");
const jimengKey = process.env.JIMENG_SESSION_TOKEN || process.env.JIMENG_TOKEN;

const jimeng = new JimengExecutor();
if (jimengKey) {
  await test("Image generation", async () => {
    const res = await jimeng.execute({
      model: "jimeng-4.5",
      body: { prompt: "a cyberpunk city at night", ratio: "16:9" },
      credentials: { sessionToken: jimengKey },
      log,
    });
    const data = await res.response.json();
    console.log(`     Result: ${JSON.stringify(data).substring(0, 80)}...`);
  });
} else {
  console.log("  ⏭️  Skipped (set JIMENG_SESSION_TOKEN or JIMENG_TOKEN)");
}

// ============ Flux (BFL) ============
console.log("\n4. Flux (BFL) (needs session token)");
const fluxKey = process.env.FLUX_SESSION_TOKEN || process.env.BFL_API_KEY;

const flux = new FluxExecutor();
if (fluxKey) {
  await test("Image generation", async () => {
    const res = await flux.execute({
      model: "flux-pro-1.1",
      body: { prompt: "a space station orbiting Jupiter", width: 1024, height: 1024 },
      credentials: { sessionToken: fluxKey },
      log,
    });
    const data = await res.response.json();
    console.log(`     Result: ${JSON.stringify(data).substring(0, 80)}...`);
  });
} else {
  console.log("  ⏭️  Skipped (set FLUX_SESSION_TOKEN or BFL_API_KEY)");
}

// ============ Grok Imagine ============
console.log("\n5. Grok Imagine (needs session token)");
const grokKey = process.env.GROK_SESSION_TOKEN || process.env.XAI_API_KEY;

const grok = new GrokImagineExecutor();
if (grokKey) {
  await test("Image generation", async () => {
    const res = await grok.execute({
      model: "grok-imagine-image",
      body: { prompt: "a medieval castle on a cliff" },
      credentials: { sessionToken: grokKey },
      log,
    });
    const data = await res.response.json();
    console.log(`     Result: ${JSON.stringify(data).substring(0, 80)}...`);
  });
} else {
  console.log("  ⏭️  Skipped (set GROK_SESSION_TOKEN or XAI_API_KEY)");
}

// ============ Summary ============
console.log(`\n${"=".repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log("=".repeat(40));

console.log("\n📋 How to get session tokens:");
console.log("  Krea AI:      Login at krea.ai -> API page -> Copy API key");
console.log("  Jimeng:       Login at jimeng.jianying.com -> Cookie/Token");
console.log("  Flux (BFL):   Login at dashboard.bfl.ai -> API Keys");
console.log("  Grok Imagine: Login at console.x.ai -> API Keys");
console.log("\n💡 Set via environment variables:");
console.log("  export KREA_SESSION_TOKEN=...");
console.log("  export JIMENG_SESSION_TOKEN=...");
console.log("  export FLUX_SESSION_TOKEN=...");
console.log("  export GROK_SESSION_TOKEN=...");
