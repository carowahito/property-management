'use client'

import { Button } from '@/components/ui/button';

export default function PropertiesPage() {
  const properties = [
    {
      id: 1,
      name: 'Skyline Apartments',
      address: '123 Main St, Nairobi',
      units: 24,
      occupied: 20,
      revenue: 'KES 2.4M',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Riverside Towers',
      address: '456 River Rd, Westlands',
      units: 36,
      occupied: 32,
      revenue: 'KES 3.6M',
      status: 'Active',
    },
    {
      id: 3,
      name: 'Garden View Estate',
      address: '789 Garden Ave, Karen',
      units: 18,
      occupied: 15,
      revenue: 'KES 1.8M',
      status: 'Active',
    },
  ]

  return (
    <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Property Listings</h1>
          <p className="text-gray-600 mt-1">Real Estate Hub - Manage property listings</p>
        </div>
        <Button variant="primary" size="lg">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Property
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div key={property.id} className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{property.name}</h3>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                {property.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">{property.address}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Units:</span>
                <span className="font-medium text-gray-900">{property.units}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Occupied:</span>
                <span className="font-medium text-gray-900">{property.occupied}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Revenue:</span>
                <span className="font-medium text-gray-900">{property.revenue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Occupancy:</span>
                <span className="font-medium text-green-600">
                  {((property.occupied / property.units) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
                          <div className="flex gap-2 mt-4">
                <Button variant="primary" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
              </div>
          </div>
        ))}
      </div>
    </div>
  )
}
