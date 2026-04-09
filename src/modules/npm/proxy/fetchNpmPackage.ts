import type { NpmPackage, NpmAuthor, NpmRepository, GitHubSlug } from '@/modules/npm/domain'
import { ProxyError } from './ProxyError'
import { fetchWithTimeout } from './fetchWithTimeout'

const SERVICE = 'npm-registry'

interface RegistryResponse {
  name: string
  description?: string
  license?: string
  homepage?: string
  author?: { name?: string; email?: string; url?: string } | string
  repository?: { type?: string; url?: string } | string
  'dist-tags': Record<string, string>
  versions: Record<string, unknown>
}

function parseAuthor(raw: RegistryResponse['author']): NpmAuthor | null {
  if (!raw) return null
  if (typeof raw === 'string') return { name: raw, email: null, url: null }
  return { name: raw.name ?? '', email: raw.email ?? null, url: raw.url ?? null }
}

function parseGitHubSlug(url: string): GitHubSlug | null {
  const match = url.match(/github\.com[/:]([^/]+)\/([^/.]+?)(?:\.git)?$/)
  if (!match) return null
  return { owner: match[1], repo: match[2] }
}

function parseRepository(raw: RegistryResponse['repository']): NpmRepository | null {
  if (!raw) return null
  const url = typeof raw === 'string' ? raw : (raw.url ?? '')
  const type = typeof raw === 'string' ? 'git' : (raw.type ?? 'git')
  return {
    type,
    url,
    github: parseGitHubSlug(url),
  }
}

/**
 * Fetches package metadata from the npm registry.
 * @throws {ProxyError} on non-200 responses, timeout, or network errors.
 */
export async function fetchNpmPackage(name: string): Promise<NpmPackage> {
  const encoded = encodeURIComponent(name).replace('%40', '@').replace('%2F', '/')
  const url = `https://registry.npmjs.org/${encoded}`

  const res = await fetchWithTimeout(url, SERVICE)

  if (res.status === 404) {
    throw new ProxyError(SERVICE, 404, `Package "${name}" not found on npm registry`)
  }
  if (!res.ok) {
    throw new ProxyError(SERVICE, res.status, `npm registry responded with ${res.status}`)
  }

  const data: RegistryResponse = await res.json()
  const distTags = data['dist-tags'] ?? {}
  const version = distTags.latest ?? ''
  const versions = Object.keys(data.versions ?? {}).reverse()

  return {
    name: data.name,
    version,
    versions,
    distTags,
    description: data.description ?? '',
    license: data.license ?? '',
    homepage: data.homepage ?? null,
    author: parseAuthor(data.author),
    repository: parseRepository(data.repository),
  }
}
