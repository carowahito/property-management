import { NextResponse } from 'next/server'
import { mockLeases, mockPayments } from '@/lib/mock-data'

export async function GET() {
  // Transform leases to shape expected by the admin UI
  const transformed = mockLeases.map(lease => {
    const paymentsForLease = mockPayments.filter(p => p.leaseId === lease.id)

    return {
      id: lease.id,
      monthlyRent: lease.monthlyRent,
      securityDeposit: lease.deposit ?? 0,
      startDate: lease.startDate,
      endDate: lease.endDate,
      status: (lease.status || 'UNKNOWN').toString().toUpperCase(),
      unit: lease.unit || null,
      tenant: {
        id: lease.tenantId || null,
        name: lease.tenantName || 'Unknown Tenant',
      },
      property: {
        id: lease.propertyId || null,
        name: lease.propertyName || 'Unknown Property',
        landlord: {
          id: lease.landlordId || null,
          name: lease.landlordName || 'Unknown Landlord',
        }
      },
      _count: {
        payments: paymentsForLease.length,
      }
    }
  })

  const pagination = {
    page: 1,
    limit: transformed.length || 10,
    total: transformed.length,
    totalPages: 1,
  }

  return NextResponse.json({ leases: transformed, pagination })
}
