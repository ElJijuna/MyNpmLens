import { fetchUserGist } from '../fetchUserGist'
import { findUserGist } from '../findUserGist'
import { createUserGist } from '../createUserGist'
import { updateUserGist } from '../updateUserGist'
import { ProxyError } from '@/modules/npm/proxy/ProxyError'

const TOKEN = 'gh_test_token'
const GIST_ID = 'abc123'

function mockFetch(responses: { ok: boolean; status?: number; body: unknown }[]) {
  let call = 0
  global.fetch = jest.fn(() => {
    const r = responses[call++] ?? responses[responses.length - 1]
    return Promise.resolve({
      ok: r.ok,
      status: r.status ?? (r.ok ? 200 : 400),
      json: () => Promise.resolve(r.body),
    } as Response)
  })
}

afterEach(() => jest.restoreAllMocks())

// ─── fetchUserGist ────────────────────────────────────────────────────────────

describe('fetchUserGist', () => {
  it('returns parsed GistSync on success', async () => {
    mockFetch([{
      ok: true,
      body: {
        id: GIST_ID,
        updated_at: '2025-01-01T00:00:00Z',
        files: {
          'mynpmlens.json': {
            content: JSON.stringify({ favorites: [{ name: 'react', addedAt: '2025-01-01T00:00:00Z' }] }),
          },
        },
      },
    }])

    const result = await fetchUserGist(GIST_ID, TOKEN)
    expect(result.gistId).toBe(GIST_ID)
    expect(result.favorites).toHaveLength(1)
    expect(result.favorites[0].name).toBe('react')
  })

  it('defaults to empty favorites when file content is malformed', async () => {
    mockFetch([{
      ok: true,
      body: {
        id: GIST_ID,
        updated_at: '2025-01-01T00:00:00Z',
        files: { 'mynpmlens.json': { content: '{}' } },
      },
    }])

    const result = await fetchUserGist(GIST_ID, TOKEN)
    expect(result.favorites).toEqual([])
  })

  it('throws ProxyError on non-ok response', async () => {
    mockFetch([{ ok: false, status: 404, body: {} }])
    await expect(fetchUserGist(GIST_ID, TOKEN)).rejects.toBeInstanceOf(ProxyError)
  })
})

// ─── findUserGist ─────────────────────────────────────────────────────────────

describe('findUserGist', () => {
  it('returns null when user has no gists', async () => {
    mockFetch([{ ok: true, body: [] }])
    const result = await findUserGist(TOKEN)
    expect(result).toBeNull()
  })

  it('returns null when no gist contains mynpmlens.json', async () => {
    mockFetch([
      { ok: true, body: [{ id: 'other', updated_at: '', files: { 'notes.txt': {} } }] },
    ])
    const result = await findUserGist(TOKEN)
    expect(result).toBeNull()
  })

  it('finds and returns the matching gist', async () => {
    mockFetch([
      {
        ok: true,
        body: [{ id: GIST_ID, updated_at: '', files: { 'mynpmlens.json': {} } }],
      },
      {
        ok: true,
        body: {
          id: GIST_ID,
          updated_at: '2025-01-01T00:00:00Z',
          files: {
            'mynpmlens.json': {
              content: JSON.stringify({ favorites: [{ name: 'lodash', addedAt: '2025-01-01T00:00:00Z' }] }),
            },
          },
        },
      },
    ])

    const result = await findUserGist(TOKEN)
    expect(result).not.toBeNull()
    expect(result!.gistId).toBe(GIST_ID)
    expect(result!.favorites[0].name).toBe('lodash')
  })

  it('paginates and finds gist on second page', async () => {
    const page1 = Array.from({ length: 100 }, (_, i) => ({
      id: `other-${i}`,
      updated_at: '',
      files: { 'notes.txt': {} },
    }))

    mockFetch([
      { ok: true, body: page1 },
      { ok: true, body: [{ id: GIST_ID, updated_at: '', files: { 'mynpmlens.json': {} } }] },
      {
        ok: true,
        body: {
          id: GIST_ID,
          updated_at: '2025-01-01T00:00:00Z',
          files: { 'mynpmlens.json': { content: '{"favorites":[]}' } },
        },
      },
    ])

    const result = await findUserGist(TOKEN)
    expect(result!.gistId).toBe(GIST_ID)
  })

  it('throws ProxyError on non-ok list response', async () => {
    mockFetch([{ ok: false, status: 401, body: {} }])
    await expect(findUserGist(TOKEN)).rejects.toBeInstanceOf(ProxyError)
  })
})

// ─── createUserGist ───────────────────────────────────────────────────────────

describe('createUserGist', () => {
  const favorites = [{ name: 'react', addedAt: '2025-01-01T00:00:00Z' }]

  it('returns GistSync with the created gist id', async () => {
    mockFetch([{ ok: true, body: { id: GIST_ID, updated_at: '2025-01-01T00:00:00Z' } }])

    const result = await createUserGist(favorites, TOKEN)
    expect(result.gistId).toBe(GIST_ID)
    expect(result.favorites).toEqual(favorites)
  })

  it('sends a POST request with the correct body', async () => {
    mockFetch([{ ok: true, body: { id: GIST_ID, updated_at: '2025-01-01T00:00:00Z' } }])

    await createUserGist(favorites, TOKEN)

    const call = (global.fetch as jest.Mock).mock.calls[0]
    expect(call[0]).toBe('https://api.github.com/gists')
    expect(call[1].method).toBe('POST')
    const body = JSON.parse(call[1].body)
    expect(body.public).toBe(false)
    expect(body.files['mynpmlens.json']).toBeDefined()
  })

  it('throws ProxyError on non-ok response', async () => {
    mockFetch([{ ok: false, status: 422, body: {} }])
    await expect(createUserGist(favorites, TOKEN)).rejects.toBeInstanceOf(ProxyError)
  })
})

// ─── updateUserGist ───────────────────────────────────────────────────────────

describe('updateUserGist', () => {
  const favorites = [{ name: 'vue', addedAt: '2025-01-01T00:00:00Z' }]

  it('resolves without error on success', async () => {
    mockFetch([{ ok: true, body: {} }])
    await expect(updateUserGist(GIST_ID, favorites, TOKEN)).resolves.toBeUndefined()
  })

  it('sends a PATCH request to the correct URL', async () => {
    mockFetch([{ ok: true, body: {} }])

    await updateUserGist(GIST_ID, favorites, TOKEN)

    const call = (global.fetch as jest.Mock).mock.calls[0]
    expect(call[0]).toBe(`https://api.github.com/gists/${GIST_ID}`)
    expect(call[1].method).toBe('PATCH')
    const body = JSON.parse(call[1].body)
    const content = JSON.parse(body.files['mynpmlens.json'].content)
    expect(content.favorites[0].name).toBe('vue')
  })

  it('throws ProxyError on non-ok response', async () => {
    mockFetch([{ ok: false, status: 404, body: {} }])
    await expect(updateUserGist(GIST_ID, favorites, TOKEN)).rejects.toBeInstanceOf(ProxyError)
  })
})
