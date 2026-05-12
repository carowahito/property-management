'use client'

import { useQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function LandlordAnalytics() {
  const { data: propertiesData, isLoading: loadingProps } = useQuery({
    queryKey: ['landlord-analytics-properties'],
    queryFn: () => fetch('/api/properties').then(r => r.json()),
  })

  const { data: payoutsData, isLoading: loadingPayouts } = useQuery({
    queryKey: ['landlord-analytics-payouts'],
    queryFn: () => fetch('/api/payouts').then(r => r.json()),
  })

  const { data: unitsData, isLoading: loadingUnits } = useQuery({
    queryKey: ['landlord-analytics-units'],
    queryFn: () => fetch('/api/units').then(r => r.json()),
  })

  if (loadingProps || loadingPayouts || loadingUnits) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const properties = propertiesData?.properties || []
  const payouts = payoutsData?.payouts || []
  const units = unitsData?.units || []

  const totalPaidOut = payouts
    .filter((p: any) => p.status === 'PAID')
    .reduce((s: number, p: any) => s + Number(p.amount), 0)

  const totalUnits = units.length
  const occupiedUnits = units.filter((u: any) => u.status === 'OCCUPIED').length
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0

  const avgPayout = payouts.length > 0
    ? Math.round(totalPaidOut / payouts.filter((p: any) => p.status === 'PAID').length)
    : 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-neutral-900 mb-8">Analytics &amp; Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface shadow rounded-lg p-6">
          <p className="text-sm text-neutral-600">Properties</p>
          <p className="text-3xl font-bold text-neutral-900 mt-1">{properties.length}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-6">
          <p className="text-sm text-neutral-600">Occupancy Rate</p>
          <p className="text-3xl font-bold text-success-600 mt-1">{occupancyRate}%</p>
          <p className="text-xs text-neutral-500 mt-1">{occupiedUnits} of {totalUnits} units</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-6">
          <p className="text-sm text-neutral-600">Total Received</p>
          <p className="text-3xl font-bold text-neutral-900 mt-1">KES {totalPaidOut.toLocaleString()}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-6">
          <p className="text-sm text-neutral-600">Avg Monthly Payout</p>
          <p className="text-3xl font-bold text-neutral-900 mt-1">KES {avgPayout.toLocaleString()}</p>
        </div>
      </div>

      {/* Payout Timeline */}
      <div className="bg-surface shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Payout Timeline</h2>
        {payouts.length === 0 ? (
          <p className="text-neutral-500 py-8 text-center">No payout data available.</p>
        ) : (
          <div className="space-y-3">
            {payouts.filter((p: any) => p.status === 'PAID').map((p: any) => (
              <div key={p.id} className="flex justify-between items-center py-2 border-b border-neutral-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{p.period}</p>
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
