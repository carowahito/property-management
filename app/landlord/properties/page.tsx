'use client'

export default function LandlordProperties() {
  const properties = [
    { id: 1, name: 'Sunset Apartments', location: 'Downtown', units: 12, occupied: 10, monthlyRent: 18000 },
    { id: 2, name: 'Green Valley Condos', location: 'Westside', units: 8, occupied: 8, monthlyRent: 16000 },
    { id: 3, name: 'Riverside Complex', location: 'Eastside', units: 16, occupied: 14, monthlyRent: 24000 },
    { id: 4, name: 'City Center Plaza', location: 'Central', units: 12, occupied: 10, monthlyRent: 22000 },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">+ Add Property</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map(property => (
          <div key={property.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500"></div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{property.name}</h3>
              <p className="text-sm text-gray-600 mb-4">📍 {property.location}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Units:</span>
                  <span className="font-medium">{property.units}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Occupied:</span>
                  <span className="font-medium text-green-600">{property.occupied}/{property.units}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Revenue:</span>
                  <span className="font-medium">${property.monthlyRent.toLocaleString()}</span>
                </div>
              </div>
              <button className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
