'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { SignaturePad } from '@/components/ui/SignaturePad'

const money = (n: number | string) =>
  `KSh ${Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'

interface Line {
  id: string
  description: string
  room: string | null
  action: string
  responsibility: string
  lineTotal: string | number
  tenantCharge: string | number
}
interface Quote {
  id: string
  status: 'DRAFT' | 'AGREED' | 'DISPUTED' | 'SETTLED'
  depositHeld: string | number
  totalTenantCharge: string | number
  balanceDue: string | number
  refundDue: string | number
  validUntil: string
  tenantApprovedAt: string | null
  disputeReason: string | null
  lines: Line[]
  inspection?: { property?: { name?: string; address?: string }; unit?: { unitNumber?: string } | null; completedDate?: string | null }
}

export default function TenantMoveOutQuotePage() {
  const router = useRouter()
  const params = useParams<{ quoteId: string }>()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showSignaturePad, setShowSignaturePad] = useState(false)
  const [showQuery, setShowQuery] = useState(false)
  const [queryReason, setQueryReason] = useState('')

  const load = () => {
    fetch(`/api/move-out-quotes/${params.quoteId}`)
      .then(async (r) => {
        if (!r.ok) { setError('Statement not found'); setLoading(false); return }
        setQuote(await r.json())
        setLoading(false)
      })
      .catch(() => { setError('Failed to load statement'); setLoading(false) })
  }
  useEffect(load, [params.quoteId])

  const approve = async (signature: string) => {
    setBusy(true)
    try {
      const res = await fetch(`/api/move-out-quotes/${params.quoteId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantSignature: signature, via: 'IN_APP' }),
      })
      if (res.ok) { setShowSignaturePad(false); load() }
      else alert((await res.json()).error || 'Failed to approve')
    } catch { alert('Failed to approve') }
    finally { setBusy(false) }
  }

  const submitQuery = async () => {
    if (!queryReason.trim()) return
    setBusy(true)
    try {
      const res = await fetch(`/api/move-out-quotes/${params.quoteId}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: queryReason }),
      })
      if (res.ok) { setShowQuery(false); load() }
      else alert((await res.json()).error || 'Failed to submit query')
    } catch { alert('Failed to submit query') }
    finally { setBusy(false) }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>
  }
  if (error || !quote) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-surface rounded-lg border border-neutral-200 p-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Statement Not Found</h2>
          <p className="text-neutral-500 mb-4">{error || 'This statement could not be found.'}</p>
          <Button onClick={() => router.push('/tenant/documents')}>Back to Documents</Button>
        </div>
      </div>
    )
  }

  const balanceDue = Number(quote.balanceDue)
  const refundDue = Number(quote.refundDue)
  const propertyName = quote.inspection?.property?.name || 'your property'
  const decided = !!quote.tenantApprovedAt || quote.status === 'DISPUTED'

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Statement of Repair Costs</h1>
        <p className="text-neutral-500 mt-1">
          {propertyName}{quote.inspection?.unit ? ` - Unit ${quote.inspection.unit.unitNumber}` : ''}
        </p>
      </div>

      {/* Decision banners */}
      {quote.tenantApprovedAt && (
        <div className="bg-success-50 border border-success-100 rounded-lg p-4 text-sm text-success-700">
          You approved this statement on {fmtDate(quote.tenantApprovedAt)}. Thank you.
        </div>
      )}
      {quote.status === 'DISPUTED' && (
        <div className="bg-danger-50 border border-danger-100 rounded-lg p-4 text-sm text-danger-700">
          You have queried this statement. Your agent will be in touch.
          {quote.disputeReason ? <><br /><span className="text-neutral-600">Your note: {quote.disputeReason}</span></> : null}
        </div>
      )}

      {/* Validity notice */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
        This quote is valid until <strong>{fmtDate(quote.validUntil)}</strong> (3 days).
        Amounts are estimates and may change once repairs are carried out.
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface rounded-lg border border-neutral-200 p-3">
          <p className="text-xs text-neutral-500">Total chargeable</p>
          <p className="text-lg font-semibold">{money(quote.totalTenantCharge)}</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-3">
          <p className="text-xs text-neutral-500">Deposit held</p>
          <p className="text-lg font-semibold">{money(quote.depositHeld)}</p>
        </div>
        <div className={`rounded-lg border p-3 ${balanceDue > 0 ? 'border-danger-100 bg-danger-50' : 'bg-surface border-neutral-200'}`}>
          <p className="text-xs text-neutral-500">Balance you owe</p>
          <p className={`text-lg font-semibold ${balanceDue > 0 ? 'text-danger-700' : 'text-neutral-400'}`}>{money(balanceDue)}</p>
        </div>
        <div className={`rounded-lg border p-3 ${refundDue > 0 ? 'border-success-100 bg-success-50' : 'bg-surface border-neutral-200'}`}>
          <p className="text-xs text-neutral-500">Refund due to you</p>
          <p className={`text-lg font-semibold ${refundDue > 0 ? 'text-success-700' : 'text-neutral-400'}`}>{money(refundDue)}</p>
        </div>
      </div>

      {/* Lines */}
      <div className="bg-surface rounded-lg border border-neutral-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead className="bg-neutral-50 text-xs text-neutral-500 uppercase">
            <tr>
              <th className="text-left p-3 font-medium">Item</th>
              <th className="text-left p-3 font-medium">Room</th>
              <th className="text-left p-3 font-medium">Work</th>
              <th className="text-right p-3 font-medium">Cost</th>
              <th className="text-right p-3 font-medium">Charged to you</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {quote.lines.length === 0 && (
              <tr><td colSpan={5} className="p-4 text-center text-neutral-400">No items.</td></tr>
            )}
            {quote.lines.map((l) => (
              <tr key={l.id}>
                <td className="p-3">{l.description}</td>
                <td className="p-3 text-neutral-500">{l.room || '-'}</td>
                <td className="p-3 text-neutral-500">{l.action}</td>
                <td className="p-3 text-right">{money(l.lineTotal)}</td>
                <td className="p-3 text-right font-medium">{money(l.tenantCharge)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      {!decided && (
        <div className="bg-surface rounded-lg border border-neutral-200 p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-neutral-900 mb-1">Approve this statement</h3>
            <p className="text-sm text-neutral-500">
              By signing below, you confirm you have reviewed and agree with these repair costs, including any
              balance payable over the deposit held.
            </p>
          </div>

          {showSignaturePad ? (
            <SignaturePad label="Sign to approve" saving={busy} onSave={approve} onCancel={() => setShowSignaturePad(false)} />
          ) : showQuery ? (
            <div className="space-y-3">
              <textarea
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500"
                rows={3}
                placeholder="Tell us what you disagree with..."
                value={queryReason}
                onChange={(e) => setQueryReason(e.target.value)}
              />
              <div className="flex gap-2">
                <Button variant="danger" onClick={submitQuery} disabled={busy || !queryReason.trim()}>
                  {busy ? 'Submitting...' : 'Submit Query'}
                </Button>
                <Button variant="outline" onClick={() => setShowQuery(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" onClick={() => setShowSignaturePad(true)}>Approve &amp; Sign</Button>
              <Button variant="outline" onClick={() => setShowQuery(true)}>Query This Statement</Button>
            </div>
          )}
        </div>
      )}

      {decided && (
        <div className="text-center">
          <Button variant="primary" onClick={() => router.push('/tenant/documents')}>Back to Documents</Button>
        </div>
      )}
    </div>
  )
}
