'use client'

import { useQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

function LeaseCard({ lease, label }: { lease: any; label?: string }) {
  const statusColor = lease.status === 'ACTIVE'
    ? 'bg-success-100 text-success-800'
    : lease.status === 'PENDING'
    ? 'bg-yellow-100 text-yellow-800'
    : lease.status === 'EXPIRED'
    ? 'bg-neutral-100 text-neutral-800'
    : 'bg-neutral-100 text-neutral-800'

  const bothSigned = !!lease.tenantSignedAt && !!lease.landlordSignedAt

  return (
    <div className="bg-surface shadow rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">{label || 'Lease Details'}</h2>
          {lease.status === 'PENDING' && !bothSigned && (
            <p className="text-sm text-yellow-700 mt-1">This lease is awaiting signatures before it becomes active.</p>
          )}
          {lease.status === 'PENDING' && bothSigned && (
            <p className="text-sm text-success-700 mt-1">Signed by both parties. This lease will activate when the current lease expires.</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
            {lease.status}
          </span>
          {bothSigned && (
            <Button
              variant="primary"
              onClick={() => window.open(`/api/leases/${lease.id}/generate-pdf?download=true`, '_blank')}
            >
              Download Lease Agreement
            </Button>
          )}
        </div>
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

      {/* Signature status */}
      <div className="border-t border-neutral-200 pt-4">
        <h3 className="text-sm font-medium text-neutral-500 mb-3">Signatures</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${lease.landlordSignedAt ? 'bg-success-500' : 'bg-neutral-300'}`} />
            <span className="text-sm text-neutral-700">
              Landlord / Agent {lease.landlordSignedAt ? `— Signed ${formatDate(lease.landlordSignedAt)}` : '— Pending'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${lease.tenantSignedAt ? 'bg-success-500' : 'bg-neutral-300'}`} />
            <span className="text-sm text-neutral-700">
              Tenant {lease.tenantSignedAt ? `— Signed ${formatDate(lease.tenantSignedAt)}` : '— Pending'}
            </span>
          </div>
        </div>
        {lease.sentForSigning && !lease.tenantSignedAt && (
          <div className="mt-3">
            <Link href="/tenant/lease/sign">
              <Button variant="primary">Sign Lease Agreement</Button>
            </Link>
          </div>
        )}
      </div>

      {lease.terms && (
        <div className="border-t border-neutral-200 pt-4">
          <h3 className="text-sm font-medium text-neutral-500 mb-2">Terms & Conditions</h3>
          <p className="text-sm text-neutral-700">{lease.terms}</p>
        </div>
      )}
    </div>
  )
}

export default function TenantLeasePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tenant-leases'],
    queryFn: async () => {
      const [activeRes, pendingRes] = await Promise.all([
        fetch('/api/leases?status=ACTIVE&limit=1'),
        fetch('/api/leases?status=PENDING&limit=1'),
      ])
      const [activeData, pendingData] = await Promise.all([activeRes.json(), pendingRes.json()])
      return {
        active: activeData.leases?.[0] || null,
        pending: pendingData.leases?.[0] || null,
      }
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const active = data?.active
  const pending = data?.pending

  if (error || (!active && !pending)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">Lease Agreement</h1>
        <div className="bg-surface shadow rounded-lg p-6 text-neutral-600">
          No active lease found.
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Lease Agreement</h1>
        <p className="mt-2 text-neutral-600">View your lease agreement and details</p>
      </div>

      <div className="space-y-6">
        {active && <LeaseCard lease={active} label="Current Lease" />}
        {pending && <LeaseCard lease={pending} label="Upcoming Renewal" />}
      </div>
    </div>
  )
}
