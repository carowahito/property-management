'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { SignaturePad } from '@/components/ui/SignaturePad'

export default function TenantLeaseSignPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [lease, setLease] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState(false)
  const [signed, setSigned] = useState(false)
  const [showSignaturePad, setShowSignaturePad] = useState(false)
  const sigUploadRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Fetch the tenant's active lease that's been sent for signing
    fetch('/api/tenants/me/lease')
      .then(r => r.json())
      .then(data => { setLease(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleSignatureUpload = async (file: File) => {
    if (!lease) return
    setSigning(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'tenantSignature')
    try {
      const res = await fetch(`/api/leases/${lease.id}/upload`, { method: 'POST', body: formData })
      if (res.ok) { setSigned(true) }
      else { const d = await res.json(); alert(d.error || 'Failed to upload signature') }
    } catch { alert('Failed to upload signature') }
    finally { setSigning(false) }
  }

  const handleSignaturePadSave = async (dataUrl: string) => {
    if (!lease) return
    setSigning(true)
    try {
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const file = new File([blob], 'tenant-signature.png', { type: 'image/png' })
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'tenantSignature')
      const uploadRes = await fetch(`/api/leases/${lease.id}/upload`, { method: 'POST', body: formData })
      if (uploadRes.ok) { setSigned(true); setShowSignaturePad(false) }
      else { const d = await uploadRes.json(); alert(d.error || 'Failed to save signature') }
    } catch { alert('Failed to save signature') }
    finally { setSigning(false) }
  }

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'
  const formatCurrency = (n: number) => `KES ${Number(n).toLocaleString()}`

  if (loading) {
    return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>
  }

  if (!lease) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-surface rounded-lg border border-neutral-200 p-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-2">No Lease to Sign</h2>
          <p className="text-neutral-500 mb-4">There are no leases waiting for your signature.</p>
          <Button onClick={() => router.push('/tenant/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  if (signed || lease.tenantSignedAt) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-surface rounded-lg border border-neutral-200 p-8">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Lease Signed</h2>
          <p className="text-neutral-500 mb-4">
            Your lease has been signed successfully. Thank you!
          </p>
          <Button variant="primary" onClick={() => router.push('/tenant/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Sign Your Lease</h1>
        <p className="text-neutral-500 mt-1">Review your lease details and sign below to confirm.</p>
      </div>

      {/* Lease Summary */}
      <div className="bg-surface rounded-lg border border-neutral-200 p-6">
        <h3 className="font-semibold text-neutral-900 mb-4">Lease Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-neutral-600">Property</p>
            <p className="font-medium">{lease.property?.name} — {lease.unit || 'N/A'}</p>
          </div>
          <div>
            <p className="text-neutral-600">Address</p>
            <p className="font-medium">{lease.property?.address}</p>
          </div>
          <div>
            <p className="text-neutral-600">Monthly Rent</p>
            <p className="font-medium">{formatCurrency(lease.monthlyRent)}</p>
          </div>
          <div>
            <p className="text-neutral-600">Security Deposit</p>
            <p className="font-medium">{formatCurrency(lease.securityDeposit)}</p>
          </div>
          <div>
            <p className="text-neutral-600">Start Date</p>
            <p className="font-medium">{formatDate(lease.startDate)}</p>
          </div>
          <div>
            <p className="text-neutral-600">End Date</p>
            <p className="font-medium">{formatDate(lease.endDate)}</p>
          </div>
        </div>
        {lease.terms && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <p className="text-sm text-neutral-600 mb-1">Terms & Conditions</p>
            <p className="text-sm text-neutral-900 whitespace-pre-wrap">{lease.terms}</p>
          </div>
        )}
      </div>

      {/* View Document */}
      {(lease.documentUrl || lease.documentHtml) && (
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <h3 className="font-semibold text-neutral-900 mb-3">Lease Document</h3>
          <div className="flex gap-3">
            {lease.documentUrl && (
              <a href={lease.documentUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline font-medium">
                View Lease PDF
              </a>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-2">Please review the full document before signing.</p>
        </div>
      )}

      {/* Landlord Signature */}
      {lease.landlordSignature && lease.landlordSignature.startsWith('http') && (
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <h3 className="font-semibold text-neutral-900 mb-3">Landlord / Manager Signature</h3>
          <img src={lease.landlordSignature} alt="Landlord signature" className="h-20 border border-neutral-200 rounded bg-white p-2" />
          <p className="text-xs text-neutral-500 mt-2">Signed on {formatDate(lease.landlordSignedAt)}</p>
        </div>
      )}

      {/* Tenant Signature */}
      <div className="bg-surface rounded-lg border border-neutral-200 p-6">
        <h3 className="font-semibold text-neutral-900 mb-3">Your Signature</h3>
        <p className="text-sm text-neutral-500 mb-4">
          By signing below, you agree to the terms of this lease agreement for {lease.unit || lease.property?.name}.
        </p>

        {showSignaturePad ? (
          <SignaturePad
            label="Draw your signature"
            saving={signing}
            onSave={handleSignaturePadSave}
            onCancel={() => setShowSignaturePad(false)}
          />
        ) : (
          <div className="flex gap-4">
            <Button variant="primary" onClick={() => setShowSignaturePad(true)} className="flex-1">
              Draw Signature
            </Button>
            <div className="flex-1">
              <input type="file" ref={sigUploadRef} accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleSignatureUpload(f) }} />
              <Button variant="outline" onClick={() => sigUploadRef.current?.click()} disabled={signing} className="w-full">
                {signing ? 'Uploading...' : 'Upload Signature Image'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
