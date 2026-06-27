import { handleChat } from "@/sse/handlers/chat.js";
import { initTranslators } from "open-sse/translator/index.js";
import { proxyToChat2Api, resolveChat2ApiProxyConfig } from "@/lib/chat2apiProxy.js";
import { getProviderConnections, getSettings } from "@/lib/localDb";

let initialized = false;

/**
 * Initialize translators once
 */
async function ensureInitialized() {
  if (!initialized) {
    await initTranslators();
    initialized = true;
  }
}

/**
 * Handle CORS preflight
 */
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*"
    }
  });
}

export async function POST(request) {
  const settings = await getSettings();
  const providerConnections = await getProviderConnections();
  const chat2ApiConfig = await resolveChat2ApiProxyConfig(request.headers, settings, request, providerConnections);
  if (chat2ApiConfig) {
    return proxyToChat2Api(request, { config: chat2ApiConfig });
  }

  // Fallback to local handling
  await ensureInitialized();

  return await handleChat(request);
}

