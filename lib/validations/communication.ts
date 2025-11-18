import { z } from 'zod'

export const createMessageSchema = z.object({
  type: z.enum(['EMAIL', 'SMS', 'IN_APP', 'SYSTEM']),
  category: z.enum([
    'RENT_REMINDER',
    'MAINTENANCE',
    'LEASE',
    'PAYMENT',
    'ANNOUNCEMENT',
    'SUPPORT',
    'OTHER',
  ]),
  stakeholderType: z.enum(['TENANT', 'LANDLORD', 'VENDOR', 'LEAD', 'ENQUIRY']),
  stakeholderId: z.string().min(1, 'Stakeholder is required'),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200),
  content: z.string().min(10, 'Message must be at least 10 characters'),
  propertyId: z.string().optional(),
  relatedTo: z.string().optional(),
  attachments: z.array(z.string()).optional(),
})

export type CreateMessageInput = z.infer<typeof createMessageSchema>
