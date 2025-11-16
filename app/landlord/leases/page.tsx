'use client'

import { Button } from '@/components/ui/button'

export default function LandlordLeasesPage() {
  const leases = [
    { id: 1, tenant: 'John Smith', unit: '4B', property: 'Sunset Apartments', start: '2024-01-15', end: '2025-01-14', rent: 1500, status: 'active' },
    { id: 2, tenant: 'Sarah Johnson', unit: '7A', property: 'Green Valley', start: '2024-03-01', end: '2025-02-28', rent: 1800, status: 'active' },
    { id: 3, tenant: 'Mike Davis', unit: '2C', property: 'Riverside', start: '2024-06-15', end: '2025-06-14', rent: 1600, status: 'active' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Lease Management</h1>
        <Button variant="success" size="lg">+ Create Lease</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <span className="text-3xl mb-2 block">📄</span>
          <p className="text-sm text-gray-600">Active Leases</p>
          <p className="text-3xl font-bold text-green-600">42</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <span className="text-3xl mb-2 block">⏰</span>
          <p className="text-sm text-gray-600">Expiring Soon</p>
          <p className="text-3xl font-bold text-yellow-600">5</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <span className="text-3xl mb-2 block">✍️</span>
          <p className="text-sm text-gray-600">Pending Renewal</p>
          <p className="text-3xl font-bold text-blue-600">3</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <span className="text-3xl mb-2 block">📊</span>
          <p className="text-sm text-gray-600">Renewal Rate</p>
          <p className="text-3xl font-bold text-purple-600">87%</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leases.map(lease => (
              <tr key={lease.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lease.tenant}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lease.unit}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{lease.property}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lease.start}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lease.end}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${lease.rent}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    {lease.status}
                  </span>
                </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <Button variant="primary" size="sm">View</Button>
                <Button variant="success" size="sm">Renew</Button>
              </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
