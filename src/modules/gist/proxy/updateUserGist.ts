import type { FavoritePackage } from '@/modules/npm/domain'
import { ProxyError } from '@/modules/npm/proxy/ProxyError'
import { gistFetch, SERVICE, GIST_FILENAME } from './gistClient'

/**
 * Pushes the current favorites to an existing Gist.
 * @throws {ProxyError} on non-200 responses, timeout, or network errors.
 */
export async function updateUserGist(
  gistId: string,
  favorites: FavoritePackage[],
  token: string,
): Promise<void> {
  const res = await gistFetch(`https://api.github.com/gists/${gistId}`, token, {
    method: 'PATCH',
    body: JSON.stringify({
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
}
