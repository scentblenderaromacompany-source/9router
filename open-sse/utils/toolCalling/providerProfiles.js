/**
 * Provider tool profiles
 * Ported from Chat2API providerProfiles.ts
 */

import { managedXmlProtocol } from './protocols/managedXml.js'

const chat2ApiXmlHistoryProfile = {
  managedSupport: true,
  supportsNativeTools: false,
  preferredManagedProtocol: 'managed_xml',
  formatAssistantToolCalls(calls) {
    return managedXmlProtocol.formatAssistantToolCalls(calls)
  },
  formatToolResult(result) {
    return managedXmlProtocol.formatToolResult(result)
  },
}

const profiles = {
  deepseek: {
    providerId: 'deepseek',
    ...chat2ApiXmlHistoryProfile,
  },
  kimi: {
    providerId: 'kimi',
    ...chat2ApiXmlHistoryProfile,
  },
  glm: {
    providerId: 'glm',
    ...chat2ApiXmlHistoryProfile,
  },
  qwen: {
    providerId: 'qwen',
    ...chat2ApiXmlHistoryProfile,
  },
}

function getProviderToolProfile(providerId) {
  return profiles[providerId] ?? {
    providerId,
    ...chat2ApiXmlHistoryProfile,
  }
}

export { getProviderToolProfile }
