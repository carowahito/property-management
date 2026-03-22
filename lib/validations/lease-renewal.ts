import { z } from 'zod'

export const createLeaseRenewalSchema = z.object({
  leaseId: z.string().min(1, 'Lease is required'),
  tenantId: z.string().min(1, 'Tenant is required'),
  propertyId: z.string().min(1, 'Property is required'),
  currentRent: z.number().positive('Current rent must be positive'),
  leaseEndDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid lease end date',
  }),
  renewalNotes: z.string().optional(),
})

export const updateLeaseRenewalSchema = z.object({
  landlordIntent: z.enum(['RENEW_SAME', 'RENEW_NEW_RENT', 'NOT_RENEWING']).optional(),
  proposedRent: z.number().positive().optional(),
  rentIncreasePercent: z.number().min(0).max(100).optional(),
  marketComparables: z
    .array(
      z.object({
        property: z.string(),
        rent: z.number(),
        source: z.string(),
      })
    )
    .optional(),
  tenantResponse: z.enum(['ACCEPTED', 'NEGOTIATING', 'DECLINED']).optional(),
  status: z
    .enum([
      'PENDING',
      'LANDLORD_REVIEW',
      'RENT_REVIEW',
      'TENANT_NOTIFIED',
      'ACCEPTED',
      'DECLINED',
      'RENEWED',
      'EXPIRED',
      'MONTH_TO_MONTH',
    ])
    .optional(),
  renewalNotes: z.string().optional(),
})

export const renewLeaseSchema = z.object({
  newMonthlyRent: z.number().positive('New monthly rent must be positive'),
  newStartDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid start date',
  }),
  newEndDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid end date',
  }),
  securityDeposit: z.number().min(0).optional(),
  terms: z.string().optional(),
})

export type CreateLeaseRenewalInput = z.infer<typeof createLeaseRenewalSchema>
export type UpdateLeaseRenewalInput = z.infer<typeof updateLeaseRenewalSchema>
export type RenewLeaseInput = z.infer<typeof renewLeaseSchema>
