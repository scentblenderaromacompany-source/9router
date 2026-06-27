/**
 * Tool Calling type definitions (JSDoc for JS)
 *
 * @typedef {'managed' | 'disabled'} ToolCallingMode
 * @typedef {'openai_chat' | 'managed_bracket' | 'managed_xml' | 'anthropic_tool_use' | 'codex_responses'} ToolProtocolId
 * @typedef {'openai' | 'mcp'} ToolSource
 *
 * @typedef {Object} NormalizedToolDefinition
 * @property {string} name
 * @property {string} [description]
 * @property {Record<string, unknown>} parameters
 * @property {ToolSource} source
 *
 * @typedef {Object} NormalizedToolCall
 * @property {string} id
 * @property {number} index
 * @property {string} name
 * @property {string} arguments
 * @property {ToolProtocolId} protocol
 * @property {string} [rawText]
 *
 * @typedef {Object} NormalizedToolResult
 * @property {string} toolCallId
 * @property {string} [name]
 * @property {string} content
 *
 * @typedef {Object} ToolCallDiagnostics
 * @property {string} [requestId]
 * @property {string} clientAdapterId
 * @property {string} [detectedClientType]
 * @property {string} providerId
 * @property {string} [model]
 * @property {string} [actualModel]
 * @property {'openai' | 'mcp' | 'none'} toolSource
 * @property {ToolCallingMode} mode
 * @property {ToolProtocolId} protocol
 * @property {number} toolCount
 * @property {boolean} injected
 * @property {string} reason
 * @property {ToolProtocolId | 'unknown'} [parserFormat]
 * @property {number} [parsedToolCallCount]
 * @property {string} [malformedReason]
 * @property {string[]} [invalidToolNames]
 * @property {boolean} [wrapperLeakDetected]
 * @property {'auto' | 'none' | 'required' | 'forced'} [toolChoiceMode]
 * @property {string} [forcedToolName]
 * @property {string[]} [allowedToolNames]
 *
 * @typedef {Object} ToolCallingPlan
 * @property {ToolCallingMode} mode
 * @property {ToolProtocolId} protocol
 * @property {string} clientAdapterId
 * @property {string} providerId
 * @property {NormalizedToolDefinition[]} tools
 * @property {boolean} shouldInjectPrompt
 * @property {boolean} shouldParseResponse
 * @property {'auto' | 'none' | 'required' | 'forced'} toolChoiceMode
 * @property {Set<string>} allowedToolNames
 * @property {string} [forcedToolName]
 * @property {ToolCallDiagnostics} diagnostics
 *
 * @typedef {Object} ToolCallingTransformResult
 * @property {Array} messages
 * @property {Array} [tools]
 * @property {ToolCallingPlan} plan
 *
 * @typedef {Object} ToolParseContext
 * @property {NormalizedToolDefinition[]} tools
 * @property {ToolProtocolId} protocol
 *
 * @typedef {Object} ToolParseResult
 * @property {string} content
 * @property {Array} toolCalls
 * @property {ToolProtocolId | 'unknown'} protocol
 * @property {string[]} rawMatches
 * @property {string} [malformedReason]
 * @property {string[]} invalidToolNames
 */
