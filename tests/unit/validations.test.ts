import { describe, it, expect } from 'vitest'
import {
  emailSchema,
  passwordSchema,
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  articleSchema,
} from '@/lib/validations'

describe('validations', () => {
  describe('emailSchema', () => {
    it('accepts valid emails', () => {
      expect(emailSchema.safeParse('test@example.com').success).toBe(true)
    })

    it('rejects empty string', () => {
      expect(emailSchema.safeParse('').success).toBe(false)
    })

    it('rejects invalid emails', () => {
      expect(emailSchema.safeParse('not-an-email').success).toBe(false)
    })
  })

  describe('passwordSchema', () => {
    it('accepts strong passwords', () => {
      expect(passwordSchema.safeParse('Password1').success).toBe(true)
    })

    it('rejects short passwords', () => {
      expect(passwordSchema.safeParse('Ab1').success).toBe(false)
    })

    it('rejects passwords without letters', () => {
      expect(passwordSchema.safeParse('12345678').success).toBe(false)
    })

    it('rejects passwords without numbers', () => {
      expect(passwordSchema.safeParse('abcdefgh').success).toBe(false)
    })
  })

  describe('registerSchema', () => {
    it('accepts valid registration data', () => {
      const result = registerSchema.safeParse({
        email: 'user@example.com',
        password: 'SecurePass1',
        name: 'Test User',
      })
      expect(result.success).toBe(true)
    })

    it('accepts registration without name', () => {
      const result = registerSchema.safeParse({
        email: 'user@example.com',
        password: 'SecurePass1',
      })
      expect(result.success).toBe(true)
    })

    it('rejects missing email', () => {
      const result = registerSchema.safeParse({
        password: 'SecurePass1',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('loginSchema', () => {
    it('accepts valid login data', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'any-password',
      })
      expect(result.success).toBe(true)
    })

    it('rejects missing password', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('resetPasswordSchema', () => {
    it('accepts matching passwords', () => {
      const result = resetPasswordSchema.safeParse({
        token: 'abc123',
        password: 'NewPass123',
        confirmPassword: 'NewPass123',
      })
      expect(result.success).toBe(true)
    })

    it('rejects non-matching passwords', () => {
      const result = resetPasswordSchema.safeParse({
        token: 'abc123',
        password: 'NewPass123',
        confirmPassword: 'DifferentPass1',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('articleSchema', () => {
    it('accepts valid article data', () => {
      const result = articleSchema.safeParse({
        title: 'Test Article',
        body: '# Content\n\nSome body text',
        excerpt: 'A short excerpt',
        category: 'anatomy',
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty title', () => {
      const result = articleSchema.safeParse({
        title: '',
        body: 'Some body',
        excerpt: 'Excerpt',
        category: 'anatomy',
      })
      expect(result.success).toBe(false)
    })
  })
})
