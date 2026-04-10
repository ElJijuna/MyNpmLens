import type { FavoritePackage } from '@/modules/npm/domain'
import type { GistSync } from '@/modules/gist/domain'
import { ProxyError } from '@/modules/npm/proxy/ProxyError'
import { gistFetch, SERVICE, GIST_FILENAME } from './gistClient'

interface GistResponse {
  id: string
  updated_at: string
}

/**
 * Creates a new private Gist with the user's current favorites.
 * Called on first login when no gistId exists in localStorage.
 * @throws {ProxyError} on non-200 responses, timeout, or network errors.
 */
export async function createUserGist(
  favorites: FavoritePackage[],
  token: string,
): Promise<GistSync> {
  const res = await gistFetch('https://api.github.com/gists', token, {
    method: 'POST',
    body: JSON.stringify({
      description: 'MyNpmLens favorites',
      public: false,
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify({ favorites }, null, 2),
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
    updatedAt: data.updated_at,
  }
}
