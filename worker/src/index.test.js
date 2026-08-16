// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import worker, { isBlockedAddress, proxyRequest, RateLimiter, resolveAndValidate } from './index.js';

const publicDns = vi.fn(async () => new Response(JSON.stringify({
  Answer: [{ type: 1, data: '93.184.216.34' }]
}), { headers: { 'Content-Type': 'application/json' } }));

describe('CORS proxy security', () => {
  it.each([
    '127.0.0.1', '10.0.0.1', '172.16.5.4', '192.168.1.1',
    '169.254.169.254', '::1', 'fd00::1', 'fe80::1'
  ])('blocks private address %s', address => {
    expect(isBlockedAddress(address)).toBe(true);
  });

  it('blocks hostnames resolving to private IPs', async () => {
    const resolver = vi.fn(async () => new Response(JSON.stringify({
      Answer: [{ type: 1, data: '127.0.0.1' }]
    }), { headers: { 'Content-Type': 'application/json' } }));
    await expect(resolveAndValidate('rebinding.example', resolver))
      .rejects.toThrow('Private and internal');
  });

  it('rejects non-http schemes', async () => {
    const response = await proxyRequest({ url: 'file:///etc/passwd' }, {}, vi.fn(), publicDns);
    expect(response.status).toBe(400);
  });

  it('caps request and response sizes', async () => {
    const requestResponse = await proxyRequest({
      url: 'https://example.com',
      method: 'POST',
      body: 'x'.repeat(1024 * 1024 + 1)
    }, {}, vi.fn(), publicDns);
    expect(requestResponse.status).toBe(413);

    const fetcher = vi.fn(async () => new Response('x', {
      headers: { 'Content-Length': String(5 * 1024 * 1024 + 1) }
    }));
    const upstreamResponse = await proxyRequest(
      { url: 'https://example.com' }, {}, fetcher, publicDns
    );
    expect(upstreamResponse.status).toBe(413);
  });

  it('revalidates every redirect destination', async () => {
    const fetcher = vi.fn(async () => new Response(null, {
      status: 302,
      headers: { Location: 'http://127.0.0.1/admin' }
    }));
    const response = await proxyRequest(
      { url: 'https://example.com' }, {}, fetcher, publicDns
    );
    expect(response.status).toBe(403);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('preserves upstream status, headers, and body while stripping hop-by-hop headers', async () => {
    const fetcher = vi.fn(async () => new Response('missing', {
      status: 404,
      statusText: 'Not Found',
      headers: { 'X-Upstream': 'yes', Connection: 'close' }
    }));
    const response = await proxyRequest(
      { url: 'https://example.com' }, {}, fetcher, publicDns
    );
    expect(response.status).toBe(404);
    expect(response.headers.get('X-Upstream')).toBe('yes');
    expect(response.headers.get('Connection')).toBeNull();
    expect(await response.text()).toBe('missing');
  });
});

describe('rate limiting', () => {
  it('enforces the configured daily per-IP limit', async () => {
    const values = new Map();
    const state = {
      storage: {
        get: vi.fn(key => values.get(key)),
        put: vi.fn((key, value) => values.set(key, value))
      }
    };
    const limiter = new RateLimiter(state, { PER_IP_DAILY_LIMIT: '1' });
    expect((await limiter.fetch()).status).toBe(200);
    expect((await limiter.fetch()).status).toBe(429);
  });

  it('returns 429 from the worker when the IP object rejects a request', async () => {
    const env = {
      RATE_LIMITER: {
        idFromName: vi.fn(value => value),
        get: vi.fn(() => ({ fetch: vi.fn(async () => new Response('', { status: 429 })) }))
      }
    };
    const response = await worker.fetch(new Request('https://proxy.example', {
      method: 'POST',
      headers: { 'CF-Connecting-IP': '203.0.113.2' },
      body: JSON.stringify({ url: 'https://example.com' })
    }), env);
    expect(response.status).toBe(429);
  });
});
