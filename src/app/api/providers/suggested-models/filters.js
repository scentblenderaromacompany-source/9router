// Free OpenCode models that don't use the "-free" id suffix
const KNOWN_FREE_OPENCODE_MODELS = ["big-pickle"];

export const FILTERS = {
  "openrouter-free": (models) =>
    models
      .filter(
        (m) =>
          m.pricing?.prompt === "0" &&
          m.pricing?.completion === "0" &&
          m.context_length >= 200000
      )
      .map((m) => ({ id: m.id, name: m.name, contextLength: m.context_length }))
      .sort((a, b) => b.contextLength - a.contextLength),

  "opencode-free": (models) =>
    models
      .filter((m) => m.id?.endsWith("-free") || KNOWN_FREE_OPENCODE_MODELS.includes(m.id))
      .map((m) => ({ id: m.id, name: m.id })),

  // models.dev returns a large catalog; keep only mimo models
  "mimo-free": (models) =>
    (Array.isArray(models) ? models : [])
      .filter((m) => m.id?.startsWith("mimo") || m.name?.toLowerCase().includes("mimo"))
      .map((m) => ({ id: m.id, name: m.name || m.id })),

  // New filter for OpenAI-compatible providers
  "openai-compatible": (models) =>
    models
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
      }),

  // New filter for Anthropic-compatible providers
  "anthropic-compatible": (models) =>
    models
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
      }),

  // New filter for Gemini providers
  "gemini": (models) =>
    models
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
      }),

  // New filter for Claude providers
  "claude": (models) =>
    models
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
      }),

  // New filter for Cohere providers
  "cohere": (models) =>
    models
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
      }),

  // New filter for custom provider endpoints
  "custom": (models) =>
    models
      .filter((m) => m.id && m.name)
      .map((m) => ({
        id: m.id,
        name: m.name,
        ...m,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),

  // New filter for image generation models
  "image": (models) =>
    models
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
      .sort((a, b) => a.name.localeCompare(b.name)),

  // New filter for TTS models
  "tts": (models) =>
    models
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
      .sort((a, b) => a.name.localeCompare(b.name)),

  // New filter for STT models
  "stt": (models) =>
    models
      .filter((m) => m.id && m.name)
      .map((m) => ({
        id: m.id,
        name: m.name,
        language: m.language || null,
        supportedFormats: m.supported_formats || m.supportedFormats || [],
        pricing: m.pricing || null,
        capabilities: m.capabilities || null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),

  // New filter for embedding models
  "embedding": (models) =>
    models
      .filter((m) => m.id && m.name)
      .map((m) => ({
        id: m.id,
        name: m.name,
        dimensions: m.dimensions || null,
        maxTokens: m.max_tokens || m.maxTokens || null,
        pricing: m.pricing || null,
        capabilities: m.capabilities || null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),

  // New filter for web search models
  "webSearch": (models) =>
    models
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
      .sort((a, b) => a.name.localeCompare(b.name)),

  // New filter for web fetch models
  "webFetch": (models) =>
    models
      .filter((m) => m.id && m.name)
      .map((m) => ({
        id: m.id,
        name: m.name,
        supportedFormats: m.supported_formats || m.supportedFormats || [],
        maxCharacters: m.max_characters || m.maxCharacters || null,
        pricing: m.pricing || null,
        capabilities: m.capabilities || null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
};
