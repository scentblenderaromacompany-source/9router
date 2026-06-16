#!/usr/bin/env node

/**
 * Jimeng/Dreamina - Complete Test Suite (ALL endpoints & models)
 */

import { JimengExecutor } from "./open-sse/executors/jimeng.js";
import { getJimengModels, getJimengDefaultModel, getJimengRegistry, isJimengModel, getJimengModelConfig, getJimengEndpoints } from "./open-sse/registry/jimeng.js";

const executor = new JimengExecutor();
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

console.log("🧪 Jimeng/Dreamina Complete Tests\n");

// ============ URL Builders ============
console.log("--- URL Builders ---");
test("Image generate URL", () => { const u = executor.getImageGenerateUrl(); if (!u.includes("/v1/images/generations")) throw new Error(u); });
test("Image compositions URL", () => { const u = executor.getImageCompositionsUrl(); if (!u.includes("/v1/images/compositions")) throw new Error(u); });
test("Video generate URL", () => { const u = executor.getVideoGenerateUrl(); if (!u.includes("/v1/videos/generations")) throw new Error(u); });
test("Avatar generate URL", () => { const u = executor.getAvatarGenerateUrl(); if (!u.includes("/v1/avatar/generate")) throw new Error(u); });
test("Avatar talking URL", () => { const u = executor.getAvatarTalkingUrl(); if (!u.includes("/v1/avatar/talking")) throw new Error(u); });
test("Canvas redraw URL", () => { const u = executor.getCanvasRedrawUrl(); if (!u.includes("/v1/canvas/redraw")) throw new Error(u); });
test("Canvas expand URL", () => { const u = executor.getCanvasExpandUrl(); if (!u.includes("/v1/canvas/expand")) throw new Error(u); });
test("Canvas eliminate URL", () => { const u = executor.getCanvasEliminateUrl(); if (!u.includes("/v1/canvas/eliminate")) throw new Error(u); });
test("Canvas cutout URL", () => { const u = executor.getCanvasCutoutUrl(); if (!u.includes("/v1/canvas/cutout")) throw new Error(u); });
test("Models URL", () => { const u = executor.getModelsUrl(); if (!u.includes("/v1/models")) throw new Error(u); });
test("Token check URL", () => { const u = executor.getTokenCheckUrl(); if (!u.includes("/token/check")) throw new Error(u); });
test("Token points URL", () => { const u = executor.getTokenPointsUrl(); if (!u.includes("/token/points")) throw new Error(u); });
test("Token receive URL", () => { const u = executor.getTokenReceiveUrl(); if (!u.includes("/token/receive")) throw new Error(u); });
test("Assets URL", () => { const u = executor.getAssetsUrl(); if (!u.includes("/v1/assets")) throw new Error(u); });
test("Asset URL", () => { const u = executor.getAssetUrl("abc"); if (!u.includes("/v1/assets/abc")) throw new Error(u); });
test("History images URL", () => { const u = executor.getHistoryImagesUrl(); if (!u.includes("/v1/history/images")) throw new Error(u); });
test("History videos URL", () => { const u = executor.getHistoryVideosUrl(); if (!u.includes("/v1/history/videos")) throw new Error(u); });

// ============ Headers ============
console.log("\n--- Headers ---");
test("No auth", () => { const h = executor.buildHeaders({}); if (h["Authorization"]) throw new Error("Should not have auth"); });
test("With API key", () => { const h = executor.buildHeaders({ apiKey: "test123" }); if (!h["Authorization"].includes("test123")) throw new Error("Missing token"); });
test("With session token", () => { const h = executor.buildHeaders({ sessionToken: "sess456" }); if (!h["Authorization"].includes("sess456")) throw new Error("Missing session token"); });
test("With cookie", () => { const h = executor.buildHeaders({ cookie: "sessionid=abc" }); if (!h["Cookie"].includes("sessionid")) throw new Error("Missing cookie"); });
test("Origin header", () => { const h = executor.buildHeaders({}); if (!h["Origin"]) throw new Error("Missing origin"); });
test("Referer header", () => { const h = executor.buildHeaders({}); if (!h["Referer"]) throw new Error("Missing referer"); });

// ============ Image Generation ============
console.log("\n--- Image Generation ---");
test("No prompt fails", async () => {
  const res = await executor.execute({ model: "jimeng-5.0", body: {}, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("With prompt builds request", async () => {
  const res = await executor.execute({ model: "jimeng-5.0", body: { prompt: "a cat" }, credentials: { apiKey: "tok" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 403 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Jimeng 5.0", async () => {
  const res = await executor.execute({ model: "jimeng-5.0", body: { prompt: "test" }, credentials: { apiKey: "tok" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 403 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Nano Banana", async () => {
  const res = await executor.execute({ model: "nanobanana", body: { prompt: "test" }, credentials: { apiKey: "tok" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 403 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Seedream 5.0 Lite", async () => {
  const res = await executor.execute({ model: "seedream-5.0-lite", body: { prompt: "test" }, credentials: { apiKey: "tok" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 403 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});

// ============ Composition ============
console.log("\n--- Image Composition ---");
test("No images fails", async () => {
  const res = await executor.execute({ body: { endpoint: "compose", prompt: "test" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("With images builds request", async () => {
  const res = await executor.execute({ body: { endpoint: "compose", prompt: "style", images: ["http://example.com/img.jpg"] }, credentials: { apiKey: "tok" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 403 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});

// ============ Video Generation ============
console.log("\n--- Video Generation ---");
test("No prompt fails", async () => {
  const res = await executor.execute({ body: { endpoint: "video" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400`);
});
test("With prompt builds request", async () => {
  const res = await executor.execute({ body: { endpoint: "video", prompt: "a lion" }, credentials: { apiKey: "tok" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 403 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Seedance 2.0", async () => {
  const res = await executor.execute({ model: "jimeng-video-seedance-2.0", body: { endpoint: "video", prompt: "test" }, credentials: { apiKey: "tok" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 403 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Sora 2", async () => {
  const res = await executor.execute({ model: "jimeng-video-sora2", body: { endpoint: "video", prompt: "test" }, credentials: { apiKey: "tok" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 403 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});

// ============ Avatar ============
console.log("\n--- Avatar ---");
test("No prompt fails for avatar", async () => {
  const res = await executor.execute({ body: { endpoint: "avatar" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("No image_url fails for talking", async () => {
  const res = await executor.execute({ body: { endpoint: "avatar-talking" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("No audio_url fails for talking", async () => {
  const res = await executor.execute({ body: { endpoint: "avatar-talking", image_url: "http://example.com/img.jpg" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});

// ============ Canvas ============
console.log("\n--- Canvas ---");
test("No image_url fails for redraw", async () => {
  const res = await executor.execute({ body: { endpoint: "canvas-redraw" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("No mask fails for redraw", async () => {
  const res = await executor.execute({ body: { endpoint: "canvas-redraw", image_url: "http://example.com/img.jpg" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("No image_url fails for expand", async () => {
  const res = await executor.execute({ body: { endpoint: "canvas-expand" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("No image_url fails for eliminate", async () => {
  const res = await executor.execute({ body: { endpoint: "canvas-eliminate" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("No image_url fails for cutout", async () => {
  const res = await executor.execute({ body: { endpoint: "canvas-cutout" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});

// ============ Models ============
console.log("\n--- Models ---");
test("List models", async () => {
  const res = await executor.execute({ body: { endpoint: "models" }, credentials: { apiKey: "tok" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 403 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});

// ============ Token Management ============
console.log("\n--- Token Management ---");
test("Token check no token fails", async () => {
  const res = await executor.execute({ body: { endpoint: "token-check" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("Token points", async () => {
  const res = await executor.execute({ body: { endpoint: "token-points" }, credentials: { apiKey: "tok" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 403 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Token receive", async () => {
  const res = await executor.execute({ body: { endpoint: "token-receive" }, credentials: { apiKey: "tok" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 403 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});

// ============ Assets ============
console.log("\n--- Assets ---");
test("List assets", async () => {
  const res = await executor.execute({ body: { endpoint: "assets" }, credentials: { apiKey: "tok" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 403 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("No asset_id fails", async () => {
  const res = await executor.execute({ body: { endpoint: "asset" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("No upload file fails", async () => {
  const res = await executor.execute({ body: { endpoint: "upload" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});

// ============ History ============
console.log("\n--- History ---");
test("Image history", async () => {
  const res = await executor.execute({ body: { endpoint: "history-images" }, credentials: { apiKey: "tok" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 403 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Video history", async () => {
  const res = await executor.execute({ body: { endpoint: "history-videos" }, credentials: { apiKey: "tok" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 403 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});

// ============ Registry ============
console.log("\n--- Registry ---");
const reg = getJimengRegistry();
test("Registry ID", () => { if (reg.id !== "jimeng") throw new Error(reg.id); });
test("Registry auth", () => { if (reg.authType !== "session_token") throw new Error(reg.authType); });
test("Has 31 models", () => { if (reg.models.length !== 31) throw new Error(`Expected 31, got ${reg.models.length}`); });
test("Has jimeng-5.0", () => { if (!isJimengModel("jimeng-5.0")) throw new Error(); });
test("Has jimeng-video-seedance-2.0", () => { if (!isJimengModel("jimeng-video-seedance-2.0")) throw new Error(); });
test("Has nanobanana", () => { if (!isJimengModel("nanobanana")) throw new Error(); });
test("Has seedream-5.0-lite", () => { if (!isJimengModel("seedream-5.0-lite")) throw new Error(); });
test("Has avatar-1.0", () => { if (!isJimengModel("avatar-1.0")) throw new Error(); });
test("Has canvas-redraw", () => { if (!isJimengModel("canvas-redraw")) throw new Error(); });
test("Not kling model", () => { if (isJimengModel("kling")) throw new Error(); });
test("Default model", () => { if (getJimengDefaultModel() !== "jimeng-5.0") throw new Error(getJimengDefaultModel()); });
test("Model config exists", () => { if (!getJimengModelConfig("jimeng-5.0")) throw new Error(); });
test("18 endpoints", () => { if (getJimengEndpoints().length !== 18) throw new Error(getJimengEndpoints().length); });

// ============ Summary ============
await new Promise(r => setTimeout(r, 100));
console.log(`\n${"=".repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log("=".repeat(40));

if (failed > 0) process.exit(1);