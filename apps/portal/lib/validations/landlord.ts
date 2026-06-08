import { z } from 'zod'

const landlordMemberSchema = z.object({
  name: z.string().min(1),
  idNumber: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  nationality: z.string().optional(),
  countryOfResidence: z.string().optional(),
  ownershipPercent: z.number().min(0).max(100).optional(),
  isPrimary: z.boolean().default(false),
})

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
  type: z.enum(['INDIVIDUAL', 'COMPANY', 'JOINT_OWNERSHIP']).default('INDIVIDUAL'),
  managementFeePercent: z.number().min(0).optional(),
  managementFeeType: z.enum(['PERCENTAGE', 'FIXED']).default('PERCENTAGE'),
  tenantPlacementFee: z.number().min(0).optional(),
  tenantPlacementFeeType: z.enum(['MONTHS', 'PERCENTAGE']).default('MONTHS'),
  members: z.array(landlordMemberSchema).optional(),
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
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED']).optional(),
  type: z.enum(['INDIVIDUAL', 'COMPANY', 'JOINT_OWNERSHIP']).optional(),
  managementFeePercent: z.number().min(0).optional(),
  managementFeeType: z.enum(['PERCENTAGE', 'FIXED']).optional(),
  tenantPlacementFee: z.number().min(0).optional(),
  tenantPlacementFeeType: z.enum(['MONTHS', 'PERCENTAGE']).optional(),
  members: z.array(landlordMemberSchema).optional(),
})

export type CreateLandlordInput = z.infer<typeof createLandlordSchema>
export type UpdateLandlordInput = z.infer<typeof updateLandlordSchema>
