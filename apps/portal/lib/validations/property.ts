import { z } from 'zod'

export const createPropertySchema = z.object({
  name: z.string().min(3, 'Property name must be at least 3 characters').max(200),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default('Kenya'),
  type: z.enum(['APARTMENT', 'HOUSE', 'CONDO', 'TOWNHOUSE', 'STUDIO']),
  totalUnits: z.number().int().min(1, 'Property must have at least 1 unit').default(1),
  yearBuilt: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).default('ACTIVE'),
  description: z.string().optional(),
  landlordId: z.string().min(1, 'Landlord is required'),
})

export const updatePropertySchema = z.object({
  name: z.string().min(3).max(200).optional(),
  address: z.string().min(5).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  type: z.enum(['APARTMENT', 'HOUSE', 'CONDO', 'TOWNHOUSE', 'STUDIO']).optional(),
  totalUnits: z.number().int().min(1).optional(),
  yearBuilt: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).optional(),
  description: z.string().optional(),
  landlordId: z.string().optional(),
})

export type CreatePropertyInput = z.infer<typeof createPropertySchema>
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>
