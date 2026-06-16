#!/usr/bin/env node

/**
 * Pollinations.ai - Complete Test Suite
 * Tests ALL endpoints: chat, text, image, image-edit, video, tts, stt, embeddings, models, upload, account
 */

import { PollinationsExecutor } from "./open-sse/executors/pollinations.js";
import { getPollinationsModels, getPollinationsDefaultModel, getPollinationsRegistry, isPollinationsModel, getPollinationsModelConfig, getPollinationsEndpoints } from "./open-sse/registry/pollinations.js";

const executor = new PollinationsExecutor();
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

console.log("🧪 Pollinations.ai Complete Tests\n");

// ============ URL Builders ============
console.log("--- URL Builders ---");
test("Chat completions URL", () => { const u = executor.getChatCompletionsUrl(); if (!u.includes("/v1/chat/completions")) throw new Error(u); });
test("Text URL", () => { const u = executor.getTextUrl(); if (!u.includes("/text")) throw new Error(u); });
test("Simple text URL", () => { const u = executor.getSimpleTextUrl("hello"); if (!u.includes("/text/hello")) throw new Error(u); });
test("Simple image URL", () => { const u = executor.getSimpleImageUrl("cat"); if (!u.includes("/image/cat")) throw new Error(u); });
test("Image generations URL", () => { const u = executor.getImageGenerationsUrl(); if (!u.includes("/v1/images/generations")) throw new Error(u); });
test("Image edits URL", () => { const u = executor.getImageEditsUrl(); if (!u.includes("/v1/images/edits")) throw new Error(u); });
test("Video URL", () => { const u = executor.getVideoUrl("test"); if (!u.includes("/video/test")) throw new Error(u); });
test("Audio speech URL", () => { const u = executor.getAudioSpeechUrl(); if (!u.includes("/v1/audio/speech")) throw new Error(u); });
test("Audio transcriptions URL", () => { const u = executor.getAudioTranscriptionsUrl(); if (!u.includes("/v1/audio/transcriptions")) throw new Error(u); });
test("Simple audio URL", () => { const u = executor.getSimpleAudioUrl("hello"); if (!u.includes("/audio/hello")) throw new Error(u); });
test("Embeddings URL", () => { const u = executor.getEmbeddingsUrl(); if (!u.includes("/v1/embeddings")) throw new Error(u); });
test("Models URL", () => { const u = executor.getModelsUrl(); if (!u.includes("/v1/models")) throw new Error(u); });
test("All models URL", () => { const u = executor.getAllModelsUrl(); if (!u.includes("/models")) throw new Error(u); });
test("Image models URL", () => { const u = executor.getImageModelsUrl(); if (!u.includes("/image/models")) throw new Error(u); });
test("Text models URL", () => { const u = executor.getTextModelsUrl(); if (!u.includes("/text/models")) throw new Error(u); });
test("Audio models URL", () => { const u = executor.getAudioModelsUrl(); if (!u.includes("/audio/models")) throw new Error(u); });
test("Embedding models URL", () => { const u = executor.getEmbeddingModelsUrl(); if (!u.includes("/embeddings/models")) throw new Error(u); });
test("Upload URL", () => { const u = executor.getUploadUrl(); if (!u.includes("/upload")) throw new Error(u); });
test("Media URL", () => { const u = executor.getMediaUrl("abc123"); if (!u.includes("/abc123")) throw new Error(u); });
test("Media metadata URL", () => { const u = executor.getMediaMetadataUrl("abc123"); if (!u.includes("/abc123/metadata")) throw new Error(u); });
test("Account profile URL", () => { const u = executor.getAccountProfileUrl(); if (!u.includes("/account/profile")) throw new Error(u); });
test("Account balance URL", () => { const u = executor.getAccountBalanceUrl(); if (!u.includes("/account/balance")) throw new Error(u); });
test("Account usage URL", () => { const u = executor.getAccountUsageUrl(); if (!u.includes("/account/usage")) throw new Error(u); });
test("Account usage daily URL", () => { const u = executor.getAccountUsageDailyUrl(); if (!u.includes("/account/usage/daily")) throw new Error(u); });
test("Account keys URL", () => { const u = executor.getAccountKeysUrl(); if (!u.includes("/account/keys")) throw new Error(u); });
test("Account key URL", () => { const u = executor.getAccountKeyUrl(); if (!u.includes("/account/key")) throw new Error(u); });
test("Account key usage URL", () => { const u = executor.getAccountKeyUsageUrl(); if (!u.includes("/account/key/usage")) throw new Error(u); });

// ============ Headers ============
console.log("\n--- Headers ---");
test("No auth", () => { const h = executor.buildHeaders({}); if (h["Authorization"]) throw new Error("Should not have auth"); });
test("With auth", () => { const h = executor.buildHeaders({ apiKey: "test123" }); if (!h["Authorization"].includes("test123")) throw new Error("Missing token"); });

// ============ Chat ============
console.log("\n--- Chat ---");
test("No messages fails", async () => {
  const res = await executor.execute({ body: {}, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("Empty messages fails", async () => {
  const res = await executor.execute({ body: { messages: [] }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("With messages builds request", async () => {
  const res = await executor.execute({ body: { messages: [{ role: "user", content: "hi" }] }, credentials: {} });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 429 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});

// ============ Text ============
console.log("\n--- Text ---");
test("No messages fails", async () => {
  const res = await executor.execute({ body: { endpoint: "text" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("With messages builds request", async () => {
  const res = await executor.execute({ body: { endpoint: "text", messages: [{ role: "user", content: "hi" }] }, credentials: {} });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 429 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});

// ============ Image ============
console.log("\n--- Image ---");
test("No prompt fails", async () => {
  const res = await executor.execute({ body: { endpoint: "image" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("Simple image builds URL", async () => {
  const res = await executor.execute({ body: { endpoint: "image", prompt: "a cat", simple: true }, credentials: {} });
  if (res.response.status !== 200) throw new Error(`Expected 200, got ${res.response.status}`);
});
test("POST image builds request", async () => {
  const res = await executor.execute({ body: { endpoint: "image", prompt: "a cat" }, credentials: {} });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 429 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});

// ============ Image Edit ============
console.log("\n--- Image Edit ---");
test("No image fails", async () => {
  const res = await executor.execute({ body: { endpoint: "image-edit", prompt: "test" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});

// ============ Video ============
console.log("\n--- Video ---");
test("No prompt fails", async () => {
  const res = await executor.execute({ body: { endpoint: "video" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("With prompt builds URL", async () => {
  const res = await executor.execute({ body: { endpoint: "video", prompt: "a cat dancing" }, credentials: {} });
  if (res.response.status !== 200) throw new Error(`Expected 200, got ${res.response.status}`);
});

// ============ TTS ============
console.log("\n--- TTS ---");
test("No input fails", async () => {
  const res = await executor.execute({ body: { endpoint: "tts" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("With input builds request", async () => {
  const res = await executor.execute({ body: { endpoint: "tts", input: "hello world" }, credentials: {} });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 429 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});

// ============ STT ============
console.log("\n--- STT ---");
test("No file fails", async () => {
  const res = await executor.execute({ body: { endpoint: "stt" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});

// ============ Embeddings ============
console.log("\n--- Embeddings ---");
test("No input fails", async () => {
  const res = await executor.execute({ body: { endpoint: "embeddings" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("With input builds request", async () => {
  const res = await executor.execute({ body: { endpoint: "embeddings", input: "hello" }, credentials: {} });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 429 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});

// ============ Models ============
console.log("\n--- Models ---");
test("List models", async () => {
  const res = await executor.execute({ body: { endpoint: "models" }, credentials: {} });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});

// ============ Upload ============
console.log("\n--- Upload ---");
test("No file fails", async () => {
  const res = await executor.execute({ body: { endpoint: "upload" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});

// ============ Account ============
console.log("\n--- Account ---");
test("Profile", async () => {
  const res = await executor.execute({ body: { endpoint: "account", action: "profile" }, credentials: {} });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 403 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Balance", async () => {
  const res = await executor.execute({ body: { endpoint: "account", action: "balance" }, credentials: {} });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 403 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});

// ============ Registry ============
console.log("\n--- Registry ---");
const reg = getPollinationsRegistry();
test("Registry ID", () => { if (reg.id !== "pollinations") throw new Error(reg.id); });
test("Registry auth", () => { if (reg.authType !== "api_key_optional") throw new Error(reg.authType); });
test("Has 107 models", () => { if (reg.models.length !== 107) throw new Error(reg.models.length); });
test("Has chat models", () => { if (!isPollinationsModel("openai")) throw new Error(); });
test("Has image models", () => { if (!isPollinationsModel("flux")) throw new Error(); });
test("Has video models", () => { if (!isPollinationsModel("veo")) throw new Error(); });
test("Has audio models", () => { if (!isPollinationsModel("elevenlabs")) throw new Error(); });
test("Has embedding models", () => { if (!isPollinationsModel("openai-3-small")) throw new Error(); });
test("Not kling model", () => { if (isPollinationsModel("kling")) throw new Error(); });
test("Default model", () => { if (getPollinationsDefaultModel() !== "flux") throw new Error(); });
test("Model config exists", () => { if (!getPollinationsModelConfig("openai")) throw new Error(); });
test("27 endpoints", () => { if (getPollinationsEndpoints().length !== 27) throw new Error(getPollinationsEndpoints().length); });

// ============ Summary ============
await new Promise(r => setTimeout(r, 100));
console.log(`\n${"=".repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log("=".repeat(40));

if (failed > 0) process.exit(1);
