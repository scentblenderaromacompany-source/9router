export default {
  id: "vertex",
  priority: 40,
  alias: "vertex",
  aliases: [
    "vx",
  ],
  uiAlias: "vx",
  display: {
    name: "Vertex AI",
    icon: "cloud",
    color: "#4285F4",
    textIcon: "VX",
    website: "https://cloud.google.com/vertex-ai",
    notice: {
      text: "New Google Cloud accounts get $300 free credits. Requires GCP project + Service Account with Vertex AI API enabled.",
      apiKeyUrl: "https://console.cloud.google.com/iam-admin/serviceaccounts",
    },
  },
  category: "freeTier",
  transport: {
    baseUrl: "https://aiplatform.googleapis.com",
    format: "vertex",
  },
  models: [
    { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro Preview", capabilities: ["text", "vision", "tools"], params: ["temperature", "max_tokens", "top_p"] },
    { id: "gemini-3.1-flash-lite-preview", name: "Gemini 3.1 Flash Lite Preview", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    { id: "gemini-3-flash-preview", name: "Gemini 3 Flash Preview", capabilities: ["text", "vision", "tools"], params: ["temperature", "max_tokens", "top_p"] },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", capabilities: ["text", "vision", "tools"], params: ["temperature", "max_tokens", "top_p"] },
  ],
  serviceKinds: ["llm","imageToText"],
};
