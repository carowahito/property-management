import { z } from 'zod'

export const createArrearsSchema = z.object({
  leaseId: z.string().min(1, 'Lease is required'),
  tenantId: z.string().min(1, 'Tenant is required'),
  propertyId: z.string().min(1, 'Property is required'),
  rentAmount: z.number().positive('Rent amount must be positive'),
  amountOwed: z.number().positive('Amount owed must be positive'),
  daysOverdue: z.number().int().min(0).default(0),
  notes: z.string().optional(),
})

export const updateArrearsSchema = z.object({
  amountOwed: z.number().positive().optional(),
  daysOverdue: z.number().int().min(0).optional(),
  phoneCallNotes: z.string().optional(),
  notes: z.string().optional(),
})

export const escalateArrearsSchema = z.object({
  notes: z.string().optional(),
})

export const resolveArrearsSchema = z.object({
  resolution: z.enum(['PAID', 'PAYMENT_PLAN', 'EVICTION', 'VACATED'], {
    required_error: 'Resolution type is required',
  }),
  notes: z.string().optional(),
})

export const recordPhoneCallSchema = z.object({
  phoneCallNotes: z.string().min(1, 'Phone call notes are required'),
})

export type CreateArrearsInput = z.infer<typeof createArrearsSchema>
export type UpdateArrearsInput = z.infer<typeof updateArrearsSchema>
export type EscalateArrearsInput = z.infer<typeof escalateArrearsSchema>
export type ResolveArrearsInput = z.infer<typeof resolveArrearsSchema>
export type RecordPhoneCallInput = z.infer<typeof recordPhoneCallSchema>
