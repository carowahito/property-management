'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'

export default function UnitDetailPage() {
  const { unitNumber } = useParams<{ unitNumber: string }>()

  const { data, isLoading, error } = useQuery({
    queryKey: ['unit-statement', unitNumber],
    queryFn: async () => {
      const res = await fetch(`/api/units/${unitNumber}/statement`)
      if (!res.ok) throw new Error('Failed to load unit')
      return res.json()
    },
  })

  if (isLoading) return <div className="flex justify-center h-64"><LoadingSpinner size="lg" /></div>
  if (error) return <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 text-red-800">Failed to load unit.</div>

  const { unit, summary, transactions, statement, payouts } = data ?? {}
  const rows = transactions ?? statement ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Unit {unit?.unitNumber}</h1>
          <p className="text-neutral-500 mt-1">{unit?.property?.name} · {unit?.property?.address}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          unit?.activeTenant ? 'bg-success-100 text-success-700' : 'bg-neutral-100 text-neutral-600'
        }`}>
          {unit?.activeTenant ? 'Occupied' : 'Vacant'}
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface rounded-lg shadow p-5">
          <p className="text-xs text-neutral-500 uppercase tracking-wide">Monthly Rent</p>
          <p className="text-2xl font-bold text-primary-600 mt-1">
            KES {Number(unit?.agreedMonthlyRent ?? 0).toLocaleString()}
          </p>
          <p className="text-xs text-neutral-400 mt-1">{unit?.bedrooms}bd · {unit?.bathrooms}ba</p>
        </div>
        <div className="bg-surface rounded-lg shadow p-5">
          <p className="text-xs text-neutral-500 uppercase tracking-wide">Landlord</p>
          <p className="text-lg font-semibold text-neutral-900 mt-1">{unit?.landlord?.name ?? '—'}</p>
          <p className="text-xs text-neutral-400">{unit?.landlord?.email}</p>
        </div>
        <div className="bg-surface rounded-lg shadow p-5">
          <p className="text-xs text-neutral-500 uppercase tracking-wide">Tenant</p>
          <p className="text-lg font-semibold text-neutral-900 mt-1">{unit?.activeTenant?.name ?? '—'}</p>
          <p className="text-xs text-neutral-400">
            {unit?.activeTenant
              ? `Moved in ${new Date(unit.activeTenant.moveInDate).toLocaleDateString()}`
              : 'No active tenant'}
          </p>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="bg-surface rounded-lg shadow p-5">
          <h2 className="font-semibold text-neutral-900 mb-4">Financial Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {summary.totalRentDue !== undefined && (
              <div><p className="text-neutral-500">Rent Due</p><p className="font-bold">KES {Number(summary.totalRentDue).toLocaleString()}</p></div>
            )}
            {summary.totalNetToLandlord !== undefined && (
              <div><p className="text-neutral-500">Net to Landlord</p><p className="font-bold text-success-600">KES {Number(summary.totalNetToLandlord).toLocaleString()}</p></div>
            )}
            {summary.totalPaidToLandlord !== undefined && (
              <div><p className="text-neutral-500">Paid to Landlord</p><p className="font-bold">KES {Number(summary.totalPaidToLandlord).toLocaleString()}</p></div>
            )}
            {summary.outstanding !== undefined && (
              <div><p className="text-neutral-500">Outstanding</p>
                <p className={`font-bold ${summary.outstanding > 0 ? 'text-danger-600' : 'text-success-600'}`}>
                  KES {Number(summary.outstanding).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transactions */}
      {rows.length > 0 && (
        <div className="bg-surface rounded-lg shadow overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100">
            <h2 className="font-semibold text-neutral-900">Transaction History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-100 text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Period</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Rent Due</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Deductions</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Net Payout</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {rows.map((t: any, i: number) => (
                  <tr key={i} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-neutral-900">{t.rentPeriod}</td>
                    <td className="px-4 py-3 text-neutral-700">KES {Number(t.rentDue ?? t.grossRent ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-danger-600">-KES {Number(t.totalDeductions ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-success-600 font-semibold">KES {Number(t.netToLandlord ?? t.netPayout ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        t.payoutStatus === 'PAID' ? 'bg-success-100 text-success-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{t.payoutStatus ?? '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payouts */}
      {payouts?.length > 0 && (
        <div className="bg-surface rounded-lg shadow overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100">
            <h2 className="font-semibold text-neutral-900">Payouts to Landlord</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-100 text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Reference</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Period</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {payouts.map((p: any, i: number) => (
                  <tr key={i} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-mono text-xs text-neutral-600">{p.reference}</td>
                    <td className="px-4 py-3 text-neutral-700">{p.period}</td>
                    <td className="px-4 py-3 font-semibold text-success-600">KES {Number(p.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-neutral-500">{p.method}</td>
                    <td className="px-4 py-3 text-neutral-500">{p.paidDate ? new Date(p.paidDate).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.status === 'PAID' ? 'bg-success-100 text-success-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
