import { z } from 'zod'

export const createLeadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  type: z.enum(['TENANT', 'LANDLORD', 'BUYER', 'SELLER']).default('TENANT'),
  source: z
    .enum(['WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA', 'WALK_IN', 'EMAIL', 'PHONE'])
    .default('WEBSITE'),
  budget: z.string().optional(),
  moveInDate: z.string().optional(),
  preferences: z.string().optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
})

export const updateLeadSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST']).optional(),
  type: z.enum(['TENANT', 'LANDLORD', 'BUYER', 'SELLER']).optional(),
  source: z
    .enum(['WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA', 'WALK_IN', 'EMAIL', 'PHONE'])
    .optional(),
  budget: z.string().optional(),
  moveInDate: z.string().optional(),
  preferences: z.string().optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
})

export type CreateLeadInput = z.infer<typeof createLeadSchema>
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>
