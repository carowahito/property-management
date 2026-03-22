'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function TenantLeaseViewPage() {
  const [lease, setLease] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState(false)
  const [signed, setSigned] = useState(false)
  const [error, setError] = useState('')
  const [showSignDialog, setShowSignDialog] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  useEffect(() => {
    fetchLease()
  }, [])

  async function fetchLease() {
    try {
      // In production, this would use the authenticated tenant's session to get their lease
      const res = await fetch('/api/leases?status=ACTIVE&limit=1')
      if (!res.ok) throw new Error('Failed to fetch lease')
      const data = await res.json()
      if (data.leases && data.leases.length > 0) {
        // Fetch full lease details
        const leaseRes = await fetch(`/api/leases/${data.leases[0].id}`)
        if (leaseRes.ok) {
          const leaseData = await leaseRes.json()
          setLease(leaseData)
          setSigned(!!leaseData.tenantSignedAt)
        }
      }
    } catch {
      setError('Failed to load your lease')
    } finally {
      setLoading(false)
    }
  }

  async function handleSign() {
    if (!lease || !agreedToTerms) return
    setSigning(true)
    setError('')
    try {
      const res = await fetch(`/api/leases/${lease.id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'tenant', signature: 'DIGITALLY_SIGNED' }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to sign lease')
      }
      setSigned(true)
      setShowSignDialog(false)
      fetchLease()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSigning(false)
    }
  }

  function handlePrint() {
    const printWindow = window.open('', '_blank')
    if (!printWindow || !lease?.documentHtml) return
    // Note: documentHtml is generated server-side from trusted templates, not user input
    printWindow.document.write(
      '<!DOCTYPE html><html><head><title>My Lease Agreement</title>' +
      '<style>@media print { body { margin: 0; } @page { margin: 20mm; } }</style>' +
      '</head><body>' +
      lease.documentHtml +
      '</body></html>'
    )
    printWindow.document.close()
    printWindow.print()
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px] text-neutral-500">Loading your lease...</div>

  if (!lease) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-neutral-900">No Active Lease</h2>
        <p className="text-neutral-500 mt-2">You don&apos;t have an active lease document to view.</p>
      </div>
    )
  }

  if (!lease.documentHtml) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-neutral-900">Lease Not Yet Ready</h2>
        <p className="text-neutral-500 mt-2">Your lease agreement is being prepared. You&apos;ll be notified when it&apos;s ready for review.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">My Lease Agreement</h1>
          <p className="text-sm text-neutral-500 mt-1">{lease.property?.name} — {lease.unitRef?.unitNumber || lease.unit || ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint}>Download PDF</Button>
          {lease.sentForSigning && !signed && (
            <Button onClick={() => setShowSignDialog(true)}>Sign Lease</Button>
          )}
        </div>
      </div>

      {error && <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-md text-sm">{error}</div>}

      {/* Signing Status Bar */}
      <div className="bg-surface border border-border rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600">Your Signature:</span>
            <Badge variant={signed ? 'success' : 'warning'} size="sm">
              {signed ? `Signed ${new Date(lease.tenantSignedAt).toLocaleDateString()}` : 'Pending'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600">Landlord:</span>
            <Badge variant={lease.landlordSignedAt ? 'success' : 'warning'} size="sm">
              {lease.landlordSignedAt ? 'Signed' : 'Pending'}
            </Badge>
          </div>
        </div>
        {signed && <span className="text-sm text-success-600 font-medium">You have signed this lease</span>}
      </div>

      {/* Sign Dialog */}
      {showSignDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-neutral-900/50" onClick={() => setShowSignDialog(false)} />
          <div className="relative z-50 w-full max-w-md bg-surface rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Sign Lease Agreement</h3>
            <p className="text-sm text-neutral-600 mb-4">
              By signing this document, you agree to all the terms and conditions stated in the Residential Tenancy Agreement for <strong>{lease.property?.name}</strong>.
            </p>
            <label className="flex items-start gap-2 mb-6">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 rounded border-neutral-300"
              />
              <span className="text-sm text-neutral-700">
                I have read and understood the full lease agreement and agree to be bound by its terms and conditions.
              </span>
            </label>
            <div className="flex gap-2">
              <Button onClick={handleSign} disabled={!agreedToTerms || signing} className="flex-1">
                {signing ? 'Signing...' : 'Confirm & Sign Digitally'}
              </Button>
              <Button variant="outline" onClick={() => setShowSignDialog(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Document Content */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        {/* documentHtml is generated server-side from trusted lease templates, not from user input */}
        <div className="p-6 prose max-w-none" dangerouslySetInnerHTML={{ __html: lease.documentHtml }} />
      </div>
    </div>
  )
}
