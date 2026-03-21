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
  if (error) return <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">Failed to load unit.</div>

  const { unit, summary, transactions, statement, payouts } = data ?? {}
  const rows = transactions ?? statement ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Unit {unit?.unitNumber}</h1>
          <p className="text-gray-500 mt-1">{unit?.property?.name} · {unit?.property?.address}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          unit?.activeTenant ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {unit?.activeTenant ? 'Occupied' : 'Vacant'}
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Monthly Rent</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            KES {Number(unit?.agreedMonthlyRent ?? 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">{unit?.bedrooms}bd · {unit?.bathrooms}ba</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Landlord</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">{unit?.landlord?.name ?? '—'}</p>
          <p className="text-xs text-gray-400">{unit?.landlord?.email}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Tenant</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">{unit?.activeTenant?.name ?? '—'}</p>
          <p className="text-xs text-gray-400">
            {unit?.activeTenant
              ? `Moved in ${new Date(unit.activeTenant.moveInDate).toLocaleDateString()}`
              : 'No active tenant'}
          </p>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Financial Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {summary.totalRentDue !== undefined && (
              <div><p className="text-gray-500">Rent Due</p><p className="font-bold">KES {Number(summary.totalRentDue).toLocaleString()}</p></div>
            )}
            {summary.totalNetToLandlord !== undefined && (
              <div><p className="text-gray-500">Net to Landlord</p><p className="font-bold text-green-600">KES {Number(summary.totalNetToLandlord).toLocaleString()}</p></div>
            )}
            {summary.totalPaidToLandlord !== undefined && (
              <div><p className="text-gray-500">Paid to Landlord</p><p className="font-bold">KES {Number(summary.totalPaidToLandlord).toLocaleString()}</p></div>
            )}
            {summary.outstanding !== undefined && (
              <div><p className="text-gray-500">Outstanding</p>
                <p className={`font-bold ${summary.outstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  KES {Number(summary.outstanding).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transactions */}
      {rows.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Transaction History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rent Due</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Payout</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((t: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{t.rentPeriod}</td>
                    <td className="px-4 py-3 text-gray-700">KES {Number(t.rentDue ?? t.grossRent ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-red-600">-KES {Number(t.totalDeductions ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-green-600 font-semibold">KES {Number(t.netToLandlord ?? t.netPayout ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        t.payoutStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Payouts to Landlord</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payouts.map((p: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{p.reference}</td>
                    <td className="px-4 py-3 text-gray-700">{p.period}</td>
                    <td className="px-4 py-3 font-semibold text-green-600">KES {Number(p.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500">{p.method}</td>
                    <td className="px-4 py-3 text-gray-500">{p.paidDate ? new Date(p.paidDate).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
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
