import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { rateLimit } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'

describe('Rate Limit Fallback (In-Memory)', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should allow requests within limit', async () => {
        const limiter = rateLimit({ limit: 2, windowSeconds: 10 })
        const req = new NextRequest('http://localhost/api/test-allow')

        // First request
        const res1 = await limiter(req)
        expect(res1).toBeNull()

        // Second request
        const res2 = await limiter(req)
        expect(res2).toBeNull()
    })

    it('should block requests exceeding limit', async () => {
        const limiter = rateLimit({ limit: 1, windowSeconds: 10 })
        const req = new NextRequest('http://localhost/api/test-block')

        // First request (allowed)
        await limiter(req)

        // Second request (blocked)
        const res = await limiter(req)
        expect(res).toBeInstanceOf(NextResponse)
        expect(res?.status).toBe(429)
    })

    it('should reset limit after window expires', async () => {
        const limiter = rateLimit({ limit: 1, windowSeconds: 1 })
        const req = new NextRequest('http://localhost/api/test-reset')

        // Set initial time
        vi.setSystemTime(new Date(1600000000000))

        // First request (allowed)
        await limiter(req)

        // Advance time by 1.1 seconds
        vi.setSystemTime(new Date(1600000001100))

        // Second request (allowed after reset)
        const res = await limiter(req)
        expect(res).toBeNull()
    })
})
