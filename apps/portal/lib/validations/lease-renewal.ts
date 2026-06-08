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

const healthCheckDimensionSchema = z.object({
  name: z.string(),
  score: z.enum(['GREEN', 'AMBER', 'RED']),
  notes: z.string().optional(),
})

const healthCheckOutcomeSchema = z.object({
  overallRisk: z.enum(['GREEN', 'AMBER', 'RED']),
  redCount: z.number().int().min(0),
  dimensions: z.array(healthCheckDimensionSchema),
})

const contactAttemptSchema = z.object({
  date: z.string(),
  method: z.string(),
  outcome: z.string(),
  notes: z.string().optional(),
})

export const updateLeaseRenewalSchema = z.object({
  // Step 1 — health check
  healthCheckOutcome: healthCheckOutcomeSchema.optional(),
  directorEscalated: z.boolean().optional(),

  // Step 2 — landlord consultation
  landlordIntent: z.enum(['RENEW_SAME', 'RENEW_NEW_RENT', 'NOT_RENEWING']).optional(),
  rentReviewBasis: z.enum(['CPI_LINKED', 'FIXED_PERCENT', 'NEGOTIATED']).optional(),
  rentReviewFormula: z.string().optional(),
  landlordWrittenAuthority: z.boolean().optional(),

  // Step 3 — rent review
  proposedRent: z.number().positive().optional(),
  rentIncreasePercent: z.number().min(0).max(100).optional(),
  cpiReference: z.string().optional(),
  marketComparables: z
    .array(
      z.object({
        property: z.string(),
        rent: z.number(),
        source: z.string(),
      })
    )
    .optional(),

  // Step 4 — notice
  responseDeadline: z.string().optional(),
  rentEffectiveDate: z.string().optional(),

  // Tenant response
  tenantResponse: z.enum(['ACCEPTED', 'NEGOTIATING', 'DECLINED']).optional(),

  // Step 6 — no-response tracking
  contactAttempts: z.array(contactAttemptSchema).optional(),
  noResponseNoticeAt: z.string().optional(),

  // Step 7 — periodic continuation
  periodicAuthorisedAt: z.string().optional(),
  periodicTerms: z
    .object({
      rent: z.number().positive(),
      noticePeriodMonths: z.number().int().positive(),
    })
    .optional(),
  periodicReviewReminderAt: z.string().optional(),

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
export type HealthCheckOutcome = z.infer<typeof healthCheckOutcomeSchema>
export type ContactAttempt = z.infer<typeof contactAttemptSchema>
