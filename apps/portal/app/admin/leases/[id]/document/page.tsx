'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface LeaseDocument {
  id: string
  tenantId: string
  propertyId: string
  unitId: string | null
  unit: string | null
  startDate: string
  endDate: string
  monthlyRent: number
  securityDeposit: number
  status: string
  templateId: string | null
  documentHtml: string | null
  sentForSigning: boolean
  sentAt: string | null
  tenantSignedAt: string | null
  landlordSignedAt: string | null
  noticePeriod: number
  rentEscalation: number | null
  petPolicy: string | null
  specialConditions: string | null
  tenant: { id: string; name: string; email: string; phone: string }
  property: { id: string; name: string; address: string; landlord: { id: string; name: string; email: string; phone: string } | null }
  template: { id: string; name: string; type: string } | null
}

interface LeaseTemplate {
  id: string
  name: string
  type: string
}

export default function LeaseDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [lease, setLease] = useState<LeaseDocument | null>(null)
  const [templates, setTemplates] = useState<LeaseTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchLease()
    fetchTemplates()
  }, [id])

  async function fetchLease() {
    try {
      const res = await fetch(`/api/leases/${id}`)
      if (!res.ok) throw new Error('Failed to fetch lease')
      const data = await res.json()
      setLease(data)
      if (data.templateId) setSelectedTemplateId(data.templateId)
    } catch {
      setError('Failed to load lease')
    } finally {
      setLoading(false)
    }
  }

  async function fetchTemplates() {
    try {
      const res = await fetch('/api/lease-templates')
      if (!res.ok) return
      const data = await res.json()
      setTemplates(data.templates || [])
    } catch {
      // Templates fetch is non-critical
    }
  }

  async function assignTemplate() {
    if (!selectedTemplateId) return
    try {
      const res = await fetch(`/api/leases/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: selectedTemplateId }),
      })
      if (!res.ok) throw new Error('Failed to assign template')
      setSuccess('Template assigned')
      fetchLease()
    } catch {
      setError('Failed to assign template')
    }
  }

  async function generateDocument() {
    setGenerating(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/leases/${id}/generate-document`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to generate document')
      }
      setSuccess('Lease document generated successfully')
      fetchLease()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  async function sendForSigning() {
    setSending(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/leases/${id}/send-for-signing`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to send')
      }
      const data = await res.json()
      setSuccess(data.message)
      fetchLease()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSending(false)
    }
  }

  function handlePrint() {
    const printWindow = window.open('', '_blank')
    if (!printWindow || !lease?.documentHtml) return
    const tenantName = lease.tenant.name
    // Note: documentHtml is generated server-side from trusted templates, not user input
    printWindow.document.write(
      '<!DOCTYPE html><html><head><title>Lease Agreement - ' +
      tenantName +
      '</title><style>@media print { body { margin: 0; } @page { margin: 20mm; } }</style></head><body>' +
      lease.documentHtml +
      '</body></html>'
    )
    printWindow.document.close()
    printWindow.print()
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px] text-neutral-500">Loading lease...</div>
  if (!lease) return <div className="text-center py-12 text-neutral-500">Lease not found</div>

  const isFullySigned = lease.tenantSignedAt && lease.landlordSignedAt

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/leases" className="text-sm text-primary-600 hover:text-primary-700 mb-2 inline-block">&larr; Back to Leases</Link>
          <h1 className="text-2xl font-bold text-neutral-900">Lease Document</h1>
          <p className="text-sm text-neutral-500 mt-1">{lease.tenant.name} — {lease.property.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.open(`/api/leases/${id}/generate-pdf`, '_blank')}>Download PDF</Button>
          {lease.documentHtml && (
            <>
              <Button variant="outline" onClick={handlePrint}>Print</Button>
              {!lease.sentForSigning && (
                <Button onClick={sendForSigning} disabled={sending}>
                  {sending ? 'Sending...' : 'Send for Signing'}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {error && <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-md text-sm">{error}</div>}
      {success && <div className="bg-success-50 border border-success-100 text-success-700 px-4 py-3 rounded-md text-sm">{success}</div>}

      {/* Signing Status */}
      <div className="bg-surface border border-border rounded-lg p-5">
        <h2 className="font-semibold text-neutral-900 mb-3">Document Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-neutral-500">Template</p>
            <p className="text-sm font-medium">{lease.template?.name || 'Not assigned'}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Document</p>
            <Badge variant={lease.documentHtml ? 'success' : 'neutral'} size="sm">
              {lease.documentHtml ? 'Generated' : 'Not generated'}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Tenant Signature</p>
            <Badge variant={lease.tenantSignedAt ? 'success' : 'warning'} size="sm">
              {lease.tenantSignedAt ? `Signed ${new Date(lease.tenantSignedAt).toLocaleDateString()}` : 'Pending'}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Landlord Signature</p>
            <Badge variant={lease.landlordSignedAt ? 'success' : 'warning'} size="sm">
              {lease.landlordSignedAt ? `Signed ${new Date(lease.landlordSignedAt).toLocaleDateString()}` : 'Pending'}
            </Badge>
          </div>
        </div>
        {lease.sentForSigning && lease.sentAt && (
          <p className="text-xs text-neutral-500 mt-3">Sent for signing on {new Date(lease.sentAt).toLocaleString()}</p>
        )}
      </div>

      {/* Generate Document */}
      {!lease.documentHtml && (
        <div className="bg-surface border border-border rounded-lg p-5">
          <h2 className="font-semibold text-neutral-900 mb-3">Generate Lease Document</h2>
          <p className="text-sm text-neutral-600 mb-3">Generate the tenancy agreement using the Tochi Property standard template with all lease data auto-filled.</p>
          <Button onClick={generateDocument} disabled={generating}>
            {generating ? 'Generating...' : 'Generate Document'}
          </Button>
        </div>
      )}

      {/* Regenerate Option */}
      {lease.documentHtml && !isFullySigned && (
        <div className="flex items-center gap-3 bg-warning-50 border border-warning-100 rounded-lg p-4">
          <p className="text-sm text-warning-700 flex-1">Document has been generated. You can regenerate it if lease terms have changed.</p>
          <Button variant="outline" size="sm" onClick={generateDocument} disabled={generating}>
            {generating ? 'Regenerating...' : 'Regenerate'}
          </Button>
        </div>
      )}

      {/* Document Preview */}
      {lease.documentHtml && (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="bg-neutral-50 border-b border-border px-5 py-3 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">Document Preview</h2>
            {isFullySigned && <Badge variant="success">Fully Signed</Badge>}
          </div>
          {/* documentHtml is generated server-side from trusted lease templates, not from user input */}
          <div className="p-6 prose max-w-none" dangerouslySetInnerHTML={{ __html: lease.documentHtml }} />
        </div>
      )}
    </div>
  )
}
