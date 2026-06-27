/**
 * Tool Calling Engine
 * Ported from Chat2API ToolCallingEngine.ts
 */

import { DEFAULT_TOOL_CALLING_CONFIG, normalizeToolCallingConfig } from './shared.js'
import { getToolProtocol } from './protocols/index.js'
import { getToolClientAdapter } from './clientAdapters/index.js'
import { buildToolCallingRuntimePlan } from './runtimePlan.js'

class ToolCallingEngine {
  constructor(config = {}) {
    this.config = normalizeToolCallingConfig({
      ...DEFAULT_TOOL_CALLING_CONFIG,
      ...config,
      advanced: {
        ...DEFAULT_TOOL_CALLING_CONFIG.advanced,
        ...config.advanced,
      },
    })
  }

  transformRequest(input) {
    const { request, provider, actualModel, requestId } = input
    const adapter = getToolClientAdapter(this.config.clientAdapterId)
    const clientRequest = adapter.normalizeRequest(request)
    const plan = buildToolCallingRuntimePlan({
      requestId,
      providerId: provider.id,
      actualModel,
      model: request.model,
      config: this.config,
      clientRequest,
    })
    const shouldInjectPrompt = plan.shouldInjectPrompt

    if (!shouldInjectPrompt) {
      return {
        messages: request.messages,
        tools: plan.mode === 'disabled' ? request.tools : undefined,
        plan,
      }
    }

    return {
      messages: injectPrompt(request.messages, renderPrompt(plan.protocol, plan.tools, this.config)),
      tools: undefined,
      plan,
    }
  }

  applyNonStreamResponse(result, plan) {
    if (!plan.shouldParseResponse) return

    const message = result?.choices?.[0]?.message
    if (!message || typeof message.content !== 'string') return

    const parseResult = parseSelectedProtocol(message.content, plan)
    plan.diagnostics.parserFormat = parseResult.protocol
    plan.diagnostics.parsedToolCallCount = parseResult.toolCalls.length
    plan.diagnostics.invalidToolNames = parseResult.invalidToolNames
    plan.diagnostics.malformedReason = parseResult.malformedReason

    if (parseResult.toolCalls.length === 0) return

    message.content = parseResult.content || null
    message.tool_calls = parseResult.toolCalls

    const choice = result.choices[0]
    choice.finish_reason = 'tool_calls'
  }
}

function renderPrompt(protocol, tools, config) {
  const prompt = getToolProtocol(protocol).renderPrompt(tools)
  const customPromptTemplate = config.diagnosticsEnabled
    ? config.advanced.customPromptTemplate
    : undefined
  if (!customPromptTemplate) return prompt

  return customPromptTemplate
    .replace(/\{\{tools\}\}/g, prompt)
    .replace(/\{\{tool_names\}\}/g, tools.map((tool) => tool.name).join(', '))
    .replace(/\{\{format\}\}/g, protocol)
}

function injectPrompt(messages, prompt) {
  const [first, ...rest] = messages
  if (first?.role === 'system' && typeof first.content === 'string') {
    return [{ ...first, content: `${first.content}\n\n${prompt}` }, ...rest]
  }

  return [{ role: 'system', content: prompt }, ...messages]
}

function parseSelectedProtocol(content, plan) {
  const selected = getToolProtocol(plan.protocol)
  return selected.parse(content, { tools: plan.tools, protocol: plan.protocol })
}

export { ToolCallingEngine }
