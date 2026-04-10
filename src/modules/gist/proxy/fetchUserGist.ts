import type { FavoritePackage } from '@/modules/npm/domain'
import type { GistSync } from '@/modules/gist/domain'
import { ProxyError } from '@/modules/npm/proxy/ProxyError'
import { gistFetch, SERVICE, GIST_FILENAME } from './gistClient'

interface GistFileResponse {
  content: string
}

interface GistResponse {
  id: string
  updated_at: string
  files: Record<string, GistFileResponse>
}

/**
 * Fetches the user's MyNpmLens Gist and parses its favorites content.
 * @throws {ProxyError} on non-200 responses, timeout, or network errors.
 */
export async function fetchUserGist(gistId: string, token: string): Promise<GistSync> {
  const res = await gistFetch(`https://api.github.com/gists/${gistId}`, token)

  if (!res.ok) {
    throw new ProxyError(SERVICE, res.status, `GitHub Gist API responded with ${res.status}`)
  }

  const data: GistResponse = await res.json()
  const raw = data.files[GIST_FILENAME]?.content ?? '{}'
  const parsed = JSON.parse(raw) as { favorites?: FavoritePackage[] }

  return {
    gistId: data.id,
    favorites: parsed.favorites ?? [],
    updatedAt: data.updated_at,
  }
}
