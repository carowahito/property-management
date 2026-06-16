'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

function monthsBetween(a: Date, b: Date) {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
}

function formatDuration(months: number) {
  const yrs = Math.floor(months / 12)
  const mos = months % 12
  if (yrs === 0) return `${mos} month${mos !== 1 ? 's' : ''}`
  if (mos === 0) return `${yrs} year${yrs !== 1 ? 's' : ''}`
  return `${yrs} yr${yrs !== 1 ? 's' : ''} ${mos} mo`
}

function StatCard({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: 'good' | 'warn' | 'bad' }) {
  const valueColor = highlight === 'good'
    ? 'text-success-700'
    : highlight === 'bad'
    ? 'text-danger-700'
    : highlight === 'warn'
    ? 'text-yellow-700'
    : 'text-neutral-900'
  return (
    <div className="bg-surface shadow rounded-lg p-6">
      <p className="text-sm text-neutral-500 font-medium">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</p>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function TenantAnalyticsPage() {
  const { data: session } = useSession()
  const tenantId = session?.user?.id

  const { data: paymentsData, isLoading: loadingPayments } = useQuery({
    queryKey: ['analytics-payments'],
    queryFn: () => fetch('/api/payments?limit=200').then(r => r.json()),
    enabled: !!tenantId,
  })

  const { data: leasesData, isLoading: loadingLeases } = useQuery({
    queryKey: ['analytics-leases'],
    queryFn: () => fetch('/api/leases').then(r => r.json()),
    enabled: !!tenantId,
  })

  const { data: tenantData, isLoading: loadingTenant } = useQuery({
    queryKey: ['analytics-tenant', tenantId],
    queryFn: () => fetch(`/api/tenants/${tenantId}`).then(r => r.json()),
    enabled: !!tenantId,
  })

  const { data: maintenanceData, isLoading: loadingMaint } = useQuery({
    queryKey: ['analytics-maintenance'],
    queryFn: () => fetch('/api/maintenance-requests').then(r => r.json()),
    enabled: !!tenantId,
  })

  if (loadingPayments || loadingLeases || loadingTenant || loadingMaint) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const now = new Date()
  const payments: any[] = paymentsData?.payments || []
  const leases: any[] = leasesData?.leases || []
  const tenant = tenantData
  const requests: any[] = maintenanceData?.requests || maintenanceData?.maintenanceRequests || []

  const activeLease = leases.find((l: any) => l.status === 'ACTIVE')
  const allLeases = leases.filter((l: any) => ['ACTIVE', 'EXPIRED', 'TERMINATED'].includes(l.status))

  // ── Tenancy duration ──────────────────────────────────────────────────────
  const moveInDate = tenant?.moveInDate ? new Date(tenant.moveInDate) : null
  const leaseStart = activeLease?.startDate ? new Date(activeLease.startDate) : null
  const leaseEnd = activeLease?.endDate ? new Date(activeLease.endDate) : null
  const tenancyStart = moveInDate ?? leaseStart

  const monthsAtUnit = tenancyStart ? monthsBetween(tenancyStart, now) : null
  const monthsRemaining = leaseEnd ? monthsBetween(now, leaseEnd) : null
  const leaseProgress = leaseStart && leaseEnd
    ? Math.min(100, Math.round((now.getTime() - leaseStart.getTime()) / (leaseEnd.getTime() - leaseStart.getTime()) * 100))
    : null

  // ── Payment analytics ─────────────────────────────────────────────────────
  const paidPayments = payments.filter((p: any) => p.status === 'PAID')
  const overduePayments = payments.filter((p: any) => p.status === 'OVERDUE')
  const totalPaid = paidPayments.reduce((s: number, p: any) => s + Number(p.amount), 0)
  const avgPayment = paidPayments.length > 0 ? Math.round(totalPaid / paidPayments.length) : 0

  // Late payments: paid but paidDate > dueDate + grace (5 days default)
  const latePayments = paidPayments.filter((p: any) => {
    if (!p.paidDate || !p.dueDate) return false
    const due = new Date(p.dueDate)
    due.setDate(due.getDate() + (activeLease?.gracePeriodDays ?? 5))
    return new Date(p.paidDate) > due
  })

  const onTimeCount = paidPayments.length - latePayments.length
  const onTimeRate = paidPayments.length > 0
    ? Math.round((onTimeCount / paidPayments.length) * 100)
    : 100

  // Earliest and latest payment months to build streak
  const paidMonthKeys = new Set(
    paidPayments.map((p: any) => {
      const d = new Date(p.dueDate)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    })
  )

  // Consecutive on-time streak (months from now going back)
  let streak = 0
  if (paidPayments.length > 0) {
    const cur = new Date(now.getFullYear(), now.getMonth(), 1)
    for (let i = 0; i < 24; i++) {
      const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`
      if (!paidMonthKeys.has(key)) break
      const monthPayment = paidPayments.find((p: any) => {
        const d = new Date(p.dueDate)
        return d.getFullYear() === cur.getFullYear() && d.getMonth() === cur.getMonth()
      })
      if (!monthPayment) break
      const due = new Date(monthPayment.dueDate)
      due.setDate(due.getDate() + (activeLease?.gracePeriodDays ?? 5))
      if (monthPayment.paidDate && new Date(monthPayment.paidDate) > due) break
      streak++
      cur.setMonth(cur.getMonth() - 1)
    }
  }

  // ── Maintenance ────────────────────────────────────────────────────────────
  const resolvedRequests = requests.filter((r: any) => r.status === 'RESOLVED' || r.status === 'COMPLETED' || r.status === 'CLOSED')
  const openRequests = requests.filter((r: any) => !['RESOLVED', 'COMPLETED', 'CLOSED', 'CANCELLED'].includes(r.status))

  // ── Monthly rent trend ─────────────────────────────────────────────────────
  const recentPayments = [...paidPayments]
    .sort((a: any, b: any) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
    .slice(0, 6)
    .reverse()

  const MA = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Tenancy Analytics</h1>
        <p className="text-neutral-500 mt-1">A full picture of your time at this property</p>
      </div>

      {/* ── Tenancy Overview ── */}
      <section>
        <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">Tenancy Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Time at Unit"
            value={monthsAtUnit !== null ? formatDuration(monthsAtUnit) : '—'}
            sub={tenancyStart ? `Since ${tenancyStart.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}` : undefined}
          />
          <StatCard
            label="Lease Ends"
            value={leaseEnd ? leaseEnd.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
            sub={monthsRemaining !== null ? `${monthsRemaining} month${monthsRemaining !== 1 ? 's' : ''} remaining` : undefined}
            highlight={monthsRemaining !== null ? (monthsRemaining <= 1 ? 'bad' : monthsRemaining <= 3 ? 'warn' : 'good') : undefined}
          />
          <StatCard
            label="Monthly Rent"
            value={activeLease ? `KES ${Number(activeLease.unitRef?.monthlyRent ?? activeLease.monthlyRent ?? 0).toLocaleString()}` : '—'}
            sub={activeLease?.unitRef?.unitNumber ? `Unit ${activeLease.unitRef.unitNumber}` : undefined}
          />
          <StatCard
            label="Leases Signed"
            value={String(allLeases.length)}
            sub={allLeases.length > 1 ? `${allLeases.length - 1} renewal${allLeases.length > 2 ? 's' : ''}` : 'current lease'}
          />
        </div>

        {/* Lease progress bar */}
        {leaseProgress !== null && leaseStart && leaseEnd && (
          <div className="mt-4 bg-surface shadow rounded-lg p-5">
            <div className="flex justify-between text-xs text-neutral-500 mb-2">
              <span>Lease start — {leaseStart.toLocaleDateString('en-KE', { month: 'short', year: 'numeric' })}</span>
              <span className="font-semibold text-neutral-700">{leaseProgress}% complete</span>
              <span>Lease end — {leaseEnd.toLocaleDateString('en-KE', { month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all ${leaseProgress >= 90 ? 'bg-danger-500' : leaseProgress >= 70 ? 'bg-yellow-500' : 'bg-primary-500'}`}
                style={{ width: `${leaseProgress}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {/* ── Payment Performance ── */}
      <section>
        <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">Payment Performance</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="On-Time Rate"
            value={`${onTimeRate}%`}
            sub={`${onTimeCount} of ${paidPayments.length} payments`}
            highlight={onTimeRate >= 90 ? 'good' : onTimeRate >= 70 ? 'warn' : 'bad'}
          />
          <StatCard
            label="Late Payments"
            value={String(latePayments.length)}
            sub={latePayments.length === 0 ? 'Perfect record' : `Out of ${paidPayments.length} paid`}
            highlight={latePayments.length === 0 ? 'good' : latePayments.length <= 2 ? 'warn' : 'bad'}
          />
          <StatCard
            label="On-Time Streak"
            value={streak > 0 ? `${streak} mo` : '—'}
            sub={streak > 0 ? 'consecutive months' : 'No streak yet'}
            highlight={streak >= 6 ? 'good' : streak >= 3 ? 'warn' : undefined}
          />
          <StatCard
            label="Overdue Now"
            value={overduePayments.length > 0 ? String(overduePayments.length) : 'None'}
            highlight={overduePayments.length > 0 ? 'bad' : 'good'}
            sub={overduePayments.length > 0 ? `KES ${overduePayments.reduce((s: number, p: any) => s + Number(p.amount), 0).toLocaleString()} outstanding` : 'All clear'}
          />
        </div>
      </section>

      {/* ── Financial Summary ── */}
      <section>
        <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">Financial Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard
            label="Total Paid to Date"
            value={`KES ${totalPaid.toLocaleString()}`}
            sub={`${paidPayments.length} payment${paidPayments.length !== 1 ? 's' : ''}`}
          />
          <StatCard
            label="Average Payment"
            value={avgPayment > 0 ? `KES ${avgPayment.toLocaleString()}` : '—'}
          />
          <StatCard
            label="Payments Made"
            value={String(paidPayments.length)}
            sub={paidPayments.length > 0 ? `Last: ${new Date(paidPayments.sort((a: any, b: any) => new Date(b.paidDate ?? b.dueDate).getTime() - new Date(a.paidDate ?? a.dueDate).getTime())[0].paidDate ?? '').toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}` : undefined}
          />
        </div>

        {/* Recent payment history mini-chart */}
        {recentPayments.length > 0 && (
          <div className="mt-4 bg-surface shadow rounded-lg p-5">
            <h3 className="text-sm font-semibold text-neutral-700 mb-4">Recent Payments</h3>
            <div className="flex items-end gap-3 h-28">
              {recentPayments.map((p: any, i: number) => {
                const d = new Date(p.dueDate)
                const maxAmt = Math.max(...recentPayments.map((x: any) => Number(x.amount)))
                const heightPct = Math.max(10, Math.round((Number(p.amount) / maxAmt) * 100))
                const isLate = latePayments.some((l: any) => l.id === p.id)
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-neutral-400 font-mono">
                      {Number(p.amount) / 1000 >= 1 ? `${(Number(p.amount) / 1000).toFixed(0)}k` : Number(p.amount).toLocaleString()}
                    </span>
                    <div
                      className={`w-full rounded-t ${isLate ? 'bg-yellow-400' : 'bg-primary-500'}`}
                      style={{ height: `${heightPct}%` }}
                      title={isLate ? 'Paid late' : 'On time'}
                    />
                    <span className="text-xs text-neutral-400">{MA[d.getMonth()]}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-4 mt-3 text-xs text-neutral-400">
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-primary-500" /> On time</span>
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-yellow-400" /> Late</span>
            </div>
          </div>
        )}
      </section>

      {/* ── Maintenance ── */}
      <section>
        <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">Maintenance</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard
            label="Total Requests"
            value={String(requests.length)}
            sub={requests.length === 0 ? 'No issues reported' : undefined}
          />
          <StatCard
            label="Resolved"
            value={String(resolvedRequests.length)}
            sub={requests.length > 0 ? `${Math.round(resolvedRequests.length / requests.length * 100)}% resolution rate` : undefined}
            highlight={resolvedRequests.length === requests.length && requests.length > 0 ? 'good' : undefined}
          />
          <StatCard
            label="Open Requests"
            value={openRequests.length > 0 ? String(openRequests.length) : 'None'}
            highlight={openRequests.length > 0 ? 'warn' : 'good'}
            sub={openRequests.length > 0 ? 'Pending resolution' : 'All resolved'}
          />
        </div>
      </section>
    </div>
  )
}
