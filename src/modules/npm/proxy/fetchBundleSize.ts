import type { BundleSize } from '@/modules/npm/domain'
import { ProxyError } from './ProxyError'
import { fetchWithTimeout } from './fetchWithTimeout'

const SERVICE = 'bundlephobia'

interface BundlephobiaResponse {
  name: string
  version: string
  size: number
  gzip: number
  hasSideEffects: boolean
}

/**
 * Fetches bundle size metrics for a package from Bundlephobia.
 * @throws {ProxyError} on non-200 responses, timeout, or network errors.
 */
export async function fetchBundleSize(name: string): Promise<BundleSize> {
  const encoded = encodeURIComponent(name)
  const url = `https://bundlephobia.com/api/size?package=${encoded}`

  const res = await fetchWithTimeout(url, SERVICE)

  if (res.status === 404) {
    throw new ProxyError(SERVICE, 404, `Package "${name}" not found on Bundlephobia`)
  }
  if (!res.ok) {
    throw new ProxyError(SERVICE, res.status, `Bundlephobia responded with ${res.status}`)
  }

  const data: BundlephobiaResponse = await res.json()

  return {
    packageName: data.name,
    version: data.version,
    size: data.size,
    gzip: data.gzip,
    hasSideEffects: data.hasSideEffects ?? true,
  }
}
