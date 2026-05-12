import { z } from 'zod'

export const createEnquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).default('OPEN'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assignedTo: z.string().optional(),
  propertyId: z.string().optional(),
  resolvedAt: z.string().optional(),
})

export const updateEnquirySchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  subject: z.string().min(3).max(200).optional(),
  message: z.string().min(10).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assignedTo: z.string().optional(),
  propertyId: z.string().optional(),
  resolvedAt: z.string().optional(),
})

export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>
export type UpdateEnquiryInput = z.infer<typeof updateEnquirySchema>
