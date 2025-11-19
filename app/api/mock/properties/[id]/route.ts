import { NextRequest, NextResponse } from 'next/server'
import { mockProperties, mockTenants, mockLeases } from '@/lib/mock-data'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const property = mockProperties.find(p => p.id === id)
  
  if (!property) {
    return NextResponse.json(
      { error: 'Property not found' },
      { status: 404 }
    )
  }

  // Get tenants for this property
  const propertyTenants = mockTenants.filter(t => t.propertyId === id)
  
  // Get leases for this property and transform them to match the interface
  const propertyLeases = mockLeases
    .filter(l => l.propertyId === id)
    .map(lease => ({
      id: lease.id,
      tenant: {
        id: lease.tenantId,
        name: lease.tenantName,
      },
      unit: lease.unit,
      monthlyRent: lease.monthlyRent,
      startDate: lease.startDate,
      endDate: lease.endDate,
      status: lease.status,
    }))
  
  // Calculate financials
  const totalRent = propertyLeases
    .filter(l => l.status === 'ACTIVE' || l.status === 'Active')
    .reduce((sum, l) => sum + l.monthlyRent, 0)
  
  const occupancyRate = property.units > 0 
    ? ((propertyTenants.length / property.units) * 100).toFixed(1)
    : '0'

  return NextResponse.json({
    property: {
      ...property,
      tenants: propertyTenants,
      leases: propertyLeases,
      stats: {
        totalUnits: property.units,
        occupiedUnits: propertyTenants.length,
        vacantUnits: property.units - propertyTenants.length,
        occupancyRate,
        totalRent,
        activeLeases: propertyLeases.filter(l => l.status === 'ACTIVE').length,
      }
    }
  })
}
