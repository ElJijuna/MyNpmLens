import { favoritesStorage } from '../favorites'

const STORAGE_KEY = 'mynpmlens:favorites'

beforeEach(() => {
  localStorage.clear()
})

describe('favoritesStorage.getAll', () => {
  it('returns empty array when localStorage is empty', () => {
    expect(favoritesStorage.getAll()).toEqual([])
  })

  it('returns parsed favorites from localStorage', () => {
    const data = [{ name: 'react', addedAt: '2024-01-01T00:00:00.000Z' }]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    expect(favoritesStorage.getAll()).toEqual(data)
  })

  it('returns empty array on corrupted localStorage data', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json')
    expect(favoritesStorage.getAll()).toEqual([])
  })
})

describe('favoritesStorage.add', () => {
  it('adds a new package', () => {
    const result = favoritesStorage.add('react')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('react')
    expect(result[0].addedAt).toBeDefined()
  })

  it('persists to localStorage', () => {
    favoritesStorage.add('react')
    const raw = localStorage.getItem(STORAGE_KEY)
    expect(JSON.parse(raw!)[0].name).toBe('react')
  })

  it('does not add duplicate packages', () => {
    favoritesStorage.add('react')
    const result = favoritesStorage.add('react')
    expect(result).toHaveLength(1)
  })

  it('adds multiple different packages', () => {
    favoritesStorage.add('react')
    const result = favoritesStorage.add('lodash')
    expect(result).toHaveLength(2)
  })
})

describe('favoritesStorage.remove', () => {
  it('removes an existing package', () => {
    favoritesStorage.add('react')
    favoritesStorage.add('lodash')
    const result = favoritesStorage.remove('react')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('lodash')
  })

  it('persists removal to localStorage', () => {
    favoritesStorage.add('react')
    favoritesStorage.remove('react')
    expect(favoritesStorage.getAll()).toHaveLength(0)
  })

  it('is a no-op for a package that does not exist', () => {
    favoritesStorage.add('react')
    const result = favoritesStorage.remove('lodash')
    expect(result).toHaveLength(1)
  })
})

describe('favoritesStorage.replace', () => {
  it('replaces all favorites with the given list', () => {
    favoritesStorage.add('react')
    favoritesStorage.add('lodash')
    const next = [{ name: 'axios', addedAt: '2025-01-01T00:00:00.000Z' }]
    favoritesStorage.replace(next)
    expect(favoritesStorage.getAll()).toEqual(next)
  })

  it('clears all favorites when called with an empty array', () => {
    favoritesStorage.add('react')
    favoritesStorage.replace([])
    expect(favoritesStorage.getAll()).toEqual([])
  })

  it('persists the replacement to localStorage', () => {
    const next = [{ name: 'vite', addedAt: '2025-01-01T00:00:00.000Z' }]
    favoritesStorage.replace(next)
    const raw = localStorage.getItem(STORAGE_KEY)
    expect(JSON.parse(raw!)).toEqual(next)
  })
})
