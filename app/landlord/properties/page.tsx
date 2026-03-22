'use client'

import { Button } from '@/components/ui/button'

export default function LandlordPropertiesPage() {
  const properties = [
    { id: 1, name: 'Sunset Apartments', location: 'Downtown', units: 12, occupied: 10, monthlyRent: 18000 },
    { id: 2, name: 'Green Valley Condos', location: 'Westside', units: 8, occupied: 8, monthlyRent: 16000 },
    { id: 3, name: 'Riverside Complex', location: 'Eastside', units: 16, occupied: 14, monthlyRent: 24000 },
    { id: 4, name: 'City Center Plaza', location: 'Central', units: 12, occupied: 10, monthlyRent: 22000 },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Properties</h1>
        <Button variant="success" size="lg">+ Add Property</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map(property => (
          <div key={property.id} className="bg-surface shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-br from-success-500 to-primary-500"></div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">{property.name}</h3>
              <p className="text-sm text-neutral-600 mb-4">📍 {property.location}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Units:</span>
                  <span className="font-medium">{property.units}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Occupied:</span>
                  <span className="font-medium text-success-600">{property.occupied}/{property.units}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Monthly Revenue:</span>
                  <span className="font-medium">${property.monthlyRent.toLocaleString()}</span>
                </div>
              </div>
              <Button variant="outline" className="mt-4 w-full">
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
