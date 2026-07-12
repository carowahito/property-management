import { z } from 'zod'

export const createPaymentSchema = z.object({
  tenantId: z.string().min(1, 'Tenant is required'),
  leaseId: z.string().optional(),
  propertyId: z.string().optional(),
  unitId: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['RENT', 'DEPOSIT', 'LATE_FEE', 'UTILITY', 'MAINTENANCE']).default('RENT'),
  // SOP 004 / BR-12: no cash. The platform must provide no means to record a cash receipt.
  method: z.enum(['BANK_TRANSFER', 'MPESA', 'CARD', 'CHEQUE']),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'FAILED', 'REFUNDED']).default('PENDING'),
  dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid due date',
  }),
  paidDate: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

export const updatePaymentSchema = z.object({
  tenantId: z.string().optional(),
  leaseId: z.string().optional(),
  amount: z.number().positive().optional(),
  type: z.enum(['RENT', 'DEPOSIT', 'LATE_FEE', 'UTILITY', 'MAINTENANCE']).optional(),
  // SOP 004 / BR-12: no cash.
  method: z.enum(['BANK_TRANSFER', 'MPESA', 'CARD', 'CHEQUE']).optional(),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'FAILED', 'REFUNDED']).optional(),
  dueDate: z.string().optional(),
  paidDate: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>
