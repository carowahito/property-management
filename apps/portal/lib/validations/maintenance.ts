import { z } from 'zod'

export const createMaintenanceRequestSchema = z.object({
  tenantId: z.string().min(1, 'Tenant is required'),
  propertyId: z.string().min(1, 'Property is required'),
  unit: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('PENDING'),
  category: z.string().optional(),
  resolvedAt: z.string().optional(),
})

export const updateMaintenanceRequestSchema = z.object({
  tenantId: z.string().optional(),
  propertyId: z.string().optional(),
  unit: z.string().optional(),
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  category: z.string().optional(),
  resolvedAt: z.string().optional(),
})

export type CreateMaintenanceRequestInput = z.infer<typeof createMaintenanceRequestSchema>
export type UpdateMaintenanceRequestInput = z.infer<typeof updateMaintenanceRequestSchema>
