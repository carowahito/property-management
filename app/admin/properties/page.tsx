'use client'

import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'

interface Property {
  id: string
  name: string
  address: string
  city: string | null
  type: string
  units: number
  status: string
  landlord: {
    id: string
    name: string
  }
  _count: {
    tenants: number
    leases: number
  }
}

interface PropertiesResponse {
  properties: Property[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

async function fetchProperties(): Promise<PropertiesResponse> {
  const response = await fetch('/api/mock/properties')
  if (!response.ok) {
    throw new Error('Failed to fetch properties')
  }
  return response.json()
}

export default function PropertiesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: fetchProperties,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load properties. Please try again.</p>
      </div>
    )
  }

  const properties = data?.properties || []
  const totalUnits = properties.reduce((sum, p) => sum + p.units, 0)
  const totalOccupied = properties.reduce((sum, p) => sum + p._count.tenants, 0)
  const occupancyRate = totalUnits > 0 ? ((totalOccupied / totalUnits) * 100).toFixed(1) : '0'

  const stats = [
    { label: 'Total Properties', value: properties.length.toString(), change: `${properties.filter(p => p.status === 'ACTIVE').length} active` },
    { label: 'Total Units', value: totalUnits.toString(), change: `${totalOccupied} occupied` },
    { label: 'Occupancy Rate', value: `${occupancyRate}%`, change: totalUnits > 0 ? `${totalUnits - totalOccupied} vacant` : 'No units' },
    { label: 'Total Leases', value: properties.reduce((sum, p) => sum + p._count.leases, 0).toString(), change: 'All properties' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600 mt-2">Manage and monitor all your properties</p>
        </div>
        <Button variant="primary" size="lg">+ Add Property</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Properties</h2>

        {properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No properties found</p>
            <Button variant="primary">Add Your First Property</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => (
              <Link
                key={property.id}
                href={`/admin/properties/${property.id}`}
                className="block"
              >
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-gray-900">{property.name}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        property.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        property.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {property.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{property.address}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Landlord: {property.landlord.name} • Type: {property.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{property.units} Units</p>
                    <p className={`text-xs ${property._count.tenants === property.units ? 'text-green-600' : 'text-yellow-600'}`}>
                      {property._count.tenants}/{property.units} Occupied
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {property._count.leases} Leases
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
