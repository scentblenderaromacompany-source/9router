/**
 * Model profiles configuration
 * Ported from Chat2API config/modelProfiles.ts
 *
 * @typedef {'bracket' | 'xml' | 'anthropic' | 'json' | 'native'} ToolCallFormat
 *
 * @typedef {Object} ModelProfile
 * @property {string} id
 * @property {boolean} nativeFunctionCalling
 * @property {ToolCallFormat} preferredFormat
 * @property {'legacy' | 'balanced'} parsingStrategy
 * @property {'bracket' | 'xml' | 'anthropic' | 'json'} streamHandlerType
 */

const MODEL_PROFILES = {
  // OpenAI models
  'gpt-4': {
    id: 'gpt-4',
    nativeFunctionCalling: true,
    preferredFormat: 'json',
    parsingStrategy: 'balanced',
    streamHandlerType: 'json',
  },
  'gpt-4-turbo': {
    id: 'gpt-4-turbo',
    nativeFunctionCalling: true,
    preferredFormat: 'json',
    parsingStrategy: 'balanced',
    streamHandlerType: 'json',
  },
  'gpt-4o': {
    id: 'gpt-4o',
    nativeFunctionCalling: true,
    preferredFormat: 'json',
    parsingStrategy: 'balanced',
    streamHandlerType: 'json',
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    nativeFunctionCalling: true,
    preferredFormat: 'json',
    parsingStrategy: 'balanced',
    streamHandlerType: 'json',
  },
  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    nativeFunctionCalling: true,
    preferredFormat: 'json',
    parsingStrategy: 'balanced',
    streamHandlerType: 'json',
  },

  // Anthropic models
  'claude-3': {
    id: 'claude-3',
    nativeFunctionCalling: true,
    preferredFormat: 'anthropic',
    parsingStrategy: 'balanced',
    streamHandlerType: 'anthropic',
  },
  'claude-3.5': {
    id: 'claude-3.5',
    nativeFunctionCalling: true,
    preferredFormat: 'anthropic',
    parsingStrategy: 'balanced',
    streamHandlerType: 'anthropic',
  },
  'claude-sonnet': {
    id: 'claude-sonnet',
    nativeFunctionCalling: true,
    preferredFormat: 'anthropic',
    parsingStrategy: 'balanced',
    streamHandlerType: 'anthropic',
  },
  'claude-opus': {
    id: 'claude-opus',
    nativeFunctionCalling: true,
    preferredFormat: 'anthropic',
    parsingStrategy: 'balanced',
    streamHandlerType: 'anthropic',
  },
  'claude-haiku': {
    id: 'claude-haiku',
    nativeFunctionCalling: true,
    preferredFormat: 'anthropic',
    parsingStrategy: 'balanced',
    streamHandlerType: 'anthropic',
  },

  // Google Gemini models
  'gemini-1.5': {
    id: 'gemini-1.5',
    nativeFunctionCalling: true,
    preferredFormat: 'json',
    parsingStrategy: 'balanced',
    streamHandlerType: 'json',
  },
  'gemini-2.0': {
    id: 'gemini-2.0',
    nativeFunctionCalling: true,
    preferredFormat: 'json',
    parsingStrategy: 'balanced',
    streamHandlerType: 'json',
  },

  // DeepSeek models
  'deepseek': {
    id: 'deepseek',
    nativeFunctionCalling: false,
    preferredFormat: 'bracket',
    parsingStrategy: 'balanced',
    streamHandlerType: 'bracket',
  },
  'deepseek-v3.2': {
    id: 'deepseek-v3.2',
    nativeFunctionCalling: false,
    preferredFormat: 'bracket',
    parsingStrategy: 'balanced',
    streamHandlerType: 'bracket',
  },

  // GLM models
  'glm': {
    id: 'glm',
    nativeFunctionCalling: false,
    preferredFormat: 'bracket',
    parsingStrategy: 'legacy',
    streamHandlerType: 'bracket',
  },
  'glm-4': {
    id: 'glm-4',
    nativeFunctionCalling: false,
    preferredFormat: 'bracket',
    parsingStrategy: 'legacy',
    streamHandlerType: 'bracket',
  },
  'glm-4v': {
    id: 'glm-4v',
    nativeFunctionCalling: false,
    preferredFormat: 'bracket',
    parsingStrategy: 'legacy',
    streamHandlerType: 'bracket',
  },

  // Kimi models
  'kimi': {
    id: 'kimi',
    nativeFunctionCalling: false,
    preferredFormat: 'bracket',
    parsingStrategy: 'legacy',
    streamHandlerType: 'bracket',
  },

  // Qwen models
  'qwen': {
    id: 'qwen',
    nativeFunctionCalling: false,
    preferredFormat: 'bracket',
    parsingStrategy: 'balanced',
    streamHandlerType: 'bracket',
  },
  'qwen-turbo': {
    id: 'qwen-turbo',
    nativeFunctionCalling: false,
    preferredFormat: 'bracket',
    parsingStrategy: 'balanced',
    streamHandlerType: 'bracket',
  },
  'qwen-plus': {
    id: 'qwen-plus',
    nativeFunctionCalling: false,
    preferredFormat: 'bracket',
    parsingStrategy: 'balanced',
    streamHandlerType: 'bracket',
  },
  'qwen-max': {
    id: 'qwen-max',
    nativeFunctionCalling: false,
    preferredFormat: 'bracket',
    parsingStrategy: 'balanced',
    streamHandlerType: 'bracket',
  },

  // MiniMax models
  'minimax': {
    id: 'minimax',
    nativeFunctionCalling: false,
    preferredFormat: 'bracket',
    parsingStrategy: 'legacy',
    streamHandlerType: 'bracket',
  },

  // Z.ai models
  'zai': {
    id: 'zai',
    nativeFunctionCalling: false,
    preferredFormat: 'bracket',
    parsingStrategy: 'legacy',
    streamHandlerType: 'bracket',
  },

  // Perplexity models
  'perplexity': {
    id: 'perplexity',
    nativeFunctionCalling: false,
    preferredFormat: 'bracket',
    parsingStrategy: 'balanced',
    streamHandlerType: 'bracket',
  },

  // Default configuration
  'default': {
    id: 'default',
    nativeFunctionCalling: false,
    preferredFormat: 'bracket',
    parsingStrategy: 'balanced',
    streamHandlerType: 'bracket',
  },
}

function getModelProfile(model, provider) {
  // Prioritize exact model ID match
  if (model && MODEL_PROFILES[model.toLowerCase()]) {
    return MODEL_PROFILES[model.toLowerCase()]
  }

  // Match model prefix
  const lowerModel = model?.toLowerCase() || ''
  for (const key of Object.keys(MODEL_PROFILES)) {
    if (key === 'default') continue
    if (lowerModel.includes(key)) {
      return MODEL_PROFILES[key]
    }
  }

  // If provider info is available, try provider-specific matching
  if (provider) {
    const lowerProvider = provider.toLowerCase()

    if (lowerProvider.includes('deepseek')) {
      return MODEL_PROFILES['deepseek']
    } else if (lowerProvider.includes('glm')) {
      return MODEL_PROFILES['glm']
    } else if (lowerProvider.includes('kimi')) {
      return MODEL_PROFILES['kimi']
    } else if (lowerProvider.includes('qwen')) {
      return MODEL_PROFILES['qwen']
    } else if (lowerProvider.includes('minimax')) {
      return MODEL_PROFILES['minimax']
    } else if (lowerProvider.includes('zai')) {
      return MODEL_PROFILES['zai']
    } else if (lowerProvider.includes('perplexity')) {
      return MODEL_PROFILES['perplexity']
    }
  }

  // Default configuration
  return MODEL_PROFILES['default']
}

function isNativeFunctionCallingModel(model, provider) {
  const profile = getModelProfile(model, provider)
  return profile.nativeFunctionCalling
}

function getPreferredFormat(model, provider) {
  const profile = getModelProfile(model, provider)
  return profile.preferredFormat
}

function getStreamHandlerType(model, provider) {
  const profile = getModelProfile(model, provider)
  return profile.streamHandlerType
}

function getParsingStrategy(model, provider) {
  const profile = getModelProfile(model, provider)
  return profile.parsingStrategy
}

function getAvailableModelIds() {
  return Object.keys(MODEL_PROFILES).filter(key => key !== 'default')
}

export {
  MODEL_PROFILES,
  getModelProfile,
  isNativeFunctionCallingModel,
  getPreferredFormat,
  getStreamHandlerType,
  getParsingStrategy,
  getAvailableModelIds,
}
