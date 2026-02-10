import crypto from 'crypto';

/**
 * Generate a cryptographically secure random token
 * @param length - Length of the token in bytes (default 32)
 * @returns Hex-encoded random token
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash a token using SHA-256 for secure storage
 * @param token - The token to hash
 * @returns Hex-encoded hash of the token
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verify a token against its stored hash
 * @param token - The token to verify
 * @param hash - The stored hash to compare against
 * @returns True if the token matches the hash
 */
export function verifyToken(token: string, hash: string): boolean {
  const tokenHash = hashToken(token);
  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(tokenHash, 'hex'),
    Buffer.from(hash, 'hex')
  );
}

/**
 * Check if a token has expired
 * @param expiresAt - The expiration date of the token
 * @returns True if the token has expired
 */
export function isTokenExpired(expiresAt: Date | null | undefined): boolean {
  if (!expiresAt) {
    return true;
  }
  return new Date() > expiresAt;
}

/**
 * Generate a verification token that expires in 24 hours
 * @returns An object with the plain token (to be sent in email) and hashed token (to store in DB)
 */
export function generateVerificationToken(): {
  token: string;
  hashedToken: string;
  expiresAt: Date;
} {
  const token = generateToken(32);
  const hashedToken = hashToken(token);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  return { token, hashedToken, expiresAt };
}

/**
 * Generate a password reset token that expires in 1 hour
 * @returns An object with the plain token (to be sent in email) and hashed token (to store in DB)
 */
export function generateResetToken(): {
  token: string;
  hashedToken: string;
  expiresAt: Date;
} {
  const token = generateToken(32);
  const hashedToken = hashToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  return { token, hashedToken, expiresAt };
}

/**
 * Generate a secure random string for general purposes
 * @param length - Length of the string (default 16)
 * @returns Random alphanumeric string
 */
export function generateSecureString(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomBytes = crypto.randomBytes(length);
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length];
  }

  return result;
}
