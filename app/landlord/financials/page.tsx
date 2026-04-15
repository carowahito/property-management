'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatDate } from '@/lib/utils'

export default function LandlordFinancials() {
  const { data: payoutsData, isLoading: loadingPayouts } = useQuery({
    queryKey: ['landlord-payouts'],
    queryFn: () => fetch('/api/payouts').then(r => r.json()),
  })

  const { data: paymentsData, isLoading: loadingPayments } = useQuery({
    queryKey: ['landlord-payments'],
    queryFn: () => fetch('/api/payments?limit=100').then(r => r.json()),
  })

  if (loadingPayouts || loadingPayments) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const payouts = payoutsData?.payouts || []
  const payments = paymentsData?.payments || []

  const totalPaidToLandlord = payouts
    .filter((p: any) => p.status === 'PAID')
    .reduce((sum: number, p: any) => sum + Number(p.amount), 0)

  const totalCollected = payments
    .filter((p: any) => p.status === 'PAID')
    .reduce((sum: number, p: any) => sum + Number(p.amount), 0)

  const totalPending = payments
    .filter((p: any) => p.status === 'PENDING' || p.status === 'OVERDUE')
    .reduce((sum: number, p: any) => sum + Number(p.amount), 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Financial Overview</h1>
        <Link
          href="/landlord/financials/statements"
          className="px-4 py-2 bg-neutral-800 text-white text-sm font-medium rounded-md hover:bg-neutral-700 transition"
        >
          View Statements
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface shadow rounded-lg p-6">
          <p className="text-sm text-neutral-600">Total Collected from Tenants</p>
          <p className="text-3xl font-bold text-success-600 mt-1">
            KES {totalCollected.toLocaleString()}
          </p>
        </div>
        <div className="bg-surface shadow rounded-lg p-6">
          <p className="text-sm text-neutral-600">Total Paid to You</p>
          <p className="text-3xl font-bold text-primary-700 mt-1">
            KES {totalPaidToLandlord.toLocaleString()}
          </p>
          <p className="text-xs text-neutral-500 mt-1">{payouts.filter((p: any) => p.status === 'PAID').length} payouts</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-6">
          <p className="text-sm text-neutral-600">Pending / Overdue Rent</p>
          <p className={`text-3xl font-bold mt-1 ${totalPending > 0 ? 'text-danger-600' : 'text-neutral-400'}`}>
            KES {totalPending.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-surface shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">Payout History</h2>
        </div>
        {payouts.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">No payouts recorded yet.</div>
        ) : (
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Period</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Date Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {payouts.map((payout: any) => (
                <tr key={payout.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 text-sm font-medium text-neutral-900">{payout.period}</td>
                  <td className="px-6 py-4 text-sm text-right font-mono text-neutral-900">
                    KES {Number(payout.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {payout.method === 'BANK_TRANSFER' ? 'Bank' : payout.method === 'MPESA' ? 'M-Pesa' : payout.method}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {payout.paidDate ? formatDate(payout.paidDate) : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-neutral-500">
                    {payout.reference || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      payout.status === 'PAID' ? 'bg-success-100 text-success-800'
                      : payout.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-neutral-100 text-neutral-800'
                    }`}>
                      {payout.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
