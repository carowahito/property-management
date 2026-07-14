import { z } from 'zod'

const lineAction = z.enum(['REPAIR', 'REPLACE', 'CLEAN'])
const lineResponsibility = z.enum(['TENANT', 'LANDLORD', 'SHARED'])

export const createQuoteLineSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  room: z.string().optional().nullable(),
  action: lineAction.default('REPAIR'),
  responsibility: lineResponsibility.default('TENANT'),
  contractorId: z.string().optional().nullable(),
  contractorName: z.string().optional().nullable(),
  contractorContact: z.string().optional().nullable(),
  unitCost: z.number().min(0, 'Unit cost cannot be negative').default(0),
  quantity: z.number().positive('Quantity must be positive').default(1),
  tenantCharge: z.number().min(0).optional(), // only honoured for SHARED lines
  evidenceUrl: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
})

export const updateQuoteLineSchema = createQuoteLineSchema.partial()

export const updateQuoteSchema = z.object({
  agentNotes: z.string().optional().nullable(),
  agentSignature: z.string().optional().nullable(),
})

export const approveQuoteSchema = z.object({
  tenantSignature: z.string().optional().nullable(),
  via: z.enum(['IN_PERSON', 'IN_APP', 'EMAIL']).default('IN_APP'),
})

export const disputeQuoteSchema = z.object({
  reason: z.string().min(1, 'A reason is required'),
})

export type CreateQuoteLineInput = z.infer<typeof createQuoteLineSchema>
export type UpdateQuoteLineInput = z.infer<typeof updateQuoteLineSchema>
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>
export type ApproveQuoteInput = z.infer<typeof approveQuoteSchema>
export type DisputeQuoteInput = z.infer<typeof disputeQuoteSchema>
