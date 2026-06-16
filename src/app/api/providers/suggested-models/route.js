import { NextResponse } from "next/server";
import { FILTERS } from "./filters.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const type = searchParams.get("type");
  const provider = searchParams.get("provider");
  const endpoint = searchParams.get("endpoint");

  if (!url || !type) {
    return NextResponse.json({ error: "Missing url or type" }, { status: 400 });
  }

  const filter = FILTERS[type];
  if (!filter) {
    return NextResponse.json({ error: "Unknown filter type" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "9Router-ModelFetcher/1.0",
        "Accept": "application/json",
      },
      timeout: 30000,
    });

    if (!res.ok) {
      console.log(`Failed to fetch from ${url}: ${res.status} ${res.statusText}`);
      return NextResponse.json({ data: [] });
    }

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.log(`Unexpected content type from ${url}: ${contentType}`);
      return NextResponse.json({ data: [] });
    }

    const json = await res.json();
    const raw = json.data ?? json.models ?? json.results ?? json;

    // Apply provider-specific endpoint format handling
    let processedModels = Array.isArray(raw) ? raw : [];

    if (provider === "openai-compatible") {
      processedModels = processedModels.map((m) => ({
        id: m.id || m.name || `model-${Date.now()}`, 
        name: m.name || m.id || "Unknown Model",
        context_length: m.context_length || m.contextLength || null,
        max_tokens: m.max_tokens || m.maxOutputTokens || null,
        pricing: m.pricing || null,
        capabilities: m.capabilities || null,
      }));
    } else if (provider === "anthropic-compatible") {
      processedModels = processedModels.map((m) => ({
        id: m.id || m.name || `model-${Date.now()}`, 
        name: m.name || m.id || "Unknown Model",
        context_length: m.context_length || m.contextLength || null,
        max_tokens: m.max_tokens || m.maxOutputTokens || null,
        pricing: m.pricing || null,
        capabilities: m.capabilities || null,
        cache_control: m.cache_control || null,
      }));
    } else if (provider === "gemini") {
      processedModels = processedModels.map((m) => ({
        id: m.name?.startsWith("models/") ? m.name.replace(/^models\//, "") : m.id || m.name || `model-${Date.now()}`, 
        name: m.displayName || m.name || m.id || "Unknown Model",
        description: m.description || "",
        inputTokenLimit: m.inputTokenLimit || m.contextLength || null,
        outputTokenLimit: m.outputTokenLimit || m.maxTokens || null,
        supportedGenerationMethods: m.supportedGenerationMethods || [],
        version: m.version || null,
        launchDate: m.launchDate || null,
        architecture: m.architecture || null,
        tokenization: m.tokenization || null,
      }));
    } else if (provider === "claude") {
      processedModels = processedModels.map((m) => ({
        id: m.id || m.name || `model-${Date.now()}`, 
        name: m.name || m.id || "Unknown Model",
        context_length: m.context_length || m.contextLength || null,
        max_tokens: m.max_tokens || m.maxOutputTokens || null,
        pricing: m.pricing || null,
        capabilities: m.capabilities || null,
        cache_control: m.cache_control || null,
        thinking: m.thinking || null,
      }));
    }

    const data = filter(processedModels);
    return NextResponse.json({ data });
  } catch (error) {
    console.error(`Error fetching models from ${url}: ${error.message}`);
    return NextResponse.json({ data: [] });
  }
}
