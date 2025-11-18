import { z } from 'zod'

export const createInspectionSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  type: z.enum(['MOVE_IN', 'MOVE_OUT', 'QUARTERLY', 'ANNUAL', 'MAINTENANCE']),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date',
  }),
  inspector: z.string().min(2, 'Inspector name is required'),
  findings: z.string().optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']).default('SCHEDULED'),
})

export const updateInspectionSchema = z.object({
  propertyId: z.string().optional(),
  type: z.enum(['MOVE_IN', 'MOVE_OUT', 'QUARTERLY', 'ANNUAL', 'MAINTENANCE']).optional(),
  date: z.string().optional(),
  inspector: z.string().min(2).optional(),
  findings: z.string().optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']).optional(),
})

export type CreateInspectionInput = z.infer<typeof createInspectionSchema>
export type UpdateInspectionInput = z.infer<typeof updateInspectionSchema>
