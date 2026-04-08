import { parseNpmUrl } from '../parseNpmUrl'

describe('parseNpmUrl', () => {
  describe('npm URLs', () => {
    it('parses an unscoped package URL', () => {
      expect(parseNpmUrl('https://www.npmjs.com/package/react')).toBe('react')
    })

    it('parses a scoped package URL', () => {
      expect(parseNpmUrl('https://www.npmjs.com/package/@tanstack/react-query')).toBe(
        '@tanstack/react-query',
      )
    })

    it('parses without www subdomain', () => {
      expect(parseNpmUrl('https://npmjs.com/package/lodash')).toBe('lodash')
    })

    it('returns null for non-npm URLs', () => {
      expect(parseNpmUrl('https://github.com/facebook/react')).toBeNull()
    })

    it('returns null for npmjs URL without /package/ path', () => {
      expect(parseNpmUrl('https://www.npmjs.com/search?q=react')).toBeNull()
    })
  })

  describe('plain package names', () => {
    it('accepts an unscoped name', () => {
      expect(parseNpmUrl('lodash')).toBe('lodash')
    })

    it('accepts a scoped name', () => {
      expect(parseNpmUrl('@tanstack/react-router')).toBe('@tanstack/react-router')
    })

    it('accepts names with dots', () => {
      expect(parseNpmUrl('some.package')).toBe('some.package')
    })
  })

  describe('invalid inputs', () => {
    it('returns null for empty string', () => {
      expect(parseNpmUrl('')).toBeNull()
    })

    it('returns null for whitespace only', () => {
      expect(parseNpmUrl('   ')).toBeNull()
    })

    it('returns null for uppercase names', () => {
      expect(parseNpmUrl('React')).toBeNull()
    })

    it('returns null for names with spaces', () => {
      expect(parseNpmUrl('my package')).toBeNull()
    })
  })

  describe('trimming', () => {
    it('trims leading and trailing whitespace before parsing', () => {
      expect(parseNpmUrl('  react  ')).toBe('react')
    })

    it('trims whitespace around a URL', () => {
      expect(parseNpmUrl('  https://www.npmjs.com/package/react  ')).toBe('react')
    })
  })
})
