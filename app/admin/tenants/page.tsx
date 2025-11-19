'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'

interface Tenant {
  id: string
  name: string
  email: string
  phone: string
  status: string
  unit: string | null
  property: {
    id: string
    name: string
    address: string
  }
  _count: {
    leases: number
    payments: number
  }
}

interface TenantsResponse {
  tenants: Tenant[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

async function fetchTenants(): Promise<TenantsResponse> {
  const response = await fetch('/api/mock/tenants')
  if (!response.ok) {
    throw new Error('Failed to fetch tenants')
  }
  return response.json()
}

export default function TenantsPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterProperty, setFilterProperty] = useState<string>('all')
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['tenants'],
    queryFn: fetchTenants,
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
        <p className="text-red-800">Failed to load tenants. Please try again.</p>
      </div>
    )
  }

  const tenants = data?.tenants || []
  
  // Get unique properties for filter
  const properties = Array.from(new Set(tenants.map(t => t.property.name))).sort()
  
  // Apply filters
  const filteredTenants = tenants.filter(tenant => {
    const matchesStatus = filterStatus === 'all' || tenant.status === filterStatus
    const matchesProperty = filterProperty === 'all' || tenant.property.name === filterProperty
    return matchesStatus && matchesProperty
  })
  
  const activeTenants = tenants.filter(t => t.status === 'ACTIVE')
  const pendingTenants = tenants.filter(t => t.status === 'PENDING')

  const stats = [
    { label: 'Total Tenants', value: tenants.length.toString(), change: `${activeTenants.length} active` },
    { label: 'Active Leases', value: activeTenants.length.toString(), change: `${tenants.reduce((sum, t) => sum + t._count.leases, 0)} total leases` },
    { label: 'Pending Move-ins', value: pendingTenants.length.toString(), change: 'Awaiting confirmation' },
    { label: 'Total Payments', value: tenants.reduce((sum, t) => sum + t._count.payments, 0).toString(), change: 'All tenants' },
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">All Tenants</h2>
          </div>
          
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Property</label>
              <select
                value={filterProperty}
                onChange={(e) => setFilterProperty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Properties</option>
                {properties.map(property => (
                  <option key={property} value={property}>{property}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredTenants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No tenants found</p>
            <Button variant="primary">Add Your First Tenant</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Leases</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">
                      <Link href={`/admin/tenants/${tenant.id}`} className="text-blue-600 hover:text-blue-800">
                        {tenant.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{tenant.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{tenant.phone}</td>
                    <td className="px-6 py-4 text-sm">
                      <Link href={`/admin/properties/${tenant.property.id}`} className="text-blue-600 hover:text-blue-800">
                        {tenant.property.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{tenant.unit || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{tenant._count.leases}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        tenant.status === 'ACTIVE' ? 'bg-green-50 text-green-700' :
                        tenant.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700' :
                        tenant.status === 'INACTIVE' ? 'bg-gray-50 text-gray-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {tenant.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
