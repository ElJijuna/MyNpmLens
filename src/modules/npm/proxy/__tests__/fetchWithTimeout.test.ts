/**
 * @jest-environment node
 */
import { fetchWithTimeout } from '../fetchWithTimeout';
import { ProxyError } from '../ProxyError';

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

describe('fetchWithTimeout', () => {
  it('returns response on success', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce(new Response('{}', { status: 200 }));
    const res = await fetchWithTimeout('https://example.com', 'test');
    expect(res.status).toBe(200);
  });

  it('throws ProxyError with status "network" on fetch rejection', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(fetchWithTimeout('https://example.com', 'test')).rejects.toMatchObject({
      status: 'network',
      service: 'test',
    });
  });

  it('throws ProxyError with status "timeout" on AbortError', async () => {
    const abortErr = new Error('Aborted');
    abortErr.name = 'AbortError';
    global.fetch = jest.fn().mockRejectedValueOnce(abortErr);
    await expect(fetchWithTimeout('https://example.com', 'test', 100)).rejects.toMatchObject({
      status: 'timeout',
      service: 'test',
    });
  });

  it('throws ProxyError instance', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new TypeError('net::ERR'));
    await expect(fetchWithTimeout('https://example.com', 'test')).rejects.toBeInstanceOf(
      ProxyError,
    );
  });
});
