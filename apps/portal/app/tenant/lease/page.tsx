'use client'

import { useQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatDate } from '@/lib/utils'

export default function TenantLeasePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tenant-active-lease'],
    queryFn: () => fetch('/api/leases?status=ACTIVE&limit=1').then(r => r.json()),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const lease = data?.leases?.[0]

  if (error || !lease) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">Lease Agreement</h1>
        <div className="bg-surface shadow rounded-lg p-6 text-neutral-600">
          No active lease found.
        </div>
      </div>
    )
  }

  const statusColor = lease.status === 'ACTIVE'
    ? 'bg-success-100 text-success-800'
    : lease.status === 'EXPIRED'
    ? 'bg-yellow-100 text-yellow-800'
    : 'bg-neutral-100 text-neutral-800'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Lease Agreement</h1>
        <p className="mt-2 text-neutral-600">View your lease agreement and details</p>
      </div>

      <div className="bg-surface shadow rounded-lg p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900">Lease Details</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
            {lease.status}
          </span>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-neutral-50 rounded-lg p-4">
            <dt className="text-sm text-neutral-500">Property</dt>
            <dd className="text-lg font-medium text-neutral-900 mt-1">
              {lease.property?.name || '—'}
            </dd>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4">
            <dt className="text-sm text-neutral-500">Unit</dt>
            <dd className="text-lg font-medium text-neutral-900 mt-1">
              {lease.unit || lease.unitRef?.unitNumber || '—'}
            </dd>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4">
            <dt className="text-sm text-neutral-500">Monthly Rent</dt>
            <dd className="text-lg font-bold text-primary-700 mt-1">
              KES {Number(lease.monthlyRent).toLocaleString()}
            </dd>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4">
            <dt className="text-sm text-neutral-500">Security Deposit</dt>
            <dd className="text-lg font-medium text-neutral-900 mt-1">
              KES {Number(lease.securityDeposit).toLocaleString()}
            </dd>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4">
            <dt className="text-sm text-neutral-500">Start Date</dt>
            <dd className="text-lg font-medium text-neutral-900 mt-1">
              {formatDate(lease.startDate)}
            </dd>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4">
            <dt className="text-sm text-neutral-500">End Date</dt>
            <dd className="text-lg font-medium text-neutral-900 mt-1">
              {formatDate(lease.endDate)}
            </dd>
          </div>
        </dl>

        {lease.terms && (
          <div className="border-t border-neutral-200 pt-4">
            <h3 className="text-sm font-medium text-neutral-500 mb-2">Terms & Conditions</h3>
            <p className="text-sm text-neutral-700">{lease.terms}</p>
          </div>
        )}
      </div>
    </div>
  )
}
