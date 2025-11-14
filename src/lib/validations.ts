// src/lib/validations.ts
import { z } from 'zod'

// ==================== PUNCH API ====================

export const punchSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }).optional()
})

export type PunchInput = z.infer<typeof punchSchema>

// ==================== BUSINESS/EVENTS API ====================

export const rulesSchema = z.object({
  target_punches: z.number().int().min(1).max(100),
  cooldown_hours: z.number().int().min(0).max(168), // Max 1 week
  max_punches_per_day: z.number().int().min(0).max(50),
  allow_repeat: z.boolean()
})

export const createEventSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(200),
  description: z.string().max(1000).optional().nullable(),
  target_punches: z.coerce.number().int().min(1).max(100).default(5),
  cooldown_hours: z.coerce.number().int().min(0).max(168).default(0),
  max_punches_per_day: z.coerce.number().int().min(0).max(50).default(10),
  allow_repeat: z.boolean().default(true)
})

export const updateEventSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  status: z.enum(['active', 'paused', 'ended']).optional(),
  rules_json: rulesSchema.optional()
})

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type Rules = z.infer<typeof rulesSchema>

// ==================== BUSINESS/VALIDATE-REWARD API ====================

export const validateRewardSchema = z.object({
  code: z.string().min(1, 'Reward code is required').toUpperCase()
})

export type ValidateRewardInput = z.infer<typeof validateRewardSchema>

// ==================== BUSINESS/TAGS/REGISTER API ====================

export const registerTagSchema = z.object({
  activationCode: z.string().min(1, 'Activation code is required')
})

export type RegisterTagInput = z.infer<typeof registerTagSchema>

// ==================== BUSINESS/TAGS/CLAIM API ====================

export const claimTagsSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  quantity: z.number().int().min(1).max(100)
})

export type ClaimTagsInput = z.infer<typeof claimTagsSchema>

// ==================== BUSINESS/TAGS/UPDATE API ====================

export const updateTagSchema = z.object({
  tagId: z.string().uuid('Invalid tag ID'),
  status: z.enum(['active', 'disabled', 'stolen'])
})

export type UpdateTagInput = z.infer<typeof updateTagSchema>

// ==================== BUSINESS/ORDERS API ====================

export const shippingAddressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip: z.string().min(5, 'ZIP code is required'),
  country: z.string().min(2, 'Country is required').default('US')
}).strict()

export const createOrderSchema = z.object({
  quantity: z.number().int().refine(
    (val) => [3, 5, 10].includes(val),
    { message: 'Quantity must be 3, 5, or 10' }
  ),
  shipping_address: shippingAddressSchema,
  notes: z.string().max(500).optional().nullable()
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type ShippingAddress = z.infer<typeof shippingAddressSchema>

// ==================== BUSINESS/CREATE-ESTABLISHMENT API ====================

export const createEstablishmentSchema = z.object({
  name: z.string().min(1, 'Business name is required').max(200),
  ownerName: z.string().min(1, 'Owner name is required').max(100),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  userEmail: z.string().email('Invalid email address'),
  userId: z.string().uuid('Invalid user ID')
})

export type CreateEstablishmentInput = z.infer<typeof createEstablishmentSchema>

// ==================== HELPER FUNCTION ====================

/**
 * Validates request body against a Zod schema
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns Validation result with success boolean and parsed data or error
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return { success: false, error: result.error }
}

/**
 * Formats Zod validation errors into a user-friendly message
 * @param error - The Zod error object
 * @returns A formatted error message
 */
export function formatValidationError(error: z.ZodError<unknown>): string {
  const firstError = error.issues[0]
  return firstError?.message || 'Validation failed'
}
