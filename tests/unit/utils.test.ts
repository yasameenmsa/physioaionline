import { describe, it, expect } from 'vitest'
import {
  cn,
  formatDate,
  formatDateTime,
  truncate,
  generateSlug,
  calculatePercentage,
  formatFileSize,
} from '@/lib/utils'

describe('utils', () => {
  describe('cn', () => {
    it('merges class names', () => {
      expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
    })

    it('handles conditional classes', () => {
      expect(cn('base', false && 'hidden')).toBe('base')
    })
  })

  describe('formatDate', () => {
    it('formats a Date object', () => {
      const d = new Date('2026-01-15')
      expect(formatDate(d)).toContain('2026')
    })

    it('formats a date string', () => {
      expect(formatDate('2026-01-15')).toContain('2026')
    })
  })

  describe('formatDateTime', () => {
    it('includes time in the output', () => {
      const result = formatDateTime('2026-01-15T10:30:00')
      expect(result).toContain('2026')
      expect(result).toContain('10')
    })
  })

  describe('truncate', () => {
    it('returns the string as-is if shorter than limit', () => {
      expect(truncate('hello', 10)).toBe('hello')
    })

    it('truncates and appends ellipsis', () => {
      expect(truncate('hello world this is long', 10)).toBe('hello worl...')
    })

    it('handles empty string', () => {
      expect(truncate('', 5)).toBe('')
    })
  })

  describe('generateSlug', () => {
    it('converts text to kebab-case', () => {
      expect(generateSlug('Hello World')).toBe('hello-world')
    })

    it('removes special characters', () => {
      expect(generateSlug('What is ACL?')).toBe('what-is-acl')
    })

    it('collapses multiple dashes', () => {
      expect(generateSlug('foo   bar')).toBe('foo-bar')
    })
  })

  describe('calculatePercentage', () => {
    it('returns 0 for zero total', () => {
      expect(calculatePercentage(5, 0)).toBe(0)
    })

    it('calculates correct percentage', () => {
      expect(calculatePercentage(25, 100)).toBe(25)
    })

    it('rounds to nearest integer', () => {
      expect(calculatePercentage(1, 3)).toBe(33)
    })
  })

  describe('formatFileSize', () => {
    it('formats bytes', () => {
      expect(formatFileSize(500)).toBe('500.0 B')
    })

    it('formats kilobytes', () => {
      expect(formatFileSize(2048)).toBe('2.0 KB')
    })

    it('formats megabytes', () => {
      expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB')
    })

    it('formats gigabytes', () => {
      expect(formatFileSize(3 * 1024 * 1024 * 1024)).toBe('3.0 GB')
    })
  })
})
