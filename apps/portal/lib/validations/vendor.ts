import { z } from 'zod'

export const createVendorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  specialization: z.string().min(2, 'Specialization is required'),
  rating: z.number().min(0).max(5).default(0),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED']).default('ACTIVE'),
  address: z.string().optional(),
  licenseNumber: z.string().optional(),
})

export const updateVendorSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  specialization: z.string().min(2).optional(),
  rating: z.number().min(0).max(5).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED']).optional(),
  address: z.string().optional(),
  licenseNumber: z.string().optional(),
  serviceAgreementUrl: z.string().optional(),
  serviceAgreementName: z.string().optional(),
})

export type CreateVendorInput = z.infer<typeof createVendorSchema>
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>
