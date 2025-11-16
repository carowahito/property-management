'use client'

import { Button } from '@/components/ui/button'

export default function LandlordTenantsPage() {
  const tenants = [
    { id: 1, name: 'John Smith', unit: '4B', property: 'Sunset Apartments', rent: 1500, status: 'current', moveIn: '2023-01-15' },
    { id: 2, name: 'Sarah Johnson', unit: '7A', property: 'Green Valley', rent: 1800, status: 'current', moveIn: '2023-03-01' },
    { id: 3, name: 'Mike Davis', unit: '2C', property: 'Riverside', rent: 1600, status: 'current', moveIn: '2023-06-15' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tenants</h1>
        <Button variant="success" size="lg">+ Add Tenant</Button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Move-in Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tenants.map(tenant => (
              <tr key={tenant.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tenant.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{tenant.unit}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{tenant.property}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${tenant.rent}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{tenant.moveIn}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    {tenant.status}
                  </span>
                </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Button variant="primary" size="sm">View</Button>
              </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
