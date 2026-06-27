/**
 * Krea AI image generation provider — official API with 40+ models
 * Supports Flux, Imagen 4, Ideogram, Seedream, Veo, Sora, Kling, and more
 * Official REST API with async job support
 */
export default {
  id: "krea",
  priority: 130,
  alias: "krea",
  aliases: ["krea"],
  uiAlias: "krea",
  display: {
    name: "Krea AI",
    icon: "palette",
    color: "#8B5CF6",
    textIcon: "KREA",
    website: "https://krea.ai",
    notice: {
      signupUrl: "https://krea.ai",
      info: "Krea AI provides 40+ image and video generation models via official API. Free plan available with compute units.",
    },
    kindNotice: {
      image: "Free plan with compute units. Paid plans for more generations.",
    },
  },
  category: "apikey",
  authType: "apikey",
  authHint: "Get your API key from https://www.krea.ai/app/api",
  transport: {
    baseUrl: "https://api.krea.ai",
    format: "krea",
  },
  models: [
    { id: "flux-1.1-pro", name: "Flux 1.1 Pro", capabilities: ["text2img"], params: ["width", "height", "seed", "steps"] },
    { id: "flux-1.1-pro-ultra", name: "Flux 1.1 Pro Ultra", capabilities: ["text2img"], params: ["width", "height", "seed", "steps"] },
    { id: "flux-dev", name: "Flux Dev", capabilities: ["text2img"], params: ["width", "height", "seed", "steps"] },
    { id: "flux-schnell", name: "Flux Schnell", capabilities: ["text2img"], params: ["width", "height", "seed", "steps"] },
    { id: "imagen-4", name: "Imagen 4", capabilities: ["text2img"], params: ["width", "height", "seed"] },
    { id: "imagen-4-fast", name: "Imagen 4 Fast", capabilities: ["text2img"], params: ["width", "height", "seed"] },
    { id: "ideogram-3.0", name: "Ideogram 3.0", capabilities: ["text2img"], params: ["width", "height", "seed", "style"] },
    { id: "ideogram-2.0", name: "Ideogram 2.0", capabilities: ["text2img"], params: ["width", "height", "seed", "style"] },
    { id: "seedream", name: "Seedream", capabilities: ["text2img"], params: ["width", "height", "seed"] },
    { id: "recraft-v3", name: "Recraft V3", capabilities: ["text2img"], params: ["width", "height", "seed", "style"] },
    { id: "dall-e-3", name: "DALL-E 3", capabilities: ["text2img"], params: ["width", "height", "quality"] },
    { id: "midjourney-v6", name: "Midjourney V6", capabilities: ["text2img"], params: ["width", "height", "seed", "style"] },
  ],
  serviceKinds: ["image"],
  hasProviderSpecificData: false,
};
