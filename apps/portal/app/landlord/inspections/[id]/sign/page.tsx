'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { SignaturePad } from '@/components/ui/SignaturePad'

const INSPECTION_TYPE_LABELS: Record<string, string> = {
  MOVE_IN: 'Move-In',
  POST_MOVE_IN: 'Post-Move-In Confirmation',
  THREE_MONTH: '3-Month (New Tenancy)',
  ROUTINE_6_MONTH: '6-Month Routine',
  PRE_MOVE_OUT: 'Pre-Move-Out',
  MOVE_OUT: 'Move-Out',
  ANNUAL: 'Annual Condition Report',
}

export default function LandlordInspectionSignPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [inspection, setInspection] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState(false)
  const [signed, setSigned] = useState(false)
  const [showSignaturePad, setShowSignaturePad] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/inspections/${params.id}/sign`)
      .then(async r => {
        if (!r.ok) { setError('Inspection not found'); setLoading(false); return }
        const data = await r.json()
        setInspection(data)
        setLoading(false)
      })
      .catch(() => { setError('Failed to load inspection'); setLoading(false) })
  }, [params.id])

  const handleSign = async (dataUrl: string) => {
    setSigning(true)
    try {
      const res = await fetch(`/api/inspections/${params.id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature: dataUrl }),
      })
      if (res.ok) {
        setSigned(true)
        setShowSignaturePad(false)
      } else {
        const d = await res.json()
        alert(d.error || 'Failed to save signature')
      }
    } catch { alert('Failed to save signature') }
    finally { setSigning(false) }
  }

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'

  if (loading) {
    return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>
  }

  if (error || !inspection) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-surface rounded-lg border border-neutral-200 p-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Inspection Not Found</h2>
          <p className="text-neutral-500 mb-4">{error || 'This inspection report could not be found.'}</p>
          <Button onClick={() => router.push('/landlord/documents')}>Back to Documents</Button>
        </div>
      </div>
    )
  }

  if (signed || inspection.landlordSignedAt) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-surface rounded-lg border border-neutral-200 p-8">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Inspection Report Signed</h2>
          <p className="text-neutral-500 mb-4">Thank you for confirming your acceptance of this inspection report.</p>
          <div className="flex gap-3 justify-center">
            <a href={`/api/inspections/${params.id}/report`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">View Report</Button>
            </a>
            <Button variant="primary" onClick={() => router.push('/landlord/documents')}>Back to Documents</Button>
          </div>
        </div>
      </div>
    )
  }

  const typeLabel = INSPECTION_TYPE_LABELS[inspection.type] || inspection.type

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Sign Inspection Report</h1>
        <p className="text-neutral-500 mt-1">Review the inspection details and sign below to confirm.</p>
      </div>

      <div className="bg-surface rounded-lg border border-neutral-200 p-6">
        <h3 className="font-semibold text-neutral-900 mb-4">Inspection Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-neutral-600">Type</p>
            <p className="font-medium">{typeLabel}</p>
          </div>
          <div>
            <p className="text-neutral-600">Property</p>
            <p className="font-medium">{inspection.property?.name}{inspection.unit ? ` — Unit ${inspection.unit.unitNumber}` : ''}</p>
          </div>
          <div>
            <p className="text-neutral-600">Completed Date</p>
            <p className="font-medium">{formatDate(inspection.completedDate)}</p>
          </div>
          <div>
            <p className="text-neutral-600">Overall Condition</p>
            <p className="font-medium">{inspection.overallCondition || '-'}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <a href={`/api/inspections/${params.id}/report`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline font-medium">
            View Full Inspection Report
          </a>
          <p className="text-xs text-neutral-500 mt-2">Please review the full report before signing.</p>
        </div>
      </div>

      {inspection.inspectorSignature && (
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <h3 className="font-semibold text-neutral-900 mb-3">Inspector Signature</h3>
          <img src={inspection.inspectorSignature} alt="Inspector signature" className="h-20 border border-neutral-200 rounded bg-white p-2" />
          <p className="text-xs text-neutral-500 mt-2">Signed on {formatDate(inspection.inspectorSignedAt)}</p>
        </div>
      )}

      <div className="bg-surface rounded-lg border border-neutral-200 p-6">
        <h3 className="font-semibold text-neutral-900 mb-3">Your Signature</h3>
        <p className="text-sm text-neutral-500 mb-4">
          By signing below, you confirm that you have reviewed this inspection report and agree with its findings.
        </p>

        {showSignaturePad ? (
          <SignaturePad
            label="Draw your signature"
            saving={signing}
            onSave={handleSign}
            onCancel={() => setShowSignaturePad(false)}
          />
        ) : (
          <Button variant="primary" onClick={() => setShowSignaturePad(true)}>
            Sign Report
          </Button>
        )}
      </div>
    </div>
  )
}
