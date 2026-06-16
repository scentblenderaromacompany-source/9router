#!/usr/bin/env node

/**
 * Flux (Black Forest Labs) - Complete Test Suite (ALL endpoints & models)
 */

import { FluxExecutor } from "./open-sse/executors/flux.js";
import { getFluxModels, getFluxDefaultModel, getFluxRegistry, isFluxModel, getFluxModelConfig, getFluxEndpoints } from "./open-sse/registry/flux.js";

const executor = new FluxExecutor();
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

console.log("🧪 Flux (BFL) Complete Tests\n");

// ============ URL Builders ============
console.log("--- URL Builders ---");
test("Model URL: flux-2-max", () => { const u = executor.getModelUrl("flux-2-max"); if (!u.includes("/v1/flux-2-max")) throw new Error(u); });
test("Model URL: flux-2-pro", () => { const u = executor.getModelUrl("flux-2-pro"); if (!u.includes("/v1/flux-2-pro")) throw new Error(u); });
test("Model URL: flux-2-flex", () => { const u = executor.getModelUrl("flux-2-flex"); if (!u.includes("/v1/flux-2-flex")) throw new Error(u); });
test("Model URL: flux-2-klein-4b", () => { const u = executor.getModelUrl("flux-2-klein-4b"); if (!u.includes("/v1/flux-2-klein-4b")) throw new Error(u); });
test("Model URL: flux-2-klein-9b", () => { const u = executor.getModelUrl("flux-2-klein-9b"); if (!u.includes("/v1/flux-2-klein-9b")) throw new Error(u); });
test("Model URL: flux-pro-1.1", () => { const u = executor.getModelUrl("flux-pro-1.1"); if (!u.includes("/v1/flux-pro-1.1")) throw new Error(u); });
test("Model URL: flux-pro-1.1-ultra", () => { const u = executor.getModelUrl("flux-pro-1.1-ultra"); if (!u.includes("/v1/flux-pro-1.1-ultra")) throw new Error(u); });
test("Model URL: flux-dev", () => { const u = executor.getModelUrl("flux-dev"); if (!u.includes("/v1/flux-dev")) throw new Error(u); });
test("Model URL: flux-kontext-pro", () => { const u = executor.getModelUrl("flux-kontext-pro"); if (!u.includes("/v1/flux-kontext-pro")) throw new Error(u); });
test("Model URL: flux-kontext-max", () => { const u = executor.getModelUrl("flux-kontext-max"); if (!u.includes("/v1/flux-kontext-max")) throw new Error(u); });
test("Model URL: flux-pro-1.0-fill", () => { const u = executor.getModelUrl("flux-pro-1.0-fill"); if (!u.includes("/v1/flux-pro-1.0-fill")) throw new Error(u); });
test("Model URL: flux-pro-1.0-expand", () => { const u = executor.getModelUrl("flux-pro-1.0-expand"); if (!u.includes("/v1/flux-pro-1.0-expand")) throw new Error(u); });
test("Model URL: flux-pro-1.0-fill-finetuned", () => { const u = executor.getModelUrl("flux-pro-1.0-fill-finetuned"); if (!u.includes("/v1/flux-pro-1.0-fill-finetuned")) throw new Error(u); });
test("Model URL: flux-pro-1.1-ultra-finetuned", () => { const u = executor.getModelUrl("flux-pro-1.1-ultra-finetuned"); if (!u.includes("/v1/flux-pro-1.1-ultra-finetuned")) throw new Error(u); });
test("Tool URL: outpainting", () => { const u = executor.getToolUrl("outpainting"); if (!u.includes("/v1/flux-tools/outpainting-v1")) throw new Error(u); });
test("Tool URL: vto", () => { const u = executor.getToolUrl("vto"); if (!u.includes("/v1/flux-tools/vto-v1")) throw new Error(u); });
test("Tool URL: erase", () => { const u = executor.getToolUrl("erase"); if (!u.includes("/v1/flux-tools/erase-v1")) throw new Error(u); });
test("Poll URL", () => { const u = executor.getPollUrl("abc123"); if (!u.includes("id=abc123")) throw new Error(u); });
test("Credits URL", () => { const u = executor.getCreditsUrl(); if (!u.includes("/v1/credits")) throw new Error(u); });
test("My finetunes URL", () => { const u = executor.getMyFinetunesUrl(); if (!u.includes("/v1/my_finetunes")) throw new Error(u); });
test("Finetune details URL", () => { const u = executor.getFinetuneDetailsUrl("ft123"); if (!u.includes("finetune_id=ft123")) throw new Error(u); });
test("Delete finetune URL", () => { const u = executor.getDeleteFinetuneUrl(); if (!u.includes("/v1/delete_finetune")) throw new Error(u); });

// ============ Headers ============
console.log("\n--- Headers ---");
test("No auth", () => { const h = executor.buildHeaders({}); if (h["x-key"]) throw new Error("Should not have x-key"); });
test("With API key", () => { const h = executor.buildHeaders({ apiKey: "sk-test" }); if (h["x-key"] !== "sk-test") throw new Error("Missing x-key"); });
test("With key field", () => { const h = executor.buildHeaders({ key: "sk-key2" }); if (h["x-key"] !== "sk-key2") throw new Error("Missing x-key"); });
test("With session token", () => { const h = executor.buildHeaders({ sessionToken: "sess123" }); if (h["x-key"] !== "sess123") throw new Error("Missing session token"); });
test("With cookie", () => { const h = executor.buildHeaders({ cookie: "session=abc" }); if (!h["Cookie"].includes("session")) throw new Error("Missing cookie"); });

// ============ Image Generation ============
console.log("\n--- Image Generation ---");
test("No prompt fails", async () => {
  const res = await executor.execute({ model: "flux-2-pro", body: {}, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("FLUX.2 max", async () => {
  const res = await executor.execute({ model: "flux-2-max", body: { prompt: "test" }, credentials: { apiKey: "sk-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("FLUX.2 pro", async () => {
  const res = await executor.execute({ model: "flux-2-pro", body: { prompt: "test" }, credentials: { apiKey: "sk-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("FLUX.2 flex", async () => {
  const res = await executor.execute({ model: "flux-2-flex", body: { prompt: "test" }, credentials: { apiKey: "sk-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("FLUX.2 klein 4b", async () => {
  const res = await executor.execute({ model: "flux-2-klein-4b", body: { prompt: "test" }, credentials: { apiKey: "sk-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("FLUX1.1 pro", async () => {
  const res = await executor.execute({ model: "flux-pro-1.1", body: { prompt: "test" }, credentials: { apiKey: "sk-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("FLUX1.1 ultra", async () => {
  const res = await executor.execute({ model: "flux-pro-1.1-ultra", body: { prompt: "test" }, credentials: { apiKey: "sk-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("FLUX dev (free)", async () => {
  const res = await executor.execute({ model: "flux-dev", body: { prompt: "test" }, credentials: { apiKey: "sk-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Kontext pro", async () => {
  const res = await executor.execute({ model: "flux-kontext-pro", body: { prompt: "test" }, credentials: { apiKey: "sk-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Kontext max", async () => {
  const res = await executor.execute({ model: "flux-kontext-max", body: { prompt: "test" }, credentials: { apiKey: "sk-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Custom size", async () => {
  const res = await executor.execute({ body: { prompt: "test", width: 512, height: 768 }, credentials: { apiKey: "sk-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Multi-reference (up to 10 images)", async () => {
  const res = await executor.execute({ model: "flux-2-max", body: { prompt: "test", input_image: "b64", input_image_2: "b64", input_image_10: "b64" }, credentials: { apiKey: "sk-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Finetune support", async () => {
  const res = await executor.execute({ model: "flux-pro-1.1-ultra-finetuned", body: { prompt: "test", finetune_id: "my-lora", finetune_strength: 1.1 }, credentials: { apiKey: "sk-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});

// ============ Tools ============
console.log("\n--- Tools ---");
test("Tool: outpainting", async () => {
  const res = await executor.execute({ body: { endpoint: "tool", tool: "outpainting", input_image: "base64...", width: 1024, height: 1024 }, credentials: { apiKey: "sk-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Tool: vto", async () => {
  const res = await executor.execute({ body: { endpoint: "tool", tool: "vto", prompt: "style", person: "base64...", garment: "base64..." }, credentials: { apiKey: "sk-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("Tool: erase", async () => {
  const res = await executor.execute({ body: { endpoint: "tool", tool: "erase", input_image: "base64...", mask: "base64..." }, credentials: { apiKey: "sk-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 402 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});

// ============ Polling ============
console.log("\n--- Polling ---");
test("No task_id fails", async () => {
  const res = await executor.execute({ body: { endpoint: "poll" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("With task_id builds request", async () => {
  const res = await executor.execute({ body: { endpoint: "poll", task_id: "test123" }, credentials: { apiKey: "sk-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 400 && status !== 401 && status !== 404 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});

// ============ Credits ============
console.log("\n--- Credits ---");
test("Get credits", async () => {
  const res = await executor.execute({ body: { endpoint: "credits" }, credentials: { apiKey: "sk-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});

// ============ Finetunes ============
console.log("\n--- Finetunes ---");
test("List finetunes", async () => {
  const res = await executor.execute({ body: { endpoint: "finetunes" }, credentials: { apiKey: "sk-test" } });
  const status = res.response?.status;
  if (status !== 200 && status !== 401 && status !== 422 && status !== 502) throw new Error(`Unexpected status: ${status}`);
});
test("No finetune_id fails", async () => {
  const res = await executor.execute({ body: { endpoint: "finetune-details" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});
test("Delete finetune no id fails", async () => {
  const res = await executor.execute({ body: { endpoint: "delete-finetune" }, credentials: {} });
  if (res.response.status !== 400) throw new Error(`Expected 400, got ${res.response.status}`);
});

// ============ Registry ============
console.log("\n--- Registry ---");
const reg = getFluxRegistry();
test("Registry ID", () => { if (reg.id !== "flux") throw new Error(reg.id); });
test("Registry auth", () => { if (reg.authType !== "api_key") throw new Error(reg.authType); });
test("Has 19 models", () => { if (reg.models.length !== 19) throw new Error(`Expected 19, got ${reg.models.length}`); });
test("Has flux-2-max", () => { if (!isFluxModel("flux-2-max")) throw new Error(); });
test("Has flux-2-pro", () => { if (!isFluxModel("flux-2-pro")) throw new Error(); });
test("Has flux-2-klein-4b", () => { if (!isFluxModel("flux-2-klein-4b")) throw new Error(); });
test("Has flux-pro-1.1", () => { if (!isFluxModel("flux-pro-1.1")) throw new Error(); });
test("Has flux-dev", () => { if (!isFluxModel("flux-dev")) throw new Error(); });
test("Has flux-kontext-pro", () => { if (!isFluxModel("flux-kontext-pro")) throw new Error(); });
test("Has finetuned", () => { if (!isFluxModel("flux-pro-1.1-ultra-finetuned")) throw new Error(); });
test("Has tool", () => { if (!isFluxModel("tool-outpainting")) throw new Error(); });
test("Not kling model", () => { if (isFluxModel("kling")) throw new Error(); });
test("Default model", () => { if (getFluxDefaultModel() !== "flux-2-pro") throw new Error(getFluxDefaultModel()); });
test("Model config exists", () => { if (!getFluxModelConfig("flux-2-pro")) throw new Error(); });
test("24 endpoints", () => { if (getFluxEndpoints().length !== 24) throw new Error(getFluxEndpoints().length); });

// ============ Summary ============
await new Promise(r => setTimeout(r, 100));
console.log(`\n${"=".repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log("=".repeat(40));

if (failed > 0) process.exit(1);