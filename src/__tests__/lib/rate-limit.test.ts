import { describe, it, expect } from 'vitest'
import { getUserIdentifier } from '@/lib/rate-limit'

describe('Rate Limit Utilities', () => {
  describe('getUserIdentifier', () => {
    it('should format user ID correctly', () => {
      const id = getUserIdentifier('user-123')
      expect(id).toBe('user:user-123')
    })

    it('should handle UUID format', () => {
      const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
      const id = getUserIdentifier(uuid)
      expect(id).toBe(`user:${uuid}`)
    })

    it('should handle empty string', () => {
      const id = getUserIdentifier('')
      expect(id).toBe('user:')
    })
  })
})
