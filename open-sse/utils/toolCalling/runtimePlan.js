/**
 * Runtime plan builder
 * Ported from Chat2API runtimePlan.ts
 */

import { getProviderToolProfile } from './providerProfiles.js'

function buildToolCallingRuntimePlan(input) {
  const profile = getProviderToolProfile(input.providerId)
  const tools = input.clientRequest.tools
  const toolNames = new Set(tools.map((tool) => tool.name))
  const forcedName = input.clientRequest.toolChoice.forcedName

  if (input.clientRequest.toolChoice.mode === 'forced' && forcedName && !toolNames.has(forcedName)) {
    throw new Error(`Forced tool ${forcedName} is not declared`)
  }

  const allowedToolNames = forcedName ? new Set([forcedName]) : toolNames
  const allowedTools = forcedName ? tools.filter((tool) => tool.name === forcedName) : tools
  const disabledReason = getDisabledReason(
    input.config,
    allowedTools.length,
    input.clientRequest.toolChoice.mode,
    profile.managedSupport,
  )
  const mode = disabledReason ? 'disabled' : 'managed'
  const protocol = profile.preferredManagedProtocol
  const shouldInjectPrompt = mode === 'managed'
  const shouldParseResponse = mode === 'managed'

  return {
    mode,
    protocol,
    clientAdapterId: input.clientRequest.clientAdapterId,
    providerId: input.providerId,
    tools: allowedTools,
    shouldInjectPrompt,
    shouldParseResponse,
    toolChoiceMode: input.clientRequest.toolChoice.mode,
    allowedToolNames,
    forcedToolName: forcedName,
    diagnostics: {
      requestId: input.requestId,
      clientAdapterId: input.clientRequest.clientAdapterId,
      providerId: input.providerId,
      model: input.model,
      actualModel: input.actualModel,
      toolSource: input.clientRequest.toolSource,
      mode,
      protocol,
      toolCount: allowedTools.length,
      injected: shouldInjectPrompt,
      reason: disabledReason ?? `managed_${input.config.mode}`,
      toolChoiceMode: input.clientRequest.toolChoice.mode,
      forcedToolName: forcedName,
      allowedToolNames: [...allowedToolNames],
    },
  }
}

function getDisabledReason(config, toolCount, toolChoiceMode, managedSupport) {
  if (!config.enabled || config.mode === 'off') return 'mode_off'
  if (toolChoiceMode === 'none') return 'tool_choice_none'
  if (toolCount === 0) return 'no_tools'
  if (!managedSupport && config.mode === 'auto') return 'provider_not_supported'
  return undefined
}

export { buildToolCallingRuntimePlan }
