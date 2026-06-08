export interface GitHubSlug {
  owner: string;
  repo: string;
}

export function parseGitHubSlug(url: string): GitHubSlug | null {
  const match = url.match(/github\.com[/:]([^/]+)\/([^/.]+?)(?:\.git)?$/);
  if (!match) {
    return null;
  }
  return { owner: match[1], repo: match[2] };
}
