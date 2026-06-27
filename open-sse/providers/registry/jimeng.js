/**
 * Jimeng/Dreamina (ByteDance) image generation provider — free via reverse-engineered API
 * Supports Jimeng 4.0/4.1/5.0/6, Seedance video
 * Reverse-engineered from jimeng.jianying.com / dreamina.com
 */
export default {
  id: "jimeng",
  priority: 130,
  alias: "jimeng",
  aliases: ["jm"],
  uiAlias: "jm",
  display: {
    name: "Jimeng/Dreamina (Free)",
    icon: "brush",
    color: "#FE2C55",
    textIcon: "JM",
    website: "https://jimeng.jianying.com",
    notice: {
      signupUrl: "https://jimeng.jianying.com",
      info: "ByteDance's free image generation. Requires session cookie from jimeng.jianying.com. Supports Jimeng 4.0-6, Seedance video.",
    },
    kindNotice: {
      image: "Free via reverse-engineered API. Requires session cookie.",
    },
  },
  category: "free",
  authType: "cookie",
  authHint: "Paste your Jimeng session cookie from browser DevTools",
  transport: {
    baseUrl: "https://jimeng.jianying.com",
    format: "jimeng",
  },
  models: [
    { id: "jimeng-6", name: "Jimeng 6", capabilities: ["text2img", "img2img"], params: ["width", "height", "seed", "style"] },
    { id: "jimeng-5", name: "Jimeng 5", capabilities: ["text2img", "img2img"], params: ["width", "height", "seed", "style"] },
    { id: "jimeng-4.1", name: "Jimeng 4.1", capabilities: ["text2img", "img2img"], params: ["width", "height", "seed", "style"] },
    { id: "jimeng-4", name: "Jimeng 4.0", capabilities: ["text2img", "img2img"], params: ["width", "height", "seed", "style"] },
  ],
  serviceKinds: ["image"],
  hasProviderSpecificData: false,
};
