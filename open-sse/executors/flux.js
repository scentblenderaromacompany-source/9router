/**
 * Flux (Black Forest Labs) - Complete API Integration
 * 
 * Base URL: https://api.bfl.ai
 * Auth: x-key header with API key
 * 
 * ALL Endpoints:
 * 
 * GENERATION (14 models):
 * - POST /v1/flux-2-max              - FLUX.2 [max] - Highest quality, multi-reference
 * - POST /v1/flux-2-pro-preview      - FLUX.2 [pro] preview - Latest improvements
 * - POST /v1/flux-2-pro              - FLUX.2 [pro] - Recommended default
 * - POST /v1/flux-2-flex             - FLUX.2 [flex] - Typography specialist
 * - POST /v1/flux-2-klein-4b         - FLUX.2 [klein] 4B - Fastest, lightweight
 * - POST /v1/flux-2-klein-9b-preview - FLUX.2 [klein] 9B preview
 * - POST /v1/flux-2-klein-9b         - FLUX.2 [klein] 9B - Sub-second inference
 * - POST /v1/flux-pro-1.1            - FLUX1.1 [pro] - Fast & reliable
 * - POST /v1/flux-pro-1.1-ultra      - FLUX1.1 [pro] Ultra - 4MP resolution
 * - POST /v1/flux-dev                - FLUX.1 [dev] - Free tier
 * - POST /v1/flux-kontext-pro        - FLUX.1 Kontext [pro] - Editing
 * - POST /v1/flux-kontext-max        - FLUX.1 Kontext [max] - Best editing
 * - POST /v1/flux-pro-1.0-fill       - FLUX.1 Fill [pro] - Inpainting
 * - POST /v1/flux-pro-1.0-expand     - FLUX.1 Expand [pro] - Outpainting
 * 
 * FINETUNED MODELS:
 * - POST /v1/flux-pro-1.0-fill-finetuned     - Fill with LoRA
 * - POST /v1/flux-pro-1.1-ultra-finetuned   - Ultra with LoRA
 * 
 * TOOLS:
 * - POST /v1/flux-tools/outpainting-v1 - Outpainting
 * - POST /v1/flux-tools/vto-v1        - Virtual try-on
 * - POST /v1/flux-tools/erase-v1      - Object erasing
 * 
 * UTILITY:
 * - GET  /v1/get_result               - Poll task result
 * - GET  /v1/credits                  - Get account credits
 * - GET  /v1/my_finetunes             - List finetunes
 * - GET  /v1/finetune_details         - Finetune details
 * - POST /v1/delete_finetune          - Delete finetune
 */

export class FluxExecutor {
  constructor() {
    this.providerId = "flux";
    this.config = {
      baseUrl: "https://api.bfl.ai",
    };
  }

  // ============ URL builders ============

  getModelUrl(model) {
    const modelEndpoints = {
      "flux-2-max": "/v1/flux-2-max",
      "flux-2-pro-preview": "/v1/flux-2-pro-preview",
      "flux-2-pro": "/v1/flux-2-pro",
      "flux-2-flex": "/v1/flux-2-flex",
      "flux-2-klein-4b": "/v1/flux-2-klein-4b",
      "flux-2-klein-9b-preview": "/v1/flux-2-klein-9b-preview",
      "flux-2-klein-9b": "/v1/flux-2-klein-9b",
      "flux-pro-1.1": "/v1/flux-pro-1.1",
      "flux-pro-1.1-ultra": "/v1/flux-pro-1.1-ultra",
      "flux-dev": "/v1/flux-dev",
      "flux-kontext-pro": "/v1/flux-kontext-pro",
      "flux-kontext-max": "/v1/flux-kontext-max",
      "flux-pro-1.0-fill": "/v1/flux-pro-1.0-fill",
      "flux-pro-1.0-expand": "/v1/flux-pro-1.0-expand",
      "flux-pro-1.0-fill-finetuned": "/v1/flux-pro-1.0-fill-finetuned",
      "flux-pro-1.1-ultra-finetuned": "/v1/flux-pro-1.1-ultra-finetuned",
    };
    return `${this.config.baseUrl}${modelEndpoints[model] || "/v1/flux-pro-1.1"}`;
  }

  getToolUrl(tool) {
    const toolEndpoints = {
      outpainting: "/v1/flux-tools/outpainting-v1",
      vto: "/v1/flux-tools/vto-v1",
      erase: "/v1/flux-tools/erase-v1",
    };
    return `${this.config.baseUrl}${toolEndpoints[tool] || "/v1/flux-tools/outpainting-v1"}`;
  }

  getPollUrl(taskId) { return `${this.config.baseUrl}/v1/get_result?id=${taskId}`; }
  getCreditsUrl() { return `${this.config.baseUrl}/v1/credits`; }
  getMyFinetunesUrl() { return `${this.config.baseUrl}/v1/my_finetunes`; }
  getFinetuneDetailsUrl(finetuneId) { return `${this.config.baseUrl}/v1/finetune_details?finetune_id=${finetuneId}`; }
  getDeleteFinetuneUrl() { return `${this.config.baseUrl}/v1/delete_finetune`; }

  // ============ Headers ============

  buildHeaders(credentials, contentType = "application/json") {
    const headers = { "Content-Type": contentType };
    const apiKey = credentials?.apiKey || credentials?.sessionToken || credentials?.key;
    if (apiKey) headers["x-key"] = apiKey;
    if (credentials?.cookie) headers["Cookie"] = credentials.cookie;
    return headers;
  }

  // ============ Execute ============

  async execute({ model, body, stream, credentials, signal, log }) {
    const endpoint = body?.endpoint || "generate";

    try {
      switch (endpoint) {
        case "generate": return await this.handleGenerate(model, body, credentials, signal, log);
        case "tool": return await this.handleTool(model, body, credentials, signal, log);
        case "poll": return await this.handlePoll(body, credentials, signal, log);
        case "credits": return await this.handleCredits(credentials, signal, log);
        case "finetunes": return await this.handleFinetunes(credentials, signal, log);
        case "finetune-details": return await this.handleFinetuneDetails(body, credentials, signal, log);
        case "delete-finetune": return await this.handleDeleteFinetune(body, credentials, signal, log);
        default: return await this.handleGenerate(model, body, credentials, signal, log);
      }
    } catch (err) {
      log?.error?.("FLUX", `Error: ${err.message}`);
      return this.errorResponse(`Flux failed: ${err.message}`, 502);
    }
  }

  // ============ Image Generation ============

  async handleGenerate(model, body, credentials, signal, log) {
    const prompt = body?.prompt;
    if (!prompt) return this.errorResponse("Missing prompt", 400);

    const fluxModel = model || body?.model || "flux-2-pro";
    const url = this.getModelUrl(fluxModel);
    const headers = this.buildHeaders(credentials);

    const payload = { prompt };
    if (body?.width) payload.width = body.width;
    if (body?.height) payload.height = body.height;
    if (body?.seed !== undefined) payload.seed = body.seed;
    if (body?.safety_tolerance !== undefined) payload.safety_tolerance = body.safety_tolerance;
    if (body?.output_format) payload.output_format = body.output_format;
    if (body?.webhook_url) payload.webhook_url = body.webhook_url;
    if (body?.webhook_secret) payload.webhook_secret = body.webhook_secret;
    if (body?.prompt_upsampling !== undefined) payload.prompt_upsampling = body.prompt_upsampling;
    if (body?.aspect_ratio) payload.aspect_ratio = body.aspect_ratio;
    if (body?.raw !== undefined) payload.raw = body.raw;
    if (body?.image_prompt) payload.image_prompt = body.image_prompt;
    if (body?.image_prompt_strength !== undefined) payload.image_prompt_strength = body.image_prompt_strength;
    if (body?.input_image) payload.input_image = body.input_image;

    // Multi-reference for FLUX.2 models (up to 10 images)
    for (let i = 2; i <= 10; i++) {
      if (body?.[`input_image_${i}`]) payload[`input_image_${i}`] = body[`input_image_${i}`];
    }

    // Finetune support
    if (body?.finetune_id) payload.finetune_id = body.finetune_id;
    if (body?.finetune_strength !== undefined) payload.finetune_strength = body.finetune_strength;

    // Kontext specific
    if (body?.prompt_strength !== undefined) payload.prompt_strength = body.prompt_strength;
    if (body?.guidance) payload.guidance = body.guidance;
    if (body?.steps) payload.steps = body.steps;

    log?.info?.("FLUX", `Generate: model=${fluxModel}, size=${payload.width || 1024}x${payload.height || 1024}`);

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

  // ============ Tool Execution ============

  async handleTool(model, body, credentials, signal, log) {
    const tool = body?.tool || "outpainting";
    const url = this.getToolUrl(tool);
    const headers = this.buildHeaders(credentials);

    const payload = { ...body };
    delete payload.endpoint;
    delete payload.tool;

    log?.info?.("FLUX", `Tool: ${tool}`);

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

  // ============ Polling ============

  async handlePoll(body, credentials, signal, log) {
    const taskId = body?.task_id || body?.id;
    if (!taskId) return this.errorResponse("Missing task_id", 400);

    const url = this.getPollUrl(taskId);
    const headers = this.buildHeaders(credentials);

    log?.info?.("FLUX", `Poll: ${taskId}`);

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

  // ============ Credits ============

  async handleCredits(credentials, signal, log) {
    const url = this.getCreditsUrl();
    const headers = this.buildHeaders(credentials);

    log?.info?.("FLUX", "Credits");

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

  // ============ Finetunes ============

  async handleFinetunes(credentials, signal, log) {
    const url = this.getMyFinetunesUrl();
    const headers = this.buildHeaders(credentials);

    log?.info?.("FLUX", "List finetunes");

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

  async handleFinetuneDetails(body, credentials, signal, log) {
    const finetuneId = body?.finetune_id || body?.id;
    if (!finetuneId) return this.errorResponse("Missing finetune_id", 400);

    const url = this.getFinetuneDetailsUrl(finetuneId);
    const headers = this.buildHeaders(credentials);

    log?.info?.("FLUX", `Finetune details: ${finetuneId}`);

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

  async handleDeleteFinetune(body, credentials, signal, log) {
    const finetuneId = body?.finetune_id || body?.id;
    if (!finetuneId) return this.errorResponse("Missing finetune_id", 400);

    const url = this.getDeleteFinetuneUrl();
    const headers = this.buildHeaders(credentials);

    log?.info?.("FLUX", `Delete finetune: ${finetuneId}`);

    const response = await fetch(url, { method: "POST", headers, body: JSON.stringify({ finetune_id: finetuneId }), signal });
    if (!response.ok) {
      const err = await response.text().catch(() => "");
      return this.errorResponse(`HTTP ${response.status}: ${err}`, response.status);
    }

    const result = await response.json();
    return {
      response: new Response(JSON.stringify(result), {
        status: 200, headers: { "Content-Type": "application/json" },
      }),
      url, headers, transformedBody: { finetune_id: finetuneId },
    };
  }

  // ============ Error ============

  errorResponse(message, status = 500) {
    return {
      response: new Response(JSON.stringify({
        error: { message, type: "upstream_error", code: "FLUX_ERROR" },
      }), { status, headers: { "Content-Type": "application/json" } }),
      url: "", headers: {}, transformedBody: {},
    };
  }
}

export default FluxExecutor;