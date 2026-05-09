import { favoritesStorage } from '../favorites'

beforeEach(() => {
  localStorage.clear()
})

describe('favoritesStorage.getAll', () => {
  it('returns empty array when storage is empty', async () => {
    await expect(favoritesStorage.getAll()).resolves.toEqual([])
  })

  it('returns stored favorites', async () => {
    const data = [{ name: 'react', addedAt: '2024-01-01T00:00:00.000Z' }]
    await favoritesStorage.replace(data)
    await expect(favoritesStorage.getAll()).resolves.toEqual(data)
  })
})

describe('favoritesStorage.add', () => {
  it('adds a new package', async () => {
    await favoritesStorage.add('react')
    const result = await favoritesStorage.getAll()
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('react')
    expect(result[0].addedAt).toBeDefined()
  })

  it('persists to storage', async () => {
    await favoritesStorage.add('react')
    const result = await favoritesStorage.getAll()
    expect(result[0].name).toBe('react')
  })

  it('does not add duplicate packages', async () => {
    await favoritesStorage.add('react')
    await favoritesStorage.add('react')
    const result = await favoritesStorage.getAll()
    expect(result).toHaveLength(1)
  })

  it('adds multiple different packages', async () => {
    await favoritesStorage.add('react')
    await favoritesStorage.add('lodash')
    const result = await favoritesStorage.getAll()
    expect(result).toHaveLength(2)
  })
})

describe('favoritesStorage.remove', () => {
  it('removes an existing package', async () => {
    await favoritesStorage.add('react')
    await favoritesStorage.add('lodash')
    await favoritesStorage.remove('react')
    const result = await favoritesStorage.getAll()
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('lodash')
  })

  it('persists removal to storage', async () => {
    await favoritesStorage.add('react')
    await favoritesStorage.remove('react')
    await expect(favoritesStorage.getAll()).resolves.toHaveLength(0)
  })

  it('is a no-op for a package that does not exist', async () => {
    await favoritesStorage.add('react')
    await favoritesStorage.remove('lodash')
    const result = await favoritesStorage.getAll()
    expect(result).toHaveLength(1)
  })
})

describe('favoritesStorage.replace', () => {
  it('replaces all favorites with the given list', async () => {
    await favoritesStorage.add('react')
    await favoritesStorage.add('lodash')
    const next = [{ name: 'axios', addedAt: '2025-01-01T00:00:00.000Z' }]
    await favoritesStorage.replace(next)
    await expect(favoritesStorage.getAll()).resolves.toEqual(next)
  })

  it('clears all favorites when called with an empty array', async () => {
    await favoritesStorage.add('react')
    await favoritesStorage.replace([])
    await expect(favoritesStorage.getAll()).resolves.toEqual([])
  })

  it('persists the replacement to storage', async () => {
    const next = [{ name: 'vite', addedAt: '2025-01-01T00:00:00.000Z' }]
    await favoritesStorage.replace(next)
    await expect(favoritesStorage.getAll()).resolves.toEqual(next)
  })
})
