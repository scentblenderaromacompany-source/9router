function normalizeBaseUrl(value) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\/$/, '');
}

function getEnv(name) {
  if (typeof process !== 'undefined' && process?.env?.[name]) {
    return process.env[name];
  }
  return '';
}

function inferProviderNameFromModel(model) {
  if (typeof model !== 'string') return '';
  const trimmed = model.trim();
  if (!trimmed) return '';
  const parts = trimmed.split('/').filter(Boolean);
  return parts[0] || '';
}

function extractProviderFromHeaders(headers) {
  if (!headers) return '';
  const candidateHeaderNames = ['x-9router-provider', 'x-provider', 'x-chat2api-provider', 'x-openai-provider'];
  for (const headerName of candidateHeaderNames) {
    const value = headers.get?.(headerName);
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

async function readModelFromRequest(request) {
  if (!request) return '';
  try {
    const clonedRequest = request.clone ? request.clone() : request;
    const contentType = clonedRequest.headers?.get?.('content-type') || '';
    if (contentType.includes('application/json')) {
      const bodyText = await clonedRequest.text();
      if (!bodyText) return '';
      const body = JSON.parse(bodyText);
      return inferProviderNameFromModel(body?.model) || body?.provider || '';
    }
  } catch {
    return '';
  }
  return '';
}

function normalizeProviderName(value) {
  return String(value || '').trim().toLowerCase();
}

function buildKimiContent(messages = []) {
  if (!Array.isArray(messages)) return '';
  return messages
    .map((message) => {
      if (!message || typeof message !== 'object') return '';
      const role = String(message.role || 'user').toLowerCase();
      const content = typeof message.content === 'string'
        ? message.content
        : Array.isArray(message.content)
          ? message.content
              .map((part) => typeof part === 'string' ? part : part?.text || '')
              .filter(Boolean)
              .join('\n')
          : '';
      if (!content) return '';
      return `${role}:${content}`;
    })
    .filter(Boolean)
    .join('\n');
}

function buildKimiPayload(payload) {
  const model = payload?.model || '';
  const messages = Array.isArray(payload?.messages) ? payload.messages : [];
  const modelLower = String(model).toLowerCase();
  const enableThinking = payload?.enableThinking === true || payload?.thinking === true || modelLower.includes('think') || modelLower.includes('r1');
  const enableWebSearch = payload?.enableWebSearch === true || payload?.webSearch === true || modelLower.includes('search');
  const scenario = modelLower.includes('k2.6') ? 'SCENARIO_K2D6' : 'SCENARIO_K2D5';

  return {
    scenario,
    chat_id: '',
    tools: enableWebSearch ? [{ type: 'TOOL_TYPE_SEARCH', search: {} }] : [],
    message: {
      parent_id: '',
      role: 'user',
      blocks: [{
        message_id: '',
        text: { content: buildKimiContent(messages) },
      }],
      scenario,
    },
    options: {
      thinking: enableThinking,
    },
  };
}

function transformRequestForProvider(request, providerName, bodyText) {
  const normalizedProviderName = normalizeProviderName(providerName);
  if (normalizedProviderName !== 'kimi') {
    return { bodyText, headers: null, pathSuffix: null, contentType: null };
  }

  let parsedBody = null;
  try {
    parsedBody = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    parsedBody = null;
  }

  const transformedBody = parsedBody ? buildKimiPayload(parsedBody) : { message: { text: bodyText || '' } };
  return {
    bodyText: JSON.stringify(transformedBody),
    headers: { 'content-type': 'application/connect+json' },
    pathSuffix: 'apiv2/kimi.gateway.chat.v1.ChatService/Chat',
    contentType: 'application/connect+json',
  };
}

async function resolveProviderConnectionConfig(request, providerConnections = null) {
  let connections = providerConnections;
  if (!Array.isArray(connections)) {
    try {
      connections = await getProviderConnections();
    } catch {
      connections = [];
    }
  }

  const providerName = extractProviderFromHeaders(request?.headers) || (await readModelFromRequest(request));
  if (!providerName) {
    const activeConnections = Array.isArray(connections)
      ? connections.filter((conn) => conn?.isActive !== false)
      : [];
    if (activeConnections.length !== 1) return null;
    return buildProviderConnectionConfig(activeConnections[0]);
  }

  const normalizedProviderName = String(providerName).trim().toLowerCase();
  const activeConnection = Array.isArray(connections)
    ? connections.find((conn) => conn?.isActive !== false && (
        String(conn?.provider || '').trim().toLowerCase() === normalizedProviderName ||
        String(conn?.providerAlias || '').trim().toLowerCase() === normalizedProviderName ||
        String(conn?.providerSpecificData?.provider || '').trim().toLowerCase() === normalizedProviderName ||
        String(conn?.providerSpecificData?.providerId || '').trim().toLowerCase() === normalizedProviderName ||
        String(conn?.providerSpecificData?.providerName || '').trim().toLowerCase() === normalizedProviderName
      ))
    : null;

  if (!activeConnection) return null;

  return buildProviderConnectionConfig(activeConnection);
}

function buildProviderConnectionConfig(connection) {
  if (!connection) return null;

  const baseUrl = normalizeBaseUrl(
    connection?.providerSpecificData?.baseUrl
    || connection?.baseUrl
    || ''
  );
  if (!baseUrl) return null;

  const apiKey = connection?.apiKey
    || connection?.accessToken
    || connection?.providerSpecificData?.apiKey
    || connection?.providerSpecificData?.accessToken
    || '';

  return {
    enabled: true,
    baseUrl,
    apiKey,
    source: 'provider-connection',
  };
}

async function resolveChat2ApiProxyConfig(headers = new Headers(), settingsOverride = null, request = null, providerConnections = null) {
  const enabled = getEnv('CHAT2API_PROXY_ENABLED') || (settingsOverride?.chat2ApiProxyEnabled === true ? 'true' : '');
  if (!enabled || !/^(1|true|yes|on)$/i.test(enabled)) {
    return null;
  }

  const explicitBaseUrl = normalizeBaseUrl(
    getEnv('CHAT2API_PROXY_BASE_URL')
    || headers.get('x-chat2api-proxy-base-url')
    || settingsOverride?.chat2ApiProxyBaseUrl
    || ''
  );

  if (explicitBaseUrl) {
    const apiKey = getEnv('CHAT2API_PROXY_API_KEY')
      || headers.get('x-chat2api-proxy-api-key')
      || settingsOverride?.chat2ApiProxyApiKey
      || '';

    return {
      enabled: true,
      baseUrl: explicitBaseUrl,
      apiKey,
      source: 'explicit',
    };
  }

  return resolveProviderConnectionConfig(request, providerConnections);
}

function buildUpstreamUrl(requestUrl, config) {
  const normalizedBaseUrl = normalizeBaseUrl(config.baseUrl);
  if (!normalizedBaseUrl) {
    throw new Error('Chat2API proxy base URL is required');
  }

  const url = new URL(requestUrl);
  const baseWithVersion = normalizedBaseUrl.endsWith('/v1') ? normalizedBaseUrl : `${normalizedBaseUrl}/v1`;
  const pathname = url.pathname.replace(/^\/api/, '');
  const normalizedPathname = pathname.startsWith('/v1') && baseWithVersion.endsWith('/v1')
    ? pathname.slice(3) || '/'
    : pathname;
  const pathSuffix = normalizedPathname === '/' ? '' : normalizedPathname.replace(/^\/+/, '');
  const upstreamUrl = new URL(`${pathSuffix}${url.search}`, `${baseWithVersion}/`);
  return upstreamUrl;
}

function buildHeaders(request, config) {
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('content-length');
  headers.delete('connection');
  headers.set('accept', headers.get('accept') || 'application/json');

  if (config.apiKey) {
    headers.set('authorization', `Bearer ${config.apiKey}`);
    headers.set('x-api-key', config.apiKey);
  }

  return headers;
}

async function readBodyText(request) {
  if (!request || request.method === 'GET' || request.method === 'HEAD') return '';
  if (typeof request.clone === 'function') {
    const clonedRequest = request.clone();
    try {
      return await clonedRequest.text();
    } catch {
      return '';
    }
  }
  return '';
}

async function proxyToChat2Api(request, options = {}) {
  const config = options.config || await resolveChat2ApiProxyConfig(request.headers);
  if (!config) {
    return new Response(JSON.stringify({ error: { message: 'Chat2API proxy is not configured', type: 'configuration_error' } }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }

  const providerName = extractProviderFromHeaders(request.headers) || await readModelFromRequest(request);
  const bodyText = await readBodyText(request);
  const transformedRequest = transformRequestForProvider(request, providerName, bodyText);
  const upstreamUrl = buildUpstreamUrl(request.url, config);
  const normalizedBaseUrl = normalizeBaseUrl(config.baseUrl);
  const baseForProviderPath = normalizedBaseUrl.endsWith('/v1') ? normalizedBaseUrl.slice(0, -3) : normalizedBaseUrl;
  const basePath = transformedRequest.pathSuffix ? `/${transformedRequest.pathSuffix.replace(/^\/+/, '')}` : null;
  const targetUrl = basePath ? new URL(basePath, `${baseForProviderPath}/`) : upstreamUrl;
  const headers = buildHeaders(request, config);
  if (transformedRequest.headers) {
    Object.entries(transformedRequest.headers).forEach(([key, value]) => headers.set(key, value));
  }
  if (transformedRequest.contentType) {
    headers.set('content-type', transformedRequest.contentType);
  }

  const isGetOrHead = request.method === 'GET' || request.method === 'HEAD';
  const forwardedRequest = new Request(targetUrl, {
    method: request.method,
    headers,
    body: isGetOrHead ? undefined : (transformedRequest.bodyText !== undefined ? transformedRequest.bodyText : request.body),
    duplex: 'half',
    redirect: 'manual',
  });

  const response = await fetch(forwardedRequest);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

module.exports = {
  normalizeBaseUrl,
  resolveChat2ApiProxyConfig,
  buildUpstreamUrl,
  buildHeaders,
  transformRequestForProvider,
  resolveProviderConnectionConfig,
  proxyToChat2Api,
};
