import type { NpmDownloads } from '@/modules/npm/domain'
import { ProxyError } from './ProxyError'
import { fetchWithTimeout } from './fetchWithTimeout'

const SERVICE = 'npm-downloads'

interface DownloadsResponse {
  downloads: number
  package: string
}

async function fetchPeriod(name: string, period: 'last-week' | 'last-month'): Promise<number> {
  const encoded = encodeURIComponent(name)
  const url = `https://api.npmjs.org/downloads/point/${period}/${encoded}`
  const res = await fetchWithTimeout(url, SERVICE)

  if (!res.ok) {
    throw new ProxyError(SERVICE, res.status, `npm downloads API responded with ${res.status}`)
  }

  const data: DownloadsResponse = await res.json()
  return data.downloads ?? 0
}

/**
 * Fetches weekly and monthly download counts for a package from the npm downloads API.
 * @throws {ProxyError} on non-200 responses, timeout, or network errors.
 */
export async function fetchNpmDownloads(name: string): Promise<NpmDownloads> {
  const [weekly, monthly] = await Promise.all([
    fetchPeriod(name, 'last-week'),
    fetchPeriod(name, 'last-month'),
  ])

  return { packageName: name, weekly, monthly }
}
