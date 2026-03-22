import { z } from 'zod'

export const createContractorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  trade: z.enum(['plumbing', 'electrical', 'carpentry', 'painting', 'security', 'general', 'roofing', 'masonry', 'hvac', 'landscaping']),
  businessRegistration: z.string().optional(),
  kraPin: z.string().optional(),
  insurance: z.boolean().default(false),
  isVetted: z.boolean().default(false),
})

export const updateContractorSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(10).optional(),
  trade: z.enum(['plumbing', 'electrical', 'carpentry', 'painting', 'security', 'general', 'roofing', 'masonry', 'hvac', 'landscaping']).optional(),
  businessRegistration: z.string().optional(),
  kraPin: z.string().optional(),
  insurance: z.boolean().optional(),
  isVetted: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

export const rateContractorSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
})

export type CreateContractorInput = z.infer<typeof createContractorSchema>
export type UpdateContractorInput = z.infer<typeof updateContractorSchema>
export type RateContractorInput = z.infer<typeof rateContractorSchema>
