'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { SignaturePad } from '@/components/ui/SignaturePad'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

export default function LeaseDetailPage({ params }: Props) {
  const router = useRouter()
  const [leaseId, setLeaseId] = useState<string | null>(null)
  const [lease, setLease] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showRenewModal, setShowRenewModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editStep, setEditStep] = useState<'edit' | 'confirm'>('edit')
  const [changeLog, setChangeLog] = useState<{label: string; from: string; to: string}[]>([])
  const [editForm, setEditForm] = useState({
    monthlyRent: '', securityDeposit: '', status: '', terms: '',
    startDate: '', endDate: '',
    noticePeriod: '', petPolicy: '', specialConditions: '',
    gracePeriodDays: '', latePenaltyPerDay: '', rentEscalation: '', rentDueDay: '',
    tenant2Name: '', tenant2IdNumber: '', tenant2Email: '', tenant2Phone: '',
    mpesaTill: '', bankDetails: '',
  })
  const [renewForm, setRenewForm] = useState({
    newStartDate: '', newEndDate: '', newMonthlyRent: '', leaseTerm: '12',
  })
  const [uploading, setUploading] = useState('')
  const [showLandlordSigPad, setShowLandlordSigPad] = useState(false)
  const docInputRef = useRef<HTMLInputElement>(null)
  const landlordSigRef = useRef<HTMLInputElement>(null)
  const tenantSigRef = useRef<HTMLInputElement>(null)

  useEffect(() => { params.then(p => setLeaseId(p.id)) }, [params])

  const refreshLease = () => {
    if (!leaseId) return
    fetch(`/api/leases/${leaseId}`)
      .then(r => r.json())
      .then(data => { setLease(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { refreshLease() }, [leaseId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpload = async (file: File, type: 'document' | 'landlordSignature' | 'tenantSignature') => {
    setUploading(type)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    try {
      const res = await fetch(`/api/leases/${leaseId}/upload`, { method: 'POST', body: formData })
      if (res.ok) { refreshLease() }
      else { const d = await res.json(); alert(d.error || 'Upload failed') }
    } catch { alert('Upload failed') }
    finally { setUploading('') }
  }

  const handleSignaturePadSave = async (dataUrl: string, type: 'landlordSignature' | 'tenantSignature') => {
    setUploading(type)
    try {
      // Convert base64 data URL to blob
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const file = new File([blob], `${type}.png`, { type: 'image/png' })
      await handleUpload(file, type)
      setShowLandlordSigPad(false)
    } catch { alert('Failed to save signature') }
    finally { setUploading('') }
  }

  const handleSendForSigning = async () => {
    if (!lease.documentUrl && !lease.documentHtml) {
      alert('Please upload or generate a lease document first')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/leases/${leaseId}/send-for-signing`, { method: 'POST' })
      if (res.ok) {
        refreshLease()
        alert('Lease sent for signing. The tenant can now sign from their portal.')
      } else {
        const d = await res.json()
        alert(d.error || 'Failed to send for signing')
      }
    } catch { alert('Failed to send for signing') }
    finally { setSaving(false) }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>
  }

  if (!lease) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-neutral-500 text-lg">Lease not found</p>
          <Button onClick={() => router.push('/admin/leases')} className="mt-4">Back to Leases</Button>
        </div>
      </div>
    )
  }

  // Calculations
  const startDate = new Date(lease.startDate)
  const endDate = new Date(lease.endDate)
  const now = new Date()
  const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  const elapsedDays = Math.max(0, (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const remainingDays = Math.max(0, (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const progressPercent = Math.min(100, Math.round((elapsedDays / totalDays) * 100))
  const totalMonths = Math.round(totalDays / 30)
  const remainingMonths = Math.round(remainingDays / 30)

  // Renewal alerts
  const threeMonthsBeforeExpiry = new Date(endDate)
  threeMonthsBeforeExpiry.setMonth(threeMonthsBeforeExpiry.getMonth() - 3)
  const oneWeekBeforeNotice = new Date(threeMonthsBeforeExpiry)
  oneWeekBeforeNotice.setDate(oneWeekBeforeNotice.getDate() - 7)
  const isInRenewalWindow = now >= oneWeekBeforeNotice && lease.status === 'ACTIVE'
  const isExpiringSoon = remainingDays <= 90 && lease.status === 'ACTIVE'
  const isExpired = now > endDate && lease.status === 'ACTIVE'

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'
  const formatCurrency = (n: number) => `KES ${Number(n).toLocaleString()}`

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-success-50 text-success-700'
      case 'EXPIRED': return 'bg-neutral-100 text-neutral-700'
      case 'TERMINATED': return 'bg-danger-50 text-danger-700'
      case 'PENDING': return 'bg-yellow-50 text-yellow-700'
      default: return 'bg-neutral-100 text-neutral-700'
    }
  }

  const handleEditClick = () => {
    setEditForm({
      monthlyRent: String(lease.monthlyRent || ''),
      securityDeposit: String(lease.securityDeposit || ''),
      status: lease.status || 'ACTIVE',
      startDate: lease.startDate ? lease.startDate.split('T')[0] : '',
      endDate: lease.endDate ? lease.endDate.split('T')[0] : '',
      terms: lease.terms || '',
      noticePeriod: String(lease.noticePeriod ?? 1),
      petPolicy: lease.petPolicy || '',
      specialConditions: lease.specialConditions || '',
      gracePeriodDays: String(lease.gracePeriodDays ?? 5),
      latePenaltyPerDay: String(lease.latePenaltyPerDay ?? 500),
      rentEscalation: lease.rentEscalation != null ? String(lease.rentEscalation) : '',
      rentDueDay: String(lease.rentDueDay ?? 1),
      tenant2Name: lease.tenant2Name || '',
      tenant2IdNumber: lease.tenant2IdNumber || '',
      tenant2Email: lease.tenant2Email || '',
      tenant2Phone: lease.tenant2Phone || '',
      mpesaTill: lease.mpesaTill || '',
      bankDetails: lease.bankDetails || '',
    })
    setEditStep('edit')
    setShowEditModal(true)
  }

  const handleSaveEdit = () => {
    const FIELD_LABELS: Record<string, string> = {
      monthlyRent: 'Monthly Rent (KES)',
      securityDeposit: 'Security Deposit (KES)',
      status: 'Status',
      startDate: 'Start Date',
      endDate: 'End Date',
      noticePeriod: 'Notice Period (months)',
      gracePeriodDays: 'Grace Period (days)',
      latePenaltyPerDay: 'Late Penalty (KES/day)',
      rentEscalation: 'Annual Escalation (%)',
      rentDueDay: 'Rent Due Day',
      petPolicy: 'Pet Policy',
      specialConditions: 'Special Conditions',
      terms: 'Terms',
      tenant2Name: 'Tenant 2 — Name',
      tenant2IdNumber: 'Tenant 2 — ID / Passport',
      tenant2Email: 'Tenant 2 — Email',
      tenant2Phone: 'Tenant 2 — Phone',
      mpesaTill: 'M-Pesa Till',
      bankDetails: 'Bank Details',
    }
    const fmt = (v: any) => (v == null || v === '') ? '—' : String(v)
    const current: Record<string, string> = {
      monthlyRent: fmt(lease.monthlyRent),
      securityDeposit: fmt(lease.securityDeposit),
      status: fmt(lease.status),
      startDate: lease.startDate ? lease.startDate.split('T')[0] : '—',
      endDate: lease.endDate ? lease.endDate.split('T')[0] : '—',
      noticePeriod: fmt(lease.noticePeriod ?? 1),
      gracePeriodDays: fmt(lease.gracePeriodDays ?? 5),
      latePenaltyPerDay: fmt(lease.latePenaltyPerDay ?? 500),
      rentEscalation: lease.rentEscalation != null ? fmt(lease.rentEscalation) : '—',
      rentDueDay: fmt(lease.rentDueDay ?? 1),
      petPolicy: fmt(lease.petPolicy),
      specialConditions: fmt(lease.specialConditions),
      terms: fmt(lease.terms),
      tenant2Name: fmt(lease.tenant2Name),
      tenant2IdNumber: fmt(lease.tenant2IdNumber),
      tenant2Email: fmt(lease.tenant2Email),
      tenant2Phone: fmt(lease.tenant2Phone),
      mpesaTill: fmt(lease.mpesaTill),
      bankDetails: fmt(lease.bankDetails),
    }
    const changes: {label: string; from: string; to: string}[] = []
    for (const key of Object.keys(FIELD_LABELS)) {
      const fromVal = current[key]
      const toVal = (editForm as any)[key] === '' ? '—' : fmt((editForm as any)[key])
      if (fromVal !== toVal) {
        changes.push({ label: FIELD_LABELS[key], from: fromVal, to: toVal })
      }
    }
    if (changes.length === 0) {
      setShowEditModal(false)
      return
    }
    setChangeLog(changes)
    setEditStep('confirm')
  }

  const handleConfirmSave = async () => {
    setSaving(true)
    try {
      const body: Record<string, any> = {
        monthlyRent: parseFloat(editForm.monthlyRent) || undefined,
        securityDeposit: parseFloat(editForm.securityDeposit) || undefined,
        status: editForm.status,
        startDate: editForm.startDate || undefined,
        endDate: editForm.endDate || undefined,
        terms: editForm.terms || undefined,
        noticePeriod: parseInt(editForm.noticePeriod) || undefined,
        gracePeriodDays: parseInt(editForm.gracePeriodDays) || undefined,
        latePenaltyPerDay: parseFloat(editForm.latePenaltyPerDay) || undefined,
        rentEscalation: editForm.rentEscalation !== '' ? parseFloat(editForm.rentEscalation) : undefined,
        rentDueDay: parseInt(editForm.rentDueDay) || undefined,
        petPolicy: editForm.petPolicy || undefined,
        specialConditions: editForm.specialConditions || undefined,
        tenant2Name: editForm.tenant2Name || undefined,
        tenant2IdNumber: editForm.tenant2IdNumber || undefined,
        tenant2Email: editForm.tenant2Email || undefined,
        tenant2Phone: editForm.tenant2Phone || undefined,
        mpesaTill: editForm.mpesaTill || undefined,
        bankDetails: editForm.bankDetails || undefined,
      }
      const res = await fetch(`/api/leases/${leaseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) { refreshLease(); setShowEditModal(false); setEditStep('edit') }
      else { const d = await res.json(); alert(d.error || 'Failed to save') }
    } catch { alert('Failed to save') }
    finally { setSaving(false) }
  }

  const handleRenewClick = () => {
    const newStart = new Date(lease.endDate)
    newStart.setDate(newStart.getDate() + 1)
    const newEnd = new Date(newStart)
    newEnd.setFullYear(newEnd.getFullYear() + 1)
    setRenewForm({
      newStartDate: newStart.toISOString().split('T')[0],
      newEndDate: newEnd.toISOString().split('T')[0],
      newMonthlyRent: String(lease.monthlyRent || ''),
      leaseTerm: '12',
    })
    setShowRenewModal(true)
  }

  // Auto-calc renewal end date
  const updateRenewEndDate = (startDate: string, term: string) => {
    if (startDate && term) {
      const d = new Date(startDate)
      d.setMonth(d.getMonth() + parseInt(term))
      setRenewForm(prev => ({ ...prev, newEndDate: d.toISOString().split('T')[0] }))
    }
  }



  const handleRenew = async () => {
    setSaving(true)
    try {
      // Client-side validation
      if (!renewForm.newStartDate || !renewForm.newEndDate) {
        alert('Please enter a start and end date for the renewal')
        setSaving(false)
        return
      }
      const s = new Date(renewForm.newStartDate)
      const e = new Date(renewForm.newEndDate)
      if (isNaN(s.getTime()) || isNaN(e.getTime()) || e <= s) {
        alert('End date must be after start date')
        setSaving(false)
        return
      }
      const monthly = Number(parseFloat(renewForm.newMonthlyRent) || lease.monthlyRent || 0)
      if (!monthly || monthly <= 0) {
        alert('Please enter a valid monthly rent')
        setSaving(false)
        return
      }
      // Create new lease as PENDING — it only activates once signed and the old lease expires
      const res = await fetch('/api/leases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: lease.tenantId,
          propertyId: lease.propertyId,
          unitId: lease.unitId || undefined,
          unit: lease.unit || '',
          startDate: renewForm.newStartDate,
          endDate: renewForm.newEndDate,
          monthlyRent: Number(parseFloat(renewForm.newMonthlyRent) || lease.monthlyRent || 0),
          securityDeposit: Number(lease.securityDeposit ?? 0),
          status: 'PENDING',
        }),
      })
      if (res.ok) {
        const newLease = await res.json()
        setShowRenewModal(false)
        router.push(`/admin/leases/${newLease.id}`)
      } else {
        const d = await res.json()
        alert(d.error || 'Failed to create renewal lease')
      }
    } catch { alert('Failed to renew lease') }
    finally { setSaving(false) }
  }

  const handleGenerateDocument = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/leases/${leaseId}/generate-document`, { method: 'POST' })
      if (res.ok) { refreshLease(); alert('Lease document generated') }
      else { const d = await res.json(); alert(d.error || 'Failed to generate document') }
    } catch { alert('Failed to generate document') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      {/* Renewal Alert */}
      {isExpired && (
        <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg flex items-center justify-between">
          <div>
            <p className="font-semibold text-danger-800">Lease has expired</p>
            <p className="text-sm text-danger-700">This lease expired on {formatDate(lease.endDate)}. Renew or terminate it.</p>
          </div>
          <Button variant="primary" onClick={handleRenewClick}>Renew Lease</Button>
        </div>
      )}

      {!isExpired && isInRenewalWindow && (
        <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg flex items-center justify-between">
          <div>
            <p className="font-semibold text-warning-800">Lease expiring in {remainingMonths} month{remainingMonths !== 1 ? 's' : ''}</p>
            <p className="text-sm text-warning-700">
              Tenant notice required {lease.noticePeriod || 3} months before expiry ({formatDate(threeMonthsBeforeExpiry.toISOString())}).
              {now < threeMonthsBeforeExpiry
                ? ` You have ${Math.ceil((threeMonthsBeforeExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days to notify the tenant.`
                : ' Notice period has begun — act now.'}
            </p>
          </div>
          <Button variant="primary" onClick={handleRenewClick}>Renew Lease</Button>
        </div>
      )}

      {/* Header */}
      <div className="bg-surface rounded-lg border border-neutral-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-neutral-900">
                Lease — {lease.unitRef?.unitNumber || lease.unit || lease.property?.name || 'Unknown'}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lease.status)}`}>
                {lease.status}
              </span>
            </div>
            <p className="text-neutral-500">{lease.property?.name} • {lease.property?.address}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEditClick}>✏️ Edit</Button>
            <Button variant="outline" onClick={() => window.open(`/api/leases/${leaseId}/generate-pdf`, '_blank')}>
              View Document
            </Button>
            <Button variant="outline" onClick={() => window.open(`/api/leases/${leaseId}/generate-pdf?download=true`, '_blank')}>
              Download Agreement
            </Button>
            {lease.status === 'ACTIVE' && (
              <Button variant="primary" onClick={handleRenewClick}>🔄 Renew</Button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-surface rounded-lg border border-neutral-200 p-5">
          <p className="text-sm text-neutral-600">Monthly Rent</p>
          <p className="text-xl font-bold text-primary-600 mt-1">{formatCurrency(lease.monthlyRent)}</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-5">
          <p className="text-sm text-neutral-600">Security Deposit</p>
          <p className="text-xl font-bold text-neutral-900 mt-1">{formatCurrency(lease.securityDeposit)}</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-5">
          <p className="text-sm text-neutral-600">Lease Term</p>
          <p className="text-xl font-bold text-neutral-900 mt-1">{totalMonths} months</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-5">
          <p className="text-sm text-neutral-600">Remaining</p>
          <p className={`text-xl font-bold mt-1 ${isExpiringSoon ? 'text-warning-600' : 'text-neutral-900'}`}>{remainingMonths} months</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-5">
          <p className="text-sm text-neutral-600">Progress</p>
          <p className="text-xl font-bold text-neutral-900 mt-1">{progressPercent}%</p>
          <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
            <div className={`h-2 rounded-full ${isExpiringSoon ? 'bg-warning-500' : 'bg-primary-600'}`} style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lease Details */}
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <h3 className="font-semibold text-neutral-900 mb-4">Lease Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-neutral-600">Start Date</span><span className="font-medium">{formatDate(lease.startDate)}</span></div>
            <div className="flex justify-between"><span className="text-neutral-600">End Date</span><span className="font-medium">{formatDate(lease.endDate)}</span></div>
            <div className="flex justify-between"><span className="text-neutral-600">Unit</span><span className="font-medium">{lease.unitRef?.unitNumber || lease.unit || '-'}</span></div>
            <div className="flex justify-between"><span className="text-neutral-600">Rent Due Date</span><span className="font-medium">{lease.rentDueDay ? `${lease.rentDueDay}${['st','nd','rd'][((lease.rentDueDay % 100) - 20) % 10] || ['st','nd','rd'][(lease.rentDueDay % 100)] || 'th'} of each month` : '1st of each month'}</span></div>
            <div className="flex justify-between"><span className="text-neutral-600">Grace Period</span><span className="font-medium">{lease.gracePeriodDays ?? 5} days</span></div>
            <div className="flex justify-between"><span className="text-neutral-600">Late Penalty</span><span className="font-medium">KES {Number(lease.latePenaltyPerDay ?? 500).toLocaleString()}/day</span></div>
            <div className="flex justify-between"><span className="text-neutral-600">Notice Period</span><span className="font-medium">{lease.noticePeriod || 1} month{(lease.noticePeriod || 1) !== 1 ? 's' : ''}</span></div>
            <div className="flex justify-between"><span className="text-neutral-600">Rent Escalation</span><span className="font-medium">{lease.rentEscalation > 0 ? `${lease.rentEscalation}% per year` : '—'}</span></div>
            {lease.petPolicy && (
              <div className="flex justify-between"><span className="text-neutral-600">Pet Policy</span><span className="font-medium">{lease.petPolicy}</span></div>
            )}
            <div className="flex justify-between"><span className="text-neutral-600">Payments Made</span><span className="font-medium">{lease._count?.payments || 0}</span></div>
            <div className="flex justify-between"><span className="text-neutral-600">Created</span><span className="font-medium">{formatDate(lease.createdAt)}</span></div>
          </div>
          {(lease.terms || lease.specialConditions) && (
            <div className="mt-4 pt-4 border-t border-neutral-200">
              {lease.terms && (
                <div className="mb-3">
                  <p className="text-sm text-neutral-600 mb-1">Terms</p>
                  <p className="text-sm text-neutral-900">{lease.terms}</p>
                </div>
              )}
              {lease.specialConditions && (
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Special Conditions</p>
                  <p className="text-sm text-neutral-900">{lease.specialConditions}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tenant + Property */}
        <div className="space-y-6">
          <div className="bg-surface rounded-lg border border-neutral-200 p-6">
            <h3 className="font-semibold text-neutral-900 mb-4">Tenant</h3>
            {lease.tenant ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-neutral-600">Name</span><Link href={`/admin/tenants/${lease.tenant.id}`} className="font-medium text-primary-600 hover:underline">{lease.tenant.name}</Link></div>
                <div className="flex justify-between"><span className="text-neutral-600">Email</span><span className="font-medium">{lease.tenant.email}</span></div>
                <div className="flex justify-between"><span className="text-neutral-600">Phone</span><span className="font-medium">{lease.tenant.phone}</span></div>
                {lease.tenant.idNumber && <div className="flex justify-between"><span className="text-neutral-600">ID Number</span><span className="font-medium">{lease.tenant.idNumber}</span></div>}
              </div>
            ) : <p className="text-sm text-neutral-500">No tenant assigned</p>}
          </div>

          <div className="bg-surface rounded-lg border border-neutral-200 p-6">
            <h3 className="font-semibold text-neutral-900 mb-4">Property</h3>
            {lease.property ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-neutral-600">Name</span><Link href={`/admin/properties/${lease.property.id}`} className="font-medium text-primary-600 hover:underline">{lease.property.name}</Link></div>
                <div className="flex justify-between"><span className="text-neutral-600">Address</span><span className="font-medium">{lease.property.address}</span></div>
                <div className="flex justify-between"><span className="text-neutral-600">Type</span><span className="font-medium">{lease.property.type}</span></div>
                {(lease.unitRef?.landlord || lease.property.landlord) && (
                  <div className="flex justify-between"><span className="text-neutral-600">Landlord</span><span className="font-medium">{lease.unitRef?.landlord?.name || lease.property.landlord?.name}</span></div>
                )}
              </div>
            ) : <p className="text-sm text-neutral-500">No property assigned</p>}
          </div>

          {/* Document & Signatures */}
          <div className="bg-surface rounded-lg border border-neutral-200 p-6">
            <h3 className="font-semibold text-neutral-900 mb-4">Document & Signatures</h3>
            <div className="space-y-4">
              {/* Lease Document */}
              <div className="p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-neutral-700">Lease Document</span>
                  {(lease.documentUrl || lease.documentHtml) ? (
                    <span className="text-xs text-success-600 font-medium">✓ Uploaded</span>
                  ) : (
                    <span className="text-xs text-neutral-400">No document</span>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  {lease.documentUrl && (
                    <a href={lease.documentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline">View PDF</a>
                  )}
                  {lease.documentHtml && (
                    <Link href={`/admin/leases/${leaseId}/document`} className="text-xs text-primary-600 hover:underline">View Document</Link>
                  )}
                  <input type="file" ref={docInputRef} accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f, 'document') }} />
                  <button onClick={() => docInputRef.current?.click()} disabled={!!uploading} className="text-xs text-primary-600 hover:underline disabled:opacity-50">
                    {uploading === 'document' ? 'Uploading...' : lease.documentUrl ? 'Replace' : 'Upload PDF'}
                  </button>
                </div>
              </div>

              {/* Landlord Signature */}
              <div className="p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-neutral-700">Landlord / Admin Signature</span>
                  {lease.landlordSignedAt ? (
                    <span className="text-xs text-success-600 font-medium">✓ Signed {formatDate(lease.landlordSignedAt)}</span>
                  ) : (
                    <span className="text-xs text-neutral-400">Not signed</span>
                  )}
                </div>
                {lease.landlordSignature && lease.landlordSignature.startsWith('http') && (
                  <img src={lease.landlordSignature} alt="Landlord signature" className="h-16 border border-neutral-200 rounded mt-1 bg-white" />
                )}
                {showLandlordSigPad ? (
                  <div className="mt-2">
                    <SignaturePad
                      label="Draw your signature"
                      saving={uploading === 'landlordSignature'}
                      onSave={(dataUrl) => handleSignaturePadSave(dataUrl, 'landlordSignature')}
                      onCancel={() => setShowLandlordSigPad(false)}
                    />
                  </div>
                ) : (
                  <div className="flex gap-3 mt-2">
                    <button onClick={() => setShowLandlordSigPad(true)} disabled={!!uploading} className="text-xs text-primary-600 hover:underline disabled:opacity-50">
                      Draw signature
                    </button>
                    <span className="text-xs text-neutral-300">|</span>
                    <input type="file" ref={landlordSigRef} accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f, 'landlordSignature') }} />
                    <button onClick={() => landlordSigRef.current?.click()} disabled={!!uploading} className="text-xs text-primary-600 hover:underline disabled:opacity-50">
                      {uploading === 'landlordSignature' ? 'Uploading...' : 'Upload image'}
                    </button>
                  </div>
                )}
              </div>

              {/* Tenant Signature */}
              <div className="p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-neutral-700">Tenant Signature</span>
                  {lease.tenantSignedAt ? (
                    <span className="text-xs text-success-600 font-medium">✓ Signed {formatDate(lease.tenantSignedAt)}</span>
                  ) : (
                    <span className="text-xs text-neutral-400">Not signed</span>
                  )}
                </div>
                {lease.tenantSignature && lease.tenantSignature.startsWith('http') && (
                  <img src={lease.tenantSignature} alt="Tenant signature" className="h-16 border border-neutral-200 rounded mt-1 bg-white" />
                )}
                <div className="flex gap-2 mt-2">
                  <input type="file" ref={tenantSigRef} accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f, 'tenantSignature') }} />
                  <button onClick={() => tenantSigRef.current?.click()} disabled={!!uploading} className="text-xs text-primary-600 hover:underline disabled:opacity-50">
                    {uploading === 'tenantSignature' ? 'Uploading...' : lease.tenantSignature ? 'Replace signature' : 'Upload signature'}
                  </button>
                </div>
              </div>

              {/* Send for Signing */}
              <div className="pt-3 border-t border-neutral-200">
                {lease.sentForSigning ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Sent for Signing</span>
                    <span className="font-medium text-success-600">✓ Sent {formatDate(lease.sentAt)}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-700">Send to tenant for signing</p>
                      <p className="text-xs text-neutral-500">Tenant will be able to view and sign from their portal</p>
                    </div>
                    <Button variant="primary" onClick={handleSendForSigning} disabled={saving || (!lease.documentUrl && !lease.documentHtml)}>
                      {saving ? 'Sending...' : 'Send for Signing'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      {lease.payments && lease.payments.length > 0 && (
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <h3 className="font-semibold text-neutral-900 mb-4">Payment History</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-2 text-neutral-600 font-medium">Date</th>
                <th className="text-left py-2 text-neutral-600 font-medium">Amount</th>
                <th className="text-left py-2 text-neutral-600 font-medium">Method</th>
                <th className="text-left py-2 text-neutral-600 font-medium">Type</th>
                <th className="text-left py-2 text-neutral-600 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {lease.payments.map((p: any) => (
                <tr key={p.id} className="border-b border-neutral-100">
                  <td className="py-2">{formatDate(p.paidDate)}</td>
                  <td className="py-2 font-medium">{formatCurrency(p.amount)}</td>
                  <td className="py-2">{p.method}</td>
                  <td className="py-2">{p.type}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${p.status === 'PAID' ? 'bg-success-50 text-success-700' : 'bg-yellow-50 text-yellow-700'}`}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6">
            {editStep === 'edit' ? (
              <>
                <h3 className="text-xl font-bold text-neutral-900 mb-1">Edit Lease</h3>
                <p className="text-sm text-neutral-500 mb-5">Changes will require confirmation before saving.</p>
                <div className="space-y-5">

                  {/* Lease Status & Dates */}
                  <div>
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">Lease Period</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                        <select value={editForm.status} onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm">
                          <option value="ACTIVE">Active</option>
                          <option value="PENDING">Pending</option>
                          <option value="EXPIRED">Expired</option>
                          <option value="TERMINATED">Terminated</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Notice Period (months)</label>
                        <input type="number" min="1" value={editForm.noticePeriod} onChange={(e) => setEditForm(prev => ({ ...prev, noticePeriod: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Start Date</label>
                        <input type="date" value={editForm.startDate} onChange={(e) => setEditForm(prev => ({ ...prev, startDate: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">End Date</label>
                        <input type="date" value={editForm.endDate} onChange={(e) => setEditForm(prev => ({ ...prev, endDate: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Financial Terms */}
                  <div>
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">Financial Terms</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Monthly Rent (KES)</label>
                        <input type="number" value={editForm.monthlyRent} onChange={(e) => setEditForm(prev => ({ ...prev, monthlyRent: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Security Deposit (KES)</label>
                        <input type="number" value={editForm.securityDeposit} onChange={(e) => setEditForm(prev => ({ ...prev, securityDeposit: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Rent Due Day (1–31)</label>
                        <input type="number" min="1" max="31" value={editForm.rentDueDay} onChange={(e) => setEditForm(prev => ({ ...prev, rentDueDay: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Grace Period (days)</label>
                        <input type="number" min="0" value={editForm.gracePeriodDays} onChange={(e) => setEditForm(prev => ({ ...prev, gracePeriodDays: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Late Penalty (KES/day)</label>
                        <input type="number" min="0" value={editForm.latePenaltyPerDay} onChange={(e) => setEditForm(prev => ({ ...prev, latePenaltyPerDay: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Annual Escalation (%)</label>
                        <input type="number" min="0" max="100" step="0.5" placeholder="e.g. 5" value={editForm.rentEscalation} onChange={(e) => setEditForm(prev => ({ ...prev, rentEscalation: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div>
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">Payment Methods</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">M-Pesa Till / Paybill</label>
                        <input placeholder="e.g. Till No. 1234567 — Tochi Property" value={editForm.mpesaTill} onChange={(e) => setEditForm(prev => ({ ...prev, mpesaTill: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Bank EFT Details</label>
                        <input placeholder="e.g. Equity Bank, A/C 0140XXXXXX, Branch: Westlands" value={editForm.bankDetails} onChange={(e) => setEditForm(prev => ({ ...prev, bankDetails: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Second Tenant */}
                  <div>
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">Second Tenant (optional)</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
                        <input value={editForm.tenant2Name} onChange={(e) => setEditForm(prev => ({ ...prev, tenant2Name: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">ID / Passport No.</label>
                        <input value={editForm.tenant2IdNumber} onChange={(e) => setEditForm(prev => ({ ...prev, tenant2IdNumber: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                        <input type="email" value={editForm.tenant2Email} onChange={(e) => setEditForm(prev => ({ ...prev, tenant2Email: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
                        <input value={editForm.tenant2Phone} onChange={(e) => setEditForm(prev => ({ ...prev, tenant2Phone: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Conditions */}
                  <div>
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">Conditions</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Pet Policy</label>
                        <input value={editForm.petPolicy} onChange={(e) => setEditForm(prev => ({ ...prev, petPolicy: e.target.value }))} placeholder="e.g. No pets without written consent" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Special Conditions</label>
                        <textarea value={editForm.specialConditions} onChange={(e) => setEditForm(prev => ({ ...prev, specialConditions: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" rows={2} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Terms / Notes</label>
                        <textarea value={editForm.terms} onChange={(e) => setEditForm(prev => ({ ...prev, terms: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" rows={2} />
                      </div>
                    </div>
                  </div>

                </div>
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">Cancel</Button>
                  <Button variant="primary" onClick={handleSaveEdit} className="flex-1">Review Changes</Button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-neutral-900 mb-1">Review Changes</h3>
                <p className="text-sm text-neutral-500 mb-4">{changeLog.length} field{changeLog.length !== 1 ? 's' : ''} will be updated. Please confirm before saving.</p>
                <div className="border border-neutral-200 rounded-lg overflow-hidden mb-5">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200">
                        <th className="text-left px-4 py-2.5 font-semibold text-neutral-700 w-2/5">Field</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-neutral-500 w-[30%]">From</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-primary-700 w-[30%]">To</th>
                      </tr>
                    </thead>
                    <tbody>
                      {changeLog.map((c, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
                          <td className="px-4 py-2.5 font-medium text-neutral-700">{c.label}</td>
                          <td className="px-4 py-2.5 text-neutral-500 line-through">{c.from}</td>
                          <td className="px-4 py-2.5 text-primary-700 font-medium">{c.to}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setEditStep('edit')} className="flex-1">Back to Edit</Button>
                  <Button variant="primary" onClick={handleConfirmSave} disabled={saving} className="flex-1">{saving ? 'Saving...' : 'Confirm & Save'}</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Renew Modal */}
      {showRenewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Renew Lease</h3>
            <p className="text-sm text-neutral-500 mb-4">
              Create a new lease for {lease.tenant?.name} at {lease.unit || lease.property?.name}. It will stay <strong>Pending</strong> until signed by both parties, then auto-activate when the current lease expires.
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">New Start Date *</label>
                  <input type="date" value={renewForm.newStartDate} onChange={(e) => { setRenewForm(prev => ({ ...prev, newStartDate: e.target.value })); updateRenewEndDate(e.target.value, renewForm.leaseTerm) }} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Lease Term</label>
                  <select value={renewForm.leaseTerm} onChange={(e) => { setRenewForm(prev => ({ ...prev, leaseTerm: e.target.value })); updateRenewEndDate(renewForm.newStartDate, e.target.value) }} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm">
                    <option value="6">6 months</option>
                    <option value="12">12 months</option>
                    <option value="18">18 months</option>
                    <option value="24">24 months</option>
                    <option value="36">36 months</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">End Date</label>
                  <input type="date" value={renewForm.newEndDate} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-neutral-50" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">New Monthly Rent (KES)</label>
                  <input type="number" value={renewForm.newMonthlyRent} onChange={(e) => setRenewForm(prev => ({ ...prev, newMonthlyRent: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
                  {lease.rentEscalation > 0 && (
                    <p className="text-xs text-neutral-500 mt-1">Previous: {formatCurrency(lease.monthlyRent)} (+{lease.rentEscalation}% = {formatCurrency(lease.monthlyRent * (1 + lease.rentEscalation / 100))})</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowRenewModal(false)} className="flex-1">Cancel</Button>
              <Button variant="primary" onClick={handleRenew} disabled={saving || !renewForm.newStartDate || !renewForm.newEndDate || !renewForm.newMonthlyRent} className="flex-1">
                {saving ? 'Creating...' : 'Create Pending Lease'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
