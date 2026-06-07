import { z } from 'zod'

export const createTenantSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  idNumber: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  propertyId: z.string().min(1, 'Property is required'),
  unitId: z.string().optional(),
  unit: z.string().optional(),
  moveInDate: z.string().optional(),
  moveOutDate: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'EVICTED']).default('ACTIVE'),
})

export const updateTenantSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  idNumber: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  propertyId: z.string().optional(),
  unit: z.string().optional(),
  moveInDate: z.string().optional(),
  moveOutDate: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'EVICTED']).optional(),
})

export type CreateTenantInput = z.infer<typeof createTenantSchema>
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>
