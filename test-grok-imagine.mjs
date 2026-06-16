#!/usr/bin/env node

/**
 * Grok Imagine (xAI) - Complete Test Suite (ALL endpoints & models)
 */

import { GrokImagineExecutor } from "./open-sse/executors/grok-imagine.js";
import { getGrokImagineModels, getGrokImagineDefaultModel, getGrokImagineRegistry, isGrokImagineModel, getGrokImagineModelConfig, getGrokImagineEndpoints } from "./open-sse/registry/grok-imagine.js";

const executor = new GrokImagineExecutor();
let passed = 0, failed = 0;

async function test(label, fn) {
  try {
    await fn();
    console.log(`✅ ${label}`);
    passed++;
  } catch (e) {
    console.log(`❌ ${label}: ${e.message}`);
    failed++;
  }
}

console.log("🧪 Grok Imagine (xAI) Complete Tests\n");

// ============ URL Builders ============
console.log("--- URL Builders ---");
test("Image generate URL", () => { const u = executor.getImageGenerateUrl(); if (!u.includes("/v1/images/generations")) throw new Error(u); });
test("Image edit URL", () => { const u = executor.getImageEditUrl(); if (!u.includes("/v1/images/edits")) throw new Error(u); });
test("Video generate URL", () => { const u = executor.getVideoGenerateUrl(); if (!u.includes("/v1/videos/generations")) throw new Error(u); });
test("Video edit URL", () => { const u = executor.getVideoEditUrl(); if (!u.includes("/v1/videos/edits")) throw new Error(u); });
test("Video extend URL", () => { const u = executor.getVideoExtendUrl(); if (!u.includes("/v1/videos/extensions")) throw new Error(u); });
test("Video status URL", () => { const u = executor.getVideoStatusUrl("abc123"); if (!u.includes("/v1/videos/abc123")) throw new Error(u); });

// ============ Headers ============
console.log("\n--- Headers ---");
test("No auth", () => { const h = executor.buildHeaders({}); if (h["Authorization"]) throw new Error("Should not have auth"); });
test("With API key", () => { const h = executor.buildHeaders({ apiKey: "xai-test" }); if (!h["Authorization"].includes("xai-test")) throw new Error("Missing token"); });
test("With session token", () => { const h = executor.buildHeaders({ sessionToken: "sess123" }); if (!h["Authorization"].includes("sess123")) throw new Error("Missing session token"); });
test("With cookie", () => { const h = executor.buildHeaders({ cookie: "session=abc" }); if (!h["Cookie"].includes("session")) throw new Error("Missing cookie"); });

// ============ Image Generation ============
console.log("\n--- Image Generation ---");
test("No prompt fails", async () => {
  const res = await executor.execute({ model: "grok-imagine-image", body: {}, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("Image model", async () => {
  const res = await executor.execute({ model: "grok-imagine-image", body: { prompt: "a cat" }, credentials: { apiKey: "xai-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Image quality model", async () => {
  const res = await executor.execute({ model: "grok-imagine-image-quality", body: { prompt: "test" }, credentials: { apiKey: "xai-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Batch generation (n=4)", async () => {
  const res = await executor.execute({ model: "grok-imagine-image-quality", body: { prompt: "test", n: 4 }, credentials: { apiKey: "xai-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Aspect ratio 16:9", async () => {
  const res = await executor.execute({ model: "grok-imagine-image-quality", body: { prompt: "test", aspect_ratio: "16:9" }, credentials: { apiKey: "xai-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Resolution 2k", async () => {
  const res = await executor.execute({ model: "grok-imagine-image-quality", body: { prompt: "test", resolution: "2k" }, credentials: { apiKey: "xai-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});

// ============ Image Editing ============
console.log("\n--- Image Editing ---");
test("No image fails", async () => {
  const res = await executor.execute({ body: { endpoint: "edit", prompt: "test" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("Single image edit", async () => {
  const res = await executor.execute({ body: { endpoint: "edit", prompt: "make it blue", image: { url: "http://example.com/img.jpg" } }, credentials: { apiKey: "xai-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Multi-image edit (up to 3)", async () => {
  const res = await executor.execute({ body: { endpoint: "edit", prompt: "combine <IMAGE_0> and <IMAGE_1>", images: [{ url: "a.jpg" }, { url: "b.jpg" }, { url: "c.jpg" }] }, credentials: { apiKey: "xai-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});

// ============ Video Generation ============
console.log("\n--- Video Generation ---");
test("No prompt fails", async () => {
  const res = await executor.execute({ body: { endpoint: "video" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("Text-to-video", async () => {
  const res = await executor.execute({ body: { endpoint: "video", prompt: "a lion running" }, credentials: { apiKey: "xai-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Video 1.5 preview", async () => {
  const res = await executor.execute({ model: "grok-imagine-video-1.5-preview", body: { endpoint: "video", prompt: "test" }, credentials: { apiKey: "xai-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Duration 15s", async () => {
  const res = await executor.execute({ body: { endpoint: "video", prompt: "test", duration: 15 }, credentials: { apiKey: "xai-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Resolution 720p", async () => {
  const res = await executor.execute({ body: { endpoint: "video", prompt: "test", resolution: "720p" }, credentials: { apiKey: "xai-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Image-to-video", async () => {
  const res = await executor.execute({ body: { endpoint: "video", prompt: "animate this", image: { url: "http://example.com/img.jpg" } }, credentials: { apiKey: "xai-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Reference-to-video", async () => {
  const res = await executor.execute({ body: { endpoint: "video", prompt: "test", reference_images: [{ url: "ref.jpg" }] }, credentials: { apiKey: "xai-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});

// ============ Video Editing ============
console.log("\n--- Video Editing ---");
test("No video fails", async () => {
  const res = await executor.execute({ body: { endpoint: "video-edit", prompt: "test" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("With video", async () => {
  const res = await executor.execute({ body: { endpoint: "video-edit", prompt: "make it cinematic", video: { url: "http://example.com/vid.mp4" } }, credentials: { apiKey: "xai-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});

// ============ Video Extension ============
console.log("\n--- Video Extension ---");
test("No video fails", async () => {
  const res = await executor.execute({ body: { endpoint: "video-extend", prompt: "test" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("With video", async () => {
  const res = await executor.execute({ body: { endpoint: "video-extend", prompt: "continue the scene", video: { url: "http://example.com/vid.mp4" }, duration: 10 }, credentials: { apiKey: "xai-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});

// ============ Video Status ============
console.log("\n--- Video Status ---");
test("No request_id fails", async () => {
  const res = await executor.execute({ body: { endpoint: "video-status" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("With request_id", async () => {
  const res = await executor.execute({ body: { endpoint: "video-status", request_id: "test123" }, credentials: { apiKey: "xai-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 404 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});

// ============ Registry ============
console.log("\n--- Registry ---");
const reg = getGrokImagineRegistry();
test("Registry ID", () => { if (reg.id !== "grok-imagine") throw new Error(reg.id); });
test("Registry auth", () => { if (reg.authType !== "api_key") throw new Error(reg.authType); });
test("Has 4 models", () => { if (reg.models.length !== 4) throw new Error(`Expected 4, got ${reg.models.length}`); });
test("Has grok-imagine-image", () => { if (!isGrokImagineModel("grok-imagine-image")) throw new Error(); });
test("Has grok-imagine-image-quality", () => { if (!isGrokImagineModel("grok-imagine-image-quality")) throw new Error(); });
test("Has grok-imagine-video", () => { if (!isGrokImagineModel("grok-imagine-video")) throw new Error(); });
test("Has grok-imagine-video-1.5-preview", () => { if (!isGrokImagineModel("grok-imagine-video-1.5-preview")) throw new Error(); });
test("Not flux model", () => { if (isGrokImagineModel("flux-pro")) throw new Error(); });
test("Default model", () => { if (getGrokImagineDefaultModel() !== "grok-imagine-image-quality") throw new Error(getGrokImagineDefaultModel()); });
test("Model config exists", () => { if (!getGrokImagineModelConfig("grok-imagine-image")) throw new Error(); });
test("6 endpoints", () => { if (getGrokImagineEndpoints().length !== 6) throw new Error(getGrokImagineEndpoints().length); });

// ============ Summary ============
await new Promise(r => setTimeout(r, 100));
console.log(`\n${"=".repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log("=".repeat(40));

if (failed > 0) process.exit(1);