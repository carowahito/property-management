import { z } from 'zod'

export const createMoveInChecklistSchema = z.object({
  leaseId: z.string().min(1, 'Lease is required'),
  tenantId: z.string().min(1, 'Tenant is required'),
  propertyId: z.string().min(1, 'Property is required'),
  unitId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const updateMoveInChecklistSchema = z.object({
  agreementSigned: z.boolean().optional(),
  depositCleared: z.boolean().optional(),
  firstMonthCleared: z.boolean().optional(),
  inspectionDone: z.boolean().optional(),
  metersLogged: z.boolean().optional(),
  inventorySigned: z.boolean().optional(),
  profileActive: z.boolean().optional(),
  welcomePackSent: z.boolean().optional(),
  keysHandedOver: z.boolean().optional(),
  electricityMeterReading: z.string().optional().nullable(),
  waterMeterReading: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
})

export type CreateMoveInChecklistInput = z.infer<typeof createMoveInChecklistSchema>
export type UpdateMoveInChecklistInput = z.infer<typeof updateMoveInChecklistSchema>
