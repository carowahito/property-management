import { NextResponse } from 'next/server'
import { mockPayments, mockTenants, mockLeases } from '@/lib/mock-data'

export async function GET() {
  // Transform payments to the shape expected by the admin UI
  const transformed = mockPayments.map(payment => {
    const tenant = mockTenants.find(t => t.id === payment.tenantId)
    const lease = mockLeases.find(l => l.id === payment.leaseId)

    return {
      id: payment.id,
      amount: payment.amount,
      type: payment.type,
      method: payment.method || 'N/A',
      status: payment.status,
      dueDate: payment.dueDate,
      paidDate: payment.paidDate || null,
      reference: payment.reference || null,
      month: payment.month,
      tenant: {
        id: payment.tenantId,
        name: payment.tenantName || tenant?.name || 'Unknown Tenant',
        email: tenant?.email || 'N/A',
      },
      lease: {
        id: payment.leaseId,
        property: {
          id: payment.propertyId,
          name: payment.propertyName || lease?.propertyName || 'Unknown Property',
        },
        landlord: {
          id: payment.landlordId,
          name: payment.landlordName || lease?.landlordName || 'Unknown Landlord',
        }
      }
    }
  })

  const pagination = {
    page: 1,
    limit: transformed.length || 10,
    total: transformed.length,
    totalPages: 1,
  }

  return NextResponse.json({ payments: transformed, pagination })
}
