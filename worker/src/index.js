const MAX_REQUEST_BYTES = 1024 * 1024;
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_REDIRECTS = 5;
const HOP_BY_HOP_HEADERS = new Set([
  'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
  'te', 'trailer', 'transfer-encoding', 'upgrade', 'host'
]);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Expose-Headers': '*',
  'Vary': 'Origin'
};

export class RateLimiter {
  constructor(state, env) {
    this.state = state;
    this.limit = Number(env.PER_IP_DAILY_LIMIT || 100);
  }

  async fetch() {
    const day = new Date().toISOString().slice(0, 10);
    const current = await this.state.storage.get('counter');
    const counter = current?.day === day ? current : { day, count: 0 };
    if (counter.count >= this.limit) {
      return new Response('Rate limit exceeded', { status: 429 });
    }
    counter.count += 1;
    await this.state.storage.put('counter', counter);
    return new Response('OK');
  }
}

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function parseIPv4(value) {
  const parts = value.split('.');
  if (parts.length !== 4 || parts.some(part => !/^\d{1,3}$/.test(part) || Number(part) > 255)) {
    return null;
  }
  return parts.map(Number);
}

export function isBlockedAddress(address) {
  const normalized = address.toLowerCase().replace(/^\[|\]$/g, '');
  const ipv4 = parseIPv4(normalized);
  if (ipv4) {
    const [a, b] = ipv4;
    return a === 0 || a === 10 || a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224;
  }
  if (normalized.includes(':')) {
    return normalized === '::' || normalized === '::1' ||
      normalized.startsWith('fc') || normalized.startsWith('fd') ||
      /^fe[89ab]/.test(normalized) ||
      normalized.startsWith('ff') ||
      normalized.startsWith('::ffff:') &&
        isBlockedAddress(normalized.slice('::ffff:'.length));
  }
  return false;
}

export async function resolveAndValidate(hostname, resolver = fetch) {
  if (isBlockedAddress(hostname) || hostname.toLowerCase() === 'localhost') {
    throw new Error('Private and internal destinations are blocked');
  }
  if (parseIPv4(hostname) || hostname.includes(':')) return;

  const addresses = [];
  for (const type of ['A', 'AAAA']) {
    const response = await resolver(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=${type}`,
      { headers: { Accept: 'application/dns-json' } }
    );
    if (!response.ok) throw new Error('Unable to validate target DNS');
    const result = await response.json();
    for (const answer of result.Answer || []) {
      if (answer.type === 1 || answer.type === 28) addresses.push(answer.data);
    }
  }
  if (addresses.length === 0) throw new Error('Target hostname did not resolve');
  if (addresses.some(isBlockedAddress)) {
    throw new Error('Private and internal destinations are blocked');
  }
}

function cleanHeaders(input) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(input || {})) {
    if (!HOP_BY_HOP_HEADERS.has(name.toLowerCase())) headers.set(name, String(value));
  }
  return headers;
}

async function readCappedBody(response) {
  const declaredLength = Number(response.headers.get('content-length') || 0);
  if (declaredLength > MAX_RESPONSE_BYTES) throw new Error('RESPONSE_TOO_LARGE');
  if (!response.body) return new Uint8Array();
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      throw new Error('RESPONSE_TOO_LARGE');
    }
    chunks.push(value);
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

export async function proxyRequest(payload, env, fetcher = fetch, resolver = fetch) {
  let target;
  try {
    target = new URL(payload.url);
  } catch {
    return jsonError('A valid target URL is required', 400);
  }
  if (!['http:', 'https:'].includes(target.protocol)) {
    return jsonError('Only http and https URLs are allowed', 400);
  }
  const body = payload.body == null ? undefined : String(payload.body);
  if (body && new TextEncoder().encode(body).byteLength > MAX_REQUEST_BYTES) {
    return jsonError('Request body is too large', 413);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
      await resolveAndValidate(target.hostname, resolver);
      const upstream = await fetcher(target.toString(), {
        method: String(payload.method || 'GET').toUpperCase(),
        headers: cleanHeaders(payload.headers),
        body: ['GET', 'HEAD'].includes(String(payload.method || 'GET').toUpperCase()) ? undefined : body,
        redirect: 'manual',
        signal: controller.signal
      });
      if ([301, 302, 303, 307, 308].includes(upstream.status)) {
        const location = upstream.headers.get('location');
        if (!location) return jsonError('Upstream redirect omitted Location', 502);
        target = new URL(location, target);
        if (!['http:', 'https:'].includes(target.protocol)) {
          return jsonError('Redirected to a disallowed URL scheme', 403);
        }
        continue;
      }
      const responseBody = await readCappedBody(upstream);
      const headers = cleanHeaders(Object.fromEntries(upstream.headers.entries()));
      for (const [name, value] of Object.entries(corsHeaders)) headers.set(name, value);
      return new Response(responseBody, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers
      });
    }
    return jsonError('Too many upstream redirects', 508);
  } catch (error) {
    if (error?.name === 'AbortError') return jsonError('Upstream request timed out', 504);
    if (error?.message === 'RESPONSE_TOO_LARGE') return jsonError('Upstream response is too large', 413);
    return jsonError(error instanceof Error ? error.message : 'Proxy request failed', 403);
  } finally {
    clearTimeout(timeout);
  }
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
    if (request.method !== 'POST') return jsonError('Use POST to submit a proxy request', 405);
    if (Number(request.headers.get('content-length') || 0) > MAX_REQUEST_BYTES * 2) {
      return jsonError('Proxy request is too large', 413);
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (env.RATE_LIMITER) {
      const id = env.RATE_LIMITER.idFromName(ip);
      const result = await env.RATE_LIMITER.get(id).fetch('https://rate-limit/check');
      if (result.status === 429) return jsonError('Daily per-IP rate limit exceeded', 429);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return jsonError('Request body must be valid JSON', 400);
    }
    return proxyRequest(payload, env);
  }
};
