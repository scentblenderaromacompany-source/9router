export function getAddConnectionModalConfig(providerInfo = {}, isCompatible = false, isAnthropic = false) {
  const providerId = providerInfo?.id || providerInfo?.providerId || providerInfo?.provider || "";
  const providerAuthType = providerInfo?.authType || providerInfo?.authModes?.find?.((mode) => mode === "cookie") || "apikey";
  const isCookie = providerAuthType === "cookie";
  const credentialLabel = isCookie ? "Cookie Value" : "API Key";
  const credentialPlaceholder = isCookie
    ? (providerId === "grok-web" ? "sso=xxxxx... or just the raw value"
      : providerId === "deepseek-web" ? "USER_TOKEN or Bearer USER_TOKEN"
      : providerId === "gemini-web" ? "Paste ALL cookies from .google.com + .gemini.google.com"
      : "eyJhbGciOi...")
    : (providerId === "xai" && !isCookie ? "xai-..." : "");

  return {
    providerId,
    authType: providerAuthType,
    isCookie,
    isCompatible,
    isAnthropic,
    credentialLabel,
    credentialPlaceholder,
    authHint: providerInfo?.authHint,
    website: providerInfo?.website,
  };
}
