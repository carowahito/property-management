import { z } from 'zod'

export const createLeaseSchema = z.object({
  tenantId: z.string().min(1, 'Tenant is required'),
  propertyId: z.string().min(1, 'Property is required'),
  unit: z.string().optional(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid start date',
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid end date',
  }),
  monthlyRent: z.number().positive('Monthly rent must be positive'),
  securityDeposit: z.number().min(0, 'Security deposit cannot be negative'),
  status: z.enum(['ACTIVE', 'EXPIRED', 'TERMINATED', 'PENDING']).default('ACTIVE'),
  terms: z.string().optional(),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
})

export const updateLeaseSchema = z.object({
  tenantId: z.string().optional(),
  propertyId: z.string().optional(),
  unit: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  monthlyRent: z.number().positive().optional(),
  securityDeposit: z.number().min(0).optional(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'TERMINATED', 'PENDING']).optional(),
  terms: z.string().optional(),
})

export type CreateLeaseInput = z.infer<typeof createLeaseSchema>
export type UpdateLeaseInput = z.infer<typeof updateLeaseSchema>
