'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatDate } from '@/lib/utils'

const STATUS_CONFIG: Record<string, { label: string; description: string; color: string; step: number }> = {
  NEW:                            { label: 'Logged',              description: 'Your request has been received and is awaiting review.',         color: 'bg-neutral-100 text-neutral-700',  step: 1 },
  PENDING:                        { label: 'Logged',              description: 'Your request has been received and is awaiting review.',         color: 'bg-neutral-100 text-neutral-700',  step: 1 },
  UNDER_REVIEW:                   { label: 'Under Review',        description: 'Our team is reviewing your request.',                           color: 'bg-blue-100 text-blue-800',        step: 2 },
  RESPONSIBILITY_ASSIGNED:        { label: 'Vendor Sourced',      description: 'A vendor has been assigned to inspect and prepare a quote.',    color: 'bg-indigo-100 text-indigo-800',    step: 3 },
  QUOTING:                        { label: 'Getting Quotes',      description: 'The vendor is preparing a quote for the repair.',               color: 'bg-purple-100 text-purple-800',    step: 3 },
  AWAITING_APPROVAL:              { label: 'Quote Ready',         description: 'A quote is ready — please review and approve.',                 color: 'bg-yellow-100 text-yellow-800',    step: 4 },
  AWAITING_FUNDS:                 { label: 'Payment Required',    description: 'Please make the required deposit before work can begin.',       color: 'bg-orange-100 text-orange-800',    step: 4 },
  IN_PROGRESS:                    { label: 'Work In Progress',    description: 'The contractor is currently working on your request.',          color: 'bg-primary-100 text-primary-800',  step: 5 },
  COMPLETED_PENDING_CONFIRMATION: { label: 'Please Confirm',      description: 'Work is done — please confirm you are satisfied.',             color: 'bg-teal-100 text-teal-800',        step: 5 },
  CLOSED:                         { label: 'Closed',              description: 'This request has been resolved and closed.',                    color: 'bg-success-100 text-success-800',  step: 6 },
  COMPLETED:                      { label: 'Completed',           description: 'This request has been completed.',                             color: 'bg-success-100 text-success-800',  step: 6 },
  DISPUTED:                       { label: 'Disputed',            description: 'You raised a dispute — our team will follow up.',              color: 'bg-red-100 text-red-800',          step: 4 },
  REJECTED:                       { label: 'Rejected',            description: 'This request was rejected.',                                   color: 'bg-neutral-100 text-neutral-700',  step: 0 },
  CANCELLED:                      { label: 'Cancelled',           description: 'This request was cancelled.',                                  color: 'bg-neutral-100 text-neutral-700',  step: 0 },
}

const STEPS = ['Logged', 'Reviewing', 'Quoting', 'Approved', 'In Progress', 'Closed']

const PRIORITY_COLOR: Record<string, string> = {
  URGENT: 'text-red-600 font-semibold',
  HIGH:   'text-orange-600',
  MEDIUM: 'text-yellow-600',
  LOW:    'text-neutral-400',
}

const CLOSED_STATUSES = new Set(['CLOSED', 'COMPLETED', 'CANCELLED', 'REJECTED'])

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'bg-neutral-100 text-neutral-700' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

function ProgressBar({ status }: { status: string }) {
  const step = STATUS_CONFIG[status]?.step ?? 0
  if (step === 0) return null
  const pct = Math.round(((step - 1) / (STEPS.length - 1)) * 100)
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs mb-1">
        {STEPS.map((s, i) => (
          <span key={i} className={i + 1 <= step ? 'text-primary-600 font-medium' : 'text-neutral-300'}>
            {s}
          </span>
        ))}
      </div>
      <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
        <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function ServiceRequestsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active')

  const { data, isLoading, error } = useQuery({
    queryKey: ['tenant-service-requests'],
    queryFn: () => fetch('/api/maintenance-requests').then(r => r.json()),
  })

  const requests: any[] = data?.maintenanceRequests ?? []
  const active = requests.filter(r => !CLOSED_STATUSES.has(r.status))
  const closed = requests.filter(r => CLOSED_STATUSES.has(r.status))
  const displayed = activeTab === 'active' ? active : closed

  const stats = {
    active: active.length,
    inProgress: requests.filter(r => r.status === 'IN_PROGRESS').length,
    closed: closed.length,
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Service Requests</h1>
          <p className="text-sm text-neutral-500 mt-1">Submit and track your maintenance and repair requests</p>
        </div>
        <Link
          href="/tenant/maintenance/new"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
        >
          + New Request
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-xs text-neutral-500 font-medium">Active</p>
          <p className="mt-1 text-2xl font-bold text-yellow-600">{stats.active}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-xs text-neutral-500 font-medium">In Progress</p>
          <p className="mt-1 text-2xl font-bold text-primary-600">{stats.inProgress}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-xs text-neutral-500 font-medium">Closed</p>
          <p className="mt-1 text-2xl font-bold text-success-600">{stats.closed}</p>
        </div>
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

      {!isLoading && !error && (
        <div className="bg-surface shadow rounded-lg">
          {/* Tabs */}
          <div className="border-b border-neutral-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('active')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium ${
                  activeTab === 'active'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                Active ({active.length})
              </button>
              <button
                onClick={() => setActiveTab('closed')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium ${
                  activeTab === 'closed'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                Closed ({closed.length})
              </button>
            </nav>
          </div>

          {/* List */}
          <div className="divide-y divide-neutral-200">
            {displayed.length === 0 ? (
              <div className="p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="mt-4 text-sm text-neutral-500">
                  {activeTab === 'active' ? 'No active requests.' : 'No closed requests yet.'}
                </p>
                {activeTab === 'active' && (
                  <Link
                    href="/tenant/maintenance/new"
                    className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
                  >
                    Submit a request
                  </Link>
                )}
              </div>
            ) : (
              displayed.map((req) => {
                const cfg = STATUS_CONFIG[req.status]
                const isClosed = CLOSED_STATUSES.has(req.status)
                return (
                  <Link
                    key={req.id}
                    href={`/tenant/maintenance/${req.id}`}
                    className="block p-5 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Title row */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-semibold text-neutral-900">{req.title}</span>
                          {req.priority && req.priority !== 'MEDIUM' && (
                            <span className={`text-xs ${PRIORITY_COLOR[req.priority] ?? ''}`}>
                              {req.priority}
                            </span>
                          )}
                          {req.category && (
                            <span className="text-xs text-neutral-400">· {req.category}</span>
                          )}
                        </div>

                        {/* Description */}
                        {req.description && (
                          <p className="text-sm text-neutral-600 line-clamp-2 mb-2">{req.description}</p>
                        )}

                        {/* Meta */}
                        <div className="flex flex-wrap gap-x-4 text-xs text-neutral-400">
                          <span>Submitted {formatDate(req.createdAt)}</span>
                          {req.property?.name && <span>{req.property.name}</span>}
                          {isClosed && req.resolvedAt && (
                            <span className="text-success-600">Resolved {formatDate(req.resolvedAt)}</span>
                          )}
                        </div>

                        {/* Status description + CTA */}
                        {!isClosed && cfg?.description && (
                          <p className="text-xs text-neutral-500 italic mt-2">{cfg.description}</p>
                        )}
                        {req.status === 'AWAITING_APPROVAL' && (
                          <span className="mt-2 inline-block text-xs font-medium text-primary-600">
                            View and approve quote →
                          </span>
                        )}
                        {req.status === 'AWAITING_FUNDS' && (
                          <p className="mt-2 text-xs font-medium text-orange-700">
                            Deposit of KSh {req.depositAmount ? Number(req.depositAmount).toLocaleString() : '—'} required.
                          </p>
                        )}
                        {req.status === 'COMPLETED_PENDING_CONFIRMATION' && (
                          <span className="mt-2 inline-block text-xs font-medium text-teal-700">
                            Confirm work is complete →
                          </span>
                        )}

                        {/* Progress bar for active requests */}
                        {!isClosed && <ProgressBar status={req.status} />}
                      </div>

                      <StatusBadge status={req.status} />
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Emergency contact */}
      <div className="mt-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-primary-900 mb-1">Need Emergency Assistance?</h3>
        <p className="text-sm text-primary-800 mb-3">
          For urgent issues requiring immediate attention (flooding, gas leak, no power), call our emergency line:
        </p>
        <a
          href="tel:+254700000000"
          className="inline-flex items-center px-4 py-2 border border-primary-300 text-sm font-medium rounded-md text-primary-900 bg-white hover:bg-primary-50"
        >
          📞 +254 700 000 000
        </a>
      </div>
    </div>
  )
}
