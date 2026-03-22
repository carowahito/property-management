import { z } from 'zod'

export const createDepositSchema = z.object({
  tenantId: z.string().min(1, 'Tenant is required'),
  leaseId: z.string().min(1, 'Lease is required'),
  propertyId: z.string().min(1, 'Property is required'),
  amount: z.number().positive('Amount must be positive'),
  paymentDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid payment date',
  }),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'MPESA', 'CARD', 'CHEQUE']).default('MPESA'),
  paymentReference: z.string().optional(),
})

export const updateDepositSchema = z.object({
  amount: z.number().positive().optional(),
  paymentDate: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'MPESA', 'CARD', 'CHEQUE']).optional(),
  paymentReference: z.string().optional(),
  status: z.enum(['HELD', 'UNDER_REVIEW', 'PARTIALLY_REFUNDED', 'REFUNDED', 'FORFEITED']).optional(),
  settlementNotes: z.string().optional(),
})

const deductionItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Deduction amount must be positive'),
  evidenceUrl: z.string().optional(),
})

export const settleDepositSchema = z.object({
  deductions: z.array(deductionItemSchema).default([]),
  refundReference: z.string().optional(),
  settlementNotes: z.string().optional(),
})

export type CreateDepositInput = z.infer<typeof createDepositSchema>
export type UpdateDepositInput = z.infer<typeof updateDepositSchema>
export type SettleDepositInput = z.infer<typeof settleDepositSchema>
