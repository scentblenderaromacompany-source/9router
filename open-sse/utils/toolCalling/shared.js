/**
 * Tool Calling configuration and normalization
 * Ported from Chat2API src/shared/toolCalling.ts
 */

/**
 * @typedef {'off' | 'auto' | 'force'} ToolCallingModeSetting
 * @typedef {'standard-openai-tools' | 'cherry-studio-mcp' | string} ToolClientAdapterId
 *
 * @typedef {Object} ToolCallingConfig
 * @property {boolean} enabled
 * @property {ToolCallingModeSetting} mode
 * @property {ToolClientAdapterId} clientAdapterId
 * @property {boolean} diagnosticsEnabled
 * @property {Object} advanced
 * @property {string} [advanced.customPromptTemplate]
 * @property {boolean} advanced.promptPreviewEnabled
 */

const DEFAULT_TOOL_CALLING_CONFIG = {
  enabled: true,
  mode: 'auto',
  clientAdapterId: 'standard-openai-tools',
  diagnosticsEnabled: false,
  advanced: {
    promptPreviewEnabled: false,
    customPromptTemplate: undefined,
  },
}

const P0_TOOL_CLIENT_ADAPTERS = [
  {
    id: 'standard-openai-tools',
    label: 'Standard OpenAI Tools',
    descriptionKey: 'toolCalling.clients.standardOpenAiToolsDesc',
    smokeTestKind: 'openai-tools',
  },
  {
    id: 'cherry-studio-mcp',
    label: 'Cherry Studio MCP',
    descriptionKey: 'toolCalling.clients.cherryStudioMcpDesc',
    smokeTestKind: 'cherry-mcp-weather',
  },
]

const P0_TOOL_PROVIDER_SUPPORT = [
  { providerId: 'deepseek', label: 'DEEPSEEK', managed: true, protocolId: 'managed_xml', status: 'supported' },
  { providerId: 'kimi', label: 'KIMI', managed: true, protocolId: 'managed_xml', status: 'supported' },
  { providerId: 'glm', label: 'GLM', managed: true, protocolId: 'managed_xml', status: 'supported' },
  { providerId: 'qwen', label: 'QWEN', managed: true, protocolId: 'managed_xml', status: 'supported' },
  { providerId: 'mimo', label: 'MIMO', managed: true, protocolId: 'managed_xml', status: 'supported' },
]

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isMode(value) {
  return value === 'off' || value === 'auto' || value === 'force'
}

function isClientAdapterId(value) {
  return value === 'standard-openai-tools' || value === 'cherry-studio-mcp'
}

function normalizeToolCallingConfig(value) {
  if (!isRecord(value)) return DEFAULT_TOOL_CALLING_CONFIG

  if ('defaultFormat' in value || value.mode === 'always' || value.mode === 'never') {
    const legacy = value
    const enabled = legacy.mode !== 'never'

    return {
      enabled,
      mode: legacy.mode === 'never' ? 'off' : legacy.mode === 'always' ? 'force' : 'auto',
      clientAdapterId: 'standard-openai-tools',
      diagnosticsEnabled: Boolean(legacy.customPromptTemplate) || legacy.enableToolCallParsing === false,
      advanced: {
        promptPreviewEnabled: false,
        customPromptTemplate: typeof legacy.customPromptTemplate === 'string'
          ? legacy.customPromptTemplate
          : undefined,
      },
    }
  }

  const advanced = isRecord(value.advanced) ? value.advanced : {}
  const enabled = typeof value.enabled === 'boolean'
    ? value.enabled
    : DEFAULT_TOOL_CALLING_CONFIG.enabled
  const mode = isMode(value.mode) ? value.mode : DEFAULT_TOOL_CALLING_CONFIG.mode

  return {
    enabled: mode === 'off' ? false : enabled,
    mode,
    clientAdapterId: isClientAdapterId(value.clientAdapterId)
      ? value.clientAdapterId
      : DEFAULT_TOOL_CALLING_CONFIG.clientAdapterId,
    diagnosticsEnabled: typeof value.diagnosticsEnabled === 'boolean'
      ? value.diagnosticsEnabled
      : DEFAULT_TOOL_CALLING_CONFIG.diagnosticsEnabled,
    advanced: {
      promptPreviewEnabled: typeof advanced.promptPreviewEnabled === 'boolean'
        ? advanced.promptPreviewEnabled
        : DEFAULT_TOOL_CALLING_CONFIG.advanced.promptPreviewEnabled,
      customPromptTemplate: typeof advanced.customPromptTemplate === 'string'
        ? advanced.customPromptTemplate
        : undefined,
    },
  }
}

export {
  DEFAULT_TOOL_CALLING_CONFIG,
  P0_TOOL_CLIENT_ADAPTERS,
  P0_TOOL_PROVIDER_SUPPORT,
  normalizeToolCallingConfig,
}
