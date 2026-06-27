/**
 * Tool Stream Parser
 * Ported from Chat2API ToolStreamParser.ts
 */

import { getToolProtocol } from './protocols/index.js'

class ToolStreamParser {
  constructor(plan) {
    this.plan = plan
    this.buffer = ''
    this.isBufferingToolCall = false
    this.emittedToolCall = false
    this.nextToolCallIndex = 0
  }

  push(content, baseChunk, includeRole = false) {
    if (!content || !this.plan.shouldParseResponse) return []

    this.buffer += content
    const chunks = []

    if (!this.isBufferingToolCall) {
      const markerStart = findMarkerStart(this.buffer, this.plan)
      if (markerStart.matched) {
        if (markerStart.index > 0) {
          chunks.push(createContentChunk(baseChunk, this.buffer.slice(0, markerStart.index), includeRole))
        }
        this.buffer = this.buffer.slice(markerStart.index)
        this.isBufferingToolCall = true
      } else if (markerStart.partial) {
        if (markerStart.index > 0) {
          chunks.push(createContentChunk(baseChunk, this.buffer.slice(0, markerStart.index), includeRole))
          this.buffer = this.buffer.slice(markerStart.index)
        }
        this.isBufferingToolCall = true
        return chunks
      } else {
        chunks.push(createContentChunk(baseChunk, this.buffer, includeRole))
        this.buffer = ''
        return chunks
      }
    }

    const parsed = parseBufferedToolCall(this.buffer, this.plan)
    if (parsed.toolCalls.length > 0) {
      for (const toolCall of parsed.toolCalls) {
        const indexedToolCall = {
          ...toolCall,
          index: this.nextToolCallIndex,
          id: toolCall.id || `call_${this.nextToolCallIndex}`,
        }
        this.nextToolCallIndex += 1
        chunks.push(createToolCallChunk(baseChunk, indexedToolCall, includeRole && !this.emittedToolCall))
      }
      this.emittedToolCall = true
      this.isBufferingToolCall = false
      this.buffer = ''
      return chunks
    }

    if (parsed.invalidToolNames.length > 0 || parsed.rawMatches.length > 0) {
      this.isBufferingToolCall = false
      this.buffer = ''
    }

    return chunks
  }

  flush(baseChunk) {
    if (!this.buffer) return []

    const parsed = parseBufferedToolCall(this.buffer, this.plan)
    if (parsed.toolCalls.length > 0) {
      const chunks = parsed.toolCalls.map((toolCall) => {
        const indexedToolCall = {
          ...toolCall,
          index: this.nextToolCallIndex,
          id: toolCall.id || `call_${this.nextToolCallIndex}`,
        }
        this.nextToolCallIndex += 1
        this.emittedToolCall = true
        return createToolCallChunk(baseChunk, indexedToolCall, false)
      })
      this.buffer = ''
      this.isBufferingToolCall = false
      return chunks
    }

    const shouldReleaseText = !this.emittedToolCall
    const text = this.buffer
    this.buffer = ''
    this.isBufferingToolCall = false
    return shouldReleaseText ? [createContentChunk(baseChunk, text, false)] : []
  }

  hasEmittedToolCall() {
    return this.emittedToolCall
  }

  isBuffering() {
    return this.isBufferingToolCall
  }
}

function parseBufferedToolCall(buffer, plan) {
  const selected = getToolProtocol(plan.protocol)
  return selected.parse(buffer, { tools: plan.tools, protocol: plan.protocol })
}

function findMarkerStart(buffer, plan) {
  const protocol = getToolProtocol(plan.protocol)
  const ranges = fencedRanges(buffer)
  let partialIndex = -1

  for (let index = 0; index < buffer.length; index += 1) {
    if (isInsideRange(index, ranges)) continue

    const suffix = buffer.slice(index)
    const detection = protocol.detectStart(suffix)
    if (detection.matched && detection.markerStart === 0) {
      return { matched: true, partial: false, index }
    }
    if (detection.partial && detection.markerStart === 0 && partialIndex === -1) {
      partialIndex = index
    }
  }

  return partialIndex === -1
    ? { matched: false, partial: false, index: -1 }
    : { matched: false, partial: true, index: partialIndex }
}

function fencedRanges(content) {
  const ranges = []
  const pattern = /```[\s\S]*?```/g
  let match

  while ((match = pattern.exec(content)) !== null) {
    ranges.push({ start: match.index, end: match.index + match[0].length })
  }

  return ranges
}

function isInsideRange(index, ranges) {
  return ranges.some((range) => index >= range.start && index < range.end)
}

function createContentChunk(baseChunk, content, includeRole) {
  return {
    ...baseChunk,
    choices: [{
      index: 0,
      delta: {
        ...(includeRole ? { role: 'assistant' } : {}),
        content,
      },
      finish_reason: null,
    }],
  }
}

function createToolCallChunk(baseChunk, toolCall, includeRole) {
  const { rawText, ...openAiToolCall } = toolCall
  void rawText

  return {
    ...baseChunk,
    choices: [{
      index: 0,
      delta: {
        ...(includeRole ? { role: 'assistant' } : {}),
        tool_calls: [openAiToolCall],
      },
      finish_reason: null,
    }],
  }
}

export { ToolStreamParser }
