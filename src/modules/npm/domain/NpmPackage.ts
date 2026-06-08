/**
 * Core metadata from the npm registry for a given package.
 */
export interface NpmPackage {
  name: string;
  /** Latest version (dist-tags.latest) */
  version: string;
  /** All published versions, newest first */
  versions: string[];
  /** dist-tags map, e.g. { latest: '1.0.0', next: '2.0.0-beta.1' } */
  distTags: Record<string, string>;
  description: string;
  license: string;
  homepage: string | null;
  author: NpmAuthor | null;
  repository: NpmRepository | null;
}

export interface NpmAuthor {
  name: string;
  email: string | null;
  url: string | null;
}

export interface NpmRepository {
  type: string;
  url: string;
  /** Parsed owner/repo slug, e.g. "facebook/react". Present when repository is on GitHub. */
  github: GitHubSlug | null;
}

export interface GitHubSlug {
  owner: string;
  repo: string;
}
