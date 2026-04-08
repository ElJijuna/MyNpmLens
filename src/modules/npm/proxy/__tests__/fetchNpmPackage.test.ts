/**
 * @jest-environment node
 */
import { fetchNpmPackage } from '../fetchNpmPackage'
import { ProxyError } from '../ProxyError'

function mockFetch(body: unknown, status = 200) {
  return jest.spyOn(global, 'fetch').mockResolvedValueOnce(
    new Response(JSON.stringify(body), { status }),
  )
}

const REGISTRY_RESPONSE = {
  name: 'react',
  description: 'A JavaScript library for building user interfaces.',
  license: 'MIT',
  homepage: 'https://reactjs.org/',
  'dist-tags': { latest: '19.0.0' },
  versions: {},
  author: { name: 'Meta', email: null, url: null },
  repository: { type: 'git', url: 'https://github.com/facebook/react.git' },
}

afterEach(() => jest.restoreAllMocks())

describe('fetchNpmPackage', () => {
  it('maps registry response to NpmPackage', async () => {
    mockFetch(REGISTRY_RESPONSE)
    const result = await fetchNpmPackage('react')

    expect(result.name).toBe('react')
    expect(result.version).toBe('19.0.0')
    expect(result.license).toBe('MIT')
    expect(result.author?.name).toBe('Meta')
  })

  it('parses GitHub slug from repository URL', async () => {
    mockFetch(REGISTRY_RESPONSE)
    const result = await fetchNpmPackage('react')

    expect(result.repository?.github).toEqual({ owner: 'facebook', repo: 'react' })
  })

  it('returns null github when repository URL is not GitHub', async () => {
    mockFetch({ ...REGISTRY_RESPONSE, repository: { type: 'git', url: 'https://gitlab.com/foo/bar.git' } })
    const result = await fetchNpmPackage('react')

    expect(result.repository?.github).toBeNull()
  })

  it('throws ProxyError with status 404 when package not found', async () => {
    mockFetch({ error: 'Not found' }, 404)

    await expect(fetchNpmPackage('nonexistent-pkg-xyz')).rejects.toThrow(ProxyError)
    await expect(fetchNpmPackage('nonexistent-pkg-xyz')).rejects.toMatchObject({ status: 404 })
  })

  it('throws ProxyError on non-OK response', async () => {
    mockFetch({}, 500)

    await expect(fetchNpmPackage('react')).rejects.toThrow(ProxyError)
  })
})
