/**
 * Shared protocol utilities
 * Ported from Chat2API protocols/shared.ts
 */

function detectMarkers(buffer, markers) {
  let earliest = -1
  for (const marker of markers) {
    const index = buffer.indexOf(marker)
    if (index !== -1 && (earliest === -1 || index < earliest)) {
      earliest = index
    }
  }

  if (earliest !== -1) {
    return { matched: true, partial: false, markerStart: earliest }
  }

  for (let index = 0; index < buffer.length; index += 1) {
    const suffix = buffer.slice(index)
    if (markers.some((marker) => marker.startsWith(suffix))) {
      return { matched: false, partial: true, markerStart: index }
    }
  }

  return { matched: false, partial: false }
}

function stripFencedCodeBlocks(content) {
  return content.replace(/```[\s\S]*?```/g, '')
}

function toolNames(tools) {
  return new Set(tools.map((tool) => tool.name))
}

function createParseResult(input) {
  return {
    content: input.content,
    toolCalls: input.toolCalls,
    protocol: input.protocol,
    rawMatches: input.rawMatches,
    malformedReason: input.malformedReason,
    invalidToolNames: input.invalidToolNames ?? [],
  }
}

function buildToolCall(id, index, name, args, rawText) {
  const result = {
    id,
    index,
    type: 'function',
    function: {
      name,
      arguments: normalizeArguments(args),
    },
  }
  if (rawText) result.rawText = rawText
  return result
}

function normalizeArguments(args) {
  if (typeof args === 'string') {
    const trimmed = args.trim()
    if (!trimmed) return '{}'
    try {
      return JSON.stringify(JSON.parse(trimmed))
    } catch {
      return trimmed
    }
  }

  return JSON.stringify(args ?? {})
}

function parseJsonValue(value) {
  const trimmed = unwrapCdata(value).trim()
  if (!trimmed) return ''

  try {
    return JSON.parse(trimmed)
  } catch {
    return decodeXml(trimmed)
  }
}

function unwrapCdata(value) {
  const cdata = value.match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/)
  return cdata ? cdata[1] : value
}

function decodeXml(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

function escapeXmlAttribute(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function addParameter(target, name, value) {
  const existing = target[name]
  if (existing === undefined) {
    target[name] = value
  } else if (Array.isArray(existing)) {
    target[name] = [...existing, value]
  } else {
    target[name] = [existing, value]
  }
}

function renderToolList(tools) {
  return tools
    .map((tool) => {
      const parameters = JSON.stringify(tool.parameters ?? {})
      return `Tool \`${tool.name}\`: ${tool.description || 'No description'}. Arguments JSON schema: ${parameters}`
    })
    .join('\n')
}

function genericToolResultBlock(result) {
  return `[TOOL_RESULT for ${result.toolCallId}] ${result.content}`
}

export {
  detectMarkers,
  stripFencedCodeBlocks,
  toolNames,
  createParseResult,
  buildToolCall,
  normalizeArguments,
  parseJsonValue,
  unwrapCdata,
  decodeXml,
  escapeXmlAttribute,
  addParameter,
  renderToolList,
  genericToolResultBlock,
}
