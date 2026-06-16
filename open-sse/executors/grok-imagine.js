/**
 * Grok Imagine (xAI) - Complete API Integration
 * 
 * Base URL: https://api.x.ai
 * Auth: Bearer token (x-api-key)
 * 
 * ALL Endpoints:
 * 
 * IMAGE GENERATION:
 * - POST /v1/images/generations  - Text-to-image (1k, 2k resolution)
 * - POST /v1/images/edits        - Image editing (up to 3 source images)
 * 
 * VIDEO GENERATION:
 * - POST /v1/videos/generations  - Text-to-video, image-to-video, reference-to-video
 * - POST /v1/videos/edits        - Video editing
 * - POST /v1/videos/extensions   - Video extension
 * - GET  /v1/videos/{request_id} - Poll video results
 * 
 * Models:
 * - grok-imagine-image          - Fast image generation
 * - grok-imagine-image-quality  - High quality image (recommended)
 * - grok-imagine-video          - Video generation (1-15s)
 * - grok-imagine-video-1.5-preview - Latest video improvements
 */

export class GrokImagineExecutor {
  constructor() {
    this.providerId = "grok-imagine";
    this.config = {
      baseUrl: "https://api.x.ai",
    };
  }

  // ============ URL builders ============

  getImageGenerateUrl() { return `${this.config.baseUrl}/v1/images/generations`; }
  getImageEditUrl() { return `${this.config.baseUrl}/v1/images/edits`; }
  getVideoGenerateUrl() { return `${this.config.baseUrl}/v1/videos/generations`; }
  getVideoEditUrl() { return `${this.config.baseUrl}/v1/videos/edits`; }
  getVideoExtendUrl() { return `${this.config.baseUrl}/v1/videos/extensions`; }
  getVideoStatusUrl(requestId) { return `${this.config.baseUrl}/v1/videos/${requestId}`; }

  // ============ Headers ============

  buildHeaders(credentials, contentType = "application/json") {
    const headers = { "Content-Type": contentType };
    const apiKey = credentials?.apiKey || credentials?.sessionToken || credentials?.key;
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
    if (credentials?.cookie) headers["Cookie"] = credentials.cookie;
    return headers;
  }

  // ============ Execute ============

  async execute({ model, body, stream, credentials, signal, log }) {
    const endpoint = body?.endpoint || "image";

    try {
      switch (endpoint) {
        case "image": return await this.handleImage(model, body, credentials, signal, log);
        case "edit": return await this.handleImageEdit(model, body, credentials, signal, log);
        case "video": return await this.handleVideo(model, body, credentials, signal, log);
        case "video-edit": return await this.handleVideoEdit(model, body, credentials, signal, log);
        case "video-extend": return await this.handleVideoExtend(model, body, credentials, signal, log);
        case "video-status": return await this.handleVideoStatus(body, credentials, signal, log);
        default: return await this.handleImage(model, body, credentials, signal, log);
      }
    } catch (err) {
      log?.error?.("GROK", `Error: ${err.message}`);
      return this.errorResponse(`Grok failed: ${err.message}`, 502);
    }
  }

  // ============ Image Generation ============

  async handleImage(model, body, credentials, signal, log) {
    const prompt = body?.prompt;
    if (!prompt) return this.errorResponse("Missing prompt", 400);

    const url = this.getImageGenerateUrl();
    const headers = this.buildHeaders(credentials);

    const payload = {
      model: model || body?.model || "grok-imagine-image-quality",
      prompt,
    };
    if (body?.n) payload.n = body.n;
    if (body?.aspect_ratio) payload.aspect_ratio = body.aspect_ratio;
    if (body?.resolution) payload.resolution = body.resolution;
    if (body?.response_format) payload.response_format = body.response_format;
    if (body?.user) payload.user = body.user;
    if (body?.storage_options) payload.storage_options = body.storage_options;

    log?.info?.("GROK", `Image: model=${payload.model}, ratio=${payload.aspect_ratio || "auto"}`);

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
    if (!prompt) return this.errorResponse("Missing prompt", 400);

    const hasImage = body?.image;
    const hasImages = body?.images && Array.isArray(body.images) && body.images.length > 0;
    if (!hasImage && !hasImages) return this.errorResponse("Missing image or images array", 400);

    const url = this.getImageEditUrl();
    const headers = this.buildHeaders(credentials);

    const payload = {
      model: model || body?.model || "grok-imagine-image-quality",
      prompt,
    };
    if (hasImage) payload.image = body.image;
    if (hasImages) payload.images = body.images;
    if (body?.n) payload.n = body.n;
    if (body?.aspect_ratio) payload.aspect_ratio = body.aspect_ratio;
    if (body?.resolution) payload.resolution = body.resolution;
    if (body?.response_format) payload.response_format = body.response_format;
    if (body?.user) payload.user = body.user;
    if (body?.storage_options) payload.storage_options = body.storage_options;

    log?.info?.("GROK", `Edit: model=${payload.model}, images=${hasImages ? body.images.length : 1}`);

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
      model: model || body?.model || "grok-imagine-video",
      prompt,
    };
    if (body?.duration) payload.duration = body.duration;
    if (body?.aspect_ratio) payload.aspect_ratio = body.aspect_ratio;
    if (body?.resolution) payload.resolution = body.resolution;
    if (body?.image) payload.image = body.image;
    if (body?.reference_images) payload.reference_images = body.reference_images;
    if (body?.user) payload.user = body.user;
    if (body?.storage_options) payload.storage_options = body.storage_options;

    log?.info?.("GROK", `Video: model=${payload.model}, duration=${payload.duration || 8}s`);

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

  // ============ Video Editing ============

  async handleVideoEdit(model, body, credentials, signal, log) {
    const prompt = body?.prompt;
    const video = body?.video;
    if (!prompt) return this.errorResponse("Missing prompt", 400);
    if (!video) return this.errorResponse("Missing video", 400);

    const url = this.getVideoEditUrl();
    const headers = this.buildHeaders(credentials);

    const payload = {
      model: model || body?.model || "grok-imagine-video",
      prompt,
      video,
    };
    if (body?.user) payload.user = body.user;
    if (body?.storage_options) payload.storage_options = body.storage_options;

    log?.info?.("GROK", `Video edit: model=${payload.model}`);

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

  // ============ Video Extension ============

  async handleVideoExtend(model, body, credentials, signal, log) {
    const prompt = body?.prompt;
    const video = body?.video;
    if (!prompt) return this.errorResponse("Missing prompt", 400);
    if (!video) return this.errorResponse("Missing video", 400);

    const url = this.getVideoExtendUrl();
    const headers = this.buildHeaders(credentials);

    const payload = {
      model: model || body?.model || "grok-imagine-video",
      prompt,
      video,
    };
    if (body?.duration) payload.duration = body.duration;
    if (body?.user) payload.user = body.user;
    if (body?.storage_options) payload.storage_options = body.storage_options;

    log?.info?.("GROK", `Video extend: model=${payload.model}, duration=${payload.duration || 6}s`);

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

  // ============ Video Status ============

  async handleVideoStatus(body, credentials, signal, log) {
    const requestId = body?.request_id;
    if (!requestId) return this.errorResponse("Missing request_id", 400);

    const url = this.getVideoStatusUrl(requestId);
    const headers = this.buildHeaders(credentials);

    log?.info?.("GROK", `Video status: ${requestId}`);

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
        error: { message, type: "upstream_error", code: "GROK_ERROR" },
      }), { status, headers: { "Content-Type": "application/json" } }),
      url: "", headers: {}, transformedBody: {},
    };
  }
}

export default GrokImagineExecutor;