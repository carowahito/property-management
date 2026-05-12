import { z } from 'zod'

export const generateStatementSchema = z.object({
  landlordId: z.string().min(1, 'Landlord is required'),
  propertyId: z.string().optional().nullable(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  managementFeeRate: z.number().min(0).max(100).default(10),
})

export const generateAllStatementsSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  managementFeeRate: z.number().min(0).max(100).default(10),
})

export const updateStatementStatusSchema = z.object({
  status: z.enum(['DRAFT', 'FINALIZED', 'SENT']),
})

export type GenerateStatementInput = z.infer<typeof generateStatementSchema>
export type GenerateAllStatementsInput = z.infer<typeof generateAllStatementsSchema>
export type UpdateStatementStatusInput = z.infer<typeof updateStatementStatusSchema>
