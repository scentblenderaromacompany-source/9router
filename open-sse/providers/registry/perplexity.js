export default {
  "id": "perplexity",
  "priority": 180,
  "alias": "perplexity",
  "aliases": [
    "pplx"
  ],
  "uiAlias": "pplx",
  "display": {
    "name": "Perplexity",
    "icon": "search",
    "color": "#20808D",
    "textIcon": "PP",
    "website": "https://www.perplexity.ai",
    "notice": {
      "apiKeyUrl": "https://www.perplexity.ai/settings/api"
    }
  },
  "category": "apikey",
  "authType": "apikey",
  "transport": {
    "baseUrl": "https://api.perplexity.ai/chat/completions",
    "validateUrl": "https://api.perplexity.ai/models"
  },
  "models": [
    {
      "id": "sonar-pro",
      "name": "Sonar Pro",
      "capabilities": [
        "text",
        "tools"
      ],
      "params": [
        "temperature",
        "max_tokens",
        "top_p"
      ]
    },
    {
      "id": "sonar",
      "name": "Sonar",
      "capabilities": [
        "text",
        "tools"
      ],
      "params": [
        "temperature",
        "max_tokens",
        "top_p"
      ]
    }
  ],
  "serviceKinds": [
    "llm",
    "webSearch"
  ],
  "searchViaChat": {
    "defaultModel": "sonar",
    "endpoint": "https://api.perplexity.ai/chat/completions",
    "pricingUrl": "https://docs.perplexity.ai/guides/pricing"
  }
};
