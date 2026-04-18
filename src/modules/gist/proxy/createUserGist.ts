import type { FavoritePackage } from '@/modules/npm/domain'
import type { FollowedMaintainer } from '@/modules/npm/domain'
import type { GistSync } from '@/modules/gist/domain'
import { ProxyError } from '@/modules/npm/proxy/ProxyError'
import { gistFetch, SERVICE, GIST_FILENAME } from './gistClient'

interface GistResponse {
  id: string
  updated_at: string
}

export async function createUserGist(
  favorites: FavoritePackage[],
  maintainers: FollowedMaintainer[],
  token: string,
): Promise<GistSync> {
  const res = await gistFetch('https://api.github.com/gists', token, {
    method: 'POST',
    body: JSON.stringify({
      description: 'MyNpmLens favorites',
      public: false,
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify({ favorites, maintainers }, null, 2),
        },
      },
    }),
  })

  if (!res.ok) {
    throw new ProxyError(SERVICE, res.status, `GitHub Gist API responded with ${res.status}`)
  }

  const data: GistResponse = await res.json()

  return {
    gistId: data.id,
    favorites,
    maintainers,
    updatedAt: data.updated_at,
  }
}
