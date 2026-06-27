/**
 * Cherry Studio MCP client adapter
 * Ported from Chat2API clientAdapters/cherryStudioMcp.ts
 */

import { normalizeOpenAiTools, normalizeToolChoice } from './standardOpenAiTools.js'

const cherryStudioMcpAdapter = {
  id: 'cherry-studio-mcp',
  displayName: 'Cherry Studio MCP',
  normalizeRequest(request) {
    const tools = normalizeOpenAiTools(request.tools, 'mcp')
    const toolChoice = normalizeToolChoice(request, new Set(tools.map((tool) => tool.name)))

    return {
      clientAdapterId: 'cherry-studio-mcp',
      toolSource: tools.length > 0 ? 'mcp' : 'none',
      tools,
      toolChoice,
      diagnostics: {
        rawToolCount: request.tools?.length ?? 0,
        normalizedToolNames: tools.map((tool) => tool.name),
      },
    }
  },
}

export { cherryStudioMcpAdapter }
