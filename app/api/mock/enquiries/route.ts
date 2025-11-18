import { NextResponse } from 'next/server'

const mockEnquiries = [
  {
    id: 'E001',
    name: 'Grace Wanjiru',
    email: 'grace.w@email.com',
    phone: '+254 789 123 456',
    subject: 'Lease Terms Question',
    message: 'I would like to know more about the lease renewal process and payment options.',
    status: 'Resolved',
    priority: 'Medium',
    category: 'Leasing',
    propertyId: '1',
    propertyName: 'Sunset Apartments',
    unit: '7B',
    assignedTo: 'Carol White',
    createdAt: '2024-11-14T09:30:00',
    resolvedAt: '2024-11-14T14:15:00',
  },
  {
    id: 'E002',
    name: 'Peter Mwangi',
    email: 'peter.m@email.com',
    phone: '+254 790 234 567',
    subject: 'Payment Issue',
    message: 'My M-Pesa payment did not go through. Please assist.',
    status: 'Open',
    priority: 'High',
    category: 'Payment',
    propertyId: '2',
    propertyName: 'Vista Plaza',
    unit: '4C',
    assignedTo: 'Carol White',
    createdAt: '2024-11-16T11:20:00',
    resolvedAt: null,
  },
  {
    id: 'E003',
    name: 'Lucy Akinyi',
    email: 'lucy.a@email.com',
    phone: '+254 791 345 678',
    subject: 'Move-in Date Inquiry',
    message: 'Can I move in earlier than the agreed date? What is the process?',
    status: 'In Progress',
    priority: 'Low',
    category: 'General',
    propertyId: '3',
    propertyName: 'Highland House',
    unit: '1A',
    assignedTo: 'David Brown',
    createdAt: '2024-11-15T14:45:00',
    resolvedAt: null,
  },
]

export async function GET() {
  return NextResponse.json({ enquiries: mockEnquiries })
}
