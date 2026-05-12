'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { formatDate } from '@/lib/utils'

interface LeaseRenewal {
  id: string
  leaseId: string
  tenantId: string
  propertyId: string
  currentRent: string
  leaseEndDate: string
  alertDate: string
  alertSentAt: string | null
  agentActionAt: string | null
  landlordIntent: string | null
  landlordDecisionAt: string | null
  proposedRent: string | null
  rentIncreasePercent: string | null
  marketComparables: { property: string; rent: number; source: string }[] | null
  tenantNotifiedAt: string | null
  tenantResponse: string | null
  tenantResponseAt: string | null
  status: string
  newLeaseId: string | null
  renewalNotes: string | null
  createdAt: string
  updatedAt: string
  tenant: { id: string; name: string; email: string; phone?: string }
  property: { id: string; name: string; address: string }
  lease: {
    id: string
    startDate: string
    endDate: string
    monthlyRent: string
    status: string
    unit: string | null
    unitRef: { id: string; unitNumber: string } | null
  }
}

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'LANDLORD_REVIEW', label: 'Landlord Review' },
  { value: 'RENT_REVIEW', label: 'Rent Review' },
  { value: 'TENANT_NOTIFIED', label: 'Tenant Notified' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'DECLINED', label: 'Declined' },
  { value: 'RENEWED', label: 'Renewed' },
  { value: 'MONTH_TO_MONTH', label: 'Month-to-Month' },
]

const INTENT_OPTIONS = [
  { value: '', label: 'Select intent...', disabled: true },
  { value: 'RENEW_SAME', label: 'Renew at Same Rent' },
  { value: 'RENEW_NEW_RENT', label: 'Renew at New Rent' },
  { value: 'NOT_RENEWING', label: 'Not Renewing' },
]

const TENANT_RESPONSE_OPTIONS = [
  { value: '', label: 'Select response...', disabled: true },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'NEGOTIATING', label: 'Negotiating' },
  { value: 'DECLINED', label: 'Declined' },
]

function getDaysUntilExpiry(endDate: string): number {
  const now = new Date()
  const end = new Date(endDate)
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function getUrgencyBadge(days: number) {
  if (days <= 0) return <Badge variant="danger" size="sm">Expired</Badge>
  if (days <= 30) return <Badge variant="danger" size="sm">{days}d - Urgent</Badge>
  if (days <= 60) return <Badge variant="warning" size="sm">{days}d - Soon</Badge>
  if (days <= 90) return <Badge variant="primary" size="sm">{days}d</Badge>
  return <Badge variant="neutral" size="sm">{days}d</Badge>
}

function getStatusBadge(status: string) {
  const map: Record<string, { variant: 'primary' | 'success' | 'danger' | 'warning' | 'neutral'; label: string }> = {
    PENDING: { variant: 'warning', label: 'Pending' },
    LANDLORD_REVIEW: { variant: 'primary', label: 'Landlord Review' },
    RENT_REVIEW: { variant: 'primary', label: 'Rent Review' },
    TENANT_NOTIFIED: { variant: 'primary', label: 'Tenant Notified' },
    ACCEPTED: { variant: 'success', label: 'Accepted' },
    DECLINED: { variant: 'danger', label: 'Declined' },
    RENEWED: { variant: 'success', label: 'Renewed' },
    EXPIRED: { variant: 'danger', label: 'Expired' },
    MONTH_TO_MONTH: { variant: 'warning', label: 'Month-to-Month' },
  }
  const s = map[status] || { variant: 'neutral' as const, label: status }
  return <Badge variant={s.variant} size="sm">{s.label}</Badge>
}

function getIntentLabel(intent: string | null) {
  if (!intent) return '-'
  const map: Record<string, string> = {
    RENEW_SAME: 'Renew Same Rent',
    RENEW_NEW_RENT: 'Renew New Rent',
    NOT_RENEWING: 'Not Renewing',
  }
  return map[intent] || intent
}

export default function RenewalsPage() {
  const [renewals, setRenewals] = useState<LeaseRenewal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<string | null>(null)

  // Detail modal
  const [selectedRenewal, setSelectedRenewal] = useState<LeaseRenewal | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // Form state for detail modal
  const [landlordIntent, setLandlordIntent] = useState('')
  const [proposedRent, setProposedRent] = useState('')
  const [tenantResponse, setTenantResponse] = useState('')
  const [renewalNotes, setRenewalNotes] = useState('')
  const [comparables, setComparables] = useState<{ property: string; rent: string; source: string }[]>([
    { property: '', rent: '', source: '' },
  ])
  const [saving, setSaving] = useState(false)

  // Renew modal
  const [renewModalOpen, setRenewModalOpen] = useState(false)
  const [renewForm, setRenewForm] = useState({
    newMonthlyRent: '',
    newStartDate: '',
    newEndDate: '',
  })

  const fetchRenewals = useCallback(() => {
    setIsLoading(true)
    const params = new URLSearchParams()
    if (activeTab !== 'all') params.set('status', activeTab)
    params.set('limit', '200')

    fetch(`/api/lease-renewals?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setRenewals(data.renewals || [])
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [activeTab])

  useEffect(() => {
    fetchRenewals()
  }, [fetchRenewals])

  const handleScan = async () => {
    setScanning(true)
    setScanResult(null)
    try {
      const res = await fetch('/api/lease-renewals/scan', { method: 'POST' })
      const data = await res.json()
      setScanResult(data.message || 'Scan complete')
      fetchRenewals()
    } catch {
      setScanResult('Scan failed')
    } finally {
      setScanning(false)
    }
  }

  const openDetail = (renewal: LeaseRenewal) => {
    setSelectedRenewal(renewal)
    setLandlordIntent(renewal.landlordIntent || '')
    setProposedRent(renewal.proposedRent ? String(Number(renewal.proposedRent)) : '')
    setTenantResponse(renewal.tenantResponse || '')
    setRenewalNotes(renewal.renewalNotes || '')
    setComparables(
      renewal.marketComparables && renewal.marketComparables.length > 0
        ? renewal.marketComparables.map((c) => ({
            property: c.property,
            rent: String(c.rent),
            source: c.source,
          }))
        : [{ property: '', rent: '', source: '' }]
    )
    setDetailOpen(true)
  }

  const handleSaveDetail = async (extraData?: Record<string, unknown>) => {
    if (!selectedRenewal) return
    setSaving(true)
    try {
      const payload: any = { ...extraData }

      if (landlordIntent) payload.landlordIntent = landlordIntent
      if (proposedRent) payload.proposedRent = Number(proposedRent)
      if (tenantResponse) payload.tenantResponse = tenantResponse
      if (renewalNotes) payload.renewalNotes = renewalNotes

      const validComparables = comparables.filter(
        (c) => c.property.trim() && c.rent.trim()
      )
      if (validComparables.length > 0) {
        payload.marketComparables = validComparables.map((c) => ({
          property: c.property,
          rent: Number(c.rent),
          source: c.source,
        }))
      }

      const res = await fetch(`/api/lease-renewals/${selectedRenewal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setDetailOpen(false)
        fetchRenewals()
      }
    } finally {
      setSaving(false)
    }
  }

  const handleExecuteRenewal = async () => {
    if (!selectedRenewal) return
    setSaving(true)
    try {
      const res = await fetch(`/api/lease-renewals/${selectedRenewal.id}/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newMonthlyRent: Number(renewForm.newMonthlyRent),
          newStartDate: renewForm.newStartDate,
          newEndDate: renewForm.newEndDate,
        }),
      })

      if (res.ok) {
        setRenewModalOpen(false)
        setDetailOpen(false)
        fetchRenewals()
      }
    } finally {
      setSaving(false)
    }
  }

  const handleExtendMonthToMonth = () => {
    handleSaveDetail({ status: 'MONTH_TO_MONTH' })
  }

  const addComparable = () => {
    if (comparables.length < 3) {
      setComparables([...comparables, { property: '', rent: '', source: '' }])
    }
  }

  const updateComparable = (index: number, field: string, value: string) => {
    const updated = [...comparables]
    updated[index] = { ...updated[index], [field]: value }
    setComparables(updated)
  }

  const removeComparable = (index: number) => {
    setComparables(comparables.filter((_, i) => i !== index))
  }

  // Stats
  const now = new Date()
  const allRenewals = renewals
  const stats = {
    due30: allRenewals.filter((r) => {
      const d = getDaysUntilExpiry(r.leaseEndDate)
      return d > 0 && d <= 30 && !['RENEWED', 'DECLINED', 'EXPIRED'].includes(r.status)
    }).length,
    due60: allRenewals.filter((r) => {
      const d = getDaysUntilExpiry(r.leaseEndDate)
      return d > 0 && d <= 60 && !['RENEWED', 'DECLINED', 'EXPIRED'].includes(r.status)
    }).length,
    due90: allRenewals.filter((r) => {
      const d = getDaysUntilExpiry(r.leaseEndDate)
      return d > 0 && d <= 90 && !['RENEWED', 'DECLINED', 'EXPIRED'].includes(r.status)
    }).length,
    pendingAction: allRenewals.filter((r) =>
      ['PENDING', 'LANDLORD_REVIEW', 'RENT_REVIEW'].includes(r.status)
    ).length,
    renewedThisMonth: allRenewals.filter((r) => {
      if (r.status !== 'RENEWED') return false
      const updated = new Date(r.updatedAt)
      return (
        updated.getMonth() === now.getMonth() &&
        updated.getFullYear() === now.getFullYear()
      )
    }).length,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">
            Lease Renewals & Rent Review
          </h1>
          <p className="text-neutral-600 mt-1">
            Manage upcoming renewals, landlord intent, and tenant responses
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={handleScan}
          disabled={scanning}
        >
          {scanning ? 'Scanning...' : 'Scan for Renewals'}
        </Button>
      </div>

      {scanResult && (
        <div className="bg-success-50 border border-success-200 text-success-800 px-4 py-3 rounded-lg text-sm">
          {scanResult}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white shadow rounded-lg p-5 border-l-4 border-danger-500">
          <p className="text-sm text-neutral-600">Due in 30 Days</p>
          <p className="text-2xl font-bold text-danger-600">{stats.due30}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-5 border-l-4 border-warning-500">
          <p className="text-sm text-neutral-600">Due in 60 Days</p>
          <p className="text-2xl font-bold text-warning-600">{stats.due60}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-5 border-l-4 border-primary-500">
          <p className="text-sm text-neutral-600">Due in 90 Days</p>
          <p className="text-2xl font-bold text-primary-600">{stats.due90}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-5 border-l-4 border-neutral-400">
          <p className="text-sm text-neutral-600">Pending Action</p>
          <p className="text-2xl font-bold text-neutral-900">{stats.pendingAction}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-5 border-l-4 border-success-500">
          <p className="text-sm text-neutral-600">Renewed This Month</p>
          <p className="text-2xl font-bold text-success-600">{stats.renewedThisMonth}</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="bg-white shadow rounded-lg p-2">
        <div className="flex flex-wrap gap-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                activeTab === tab.value
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {renewals.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-neutral-500 text-lg font-medium">
              No renewals found
            </p>
            <p className="text-neutral-400 text-sm mt-1">
              Click &quot;Scan for Renewals&quot; to detect expiring leases
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Tenant
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Property / Unit
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Current Rent
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Lease End
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Expiry
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Proposed Rent
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {renewals.map((renewal) => {
                  const daysLeft = getDaysUntilExpiry(renewal.leaseEndDate)
                  const unitLabel =
                    renewal.lease.unitRef?.unitNumber || renewal.lease.unit || ''
                  return (
                    <tr
                      key={renewal.id}
                      className={`hover:bg-neutral-50 ${
                        daysLeft <= 0
                          ? 'bg-danger-50/50'
                          : daysLeft <= 30
                          ? 'bg-danger-50/30'
                          : daysLeft <= 60
                          ? 'bg-warning-50/30'
                          : ''
                      }`}
                    >
                      <td className="px-5 py-4 text-sm">
                        <Link
                          href={`/admin/tenants/${renewal.tenant.id}`}
                          className="text-primary-600 hover:text-primary-800 font-medium hover:underline"
                        >
                          {renewal.tenant.name}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <Link
                          href={`/admin/properties/${renewal.property.id}`}
                          className="text-primary-600 hover:text-primary-800 hover:underline"
                        >
                          {renewal.property.name}
                        </Link>
                        {unitLabel && (
                          <span className="text-neutral-500 ml-1">
                            - {unitLabel}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-neutral-900">
                        KES {Number(renewal.currentRent).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-sm text-neutral-900">
                        {formatDate(renewal.leaseEndDate)}
                      </td>
                      <td className="px-5 py-4">
                        {getUrgencyBadge(daysLeft)}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        {renewal.proposedRent ? (
                          <span className="font-semibold text-neutral-900">
                            KES {Number(renewal.proposedRent).toLocaleString()}
                            {renewal.rentIncreasePercent && (
                              <span className="text-xs text-neutral-500 ml-1">
                                (+{Number(renewal.rentIncreasePercent)}%)
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-neutral-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4">{getStatusBadge(renewal.status)}</td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => openDetail(renewal)}
                          className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        className="max-w-2xl"
      >
        {selectedRenewal && (
          <>
            <ModalHeader>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  Renewal Details
                </h3>
                <p className="text-sm text-neutral-500">
                  {selectedRenewal.tenant.name} -{' '}
                  {selectedRenewal.property.name}
                </p>
              </div>
              <button
                onClick={() => setDetailOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </ModalHeader>

            <ModalBody className="space-y-6">
              {/* Current Terms */}
              <div className="grid grid-cols-2 gap-4 bg-neutral-50 rounded-lg p-4">
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-medium">
                    Current Rent
                  </p>
                  <p className="text-lg font-bold text-neutral-900">
                    KES{' '}
                    {Number(selectedRenewal.currentRent).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-medium">
                    Lease End
                  </p>
                  <p className="text-lg font-bold text-neutral-900">
                    {formatDate(selectedRenewal.leaseEndDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-medium">
                    Days Until Expiry
                  </p>
                  <p className="text-lg font-bold">
                    {getDaysUntilExpiry(selectedRenewal.leaseEndDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-medium">
                    Status
                  </p>
                  <div className="mt-1">
                    {getStatusBadge(selectedRenewal.status)}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-700 mb-3">
                  Timeline
                </h4>
                <div className="space-y-2 text-sm">
                  <TimelineItem
                    label="Alert Generated"
                    date={selectedRenewal.alertSentAt}
                    fallback={selectedRenewal.createdAt}
                  />
                  <TimelineItem
                    label="Agent Action"
                    date={selectedRenewal.agentActionAt}
                  />
                  <TimelineItem
                    label="Landlord Decision"
                    date={selectedRenewal.landlordDecisionAt}
                    extra={getIntentLabel(selectedRenewal.landlordIntent)}
                  />
                  <TimelineItem
                    label="Tenant Notified"
                    date={selectedRenewal.tenantNotifiedAt}
                  />
                  <TimelineItem
                    label="Tenant Response"
                    date={selectedRenewal.tenantResponseAt}
                    extra={selectedRenewal.tenantResponse || undefined}
                  />
                </div>
              </div>

              {/* Landlord Intent */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-700 mb-2">
                  Landlord Intent
                </h4>
                <Select
                  value={landlordIntent}
                  onChange={(e) => setLandlordIntent(e.target.value)}
                  options={INTENT_OPTIONS}
                  placeholder="Select landlord intent"
                />
              </div>

              {/* Rent Review Section */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-700 mb-2">
                  Rent Review
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Current Rent (KES)"
                    value={Number(selectedRenewal.currentRent).toLocaleString()}
                    disabled
                  />
                  <Input
                    label="Proposed Rent (KES)"
                    type="number"
                    value={proposedRent}
                    onChange={(e) => setProposedRent(e.target.value)}
                    placeholder="Enter proposed rent"
                  />
                </div>
                {proposedRent && Number(proposedRent) > 0 && (
                  <p className="text-sm text-neutral-600 mt-1">
                    Increase:{' '}
                    {(
                      ((Number(proposedRent) -
                        Number(selectedRenewal.currentRent)) /
                        Number(selectedRenewal.currentRent)) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                )}
              </div>

              {/* Market Comparables */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-neutral-700">
                    Market Comparables
                  </h4>
                  {comparables.length < 3 && (
                    <button
                      onClick={addComparable}
                      className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                    >
                      + Add Comparable
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {comparables.map((comp, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-end"
                    >
                      <div className="col-span-5">
                        <Input
                          label={idx === 0 ? 'Property' : undefined}
                          value={comp.property}
                          onChange={(e) =>
                            updateComparable(idx, 'property', e.target.value)
                          }
                          placeholder="Property name"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          label={idx === 0 ? 'Rent (KES)' : undefined}
                          type="number"
                          value={comp.rent}
                          onChange={(e) =>
                            updateComparable(idx, 'rent', e.target.value)
                          }
                          placeholder="Rent"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          label={idx === 0 ? 'Source' : undefined}
                          value={comp.source}
                          onChange={(e) =>
                            updateComparable(idx, 'source', e.target.value)
                          }
                          placeholder="Source"
                        />
                      </div>
                      <div className="col-span-1 pb-1">
                        <button
                          onClick={() => removeComparable(idx)}
                          className="p-2 text-neutral-400 hover:text-danger-600"
                          title="Remove"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tenant Response */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-700 mb-2">
                  Tenant Response
                </h4>
                <Select
                  value={tenantResponse}
                  onChange={(e) => setTenantResponse(e.target.value)}
                  options={TENANT_RESPONSE_OPTIONS}
                  placeholder="Select tenant response"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Notes
                </label>
                <textarea
                  className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  rows={3}
                  value={renewalNotes}
                  onChange={(e) => setRenewalNotes(e.target.value)}
                  placeholder="Add renewal notes..."
                />
              </div>
            </ModalBody>

            <ModalFooter className="flex-wrap gap-2">
              {!['RENEWED', 'EXPIRED', 'DECLINED'].includes(
                selectedRenewal.status
              ) && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExtendMonthToMonth}
                    disabled={saving}
                  >
                    Extend Month-to-Month
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveDetail({ status: 'TENANT_NOTIFIED' })}
                    disabled={saving}
                  >
                    Notify Tenant
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setRenewForm({
                        newMonthlyRent: proposedRent || String(Number(selectedRenewal.currentRent)),
                        newStartDate: selectedRenewal.leaseEndDate.split('T')[0],
                        newEndDate: '',
                      })
                      setRenewModalOpen(true)
                    }}
                    disabled={saving}
                  >
                    Execute Renewal
                  </Button>
                </>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSaveDetail()}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>

      {/* Renew / Execute Modal */}
      <Modal open={renewModalOpen} onClose={() => setRenewModalOpen(false)}>
        <ModalHeader>
          <h3 className="text-lg font-semibold text-neutral-900">
            Execute Lease Renewal
          </h3>
          <button
            onClick={() => setRenewModalOpen(false)}
            className="p-1 text-neutral-400 hover:text-neutral-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <p className="text-sm text-neutral-600">
            This will create a new lease and mark the current one as expired.
          </p>
          <Input
            label="New Monthly Rent (KES)"
            type="number"
            value={renewForm.newMonthlyRent}
            onChange={(e) =>
              setRenewForm({ ...renewForm, newMonthlyRent: e.target.value })
            }
          />
          <Input
            label="New Start Date"
            type="date"
            value={renewForm.newStartDate}
            onChange={(e) =>
              setRenewForm({ ...renewForm, newStartDate: e.target.value })
            }
          />
          <Input
            label="New End Date"
            type="date"
            value={renewForm.newEndDate}
            onChange={(e) =>
              setRenewForm({ ...renewForm, newEndDate: e.target.value })
            }
          />
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRenewModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExecuteRenewal}
            disabled={
              saving ||
              !renewForm.newMonthlyRent ||
              !renewForm.newStartDate ||
              !renewForm.newEndDate
            }
          >
            {saving ? 'Creating...' : 'Create New Lease'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

function TimelineItem({
  label,
  date,
  fallback,
  extra,
}: {
  label: string
  date: string | null | undefined
  fallback?: string
  extra?: string
}) {
  const displayDate = date || fallback
  const isComplete = !!displayDate
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
          isComplete ? 'bg-success-500' : 'bg-neutral-300'
        }`}
      />
      <span
        className={`${
          isComplete ? 'text-neutral-900' : 'text-neutral-400'
        }`}
      >
        {label}
      </span>
      {displayDate && (
        <span className="text-neutral-500 text-xs">
          {formatDate(displayDate)}
        </span>
      )}
      {extra && (
        <Badge variant="neutral" size="sm">
          {extra}
        </Badge>
      )}
    </div>
  )
}
