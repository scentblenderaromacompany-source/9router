#!/usr/bin/env node

/**
 * Quick test - all free endpoints that work without API keys
 */

import { PollinationsExecutor } from "./open-sse/executors/pollinations.js";
import { writeFile } from "fs/promises";

const pollinations = new PollinationsExecutor();
const log = { info: () => {}, error: () => {} };

console.log("🚀 Testing all free endpoints\n");

// 1. Image generation (GET - free)
console.log("1️⃣  Image generation (Pollinations - FREE)");
const imgRes = await pollinations.execute({
  body: { endpoint: "image", prompt: "a golden retriever playing in autumn leaves", simple: true, width: 512, height: 512 },
  credentials: {}, log,
});
const imgData = await imgRes.response.json();
const imgUrl = imgData.data[0].url;
console.log(`   ✅ URL: ${imgUrl.substring(0, 60)}...`);

// Download and save
const imgResponse = await fetch(imgUrl);
const imgBuffer = Buffer.from(await imgResponse.arrayBuffer());
await writeFile("/workspaces/9router/generated-image.png", imgBuffer);
console.log(`   💾 Saved: generated-image.png (${imgBuffer.length} bytes)\n`);

// 2. List models (free)
console.log("2️⃣  List models (Pollinations - FREE)");
const modelsRes = await pollinations.execute({
  body: { endpoint: "models" },
  credentials: {}, log,
});
const modelsData = await modelsRes.response.json();
console.log(`   ✅ Models available: ${Array.isArray(modelsData) ? modelsData.length : 'N/A'}\n`);

// 3. Check other providers
console.log("3️⃣  Provider status:");
console.log("   ✅ Pollinations.ai  - Image generation (FREE)");
console.log("   ⏭️  Krea AI          - Needs KREA_API_KEY");
console.log("   ⏭️  Jimeng/Dreamina  - Needs JIMENG_TOKEN");
console.log("   ⏭️  Flux (BFL)       - Needs BFL_API_KEY");
console.log("   ⏭️  Grok Imagine     - Needs XAI_API_KEY");

console.log("\n✨ Done! Pollinations.ai generates real content without API keys.");
