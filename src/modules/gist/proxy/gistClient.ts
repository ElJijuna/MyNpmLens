import { ProxyError } from '@/modules/npm/proxy/ProxyError'

const SERVICE = 'github-gist'
const TIMEOUT_MS = 8_000
const GIST_FILENAME = 'mynpmlens.json'

export { SERVICE, GIST_FILENAME }

export async function gistFetch(
  url: string,
  token: string,
  options: RequestInit = {},
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    return res
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ProxyError(SERVICE, 'timeout', `${SERVICE} request timed out after ${TIMEOUT_MS}ms`)
    }
    throw new ProxyError(SERVICE, 'network', `${SERVICE} network error: ${String(err)}`)
  } finally {
    clearTimeout(timer)
  }
}
