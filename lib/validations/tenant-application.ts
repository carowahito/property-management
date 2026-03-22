import { z } from 'zod'

export const createTenantApplicationSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  unitId: z.string().optional().nullable(),

  // Applicant Info
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  idNumber: z.string().min(1, 'ID number is required'),
  currentAddress: z.string().optional().nullable(),

  // Employment
  employer: z.string().optional().nullable(),
  jobTitle: z.string().optional().nullable(),
  monthlyIncome: z.union([z.number(), z.string()]).optional().nullable(),
  employmentDuration: z.string().optional().nullable(),

  // References
  previousLandlord: z.string().optional().nullable(),
  previousLandlordPhone: z.string().optional().nullable(),
  personalReference: z.string().optional().nullable(),
  personalReferencePhone: z.string().optional().nullable(),
})

export const updateTenantApplicationSchema = z.object({
  // Applicant Info (partial)
  fullName: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  idNumber: z.string().optional(),
  currentAddress: z.string().optional().nullable(),
  unitId: z.string().optional().nullable(),

  // Employment
  employer: z.string().optional().nullable(),
  jobTitle: z.string().optional().nullable(),
  monthlyIncome: z.union([z.number(), z.string()]).optional().nullable(),
  employmentDuration: z.string().optional().nullable(),

  // References
  previousLandlord: z.string().optional().nullable(),
  previousLandlordPhone: z.string().optional().nullable(),
  personalReference: z.string().optional().nullable(),
  personalReferencePhone: z.string().optional().nullable(),

  // Screening Results
  status: z.enum([
    'SUBMITTED',
    'DOCUMENTS_PENDING',
    'SCREENING',
    'APPROVED',
    'REJECTED',
    'LANDLORD_REVIEW',
    'CONVERTED',
    'WITHDRAWN',
  ]).optional(),
  incomeCheckPassed: z.boolean().optional().nullable(),
  crbCheckStatus: z.string().optional().nullable(),
  crbCheckDate: z.string().optional().nullable(),
  employerVerified: z.boolean().optional().nullable(),
  employerVerifyNotes: z.string().optional().nullable(),
  landlordRefChecked: z.boolean().optional().nullable(),
  landlordRefNotes: z.string().optional().nullable(),

  // Decision
  screeningNotes: z.string().optional().nullable(),
  decidedBy: z.string().optional().nullable(),
  decidedAt: z.string().optional().nullable(),
  landlordApproved: z.boolean().optional().nullable(),
  landlordApprovalDate: z.string().optional().nullable(),
})

export type CreateTenantApplicationInput = z.infer<typeof createTenantApplicationSchema>
export type UpdateTenantApplicationInput = z.infer<typeof updateTenantApplicationSchema>
