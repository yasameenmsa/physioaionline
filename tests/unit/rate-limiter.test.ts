import { describe, it, expect, beforeEach } from 'vitest'
import {
  checkRateLimit,
  resetRateLimit,
  getRateLimitStatus,
  clearAllRateLimits,
} from '@/lib/rate-limiter'

describe('rate-limiter', () => {
  beforeEach(() => {
    clearAllRateLimits()
  })

  describe('checkRateLimit', () => {
    it('allows first request', () => {
      const result = checkRateLimit('user@test.com', 'login')
      expect(result.success).toBe(true)
      expect(result.attempts).toBe(1)
      expect(result.limitExceeded).toBe(false)
    })

    it('increments counter on each request', () => {
      checkRateLimit('ip-1', 'login')
      const result = checkRateLimit('ip-1', 'login')
      expect(result.attempts).toBe(2)
      expect(result.success).toBe(true)
    })

    it('blocks after exceeding max attempts', () => {
      for (let i = 0; i < 5; i++) {
        checkRateLimit('block-me', 'login')
      }
      const result = checkRateLimit('block-me', 'login')
      expect(result.success).toBe(false)
      expect(result.limitExceeded).toBe(true)
    })

    it('resets window after windowMs expires', () => {
      const maxAttempts = 2
      // Exhaust the limit (2 attempts)
      checkRateLimit('expire-me', 'password-reset', { maxAttempts, windowMs: 50 })
      checkRateLimit('expire-me', 'password-reset', { maxAttempts, windowMs: 50 })
      // 3rd attempt should be blocked
      expect(checkRateLimit('expire-me', 'password-reset', {
        maxAttempts, windowMs: 50,
      }).limitExceeded).toBe(true)
      // Still within window — still blocked
      expect(checkRateLimit('expire-me', 'password-reset', {
        maxAttempts, windowMs: 50,
      }).limitExceeded).toBe(true)

      // Wait for window to expire
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const result = checkRateLimit('expire-me', 'password-reset', {
            maxAttempts, windowMs: 50,
          })
          expect(result.success).toBe(true)
          expect(result.attempts).toBe(1)
          resolve()
        }, 60)
      })
    })
  })

  describe('resetRateLimit', () => {
    it('clears rate limit entry', () => {
      checkRateLimit('reset-me', 'login')
      checkRateLimit('reset-me', 'login')
      resetRateLimit('reset-me', 'login')
      const result = checkRateLimit('reset-me', 'login')
      expect(result.attempts).toBe(1)
      expect(result.success).toBe(true)
    })
  })

  describe('getRateLimitStatus', () => {
    it('returns null for unknown identifier', () => {
      expect(getRateLimitStatus('unknown', 'login')).toBeNull()
    })

    it('returns current status without incrementing', () => {
      checkRateLimit('status-test', 'login')
      checkRateLimit('status-test', 'login')
      const status = getRateLimitStatus('status-test', 'login')
      expect(status).not.toBeNull()
      expect(status!.attempts).toBe(2)
      const after = checkRateLimit('status-test', 'login')
      expect(after.attempts).toBe(3)
    })
  })

  describe('config-specific limits', () => {
    it('password-reset allows 3 attempts', () => {
      for (let i = 0; i < 3; i++) {
        expect(checkRateLimit('reset-user', 'password-reset').success).toBe(true)
      }
      expect(checkRateLimit('reset-user', 'password-reset').success).toBe(false)
    })

    it('different configs use separate counters', () => {
      checkRateLimit('same-id', 'login')
      checkRateLimit('same-id', 'login')
      const result = checkRateLimit('same-id', 'password-reset')
      expect(result.attempts).toBe(1)
    })
  })
})
