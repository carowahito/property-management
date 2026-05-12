import { z } from 'zod'

export const createLandlordSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  idNumber: z.string().optional(),
  address: z.string().optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  taxId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
  managementFeePercent: z.number().min(0).max(100).optional(),
  tenantPlacementFee: z.number().min(0).max(12).optional(),
})

export const updateLandlordSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  idNumber: z.string().optional(),
  address: z.string().optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  taxId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  managementFeePercent: z.number().min(0).max(100).optional(),
  tenantPlacementFee: z.number().min(0).max(12).optional(),
})

export type CreateLandlordInput = z.infer<typeof createLandlordSchema>
export type UpdateLandlordInput = z.infer<typeof updateLandlordSchema>
