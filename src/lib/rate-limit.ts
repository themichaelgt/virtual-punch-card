// src/lib/rate-limit.ts
import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Check if Redis credentials are configured
const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
const isRedisConfigured = !!redisUrl && !!redisToken

// Redis client (only initialized if configured)
const redis = isRedisConfigured
  ? new Redis({
    url: redisUrl!,
    token: redisToken!,
  })
  : null

// In-memory store for fallback
interface RateLimitStore {
  count: number
  resetAt: number
}

const memoryStore = new Map<string, RateLimitStore>()

// Cleanup old memory entries every 5 minutes
if (!isRedisConfigured) {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of memoryStore.entries()) {
      if (now > value.resetAt) {
        memoryStore.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed within the window
   */
  limit: number

  /**
   * Time window in seconds
   */
  windowSeconds: number

  /**
   * Optional custom identifier function
   * Default uses IP address
   */
  identifier?: (request: NextRequest) => string
}

/**
 * Rate limiter middleware for Next.js API routes
 * Uses Upstash Redis if configured, otherwise falls back to in-memory store
 */
export function rateLimit(config: RateLimitConfig) {
  const { limit, windowSeconds, identifier: customIdentifier } = config

  // Create Upstash Ratelimit instance if Redis is configured
  const ratelimit = isRedisConfigured
    ? new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      analytics: true,
    })
    : null

  return async (request: NextRequest): Promise<NextResponse | null> => {
    // Get identifier (IP address or custom)
    const identifier = customIdentifier
      ? customIdentifier(request)
      : getClientIdentifier(request)

    const key = isRedisConfigured
      ? identifier // Upstash handles namespacing
      : `${identifier}:${request.nextUrl.pathname}`

    // REDIS IMPLEMENTATION
    if (isRedisConfigured && ratelimit) {
      try {
        const { success, limit: rLimit, reset, remaining } = await ratelimit.limit(key)

        if (!success) {
          const retryAfter = Math.ceil((reset - Date.now()) / 1000)
          return NextResponse.json(
            {
              error: 'Too many requests',
              message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
              retryAfter
            },
            {
              status: 429,
              headers: {
                'X-RateLimit-Limit': rLimit.toString(),
                'X-RateLimit-Remaining': remaining.toString(),
                'X-RateLimit-Reset': reset.toString(),
                'Retry-After': retryAfter.toString()
              }
            }
          )
        }
        return null
      } catch (error) {
        console.error('Rate limit error:', error)
        // Fail open if Redis fails
        return null
      }
    }

    // IN-MEMORY FALLBACK IMPLEMENTATION
    const now = Date.now()
    const windowMs = windowSeconds * 1000

    // Get or create rate limit entry
    let entry = memoryStore.get(key)

    if (!entry || now > entry.resetAt) {
      // Create new entry or reset expired one
      entry = {
        count: 1,
        resetAt: now + windowMs
      }
      memoryStore.set(key, entry)
      return null
    }

    // Check if limit exceeded
    if (entry.count >= limit) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000)

      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
          retryAfter
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetAt.toString(),
            'Retry-After': retryAfter.toString()
          }
        }
      )
    }

    // Increment counter
    entry.count++
    return null
  }
}

/**
 * Get client identifier from request
 * Tries multiple headers to find the real IP address
 */
function getClientIdentifier(request: NextRequest): string {
  // Try various headers that might contain the client IP
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  // Fallback to a generic identifier
  return 'unknown'
}

/**
 * Rate limit by user ID (for authenticated endpoints)
 */
export function getUserIdentifier(userId: string): string {
  return `user:${userId}`
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  /**
   * Strict rate limit for sensitive operations
   * 5 requests per minute
   */
  strict: rateLimit({ limit: 5, windowSeconds: 60 }),

  /**
   * Standard rate limit for API endpoints
   * 30 requests per minute
   */
  standard: rateLimit({ limit: 30, windowSeconds: 60 }),

  /**
   * Generous rate limit for public endpoints
   * 100 requests per minute
   */
  generous: rateLimit({ limit: 100, windowSeconds: 60 }),

  /**
   * Very strict rate limit for authentication endpoints
   * 3 requests per 5 minutes
   */
  auth: rateLimit({ limit: 3, windowSeconds: 300 }),
}
