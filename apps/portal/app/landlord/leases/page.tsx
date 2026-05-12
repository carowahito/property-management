'use client'

import { useQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatDate } from '@/lib/utils'

interface Lease {
  id: string
  tenantId: string
  propertyId: string
  unitId: string | null
  unit: string | null
  startDate: string
  endDate: string
  monthlyRent: number
  status: string
  tenant: {
    id: string
    name: string
    email: string
  }
  property: {
    id: string
    name: string
    address: string
    landlord?: { id: string; name: string } | null
  }
  unitRef?: { id: string; unitNumber: string } | null
}

async function fetchLeases(): Promise<{ leases: Lease[] }> {
  const res = await fetch('/api/leases')
  if (!res.ok) throw new Error('Failed to fetch leases')
  return res.json()
}

export default function LandlordLeasesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['landlord-leases'],
    queryFn: fetchLeases,
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-danger-600">Failed to load leases.</p>
      </div>
    )
  }

  const leases = data?.leases || []

  const activeLeases = leases.filter(l => l.status === 'ACTIVE')
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const expiringSoon = activeLeases.filter(l => {
    const end = new Date(l.endDate)
    return end >= now && end <= thirtyDaysFromNow
  })

  const pendingLeases = leases.filter(l => l.status === 'PENDING')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-success-100 text-success-800'
      case 'EXPIRED': return 'bg-neutral-100 text-neutral-800'
      case 'TERMINATED': return 'bg-danger-100 text-danger-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Lease Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface shadow rounded-lg p-6">
          <span className="text-3xl mb-2 block">📄</span>
          <p className="text-sm text-neutral-600">Active Leases</p>
          <p className="text-3xl font-bold text-success-600">{activeLeases.length}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-6">
          <span className="text-3xl mb-2 block">⏰</span>
          <p className="text-sm text-neutral-600">Expiring Soon</p>
          <p className="text-3xl font-bold text-yellow-600">{expiringSoon.length}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-6">
          <span className="text-3xl mb-2 block">✍️</span>
          <p className="text-sm text-neutral-600">Pending</p>
          <p className="text-3xl font-bold text-primary-600">{pendingLeases.length}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-6">
          <span className="text-3xl mb-2 block">📊</span>
          <p className="text-sm text-neutral-600">Total Leases</p>
          <p className="text-3xl font-bold text-purple-600">{leases.length}</p>
        </div>
      </div>

      <div className="bg-surface shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Tenant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Rent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-neutral-200">
            {leases.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-neutral-500">
                  No leases found
                </td>
              </tr>
            )}
            {leases.map(lease => {
              const isExpiring = lease.status === 'ACTIVE' && expiringSoon.some(e => e.id === lease.id)
              return (
                <tr key={lease.id} className={`hover:bg-neutral-50 ${isExpiring ? 'bg-yellow-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{lease.tenant.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                    {lease.unitRef?.unitNumber || lease.unit || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{lease.property.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{formatDate(lease.startDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                    {formatDate(lease.endDate)}
                    {isExpiring && (
                      <span className="ml-2 text-xs text-yellow-600 font-medium">Expiring soon</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    KES {Number(lease.monthlyRent).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lease.status)}`}>
                      {lease.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
