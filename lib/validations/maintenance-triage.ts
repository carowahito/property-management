import { z } from 'zod'

export const triageSchema = z.object({
  triageCategory: z.enum(['EMERGENCY', 'URGENT', 'ROUTINE', 'PREVENTIVE']),
  estimatedCost: z.number().min(0).optional(),
  scheduledDate: z.string().optional(), // ISO date string, used for PREVENTIVE
})

export const approveSchema = z.object({
  approvedBy: z.string().min(1, 'Approver name is required'),
  notes: z.string().optional(),
})

export type TriageInput = z.infer<typeof triageSchema>
export type ApproveInput = z.infer<typeof approveSchema>
