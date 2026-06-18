/**
 * Pollinations.ai - Complete API Integration (ALL endpoints, ALL models)
 * 
 * Base URL: https://gen.pollinations.ai
 * Auth: Bearer <sk_* or pk_* key> or ?key= for GET endpoints
 * 
 * Endpoints:
 * - POST /v1/chat/completions      - Chat completions (OpenAI-compatible)
 * - POST /text                     - Text generation (raw content)
 * - GET  /text/{prompt}            - Simple text generation
 * - GET  /image/{prompt}           - Simple image generation
 * - POST /v1/images/generations    - Image generation (OpenAI-compatible)
 * - POST /v1/images/edits          - Image editing
 * - GET  /video/{prompt}           - Video generation
 * - POST /v1/audio/speech          - TTS (OpenAI-compatible)
 * - POST /v1/audio/transcriptions  - STT (Whisper-compatible)
 * - GET  /audio/{text}             - Simple TTS
 * - POST /v1/embeddings            - Embeddings (OpenAI-compatible)
 * - GET  /v1/models                - List models (OpenAI-compatible)
 * - GET  /models                   - List all models
 * - GET  /image/models             - List image/video models
 * - GET  /text/models              - List text models
 * - GET  /audio/models             - List audio models
 * - GET  /embeddings/models        - List embedding models
 * - POST /upload                   - Upload media
 * - GET  /{hash}                   - Retrieve media
 * - HEAD /{hash}                   - Check media exists
 * - GET  /{hash}/metadata          - Media metadata
 * - GET  /account/profile          - Account profile
 * - GET  /account/balance          - Balance
 * - GET  /account/usage            - Usage history
 * - GET  /account/usage/daily      - Daily usage
 * - GET  /account/earnings         - Developer earnings
 * - WS   /v1/realtime              - Realtime WebSocket
 */

import { BaseExecutor } from "./base.js";

export class PollinationsExecutor extends BaseExecutor {
  constructor() {
    super("pollinations", {
      baseUrl: "https://gen.pollinations.ai",
      imageBaseUrl: "https://image.pollinations.ai",
      noAuth: true,
    });
  }

  buildUrl(model, stream, urlIndex = 0, credentials = null) {
    return this.config.baseUrl;
  }

  transformRequest(model, body, stream, credentials) {
    return body;
  }

  // ============ URL builders ============

  getChatCompletionsUrl() { return `${this.config.baseUrl}/v1/chat/completions`; }
  getTextUrl() { return `${this.config.baseUrl}/text`; }
  getSimpleTextUrl(prompt) { return `${this.config.baseUrl}/text/${encodeURIComponent(prompt)}`; }
  getSimpleImageUrl(prompt) { return `${this.config.baseUrl}/image/${encodeURIComponent(prompt)}`; }
  getImageGenerationsUrl() { return `${this.config.baseUrl}/v1/images/generations`; }
  getImageEditsUrl() { return `${this.config.baseUrl}/v1/images/edits`; }
  getVideoUrl(prompt) { return `${this.config.baseUrl}/video/${encodeURIComponent(prompt)}`; }
  getAudioSpeechUrl() { return `${this.config.baseUrl}/v1/audio/speech`; }
  getAudioTranscriptionsUrl() { return `${this.config.baseUrl}/v1/audio/transcriptions`; }
  getSimpleAudioUrl(text) { return `${this.config.baseUrl}/audio/${encodeURIComponent(text)}`; }
  getEmbeddingsUrl() { return `${this.config.baseUrl}/v1/embeddings`; }
  getModelsUrl() { return `${this.config.baseUrl}/v1/models`; }
  getAllModelsUrl() { return `${this.config.baseUrl}/models`; }
  getImageModelsUrl() { return `${this.config.baseUrl}/image/models`; }
  getTextModelsUrl() { return `${this.config.baseUrl}/text/models`; }
  getAudioModelsUrl() { return `${this.config.baseUrl}/audio/models`; }
  getEmbeddingModelsUrl() { return `${this.config.baseUrl}/embeddings/models`; }
  getUploadUrl() { return `${this.config.baseUrl}/upload`; }
  getMediaUrl(hash) { return `${this.config.baseUrl}/${hash}`; }
  getMediaHeadUrl(hash) { return `${this.config.baseUrl}/${hash}`; }
  getMediaMetadataUrl(hash) { return `${this.config.baseUrl}/${hash}/metadata`; }
  getAccountProfileUrl() { return `${this.config.baseUrl}/account/profile`; }
  getAccountBalanceUrl() { return `${this.config.baseUrl}/account/balance`; }
  getAccountUsageUrl() { return `${this.config.baseUrl}/account/usage`; }
  getAccountUsageDailyUrl() { return `${this.config.baseUrl}/account/usage/daily`; }
  getAccountEarningsUrl() { return `${this.config.baseUrl}/account/earnings`; }
  getAccountKeysUrl() { return `${this.config.baseUrl}/account/keys`; }
  getAccountKeyUrl() { return `${this.config.baseUrl}/account/key`; }
  getAccountKeyUsageUrl() { return `${this.config.baseUrl}/account/key/usage`; }
  getRealtimeUrl(model) { return `wss://gen.pollinations.ai/v1/realtime?model=${model || "gpt-realtime-2"}`; }

  // ============ Headers ============

  buildHeaders(credentials, contentType = "application/json") {
    const headers = { "Content-Type": contentType };
    const apiKey = credentials?.apiKey || credentials?.sessionToken || credentials?.token;
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
    if (credentials?.cookie) headers["Cookie"] = credentials.cookie;
    return headers;
  }

  // ============ Execute ============

  async execute({ model, body, stream, credentials, signal, log }) {
    const endpoint = body?.endpoint || "chat";
    
    try {
      switch (endpoint) {
        case "chat": return await this.handleChat(model, body, stream, credentials, signal, log);
        case "text": return await this.handleText(model, body, credentials, signal, log);
        case "image": return await this.handleImage(model, body, credentials, signal, log);
        case "image-edit": return await this.handleImageEdit(model, body, credentials, signal, log);
        case "video": return await this.handleVideo(model, body, credentials, signal, log);
        case "tts": return await this.handleTTS(model, body, credentials, signal, log);
        case "stt": return await this.handleSTT(model, body, credentials, signal, log);
        case "embeddings": return await this.handleEmbeddings(model, body, credentials, signal, log);
        case "models": return await this.handleModels(body, credentials, signal);
        case "upload": return await this.handleUpload(body, credentials, signal);
        case "media": return await this.handleMedia(body, signal);
        case "media-head": return await this.handleMediaHead(body, signal);
        case "media-metadata": return await this.handleMediaMetadata(body, signal);
        case "account": return await this.handleAccount(body, credentials, signal);
        default: return await this.handleChat(model, body, stream, credentials, signal, log);
      }
    } catch (err) {
      log?.error?.("POLLINATIONS", `Error: ${err.message}`);
      return this.errorResponse(`Pollinations failed: ${err.message}`, 502);
    }
  }

  // ============ Chat (OpenAI-compatible) ============

  async handleChat(model, body, stream, credentials, signal, log) {
    const messages = body?.messages;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return this.errorResponse("Missing or empty messages array", 400);
    }

    const url = this.getChatCompletionsUrl();
    const headers = this.buildHeaders(credentials);
    const payload = {
      model: model || body?.model || "openai",
      messages,
      stream: stream ?? body?.stream ?? false,
    };

    if (body?.temperature !== undefined) payload.temperature = body.temperature;
    if (body?.max_tokens !== undefined) payload.max_tokens = body.max_tokens;
    if (body?.top_p !== undefined) payload.top_p = body.top_p;
    if (body?.tools) payload.tools = body.tools;
    if (body?.tool_choice) payload.tool_choice = body.tool_choice;
    if (body?.response_format) payload.response_format = body.response_format;
    if (body?.seed !== undefined) payload.seed = body.seed;
    if (body?.thinking) payload.thinking = body.thinking;
    if (body?.reasoning_effort) payload.reasoning_effort = body.reasoning_effort;
    if (body?.safe) payload.safe = body.safe;
    if (body?.frequency_penalty !== undefined) payload.frequency_penalty = body.frequency_penalty;
    if (body?.presence_penalty !== undefined) payload.presence_penalty = body.presence_penalty;
    if (body?.stop) payload.stop = body.stop;
    if (body?.logprobs !== undefined) payload.logprobs = body.logprobs;
    if (body?.top_logprobs !== undefined) payload.top_logprobs = body.top_logprobs;
    if (body?.parallel_tool_calls !== undefined) payload.parallel_tool_calls = body.parallel_tool_calls;
    if (body?.user) payload.user = body.user;
    if (body?.functions) payload.functions = body.functions;
    if (body?.function_call) payload.function_call = body.function_call;
    if (body?.repetition_penalty !== undefined) payload.repetition_penalty = body.repetition_penalty;
    if (body?.logit_bias) payload.logit_bias = body.logit_bias;
    if (body?.modalities) payload.modalities = body.modalities;
    if (body?.audio) payload.audio = body.audio;
    if (body?.stream_options) payload.stream_options = body.stream_options;
    if (body?.thinking_budget !== undefined) payload.thinking_budget = body.thinking_budget;

    log?.info?.("POLLINATIONS", `Chat: model=${payload.model}, stream=${payload.stream}`);

    const response = await fetch(url, {
      method: "POST", headers, body: JSON.stringify(payload), signal,
    });

    if (!response.ok) {
      const err = await response.text().catch(() => "");
      return this.errorResponse(`HTTP ${response.status}: ${err}`, response.status);
    }

    if (stream || payload.stream) {
      return {
        response: new Response(response.body, {
          status: 200,
          headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
        }),
        url, headers, transformedBody: payload,
      };
    }

    const result = await response.json();
    return {
      response: new Response(JSON.stringify(result), {
        status: 200, headers: { "Content-Type": "application/json" },
      }),
      url, headers, transformedBody: payload,
    };
  }

  // ============ Text (raw content) ============

  async handleText(model, body, credentials, signal, log) {
    const messages = body?.messages;
    if (!messages) return this.errorResponse("Missing messages", 400);

    const url = `${this.config.baseUrl}/text`;
    const headers = this.buildHeaders(credentials);
    const payload = {
      model: model || "openai",
      messages,
      stream: false,
    };
    if (body?.temperature !== undefined) payload.temperature = body.temperature;
    if (body?.max_tokens !== undefined) payload.max_tokens = body.max_tokens;
    if (body?.safe) payload.safe = body.safe;

    log?.info?.("POLLINATIONS", `Text: model=${payload.model}`);

    const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload), signal });
    if (!response.ok) {
      const err = await response.text().catch(() => "");
      return this.errorResponse(`HTTP ${response.status}: ${err}`, response.status);
    }

    const text = await response.text();
    return {
      response: new Response(JSON.stringify({ content: text }), {
        status: 200, headers: { "Content-Type": "application/json" },
      }),
      url, headers, transformedBody: payload,
    };
  }

  // ============ Image Generation ============

  async handleImage(model, body, credentials, signal, log) {
    const prompt = body?.prompt;
    if (!prompt) return this.errorResponse("Missing prompt", 400);

    // Simple GET URL
    if (body?.simple) {
      const params = new URLSearchParams({
        model: model || body?.model || "flux",
        width: String(body?.width || 1024),
        height: String(body?.height || 1024),
      });
      if (body?.seed) params.set("seed", String(body.seed));
      if (body?.safe) params.set("safe", "true");
      if (body?.quality) params.set("quality", body.quality);
      if (body?.image) params.set("image", body.image);
      if (body?.transparent) params.set("transparent", "true");

      const imageUrl = `${this.config.imageBaseUrl}/prompt/${encodeURIComponent(prompt)}?${params}`;
      log?.info?.("POLLINATIONS", `Image (simple): ${model || "flux"}`);

      return {
        response: new Response(JSON.stringify({
          created: Math.floor(Date.now() / 1000),
          data: [{ url: imageUrl, revised_prompt: prompt }],
        }), { status: 200, headers: { "Content-Type": "application/json" } }),
        url: imageUrl, headers: {}, transformedBody: { prompt },
      };
    }

    // OpenAI-compatible POST
    const url = this.getImageGenerationsUrl();
    const headers = this.buildHeaders(credentials);
    const payload = {
      prompt,
      model: model || body?.model || "flux",
      n: 1,
      size: body?.size || `${body?.width || 1024}x${body?.height || 1024}`,
    };
    if (body?.response_format) payload.response_format = body.response_format;
    if (body?.quality) payload.quality = body.quality;
    if (body?.image) payload.image = body.image;
    if (body?.safe) payload.safe = body.safe;
    if (body?.user) payload.user = body.user;

    log?.info?.("POLLINATIONS", `Image: model=${payload.model}, size=${payload.size}`);

    const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload), signal });
    if (!response.ok) {
      const err = await response.text().catch(() => "");
      return this.errorResponse(`HTTP ${response.status}: ${err}`, response.status);
    }

    const result = await response.json();
    return {
      response: new Response(JSON.stringify(result), {
        status: 200, headers: { "Content-Type": "application/json" },
      }),
      url, headers, transformedBody: payload,
    };
  }

  // ============ Image Editing ============

  async handleImageEdit(model, body, credentials, signal, log) {
    const prompt = body?.prompt;
    const image = body?.image;
    if (!prompt || !image) return this.errorResponse("Missing prompt or image", 400);

    const url = this.getImageEditsUrl();
    const headers = this.buildHeaders(credentials, "multipart/form-data");
    
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("model", model || body?.model || "flux");
    if (image instanceof Blob || image instanceof File) {
      formData.append("image", image);
    } else if (typeof image === "string") {
      formData.append("image", image);
    }
    if (body?.size) formData.append("size", body.size);

    log?.info?.("POLLINATIONS", `Image Edit: model=${model || "flux"}`);

    const response = await fetch(url, { method: "POST", headers: { "Authorization": credentials?.apiKey ? `Bearer ${credentials.apiKey}` : "" }, body: formData, signal });
    if (!response.ok) {
      const err = await response.text().catch(() => "");
      return this.errorResponse(`HTTP ${response.status}: ${err}`, response.status);
    }

    const result = await response.json();
    return {
      response: new Response(JSON.stringify(result), {
        status: 200, headers: { "Content-Type": "application/json" },
      }),
      url, headers, transformedBody: { prompt },
    };
  }

  // ============ Video Generation ============

  async handleVideo(model, body, credentials, signal, log) {
    const prompt = body?.prompt;
    if (!prompt) return this.errorResponse("Missing prompt", 400);

    const params = new URLSearchParams({
      model: model || body?.model || "veo",
    });
    if (body?.width) params.set("width", String(body.width));
    if (body?.height) params.set("height", String(body.height));
    if (body?.seed) params.set("seed", String(body.seed));
    if (body?.duration) params.set("duration", String(body.duration));
    if (body?.image) params.set("image", body.image);
    if (body?.safe) params.set("safe", "true");
    if (body?.aspectRatio) params.set("aspectRatio", body.aspectRatio);
    if (body?.audio) params.set("audio", "true");

    const videoUrl = `${this.config.baseUrl}/video/${encodeURIComponent(prompt)}?${params}`;
    log?.info?.("POLLINATIONS", `Video: model=${model || "veo"}`);

    return {
      response: new Response(JSON.stringify({
        created: Math.floor(Date.now() / 1000),
        data: [{ url: videoUrl }],
      }), { status: 200, headers: { "Content-Type": "application/json" } }),
      url: videoUrl, headers: {}, transformedBody: { prompt },
    };
  }

  // ============ TTS ============

  async handleTTS(model, body, credentials, signal, log) {
    const text = body?.input || body?.text;
    if (!text) return this.errorResponse("Missing input text", 400);

    const url = this.getAudioSpeechUrl();
    const headers = this.buildHeaders(credentials);
    const payload = {
      input: text,
      model: model || body?.model || "elevenlabs",
      voice: body?.voice || "alloy",
    };
    if (body?.response_format) payload.response_format = body.response_format;
    if (body?.speed) payload.speed = body.speed;
    if (body?.duration) payload.duration = body.duration;
    if (body?.instrumental !== undefined) payload.instrumental = body.instrumental;
    if (body?.seed !== undefined) payload.seed = body.seed;
    if (body?.style) payload.style = body.style;
    if (body?.instruct) payload.instruct = body.instruct;
    if (body?.safe) payload.safe = body.safe;

    log?.info?.("POLLINATIONS", `TTS: model=${payload.model}, voice=${payload.voice}`);

    const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload), signal });
    if (!response.ok) {
      const err = await response.text().catch(() => "");
      return this.errorResponse(`HTTP ${response.status}: ${err}`, response.status);
    }

    return {
      response: new Response(response.body, {
        status: 200,
        headers: { "Content-Type": response.headers.get("Content-Type") || "audio/mpeg" },
      }),
      url, headers, transformedBody: payload,
    };
  }

  // ============ STT ============

  async handleSTT(model, body, credentials, signal, log) {
    const file = body?.file;
    if (!file) return this.errorResponse("Missing file", 400);

    const url = this.getAudioTranscriptionsUrl();
    const headers = { "Authorization": credentials?.apiKey ? `Bearer ${credentials.apiKey}` : "" };
    
    const formData = new FormData();
    if (file instanceof Blob || file instanceof File) {
      formData.append("file", file);
    }
    formData.append("model", model || body?.model || "whisper-large-v3");
    if (body?.language) formData.append("language", body.language);
    if (body?.prompt) formData.append("prompt", body.prompt);
    if (body?.response_format) formData.append("response_format", body.response_format);
    if (body?.temperature !== undefined) formData.append("temperature", String(body.temperature));
    if (body?.speakers_expected) formData.append("speakers_expected", String(body.speakers_expected));

    log?.info?.("POLLINATIONS", `STT: model=${model || "whisper-large-v3"}`);

    const response = await fetch(url, { method: "POST", headers, body: formData, signal });
    if (!response.ok) {
      const err = await response.text().catch(() => "");
      return this.errorResponse(`HTTP ${response.status}: ${err}`, response.status);
    }

    const result = await response.json();
    return {
      response: new Response(JSON.stringify(result), {
        status: 200, headers: { "Content-Type": "application/json" },
      }),
      url, headers, transformedBody: {},
    };
  }

  // ============ Embeddings ============

  async handleEmbeddings(model, body, credentials, signal, log) {
    const input = body?.input;
    if (!input) return this.errorResponse("Missing input", 400);

    const url = this.getEmbeddingsUrl();
    const headers = this.buildHeaders(credentials);
    const payload = {
      input,
      model: model || body?.model || "openai-3-small",
    };
    if (body?.dimensions) payload.dimensions = body.dimensions;
    if (body?.task_type) payload.task_type = body.task_type;
    if (body?.encoding_format) payload.encoding_format = body.encoding_format;

    log?.info?.("POLLINATIONS", `Embeddings: model=${payload.model}`);

    const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload), signal });
    if (!response.ok) {
      const err = await response.text().catch(() => "");
      return this.errorResponse(`HTTP ${response.status}: ${err}`, response.status);
    }

    const result = await response.json();
    return {
      response: new Response(JSON.stringify(result), {
        status: 200, headers: { "Content-Type": "application/json" },
      }),
      url, headers, transformedBody: payload,
    };
  }

  // ============ Models ============

  async handleModels(body, credentials, signal) {
    const listType = body?.list || "v1";
    let url;
    switch (listType) {
      case "all": url = this.getAllModelsUrl(); break;
      case "image": url = this.getImageModelsUrl(); break;
      case "text": url = this.getTextModelsUrl(); break;
      case "audio": url = this.getAudioModelsUrl(); break;
      case "embeddings": url = this.getEmbeddingModelsUrl(); break;
      default: url = this.getModelsUrl();
    }
    const headers = this.buildHeaders(credentials);

    const response = await fetch(url, { method: "GET", headers, signal });
    if (!response.ok) {
      const err = await response.text().catch(() => "");
      return this.errorResponse(`HTTP ${response.status}: ${err}`, response.status);
    }

    const result = await response.json();
    return {
      response: new Response(JSON.stringify(result), {
        status: 200, headers: { "Content-Type": "application/json" },
      }),
      url, headers, transformedBody: {},
    };
  }

  // ============ Upload ============

  async handleUpload(body, credentials, signal) {
    const file = body?.file;
    if (!file) return this.errorResponse("Missing file", 400);

    const url = this.getUploadUrl();
    const headers = { "Authorization": credentials?.apiKey ? `Bearer ${credentials.apiKey}` : "" };
    
    const formData = new FormData();
    if (file instanceof Blob || file instanceof File) {
      formData.append("file", file);
    }

    const response = await fetch(url, { method: "POST", headers, body: formData, signal });
    if (!response.ok) {
      const err = await response.text().catch(() => "");
      return this.errorResponse(`HTTP ${response.status}: ${err}`, response.status);
    }

    const result = await response.json();
    return {
      response: new Response(JSON.stringify(result), {
        status: 200, headers: { "Content-Type": "application/json" },
      }),
      url, headers, transformedBody: {},
    };
  }

  // ============ Media ============

  async handleMedia(body, signal) {
    const hash = body?.hash;
    if (!hash) return this.errorResponse("Missing hash", 400);

    const url = this.getMediaUrl(hash);
    const response = await fetch(url, { method: "GET", signal });
    if (!response.ok) {
      const err = await response.text().catch(() => "");
      return this.errorResponse(`HTTP ${response.status}: ${err}`, response.status);
    }

    return {
      response: new Response(response.body, {
        status: 200,
        headers: { "Content-Type": response.headers.get("Content-Type") || "application/octet-stream" },
      }),
      url, headers: {}, transformedBody: {},
    };
  }

  async handleMediaHead(body, signal) {
    const hash = body?.hash;
    if (!hash) return this.errorResponse("Missing hash", 400);

    const url = this.getMediaHeadUrl(hash);
    const response = await fetch(url, { method: "HEAD", signal });
    if (!response.ok) {
      const err = await response.text().catch(() => "");
      return this.errorResponse(`HTTP ${response.status}: ${err}`, response.status);
    }

    return {
      response: new Response(JSON.stringify({ exists: true, contentType: response.headers.get("Content-Type"), size: response.headers.get("Content-Length") }), {
        status: 200, headers: { "Content-Type": "application/json" },
      }),
      url, headers: {}, transformedBody: {},
    };
  }

  async handleMediaMetadata(body, signal) {
    const hash = body?.hash;
    if (!hash) return this.errorResponse("Missing hash", 400);

    const url = this.getMediaMetadataUrl(hash);
    const response = await fetch(url, { method: "GET", signal });
    if (!response.ok) {
      const err = await response.text().catch(() => "");
      return this.errorResponse(`HTTP ${response.status}: ${err}`, response.status);
    }

    const result = await response.json();
    return {
      response: new Response(JSON.stringify(result), {
        status: 200, headers: { "Content-Type": "application/json" },
      }),
      url, headers: {}, transformedBody: {},
    };
  }

  // ============ Account ============

  async handleAccount(body, credentials, signal) {
    const action = body?.action || "profile";
    let url;
    switch (action) {
      case "profile": url = this.getAccountProfileUrl(); break;
      case "balance": url = this.getAccountBalanceUrl(); break;
      case "usage": url = this.getAccountUsageUrl(); break;
      case "usage-daily": url = this.getAccountUsageDailyUrl(); break;
      case "earnings": url = this.getAccountEarningsUrl(); break;
      case "keys": url = this.getAccountKeysUrl(); break;
      case "key": url = this.getAccountKeyUrl(); break;
      default: url = this.getAccountProfileUrl();
    }

    const headers = this.buildHeaders(credentials);
    const response = await fetch(url, { method: "GET", headers, signal });
    if (!response.ok) {
      const err = await response.text().catch(() => "");
      return this.errorResponse(`HTTP ${response.status}: ${err}`, response.status);
    }

    const result = await response.json();
    return {
      response: new Response(JSON.stringify(result), {
        status: 200, headers: { "Content-Type": "application/json" },
      }),
      url, headers, transformedBody: {},
    };
  }

  // ============ Error ============

  errorResponse(message, status = 500) {
    return {
      response: new Response(JSON.stringify({
        error: { message, type: "upstream_error", code: "POLLINATIONS_ERROR" },
      }), { status, headers: { "Content-Type": "application/json" } }),
      url: "", headers: {}, transformedBody: {},
    };
  }
}

export default PollinationsExecutor;
