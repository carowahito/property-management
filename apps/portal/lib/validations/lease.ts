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
  templateId: z.string().optional(),
  noticePeriod: z.number().int().positive().default(1),
  rentEscalation: z.number().min(0).max(100).optional(),
  petPolicy: z.string().optional(),
  specialConditions: z.string().optional(),
  unitId: z.string().optional(),
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
  templateId: z.string().optional(),
  noticePeriod: z.number().int().positive().optional(),
  rentEscalation: z.number().min(0).max(100).optional(),
  rentDueDay: z.number().int().min(1).max(31).optional(),
  gracePeriodDays: z.number().int().min(0).optional(),
  latePenaltyPerDay: z.number().min(0).optional(),
  petPolicy: z.string().optional(),
  specialConditions: z.string().optional(),
  unitId: z.string().optional(),
  sentForSigning: z.boolean().optional(),
  tenantSignedAt: z.string().optional(),
  landlordSignedAt: z.string().optional(),
  tenantSignature: z.string().optional(),
  landlordSignature: z.string().optional(),
  // Second tenant
  tenant2Name: z.string().optional(),
  tenant2IdNumber: z.string().optional(),
  tenant2Email: z.string().optional(),
  tenant2Phone: z.string().optional(),
  // Payment methods
  mpesaTill: z.string().optional(),
  bankDetails: z.string().optional(),
})

export type CreateLeaseInput = z.infer<typeof createLeaseSchema>
export type UpdateLeaseInput = z.infer<typeof updateLeaseSchema>
