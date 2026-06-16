import { NextResponse } from "next/server";
import { FILTERS } from "./filters.js";

export const dynamic = "force-dynamic";

// Enhanced filter types for different provider endpoint formats
const ENHANCED_FILTERS = {
  ...FILTERS,
  // New filter for OpenAI-compatible providers
  "openai-compatible": (models) => {
    return (Array.isArray(models) ? models : [])
      .filter((m) => m.id && m.name)
      .map((m) => ({
        id: m.id,
        name: m.name,
        contextLength: m.context_length || m.contextLength || null,
        maxTokens: m.max_tokens || m.maxOutputTokens || null,
        pricing: m.pricing || null,
        capabilities: m.capabilities || null,
      }))
      .sort((a, b) => {
        if (a.contextLength && b.contextLength) return b.contextLength - a.contextLength;
        if (a.contextLength) return -1;
        if (b.contextLength) return 1;
        return a.name.localeCompare(b.name);
      });
  },

  // New filter for Anthropic-compatible providers
  "anthropic-compatible": (models) => {
    return (Array.isArray(models) ? models : [])
      .filter((m) => m.id && m.name)
      .map((m) => ({
        id: m.id,
        name: m.name,
        contextLength: m.context_length || m.contextLength || null,
        maxTokens: m.max_tokens || m.maxOutputTokens || null,
        pricing: m.pricing || null,
        capabilities: m.capabilities || null,
        cache_control: m.cache_control || null,
      }))
      .sort((a, b) => {
        if (a.contextLength && b.contextLength) return b.contextLength - a.contextLength;
        if (a.contextLength) return -1;
        if (b.contextLength) return 1;
        return a.name.localeCompare(b.name);
      });
  },

  // New filter for Gemini providers
  "gemini": (models) => {
    return (Array.isArray(models) ? models : [])
      .filter((m) => m.id && m.name)
      .map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description || "",
        inputTokenLimit: m.inputTokenLimit || m.contextLength || null,
        outputTokenLimit: m.outputTokenLimit || m.maxTokens || null,
        supportedGenerationMethods: m.supportedGenerationMethods || [],
        version: m.version || null,
        launchDate: m.launchDate || null,
        architecture: m.architecture || null,
        tokenization: m.tokenization || null,
      }))
      .sort((a, b) => {
        if (a.inputTokenLimit && b.inputTokenLimit) return b.inputTokenLimit - a.inputTokenLimit;
        if (a.inputTokenLimit) return -1;
        if (b.inputTokenLimit) return 1;
        return a.name.localeCompare(b.name);
      });
  },

  // New filter for Claude providers
  "claude": (models) => {
    return (Array.isArray(models) ? models : [])
      .filter((m) => m.id && m.name)
      .map((m) => ({
        id: m.id,
        name: m.name,
        contextLength: m.context_length || m.contextLength || null,
        maxTokens: m.max_tokens || m.maxOutputTokens || null,
        pricing: m.pricing || null,
        capabilities: m.capabilities || null,
        cache_control: m.cache_control || null,
        thinking: m.thinking || null,
      }))
      .sort((a, b) => {
        if (a.contextLength && b.contextLength) return b.contextLength - a.contextLength;
        if (a.contextLength) return -1;
        if (b.contextLength) return 1;
        return a.name.localeCompare(b.name);
      });
  },

  // New filter for Cohere providers
  "cohere": (models) => {
    return (Array.isArray(models) ? models : [])
      .filter((m) => m.id && m.name)
      .map((m) => ({
        id: m.id,
        name: m.name,
        contextLength: m.context_length || m.contextLength || null,
        maxTokens: m.max_tokens || m.maxOutputTokens || null,
        pricing: m.pricing || null,
        capabilities: {
          streaming: m.streaming || false,
          functionCalling: m.function_calling || false,
          vision: m.vision || false,
        },
        isDefault: m.is_default || m.isDefault || false,
        upstreamModelId: m.upstream_model_id || m.upstreamModelId || null,
        rateMultiplier: m.rate_multiplier || m.rateMultiplier || 1.0,
        quotaFamily: m.quota_family || m.quotaFamily || null,
        isVL: m.is_vl || m.isVL || false,
        isReasoning: m.is_reasoning || m.isReasoning || false,
        maxOutputTokens: m.max_output_tokens || m.maxOutputTokens || null,
      }))
      .sort((a, b) => {
        if (a.contextLength && b.contextLength) return b.contextLength - a.contextLength;
        if (a.contextLength) return -1;
        if (b.contextLength) return 1;
        return a.name.localeCompare(b.name);
      });
  },

  // New filter for custom provider endpoints
  "custom": (models) => {
    return (Array.isArray(models) ? models : [])
      .filter((m) => m.id && m.name)
      .map((m) => ({
        id: m.id,
        name: m.name,
        ...m,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  // New filter for image generation models
  "image": (models) => {
    return (Array.isArray(models) ? models : [])
      .filter((m) => m.id && m.name)
      .map((m) => ({
        id: m.id,
        name: m.name,
        dimensions: m.dimensions || null,
        aspectRatio: m.aspect_ratio || m.aspectRatio || null,
        quality: m.quality || null,
        style: m.style || null,
        pricing: m.pricing || null,
        capabilities: m.capabilities || null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  // New filter for TTS models
  "tts": (models) => {
    return (Array.isArray(models) ? models : [])
      .filter((m) => m.id && m.name)
      .map((m) => ({
        id: m.id,
        name: m.name,
        voice: m.voice || null,
        language: m.language || null,
        gender: m.gender || null,
        pricing: m.pricing || null,
        capabilities: m.capabilities || null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  // New filter for STT models
  "stt": (models) => {
    return (Array.isArray(models) ? models : [])
      .filter((m) => m.id && m.name)
      .map((m) => ({
        id: m.id,
        name: m.name,
        language: m.language || null,
        supportedFormats: m.supported_formats || m.supportedFormats || [],
        pricing: m.pricing || null,
        capabilities: m.capabilities || null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  // New filter for embedding models
  "embedding": (models) => {
    return (Array.isArray(models) ? models : [])
      .filter((m) => m.id && m.name)
      .map((m) => ({
        id: m.id,
        name: m.name,
        dimensions: m.dimensions || null,
        maxTokens: m.max_tokens || m.maxTokens || null,
        pricing: m.pricing || null,
        capabilities: m.capabilities || null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  // New filter for web search models
  "webSearch": (models) => {
    return (Array.isArray(models) ? models : [])
      .filter((m) => m.id && m.name)
      .map((m) => ({
        id: m.id,
        name: m.name,
        searchTypes: m.search_types || m.searchTypes || [],
        maxResults: m.max_results || m.maxResults || null,
        country: m.country || null,
        language: m.language || null,
        timeRange: m.time_range || m.timeRange || null,
        domainFilter: m.domain_filter || m.domainFilter || null,
        pricing: m.pricing || null,
        capabilities: m.capabilities || null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  // New filter for web fetch models
  "webFetch": (models) => {
    return (Array.isArray(models) ? models : [])
      .filter((m) => m.id && m.name)
      .map((m) => ({
        id: m.id,
        name: m.name,
        supportedFormats: m.supported_formats || m.supportedFormats || [],
        maxCharacters: m.max_characters || m.maxCharacters || null,
        pricing: m.pricing || null,
        capabilities: m.capabilities || null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const type = searchParams.get("type");
  const provider = searchParams.get("provider");
  const endpoint = searchParams.get("endpoint");

  if (!url || !type) {
    return NextResponse.json({ error: "Missing url or type" }, { status: 400 });
  }

  const filter = ENHANCED_FILTERS[type];
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
