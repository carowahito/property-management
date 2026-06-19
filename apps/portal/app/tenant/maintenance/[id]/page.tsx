'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatDate, formatRefNumber } from '@/lib/utils'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  NEW:                            { label: 'Logged',               color: 'bg-neutral-100 text-neutral-700' },
  PENDING:                        { label: 'Logged',               color: 'bg-neutral-100 text-neutral-700' },
  UNDER_REVIEW:                   { label: 'Under Review',         color: 'bg-blue-100 text-blue-800' },
  RESPONSIBILITY_ASSIGNED:        { label: 'Vendor Sourced',       color: 'bg-indigo-100 text-indigo-800' },
  QUOTING:                        { label: 'Getting Quotes',       color: 'bg-purple-100 text-purple-800' },
  AWAITING_APPROVAL:              { label: 'Quote Ready',          color: 'bg-yellow-100 text-yellow-800' },
  AWAITING_FUNDS:                 { label: 'Payment Required',     color: 'bg-orange-100 text-orange-800' },
  IN_PROGRESS:                    { label: 'Work In Progress',     color: 'bg-primary-100 text-primary-800' },
  COMPLETED_PENDING_CONFIRMATION: { label: 'Please Confirm',       color: 'bg-teal-100 text-teal-800' },
  CLOSED:                         { label: 'Closed',               color: 'bg-success-100 text-success-800' },
  COMPLETED:                      { label: 'Completed',            color: 'bg-success-100 text-success-800' },
  DISPUTED:                       { label: 'Disputed',             color: 'bg-red-100 text-red-800' },
  CANCELLED:                      { label: 'Cancelled',            color: 'bg-neutral-100 text-neutral-500' },
}

const PRIORITY_COLOR: Record<string, string> = {
  URGENT: 'text-red-600 font-semibold',
  HIGH:   'text-orange-600',
  MEDIUM: 'text-yellow-600',
  LOW:    'text-neutral-500',
}

const AUDIT_ICON: Record<string, string> = {
  system: '⚙️',
  CANCELLED: '🚫',
  CLOSED: '✅',
  COMPLETED: '✅',
  IN_PROGRESS: '🔧',
  AWAITING_FUNDS: '💰',
  AWAITING_APPROVAL: '📋',
  QUOTING: '📝',
  RESPONSIBILITY_ASSIGNED: '👷',
  UNDER_REVIEW: '🔍',
}

const CANNOT_CANCEL = new Set([
  'IN_PROGRESS', 'COMPLETED_PENDING_CONFIRMATION', 'COMPLETED', 'CLOSED', 'CANCELLED',
])

export default function MaintenanceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const requestId = params.id as string

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const { data: req, isLoading, error } = useQuery({
    queryKey: ['maintenance-request', requestId],
    queryFn: () => fetch(`/api/maintenance-requests/${requestId}`).then(r => {
      if (!r.ok) throw new Error('Failed to load request')
      return r.json()
    }),
    enabled: !!requestId,
  })

  const cancelMutation = useMutation({
    mutationFn: async (reason: string) => {
      const res = await fetch(`/api/maintenance-requests/${requestId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to cancel request')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-service-requests'] })
      setShowCancelModal(false)
      setCancelReason('')
      router.push('/tenant/requests')
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !req) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          Could not load this request. <Link href="/tenant/requests" className="underline">Go back</Link>
        </div>
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[req.status] ?? { label: req.status, color: 'bg-neutral-100 text-neutral-700' }
  const canCancel = !CANNOT_CANCEL.has(req.status)
  const auditLogs: any[] = req.auditLogs ?? []
  const contractor = req.assignedContractor

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex text-sm">
        <Link href="/tenant/requests" className="text-primary-600 hover:text-primary-800">
          ← Service Requests
        </Link>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          {req.refNumber && (
            <p className="text-xs font-mono font-medium text-neutral-400 mb-1">{formatRefNumber(req.refNumber)}</p>
          )}
          <h1 className="text-2xl font-bold text-neutral-900">{req.title}</h1>
          <p className="text-xs text-neutral-400 mt-1">Submitted {formatDate(req.createdAt)}</p>
        </div>
        <span className={`shrink-0 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusCfg.color}`}>
          {statusCfg.label}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">

          {/* Details */}
          <div className="bg-surface shadow rounded-lg p-5">
            <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-4">Request Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              {req.category && (
                <div>
                  <p className="text-neutral-500">Category</p>
                  <p className="font-medium text-neutral-900">{req.category}</p>
                </div>
              )}
              <div>
                <p className="text-neutral-500">Priority</p>
                <p className={`font-medium ${PRIORITY_COLOR[req.priority] ?? 'text-neutral-900'}`}>{req.priority}</p>
              </div>
              {req.property && (
                <div>
                  <p className="text-neutral-500">Property</p>
                  <p className="font-medium text-neutral-900">{req.property.name}</p>
                </div>
              )}
              {req.unit && (
                <div>
                  <p className="text-neutral-500">Unit</p>
                  <p className="font-medium text-neutral-900">{req.unit}</p>
                </div>
              )}
              {req.resolvedAt && (
                <div>
                  <p className="text-neutral-500">Resolved</p>
                  <p className="font-medium text-neutral-900">{formatDate(req.resolvedAt)}</p>
                </div>
              )}
              {req.estimatedCost && (
                <div>
                  <p className="text-neutral-500">Estimated Cost</p>
                  <p className="font-medium text-neutral-900">KSh {Number(req.estimatedCost).toLocaleString()}</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-neutral-500 text-sm mb-1">Description</p>
              <p className="text-neutral-900 text-sm whitespace-pre-line">{req.description}</p>
            </div>
          </div>

          {/* Quotes */}
          {req.quotes?.length > 0 && (
            <div className="bg-surface shadow rounded-lg p-5">
              <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-4">Quotes</h2>
              <div className="space-y-3">
                {req.quotes.map((q: any) => (
                  <div key={q.id} className={`rounded-lg border p-3 text-sm ${q.isSelected ? 'border-primary-400 bg-primary-50' : 'border-neutral-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-900">KSh {Number(q.amount).toLocaleString()}</span>
                      {q.isSelected && <span className="text-xs font-medium text-primary-700 bg-primary-100 px-2 py-0.5 rounded-full">Selected</span>}
                    </div>
                    <p className="text-neutral-500 mt-0.5">{q.contractor?.name}</p>
                    {q.notes && <p className="text-neutral-600 mt-1 italic">{q.notes}</p>}
                    <p className="text-neutral-400 text-xs mt-1">Valid until {formatDate(q.validUntil)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit timeline */}
          {auditLogs.length > 0 && (
            <div className="bg-surface shadow rounded-lg p-5">
              <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-4">Activity Timeline</h2>
              <div className="space-y-4">
                {auditLogs.map((log: any) => (
                  <div key={log.id} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-sm shrink-0 mt-0.5">
                      {AUDIT_ICON[log.toStatus ?? ''] ?? '📋'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-neutral-900">
                          {log.actorName && log.actor !== 'system' ? log.actorName : 'System'}
                        </p>
                        <p className="text-xs text-neutral-400 shrink-0">{formatDate(log.createdAt)}</p>
                      </div>
                      {log.note && <p className="text-sm text-neutral-600 mt-0.5">{log.note}</p>}
                      {log.toStatus && (
                        <p className="text-xs text-neutral-400 mt-0.5">
                          Status → {STATUS_CONFIG[log.toStatus]?.label ?? log.toStatus}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Contractor */}
          {contractor && (
            <div className="bg-surface shadow rounded-lg p-5">
              <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-3">Assigned Vendor</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-neutral-500">Name</p>
                  <p className="font-medium text-neutral-900">{contractor.name}</p>
                </div>
                {contractor.trade && (
                  <div>
                    <p className="text-neutral-500">Trade</p>
                    <p className="font-medium text-neutral-900">{contractor.trade}</p>
                  </div>
                )}
                {contractor.phone && (
                  <div>
                    <p className="text-neutral-500">Phone</p>
                    <a href={`tel:${contractor.phone}`} className="font-medium text-primary-600 hover:text-primary-800">
                      {contractor.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Deposit info */}
          {req.depositRequired && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm">
              <p className="font-semibold text-orange-900 mb-1">Deposit Required</p>
              <p className="text-orange-800">KSh {Number(req.depositAmount).toLocaleString()} (50% upfront)</p>
              {req.depositPaidAt && (
                <p className="text-green-700 mt-1">✓ Paid {formatDate(req.depositPaidAt)}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="bg-surface shadow rounded-lg p-5">
            <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-3">Actions</h2>
            <div className="space-y-2">
              {req.status === 'AWAITING_APPROVAL' && (
                <Link
                  href="/tenant/quotes"
                  className="block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
                >
                  Review & Approve Quote
                </Link>
              )}
              {req.status === 'COMPLETED_PENDING_CONFIRMATION' && (
                <Link
                  href="/tenant/quotes"
                  className="block w-full text-center px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700"
                >
                  Confirm Work Complete
                </Link>
              )}
              {canCancel && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full px-4 py-2 bg-white border border-red-300 text-red-600 rounded-md text-sm font-medium hover:bg-red-50"
                >
                  Cancel Request
                </button>
              )}
            </div>
          </div>

          {/* Emergency */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-primary-900 mb-1">Need Immediate Help?</h3>
            <p className="text-xs text-primary-800 mb-2">For urgent issues call our emergency line:</p>
            <a
              href="tel:+254700000000"
              className="block text-center px-3 py-2 bg-primary-600 text-white rounded-md text-xs font-medium hover:bg-primary-700"
            >
              📞 +254 700 000 000
            </a>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-neutral-900 mb-1">Cancel Request</h3>
            <p className="text-sm text-neutral-600 mb-4">
              Are you sure you want to cancel <strong>"{req.title}"</strong>? Please tell us why so we can improve our service.
            </p>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Reason for cancellation <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Issue resolved on its own, no longer needed, found another solution..."
              className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
            />
            {cancelMutation.isError && (
              <p className="mt-2 text-sm text-red-600">{(cancelMutation.error as Error).message}</p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowCancelModal(false); setCancelReason('') }}
                disabled={cancelMutation.isPending}
                className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md text-sm font-medium hover:bg-neutral-50"
              >
                Keep Request
              </button>
              <button
                onClick={() => cancelMutation.mutate(cancelReason)}
                disabled={cancelMutation.isPending || !cancelReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelMutation.isPending ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
