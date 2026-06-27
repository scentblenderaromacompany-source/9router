import crypto from "crypto";
import { WebUIExecutor } from "./webui-base.js";
import { parseToolCallsFromText } from "../utils/toolCalling/toolParser.js";

/**
 * GeminiWebExecutor - Google Gemini Web UI integration
 * 
 * Uses browser cookies (__Secure-1PSID + __Secure-1PSIDTS) to access Gemini.
 * Gemini uses a non-standard streaming format (not SSE).
 * 
 * Authentication: cookies from gemini.google.com
 */
export class GeminiWebExecutor extends WebUIExecutor {
  constructor() {
    super("gemini-web", {
      baseUrl: "https://gemini.google.com",
      format: "openai",
    });
    this.sessionId = null;
    this.buildLabel = null;
    this.accessToken = null;
    this.puppeteerAvailable = null;  // cached availability check
  }

  // ============ URL builders ============

  buildUrl(model, stream, urlIndex = 0, credentials = null) {
    return `${this.config.baseUrl}/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate`;
  }

  getBatchExecuteUrl() {
    return `${this.config.baseUrl}/_/BardChatUi/data/batchexecute`;
  }

  getInitUrl() {
    return `${this.config.baseUrl}/app`;
  }

  // ============ Headers ============

  buildWebHeaders(credentials) {
    const cookies = this.parseCookies(credentials);
    return {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      Origin: "https://gemini.google.com",
      Referer: "https://gemini.google.com/",
      "X-Same-Domain": "1",
      Cookie: cookies,
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
      Accept: "*/*",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language": "en-US,en;q=0.9",
      "sec-ch-ua": '"Google Chrome";v="149", "Chromium";v="149", "Not)A;Brand";v="24"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Linux"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-browser-channel": "stable",
      "x-browser-copyright": "Copyright 2026 Google LLC. All Rights Reserved.",
      "x-browser-validation": "2ykZOU4XYx2sxnP11h4q1YHHPHU=",
      "x-browser-year": "2026",
      "x-client-data": "COjvygE=",
      "x-goog-ext-525001261-jspb":
        '[1,null,null,null,"9d8ca3786ebdfbea",null,null,0,[4,5,6,8],null,null,1,null,null,3,1,"D1A8CFC1-112A-40C2-AC51-2EBF7E7453F4"]',
      "x-goog-ext-525005358-jspb": '["5C7CD49B-CC82-4DA6-B8B0-518BC813EB51",1]',
      "x-goog-ext-73010989-jspb": "[0]",
      "x-goog-ext-73010990-jspb": "[0,0,0]",
    };
  }

  /**
   * Parse credentials into cookie string
   * Accepts: string (raw cookie), or object with __Secure-1PSID, __Secure-1PSIDTS
   */
  parseCookies(credentials) {
    if (!credentials) return null;
    
    const apiKey = credentials.apiKey || credentials.accessToken;
    if (!apiKey) return null;

    // If it's already a cookie string
    if (typeof apiKey === "string" && apiKey.includes("__Secure-1PSID")) {
      return apiKey;
    }

    // If it's a JSON string with cookie values
    if (typeof apiKey === "string" && apiKey.startsWith("{")) {
      try {
        const parsed = JSON.parse(apiKey);
        const parts = [];
        if (parsed.__Secure_1PSID || parsed["__Secure-1PSID"]) {
          parts.push(`__Secure-1PSID=${parsed.__Secure_1PSID || parsed["__Secure-1PSID"]}`);
        }
        if (parsed.__Secure_1PSIDTS || parsed["__Secure-1PSIDTS"]) {
          parts.push(`__Secure-1PSIDTS=${parsed.__Secure_1PSIDTS || parsed["__Secure-1PSIDTS"]}`);
        }
        return parts.join("; ") || null;
      } catch { /* fall through */ }
    }

    // If it's a simple token, use as __Secure-1PSID
    return `__Secure-1PSID=${apiKey}`;
  }

  // ============ Payload ============

  buildWebPayload(model, messages, stream, credentials) {
    const prompt = this.parseMessages(messages);
    const modelInfo = this.getModelInfo(model);
    const sessionId = this.sessionId || crypto.randomUUID().replace(/-/g, "").toUpperCase().slice(0, 32);
    const reqid = Math.floor(Math.random() * 90000) + 10000;

    // Build the 92-element sparse array for StreamGenerate (from HAR analysis)
    const innerArray = new Array(92).fill(null);
    innerArray[0] = [prompt, 0, null, null, null, null, 0];
    innerArray[1] = ["en"];
    innerArray[2] = ["", "", "", null, null, null, null, null, null, ""];
    innerArray[3] = "!" + crypto.randomBytes(512).toString("base64url");  // encrypted context
    innerArray[4] = modelInfo.modelId || "07dd29e450ebbfd5b0737191eba88bbc";  // 32-char hex model ID
    innerArray[6] = [1];
    innerArray[7] = 1;
    innerArray[10] = 1;
    innerArray[11] = 0;
    innerArray[17] = [[0]];
    innerArray[18] = 0;
    innerArray[27] = 1;
    innerArray[30] = [4];
    innerArray[41] = [1];
    innerArray[53] = 0;
    innerArray[59] = crypto.randomUUID();
    innerArray[61] = [];
    innerArray[67] = 0;
    innerArray[68] = 2;
    innerArray[79] = modelInfo.modelNumber || 3;
    innerArray[80] = 1;
    innerArray[91] = 0;

    const payload = {
      innerArray,
      sessionId,
      reqid,
      modelInfo,
    };

    return payload;
  }

  /**
   * Get model info for request headers
   */
  getModelInfo(model) {
    const models = {
      "gemini-3-pro": { modelId: "9d8ca3786ebdfbea", capacityTail: 1, modelNumber: 3 },
      "gemini-3-flash": { modelId: "07dd29e450ebbfd5b0737191eba88bbc", capacityTail: 1, modelNumber: 3 },
      "gemini-3-flash-thinking": { modelId: "5bf011840784117a", capacityTail: 1, modelNumber: 1 },
      "gemini-3-lite": { modelId: "cf41b0e0dd7d53e5", capacityTail: 1, modelNumber: 6 },
      "gemini-2.5-pro": { modelId: "e6fa609c3fa255c0", capacityTail: 4, modelNumber: 3 },
      "gemini-2.5-flash": { modelId: "56fdd199312815e2", capacityTail: 4, modelNumber: 1 },
      "gemini-2.0-flash": { modelId: "56fdd199312815e2", capacityTail: 1, modelNumber: 1 },
      "gemini-2.0-flash-lite": { modelId: "cf41b0e0dd7d53e5", capacityTail: 1, modelNumber: 1 },
    };
    return models[model] || { modelId: null, capacityTail: 1, modelNumber: 1 };
  }

  // ============ Stream parsing ============

  async *parseWebStream(responseBody, model, signal) {
    const reader = responseBody.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let skippedPrefix = false;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Skip the )]}' security prefix
        if (!skippedPrefix) {
          const prefixEnd = buffer.indexOf(")]}'");
          if (prefixEnd !== -1) {
            buffer = buffer.substring(prefixEnd + 4);
            skippedPrefix = true;
          }
        }

        // Gemini uses chunked format: {line_count}\n{lines}
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";  // Keep incomplete line in buffer

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Skip line counts (pure numbers)
          if (/^\d+$/.test(line)) continue;

          // Try to parse as JSON array
          try {
            const parsed = JSON.parse(line);
            // Response is wrapped in outer array: [["wrb.fr",null,"..."]]
            const inner = Array.isArray(parsed) && Array.isArray(parsed[0]) ? parsed[0] : parsed;
            
            // Look for content in the response
            const result = this.extractContentFromGeminiResponse(inner);
            if (result.text) {
              yield { delta: result.text };
            }
            if (result.thinking) {
              yield { thinking: result.thinking };
            }
            if (result.done) {
              yield { done: true };
              return;
            }
            if (result.error) {
              yield { error: result.error };
              return;
            }
          } catch {
            // Not valid JSON, skip
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Extract content from Gemini response array
   */
  extractContentFromGeminiResponse(arr) {
    const result = { text: null, thinking: null, done: false, error: null };

    try {
      // The response is typically a nested array
      // Look for the inner JSON string in position [2]
      if (arr.length > 2 && typeof arr[2] === "string") {
        const inner = JSON.parse(arr[2]);
        
        // Check for candidates
        if (inner && inner[4] && Array.isArray(inner[4]) && inner[4][0]) {
          const candidate = inner[4][0];
          
          // Text content is in [1][0]
          if (candidate[1] && Array.isArray(candidate[1]) && candidate[1][0]) {
            result.text = candidate[1][0];
          }
          
          // Completion indicator in [8][0]
          if (candidate[8] && Array.isArray(candidate[8]) && candidate[8][0] === 2) {
            result.done = true;
          }

          // Thinking content in [37][0][0]
          if (candidate[37] && Array.isArray(candidate[37]) && candidate[37][0] && Array.isArray(candidate[37][0]) && candidate[37][0][0]) {
            result.thinking = candidate[37][0][0];
          }
        }

        // Check for errors
        if (inner && inner[5] && inner[5][2] && inner[5][2][0] && inner[5][2][0][1]) {
          result.error = `Gemini error: ${inner[5][2][0][1]}`;
        }
      }

      // Check for context string (final chunk marker)
      if (arr.length > 25 && arr[25] && typeof arr[25] === "string") {
        result.done = true;
      }
    } catch {
      // Parse error, skip
    }

    return result;
  }

  // ============ Error handling ============

  /**
   * Parse tool calls from Gemini model output.
   * Gemini uses managed XML protocol as fallback for tool calling.
   * @param {string} content - Model output text
   * @param {Array} [tools] - Available tools for validation
   * @returns {{content: string, toolCalls: Array}}
   */
  parseToolCalls(content, tools = []) {
    return parseToolCallsFromText(content, this._getProviderModelType());
  }

  _getProviderModelType() {
    return 'default';
  }

  handleWebError(response, status, logger) {
    let errMsg = `Gemini Web returned HTTP ${status}`;
    
    if (status === 401 || status === 403) {
      errMsg = "Gemini Web auth failed — cookies may be expired. Please re-login to gemini.google.com and refresh cookies.";
    } else if (status === 429) {
      errMsg = "Gemini Web rate limited";
    } else if (status === 418) {
      errMsg = "Gemini Web temporary error — retrying may help";
    }

    logger?.warn?.("GEMINI-WEB", errMsg);
    return this.errorResponse(errMsg, status);
  }

  // ============ Full execute override ============

  async initSession(cookies, log) {
    try {
      log?.info?.("GEMINI-WEB", "Initializing session from Gemini page...");
      const res = await fetch(`${this.config.baseUrl}/app`, {
        method: "GET",
        headers: {
          Accept: "text/html,application/xhtml+xml",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
          Cookie: cookies,
        },
        redirect: "manual",
        signal: AbortSignal.timeout(15000),
      });

      if (res.status === 401 || res.status === 403 || res.status === 302) {
        log?.warn?.("GEMINI-WEB", `Session init failed: HTTP ${res.status}`);
        return;
      }

      const html = await res.text();

      // SNlM0e was removed from Gemini HTML in April 2026
      const atMatch = html.match(/"SNlM0e":"([^"]+)"/);
      if (atMatch) {
        this.accessToken = atMatch[1];
        log?.info?.("GEMINI-WEB", "Access token (SNlM0e) extracted");
      }

      // Extract session ID from FdrFJe
      const sidMatch = html.match(/"FdrFJe":"([^"]+)"/);
      if (sidMatch) {
        this.sessionId = sidMatch[1];
        log?.info?.("GEMINI-WEB", `Session ID: ${this.sessionId}`);
      }

      // Extract build label from cfb2h (new) or cf (legacy)
      const blMatch = html.match(/"cfb2h":"([^"]+)"/) || html.match(/"cf":"([^"]+)"/);
      if (blMatch) {
        this.buildLabel = blMatch[1];
        log?.info?.("GEMINI-WEB", `Build label: ${this.buildLabel}`);
      }
    } catch (err) {
      log?.warn?.("GEMINI-WEB", `Session init error: ${err.message}`);
    }
  }

  /**
   * Check if puppeteer is available
   */
  async _checkPuppeteer() {
    if (this.puppeteerAvailable !== null) return this.puppeteerAvailable;
    try {
      const mod = await import("puppeteer-extra");
      const StealthPlugin = (await import("puppeteer-extra-plugin-stealth")).default;
      this.puppeteerAvailable = true;
      this._puppeteerModule = mod;
      this._stealthPlugin = StealthPlugin;
    } catch {
      this.puppeteerAvailable = false;
    }
    return this.puppeteerAvailable;
  }

  /**
   * Extract at (XSRF) token from Gemini using Puppeteer.
   * The at token is generated by JavaScript at runtime and cannot be
   * obtained via HTTP requests alone.
   */
  async extractXsrfToken(cookies, log) {
    if (this.accessToken) return this.accessToken;

    const hasPuppeteer = await this._checkPuppeteer();
    if (!hasPuppeteer) {
      log?.warn?.("GEMINI-WEB", "Puppeteer not available — cannot extract at token automatically");
      return null;
    }

    log?.info?.("GEMINI-WEB", "Extracting at token via Puppeteer...");

    let browser = null;
    try {
      const puppeteer = this._puppeteerModule.default || this._puppeteerModule;
      const StealthPlugin = this._stealthPlugin;
      puppeteer.use(StealthPlugin());

      browser = await puppeteer.launch({
        headless: "new",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-blink-features=AutomationControlled",
          "--disable-dev-shm-usage",
        ],
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 720 });

      // Set cookies in browser
      const cookieArray = cookies.split(";").map((c) => {
        const [name, ...valueParts] = c.trim().split("=");
        const value = valueParts.join("=");
        return {
          name: name.trim(),
          value: value.trim(),
          domain: ".google.com",
          path: "/",
          secure: true,
          httpOnly: false,
        };
      });
      await page.setCookie(...cookieArray);

      // Navigate to Gemini
      await page.goto("https://gemini.google.com/app", {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // Wait for page to load and JavaScript to generate at token
      await new Promise((r) => setTimeout(r, 3000));

      // Extract at token from page context
      // The at token is generated by Google's JavaScript and stored in memory
      const atToken = await page.evaluate(() => {
        // Try to find at token in various places
        // 1. Check window.__NEXT_DATA__ or similar
        if (window.__NEXT_DATA__?.props?.pageProps?.at) {
          return window.__NEXT_DATA__.props.pageProps.at;
        }

        // 2. Check for SNlM0e in page source (legacy)
        const scripts = document.querySelectorAll("script");
        for (const script of scripts) {
          const match = script.textContent?.match(/"SNlM0e":"([^"]+)"/);
          if (match) return match[1];
        }

        // 3. Try to intercept from fetch/XHR
        // The at token is typically in the form: AD1_L...:timestamp
        // We can try to find it by looking at network requests

        return null;
      });

      if (atToken) {
        this.accessToken = atToken;
        log?.info?.("GEMINI-WEB", "at token extracted via Puppeteer");
        return atToken;
      }

      // If not found in page, try to intercept from network
      // Navigate to app and send a message to trigger the request
      log?.info?.("GEMINI-WEB", "at token not in page, trying network intercept...");

      // Intercept network requests to find the at token
      let foundToken = null;
      page.on("request", (req) => {
        const url = req.url();
        if (url.includes("StreamGenerate")) {
          const postData = req.postData();
          if (postData) {
            const match = postData.match(/at=([^&]+)/);
            if (match) {
              foundToken = decodeURIComponent(match[1]);
            }
          }
        }
      });

      // Try to type a message and send it to trigger the request
      try {
        // Look for input area
        const inputSelector = 'div[contenteditable="true"], textarea, .ql-editor';
        const input = await page.$(inputSelector);
        if (input) {
          await input.click();
          await page.keyboard.type("hi", { delay: 50 });
          await page.keyboard.press("Enter");
          await new Promise((r) => setTimeout(r, 5000));
        }
      } catch (e) {
        // Input not found, continue
      }

      if (foundToken) {
        this.accessToken = foundToken;
        log?.info?.("GEMINI-WEB", "at token extracted from network intercept");
        return foundToken;
      }

      log?.warn?.("GEMINI-WEB", "Could not extract at token via Puppeteer");
      return null;
    } catch (err) {
      log?.warn?.("GEMINI-WEB", `Puppeteer extraction failed: ${err.message}`);
      return null;
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch {}
      }
    }
  }

  async execute({ model, body, stream, credentials, signal, log }) {
    this._pendingTools = body?.tools || [];
    const messages = body?.messages;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return this.errorResponse("Missing or empty messages array", 400);
    }

    // Initialize session on first request
    if (!this.sessionId || !this.buildLabel) {
      const cookies = this.parseCookies(credentials);
      if (cookies) {
        await this.initSession(cookies, log);
      }
    }

    // Support at (XSRF) token from credentials
    if (credentials?.xsrfToken) {
      this.accessToken = credentials.xsrfToken;
    } else if (credentials?.at) {
      this.accessToken = credentials.at;
    }

    // Auto-extract at token if not provided
    if (!this.accessToken) {
      const cookies = this.parseCookies(credentials);
      if (cookies) {
        await this.extractXsrfToken(cookies, log);
      }
    }

    try {
      const payload = this.buildWebPayload(model, messages, stream, credentials);
      const headers = this.buildWebHeaders(credentials);
      const url = this.buildUrl(model, stream, 0, credentials);

      log?.info?.("GEMINI-WEB", `Request to ${model}, endpoint=${url}`);

      // Build URL-encoded form body: f.req + at (at goes in POST body per HAR analysis)
      const formBody = new URLSearchParams();
      formBody.append("f.req", JSON.stringify([null, JSON.stringify(payload.innerArray)]));
      formBody.append("at", this.accessToken || "");  // at in POST body, not query
      formBody.append("", "");  // trailing empty param like HAR

      // Query params: bl, f.sid, hl, _reqid, rt (NO at in query)
      const params = new URLSearchParams({
        hl: "en",
        _reqid: String(payload.reqid),
        rt: "c",
        bl: this.buildLabel || "",
        "f.sid": this.sessionId || "",
      });

      const response = await fetch(`${url}?${params.toString()}`, {
        method: "POST",
        headers,
        body: formBody.toString(),
        signal: signal || AbortSignal.timeout(60000),
      });

      if (!response.ok) {
        return this.handleWebError(response, response.status, log);
      }

      if (!response.body) {
        return this.errorResponse("Empty response body", 502);
      }

      const cid = `chatcmpl-gemini-web-${crypto.randomUUID().slice(0, 12)}`;
      const created = Math.floor(Date.now() / 1000);

      if (stream) {
        const sseStream = this.buildStreamingResponse(response.body, model, cid, created, signal);
        return {
          response: new Response(sseStream, {
            status: 200,
            headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
          }),
          url,
          headers,
          transformedBody: payload,
        };
      } else {
        const result = await this.buildNonStreamingResponse(response.body, model, cid, created, signal);
        return {
          response: result,
          url,
          headers,
          transformedBody: payload,
        };
      }
    } catch (err) {
      log?.error?.("GEMINI-WEB", `Error: ${err.message || String(err)}`);
      return this.errorResponse(`gemini-web failed: ${err.message || String(err)}`, 502);
    }
  }
}

export default GeminiWebExecutor;
