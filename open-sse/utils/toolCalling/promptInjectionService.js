/**
 * Prompt Injection Service
 * Ported from Chat2API services/promptInjectionService.ts
 *
 * NOTE: This module is adapted to be self-contained. It does not import
 * external dependencies (storeManager, clientDetector) that exist elsewhere
 * in the Chat2API codebase. Instead, it accepts them as parameters or
 * uses internal defaults.
 */

import { PromptGenerator } from './promptGenerator.js'

/**
 * @typedef {'auto' | 'always' | 'never'} InjectionMode
 */

const DEFAULT_CONFIG = {
  mode: 'auto',
  defaultFormat: 'xml',
  customPromptTemplate: undefined,
  enableToolCallParsing: true,
}

/**
 * Generate generic tool call protocol prompt
 */
function generateGenericToolCallPrompt(format) {
  if (format === 'xml') {
    return `## Tool Call Protocol
When you decide to call a tool, you MUST respond with NOTHING except a single <tool_use> block exactly like the template below:

<tool_use>
  <name>exact_tool_name_from_list</name>
  <arguments>{"argument": "value"}</arguments>
</tool_use>

CRITICAL RULES:
1. You MUST use the EXACT tool name as defined in the Available Tools list
2. The content inside <arguments> MUST be a raw JSON object
3. Do NOT wrap JSON in \`\`\`json blocks
4. Do NOT output any other text, explanation, or reasoning before or after the <tool_use> block
5. If you need to call multiple tools, output multiple <tool_use> blocks sequentially
6. JSON arguments MUST be valid JSON format

When you receive a tool result, it will be in the format:
[TOOL_RESULT for call_id] result_content`
  }

  return `## Tool Call Protocol
When you decide to call a tool, you MUST respond with NOTHING except a single [function_calls] block exactly like the template below:

[function_calls]
[call:exact_tool_name_from_list]{"argument": "value"}[/call]
[/function_calls]

CRITICAL RULES:
1. EVERY tool call MUST start with [call:exact_tool_name] and end with [/call]
2. You MUST use the EXACT tool name as defined in the Available Tools list
3. The content between [call:...] and [/call] MUST be a raw JSON object on ONE LINE - NO LINE BREAKS inside the JSON
4. Do NOT wrap JSON in \`\`\`json blocks
5. Do NOT output any other text, explanation, or reasoning before or after the [function_calls] block
6. If you need to call multiple tools, put them all inside the same [function_calls] block, each with its own [call:...]...[/call] wrapper
7. JSON arguments MUST be compact, all on one line, NO pretty printing, NO newlines

When you receive a tool result, it will be in the format:
[TOOL_RESULT for call_id] result_content`
}

/**
 * Prompt Injection Service
 */
class PromptInjectionService {
  constructor(options = {}) {
    this.getConfig = options.getConfig || (() => DEFAULT_CONFIG)
    this.detectClient = options.detectClient || null
  }

  /**
   * Process messages and inject tool prompt if needed
   */
  process(messages, tools, model, provider) {
    const config = this.getConfig()

    // Detect client and tool source
    const detection = this.detectClient
      ? this.detectClient(messages, tools)
      : { toolSource: tools?.length > 0 ? 'openai' : 'none', tools, isKnownClient: false, clientType: 'unknown', injectsPrompt: false }

    // Decide whether to inject
    const decision = this.shouldInject(detection, config)

    if (!decision.shouldInject) {
      return {
        messages,
        injected: false,
        tools: detection.tools,
        shouldParseToolCalls: config.enableToolCallParsing && detection.toolSource !== 'none',
        reason: decision.reason,
      }
    }

    // Generate prompt
    const prompt = this.generatePrompt(messages, detection, config, provider)

    if (!prompt) {
      return {
        messages,
        injected: false,
        tools: detection.tools,
        shouldParseToolCalls: config.enableToolCallParsing && detection.toolSource !== 'none',
        reason: 'no_prompt',
      }
    }

    // Inject prompt to messages
    const injectedMessages = this.injectToMessages(messages, prompt)

    return {
      messages: injectedMessages,
      injected: true,
      tools: detection.tools,
      shouldParseToolCalls: true,
    }
  }

  /**
   * Decide whether to inject
   */
  shouldInject(detection, config) {
    if (config.mode === 'never') {
      return { shouldInject: false, reason: 'mode_never' }
    }

    if (detection.toolSource === 'none') {
      return { shouldInject: false, reason: 'no_tools' }
    }

    if (config.mode === 'always') {
      return { shouldInject: true, reason: 'mode_always' }
    }

    if (config.mode === 'auto') {
      if (detection.isKnownClient) {
        return { shouldInject: false, reason: `known_client_${detection.clientType}` }
      }

      if (detection.injectsPrompt) {
        return { shouldInject: false, reason: 'existing_injection' }
      }

      return { shouldInject: true, reason: 'auto_unknown_client' }
    }

    return { shouldInject: true, reason: 'default' }
  }

  /**
   * Generate prompt based on detection result
   */
  generatePrompt(messages, detection, config, provider) {
    if (detection.toolSource === 'openai' && detection.tools) {
      return PromptGenerator.generate(detection.tools, {
        format: config.defaultFormat,
        customTemplate: config.customPromptTemplate,
        provider,
      })
    }

    if (detection.toolSource === 'mcp') {
      if (provider === 'perplexity') {
        return this.generatePerplexityPromptFromMCP(messages, detection.tools || [], config)
      }

      return generateGenericToolCallPrompt(config.defaultFormat)
    }

    return ''
  }

  /**
   * Generate Perplexity-specific prompt from MCP tool definitions
   */
  generatePerplexityPromptFromMCP(messages, tools, config) {
    if (tools.length === 0) {
      return generateGenericToolCallPrompt(config.defaultFormat)
    }

    return PromptGenerator.generate(tools, {
      format: 'xml',
      customTemplate: config.customPromptTemplate,
      provider: 'perplexity',
    })
  }

  /**
   * Inject prompt to messages
   */
  injectToMessages(messages, prompt) {
    if (!prompt) {
      return messages
    }

    const result = []
    let systemInjected = false

    for (const msg of messages) {
      if (msg.role === 'system' && !systemInjected) {
        const enhancedContent =
          typeof msg.content === 'string' ? `${msg.content}\n\n${prompt}` : msg.content
        result.push({ ...msg, content: enhancedContent })
        systemInjected = true
      } else {
        result.push(msg)
      }
    }

    if (!systemInjected) {
      result.unshift({ role: 'system', content: prompt })
    }

    return result
  }
}

export { PromptInjectionService, generateGenericToolCallPrompt }
