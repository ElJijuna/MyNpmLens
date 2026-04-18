import type { FavoritePackage } from '@/modules/npm/domain'
import type { FollowedMaintainer } from '@/modules/npm/domain'
import { ProxyError } from '@/modules/npm/proxy/ProxyError'
import { gistFetch, SERVICE, GIST_FILENAME } from './gistClient'

export async function updateUserGist(
  gistId: string,
  favorites: FavoritePackage[],
  maintainers: FollowedMaintainer[],
  token: string,
): Promise<void> {
  const res = await gistFetch(`https://api.github.com/gists/${gistId}`, token, {
    method: 'PATCH',
    body: JSON.stringify({
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
}
