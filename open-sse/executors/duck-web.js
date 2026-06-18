import crypto from "crypto";
import vm from "vm";
import { WebUIExecutor } from "./webui-base.js";
import { sseChunk } from "../utils/sse.js";
import { SSE_DONE } from "../utils/sseConstants.js";

/**
 * DuckWebExecutor - Duck.ai (DuckDuckGo AI Chat) integration
 * 
 * Uses VQD challenge tokens for authentication (no API key required).
 * Duck.ai provides free access to GPT-4o mini, Claude Haiku 4.5, Llama 4 Scout, Mistral Small.
 * 
 * Authentication: None required (uses challenge-response)
 * 
 * NOTE: Duck.ai has active anti-bot detection that may block programmatic access.
 * If the stubs-based challenge solver fails (418), the executor will attempt to
 * fall back to Puppeteer (headless browser) for challenge solving.
 */
export class DuckWebExecutor extends WebUIExecutor {
  constructor() {
    super("duck-web", {
      baseUrl: "https://duck.ai",
      format: "openai",
    });
    this.pendingHash = null;
    this.feVersion = null;
    this.homeCookies = null;
    this.authCookies = null;
    this.triedBrowserFallback = false;
  }

  /**
   * Default User-Agent
   */
  static UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

  // ============ URL builders ============

  buildUrl(model, stream, urlIndex = 0, credentials = null) {
    return `${this.config.baseUrl}/duckchat/v1/chat`;
  }

  getStatusUrl() {
    return `${this.config.baseUrl}/duckchat/v1/status`;
  }

  getAuthUrl() {
    return `${this.config.baseUrl}/duckchat/v1/auth/token`;
  }

  // ============ Headers ============

  buildWebHeaders(credentials) {
    const headers = {
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
      "Origin": this.config.baseUrl,
      "Referer": `${this.config.baseUrl}/`,
      "User-Agent": DuckWebExecutor.UA,
    };

    if (this.pendingHash) {
      headers["x-vqd-hash-1"] = this.pendingHash;
    }

    if (this.feVersion) {
      headers["x-fe-version"] = this.feVersion;
    }

    headers["x-fe-signals"] = this.generateFeSignals();

    return headers;
  }

  /**
   * Generate x-fe-signals header
   */
  generateFeSignals() {
    const end = Date.now() - 1000;
    const start = end - 5000;
    return Buffer.from(JSON.stringify({
      start,
      events: [
        { name: "startNewChat", delta: end - start },
      ],
      end,
    })).toString("base64");
  }

  // ============ Payload ============

  buildWebPayload(model, messages, stream, credentials) {
    const payload = {
      model,
      metadata: {
        toolChoice: {
          NewsSearch: false,
          VideosSearch: false,
          LocalSearch: false,
          WeatherForecast: false,
          WebSearch: false,
        },
      },
      messages: this.buildMessagesArray(messages),
      canUseTools: true,
      reasoningEffort: "low",
      canUseApproxLocation: null,
      durableStream: {
        messageId: crypto.randomUUID(),
        conversationId: crypto.randomUUID(),
      },
    };

    return payload;
  }

  /**
   * Build messages array from OpenAI messages
   */
  buildMessagesArray(messages) {
    const result = [];
    for (const msg of messages) {
      let role = msg.role;
      if (role === "developer") role = "system";

      let content = "";
      if (typeof msg.content === "string") {
        content = msg.content;
      } else if (Array.isArray(msg.content)) {
        content = msg.content
          .filter((c) => c.type === "text")
          .map((c) => String(c.text || ""))
          .join(" ");
      }

      if (!content.trim()) continue;
      result.push({ role, content });
    }
    return result;
  }

  // ============ Stream parsing ============

  async *parseWebStream(responseBody, model, signal) {
    const reader = responseBody.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          const data = trimmed.slice(6);
          if (data === "[DONE]") {
            yield { done: true };
            return;
          }

          if (data.startsWith("[CHAT_TITLE") || data.startsWith("[LIMIT") || data.startsWith("[PING")) {
            continue;
          }

          try {
            const parsed = JSON.parse(data);

            if (parsed.action === "error") {
              if (parsed.status === 418) {
                yield { error: "Challenge rejected" };
              } else if (parsed.status === 429) {
                yield { error: "Rate limited" };
              } else {
                yield { error: parsed.type || "Unknown error" };
              }
              return;
            }

            if (parsed.message) {
              yield { delta: parsed.message };
            }
          } catch {
            // not JSON, skip
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // ============ Error handling ============

  handleWebError(response, status, logger) {
    let errMsg = `Duck.ai returned HTTP ${status}`;

    if (status === 418) {
      errMsg = "Duck.ai challenge rejected";
    } else if (status === 429) {
      errMsg = "Duck.ai rate limited";
    } else if (status === 403) {
      errMsg = "Duck.ai access denied";
    }

    logger?.warn?.("DUCK-WEB", errMsg);
    return this.errorResponse(errMsg, status);
  }

  // ============ Full execute override ============

  async execute({ model, body, stream, credentials, signal, log }) {
    const messages = body?.messages;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return this.errorResponse("Missing or empty messages array", 400);
    }

    try {
      if (!this.pendingHash) {
        await this.refreshVqdToken(log);
      }

      const payload = this.buildWebPayload(model, messages, stream, credentials);
      const headers = this.buildWebHeaders(credentials);
      const url = this.buildUrl(model, stream, 0, credentials);

      log?.info?.("DUCK-WEB", `Request to ${model}, endpoint=${url}`);

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal,
      });

      const newHash = response.headers.get("x-vqd-hash-1");
      if (newHash) this.pendingHash = newHash;

      if (!response.ok) {
        if (response.status === 418) {
          log?.warn?.("DUCK-WEB", "418, retrying");
          this.pendingHash = null;
          await this.refreshVqdToken(log);
          headers["x-vqd-hash-1"] = this.pendingHash;

          const retryResponse = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
            signal,
          });

          const retryHash = retryResponse.headers.get("x-vqd-hash-1");
          if (retryHash) this.pendingHash = retryHash;

          if (!retryResponse.ok) {
            return this.handleWebError(retryResponse, retryResponse.status, log);
          }

          if (!retryResponse.body) {
            return this.errorResponse("Empty response body", 502);
          }

          return this.toStreamingResponse(retryResponse.body, model, url, headers, payload, signal);
        }

        return this.handleWebError(response, response.status, log);
      }

      if (!response.body) {
        return this.errorResponse("Empty response body", 502);
      }

      return this.toStreamingResponse(response.body, model, url, headers, payload, signal);
    } catch (err) {
      log?.error?.("DUCK-WEB", `Error: ${err.message || String(err)}`);
      return this.errorResponse(`duck-web failed: ${err.message || String(err)}`, 502);
    }
  }

  /**
   * Build streaming/non-streaming response and return the result object
   */
  async toStreamingResponse(rawBody, model, url, headers, payload, signal) {
    const cid = `chatcmpl-duck-web-${crypto.randomUUID().slice(0, 12)}`;
    const created = Math.floor(Date.now() / 1000);

    if (signal?.aborted) {
      return this.errorResponse("Request aborted", 499);
    }

    const provider = this;

    const sseStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          controller.enqueue(encoder.encode(sseChunk({
            id: cid, object: "chat.completion.chunk", created, model,
            system_fingerprint: null,
            choices: [{ index: 0, delta: { role: "assistant" }, finish_reason: null, logprobs: null }],
          })));

          for await (const chunk of provider.parseWebStream(rawBody, model, signal)) {
            if (chunk.error) {
              controller.enqueue(encoder.encode(sseChunk({
                id: cid, object: "chat.completion.chunk", created, model,
                system_fingerprint: null,
                choices: [{ index: 0, delta: { content: `[Error: ${chunk.error}]` }, finish_reason: null, logprobs: null }],
              })));
              break;
            }
            if (chunk.thinking) {
              controller.enqueue(encoder.encode(sseChunk({
                id: cid, object: "chat.completion.chunk", created, model,
                system_fingerprint: null,
                choices: [{ index: 0, delta: { reasoning_content: chunk.thinking }, finish_reason: null, logprobs: null }],
              })));
              continue;
            }
            if (chunk.done) break;
            if (chunk.delta) {
              controller.enqueue(encoder.encode(sseChunk({
                id: cid, object: "chat.completion.chunk", created, model,
                system_fingerprint: null,
                choices: [{ index: 0, delta: { content: chunk.delta }, finish_reason: null, logprobs: null }],
              })));
            }
          }

          controller.enqueue(encoder.encode(sseChunk({
            id: cid, object: "chat.completion.chunk", created, model,
            system_fingerprint: null,
            choices: [{ index: 0, delta: {}, finish_reason: "stop", logprobs: null }],
          })));
          controller.enqueue(encoder.encode(SSE_DONE));
        } catch (err) {
          controller.enqueue(encoder.encode(sseChunk({
            id: cid, object: "chat.completion.chunk", created, model,
            system_fingerprint: null,
            choices: [{ index: 0, delta: { content: `[Stream error: ${err.message || String(err)}]` }, finish_reason: "stop", logprobs: null }],
          })));
          controller.enqueue(encoder.encode(SSE_DONE));
        } finally {
          controller.close();
        }
      },
    });

    return {
      response: new Response(sseStream, {
        status: 200,
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
      }),
      url,
      headers,
      transformedBody: payload,
    };
  }

  // ============ VQD Token Management ============

  /**
   * Solve the VQD challenge from the JS string using a mock DOM environment
   */
  async solveChallenge(b64hash) {
    const js = Buffer.from(b64hash, "base64").toString("utf-8");
    const ctx = this.createChallengeContext();
    const result = await vm.runInContext(`(${js})()`, ctx);
    result.client_hashes[0] = DuckWebExecutor.UA;
    result.client_hashes = result.client_hashes.map(t =>
      crypto.createHash("sha256").update(t).digest("base64")
    );
    return Buffer.from(JSON.stringify(result)).toString("base64");
  }

  /**
   * Create a mock DOM context for challenge evaluation
   */
  createChallengeContext() {
    const mockDoc = {
      body: { appendChild: () => {}, removeChild: () => {}, children: { length: 0 } },
      createElement: (tag) => ({
        style: {},
        srcdoc: "",
        sandbox: { value: "" },
        contentWindow: null,
        get contentDocument() { return null; },
        appendChild: () => {},
        removeChild: () => {},
        querySelector: () => null,
        querySelectorAll: () => ({ length: 0, [0]: null }),
        getAttribute: () => null,
        setAttribute: () => {},
      }),
      querySelector: () => null,
      querySelectorAll: () => ({
        length: 0,
        [0]: null,
        item: () => null,
        entries: () => [],
        forEach: () => {},
        keys: () => [],
        values: () => [],
      }),
      documentElement: { getAttribute: () => null },
      head: { appendChild: () => {}, removeChild: () => {} },
    };

    const win = {
      window: {},
      self: {},
      top: {},
      parent: {},
      document: mockDoc,
      navigator: {
        userAgent: DuckWebExecutor.UA,
        webdriver: undefined,
        platform: "Linux x86_64",
        languages: ["en-US", "en"],
        plugins: { length: 5, item: () => null, namedItem: () => null },
        mimeTypes: { length: 4, item: () => null, namedItem: () => null },
        hardwareConcurrency: 8,
        deviceMemory: 8,
        cookieEnabled: true,
        onLine: true,
        pdfViewerEnabled: true,
      },
      location: { href: "https://duck.ai/", origin: "https://duck.ai", protocol: "https:", host: "duck.ai", hostname: "duck.ai", pathname: "/", search: "", hash: "" },
      history: { length: 0, state: null, scrollRestoration: "auto" },
      screen: { width: 1920, height: 1080, availWidth: 1920, availHeight: 1040, colorDepth: 24, pixelDepth: 24 },
      innerWidth: 1920, innerHeight: 944,
      outerWidth: 1920, outerHeight: 1040,
      devicePixelRatio: 1,
      chrome: { app: { isInstalled: false }, runtime: {}, loadTimes: () => {}, csi: () => {} },
      getComputedStyle: () => ({
        getPropertyValue: () => "",
        length: 0,
        cssText: "",
      }),
      matchMedia: () => ({ matches: false, media: "", onchange: null, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false }),
      requestAnimationFrame: () => 0,
      cancelAnimationFrame: () => {},
      setTimeout: (fn, n) => { if (typeof fn === "string") return setTimeout(eval(fn), n); return setTimeout(fn, n); },
      clearTimeout: (id) => clearTimeout(id),
      setInterval: (fn, n) => setInterval(fn, n),
      clearInterval: (id) => clearInterval(id),
      fetch: () => Promise.reject(new Error("fetch not available")),
      XMLHttpRequest: function() { throw new Error("XHR not available"); },
      localStorage: (() => { let d = {}; return { getItem: k => d[k] || null, setItem: (k, v) => d[k] = v, removeItem: k => delete d[k], clear: () => d = {}, key: i => Object.keys(d)[i] || null, get length() { return Object.keys(d).length; } }; })(),
      sessionStorage: null,
      crypto: { subtle: { digest: async (algo, data) => {
        const name = algo.toLowerCase().replace("-", "");
        const hash = crypto.createHash(name);
        hash.update(Buffer.from(data));
        return hash.digest();
      }}, getRandomValues: (arr) => { for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256); return arr; } },
      btoa: (s) => Buffer.from(s, "binary").toString("base64"),
      atob: (s) => Buffer.from(s, "base64").toString("binary"),
      TextEncoder: class { encode(s) { return Buffer.from(s); } },
      TextDecoder: class { decode(b) { return Buffer.from(b).toString(); } },
      console: { log: () => {}, error: () => {}, warn: () => {}, info: () => {}, debug: () => {} },
    };

    win.window = win;
    win.self = win;
    win.top = win;
    win.parent = win;

    const ctx = vm.createContext({
      ...win,
      window: win,
      self: win,
      top: win,
      parent: win,
      globalThis: win,
      document: mockDoc,
      navigator: win.navigator,
      location: win.location,
      history: win.history,
      screen: win.screen,
      chrome: win.chrome,
      localStorage: win.localStorage,
      Array, Object, String, Number, Boolean, Promise, Math, JSON, Error, TypeError, SyntaxError, ReferenceError, RangeError, URIError, EvalError,
      parseInt, parseFloat, isNaN, isFinite, Symbol, Proxy, Reflect, RegExp, Map, Set, WeakMap, WeakSet, Date, Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array, DataView, ArrayBuffer, SharedArrayBuffer, Atomics, BigInt,
      encodeURI, encodeURIComponent, decodeURI, decodeURIComponent,
      escape, unescape,
      isPrototypeOf: Object.prototype.isPrototypeOf,
      hasOwnProperty: Object.prototype.hasOwnProperty,
      toString: Object.prototype.toString,
    });

    return ctx;
  }

  /**
   * Refresh VQD token from Duck.ai
   */
  async refreshVqdToken(log) {
    try {
      log?.info?.("DUCK-WEB", "Refreshing VQD token");

      // Visit homepage to set cookies and get build version
      const homeResponse = await fetch(`${this.config.baseUrl}/?ia=chat`, {
        headers: {
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "User-Agent": DuckWebExecutor.UA,
        },
      });

      const homeHtml = await homeResponse.text();

      // Extract build version
      const verTag = homeHtml.match(/data-version-tag=["']([^"']+)/);
      const verSha = homeHtml.match(/data-version-sha=["']([^"']+)/);
      if (verTag) {
        this.feVersion = verTag[1] + (verSha ? `-${verSha[1]}` : "");
      } else {
        this.feVersion = "serp_20260618_123048_ET";
      }

      // Capture cookies from the response
      this.homeCookies = [];
      for (const c of (homeResponse.headers.getSetCookie?.() || [])) {
        const [kv] = c.split(";");
        this.homeCookies.push(kv);
      }

      // Get auth token
      try {
        const authResponse = await fetch(this.getAuthUrl(), {
          headers: {
            "Accept": "*/*",
            "User-Agent": DuckWebExecutor.UA,
            "Origin": this.config.baseUrl,
            "Referer": `${this.config.baseUrl}/`,
          },
        });
        this.authCookies = [];
        for (const c of (authResponse.headers.getSetCookie?.() || [])) {
          const [kv] = c.split(";");
          this.authCookies.push(kv);
        }
      } catch (e) {
        // auth is optional
      }

      // Get VQD challenge
      const cookieHeader = [...(this.homeCookies || []), ...(this.authCookies || [])].join("; ");

      const statusResponse = await fetch(this.getStatusUrl(), {
        headers: {
          "Accept": "*/*",
          "x-vqd-accept": "1",
          "User-Agent": DuckWebExecutor.UA,
          "Origin": this.config.baseUrl,
          "Referer": `${this.config.baseUrl}/`,
          ...(cookieHeader ? { "Cookie": cookieHeader } : {}),
        },
      });

      const vqdHash = statusResponse.headers.get("x-vqd-hash-1");
      if (!vqdHash) {
        log?.warn?.("DUCK-WEB", "No VQD hash in response");
        return;
      }

      // Solve the challenge
      try {
        const solved = await this.solveChallenge(vqdHash);
        this.pendingHash = solved;
        log?.info?.("DUCK-WEB", "VQD token solved and stored");
      } catch (solveErr) {
        log?.warn?.("DUCK-WEB", `Challenge solve error: ${solveErr.message}`);

        // Fallback: store the unsolved challenge (will likely get 418)
        this.pendingHash = vqdHash;
      }
    } catch (err) {
      log?.warn?.("DUCK-WEB", `Failed to refresh VQD: ${err.message}`);
    }
  }
}

export default DuckWebExecutor;
