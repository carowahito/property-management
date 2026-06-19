'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatDate } from '@/lib/utils'

const STATUS_CONFIG: Record<string, { label: string; description: string; color: string; step: number }> = {
  NEW:                           { label: 'Logged',                  description: 'Your request has been received.',                    color: 'bg-neutral-100 text-neutral-700',   step: 1 },
  PENDING:                       { label: 'Logged',                  description: 'Your request has been received.',                    color: 'bg-neutral-100 text-neutral-700',   step: 1 },
  UNDER_REVIEW:                  { label: 'Under Review',            description: 'Our team is reviewing your request.',               color: 'bg-blue-100 text-blue-800',         step: 2 },
  RESPONSIBILITY_ASSIGNED:       { label: 'Vendor Being Sourced',    description: 'A vendor has been assigned to inspect the issue.',   color: 'bg-indigo-100 text-indigo-800',     step: 3 },
  QUOTING:                       { label: 'Getting Quotes',          description: 'The vendor is preparing a quote.',                   color: 'bg-purple-100 text-purple-800',     step: 3 },
  AWAITING_APPROVAL:             { label: 'Quote Ready',             description: 'A quote is ready for review.',                      color: 'bg-yellow-100 text-yellow-800',     step: 4 },
  AWAITING_FUNDS:                { label: 'Payment Required',        description: 'Please make the required deposit payment.',          color: 'bg-orange-100 text-orange-800',     step: 4 },
  IN_PROGRESS:                   { label: 'Work In Progress',        description: 'The contractor is working on your request.',         color: 'bg-primary-100 text-primary-800',   step: 5 },
  COMPLETED_PENDING_CONFIRMATION:{ label: 'Please Confirm',          description: 'Work is done — please confirm you are satisfied.',   color: 'bg-teal-100 text-teal-800',         step: 5 },
  CLOSED:                        { label: 'Closed',                  description: 'This request has been resolved and closed.',         color: 'bg-success-100 text-success-800',   step: 6 },
  COMPLETED:                     { label: 'Completed',               description: 'This request has been completed.',                   color: 'bg-success-100 text-success-800',   step: 6 },
  DISPUTED:                      { label: 'Disputed',                description: 'You raised a dispute — our team will follow up.',   color: 'bg-red-100 text-red-800',           step: 4 },
  REJECTED:                      { label: 'Rejected',                description: 'This request was rejected.',                        color: 'bg-neutral-100 text-neutral-700',   step: 0 },
  CANCELLED:                     { label: 'Cancelled',               description: 'This request was cancelled.',                       color: 'bg-neutral-100 text-neutral-700',   step: 0 },
}

const PRIORITY_COLOR: Record<string, string> = {
  URGENT: 'text-red-600 font-semibold',
  HIGH:   'text-orange-600',
  MEDIUM: 'text-yellow-600',
  LOW:    'text-neutral-500',
}

const STEPS = ['Logged', 'Under Review', 'Quoting', 'Approved', 'In Progress', 'Closed']

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'bg-neutral-100 text-neutral-700' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

function ProgressBar({ status }: { status: string }) {
  const step = STATUS_CONFIG[status]?.step ?? 0
  if (step === 0) return null
  const pct = Math.round(((step - 1) / (STEPS.length - 1)) * 100)
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-neutral-400 mb-1">
        {STEPS.map((s, i) => (
          <span key={i} className={i + 1 <= step ? 'text-primary-600 font-medium' : ''}>{s}</span>
        ))}
      </div>
      <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
        <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function ServiceRequestsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tenant-maintenance-requests'],
    queryFn: () => fetch('/api/maintenance-requests').then(r => r.json()),
  })

  const requests: any[] = data?.maintenanceRequests ?? []
  const open = requests.filter(r => !['CLOSED', 'COMPLETED', 'CANCELLED', 'REJECTED'].includes(r.status))
  const closed = requests.filter(r => ['CLOSED', 'COMPLETED', 'CANCELLED', 'REJECTED'].includes(r.status))

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">My Requests</h1>
          <p className="text-sm text-neutral-500 mt-1">Track the status of your maintenance and repair requests</p>
        </div>
        <Link
          href="/tenant/maintenance/new"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
        >
          + New Request
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          Failed to load requests. Please refresh.
        </div>
      )}

      {!isLoading && !error && requests.length === 0 && (
        <div className="text-center py-20 bg-surface rounded-lg shadow">
          <svg className="mx-auto h-12 w-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-4 text-sm font-medium text-neutral-900">No requests yet</h3>
          <p className="mt-1 text-sm text-neutral-500">Submit a maintenance request and track its progress here.</p>
          <Link
            href="/tenant/maintenance/new"
            className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
          >
            Submit a request
          </Link>
        </div>
      )}

      {/* Open requests */}
      {open.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
            Active ({open.length})
          </h2>
          <div className="space-y-4">
            {open.map((req) => {
              const cfg = STATUS_CONFIG[req.status]
              return (
                <div key={req.id} className="bg-surface shadow rounded-lg p-4 md:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-neutral-900">{req.title}</span>
                        {req.priority && req.priority !== 'MEDIUM' && (
                          <span className={`text-xs ${PRIORITY_COLOR[req.priority] ?? ''}`}>
                            {req.priority}
                          </span>
                        )}
                      </div>
                      {req.category && (
                        <p className="text-xs text-neutral-500 mt-0.5">{req.category}</p>
                      )}
                      <p className="text-xs text-neutral-400 mt-0.5">Submitted {formatDate(req.createdAt)}</p>
                      {cfg?.description && (
                        <p className="text-xs text-neutral-600 mt-2 italic">{cfg.description}</p>
                      )}
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                  <ProgressBar status={req.status} />
                  {req.status === 'AWAITING_APPROVAL' && (
                    <div className="mt-3 pt-3 border-t border-neutral-100">
                      <Link
                        href="/tenant/quotes"
                        className="text-xs font-medium text-primary-600 hover:text-primary-800"
                      >
                        View quote and approve →
                      </Link>
                    </div>
                  )}
                  {req.status === 'AWAITING_FUNDS' && (
                    <div className="mt-3 pt-3 border-t border-neutral-100">
                      <p className="text-xs text-orange-700 font-medium">
                        Deposit of KSh {req.depositAmount ? Number(req.depositAmount).toLocaleString() : '—'} required before work begins.
                      </p>
                    </div>
                  )}
                  {req.status === 'COMPLETED_PENDING_CONFIRMATION' && (
                    <div className="mt-3 pt-3 border-t border-neutral-100">
                      <Link
                        href="/tenant/quotes"
                        className="text-xs font-medium text-teal-700 hover:text-teal-900"
                      >
                        Confirm work is complete →
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Closed requests */}
      {closed.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
            Closed ({closed.length})
          </h2>
          <div className="space-y-3">
            {closed.map((req) => (
              <div key={req.id} className="bg-surface shadow-sm rounded-lg p-4 opacity-75">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-700">{req.title}</p>
                    <p className="text-xs text-neutral-400">{formatDate(req.createdAt)}</p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
