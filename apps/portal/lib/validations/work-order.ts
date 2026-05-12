import { z } from 'zod'

export const createWorkOrderSchema = z.object({
  maintenanceRequestId: z.string().optional(),
  vendorId: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  status: z.enum(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('PENDING'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  estimatedCost: z.number().min(0).optional(),
  actualCost: z.number().min(0).optional(),
  scheduledDate: z.string().optional(),
  completedDate: z.string().optional(),
})

export const updateWorkOrderSchema = z.object({
  maintenanceRequestId: z.string().optional(),
  vendorId: z.string().optional(),
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  status: z.enum(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  estimatedCost: z.number().min(0).optional(),
  actualCost: z.number().min(0).optional(),
  scheduledDate: z.string().optional(),
  completedDate: z.string().optional(),
})

export type CreateWorkOrderInput = z.infer<typeof createWorkOrderSchema>
export type UpdateWorkOrderInput = z.infer<typeof updateWorkOrderSchema>
