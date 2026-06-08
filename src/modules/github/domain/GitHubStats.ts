/**
 * Repository statistics fetched from the GitHub API.
 */
export interface GitHubStats {
  owner: string;
  repo: string;
  stars: number;
  forks: number;
  openIssues: number;
  /** ISO 8601 date string of the last push */
  lastPushedAt: string;
  /** URL to the repository on GitHub */
  htmlUrl: string;
  /** Repository topics */
  topics?: string[];
}
