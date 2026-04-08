/**
 * @jest-environment node
 */
import { fetchNpmDownloads } from '../fetchNpmDownloads'
import { ProxyError } from '../ProxyError'

afterEach(() => jest.restoreAllMocks())

describe('fetchNpmDownloads', () => {
  it('returns weekly and monthly downloads', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ downloads: 1_000_000, package: 'react' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ downloads: 4_200_000, package: 'react' })))

    const result = await fetchNpmDownloads('react')

    expect(result.packageName).toBe('react')
    expect(result.weekly).toBe(1_000_000)
    expect(result.monthly).toBe(4_200_000)
  })

  it('throws ProxyError on non-OK response', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response('{}', { status: 500 }))
      .mockResolvedValueOnce(new Response('{}', { status: 500 }))

    await expect(fetchNpmDownloads('react')).rejects.toThrow(ProxyError)
  })
})
