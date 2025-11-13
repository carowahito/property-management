'use client'

import { mockProperties } from '@/lib/mock-data'

export default function PropertiesPage() {
  const totalUnits = mockProperties.reduce((sum, p) => sum + p.units, 0)
  const totalOccupied = mockProperties.reduce((sum, p) => sum + p.occupied, 0)
  const occupancyRate = ((totalOccupied / totalUnits) * 100).toFixed(1)

  const stats = [
    { label: 'Total Properties', value: mockProperties.length.toString(), change: '+2 this month' },
    { label: 'Total Units', value: totalUnits.toString(), change: `${totalOccupied} occupied` },
    { label: 'Occupancy Rate', value: `${occupancyRate}%`, change: '↑ 3% from last month' },
    { label: 'Monthly Revenue', value: `KSh ${(mockProperties.reduce((sum, p) => sum + p.totalRent, 0) / 1000).toFixed(0)}K`, change: 'All properties' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
        <p className="text-gray-600 mt-2">Manage and monitor all your properties</p>
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
        <div className="space-y-4">
          {mockProperties.map((property) => (
            <div key={property.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div>
                <p className="font-medium text-gray-900">{property.name}</p>
                <p className="text-sm text-gray-600">{property.address}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{property.units} Units</p>
                <p className={`text-xs ${property.occupied === property.units ? 'text-green-600' : 'text-yellow-600'}`}>
                  {property.occupied}/{property.units} Occupied
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
