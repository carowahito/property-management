'use client'

import { useQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'

export default function FinancialAnalyticsPage() {
  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['tenant-payment-analytics'],
    queryFn: () => fetch('/api/payments?limit=100').then(r => r.json()),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const payments = paymentsData?.payments || []
  const paidPayments = payments.filter((p: any) => p.status === 'PAID')
  const totalPaid = paidPayments.reduce((sum: number, p: any) => sum + Number(p.amount), 0)
  const avgPayment = paidPayments.length > 0 ? Math.round(totalPaid / paidPayments.length) : 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">Financial Analytics</h1>
      <p className="text-neutral-600 mb-8">Track your rental expenses and payment history</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface shadow rounded-lg p-6">
          <p className="text-sm text-neutral-600">Total Paid</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">KES {totalPaid.toLocaleString()}</p>
          <p className="text-xs text-neutral-500 mt-1">{paidPayments.length} payments</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-6">
          <p className="text-sm text-neutral-600">Average Payment</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">KES {avgPayment.toLocaleString()}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-6">
          <p className="text-sm text-neutral-600">Payment Count</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{paidPayments.length}</p>
        </div>
      </div>

      <div className="bg-surface shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">Payment History</h2>
          <Link href="/tenant/statements" className="text-sm text-primary-600 hover:underline">
            View Full Statement
          </Link>
        </div>
        {paidPayments.length === 0 ? (
          <p className="text-neutral-500 py-8 text-center">No payment data available.</p>
        ) : (
          <div className="space-y-2">
            {paidPayments.map((p: any) => (
              <div key={p.id} className="flex justify-between items-center py-2 border-b border-neutral-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{p.reference || 'Payment'}</p>
                  <p className="text-xs text-neutral-500">{p.paidDate?.split('T')[0] || '—'}</p>
                </div>
                <span className="font-mono text-sm font-medium text-success-700">
                  KES {Number(p.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
