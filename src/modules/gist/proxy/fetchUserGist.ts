import type { FavoritePackage } from '@/modules/npm/domain'
import type { FollowedMaintainer } from '@/modules/npm/domain'
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

export async function fetchUserGist(gistId: string, token: string): Promise<GistSync> {
  const res = await gistFetch(`https://api.github.com/gists/${gistId}`, token)

  if (!res.ok) {
    throw new ProxyError(SERVICE, res.status, `GitHub Gist API responded with ${res.status}`)
  }

  const data: GistResponse = await res.json()
  const raw = data.files[GIST_FILENAME]?.content ?? '{}'
  const parsed = JSON.parse(raw) as { favorites?: FavoritePackage[]; maintainers?: FollowedMaintainer[] }

  return {
    gistId: data.id,
    favorites: parsed.favorites ?? [],
    maintainers: parsed.maintainers ?? [],
    updatedAt: data.updated_at,
  }
}
