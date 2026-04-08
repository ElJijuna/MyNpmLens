/**
 * @jest-environment node
 */
import { fetchBundleSize } from '../fetchBundleSize'
import { ProxyError } from '../ProxyError'

afterEach(() => jest.restoreAllMocks())

const BUNDLEPHOBIA_RESPONSE = {
  name: 'react',
  version: '19.0.0',
  size: 11_000,
  gzip: 4_200,
  hasSideEffects: false,
}

describe('fetchBundleSize', () => {
  it('maps response to BundleSize', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(BUNDLEPHOBIA_RESPONSE)),
    )

    const result = await fetchBundleSize('react')

    expect(result.packageName).toBe('react')
    expect(result.size).toBe(11_000)
    expect(result.gzip).toBe(4_200)
    expect(result.hasSideEffects).toBe(false)
  })

  it('throws ProxyError with 404 when package not found', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response('{}', { status: 404 }),
    )

    await expect(fetchBundleSize('nonexistent')).rejects.toMatchObject({
      status: 404,
      service: 'bundlephobia',
    })
  })

  it('throws ProxyError on non-OK response', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response('{}', { status: 503 }),
    )

    await expect(fetchBundleSize('react')).rejects.toThrow(ProxyError)
  })
})
