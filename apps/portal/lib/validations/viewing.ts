import { z } from 'zod'

export const createViewingSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  visitorName: z.string().min(2, 'Visitor name must be at least 2 characters'),
  visitorEmail: z.string().email('Invalid email address'),
  visitorPhone: z.string().min(10, 'Phone number must be at least 10 characters'),
  scheduledDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid scheduled date',
  }),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).default('SCHEDULED'),
  notes: z.string().optional(),
})

export const updateViewingSchema = z.object({
  propertyId: z.string().optional(),
  visitorName: z.string().min(2).optional(),
  visitorEmail: z.string().email().optional(),
  visitorPhone: z.string().min(10).optional(),
  scheduledDate: z.string().optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  notes: z.string().optional(),
})

export type CreateViewingInput = z.infer<typeof createViewingSchema>
export type UpdateViewingInput = z.infer<typeof updateViewingSchema>
