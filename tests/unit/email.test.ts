import { describe, it, expect, vi, beforeEach } from 'vitest'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('email', () => {
  it('sendVerificationEmail logs the URL and does not throw', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { sendVerificationEmail } = await import('@/lib/email')

    await expect(
      sendVerificationEmail('test@example.com', 'Test User', 'abc123token')
    ).resolves.toBeUndefined()

    expect(consoleSpy).toHaveBeenCalled()
    const logged = consoleSpy.mock.calls.map(c => c.join(' ')).join(' ')
    expect(logged).toContain('test@example.com')
    expect(logged).toContain('abc123token')
  })

  it('sendResendVerificationEmail logs the URL and does not throw', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { sendResendVerificationEmail } = await import('@/lib/email')

    await expect(
      sendResendVerificationEmail('user@test.com', 'User', 'resend-token')
    ).resolves.toBeUndefined()

    expect(consoleSpy).toHaveBeenCalled()
  })

  it('sendPasswordResetEmail logs the URL and does not throw', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { sendPasswordResetEmail } = await import('@/lib/email')

    await expect(
      sendPasswordResetEmail('user@test.com', 'User', 'reset-token')
    ).resolves.toBeUndefined()

    expect(consoleSpy).toHaveBeenCalled()
  })
})
