/**
 * Grok Imagine (xAI) image generation provider — free via reverse-engineered API
 * Supports Grok Imagine image generation
 * Reverse-engineered from grok.x.ai
 */
export default {
  id: "grok-imagine",
  priority: 130,
  alias: "grok-img",
  aliases: ["gi"],
  uiAlias: "gi",
  display: {
    name: "Grok Imagine (Free)",
    icon: "auto_awesome",
    color: "#1DA1F2",
    textIcon: "GI",
    website: "https://grok.x.ai",
    notice: {
      signupUrl: "https://grok.x.ai",
      info: "xAI's Grok Imagine — free image generation via anonymous sessions. No API key needed.",
    },
    kindNotice: {
      image: "Free via reverse-engineered anonymous sessions.",
    },
  },
  category: "free",
  authType: "none",
  authHint: "No authentication needed — uses anonymous sessions",
  transport: {
    baseUrl: "https://grok.x.ai",
    format: "grok-imagine",
  },
  models: [
    { id: "grok-imagine", name: "Grok Imagine", capabilities: ["text2img"], params: ["width", "height", "seed"] },
  ],
  serviceKinds: ["image"],
  hasProviderSpecificData: false,
};
