/**
 * Standard OpenAI Tools client adapter
 * Ported from Chat2API clientAdapters/standardOpenAiTools.ts
 */

function normalizeOpenAiTools(tools, source) {
  return (tools ?? [])
    .filter((tool) => tool.type === 'function' && Boolean(tool.function?.name))
    .map((tool) => ({
      name: tool.function.name,
      description: tool.function.description,
      parameters: tool.function.parameters ?? {},
      source,
    }))
}

function normalizeToolChoice(request, toolNames) {
  const choice = request.tool_choice
  if (choice === 'none') return { mode: 'none' }
  if (choice === 'required') return { mode: 'required' }
  if (choice && typeof choice === 'object' && choice.type === 'function') {
    return { mode: 'forced', forcedName: choice.function.name }
  }
  if (toolNames.size === 1) return { mode: 'auto' }
  return { mode: 'auto' }
}

const standardOpenAiToolsAdapter = {
  id: 'standard-openai-tools',
  displayName: 'Standard OpenAI Tools',
  normalizeRequest(request) {
    const tools = normalizeOpenAiTools(request.tools, 'openai')
    const toolChoice = normalizeToolChoice(request, new Set(tools.map((tool) => tool.name)))

    return {
      clientAdapterId: 'standard-openai-tools',
      toolSource: tools.length > 0 ? 'openai' : 'none',
      tools,
      toolChoice,
      diagnostics: {
        rawToolCount: request.tools?.length ?? 0,
        normalizedToolNames: tools.map((tool) => tool.name),
      },
    }
  },
}

export { normalizeOpenAiTools, normalizeToolChoice, standardOpenAiToolsAdapter }
