// src/lib/rate-limit.ts
import { NextRequest, NextResponse } from 'next/server'

interface RateLimitStore {
  count: number
  resetAt: number
}

// In-memory store for rate limiting
// Note: This will reset on server restart. For production, consider Redis or Upstash
const store = new Map<string, RateLimitStore>()

// Cleanup old entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of store.entries()) {
    if (now > value.resetAt) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)

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
 *
 * @example
 * ```ts
 * const limiter = rateLimit({ limit: 10, windowSeconds: 60 })
 *
 * export async function POST(request: NextRequest) {
 *   const rateLimitResult = await limiter(request)
 *   if (rateLimitResult) return rateLimitResult
 *
 *   // Your route logic here
 * }
 * ```
 */
export function rateLimit(config: RateLimitConfig) {
  const { limit, windowSeconds, identifier: customIdentifier } = config

  return async (request: NextRequest): Promise<NextResponse | null> => {
    // Get identifier (IP address or custom)
    const identifier = customIdentifier
      ? customIdentifier(request)
      : getClientIdentifier(request)

    const now = Date.now()
    const windowMs = windowSeconds * 1000
    const key = `${identifier}:${request.nextUrl.pathname}`

    // Get or create rate limit entry
    let entry = store.get(key)

    if (!entry || now > entry.resetAt) {
      // Create new entry or reset expired one
      entry = {
        count: 1,
        resetAt: now + windowMs
      }
      store.set(key, entry)

      // Request is allowed
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

    // Request is allowed
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
export function getUserIdentifier(userId: string, request: NextRequest): string {
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
