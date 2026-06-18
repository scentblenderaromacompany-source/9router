/**
 * Pollinations.ai image generation provider — free, no signup required
 * Supports Flux, Kontext, NanoBanana, Seedream, GPT Image, and more
 * Simple GET URL: https://image.pollinations.ai/prompt/{prompt}?model=flux
 */
export default {
  id: "pollinations",
  priority: 130,
  alias: "pollinations",
  aliases: ["poll"],
  uiAlias: "poll",
  display: {
    name: "Pollinations.ai (Free)",
    icon: "image",
    color: "#FF6B6B",
    textIcon: "POL",
    website: "https://pollinations.ai",
    notice: {
      signupUrl: "https://pollinations.ai",
      info: "Free image generation — no account required! Supports Flux, Kontext, Seedream, GPT Image, and more.",
    },
    kindNotice: {
      image: "Free tier: 1 request/15s. Registered: 1 req/5s. Paid: no limits.",
    },
  },
  category: "free",
  authType: "none",
  authHint: "No authentication needed — Pollinations is free",
  noAuth: true,
  transport: {
    baseUrl: "https://image.pollinations.ai",
    format: "pollinations",
  },
  models: [
    { id: "flux", name: "Flux", capabilities: ["text2img"], params: ["width", "height", "seed", "model"] },
    { id: "flux-realism", name: "Flux Realism", capabilities: ["text2img"], params: ["width", "height", "seed"] },
    { id: "flux-anime", name: "Flux Anime", capabilities: ["text2img"], params: ["width", "height", "seed"] },
    { id: "flux-3d", name: "Flux 3D", capabilities: ["text2img"], params: ["width", "height", "seed"] },
    { id: "flux-cablyai", name: "Flux CablyAI", capabilities: ["text2img"], params: ["width", "height", "seed"] },
    { id: "flux-black-forest", name: "Flux Black Forest", capabilities: ["text2img"], params: ["width", "height", "seed"] },
    { id: "kontext", name: "Kontext", capabilities: ["text2img"], params: ["width", "height", "seed"] },
    { id: "nanobanana", name: "NanoBanana", capabilities: ["text2img"], params: ["width", "height", "seed"] },
    { id: "seedream", name: "Seedream", capabilities: ["text2img"], params: ["width", "height", "seed"] },
    { id: "gptimage", name: "GPT Image", capabilities: ["text2img"], params: ["width", "height", "seed"] },
    { id: "grok", name: "Grok Imagine", capabilities: ["text2img"], params: ["width", "height", "seed"] },
    { id: "qwen", name: "Qwen Image", capabilities: ["text2img"], params: ["width", "height", "seed"] },
  ],
  serviceKinds: ["image"],
  hasProviderSpecificData: false,
};
