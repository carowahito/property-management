import { z } from 'zod'

// Room assessment schema
const roomAssessmentSchema = z.object({
  room: z.string().min(1, 'Room name is required'),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR']),
  notes: z.string().optional().default(''),
  photos: z.array(z.string()).optional().default([]),
})

// Maintenance item schema
const maintenanceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  room: z.string().optional(),
})

// Violation schema
const violationSchema = z.object({
  type: z.string().min(1, 'Violation type is required'),
  description: z.string().min(1, 'Description is required'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
})

export const createInspectionSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  unitId: z.string().optional().nullable(),
  tenantId: z.string().optional().nullable(),
  leaseId: z.string().optional().nullable(),
  type: z.enum(['MOVE_IN', 'POST_MOVE_IN', 'THREE_MONTH', 'ROUTINE_6_MONTH', 'PRE_MOVE_OUT', 'MOVE_OUT', 'ANNUAL']),
  scheduledDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date',
  }),
  inspector: z.string().optional().nullable(),
  propertyCategory: z.enum(['RESIDENTIAL', 'COMMERCIAL']).optional().nullable(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('SCHEDULED'),
})

export const updateInspectionSchema = z.object({
  propertyId: z.string().optional(),
  unitId: z.string().optional().nullable(),
  tenantId: z.string().optional().nullable(),
  leaseId: z.string().optional().nullable(),
  type: z.enum(['MOVE_IN', 'POST_MOVE_IN', 'THREE_MONTH', 'ROUTINE_6_MONTH', 'PRE_MOVE_OUT', 'MOVE_OUT', 'ANNUAL']).optional(),
  scheduledDate: z.string().optional(),
  completedDate: z.string().optional().nullable(),
  inspector: z.string().optional().nullable(),
  propertyCategory: z.enum(['RESIDENTIAL', 'COMMERCIAL']).optional().nullable(),
  overallCondition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR']).optional().nullable(),
  summary: z.string().optional().nullable(),
  rooms: z.any().optional().nullable(),
  followUpRequired: z.boolean().optional(),
  maintenanceItems: z.array(maintenanceItemSchema).optional().nullable(),
  violations: z.array(violationSchema).optional().nullable(),
  inspectorSignature: z.string().optional().nullable(),
  inspectorSignedAt: z.string().optional().nullable(),
  tenantSignature: z.string().optional().nullable(),
  tenantSignedAt: z.string().optional().nullable(),
  landlordSignature: z.string().optional().nullable(),
  landlordSignedAt: z.string().optional().nullable(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ARCHIVED']).optional(),
})

export const completeInspectionSchema = z.object({
  overallCondition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR'], {
    required_error: 'Overall condition is required to complete inspection',
  }),
  summary: z.string().optional().nullable(),
  rooms: z.any().optional().nullable(),
  maintenanceItems: z.array(maintenanceItemSchema).optional().nullable(),
  violations: z.array(violationSchema).optional().nullable(),
  followUpRequired: z.boolean().optional(),
  inspectorSignature: z.string().min(1, 'Inspector signature is required to complete inspection'),
  tenantSignature: z.string().optional().nullable(),
})

export type CreateInspectionInput = z.infer<typeof createInspectionSchema>
export type UpdateInspectionInput = z.infer<typeof updateInspectionSchema>
export type CompleteInspectionInput = z.infer<typeof completeInspectionSchema>
export type RoomAssessment = z.infer<typeof roomAssessmentSchema>
export type MaintenanceItem = z.infer<typeof maintenanceItemSchema>
export type Violation = z.infer<typeof violationSchema>
