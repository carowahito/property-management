'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface Property {
  id: string
  name: string
  address: string
  city: string | null
  totalUnits: number
  status: string
  _count: {
    tenants: number
    leases: number
    maintenanceRequests: number
  }
}

interface Unit {
  id: string
  unitNumber: string
  status: string
  monthlyRent: number | null
  propertyId: string
  property: { id: string; name: string }
}

async function fetchProperties(): Promise<{ properties: Property[] }> {
  const res = await fetch('/api/properties')
  if (!res.ok) throw new Error('Failed to fetch properties')
  return res.json()
}

async function fetchUnits(): Promise<{ units: Unit[] }> {
  const res = await fetch('/api/units')
  if (!res.ok) throw new Error('Failed to fetch units')
  return res.json()
}

export default function LandlordPropertiesPage() {
  const { data: propertiesData, isLoading: loadingProperties } = useQuery({
    queryKey: ['landlord-properties'],
    queryFn: fetchProperties,
  })

  const { data: unitsData, isLoading: loadingUnits } = useQuery({
    queryKey: ['landlord-units'],
    queryFn: fetchUnits,
  })

  if (loadingProperties || loadingUnits) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const properties = propertiesData?.properties || []
  const units = unitsData?.units || []

  // Group units by propertyId for per-property stats
  const unitsByProperty = units.reduce<Record<string, Unit[]>>((acc, unit) => {
    if (!acc[unit.propertyId]) acc[unit.propertyId] = []
    acc[unit.propertyId].push(unit)
    return acc
  }, {})

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Properties</h1>
      </div>

      {properties.length === 0 && (
        <div className="bg-surface shadow rounded-lg p-12 text-center">
          <p className="text-neutral-500 text-lg">No properties found</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map(property => {
          const propertyUnits = unitsByProperty[property.id] || []
          const occupiedCount = propertyUnits.filter(u => u.status === 'OCCUPIED').length
          const monthlyIncome = propertyUnits
            .filter(u => u.status === 'OCCUPIED' && u.monthlyRent)
            .reduce((sum, u) => sum + Number(u.monthlyRent), 0)

          return (
            <div key={property.id} className="bg-surface shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-success-500 to-primary-500"></div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{property.name}</h3>
                <p className="text-sm text-neutral-600 mb-4">{property.address}{property.city ? `, ${property.city}` : ''}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Units:</span>
                    <span className="font-medium">{propertyUnits.length > 0 ? propertyUnits.length : property.totalUnits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Occupied:</span>
                    <span className="font-medium text-success-600">
                      {occupiedCount}/{propertyUnits.length > 0 ? propertyUnits.length : property.totalUnits}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Monthly Income:</span>
                    <span className="font-medium">KES {monthlyIncome.toLocaleString()}</span>
                  </div>
                </div>
                <Link href={`/admin/properties/${property.id}`}>
                  <Button variant="outline" className="mt-4 w-full">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
