import { describe, expect, it } from "vitest";
import { getAddConnectionModalConfig } from "../../src/app/(dashboard)/dashboard/providers/[id]/modalConfig.js";

describe("provider modal auth config", () => {
  it("returns cookie-specific metadata for web cookie providers", () => {
    const providerInfo = {
      id: "grok-web",
      name: "Grok Web",
      authType: "cookie",
      authHint: "Paste your sso= cookie value from grok.com",
      website: "https://grok.com",
    };

    const config = getAddConnectionModalConfig(providerInfo, false, false);

    expect(config.authType).toBe("cookie");
    expect(config.authHint).toBe("Paste your sso= cookie value from grok.com");
    expect(config.website).toBe("https://grok.com");
    expect(config.credentialLabel).toBe("Cookie Value");
  });

  it("keeps api-key defaults for standard providers", () => {
    const providerInfo = {
      id: "openai",
      name: "OpenAI",
      authType: "apikey",
    };

    const config = getAddConnectionModalConfig(providerInfo, false, false);

    expect(config.authType).toBe("apikey");
    expect(config.credentialLabel).toBe("API Key");
    expect(config.authHint).toBeUndefined();
    expect(config.website).toBeUndefined();
  });

  it("uses DeepSeek-specific cookie placeholder", () => {
    const providerInfo = {
      id: "deepseek-web",
      authType: "cookie",
    };

    const config = getAddConnectionModalConfig(providerInfo, false, false);

    expect(config.credentialLabel).toBe("Cookie Value");
    expect(config.credentialPlaceholder).toContain("USER_TOKEN");
  });
});
