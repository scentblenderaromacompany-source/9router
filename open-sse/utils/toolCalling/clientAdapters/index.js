/**
 * Client adapter registry
 * Ported from Chat2API clientAdapters/index.ts
 */

import { standardOpenAiToolsAdapter } from './standardOpenAiTools.js'
import { cherryStudioMcpAdapter } from './cherryStudioMcp.js'

const adapters = new Map([
  [standardOpenAiToolsAdapter.id, standardOpenAiToolsAdapter],
  [cherryStudioMcpAdapter.id, cherryStudioMcpAdapter],
])

function getToolClientAdapter(clientAdapterId) {
  const adapter = adapters.get(clientAdapterId)
  if (adapter) return adapter

  return {
    ...standardOpenAiToolsAdapter,
    normalizeRequest(request) {
      const result = standardOpenAiToolsAdapter.normalizeRequest(request)
      return {
        ...result,
        diagnostics: {
          ...result.diagnostics,
          requestedClientAdapterId: clientAdapterId,
          fallbackClientAdapterId: standardOpenAiToolsAdapter.id,
        },
      }
    },
  }
}

function listToolClientAdapters() {
  return [standardOpenAiToolsAdapter, cherryStudioMcpAdapter]
}

export { getToolClientAdapter, listToolClientAdapters }
