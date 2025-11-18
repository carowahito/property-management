import { z } from 'zod'

export const createPayoutSchema = z.object({
  landlordId: z.string().min(1, 'Landlord is required'),
  amount: z.number().positive('Amount must be positive'),
  period: z.string().min(1, 'Period is required (e.g., "January 2024")'),
  status: z.enum(['PENDING', 'PROCESSING', 'PAID', 'FAILED']).default('PENDING'),
  method: z.enum(['CASH', 'BANK_TRANSFER', 'MPESA', 'CARD', 'CHEQUE']),
  reference: z.string().optional(),
  notes: z.string().optional(),
  paidDate: z.string().optional(),
})

export const updatePayoutSchema = z.object({
  landlordId: z.string().optional(),
  amount: z.number().positive().optional(),
  period: z.string().optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'PAID', 'FAILED']).optional(),
  method: z.enum(['CASH', 'BANK_TRANSFER', 'MPESA', 'CARD', 'CHEQUE']).optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
  paidDate: z.string().optional(),
})

export type CreatePayoutInput = z.infer<typeof createPayoutSchema>
export type UpdatePayoutInput = z.infer<typeof updatePayoutSchema>
