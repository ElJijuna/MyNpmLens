import type { GistSync } from '@/modules/gist/domain'
import type { FavoritePackage } from '@/modules/npm/domain'
import type { FollowedMaintainer } from '@/modules/npm/domain'
import { gistFetch, SERVICE, GIST_FILENAME } from './gistClient'
import { ProxyError } from '@/modules/npm/proxy/ProxyError'

interface GistListItem {
  id: string
  updated_at: string
  files: Record<string, unknown>
}

interface GistDetailFile {
  content: string
}

interface GistDetail {
  id: string
  updated_at: string
  files: Record<string, GistDetailFile>
}

/**
 * Searches the authenticated user's Gists for an existing MyNpmLens Gist.
 * Paginates through all pages until found or exhausted.
 * Returns null if none exists.
 */
export async function findUserGist(token: string): Promise<GistSync | null> {
  let page = 1

  while (true) {
    const res = await gistFetch(
      `https://api.github.com/gists?per_page=100&page=${page}`,
      token,
    )

    if (!res.ok) {
      throw new ProxyError(SERVICE, res.status, `GitHub Gist API responded with ${res.status}`)
    }

    const gists: GistListItem[] = await res.json()

    if (gists.length === 0) return null

    const match = gists.find((g) => GIST_FILENAME in g.files)

    if (match) {
      // Fetch full content — list endpoint truncates file content
      const detail = await gistFetch(`https://api.github.com/gists/${match.id}`, token)
      if (!detail.ok) {
        throw new ProxyError(SERVICE, detail.status, `GitHub Gist API responded with ${detail.status}`)
      }
      const data: GistDetail = await detail.json()
      const raw = data.files[GIST_FILENAME]?.content ?? '{}'
      const parsed = JSON.parse(raw) as { favorites?: FavoritePackage[]; maintainers?: FollowedMaintainer[] }
      return {
        gistId: data.id,
        favorites: parsed.favorites ?? [],
        maintainers: parsed.maintainers ?? [],
        updatedAt: data.updated_at,
      }
    }

    if (gists.length < 100) return null
    page++
  }
}
