'use client'

import { mockTenants } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function TenantsPage() {
  const stats = [
    { label: 'Total Tenants', value: mockTenants.length.toString(), change: '2 new this month' },
    { label: 'Active Leases', value: (mockTenants.filter(t => t.status === 'Active').length).toString(), change: '100% of active' },
    { label: 'Pending Move-ins', value: '2', change: 'Expected this quarter' },
    { label: 'Move-outs', value: '0', change: 'In next 30 days' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-600 mt-2">Manage tenant information and leases</p>
        </div>
        <Button variant="primary" size="lg">+ Add Tenant</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Tenants</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Property</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Rent</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Lease End</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/admin/tenants/${tenant.id}`}>
                  <td className="px-6 py-4 text-sm font-medium text-blue-600 hover:text-blue-800">
                    <Link href={`/admin/tenants/${tenant.id}`}>{tenant.name}</Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{tenant.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{tenant.property}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{tenant.unit}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">KSh {tenant.rent.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700">
                      {tenant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{tenant.leaseEnd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
