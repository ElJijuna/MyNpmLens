/**
 * Centralised query key factory for all GitHub-related queries.
 */
export const githubQueryKeys = {
  stats: (owner: string, repo: string) => ['github', 'stats', owner, repo] as const,
}
