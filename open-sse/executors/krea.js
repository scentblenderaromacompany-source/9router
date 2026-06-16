/**
 * Krea AI - Complete API Integration
 * 
 * Base URL: https://api.krea.ai
 * Auth: Bearer token (API key)
 * 
 * ALL Endpoints:
 * 
 * IMAGE GENERATION (25 models):
 * - POST /generate/image/krea/krea-2-large
 * - POST /generate/image/krea/krea-2-medium
 * - POST /generate/image/krea/krea-2-medium-turbo
 * - POST /generate/image/openai/gpt-image
 * - POST /generate/image/openai/chatgpt-2
 * - POST /generate/image/bfl/flux
 * - POST /generate/image/bfl/flux-1.1-pro
 * - POST /generate/image/bfl/flux-1.1-pro-ultra
 * - POST /generate/image/bfl/flux-kontext
 * - POST /generate/image/ideogram/ideogram-2.0a-turbo
 * - POST /generate/image/ideogram/ideogram-3.0
 * - POST /generate/image/google/imagen-3
 * - POST /generate/image/google/imagen-4
 * - POST /generate/image/google/imagen-4-fast
 * - POST /generate/image/google/imagen-4-ultra
 * - POST /generate/image/luma/luma-uni-1
 * - POST /generate/image/nano-banana/nano-banana
 * - POST /generate/image/nano-banana/nano-banana-2
 * - POST /generate/image/nano-banana/nano-banana-pro
 * - POST /generate/image/qwen/qwen-2512
 * - POST /generate/image/runway/runway-gen-4
 * - POST /generate/image/seededit/seededit
 * - POST /generate/image/seedream/seedream-4
 * - POST /generate/image/seedream/seedream-5-lite
 * - POST /generate/image/z-image/z-image
 * 
 * VIDEO GENERATION (31 models):
 * - POST /generate/video/xai/grok-imagine
 * - POST /generate/video/hailuo/hailuo
 * - POST /generate/video/hailuo/hailuo-02
 * - POST /generate/video/hailuo/hailuo-2.3
 * - POST /generate/video/hailuo/hailuo-2.3-fast
 * - POST /generate/video/kling/kling-1.0
 * - POST /generate/video/kling/kling-1.5
 * - POST /generate/video/kling/kling-1.6
 * - POST /generate/video/kling/kling-2.0
 * - POST /generate/video/kling/kling-2.1
 * - POST /generate/video/kling/kling-2.5
 * - POST /generate/video/kling/kling-2.6
 * - POST /generate/video/kling/kling-3.0
 * - POST /generate/video/kling/kling-o1
 * - POST /generate/video/ltx/ltx-2.3-22b
 * - POST /generate/video/ray/ray-2
 * - POST /generate/video/runway/runway-aleph
 * - POST /generate/video/runway/runway-gen-3
 * - POST /generate/video/runway/runway-gen-4
 * - POST /generate/video/runway/runway-gen-4.5
 * - POST /generate/video/seedance/seedance-pro
 * - POST /generate/video/seedance/seedance-pro-fast
 * - POST /generate/video/google/veo-2
 * - POST /generate/video/google/veo-3
 * - POST /generate/video/google/veo-3-fast
 * - POST /generate/video/google/veo-3.1
 * - POST /generate/video/google/veo-3.1-fast
 * - POST /generate/video/google/veo-3.1-lite
 * - POST /generate/video/wan/wan-2.1
 * - POST /generate/video/wan/wan-2.2
 * - POST /generate/video/wan/wan-2.5
 * 
 * ENHANCE/UPSCALE (3 models):
 * - POST /generate/enhance/topaz/standard-enhance
 * - POST /generate/enhance/topaz/bloom
 * - POST /generate/enhance/topaz/generative
 * 
 * 3D GENERATION:
 * - POST /generate/3d
 * 
 * JOBS:
 * - GET  /jobs
 * - GET  /jobs/{id}
 * - DELETE /jobs/{id}
 * 
 * STYLES (LoRA):
 * - GET  /styles
 * - GET  /styles/{id}
 * - POST /styles/train
 * - PATCH /styles/{id}
 * - DELETE /styles/{id}
 * - POST /styles/{id}/share
 * - POST /styles/{id}/workspace
 * 
 * ASSETS:
 * - GET  /assets
 * - GET  /assets/{id}
 * - POST /assets (multipart upload)
 * - DELETE /assets/{id}
 * 
 * NODE APPS:
 * - GET  /node-apps
 * - GET  /node-apps/{id}
 * - POST /node-apps/{id}/execute
 */

export class KreaExecutor {
  constructor() {
    this.providerId = "krea";
    this.config = {
      baseUrl: "https://api.krea.ai",
    };
  }

  // ============ URL builders ============

  getJobStatusUrl(jobId) { return `${this.config.baseUrl}/jobs/${jobId}`; }
  getJobsUrl() { return `${this.config.baseUrl}/jobs`; }
  getImageGenerateUrl(provider, model) { return `${this.config.baseUrl}/generate/image/${provider}/${model}`; }
  getEnhanceUrl(model) { return `${this.config.baseUrl}/generate/enhance/topaz/${model}`; }
  getVideoGenerateUrl(provider, model) { return `${this.config.baseUrl}/generate/video/${provider}/${model}`; }
  get3DGenerateUrl() { return `${this.config.baseUrl}/generate/3d`; }
  getStylesUrl() { return `${this.config.baseUrl}/styles`; }
  getStyleUrl(id) { return `${this.config.baseUrl}/styles/${id}`; }
  getStyleShareUrl(id) { return `${this.config.baseUrl}/styles/${id}/share`; }
  getStyleWorkspaceUrl(id) { return `${this.config.baseUrl}/styles/${id}/workspace`; }
  getTrainUrl() { return `${this.config.baseUrl}/styles/train`; }
  getAssetsUrl() { return `${this.config.baseUrl}/assets`; }
  getAssetUrl(id) { return `${this.config.baseUrl}/assets/${id}`; }
  getNodeAppsUrl() { return `${this.config.baseUrl}/node-apps`; }
  getNodeAppUrl(id) { return `${this.config.baseUrl}/node-apps/${id}`; }
  getNodeAppExecuteUrl(id) { return `${this.config.baseUrl}/node-apps/${id}/execute`; }

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
    const endpoint = body?.endpoint || "image";
    
    try {
      switch (endpoint) {
        case "image": return await this.handleImage(model, body, credentials, signal, log);
        case "enhance": return await this.handleEnhance(model, body, credentials, signal, log);
        case "video": return await this.handleVideo(model, body, credentials, signal, log);
        case "3d": return await this.handle3D(model, body, credentials, signal, log);
        case "jobs": return await this.handleJobs(body, credentials, signal, log);
        case "job": return await this.handleJob(body, credentials, signal, log);
        case "cancel": return await this.handleCancel(body, credentials, signal, log);
        case "styles": return await this.handleStyles(body, credentials, signal, log);
        case "style": return await this.handleStyle(body, credentials, signal, log);
        case "style-share": return await this.handleStyleShare(body, credentials, signal, log);
        case "style-workspace": return await this.handleStyleWorkspace(body, credentials, signal, log);
        case "train": return await this.handleTrain(body, credentials, signal, log);
        case "style-update": return await this.handleStyleUpdate(body, credentials, signal, log);
        case "assets": return await this.handleAssets(body, credentials, signal, log);
        case "asset": return await this.handleAsset(body, credentials, signal, log);
        case "upload": return await this.handleUpload(body, credentials, signal, log);
        case "node-apps": return await this.handleNodeApps(body, credentials, signal, log);
        case "node-app": return await this.handleNodeApp(body, credentials, signal, log);
        case "node-app-execute": return await this.handleNodeAppExecute(body, credentials, signal, log);
        default: return await this.handleImage(model, body, credentials, signal, log);
      }
    } catch (err) {
      log?.error?.("KREA", `Error: ${err.message}`);
      return this.errorResponse(`Krea failed: ${err.message}`, 502);
    }
  }

  // ============ Image Generation ============

  async handleImage(model, body, credentials, signal, log) {
    const prompt = body?.prompt;
    if (!prompt) return this.errorResponse("Missing prompt", 400);

    const modelStr = model || body?.model || "bfl/flux";
    const [provider, modelName] = modelStr.includes("/") ? modelStr.split("/", 2) : ["bfl", modelStr];

    const url = this.getImageGenerateUrl(provider, modelName);
    const headers = this.buildHeaders(credentials);

    const payload = { prompt };
    if (body?.width) payload.width = body.width;
    if (body?.height) payload.height = body.height;
    if (body?.aspect_ratio) payload.aspect_ratio = body.aspect_ratio;
    if (body?.seed !== undefined) payload.seed = body.seed;
    if (body?.image_url) payload.image_url = body.image_url;
    if (body?.image_urls) payload.image_urls = body.image_urls;
    if (body?.strength !== undefined) payload.strength = body.strength;
    if (body?.quality) payload.quality = body.quality;
    if (body?.styles) payload.styles = body.styles;
    if (body?.style_images) payload.style_images = body.style_images;
    if (body?.image_style_references) payload.image_style_references = body.image_style_references;
    if (body?.guidance_scale !== undefined) payload.guidance_scale = body.guidance_scale;
    if (body?.creativity) payload.creativity = body.creativity;
    if (body?.intensity !== undefined) payload.intensity = body.intensity;
    if (body?.complexity !== undefined) payload.complexity = body.complexity;
    if (body?.moodboards) payload.moodboards = body.moodboards;

    if (body?.webhook_url) headers["X-Webhook-URL"] = body.webhook_url;

    log?.info?.("KREA", `Image: ${provider}/${modelName}`);

    const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload), signal });
    if (!response.ok) {
      const err = await response.text().catch(() => "");
      return this.errorResponse(`HTTP ${response.status}: ${err}`, response.status);
    }

    const result = await response.json();
    if (result.job_id) return await this.pollJob(result.job_id, credentials, signal, log);

    return {
      response: new Response(JSON.stringify(result), {
        status: 200, headers: { "Content-Type": "application/json" },
      }),
      url, headers, transformedBody: payload,
    };
  }

  // ============ Image Enhancement ============

  async handleEnhance(model, body, credentials, signal, log) {
    const image_url = body?.image_url;
    if (!image_url) return this.errorResponse("Missing image_url", 400);
    if (!body?.width || !body?.height) return this.errorResponse("Missing width/height", 400);

    const modelStr = model || body?.model || "standard-enhance";
    const url = this.getEnhanceUrl(modelStr);
    const headers = this.buildHeaders(credentials);

    const payload = {
      image_url,
      width: body.width,
      height: body.height,
    };
    if (body?.model_name) payload.model = body.model_name;
    if (body?.output_format) payload.output_format = body.output_format;
    if (body?.subject_detection) payload.subject_detection = body.subject_detection;
    if (body?.face_enhancement !== undefined) payload.face_enhancement = body.face_enhancement;
    if (body?.face_enhancement_creativity !== undefined) payload.face_enhancement_creativity = body.face_enhancement_creativity;
    if (body?.face_enhancement_strength !== undefined) payload.face_enhancement_strength = body.face_enhancement_strength;
    if (body?.crop_to_fill !== undefined) payload.crop_to_fill = body.crop_to_fill;
    if (body?.upscaling_activated !== undefined) payload.upscaling_activated = body.upscaling_activated;
    if (body?.image_scaling_factor !== undefined) payload.image_scaling_factor = body.image_scaling_factor;
    if (body?.sharpen !== undefined) payload.sharpen = body.sharpen;
    if (body?.denoise !== undefined) payload.denoise = body.denoise;
    if (body?.fix_compression !== undefined) payload.fix_compression = body.fix_compression;
    if (body?.strength !== undefined) payload.strength = body.strength;
    if (body?.seed !== undefined) payload.seed = body.seed;

    log?.info?.("KREA", `Enhance: ${modelStr}`);

    const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload), signal });
    if (!response.ok) {
      const err = await response.text().catch(() => "");
      return this.errorResponse(`HTTP ${response.status}: ${err}`, response.status);
    }

    const result = await response.json();
    if (result.job_id) return await this.pollJob(result.job_id, credentials, signal, log);

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

    const modelStr = model || body?.model || "google/veo-3.1";
    const [provider, modelName] = modelStr.includes("/") ? modelStr.split("/", 2) : ["google", modelStr];

    const url = this.getVideoGenerateUrl(provider, modelName);
    const headers = this.buildHeaders(credentials);

    const payload = { prompt };
    if (body?.start_image) payload.start_image = body.start_image;
    if (body?.end_image) payload.end_image = body.end_image;
    if (body?.reference_images) payload.reference_images = body.reference_images;
    if (body?.aspect_ratio) payload.aspect_ratio = body.aspect_ratio;
    if (body?.duration) payload.duration = body.duration;
    if (body?.resolution) payload.resolution = body.resolution;
    if (body?.mode) payload.mode = body.mode;
    if (body?.generate_audio !== undefined) payload.generate_audio = body.generate_audio;
    if (body?.expand_prompt !== undefined) payload.expand_prompt = body.expand_prompt;
    if (body?.multi_prompt) payload.multi_prompt = body.multi_prompt;

    if (body?.webhook_url) headers["X-Webhook-URL"] = body.webhook_url;

    log?.info?.("KREA", `Video: ${provider}/${modelName}`);

    const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload), signal });
    if (!response.ok) {
      const err = await response.text().catch(() => "");
      return this.errorResponse(`HTTP ${response.status}: ${err}`, response.status);
    }

    const result = await response.json();
    if (result.job_id) return await this.pollJob(result.job_id, credentials, signal, log);

    return {
      response: new Response(JSON.stringify(result), {
        status: 200, headers: { "Content-Type": "application/json" },
      }),
      url, headers, transformedBody: payload,
    };
  }

  // ============ 3D Generation ============

  async handle3D(model, body, credentials, signal, log) {
    const prompt = body?.prompt;
    if (!prompt) return this.errorResponse("Missing prompt", 400);

    const url = this.get3DGenerateUrl();
    const headers = this.buildHeaders(credentials);

    const payload = { prompt };
    if (body?.image_url) payload.image_url = body.image_url;
    if (body?.style) payload.style = body.style;
    if (body?.texture_quality) payload.texture_quality = body.texture_quality;
    if (body?.polygon_count) payload.polygon_count = body.polygon_count;

    if (body?.webhook_url) headers["X-Webhook-URL"] = body.webhook_url;

    log?.info?.("KREA", "3D generation");

    const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload), signal });
    if (!response.ok) {
      const err = await response.text().catch(() => "");
      return this.errorResponse(`HTTP ${response.status}: ${err}`, response.status);
    }

    const result = await response.json();
    if (result.job_id) return await this.pollJob(result.job_id, credentials, signal, log);

    return {
      response: new Response(JSON.stringify(result), {
        status: 200, headers: { "Content-Type": "application/json" },
      }),
      url, headers, transformedBody: payload,
    };
  }

  // ============ Job Management ============

  async handleJobs(body, credentials, signal, log) {
    const url = new URL(this.getJobsUrl());
    if (body?.cursor) url.searchParams.set("cursor", body.cursor);
    if (body?.limit) url.searchParams.set("limit", String(body.limit));
    if (body?.types) url.searchParams.set("types", body.types);
    if (body?.status) url.searchParams.set("status", body.status);

    const headers = this.buildHeaders(credentials);
    log?.info?.("KREA", "List jobs");

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

  async handleJob(body, credentials, signal, log) {
    const jobId = body?.job_id;
    if (!jobId) return this.errorResponse("Missing job_id", 400);

    const url = this.getJobStatusUrl(jobId);
    const headers = this.buildHeaders(credentials);
    log?.info?.("KREA", `Get job: ${jobId}`);

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

  async handleCancel(body, credentials, signal, log) {
    const jobId = body?.job_id;
    if (!jobId) return this.errorResponse("Missing job_id", 400);

    const url = this.getJobStatusUrl(jobId);
    const headers = this.buildHeaders(credentials);
    log?.info?.("KREA", `Cancel job: ${jobId}`);

    const response = await fetch(url, { method: "DELETE", headers, signal });
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

  // ============ Style Management ============

  async handleStyles(body, credentials, signal, log) {
    const url = new URL(this.getStylesUrl());
    if (body?.cursor) url.searchParams.set("cursor", body.cursor);
    if (body?.limit) url.searchParams.set("limit", String(body.limit));
    if (body?.ids) url.searchParams.set("ids", body.ids);
    if (body?.liked !== undefined) url.searchParams.set("liked", String(body.liked));
    if (body?.user) url.searchParams.set("user", body.user);
    if (body?.model) url.searchParams.set("model", body.model);
    if (body?.filter) url.searchParams.set("filter", body.filter);

    const headers = this.buildHeaders(credentials);
    log?.info?.("KREA", "List styles");

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

  async handleStyle(body, credentials, signal, log) {
    const styleId = body?.style_id;
    if (!styleId) return this.errorResponse("Missing style_id", 400);

    const url = this.getStyleUrl(styleId);
    const headers = this.buildHeaders(credentials);
    log?.info?.("KREA", `Get style: ${styleId}`);

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

  async handleStyleShare(body, credentials, signal, log) {
    const styleId = body?.style_id;
    if (!styleId) return this.errorResponse("Missing style_id", 400);

    const url = this.getStyleShareUrl(styleId);
    const headers = this.buildHeaders(credentials);
    log?.info?.("KREA", `Share style: ${styleId}`);

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

  async handleStyleWorkspace(body, credentials, signal, log) {
    const styleId = body?.style_id;
    if (!styleId) return this.errorResponse("Missing style_id", 400);

    const url = this.getStyleWorkspaceUrl(styleId);
    const headers = this.buildHeaders(credentials);
    log?.info?.("KREA", `Add style to workspace: ${styleId}`);

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

  async handleTrain(body, credentials, signal, log) {
    const name = body?.name;
    const urls = body?.urls;
    if (!name || !urls) return this.errorResponse("Missing name/urls", 400);

    const url = this.getTrainUrl();
    const headers = this.buildHeaders(credentials);

    const payload = { name, urls };
    if (body?.model) payload.model = body.model;
    if (body?.type) payload.type = body.type;
    if (body?.trigger_word) payload.trigger_word = body.trigger_word;
    if (body?.learning_rate) payload.learning_rate = body.learning_rate;
    if (body?.max_train_steps) payload.max_train_steps = body.max_train_steps;
    if (body?.batch_size) payload.batch_size = body.batch_size;

    log?.info?.("KREA", `Train style: ${name}`);

    const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload), signal });
    if (!response.ok) {
      const err = await response.text().catch(() => "");
      return this.errorResponse(`HTTP ${response.status}: ${err}`, response.status);
    }

    const result = await response.json();
    if (result.job_id) return await this.pollJob(result.job_id, credentials, signal, log);

    return {
      response: new Response(JSON.stringify(result), {
        status: 200, headers: { "Content-Type": "application/json" },
      }),
      url, headers, transformedBody: payload,
    };
  }

  async handleStyleUpdate(body, credentials, signal, log) {
    const styleId = body?.style_id;
    if (!styleId) return this.errorResponse("Missing style_id", 400);

    const url = this.getStyleUrl(styleId);
    const headers = this.buildHeaders(credentials);
    const payload = {};
    if (body?.public !== undefined) payload.public = body.public;
    if (body?.title) payload.title = body.title;

    log?.info?.("KREA", `Update style: ${styleId}`);

    const response = await fetch(url, { method: "PATCH", headers, body: JSON.stringify(payload), signal });
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

  // ============ Asset Management ============

  async handleAssets(body, credentials, signal, log) {
    const url = new URL(this.getAssetsUrl());
    if (body?.limit) url.searchParams.set("limit", String(body.limit));
    if (body?.cursor) url.searchParams.set("cursor", body.cursor);

    const headers = this.buildHeaders(credentials);
    log?.info?.("KREA", "List assets");

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

    const method = body?.action === "delete" ? "DELETE" : "GET";
    log?.info?.("KREA", `${method} asset: ${assetId}`);

    const response = await fetch(url, { method, headers, signal });
    if (!response.ok) {
      const err = await response.text().catch(() => "");
      return this.errorResponse(`HTTP ${response.status}: ${err}`, response.status);
    }

    const result = method === "DELETE" ? { deleted: true } : await response.json();
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

    const url = this.getAssetsUrl();
    const headers = this.buildHeaders(credentials, undefined);

    const formData = new FormData();
    if (file instanceof Blob || file instanceof File) {
      formData.append("file", file);
    }
    if (body?.description) formData.append("description", body.description);

    log?.info?.("KREA", "Upload asset");

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

  // ============ Node Apps ============

  async handleNodeApps(body, credentials, signal, log) {
    const url = new URL(this.getNodeAppsUrl());
    if (body?.limit) url.searchParams.set("limit", String(body.limit));
    if (body?.cursor) url.searchParams.set("cursor", body.cursor);
    if (body?.owner) url.searchParams.set("owner", body.owner);

    const headers = this.buildHeaders(credentials);
    log?.info?.("KREA", "List node apps");

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

  async handleNodeApp(body, credentials, signal, log) {
    const appId = body?.app_id;
    if (!appId) return this.errorResponse("Missing app_id", 400);

    const url = this.getNodeAppUrl(appId);
    const headers = this.buildHeaders(credentials);
    log?.info?.("KREA", `Get node app: ${appId}`);

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

  async handleNodeAppExecute(body, credentials, signal, log) {
    const appId = body?.app_id;
    if (!appId) return this.errorResponse("Missing app_id", 400);

    const url = this.getNodeAppExecuteUrl(appId);
    const headers = this.buildHeaders(credentials);
    const payload = body?.input || {};

    log?.info?.("KREA", `Execute node app: ${appId}`);

    const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload), signal });
    if (!response.ok) {
      const err = await response.text().catch(() => "");
      return this.errorResponse(`HTTP ${response.status}: ${err}`, response.status);
    }

    const result = await response.json();
    if (result.job_id) return await this.pollJob(result.job_id, credentials, signal, log);

    return {
      response: new Response(JSON.stringify(result), {
        status: 200, headers: { "Content-Type": "application/json" },
      }),
      url, headers, transformedBody: payload,
    };
  }

  // ============ Job Polling ============

  async pollJob(jobId, credentials, signal, log) {
    const maxAttempts = 120;
    const pollInterval = 2000;

    for (let i = 0; i < maxAttempts; i++) {
      if (signal?.aborted) break;
      await new Promise(r => setTimeout(r, pollInterval));

      try {
        const url = this.getJobStatusUrl(jobId);
        const headers = this.buildHeaders(credentials);
        const response = await fetch(url, { method: "GET", headers, signal });
        if (!response.ok) continue;

        const result = await response.json();

        if (result.status === "completed") {
          return {
            response: new Response(JSON.stringify(result), {
              status: 200, headers: { "Content-Type": "application/json" },
            }),
            url, headers, transformedBody: {},
          };
        }

        if (result.status === "failed" || result.status === "cancelled") {
          return this.errorResponse(`Job ${result.status}: ${result.error?.message || "Unknown"}`, 500);
        }

        log?.info?.("KREA", `Job ${jobId}: ${result.status} (${i + 1}/${maxAttempts})`);
      } catch { /* continue */ }
    }

    return this.errorResponse("Job timed out", 504);
  }

  // ============ Error ============

  errorResponse(message, status = 500) {
    return {
      response: new Response(JSON.stringify({
        error: { message, type: "upstream_error", code: "KREA_ERROR" },
      }), { status, headers: { "Content-Type": "application/json" } }),
      url: "", headers: {}, transformedBody: {},
    };
  }
}

export default KreaExecutor;