/**
 * Core metadata from the npm registry for a given package.
 */
export interface NpmPackage {
  name: string
  version: string
  description: string
  license: string
  homepage: string | null
  author: NpmAuthor | null
  repository: NpmRepository | null
}

export interface NpmAuthor {
  name: string
  email: string | null
  url: string | null
}

export interface NpmRepository {
  type: string
  url: string
  /** Parsed owner/repo slug, e.g. "facebook/react". Present when repository is on GitHub. */
  github: GitHubSlug | null
}

export interface GitHubSlug {
  owner: string
  repo: string
}
