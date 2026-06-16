/**
 * Jimeng/Dreamina (ByteDance) - Complete API Integration
 * 
 * Base URLs:
 * - https://jimeng.jianying.com (Chinese)
 * - https://dreamina.com (International)
 * 
 * Auth: Session token (from cookies) or Bearer token
 * 
 * ALL Endpoints:
 * 
 * IMAGE GENERATION:
 * - POST /v1/images/generations          - Text-to-image (OpenAI-compatible)
 * - POST /v1/images/compositions         - Image-to-image (composition)
 * - POST /mweb/v1/aigc_draft/generate    - Internal draft generation
 * 
 * VIDEO GENERATION:
 * - POST /v1/videos/generations          - Video generation (OpenAI-compatible)
 * 
 * AVATAR:
 * - POST /v1/avatar/generate             - Avatar generation
 * - POST /v1/avatar/talking              - Talking avatar
 * 
 * SMART CANVAS:
 * - POST /v1/canvas/redraw               - Partial redraw
 * - POST /v1/canvas/expand               - One-click expansion
 * - POST /v1/canvas/eliminate             - Object elimination
 * - POST /v1/canvas/cutout               - Background removal
 * 
 * MODELS:
 * - GET  /v1/models                      - List available models
 * 
 * TOKEN MANAGEMENT:
 * - POST /token/check                    - Check token status
 * - POST /token/points                   - Get credit points
 * - POST /token/receive                  - Receive daily credits
 * 
 * ASSETS:
 * - POST /v1/assets/upload               - Upload asset
 * - GET  /v1/assets                      - List assets
 * - GET  /v1/assets/{id}                 - Get asset
 * 
 * HISTORY:
 * - GET  /v1/history/images              - Image generation history
 * - GET  /v1/history/videos              - Video generation history
 */

export class JimengExecutor {
  constructor() {
    this.providerId = "jimeng";
    this.config = {
      baseUrl: "https://jimeng.jianying.com",
      dreaminaUrl: "https://dreamina.com",
      apiBaseUrl: "https://jimeng.jianying.com/mweb/v1",
    };
  }

  // ============ URL builders ============

  getImageGenerateUrl() { return `${this.config.baseUrl}/v1/images/generations`; }
  getImageCompositionsUrl() { return `${this.config.baseUrl}/v1/images/compositions`; }
  getVideoGenerateUrl() { return `${this.config.baseUrl}/v1/videos/generations`; }
  getAvatarGenerateUrl() { return `${this.config.baseUrl}/v1/avatar/generate`; }
  getAvatarTalkingUrl() { return `${this.config.baseUrl}/v1/avatar/talking`; }
  getCanvasRedrawUrl() { return `${this.config.baseUrl}/v1/canvas/redraw`; }
  getCanvasExpandUrl() { return `${this.config.baseUrl}/v1/canvas/expand`; }
  getCanvasEliminateUrl() { return `${this.config.baseUrl}/v1/canvas/eliminate`; }
  getCanvasCutoutUrl() { return `${this.config.baseUrl}/v1/canvas/cutout`; }
  getModelsUrl() { return `${this.config.baseUrl}/v1/models`; }
  getTokenCheckUrl() { return `${this.config.baseUrl}/token/check`; }
  getTokenPointsUrl() { return `${this.config.baseUrl}/token/points`; }
  getTokenReceiveUrl() { return `${this.config.baseUrl}/token/receive`; }
  getAssetsUrl() { return `${this.config.baseUrl}/v1/assets`; }
  getAssetUrl(id) { return `${this.config.baseUrl}/v1/assets/${id}`; }
  getHistoryImagesUrl() { return `${this.config.baseUrl}/v1/history/images`; }
  getHistoryVideosUrl() { return `${this.config.baseUrl}/v1/history/videos`; }

  // ============ Headers ============

  buildHeaders(credentials, contentType = "application/json") {
    const headers = {
      "Content-Type": contentType,
      "Origin": this.config.baseUrl,
      "Referer": `${this.config.baseUrl}/`,
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    };

    const token = credentials?.apiKey || credentials?.sessionToken || credentials?.token;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    if (credentials?.cookie) headers["Cookie"] = credentials.cookie;

    return headers;
  }

  // ============ Execute ============

  async execute({ model, body, stream, credentials, signal, log }) {
    const endpoint = body?.endpoint || "image";
    
    try {
      switch (endpoint) {
        case "image": return await this.handleImage(model, body, credentials, signal, log);
        case "compose": return await this.handleComposition(model, body, credentials, signal, log);
        case "video": return await this.handleVideo(model, body, credentials, signal, log);
        case "avatar": return await this.handleAvatar(model, body, credentials, signal, log);
        case "avatar-talking": return await this.handleAvatarTalking(model, body, credentials, signal, log);
        case "canvas-redraw": return await this.handleCanvasRedraw(body, credentials, signal, log);
        case "canvas-expand": return await this.handleCanvasExpand(body, credentials, signal, log);
        case "canvas-eliminate": return await this.handleCanvasEliminate(body, credentials, signal, log);
        case "canvas-cutout": return await this.handleCanvasCutout(body, credentials, signal, log);
        case "models": return await this.handleModels(credentials, signal);
        case "token-check": return await this.handleTokenCheck(body, credentials, signal, log);
        case "token-points": return await this.handleTokenPoints(credentials, signal, log);
        case "token-receive": return await this.handleTokenReceive(credentials, signal, log);
        case "assets": return await this.handleAssets(body, credentials, signal, log);
        case "asset": return await this.handleAsset(body, credentials, signal, log);
        case "upload": return await this.handleUpload(body, credentials, signal, log);
        case "history-images": return await this.handleHistoryImages(body, credentials, signal, log);
        case "history-videos": return await this.handleHistoryVideos(body, credentials, signal, log);
        default: return await this.handleImage(model, body, credentials, signal, log);
      }
    } catch (err) {
      log?.error?.("JIMENG", `Error: ${err.message}`);
      return this.errorResponse(`Jimeng failed: ${err.message}`, 502);
    }
  }

  // ============ Image Generation ============

  async handleImage(model, body, credentials, signal, log) {
    const prompt = body?.prompt;
    if (!prompt) return this.errorResponse("Missing prompt", 400);

    const url = this.getImageGenerateUrl();
    const headers = this.buildHeaders(credentials);

    const payload = {
      prompt,
      model: model || body?.model || "jimeng-5.0",
    };
    if (body?.negative_prompt) payload.negative_prompt = body.negative_prompt;
    if (body?.ratio) payload.ratio = body.ratio;
    if (body?.resolution) payload.resolution = body.resolution;
    if (body?.intelligent_ratio !== undefined) payload.intelligent_ratio = body.intelligent_ratio;
    if (body?.sample_strength !== undefined) payload.sample_strength = body.sample_strength;
    if (body?.response_format) payload.response_format = body.response_format;
    if (body?.style) payload.style = body.style;
    if (body?.seed !== undefined) payload.seed = body.seed;

    log?.info?.("JIMENG", `Image: model=${payload.model}, ratio=${payload.ratio || "1:1"}`);

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

  // ============ Image Composition ============

  async handleComposition(model, body, credentials, signal, log) {
    const prompt = body?.prompt;
    const images = body?.images;
    if (!prompt) return this.errorResponse("Missing prompt", 400);
    if (!images || !Array.isArray(images) || images.length === 0) return this.errorResponse("Missing images array", 400);

    const url = this.getImageCompositionsUrl();
    const headers = this.buildHeaders(credentials);

    const payload = {
      prompt,
      images,
      model: model || body?.model || "jimeng-5.0",
    };
    if (body?.negative_prompt) payload.negative_prompt = body.negative_prompt;
    if (body?.ratio) payload.ratio = body.ratio;
    if (body?.resolution) payload.resolution = body.resolution;
    if (body?.intelligent_ratio !== undefined) payload.intelligent_ratio = body.intelligent_ratio;
    if (body?.sample_strength !== undefined) payload.sample_strength = body.sample_strength;
    if (body?.response_format) payload.response_format = body.response_format;

    log?.info?.("JIMENG", `Composition: model=${payload.model}, images=${images.length}`);

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

  // ============ Video Generation ============

  async handleVideo(model, body, credentials, signal, log) {
    const prompt = body?.prompt;
    if (!prompt) return this.errorResponse("Missing prompt", 400);

    const url = this.getVideoGenerateUrl();
    const headers = this.buildHeaders(credentials);

    const payload = {
      prompt,
      model: model || body?.model || "jimeng-video-seedance-2.0",
    };
    if (body?.ratio) payload.ratio = body.ratio;
    if (body?.resolution) payload.resolution = body.resolution;
    if (body?.duration) payload.duration = body.duration;
    if (body?.file_paths) payload.file_paths = body.file_paths;
    if (body?.functionMode) payload.functionMode = body.functionMode;
    if (body?.response_format) payload.response_format = body.response_format;
    if (body?.reference_images) payload.reference_images = body.reference_images;
    if (body?.first_frame_image) payload.first_frame_image = body.first_frame_image;
    if (body?.last_frame_image) payload.last_frame_image = body.last_frame_image;

    log?.info?.("JIMENG", `Video: model=${payload.model}, duration=${payload.duration || 5}s`);

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

  // ============ Avatar Generation ============

  async handleAvatar(model, body, credentials, signal, log) {
    const prompt = body?.prompt;
    if (!prompt) return this.errorResponse("Missing prompt", 400);

    const url = this.getAvatarGenerateUrl();
    const headers = this.buildHeaders(credentials);

    const payload = {
      prompt,
      model: model || body?.model || "avatar-1.0",
    };
    if (body?.style) payload.style = body.style;
    if (body?.image_url) payload.image_url = body.image_url;

    log?.info?.("JIMENG", `Avatar: model=${payload.model}`);

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

  // ============ Talking Avatar ============

  async handleAvatarTalking(model, body, credentials, signal, log) {
    const image_url = body?.image_url;
    const audio_url = body?.audio_url;
    if (!image_url) return this.errorResponse("Missing image_url", 400);
    if (!audio_url) return this.errorResponse("Missing audio_url", 400);

    const url = this.getAvatarTalkingUrl();
    const headers = this.buildHeaders(credentials);

    const payload = {
      image_url,
      audio_url,
      model: model || body?.model || "talking-1.0",
    };
    if (body?.duration) payload.duration = body.duration;

    log?.info?.("JIMENG", `Talking avatar: model=${payload.model}`);

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

  // ============ Canvas Operations ============

  async handleCanvasRedraw(body, credentials, signal, log) {
    const image_url = body?.image_url;
    const mask = body?.mask;
    if (!image_url) return this.errorResponse("Missing image_url", 400);
    if (!mask) return this.errorResponse("Missing mask", 400);

    const url = this.getCanvasRedrawUrl();
    const headers = this.buildHeaders(credentials);

    const payload = { image_url, mask };
    if (body?.prompt) payload.prompt = body.prompt;
    if (body?.strength !== undefined) payload.strength = body.strength;

    log?.info?.("JIMENG", "Canvas redraw");

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

  async handleCanvasExpand(body, credentials, signal, log) {
    const image_url = body?.image_url;
    if (!image_url) return this.errorResponse("Missing image_url", 400);

    const url = this.getCanvasExpandUrl();
    const headers = this.buildHeaders(credentials);

    const payload = { image_url };
    if (body?.direction) payload.direction = body.direction;
    if (body?.ratio) payload.ratio = body.ratio;

    log?.info?.("JIMENG", "Canvas expand");

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

  async handleCanvasEliminate(body, credentials, signal, log) {
    const image_url = body?.image_url;
    const mask = body?.mask;
    if (!image_url) return this.errorResponse("Missing image_url", 400);
    if (!mask) return this.errorResponse("Missing mask", 400);

    const url = this.getCanvasEliminateUrl();
    const headers = this.buildHeaders(credentials);

    const payload = { image_url, mask };

    log?.info?.("JIMENG", "Canvas eliminate");

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

  async handleCanvasCutout(body, credentials, signal, log) {
    const image_url = body?.image_url;
    if (!image_url) return this.errorResponse("Missing image_url", 400);

    const url = this.getCanvasCutoutUrl();
    const headers = this.buildHeaders(credentials);

    const payload = { image_url };

    log?.info?.("JIMENG", "Canvas cutout");

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

  async handleModels(credentials, signal) {
    const url = this.getModelsUrl();
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

  // ============ Token Management ============

  async handleTokenCheck(body, credentials, signal, log) {
    const token = body?.token || credentials?.apiKey;
    if (!token) return this.errorResponse("Missing token", 400);

    const url = this.getTokenCheckUrl();
    const headers = this.buildHeaders(credentials);

    log?.info?.("JIMENG", "Token check");

    const response = await fetch(url, { method: "POST", headers, body: JSON.stringify({ token }), signal });
    if (!response.ok) {
      const err = await response.text().catch(() => "");
      return this.errorResponse(`HTTP ${response.status}: ${err}`, response.status);
    }

    const result = await response.json();
    return {
      response: new Response(JSON.stringify(result), {
        status: 200, headers: { "Content-Type": "application/json" },
      }),
      url, headers, transformedBody: { token },
    };
  }

  async handleTokenPoints(credentials, signal, log) {
    const url = this.getTokenPointsUrl();
    const headers = this.buildHeaders(credentials);

    log?.info?.("JIMENG", "Token points");

    const response = await fetch(url, { method: "POST", headers, signal });
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

  async handleTokenReceive(credentials, signal, log) {
    const url = this.getTokenReceiveUrl();
    const headers = this.buildHeaders(credentials);

    log?.info?.("JIMENG", "Token receive daily credits");

    const response = await fetch(url, { method: "POST", headers, signal });
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

  // ============ Assets ============

  async handleAssets(body, credentials, signal, log) {
    const url = new URL(this.getAssetsUrl());
    if (body?.limit) url.searchParams.set("limit", String(body.limit));
    if (body?.cursor) url.searchParams.set("cursor", body.cursor);

    const headers = this.buildHeaders(credentials);
    log?.info?.("JIMENG", "List assets");

    const response = await fetch(url.toString(), { method: "GET", headers, signal });
    if (!response.ok) {
      const err = await response.text().catch(() => "");
      return this.errorResponse(`HTTP ${response.status}: ${err}`, response.status);
    }

    const result = await response.json();
    return {
      response: new Response(JSON.stringify(result), {
        status: 200, headers: { "Content-Type": "application/json" },
      }),
      url: url.toString(), headers, transformedBody: {},
    };
  }

  async handleAsset(body, credentials, signal, log) {
    const assetId = body?.asset_id;
    if (!assetId) return this.errorResponse("Missing asset_id", 400);

    const url = this.getAssetUrl(assetId);
    const headers = this.buildHeaders(credentials);

    log?.info?.("JIMENG", `Get asset: ${assetId}`);

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

  async handleUpload(body, credentials, signal, log) {
    const file = body?.file;
    if (!file) return this.errorResponse("Missing file", 400);

    const url = `${this.getAssetsUrl()}/upload`;
    const headers = this.buildHeaders(credentials, undefined);

    const formData = new FormData();
    if (file instanceof Blob || file instanceof File) {
      formData.append("file", file);
    }
    if (body?.type) formData.append("type", body.type);

    log?.info?.("JIMENG", "Upload asset");

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

  // ============ History ============

  async handleHistoryImages(body, credentials, signal, log) {
    const url = new URL(this.getHistoryImagesUrl());
    if (body?.limit) url.searchParams.set("limit", String(body.limit));
    if (body?.cursor) url.searchParams.set("cursor", body.cursor);

    const headers = this.buildHeaders(credentials);
    log?.info?.("JIMENG", "Image history");

    const response = await fetch(url.toString(), { method: "GET", headers, signal });
    if (!response.ok) {
      const err = await response.text().catch(() => "");
      return this.errorResponse(`HTTP ${response.status}: ${err}`, response.status);
    }

    const result = await response.json();
    return {
      response: new Response(JSON.stringify(result), {
        status: 200, headers: { "Content-Type": "application/json" },
      }),
      url: url.toString(), headers, transformedBody: {},
    };
  }

  async handleHistoryVideos(body, credentials, signal, log) {
    const url = new URL(this.getHistoryVideosUrl());
    if (body?.limit) url.searchParams.set("limit", String(body.limit));
    if (body?.cursor) url.searchParams.set("cursor", body.cursor);

    const headers = this.buildHeaders(credentials);
    log?.info?.("JIMENG", "Video history");

    const response = await fetch(url.toString(), { method: "GET", headers, signal });
    if (!response.ok) {
      const err = await response.text().catch(() => "");
      return this.errorResponse(`HTTP ${response.status}: ${err}`, response.status);
    }

    const result = await response.json();
    return {
      response: new Response(JSON.stringify(result), {
        status: 200, headers: { "Content-Type": "application/json" },
      }),
      url: url.toString(), headers, transformedBody: {},
    };
  }

  // ============ Error ============

  errorResponse(message, status = 500) {
    return {
      response: new Response(JSON.stringify({
        error: { message, type: "upstream_error", code: "JIMENG_ERROR" },
      }), { status, headers: { "Content-Type": "application/json" } }),
      url: "", headers: {}, transformedBody: {},
    };
  }
}

export default JimengExecutor;