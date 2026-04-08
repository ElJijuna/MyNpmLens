/**
 * @jest-environment node
 */
import { fetchGitHubStats } from '../fetchGitHubStats'
import { ProxyError } from '@/modules/npm/proxy/ProxyError'

afterEach(() => jest.restoreAllMocks())

const GITHUB_RESPONSE = {
  stargazers_count: 230_000,
  forks_count: 47_000,
  open_issues_count: 850,
  pushed_at: '2024-12-01T10:00:00Z',
  html_url: 'https://github.com/facebook/react',
}

describe('fetchGitHubStats', () => {
  it('maps response to GitHubStats', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(GITHUB_RESPONSE)),
    )

    const result = await fetchGitHubStats('facebook', 'react')

    expect(result.owner).toBe('facebook')
    expect(result.repo).toBe('react')
    expect(result.stars).toBe(230_000)
    expect(result.forks).toBe(47_000)
    expect(result.openIssues).toBe(850)
    expect(result.lastPushedAt).toBe('2024-12-01T10:00:00Z')
    expect(result.htmlUrl).toBe('https://github.com/facebook/react')
  })

  it('throws ProxyError with 404 when repo not found', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response('{}', { status: 404 }),
    )

    await expect(fetchGitHubStats('foo', 'bar')).rejects.toMatchObject({
      status: 404,
      service: 'github-api',
    })
  })

  it('throws ProxyError with 403 on rate limit', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response('{}', { status: 403 }),
    )

    await expect(fetchGitHubStats('facebook', 'react')).rejects.toMatchObject({
      status: 403,
    })
  })
})
