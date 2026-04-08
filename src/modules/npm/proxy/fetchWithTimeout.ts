import { ProxyError } from './ProxyError'

const DEFAULT_TIMEOUT_MS = 8_000

/**
 * Thin wrapper around fetch that aborts after `timeoutMs` and throws a ProxyError.
 */
export async function fetchWithTimeout(
  url: string,
  service: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, { signal: controller.signal })
    return res
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ProxyError(service, 'timeout', `${service} request timed out after ${timeoutMs}ms`)
    }
    throw new ProxyError(service, 'network', `${service} network error: ${String(err)}`)
  } finally {
    clearTimeout(timer)
  }
}
