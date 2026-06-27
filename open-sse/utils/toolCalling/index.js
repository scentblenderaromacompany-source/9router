/**
 * Tool Calling Module
 * Shared module ported from Chat2API
 *
 * Re-exports all tool calling functionality:
 * - Engine: ToolCallingEngine
 * - Stream Parser: ToolStreamParser
 * - Protocols: managedBracket, managedXml, anthropicToolUse, codexResponses
 * - Client Adapters: standardOpenAiTools, cherryStudioMcp
 * - Tool Choice Policy
 * - Provider Profiles
 * - Model Profiles
 * - Runtime Plan
 * - Prompt Generation
 * - Prompt Injection
 * - Tool Parsing
 * - Stream Tool Handling
 * - Configuration
 */

// Engine
export { ToolCallingEngine } from './ToolCallingEngine.js'

// Stream Parser
export { ToolStreamParser } from './ToolStreamParser.js'

// Protocols
export { getToolProtocol, getManagedProtocols } from './protocols/index.js'
export { managedBracketProtocol } from './protocols/managedBracket.js'
export { managedXmlProtocol } from './protocols/managedXml.js'
export { anthropicToolUseProtocol } from './protocols/anthropicToolUse.js'
export { codexResponsesProtocol } from './protocols/codexResponses.js'
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
} from './protocols/shared.js'

// Client Adapters
export { getToolClientAdapter, listToolClientAdapters } from './clientAdapters/index.js'
export { standardOpenAiToolsAdapter, normalizeOpenAiTools, normalizeToolChoice } from './clientAdapters/standardOpenAiTools.js'
export { cherryStudioMcpAdapter } from './clientAdapters/cherryStudioMcp.js'

// Tool Choice Policy
export { ToolChoicePolicyError, normalizeToolChoicePolicy } from './toolChoicePolicy.js'

// Provider Profiles
export { getProviderToolProfile } from './providerProfiles.js'

// Model Profiles
export {
  MODEL_PROFILES,
  getModelProfile,
  isNativeFunctionCallingModel,
  getPreferredFormat,
  getStreamHandlerType,
  getParsingStrategy,
  getAvailableModelIds,
} from './modelProfiles.js'

// Runtime Plan
export { buildToolCallingRuntimePlan } from './runtimePlan.js'

// Prompt Generation
export {
  PromptGenerator,
  generateToolPrompt,
  generateToolDefinitions,
  generateToolNames,
  generateToolWrapHint,
  getFormatExample,
} from './promptGenerator.js'

// Prompt Injection
export { PromptInjectionService, generateGenericToolCallPrompt } from './promptInjectionService.js'

// Tool Parsing
export { parseToolCallsFromText, extractBalancedJson, tryParseJSON, tryRegexFallback } from './toolParser.js'

// Stream Tool Handling
export {
  createToolCallState,
  processStreamContent,
  flushToolCallBuffer,
  shouldBlockOutput,
  createBaseChunk,
} from './streamToolHandler.js'

// Configuration
export {
  DEFAULT_TOOL_CALLING_CONFIG,
  P0_TOOL_CLIENT_ADAPTERS,
  P0_TOOL_PROVIDER_SUPPORT,
  normalizeToolCallingConfig,
} from './shared.js'
