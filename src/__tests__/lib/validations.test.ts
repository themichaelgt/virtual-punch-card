import { describe, it, expect } from 'vitest'
import {
  punchSchema,
  createEventSchema,
  updateEventSchema,
  validateRewardSchema,
  registerTagSchema,
  claimTagsSchema,
  createOrderSchema,
  formatValidationError,
} from '@/lib/validations'

describe('Validation Schemas', () => {
  describe('punchSchema', () => {
    it('should validate valid punch data', () => {
      const validData = {
        token: 'abc123',
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
        },
      }
      const result = punchSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate punch data without location', () => {
      const validData = {
        token: 'abc123',
      }
      const result = punchSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty token', () => {
      const invalidData = {
        token: '',
      }
      const result = punchSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject missing token', () => {
      const invalidData = {}
      const result = punchSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject invalid location format', () => {
      const invalidData = {
        token: 'abc123',
        location: {
          latitude: 'invalid',
          longitude: -122.4194,
        },
      }
      const result = punchSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('createEventSchema', () => {
    it('should validate valid event data', () => {
      const validData = {
        name: 'Coffee Loyalty',
        description: 'Buy 10 get 1 free',
        targetPunches: 10,
        cooldownHours: 24,
        maxPunchesPerDay: 1,
        allowRepeat: true,
      }
      const result = createEventSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate event with minimal data', () => {
      const validData = {
        name: 'Simple Campaign',
        targetPunches: 5,
      }
      const result = createEventSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty name', () => {
      const invalidData = {
        name: '',
        targetPunches: 10,
      }
      const result = createEventSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject targetPunches less than 1', () => {
      const invalidData = {
        name: 'Test',
        target_punches: 0,
      }
      const result = createEventSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject targetPunches greater than 100', () => {
      const invalidData = {
        name: 'Test',
        target_punches: 101,
      }
      const result = createEventSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject cooldownHours greater than max', () => {
      const invalidData = {
        name: 'Test',
        target_punches: 10,
        cooldown_hours: 200, // Max is 168
      }
      const result = createEventSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('updateEventSchema', () => {
    it('should validate event updates', () => {
      const validData = {
        name: 'Updated Name',
        description: 'Updated description',
        status: 'active',
      }
      const result = updateEventSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate partial updates', () => {
      const validData = {
        name: 'Updated Name',
      }
      const result = updateEventSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept valid status values', () => {
      const statuses = ['active', 'paused', 'ended']
      statuses.forEach((status) => {
        const result = updateEventSchema.safeParse({ status })
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid status', () => {
      const invalidData = {
        status: 'invalid-status',
      }
      const result = updateEventSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('validateRewardSchema', () => {
    it('should validate reward code', () => {
      const validData = {
        code: 'ABC12345',
      }
      const result = validateRewardSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty code', () => {
      const invalidData = {
        code: '',
      }
      const result = validateRewardSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('registerTagSchema', () => {
    it('should validate tag registration', () => {
      const validData = {
        activationCode: 'VPC-1234-5678',
      }
      const result = registerTagSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty activation code', () => {
      const invalidData = {
        activationCode: '',
      }
      const result = registerTagSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('claimTagsSchema', () => {
    const validEventId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

    it('should validate tag claim', () => {
      const validData = {
        eventId: validEventId,
        quantity: 5,
      }
      const result = claimTagsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject quantity less than 1', () => {
      const invalidData = {
        eventId: validEventId,
        quantity: 0,
      }
      const result = claimTagsSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject quantity greater than 100', () => {
      const invalidData = {
        eventId: validEventId,
        quantity: 101,
      }
      const result = claimTagsSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('createOrderSchema', () => {
    it('should validate order creation', () => {
      const validData = {
        quantity: 10, // Must be 3, 5, or 10
        shipping_address: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zip: '94102',
          country: 'US',
        },
      }
      const result = createOrderSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid quantity', () => {
      const invalidData = {
        quantity: 25, // Must be exactly 3, 5, or 10
        shipping_address: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zip: '94102',
          country: 'US',
        },
      }
      const result = createOrderSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject missing shipping fields', () => {
      const invalidData = {
        quantity: 10,
      }
      const result = createOrderSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('formatValidationError', () => {
    it('should format single validation error', () => {
      const result = punchSchema.safeParse({ token: '' })
      if (!result.success) {
        const formatted = formatValidationError(result.error)
        expect(formatted).toBe('Token is required')
        expect(typeof formatted).toBe('string')
      }
    })

    it('should format multiple validation errors', () => {
      const result = createEventSchema.safeParse({
        name: '',
        target_punches: 0,
      })
      if (!result.success) {
        const formatted = formatValidationError(result.error)
        expect(formatted.length).toBeGreaterThan(0)
        expect(typeof formatted).toBe('string')
      }
    })
  })
})
