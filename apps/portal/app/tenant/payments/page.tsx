'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useTenantContext } from '@/lib/hooks/use-tenant-context'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatDate } from '@/lib/utils'

function TenantPaymentsPageInner() {
  const [filter, setFilter] = useState('paid')
  const router = useRouter()
  const { tenantId, isTenant } = useTenantContext()

  const apiUrl = tenantId
    ? `/api/payments?tenantId=${tenantId}`
    : '/api/payments'

  const { data, isLoading, error } = useQuery({
    queryKey: ['tenant-payments', tenantId],
    queryFn: () => fetch(apiUrl).then(r => r.json()),
    enabled: !!tenantId,
  })

  const payments: any[] = data?.payments || []

  const filteredPayments = payments.filter((p) => {
    if (filter === 'all') return true
    if (filter === 'paid') return p.status === 'PAID'
    if (filter === 'pending') return p.status === 'PENDING' || p.status === 'OVERDUE'
    return true
  })

  const totalPaid = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const totalPending = payments
    .filter((p) => p.status === 'PENDING' || p.status === 'OVERDUE')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  // Next payment due: today if there are arrears, first of next month if clear
  const now = new Date()
  const nextPaymentDate = totalPending > 0
    ? now
    : new Date(now.getFullYear(), now.getMonth() + 1, 1)

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-neutral-600">Loading payments...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
          <p className="text-danger-800">Failed to load payments. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Payment History</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/tenant/statements')}
            className="inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50"
          >
            View Statement
          </button>
          <Link
            href="/tenant/payments/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Make Payment
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
        <div className="bg-surface overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <p className="text-sm font-medium text-neutral-500">Total Paid This Year</p>
            <p className="mt-1 text-2xl font-semibold text-success-600">
              KES {totalPaid.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="bg-surface overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <p className="text-sm font-medium text-neutral-500">Outstanding Balance</p>
            <p className="mt-1 text-2xl font-semibold text-danger-600">
              KES {totalPending.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="bg-surface overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <p className="text-sm font-medium text-neutral-500">Next Payment Due</p>
            <p className="mt-1 text-2xl font-semibold text-neutral-900">
              {formatDate(nextPaymentDate.toISOString())}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-surface shadow rounded-lg">
        <div className="border-b border-neutral-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setFilter('all')}
              className={`${
                filter === 'all'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              All Payments
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`${
                filter === 'paid'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Paid
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`${
                filter === 'pending'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Pending
            </button>
          </nav>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-neutral-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-neutral-500">
                    No payments found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {formatDate(payment.dueDate)}
                      {payment.paidDate && (
                        <p className="text-xs text-neutral-500">Paid: {formatDate(payment.paidDate)}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                      KES {Number(payment.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {payment.reference || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.status === 'PAID'
                            ? 'bg-success-100 text-success-800'
                            : payment.status === 'OVERDUE'
                            ? 'bg-danger-100 text-danger-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {formatMethod(payment.method)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {payment.status === 'PENDING' || payment.status === 'OVERDUE' ? (
                        <Link
                          href={`/tenant/payments/${payment.id}/pay`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Pay Now
                        </Link>
                      ) : payment.status === 'PAID' ? (
                        <a
                          href={`/api/payments/${payment.id}/receipt`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View Receipt
                        </a>
                      ) : (
                        <span className="text-neutral-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Statistics — only meaningful for the scoped tenant */}
      <div className="mt-6 bg-surface shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Payment Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-neutral-500">Payments Made</p>
            <p className="text-xl font-semibold text-neutral-900">
              {payments.filter((p) => p.status === 'PAID').length}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Pending Payments</p>
            <p className="text-xl font-semibold text-yellow-600">
              {payments.filter((p) => p.status === 'PENDING').length}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Overdue Payments</p>
            <p className="text-xl font-semibold text-danger-600">
              {payments.filter((p) => p.status === 'OVERDUE').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TenantPaymentsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>}>
      <TenantPaymentsPageInner />
    </Suspense>
  )
}
