import { NextResponse } from 'next/server'
import { mockTenants } from '@/lib/mock-data'

export async function GET() {
  // Add _count fields for compatibility with the UI
  const tenantsWithCounts = mockTenants.map(tenant => ({
    ...tenant,
    status: tenant.status.toUpperCase(),
    _count: {
      leases: 1,
      payments: Math.floor(Math.random() * 12) + 1,
      maintenanceRequests: Math.floor(Math.random() * 5),
    }
  }))
  
  return NextResponse.json({ tenants: tenantsWithCounts })
}
