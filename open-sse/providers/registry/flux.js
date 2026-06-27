/**
 * Flux (Black Forest Labs) image generation provider
 * Supports Flux.1 Schnell (free Apache 2.0), Flux.1 Dev, Flux Pro, Flux 2
 * Multiple providers: BFL API, Together, Replicate
 */
export default {
  id: "flux",
  priority: 130,
  alias: "flux",
  aliases: ["bfl"],
  uiAlias: "flux",
  display: {
    name: "Flux (Black Forest Labs)",
    icon: "bolt",
    color: "#10B981",
    textIcon: "FLX",
    website: "https://blackforestlabs.ai",
    notice: {
      signupUrl: "https://api.bfl.ml",
      info: "Flux by Black Forest Labs. Schnell model is free (Apache 2.0). Pro models via API credits.",
    },
    kindNotice: {
      image: "Schnell: free (Apache 2.0). Pro: API credits required.",
    },
  },
  category: "apikey",
  authType: "apikey",
  authHint: "Get your API key from https://api.bfl.ml",
  transport: {
    baseUrl: "https://api.bfl.ml",
    format: "flux",
  },
  models: [
    { id: "flux-1.1-pro", name: "Flux 1.1 Pro", capabilities: ["text2img"], params: ["width", "height", "seed", "steps", "guidance"] },
    { id: "flux-1.1-pro-ultra", name: "Flux 1.1 Pro Ultra", capabilities: ["text2img"], params: ["width", "height", "seed", "steps", "guidance"] },
    { id: "flux-dev", name: "Flux Dev", capabilities: ["text2img"], params: ["width", "height", "seed", "steps", "guidance"] },
    { id: "flux-schnell", name: "Flux Schnell (Free)", capabilities: ["text2img"], params: ["width", "height", "seed", "steps"] },
    { id: "flux-pro", name: "Flux Pro", capabilities: ["text2img"], params: ["width", "height", "seed", "steps", "guidance"] },
    { id: "flux-2-pro", name: "Flux 2 Pro", capabilities: ["text2img"], params: ["width", "height", "seed", "steps", "guidance"] },
    { id: "flux-2-dev", name: "Flux 2 Dev", capabilities: ["text2img"], params: ["width", "height", "seed", "steps", "guidance"] },
    { id: "flux-2-klein", name: "Flux 2 Klein", capabilities: ["text2img"], params: ["width", "height", "seed", "steps"] },
  ],
  serviceKinds: ["image"],
  hasProviderSpecificData: false,
};
