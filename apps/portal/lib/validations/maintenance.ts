import { z } from 'zod'

export const MAINTENANCE_STATUSES = [
  // Legacy (backward compat)
  'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED',
  // Full state machine (brief §3)
  'NEW', 'UNDER_REVIEW', 'RESPONSIBILITY_ASSIGNED', 'QUOTING',
  'AWAITING_APPROVAL', 'AWAITING_FUNDS', 'COMPLETED_PENDING_CONFIRMATION',
  'CLOSED', 'DISPUTED', 'REJECTED',
] as const

export type MaintenanceStatus = typeof MAINTENANCE_STATUSES[number]

export const RAISED_BY = ['TENANT', 'LANDLORD', 'AGENT'] as const
export const RESPONSIBLE_PARTY = ['LANDLORD', 'TENANT', 'SHARED'] as const
export const COST_ALLOCATION = [
  'LANDLORD_STATEMENT', 'TENANT_RENT_ADDON', 'TENANT_INVOICE', 'SERVICE_CHARGE',
] as const

export const createMaintenanceRequestSchema = z.object({
  tenantId: z.string().min(1, 'Tenant is required'),
  propertyId: z.string().min(1, 'Property is required'),
  unitId: z.string().optional(),
  unit: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  status: z.enum(MAINTENANCE_STATUSES).default('NEW'),
  category: z.string().optional(),
  raisedBy: z.enum(RAISED_BY).default('TENANT'),
  media: z.array(z.string()).optional(),
  resolvedAt: z.string().optional(),
})

export const updateMaintenanceRequestSchema = z.object({
  tenantId: z.string().optional(),
  propertyId: z.string().optional(),
  unitId: z.string().optional(),
  unit: z.string().optional(),
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(MAINTENANCE_STATUSES).optional(),
  category: z.string().optional(),
  raisedBy: z.enum(RAISED_BY).optional(),
  responsibleParty: z.enum(RESPONSIBLE_PARTY).optional(),
  responsibilityReason: z.string().optional(),
  selectedQuoteAmount: z.number().min(0).optional(),
  depositRequired: z.boolean().optional(),
  depositAmount: z.number().min(0).optional(),
  depositPaidAt: z.string().optional(),
  depositRef: z.string().optional(),
  balanceAmount: z.number().min(0).optional(),
  balanceSettledAt: z.string().optional(),
  assignedContractorId: z.string().optional(),
  completedAt: z.string().optional(),
  invoiceRef: z.string().optional(),
  occupantConfirmedAt: z.string().optional(),
  costAllocation: z.enum(COST_ALLOCATION).optional(),
  resolvedAt: z.string().optional(),
})

export type CreateMaintenanceRequestInput = z.infer<typeof createMaintenanceRequestSchema>
export type UpdateMaintenanceRequestInput = z.infer<typeof updateMaintenanceRequestSchema>
