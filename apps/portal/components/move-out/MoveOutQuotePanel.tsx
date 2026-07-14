'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { SignaturePad } from '@/components/ui/SignaturePad'

// ── Types (mirror the API payload) ────────────────────────────────────────────

interface QuoteLine {
  id: string
  description: string
  room: string | null
  action: 'REPAIR' | 'REPLACE' | 'CLEAN'
  responsibility: 'TENANT' | 'LANDLORD' | 'SHARED'
  contractorName: string | null
  contractorContact: string | null
  unitCost: string | number
  quantity: string | number
  lineTotal: string | number
  tenantCharge: string | number
  sortOrder: number
}

interface Quote {
  id: string
  status: 'DRAFT' | 'AGREED' | 'DISPUTED' | 'SETTLED'
  depositHeld: string | number
  totalTenantCharge: string | number
  totalLandlordCost: string | number
  balanceDue: string | number
  refundDue: string | number
  validUntil: string
  sentToTenantAt: string | null
  tenantApprovedAt: string | null
  tenantApprovalVia: string | null
  disputeReason: string | null
  lines: QuoteLine[]
}

const money = (n: number | string) =>
  `KSh ${Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

const ACTIONS = ['REPAIR', 'REPLACE', 'CLEAN'] as const
const RESPONSIBILITIES = ['TENANT', 'LANDLORD', 'SHARED'] as const

const STATUS_VARIANT: Record<Quote['status'], 'warning' | 'success' | 'danger'> = {
  DRAFT: 'warning',
  AGREED: 'success',
  SETTLED: 'success',
  DISPUTED: 'danger',
}

export function MoveOutQuotePanel({
  inspectionId,
  open,
  onClose,
  onChanged,
}: {
  inspectionId: string
  open: boolean
  onClose: () => void
  onChanged?: () => void
}) {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [showApprovePad, setShowApprovePad] = useState(false)

  const fetchQuote = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/inspections/${inspectionId}/move-out-quote`)
      if (res.status === 404) {
        setQuote(null)
      } else if (res.ok) {
        setQuote(await res.json())
      } else {
        setError((await res.json()).error || 'Failed to load quote')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }, [inspectionId])

  useEffect(() => {
    if (open) fetchQuote()
  }, [open, fetchQuote])

  const isDraft = quote?.status === 'DRAFT'

  async function generate() {
    setBusy(true)
    try {
      const res = await fetch(`/api/inspections/${inspectionId}/move-out-quote`, { method: 'POST' })
      if (res.ok) {
        setQuote(await res.json())
        onChanged?.()
      } else {
        alert((await res.json()).error || 'Failed to generate quote')
      }
    } finally {
      setBusy(false)
    }
  }

  // Local edit of a line field; number fields parsed, PATCH sent on commit.
  function editLineLocal(lineId: string, patch: Partial<QuoteLine>) {
    setQuote((q) =>
      q ? { ...q, lines: q.lines.map((l) => (l.id === lineId ? { ...l, ...patch } : l)) } : q
    )
  }

  async function commitLine(lineId: string, patch: Record<string, unknown>) {
    if (!quote) return
    const res = await fetch(`/api/move-out-quotes/${quote.id}/lines/${lineId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (res.ok) {
      setQuote(await res.json())
      onChanged?.()
    } else {
      alert((await res.json()).error || 'Failed to update line')
      fetchQuote()
    }
  }

  async function addLine() {
    if (!quote) return
    setBusy(true)
    try {
      const res = await fetch(`/api/move-out-quotes/${quote.id}/lines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: 'New item', responsibility: 'TENANT', action: 'REPAIR' }),
      })
      if (res.ok) setQuote(await res.json())
    } finally {
      setBusy(false)
    }
  }

  async function deleteLine(lineId: string) {
    if (!quote) return
    const res = await fetch(`/api/move-out-quotes/${quote.id}/lines/${lineId}`, { method: 'DELETE' })
    if (res.ok) {
      setQuote(await res.json())
      onChanged?.()
    }
  }

  async function sendToTenant() {
    if (!quote) return
    setBusy(true)
    try {
      const res = await fetch(`/api/move-out-quotes/${quote.id}/send`, { method: 'POST' })
      const d = await res.json()
      if (res.ok) {
        alert(`Statement sent to ${d.sentTo}`)
        fetchQuote()
        onChanged?.()
      } else {
        alert(d.error || 'Failed to send')
      }
    } finally {
      setBusy(false)
    }
  }

  async function approveInPerson(signature: string) {
    if (!quote) return
    setBusy(true)
    try {
      const res = await fetch(`/api/move-out-quotes/${quote.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantSignature: signature, via: 'IN_PERSON' }),
      })
      if (res.ok) {
        setShowApprovePad(false)
        fetchQuote()
        onChanged?.()
      } else {
        alert((await res.json()).error || 'Failed to approve')
      }
    } finally {
      setBusy(false)
    }
  }

  const balanceDue = Number(quote?.balanceDue ?? 0)
  const refundDue = Number(quote?.refundDue ?? 0)

  return (
    <Modal open={open} onClose={onClose} className="max-w-5xl">
      <ModalHeader>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Statement of Repair Costs</h2>
          {quote && <Badge variant={STATUS_VARIANT[quote.status]}>{quote.status}</Badge>}
        </div>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">✕</button>
      </ModalHeader>

      <ModalBody>
        {loading && <p className="text-sm text-neutral-500">Loading…</p>}
        {error && <p className="text-sm text-danger-600">{error}</p>}

        {!loading && !quote && (
          <div className="text-center py-8">
            <p className="text-sm text-neutral-600 mb-4">
              No repairs quote exists for this inspection yet.
            </p>
            <Button variant="primary" onClick={generate} disabled={busy}>
              {busy ? 'Generating…' : 'Generate Statement of Repair Costs'}
            </Button>
          </div>
        )}

        {quote && (
          <div className="space-y-4">
            {/* Validity + estimate notice */}
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              This quote is valid until <strong>{fmtDate(quote.validUntil)}</strong> (3 days).
              Amounts are estimates and may change once repairs are carried out.
            </div>

            {/* Totals */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-xs text-neutral-500">Total chargeable</p>
                <p className="text-lg font-semibold text-neutral-900">{money(quote.totalTenantCharge)}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-xs text-neutral-500">Deposit held</p>
                <p className="text-lg font-semibold text-neutral-900">{money(quote.depositHeld)}</p>
              </div>
              <div className={`rounded-lg border p-3 ${balanceDue > 0 ? 'border-danger-100 bg-danger-50' : 'border-neutral-200'}`}>
                <p className="text-xs text-neutral-500">Balance due from tenant</p>
                <p className={`text-lg font-semibold ${balanceDue > 0 ? 'text-danger-700' : 'text-neutral-400'}`}>{money(balanceDue)}</p>
              </div>
              <div className={`rounded-lg border p-3 ${refundDue > 0 ? 'border-success-100 bg-success-50' : 'border-neutral-200'}`}>
                <p className="text-xs text-neutral-500">Refund due to tenant</p>
                <p className={`text-lg font-semibold ${refundDue > 0 ? 'text-success-700' : 'text-neutral-400'}`}>{money(refundDue)}</p>
              </div>
            </div>

            {quote.status === 'DISPUTED' && quote.disputeReason && (
              <div className="rounded-lg bg-danger-50 border border-danger-100 px-4 py-3 text-sm text-danger-700">
                <strong>Tenant queried this statement:</strong> {quote.disputeReason}
              </div>
            )}
            {quote.tenantApprovedAt && (
              <p className="text-sm text-success-700">
                Approved by tenant on {fmtDate(quote.tenantApprovedAt)} ({quote.tenantApprovalVia})
              </p>
            )}

            {/* Lines */}
            <div className="overflow-x-auto border border-neutral-200 rounded-lg">
              <table className="w-full text-sm min-w-[900px]">
                <thead className="bg-neutral-50 text-xs text-neutral-500 uppercase">
                  <tr>
                    <th className="text-left p-2 font-medium">Item</th>
                    <th className="text-left p-2 font-medium">Room</th>
                    <th className="text-left p-2 font-medium">Action</th>
                    <th className="text-left p-2 font-medium">Responsibility</th>
                    <th className="text-left p-2 font-medium">Contractor</th>
                    <th className="text-right p-2 font-medium">Unit cost</th>
                    <th className="text-right p-2 font-medium">Qty</th>
                    <th className="text-right p-2 font-medium">Line total</th>
                    <th className="text-right p-2 font-medium">Tenant charge</th>
                    {isDraft && <th className="p-2" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {quote.lines.length === 0 && (
                    <tr><td colSpan={10} className="p-4 text-center text-neutral-400">No line items.</td></tr>
                  )}
                  {quote.lines.map((line) => (
                    <tr key={line.id} className="align-top">
                      <td className="p-2 min-w-[180px]">
                        {isDraft ? (
                          <input className="w-full border border-neutral-200 rounded px-1.5 py-1"
                            value={line.description}
                            onChange={(e) => editLineLocal(line.id, { description: e.target.value })}
                            onBlur={(e) => commitLine(line.id, { description: e.target.value })} />
                        ) : line.description}
                      </td>
                      <td className="p-2">
                        {isDraft ? (
                          <input className="w-24 border border-neutral-200 rounded px-1.5 py-1"
                            value={line.room ?? ''}
                            onChange={(e) => editLineLocal(line.id, { room: e.target.value })}
                            onBlur={(e) => commitLine(line.id, { room: e.target.value })} />
                        ) : (line.room || '-')}
                      </td>
                      <td className="p-2">
                        {isDraft ? (
                          <select className="border border-neutral-200 rounded px-1 py-1"
                            value={line.action}
                            onChange={(e) => commitLine(line.id, { action: e.target.value })}>
                            {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                          </select>
                        ) : line.action}
                      </td>
                      <td className="p-2">
                        {isDraft ? (
                          <select className="border border-neutral-200 rounded px-1 py-1"
                            value={line.responsibility}
                            onChange={(e) => commitLine(line.id, { responsibility: e.target.value })}>
                            {RESPONSIBILITIES.map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                        ) : line.responsibility}
                      </td>
                      <td className="p-2 min-w-[160px]">
                        {isDraft ? (
                          <div className="space-y-1">
                            <input className="w-full border border-neutral-200 rounded px-1.5 py-1" placeholder="Name"
                              value={line.contractorName ?? ''}
                              onChange={(e) => editLineLocal(line.id, { contractorName: e.target.value })}
                              onBlur={(e) => commitLine(line.id, { contractorName: e.target.value })} />
                            <input className="w-full border border-neutral-200 rounded px-1.5 py-1" placeholder="Contact"
                              value={line.contractorContact ?? ''}
                              onChange={(e) => editLineLocal(line.id, { contractorContact: e.target.value })}
                              onBlur={(e) => commitLine(line.id, { contractorContact: e.target.value })} />
                          </div>
                        ) : (
                          <span>{line.contractorName || '-'}{line.contractorContact ? ` (${line.contractorContact})` : ''}</span>
                        )}
                      </td>
                      <td className="p-2 text-right">
                        {isDraft ? (
                          <input type="number" min="0" step="0.01" className="w-24 border border-neutral-200 rounded px-1.5 py-1 text-right"
                            value={String(line.unitCost)}
                            onChange={(e) => editLineLocal(line.id, { unitCost: e.target.value })}
                            onBlur={(e) => commitLine(line.id, { unitCost: parseFloat(e.target.value) || 0 })} />
                        ) : money(line.unitCost)}
                      </td>
                      <td className="p-2 text-right">
                        {isDraft ? (
                          <input type="number" min="0" step="0.5" className="w-16 border border-neutral-200 rounded px-1.5 py-1 text-right"
                            value={String(line.quantity)}
                            onChange={(e) => editLineLocal(line.id, { quantity: e.target.value })}
                            onBlur={(e) => commitLine(line.id, { quantity: parseFloat(e.target.value) || 1 })} />
                        ) : String(line.quantity)}
                      </td>
                      <td className="p-2 text-right font-medium">{money(line.lineTotal)}</td>
                      <td className="p-2 text-right">
                        {isDraft && line.responsibility === 'SHARED' ? (
                          <input type="number" min="0" step="0.01" className="w-24 border border-neutral-200 rounded px-1.5 py-1 text-right"
                            value={String(line.tenantCharge)}
                            onChange={(e) => editLineLocal(line.id, { tenantCharge: e.target.value })}
                            onBlur={(e) => commitLine(line.id, { tenantCharge: parseFloat(e.target.value) || 0 })} />
                        ) : money(line.tenantCharge)}
                      </td>
                      {isDraft && (
                        <td className="p-2 text-right">
                          <button className="text-danger-500 hover:text-danger-700" onClick={() => deleteLine(line.id)} title="Remove">✕</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {isDraft && (
              <Button variant="outline" size="sm" onClick={addLine} disabled={busy}>+ Add line</Button>
            )}
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        {quote && isDraft && (
          <div className="flex items-center gap-2 flex-wrap mr-auto">
            <Button variant="outline" size="sm" onClick={sendToTenant} disabled={busy}>
              {quote.sentToTenantAt ? 'Resend to Tenant' : 'Send to Tenant'}
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowApprovePad(true)} disabled={busy}>
              Tenant Approve (in person)
            </Button>
            {quote.sentToTenantAt && (
              <span className="text-xs text-neutral-500">Sent {fmtDate(quote.sentToTenantAt)}</span>
            )}
          </div>
        )}
        <Button variant="outline" onClick={onClose}>Close</Button>
      </ModalFooter>

      {/* In-person tenant approval signature */}
      <Modal open={showApprovePad} onClose={() => setShowApprovePad(false)} className="max-w-lg">
        <ModalHeader>
          <h2 className="text-lg font-semibold">Tenant Approval</h2>
          <button onClick={() => setShowApprovePad(false)} className="text-neutral-400 hover:text-neutral-600">✕</button>
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-neutral-600 mb-3">
            By signing below, the tenant confirms they have reviewed and agree with the Statement of Repair Costs,
            including any amount payable over the deposit held.
          </p>
          <SignaturePad label="Tenant sign here" saving={busy} onSave={approveInPerson} onCancel={() => setShowApprovePad(false)} />
        </ModalBody>
      </Modal>
    </Modal>
  )
}
