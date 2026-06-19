'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatDate, formatRefNumber } from '@/lib/utils'

type ActionState =
  | { type: 'idle' }
  | { type: 'approve'; requestId: string; quoteId: string; amount: number; title: string }
  | { type: 'decline'; requestId: string; title: string }
  | { type: 'confirm'; requestId: string; title: string }

export default function TenantQuotesPage() {
  const queryClient = useQueryClient()
  const [action, setAction] = useState<ActionState>({ type: 'idle' })
  const [declineReason, setDeclineReason] = useState('')
  const [satisfied, setSatisfied] = useState(true)
  const [disputeReason, setDisputeReason] = useState('')

  // Fetch requests awaiting quote approval
  const { data: awaitingData, isLoading: loadingAwaiting } = useQuery({
    queryKey: ['tenant-quotes-awaiting'],
    queryFn: () => fetch('/api/maintenance-requests?status=AWAITING_APPROVAL').then(r => r.json()),
  })

  // Fetch requests awaiting work confirmation
  const { data: confirmData, isLoading: loadingConfirm } = useQuery({
    queryKey: ['tenant-quotes-confirm'],
    queryFn: () => fetch('/api/maintenance-requests?status=COMPLETED_PENDING_CONFIRMATION').then(r => r.json()),
  })

  const approveMutation = useMutation({
    mutationFn: async ({ requestId, decision, rejectionReason }: { requestId: string; decision: 'APPROVED' | 'REJECTED'; rejectionReason?: string }) => {
      const res = await fetch(`/api/maintenance-requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, rejectionReason }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Request failed')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-quotes-awaiting'] })
      queryClient.invalidateQueries({ queryKey: ['tenant-service-requests'] })
      setAction({ type: 'idle' })
      setDeclineReason('')
    },
  })

  const confirmMutation = useMutation({
    mutationFn: async ({ requestId, isSatisfied, reason }: { requestId: string; isSatisfied: boolean; reason?: string }) => {
      const res = await fetch(`/api/maintenance-requests/${requestId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ satisfied: isSatisfied, disputeReason: reason }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Request failed')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-quotes-confirm'] })
      queryClient.invalidateQueries({ queryKey: ['tenant-service-requests'] })
      setAction({ type: 'idle' })
      setSatisfied(true)
      setDisputeReason('')
    },
  })

  const awaiting: any[] = awaitingData?.maintenanceRequests ?? []
  const toConfirm: any[] = confirmData?.maintenanceRequests ?? []
  const isLoading = loadingAwaiting || loadingConfirm

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/tenant/requests" className="text-sm text-primary-600 hover:text-primary-800">
          ← Service Requests
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">Quotes & Confirmations</h1>
        <p className="text-sm text-neutral-500 mt-1">Review quotes awaiting your approval and confirm completed work</p>
      </div>

      {/* Quotes awaiting approval */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Quotes to Review
          {awaiting.length > 0 && (
            <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">{awaiting.length}</span>
          )}
        </h2>

        {awaiting.length === 0 ? (
          <div className="bg-surface shadow rounded-lg p-8 text-center text-sm text-neutral-400">
            No quotes pending your review right now.
          </div>
        ) : (
          <div className="space-y-5">
            {awaiting.map((req: any) => {
              const selectedQuote = req.quotes?.find((q: any) => q.isSelected) ?? req.quotes?.[0]
              return (
                <div key={req.id} className="bg-surface shadow rounded-lg p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      {req.refNumber && (
                        <p className="text-xs font-mono text-neutral-400 mb-0.5">{formatRefNumber(req.refNumber)}</p>
                      )}
                      <h3 className="font-semibold text-neutral-900">{req.title}</h3>
                      <p className="text-sm text-neutral-500 mt-0.5">{req.property?.name}</p>
                    </div>
                    <span className="shrink-0 text-xs font-medium bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full">
                      Quote Ready
                    </span>
                  </div>

                  {selectedQuote ? (
                    <div className="rounded-lg border border-neutral-200 p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-neutral-700">{selectedQuote.contractor?.name}</p>
                          {selectedQuote.notes && (
                            <p className="text-sm text-neutral-500 mt-0.5 italic">{selectedQuote.notes}</p>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-neutral-900">
                          KSh {Number(selectedQuote.amount).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-xs text-neutral-400">
                        Valid until {formatDate(selectedQuote.validUntil)} · Submitted {formatDate(selectedQuote.issuedAt)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-400 mb-4">No quote details available.</p>
                  )}

                  {req.responsibleParty && (
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 text-sm text-primary-800 mb-4">
                      <span className="font-medium">Responsibility: </span>
                      {req.responsibleParty === 'TENANT' ? 'This repair is your responsibility as the tenant.' : 'Covered by the landlord/property.'}
                      {req.responsibilityReason && ` ${req.responsibilityReason}`}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                    <p className="text-xs text-neutral-400">Submitted {formatDate(req.createdAt)}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setAction({ type: 'decline', requestId: req.id, title: req.title })}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => setAction({
                          type: 'approve',
                          requestId: req.id,
                          quoteId: selectedQuote?.id,
                          amount: Number(selectedQuote?.amount ?? 0),
                          title: req.title,
                        })}
                        className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
                      >
                        Approve & Proceed
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Work confirmations */}
      <section>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Work to Confirm
          {toConfirm.length > 0 && (
            <span className="ml-2 bg-teal-100 text-teal-800 text-xs font-medium px-2 py-0.5 rounded-full">{toConfirm.length}</span>
          )}
        </h2>

        {toConfirm.length === 0 ? (
          <div className="bg-surface shadow rounded-lg p-8 text-center text-sm text-neutral-400">
            No completed work awaiting your confirmation.
          </div>
        ) : (
          <div className="space-y-5">
            {toConfirm.map((req: any) => (
              <div key={req.id} className="bg-surface shadow rounded-lg p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    {req.refNumber && (
                      <p className="text-xs font-mono text-neutral-400 mb-0.5">{formatRefNumber(req.refNumber)}</p>
                    )}
                    <h3 className="font-semibold text-neutral-900">{req.title}</h3>
                    <p className="text-sm text-neutral-500 mt-0.5">{req.property?.name}</p>
                  </div>
                  <span className="shrink-0 text-xs font-medium bg-teal-100 text-teal-800 px-2.5 py-1 rounded-full">
                    Please Confirm
                  </span>
                </div>
                {req.assignedContractor && (
                  <p className="text-sm text-neutral-600 mb-3">
                    Work completed by <span className="font-medium">{req.assignedContractor.name}</span>
                  </p>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <p className="text-xs text-neutral-400">Submitted {formatDate(req.createdAt)}</p>
                  <button
                    onClick={() => setAction({ type: 'confirm', requestId: req.id, title: req.title })}
                    className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700"
                  >
                    Review & Confirm
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Approve modal */}
      {action.type === 'approve' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-neutral-900 mb-1">Approve Quote</h3>
            <p className="text-sm text-neutral-600 mb-4">
              You are approving the quote for <strong>"{action.title}"</strong>.
            </p>
            <div className="bg-neutral-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-neutral-600">Total amount</p>
              <p className="text-2xl font-bold text-neutral-900">KSh {action.amount.toLocaleString()}</p>
              {action.amount >= 10000 && (
                <p className="text-sm text-orange-700 mt-1">
                  A 50% deposit of KSh {(action.amount * 0.5).toLocaleString()} will be required before work begins.
                </p>
              )}
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800 mb-4">
              By approving, you authorise this repair to proceed. Work begins once payment is confirmed.
            </div>
            {approveMutation.isError && (
              <p className="mb-3 text-sm text-red-600">{(approveMutation.error as Error).message}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setAction({ type: 'idle' })}
                disabled={approveMutation.isPending}
                className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md text-sm font-medium hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={() => approveMutation.mutate({ requestId: action.requestId, decision: 'APPROVED' })}
                disabled={approveMutation.isPending}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                {approveMutation.isPending ? 'Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline modal */}
      {action.type === 'decline' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-neutral-900 mb-1">Decline Quote</h3>
            <p className="text-sm text-neutral-600 mb-4">
              Declining will send the request back for a revised quote. Please explain your concern.
            </p>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g. Quote seems too high, please get competitive alternatives"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            {approveMutation.isError && (
              <p className="mt-2 text-sm text-red-600">{(approveMutation.error as Error).message}</p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setAction({ type: 'idle' }); setDeclineReason('') }}
                disabled={approveMutation.isPending}
                className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md text-sm font-medium hover:bg-neutral-50"
              >
                Back
              </button>
              <button
                onClick={() => approveMutation.mutate({ requestId: action.requestId, decision: 'REJECTED', rejectionReason: declineReason })}
                disabled={approveMutation.isPending || !declineReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {approveMutation.isPending ? 'Declining...' : 'Decline Quote'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm work modal */}
      {action.type === 'confirm' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-neutral-900 mb-1">Confirm Work Completion</h3>
            <p className="text-sm text-neutral-600 mb-4">
              Are you satisfied with the work done for <strong>"{action.title}"</strong>?
            </p>
            <div className="space-y-3 mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="satisfaction"
                  checked={satisfied}
                  onChange={() => setSatisfied(true)}
                  className="text-primary-600"
                />
                <div>
                  <p className="text-sm font-medium text-neutral-900">Yes, work is complete and satisfactory</p>
                  <p className="text-xs text-neutral-500">This will close the request</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="satisfaction"
                  checked={!satisfied}
                  onChange={() => setSatisfied(false)}
                  className="text-primary-600"
                />
                <div>
                  <p className="text-sm font-medium text-neutral-900">No, I have concerns</p>
                  <p className="text-xs text-neutral-500">This will raise a dispute for the team to review</p>
                </div>
              </label>
            </div>
            {!satisfied && (
              <>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  What is the issue? <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Describe what was not completed or not done correctly..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </>
            )}
            {confirmMutation.isError && (
              <p className="mt-2 text-sm text-red-600">{(confirmMutation.error as Error).message}</p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setAction({ type: 'idle' }); setSatisfied(true); setDisputeReason('') }}
                disabled={confirmMutation.isPending}
                className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md text-sm font-medium hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmMutation.mutate({ requestId: action.requestId, isSatisfied: satisfied, reason: disputeReason })}
                disabled={confirmMutation.isPending || (!satisfied && !disputeReason.trim())}
                className={`flex-1 px-4 py-2 text-white rounded-md text-sm font-medium disabled:opacity-50 ${satisfied ? 'bg-teal-600 hover:bg-teal-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {confirmMutation.isPending ? 'Submitting...' : satisfied ? 'Confirm Complete' : 'Raise Dispute'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
