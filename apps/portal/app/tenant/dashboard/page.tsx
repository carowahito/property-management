'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatDate } from '@/lib/utils'
import { useTenantContext } from '@/lib/hooks/use-tenant-context'

export default function TenantDashboardPage() {
  const { tenantId, sessionStatus, assumedTenant } = useTenantContext()

  const { data: leasesData, isLoading: isLoadingLeases } = useQuery({
    queryKey: ['tenant-lease', tenantId],
    queryFn: () => fetch(`/api/leases?limit=1&tenantId=${tenantId}`).then(r => r.json()),
    enabled: !!tenantId,
  })

  const { data: paymentsData, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['tenant-recent-payments', tenantId],
    queryFn: () => fetch(`/api/payments?limit=5&tenantId=${tenantId}`).then(r => r.json()),
    enabled: !!tenantId,
  })

  const { data: maintenanceData, isLoading: isLoadingMaintenance } = useQuery({
    queryKey: ['tenant-pending-maintenance', tenantId],
    queryFn: () => fetch(`/api/maintenance-requests?status=PENDING&tenantId=${tenantId}`).then(r => r.json()),
    enabled: !!tenantId,
  })

  if (sessionStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!tenantId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <p className="text-lg font-semibold text-neutral-700">No tenant selected</p>
          <p className="mt-2 text-sm text-neutral-500">
            Open this page from the admin tenant detail view to view a tenant&apos;s dashboard.
          </p>
        </div>
      </div>
    )
  }

  const isLoading = isLoadingLeases || isLoadingPayments || isLoadingMaintenance

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-neutral-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const activeLease = leasesData?.leases?.[0] || null
  const recentPayments = paymentsData?.payments || []
  const pendingMaintenance = maintenanceData?.maintenanceRequests || []

  const monthlyRent = activeLease ? Number(activeLease.monthlyRent) : 0
  const tenantName = activeLease?.tenant?.name || assumedTenant?.name || 'Tenant'
  const propertyAddress = activeLease
    ? [
        activeLease.unitRef?.unitNumber && `Unit ${activeLease.unitRef.unitNumber}`,
        activeLease.property?.name,
        activeLease.property?.address,
      ].filter(Boolean).join(', ')
    : 'No active lease'

  const outstandingBalance = recentPayments
    .filter((p: any) => p.status === 'PENDING' || p.status === 'OVERDUE')
    .reduce((sum: number, p: any) => sum + Number(p.amount), 0)

  const nextPaymentDate = activeLease
    ? outstandingBalance > 0
      ? new Date()
      : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
    : null

  const getPaymentStatusStyle = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-success-100 text-success-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'OVERDUE': return 'bg-danger-100 text-danger-800'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  const formatMethod = (method: string) => {
    switch (method) {
      case 'MPESA': return 'M-Pesa'
      case 'BANK_TRANSFER': return 'Bank Transfer'
      case 'CASH': return 'Cash'
      case 'CARD': return 'Card'
      case 'CHEQUE': return 'Cheque'
      default: return method
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">
          Welcome back, {tenantName}!
        </h1>
        <p className="mt-2 text-neutral-600">{propertyAddress}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-surface overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0"><div className="text-3xl">🏠</div></div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-neutral-500 truncate">Monthly Rent</dt>
                  <dd className="text-lg font-semibold text-neutral-900">KES {monthlyRent.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0"><div className="text-3xl">💰</div></div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-neutral-500 truncate">Outstanding Balance</dt>
                  <dd className={`text-lg font-semibold ${outstandingBalance > 0 ? 'text-danger-600' : 'text-success-600'}`}>
                    KES {outstandingBalance.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0"><div className="text-3xl">📅</div></div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-neutral-500 truncate">Next Payment Due</dt>
                  <dd className="text-lg font-semibold text-neutral-900">
                    {nextPaymentDate ? formatDate(nextPaymentDate.toISOString()) : 'N/A'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0"><div className="text-3xl">🔧</div></div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-neutral-500 truncate">Pending Requests</dt>
                  <dd className="text-lg font-semibold text-neutral-900">{pendingMaintenance.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            href="/tenant/payments/new"
            className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Pay Rent
          </Link>
          <Link
            href="/tenant/maintenance/new"
            className="inline-flex items-center justify-center px-4 py-3 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-surface hover:bg-neutral-50"
          >
            Submit Maintenance Request
          </Link>
          <Link
            href="/tenant/lease"
            className="inline-flex items-center justify-center px-4 py-3 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-surface hover:bg-neutral-50"
          >
            View Lease
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-surface shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Recent Payments</h2>
              <Link href="/tenant/payments" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {recentPayments.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-4">No payments found.</p>
              ) : (
                recentPayments.map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">KES {Number(payment.amount).toLocaleString()}</p>
                      <p className="text-xs text-neutral-500">{formatDate(payment.dueDate)} · {formatMethod(payment.method)}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusStyle(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-surface shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Pending Maintenance</h2>
              <Link href="/tenant/maintenance" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {pendingMaintenance.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-4">No pending requests.</p>
              ) : (
                pendingMaintenance.map((request: any) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{request.title}</p>
                      <p className="text-xs text-neutral-500">Submitted {formatDate(request.createdAt)} · {request.property?.name || ''}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {request.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {activeLease && (
        <div className="bg-surface shadow rounded-lg p-6 mt-8">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Lease Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-neutral-500">Lease Start</p>
              <p className="mt-1 text-sm text-neutral-900">{formatDate(activeLease.startDate)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Lease End</p>
              <p className="mt-1 text-sm text-neutral-900">{formatDate(activeLease.endDate)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Property</p>
              <p className="mt-1 text-sm text-neutral-900">{propertyAddress}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/tenant/lease" className="text-sm font-medium text-primary-600 hover:text-primary-500">
              View Lease Agreement →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
