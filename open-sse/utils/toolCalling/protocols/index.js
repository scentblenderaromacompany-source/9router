/**
 * Protocol registry
 * Ported from Chat2API protocols/index.ts
 */

import { managedBracketProtocol } from './managedBracket.js'
import { managedXmlProtocol } from './managedXml.js'
import { anthropicToolUseProtocol } from './anthropicToolUse.js'
import { codexResponsesProtocol } from './codexResponses.js'

const protocols = {
  openai_chat: managedBracketProtocol,
  managed_bracket: managedBracketProtocol,
  managed_xml: managedXmlProtocol,
  anthropic_tool_use: anthropicToolUseProtocol,
  codex_responses: codexResponsesProtocol,
}

function getToolProtocol(id) {
  return protocols[id]
}

function getManagedProtocols() {
  return [
    managedBracketProtocol,
    managedXmlProtocol,
    anthropicToolUseProtocol,
    codexResponsesProtocol,
  ]
}

export { getToolProtocol, getManagedProtocols }
