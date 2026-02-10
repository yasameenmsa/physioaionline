/**
 * In-memory rate limiting utility
 * For production with multiple instances, consider using Redis or a similar solution
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
  firstAttempt: number;
}

// In-memory storage for rate limits
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries from the rate limit store
 * Should be called periodically to prevent memory leaks
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 10 * 60 * 1000);
}

export interface RateLimitConfig {
  /** Maximum number of attempts allowed */
  maxAttempts: number;
  /** Window duration in milliseconds */
  windowMs: number;
  /** Optional: Block duration after max attempts is reached (default: same as windowMs) */
  blockDurationMs?: number;
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  success: boolean;
  /** Number of attempts made in the current window */
  attempts: number;
  /** Unix timestamp when the rate limit window will reset */
  resetAt: number;
  /** Number of milliseconds until the limit resets */
  retryAfter: number;
  /** Whether the limit has been exceeded */
  limitExceeded: boolean;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  registration: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000, // 1 hour
  },
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 15 * 60 * 1000, // 15 minutes
  },
  'password-reset': {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000, // 1 hour
  },
  'resend-verification': {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000, // 1 hour
  },
  'email-verification': {
    maxAttempts: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000, // 1 hour
  },
};

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier for the entity being rate limited (email, IP, etc.)
 * @param configName - Name of the rate limit config to use
 * @param customConfig - Optional custom rate limit config
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  configName: keyof typeof DEFAULT_CONFIGS,
  customConfig?: RateLimitConfig
): RateLimitResult {
  const config = customConfig || DEFAULT_CONFIGS[configName];
  const now = Date.now();
  const key = `${configName}:${identifier}`;

  const entry = rateLimitStore.get(key);

  // No existing entry - first request
  if (!entry) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + config.windowMs,
      firstAttempt: now,
    };
    rateLimitStore.set(key, newEntry);

    return {
      success: true,
      attempts: 1,
      resetAt: newEntry.resetAt,
      retryAfter: config.windowMs,
      limitExceeded: false,
    };
  }

  // Existing entry found
  const blockDuration = config.blockDurationMs || config.windowMs;

  // Check if the window has expired
  if (now > entry.resetAt) {
    // Reset the window
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + config.windowMs,
      firstAttempt: now,
    };
    rateLimitStore.set(key, newEntry);

    return {
      success: true,
      attempts: 1,
      resetAt: newEntry.resetAt,
      retryAfter: config.windowMs,
      limitExceeded: false,
    };
  }

  // Window hasn't expired - check if limit is reached
  const isNewEntry = now - entry.firstAttempt > config.windowMs;

  if (isNewEntry) {
    // Start a new window but keep some context
    entry.count = 1;
    entry.resetAt = now + config.windowMs;
    entry.firstAttempt = now;
    rateLimitStore.set(key, entry);

    return {
      success: true,
      attempts: 1,
      resetAt: entry.resetAt,
      retryAfter: config.windowMs,
      limitExceeded: false,
    };
  }

  // Increment the counter
  entry.count += 1;
  rateLimitStore.set(key, entry);

  const limitExceeded = entry.count > config.maxAttempts;

  return {
    success: !limitExceeded,
    attempts: entry.count,
    resetAt: entry.resetAt + (limitExceeded ? blockDuration : 0),
    retryAfter: entry.resetAt + (limitExceeded ? blockDuration : 0) - now,
    limitExceeded,
  };
}

/**
 * Reset the rate limit for a specific identifier
 * Useful for allowing a user to retry after successful verification, etc.
 *
 * @param identifier - Unique identifier for the entity
 * @param configName - Name of the rate limit config
 */
export function resetRateLimit(
  identifier: string,
  configName: keyof typeof DEFAULT_CONFIGS
): void {
  const key = `${configName}:${identifier}`;
  rateLimitStore.delete(key);
}

/**
 * Get the current rate limit status without incrementing the counter
 *
 * @param identifier - Unique identifier for the entity
 * @param configName - Name of the rate limit config
 * @returns Current rate limit status or null if no entry exists
 */
export function getRateLimitStatus(
  identifier: string,
  configName: keyof typeof DEFAULT_CONFIGS
): RateLimitResult | null {
  const key = `${configName}:${identifier}`;
  const entry = rateLimitStore.get(key);

  if (!entry) {
    return null;
  }

  const config = DEFAULT_CONFIGS[configName];
  const now = Date.now();

  // Check if the window has expired
  if (now > entry.resetAt) {
    return {
      success: true,
      attempts: 0,
      resetAt: now + config.windowMs,
      retryAfter: 0,
      limitExceeded: false,
    };
  }

  const limitExceeded = entry.count > config.maxAttempts;

  return {
    success: !limitExceeded,
    attempts: entry.count,
    resetAt: entry.resetAt,
    retryAfter: Math.max(0, entry.resetAt - now),
    limitExceeded,
  };
}

/**
 * Get all rate limit entries (useful for debugging/admin)
 */
export function getAllRateLimitEntries(): Map<string, RateLimitEntry> {
  return new Map(rateLimitStore);
}

/**
 * Clear all rate limit entries (useful for testing)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}
