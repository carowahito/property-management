import { NextResponse } from 'next/server'
import { mockProperties } from '@/lib/mock-data'

export async function GET() {
  // Add _count fields for compatibility with the UI
  const propertiesWithCounts = mockProperties.map(property => ({
    ...property,
    status: property.status.toUpperCase(),
    _count: {
      units: property.units,
      tenants: property.occupied,
      leases: property.occupied,
    }
  }))
  
  return NextResponse.json({ properties: propertiesWithCounts })
}
