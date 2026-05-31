import { describe, it, expect } from 'vitest'
import {
  generateToken,
  hashToken,
  verifyToken,
  isTokenExpired,
  generateVerificationToken,
  generateResetToken,
  generateSecureString,
} from '@/lib/tokens'

describe('tokens', () => {
  describe('generateToken', () => {
    it('generates a hex string of the correct length', () => {
      const token = generateToken(16)
      expect(token).toHaveLength(32)
    })

    it('defaults to 32 bytes (64 hex chars)', () => {
      const token = generateToken()
      expect(token).toHaveLength(64)
    })

    it('generates unique tokens each call', () => {
      const a = generateToken()
      const b = generateToken()
      expect(a).not.toBe(b)
    })
  })

  describe('hashToken', () => {
    it('produces a consistent SHA-256 hash', () => {
      const hash = hashToken('hello')
      expect(hash).toHaveLength(64)
      expect(hashToken('hello')).toBe(hash)
    })

    it('produces different hashes for different inputs', () => {
      expect(hashToken('a')).not.toBe(hashToken('b'))
    })
  })

  describe('verifyToken', () => {
    it('returns true for matching token and hash', () => {
      const token = generateToken()
      const hash = hashToken(token)
      expect(verifyToken(token, hash)).toBe(true)
    })

    it('returns false for non-matching token and hash', () => {
      const hash = hashToken('real-token')
      expect(verifyToken('fake-token', hash)).toBe(false)
    })
  })

  describe('isTokenExpired', () => {
    it('returns true for null/undefined expiry', () => {
      expect(isTokenExpired(null)).toBe(true)
      expect(isTokenExpired(undefined)).toBe(true)
    })

    it('returns true for a past date', () => {
      expect(isTokenExpired(new Date('2020-01-01'))).toBe(true)
    })

    it('returns false for a future date', () => {
      const future = new Date(Date.now() + 3600000)
      expect(isTokenExpired(future)).toBe(false)
    })
  })

  describe('generateVerificationToken', () => {
    it('returns token, hashedToken, and future expiresAt', () => {
      const result = generateVerificationToken()
      expect(result.token).toBeTruthy()
      expect(result.hashedToken).toBeTruthy()
      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now())
      expect(hashToken(result.token)).toBe(result.hashedToken)
    })
  })

  describe('generateResetToken', () => {
    it('returns token, hashedToken, and future expiresAt', () => {
      const result = generateResetToken()
      expect(result.token).toBeTruthy()
      expect(result.hashedToken).toBeTruthy()
      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now())
      expect(hashToken(result.token)).toBe(result.hashedToken)
    })
  })

  describe('generateSecureString', () => {
    it('generates alphanumeric string of requested length', () => {
      const s = generateSecureString(12)
      expect(s).toHaveLength(12)
      expect(s).toMatch(/^[a-zA-Z0-9]+$/)
    })

    it('defaults to 16 characters', () => {
      expect(generateSecureString()).toHaveLength(16)
    })
  })
})
