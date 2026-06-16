'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

function SigningBanner({ lease }: { lease: any }) {
  const tenantSigned = !!lease.tenantSignedAt
  const landlordSigned = !!lease.landlordSignedAt
  const awaitingTenant = lease.sentForSigning && !tenantSigned
  const awaitingLandlord = tenantSigned && !landlordSigned

  if (awaitingTenant) {
    return (
      <div className="rounded-lg bg-yellow-50 border border-yellow-300 p-4 flex items-start gap-3">
        <svg className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
        </svg>
        <div className="flex-1">
          <p className="font-semibold text-yellow-800">Action required — your signature is needed</p>
          <p className="text-sm text-yellow-700 mt-0.5">
            {landlordSigned
              ? 'The landlord has already signed. Please review and sign this lease to make it active.'
              : 'This lease has been sent for signing. Please review the document and add your signature.'}
          </p>
        </div>
        <Link href="/tenant/lease/sign">
          <Button variant="primary" className="whitespace-nowrap">Sign Now</Button>
        </Link>
      </div>
    )
  }

  if (awaitingLandlord) {
    return (
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
        <svg className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m9-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="font-semibold text-blue-800">Waiting for landlord / agent signature</p>
          <p className="text-sm text-blue-700 mt-0.5">You have signed. Your property manager will co-sign shortly.</p>
        </div>
      </div>
    )
  }

  if (tenantSigned && landlordSigned) {
    return (
      <div className="rounded-lg bg-success-50 border border-success-200 p-4 flex items-start gap-3">
        <svg className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <div>
          <p className="font-semibold text-success-800">Fully executed — signed by both parties</p>
          <p className="text-sm text-success-700 mt-0.5">
            Tenant signed {formatDate(lease.tenantSignedAt)} · Landlord signed {formatDate(lease.landlordSignedAt)}
          </p>
        </div>
      </div>
    )
  }

  return null
}

function LeaseCard({ lease, label }: { lease: any; label?: string }) {
  const statusColor = lease.status === 'ACTIVE'
    ? 'bg-success-100 text-success-800'
    : lease.status === 'PENDING'
    ? 'bg-yellow-100 text-yellow-800'
    : 'bg-neutral-100 text-neutral-800'

  const bothSigned = !!lease.tenantSignedAt && !!lease.landlordSignedAt
  const hasDocument = !!(lease.documentUrl || lease.documentHtml)

  return (
    <div className="bg-surface shadow rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-neutral-900">{label || 'Lease Details'}</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
            {lease.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasDocument && (
            <Button
              variant="outline"
              onClick={() => window.open(`/api/leases/${lease.id}/generate-pdf`, '_blank')}
            >
              View Lease
            </Button>
          )}
          {bothSigned && (
            <Button
              variant="primary"
              onClick={() => window.open(`/api/leases/${lease.id}/generate-pdf?download=true`, '_blank')}
            >
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Signing status banner */}
      <SigningBanner lease={lease} />

      {/* Lease details grid */}
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
        <h3 className="text-sm font-medium text-neutral-500 mb-3">Signature Status</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${lease.landlordSignedAt ? 'bg-success-500' : 'bg-neutral-300'}`} />
            <span className="text-sm text-neutral-700">
              Landlord / Agent {lease.landlordSignedAt ? `— Signed ${formatDate(lease.landlordSignedAt)}` : '— Pending'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${lease.tenantSignedAt ? 'bg-success-500' : 'bg-neutral-300'}`} />
            <span className="text-sm text-neutral-700">
              Tenant {lease.tenantSignedAt ? `— Signed ${formatDate(lease.tenantSignedAt)}` : '— Pending'}
            </span>
          </div>
        </div>
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
  const { data: session } = useSession()
  const tenantId = session?.user?.id

  const { data, isLoading, error } = useQuery({
    queryKey: ['tenant-leases', tenantId],
    queryFn: async () => {
      const scope = tenantId ? `&tenantId=${tenantId}` : ''
      const [activeRes, pendingRes] = await Promise.all([
        fetch(`/api/leases?status=ACTIVE&limit=1${scope}`),
        fetch(`/api/leases?status=PENDING&limit=1${scope}`),
      ])
      const [activeData, pendingData] = await Promise.all([activeRes.json(), pendingRes.json()])
      return {
        active: activeData.leases?.[0] || null,
        pending: pendingData.leases?.[0] || null,
      }
    },
    enabled: !!tenantId,
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
