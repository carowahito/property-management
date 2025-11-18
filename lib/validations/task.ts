import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate: z.string().refine((date) => new Date(date) > new Date(), {
    message: 'Due date must be in the future',
  }),
  reminderDate: z.string().optional(),
  assignedToId: z.string().min(1, 'Please assign to a team member'),
  stakeholderType: z.enum(['TENANT', 'LANDLORD', 'VENDOR', 'LEAD', 'ENQUIRY']).optional(),
  stakeholderId: z.string().optional(),
  leadId: z.string().optional(),
  enquiryId: z.string().optional(),
  notes: z.string().optional(),
})

export const updateTaskSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  dueDate: z.string().optional(),
  reminderDate: z.string().optional(),
  assignedToId: z.string().optional(),
  notes: z.string().optional(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
