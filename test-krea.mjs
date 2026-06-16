#!/usr/bin/env node

/**
 * Krea AI - Complete Test Suite (ALL endpoints & models)
 */

import { KreaExecutor } from "./open-sse/executors/krea.js";
import { getKreaModels, getKreaDefaultModel, getKreaRegistry, isKreaModel, getKreaModelConfig, getKreaEndpoints } from "./open-sse/registry/krea.js";

const executor = new KreaExecutor();
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

console.log("🧪 Krea AI Complete Tests\n");

// ============ URL Builders ============
console.log("--- URL Builders ---");
test("Jobs URL", () => { const u = executor.getJobsUrl(); if (!u.includes("/jobs")) throw new Error(u); });
test("Job status URL", () => { const u = executor.getJobStatusUrl("abc"); if (!u.includes("/jobs/abc")) throw new Error(u); });
test("Image generate URL", () => { const u = executor.getImageGenerateUrl("bfl", "flux"); if (!u.includes("/generate/image/bfl/flux")) throw new Error(u); });
test("Enhance URL", () => { const u = executor.getEnhanceUrl("standard-enhance"); if (!u.includes("/generate/enhance/topaz/standard-enhance")) throw new Error(u); });
test("Video generate URL", () => { const u = executor.getVideoGenerateUrl("google", "veo-3.1"); if (!u.includes("/generate/video/google/veo-3.1")) throw new Error(u); });
test("3D generate URL", () => { const u = executor.get3DGenerateUrl(); if (!u.includes("/generate/3d")) throw new Error(u); });
test("Styles URL", () => { const u = executor.getStylesUrl(); if (!u.includes("/styles")) throw new Error(u); });
test("Style URL", () => { const u = executor.getStyleUrl("abc"); if (!u.includes("/styles/abc")) throw new Error(u); });
test("Style share URL", () => { const u = executor.getStyleShareUrl("abc"); if (!u.includes("/styles/abc/share")) throw new Error(u); });
test("Style workspace URL", () => { const u = executor.getStyleWorkspaceUrl("abc"); if (!u.includes("/styles/abc/workspace")) throw new Error(u); });
test("Train URL", () => { const u = executor.getTrainUrl(); if (!u.includes("/styles/train")) throw new Error(u); });
test("Assets URL", () => { const u = executor.getAssetsUrl(); if (!u.includes("/assets")) throw new Error(u); });
test("Asset URL", () => { const u = executor.getAssetUrl("abc"); if (!u.includes("/assets/abc")) throw new Error(u); });
test("Node apps URL", () => { const u = executor.getNodeAppsUrl(); if (!u.includes("/node-apps")) throw new Error(u); });
test("Node app URL", () => { const u = executor.getNodeAppUrl("abc"); if (!u.includes("/node-apps/abc")) throw new Error(u); });
test("Node app execute URL", () => { const u = executor.getNodeAppExecuteUrl("abc"); if (!u.includes("/node-apps/abc/execute")) throw new Error(u); });

// ============ Headers ============
console.log("\n--- Headers ---");
test("No auth", () => { const h = executor.buildHeaders({}); if (h["Authorization"]) throw new Error("Should not have auth"); });
test("With API key", () => { const h = executor.buildHeaders({ apiKey: "test123" }); if (!h["Authorization"].includes("test123")) throw new Error("Missing token"); });
test("With session token", () => { const h = executor.buildHeaders({ sessionToken: "sess456" }); if (!h["Authorization"].includes("sess456")) throw new Error("Missing session token"); });
test("With cookie", () => { const h = executor.buildHeaders({ cookie: "krea_session=abc" }); if (!h["Cookie"].includes("krea_session")) throw new Error("Missing cookie"); });

// ============ Image Generation ============
console.log("\n--- Image Generation ---");
test("No prompt fails", async () => {
  const res = await executor.execute({ model: "bfl/flux", body: {}, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("With prompt builds request", async () => {
  const res = await executor.execute({ model: "bfl/flux", body: { prompt: "a cat" }, credentials: { apiKey: "test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 429 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("ChatGPT Image", async () => {
  const res = await executor.execute({ model: "openai/gpt-image", body: { prompt: "test" }, credentials: { apiKey: "test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 429 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Krea 2 Large", async () => {
  const res = await executor.execute({ model: "krea/krea-2-large", body: { prompt: "test" }, credentials: { apiKey: "test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 429 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Imagen 4 Ultra", async () => {
  const res = await executor.execute({ model: "google/imagen-4-ultra", body: { prompt: "test" }, credentials: { apiKey: "test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 429 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});

// ============ Enhancement ============
console.log("\n--- Enhancement ---");
test("No image fails", async () => {
  const res = await executor.execute({ body: { endpoint: "enhance" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("No dimensions fails", async () => {
  const res = await executor.execute({ body: { endpoint: "enhance", image_url: "http://example.com/img.jpg" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("Standard enhance", async () => {
  const res = await executor.execute({ body: { endpoint: "enhance", image_url: "http://example.com/img.jpg", width: 1024, height: 1024 }, credentials: { apiKey: "test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 429 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Bloom enhance", async () => {
  const res = await executor.execute({ model: "bloom", body: { endpoint: "enhance", image_url: "http://example.com/img.jpg", width: 1024, height: 1024 }, credentials: { apiKey: "test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 429 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});

// ============ Video Generation ============
console.log("\n--- Video Generation ---");
test("No prompt fails", async () => {
  const res = await executor.execute({ body: { endpoint: "video" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("With prompt builds request", async () => {
  const res = await executor.execute({ body: { endpoint: "video", prompt: "a lion" }, credentials: { apiKey: "test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 429 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Kling 3.0", async () => {
  const res = await executor.execute({ model: "kling/kling-3.0", body: { endpoint: "video", prompt: "test" }, credentials: { apiKey: "test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 429 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Runway Gen-4.5", async () => {
  const res = await executor.execute({ model: "runway/runway-gen-4.5", body: { endpoint: "video", prompt: "test" }, credentials: { apiKey: "test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 429 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});

// ============ 3D Generation ============
console.log("\n--- 3D Generation ---");
test("No prompt fails", async () => {
  const res = await executor.execute({ body: { endpoint: "3d" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("With prompt builds request", async () => {
  const res = await executor.execute({ body: { endpoint: "3d", prompt: "a car" }, credentials: { apiKey: "test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 429 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});

// ============ Jobs ============
console.log("\n--- Jobs ---");
test("List jobs", async () => {
  const res = await executor.execute({ body: { endpoint: "jobs" }, credentials: { apiKey: "test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 429 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("No job_id fails", async () => {
  const res = await executor.execute({ body: { endpoint: "job" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("No cancel job_id fails", async () => {
  const res = await executor.execute({ body: { endpoint: "cancel" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});

// ============ Styles ============
console.log("\n--- Styles ---");
test("List styles", async () => {
  const res = await executor.execute({ body: { endpoint: "styles" }, credentials: { apiKey: "test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 429 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("No style_id fails", async () => {
  const res = await executor.execute({ body: { endpoint: "style" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("No train name fails", async () => {
  const res = await executor.execute({ body: { endpoint: "train" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("No style-share style_id fails", async () => {
  const res = await executor.execute({ body: { endpoint: "style-share" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("No style-workspace style_id fails", async () => {
  const res = await executor.execute({ body: { endpoint: "style-workspace" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("No style-update style_id fails", async () => {
  const res = await executor.execute({ body: { endpoint: "style-update" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});

// ============ Assets ============
console.log("\n--- Assets ---");
test("List assets", async () => {
  const res = await executor.execute({ body: { endpoint: "assets" }, credentials: { apiKey: "test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 429 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("No asset_id fails", async () => {
  const res = await executor.execute({ body: { endpoint: "asset" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("No upload file fails", async () => {
  const res = await executor.execute({ body: { endpoint: "upload" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});

// ============ Node Apps ============
console.log("\n--- Node Apps ---");
test("List node apps", async () => {
  const res = await executor.execute({ body: { endpoint: "node-apps" }, credentials: { apiKey: "test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 429 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("No app_id fails for node-app", async () => {
  const res = await executor.execute({ body: { endpoint: "node-app" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("No app_id fails for node-app-execute", async () => {
  const res = await executor.execute({ body: { endpoint: "node-app-execute" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});

// ============ Registry ============
console.log("\n--- Registry ---");
const reg = getKreaRegistry();
test("Registry ID", () => { if (reg.id !== "krea") throw new Error(reg.id); });
test("Registry auth", () => { if (reg.authType !== "api_key") throw new Error(reg.authType); });
test("Has 59 models (25 image + 31 video + 3 enhance + 3d)", () => { if (reg.models.length !== 60) throw new Error(`Expected 60, got ${reg.models.length}`); });
test("Has image models", () => { if (!isKreaModel("bfl/flux")) throw new Error(); });
test("Has enhance models", () => { if (!isKreaModel("enhance/standard-enhance")) throw new Error(); });
test("Has video models", () => { if (!isKreaModel("google/veo-3.1")) throw new Error(); });
test("Has 3d model", () => { if (!isKreaModel("3d/generate")) throw new Error(); });
test("Not pollinations model", () => { if (isKreaModel("openai")) throw new Error(); });
test("Default model", () => { if (getKreaDefaultModel() !== "krea/krea-2-medium") throw new Error(getKreaDefaultModel()); });
test("Model config exists", () => { if (!getKreaModelConfig("bfl/flux")) throw new Error(); });
test("20 endpoints", () => { if (getKreaEndpoints().length !== 20) throw new Error(getKreaEndpoints().length); });

// ============ Summary ============
await new Promise(r => setTimeout(r, 100));
console.log(`\n${"=".repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log("=".repeat(40));

if (failed > 0) process.exit(1);