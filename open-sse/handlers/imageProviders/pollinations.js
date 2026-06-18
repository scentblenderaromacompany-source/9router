// Pollinations.ai — simple GET URL image generation (free, no auth)
export default {
  noAuth: true,
  buildUrl: (model) => `https://image.pollinations.ai/prompt/placeholder?model=${encodeURIComponent(model || "flux")}&width=256&height=256`,
  buildHeaders: () => ({ "Content-Type": "application/json" }),
  buildBody: () => null,
  parseResponse: async (_response, { body }) => {
    const model = body?.model || "flux";
    const width = body?.width || 1024;
    const height = body?.height || 1024;
    const prompt = body?.prompt || "";
    const params = new URLSearchParams({ model, width: String(width), height: String(height) });
    if (body?.seed) params.set("seed", String(body.seed));
    if (body?.safe) params.set("safe", "true");
    if (body?.quality) params.set("quality", body.quality);
    if (body?.transparent) params.set("transparent", "true");
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params}`;
    return {
      created: Math.floor(Date.now() / 1000),
      data: [{ url: imageUrl, revised_prompt: prompt }],
    };
  },
  normalize: (parsed) => parsed,
};
