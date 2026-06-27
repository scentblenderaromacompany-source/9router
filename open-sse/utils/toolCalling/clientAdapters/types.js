/**
 * Client adapter type definitions (JSDoc for JS)
 *
 * @typedef {Object} NormalizedToolChoice
 * @property {'auto' | 'none' | 'required' | 'forced'} mode
 * @property {string} [forcedName]
 *
 * @typedef {Object} NormalizedClientToolRequest
 * @property {string} clientAdapterId
 * @property {'openai' | 'mcp' | 'none'} toolSource
 * @property {Array} tools
 * @property {NormalizedToolChoice} toolChoice
 * @property {Object} diagnostics
 * @property {string} [diagnostics.requestedClientAdapterId]
 * @property {string} [diagnostics.fallbackClientAdapterId]
 * @property {string} [diagnostics.detectedClientType]
 * @property {number} diagnostics.rawToolCount
 * @property {string[]} diagnostics.normalizedToolNames
 *
 * @typedef {Object} ToolClientAdapter
 * @property {string} id
 * @property {string} displayName
 * @property {function} normalizeRequest
 */
