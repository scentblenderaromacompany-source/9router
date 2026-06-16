import { BaseExecutor } from "./base.js";
import { PROVIDERS } from "../config/providers.js";

/**
 * Z.AI Executor — integration with Zhipu AI's international platform
 * Communicates with Z.AI API endpoints for GLM model access
 * Supports chat, vision, tools, thinking, image generation, video, audio, and more
 * 
 * IMPORTANT: Use the Developer API (api.z.ai/api/paas/v4) with an API key.
 * The Web UI API (chat.z.ai/api/v2) requires CAPTCHA verification and cannot
 * be used reliably for programmatic access.
 * 
 * Get your API key at: https://z.ai/manage-apikey/apikey-list
 */
export class ZAIExecutor extends BaseExecutor {
  constructor() {
    super("z-ai", PROVIDERS["z-ai"] || {
      baseUrl: "https://api.z.ai/api/paas/v4",
      format: "openai"
    });
  }

  /**
   * Build Z.AI API endpoint URL
   * Supports multiple endpoint types: chat, image, video, audio, tools
   */
  buildUrl(model, stream, urlIndex = 0, credentials = null) {
    // Get baseUrl from credentials if set, otherwise use provider config
    const baseUrl = credentials?.providerSpecificData?.baseUrl || 
                    this.config.baseUrl || 
                    "https://api.z.ai/api/paas/v4";
    const normalized = baseUrl.trim().replace(/\/$/, "");
    
    // Check if using Coding Plan endpoint
    const useCodingEndpoint = credentials?.providerSpecificData?.useCodingEndpoint;
    const baseApiUrl = useCodingEndpoint 
      ? "https://api.z.ai/api/coding/paas/v4"
      : normalized;
    
    // Determine endpoint based on model or request type
    const endpoint = this._getEndpoint(model, credentials);
    
    return `${baseApiUrl}${endpoint}`;
  }

  /**
   * Determine the API endpoint based on model or request type
   */
  _getEndpoint(model, credentials) {
    // Check for specific endpoint override
    const endpointType = credentials?.providerSpecificData?.endpointType;
    if (endpointType) {
      const endpoints = {
        'chat': '/chat/completions',
        'image': '/images/generations',
        'image-async': '/async/images/generations',
        'video': '/videos/generations',
        'audio': '/audio/transcriptions',
        'tokenizer': '/tokenizer',
        'ocr': '/layout_parsing',
        'web-search': '/web_search',
        'web-reader': '/reader',
      };
      return endpoints[endpointType] || '/chat/completions';
    }

    // Auto-detect endpoint from model name
    if (model) {
      const modelLower = model.toLowerCase();
      
      // Image generation models
      if (modelLower.includes('image') || modelLower.includes('cogview') || modelLower === 'glm-image') {
        return '/images/generations';
      }
      
      // Video generation models
      if (modelLower.includes('video') || modelLower.includes('cogvideo') || modelLower.includes('vidu')) {
        return '/videos/generations';
      }
      
      // Audio/ASR models
      if (modelLower.includes('asr') || modelLower.includes('audio')) {
        return '/audio/transcriptions';
      }
      
      // OCR models
      if (modelLower.includes('ocr')) {
        return '/layout_parsing';
      }
    }
    
    // Default to chat completions
    return '/chat/completions';
  }

  /**
   * Build Z.AI request headers
   * Z.AI uses standard Bearer token authentication
   */
  buildHeaders(credentials, stream = true) {
    const headers = {
      "Content-Type": "application/json",
      "Accept-Language": "en-US,en",
    };

    // Use API key for Z.AI access
    const token = credentials?.apiKey || credentials?.accessToken;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (stream) {
      headers["Accept"] = "text/event-stream";
    }

    return headers;
  }

  /**
   * Transform request body to Z.AI format
   * Z.AI accepts OpenAI-compatible format with additional features
   */
  transformRequest(model, body, stream, credentials) {
    // Determine the endpoint type to apply appropriate transformations
    const endpointType = credentials?.providerSpecificData?.endpointType || 
                         this._guessEndpointType(model, body);
    
    switch (endpointType) {
      case 'image':
        return this._transformImageRequest(body, model);
      case 'video':
        return this._transformVideoRequest(body, model);
      case 'audio':
        return this._transformAudioRequest(body);
      case 'tokenizer':
        return this._transformTokenizerRequest(body, model);
      case 'ocr':
        return this._transformOCRRequest(body, model);
      case 'web-search':
        return this._transformWebSearchRequest(body);
      case 'web-reader':
        return this._transformWebReaderRequest(body);
      default:
        return this._transformChatRequest(model, body, stream);
    }
  }

  /**
   * Guess endpoint type from model or body
   */
  _guessEndpointType(model, body) {
    if (body.image_url || body.prompt && (body.size || body.quality)) {
      return 'image';
    }
    if (body.url && !body.messages) {
      return 'web-reader';
    }
    if (body.query || body.search_query) {
      return 'web-search';
    }
    return 'chat';
  }

  /**
   * Transform chat completion request
   */
  _transformChatRequest(model, body, stream) {
    const transformed = {
      model: body.model || model,
      messages: body.messages || [],
      stream: stream !== undefined ? stream : body.stream ?? false,
    };

    // Optional OpenAI parameters
    if (body.temperature !== undefined) transformed.temperature = body.temperature;
    if (body.max_tokens !== undefined) transformed.max_tokens = body.max_tokens;
    if (body.top_p !== undefined) transformed.top_p = body.top_p;
    if (body.stop !== undefined) transformed.stop = body.stop;
    
    // Z.AI specific parameters
    if (body.do_sample !== undefined) transformed.do_sample = body.do_sample;
    else transformed.do_sample = true;
    
    // Thinking mode support (GLM-4.5+ models)
    if (body.thinking) {
      transformed.thinking = body.thinking;
    }
    
    // Tool/function calling support
    if (body.tools) transformed.tools = body.tools;
    if (body.tool_choice) transformed.tool_choice = body.tool_choice;
    if (body.tool_stream !== undefined) transformed.tool_stream = body.tool_stream;
    
    // Response format support
    if (body.response_format) transformed.response_format = body.response_format;
    
    // Vision support (for vision models)
    if (body.vision_detail) transformed.vision_detail = body.vision_detail;

    return transformed;
  }

  /**
   * Transform image generation request
   */
  _transformImageRequest(body, model) {
    return {
      model: body.model || model || "glm-image",
      prompt: body.prompt || body.content || "",
      size: body.size || "1024x1024",
      quality: body.quality || "standard",
      response_format: body.response_format || "url",
    };
  }

  /**
   * Transform video generation request
   */
  _transformVideoRequest(body, model) {
    const request = {
      model: body.model || model || "cogvideox-3",
      prompt: body.prompt || body.content || "",
      quality: body.quality || "quality",
      with_audio: body.with_audio !== undefined ? body.with_audio : true,
      size: body.size || "1920x1080",
      fps: body.fps || 30,
    };
    
    // Image-to-video support
    if (body.image_url) {
      request.image_url = body.image_url;
    }
    
    return request;
  }

  /**
   * Transform audio transcription request
   */
  _transformAudioRequest(body) {
    return {
      model: body.model || "glm-asr-2512",
      stream: body.stream !== undefined ? body.stream : false,
    };
  }

  /**
   * Transform tokenizer request
   */
  _transformTokenizerRequest(body, model) {
    return {
      model: body.model || model || "glm-4.6",
      messages: body.messages || [{ role: "user", content: body.text || "" }],
    };
  }

  /**
   * Transform OCR/layout parsing request
   */
  _transformOCRRequest(body, model) {
    return {
      model: body.model || model || "glm-ocr",
      file: body.file || body.image_url || body.url,
    };
  }

  /**
   * Transform web search request
   */
  _transformWebSearchRequest(body) {
    return {
      search_engine: body.search_engine || "search_pro_jina",
      search_query: body.search_query || body.query || "",
      count: body.count || 10,
      search_result: body.search_result !== undefined ? body.search_result : true,
    };
  }

  /**
   * Transform web reader request
   */
  _transformWebReaderRequest(body) {
    return {
      url: body.url,
      timeout: body.timeout || 20,
      return_format: body.return_format || "markdown",
      retain_images: body.retain_images !== undefined ? body.retain_images : true,
    };
  }
}
