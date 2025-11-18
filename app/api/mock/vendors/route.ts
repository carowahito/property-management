import { NextResponse } from 'next/server'
import { mockVendors } from '@/lib/mock-data'

export async function GET() {
  // Add _count fields for compatibility with the UI
  const vendorsWithCounts = mockVendors.map(vendor => ({
    ...vendor,
    status: vendor.status?.toUpperCase() || 'ACTIVE',
    _count: {
      workOrders: Math.floor(Math.random() * 20) + 5,
      completedJobs: Math.floor(Math.random() * 50) + 10,
    }
  }))
  
  return NextResponse.json({ vendors: vendorsWithCounts })
}
