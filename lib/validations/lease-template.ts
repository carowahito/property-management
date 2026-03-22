import { z } from 'zod'

export const createLeaseTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  type: z.enum(['RESIDENTIAL_STANDARD', 'RESIDENTIAL_SHORT_TERM', 'COMMERCIAL']),
  content: z.string().min(1, 'Template content is required'),
  clauses: z.array(z.object({
    id: z.string(),
    title: z.string(),
    text: z.string(),
    required: z.boolean(),
    enabled: z.boolean(),
  })).optional(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

export const updateLeaseTemplateSchema = createLeaseTemplateSchema.partial()

export type CreateLeaseTemplateInput = z.infer<typeof createLeaseTemplateSchema>
export type UpdateLeaseTemplateInput = z.infer<typeof updateLeaseTemplateSchema>
