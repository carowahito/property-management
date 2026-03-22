'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatDate } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MoveInChecklist {
  id: string
  leaseId: string
  tenantId: string
  propertyId: string
  unitId: string | null
  agreementSigned: boolean
  depositCleared: boolean
  firstMonthCleared: boolean
  inspectionDone: boolean
  metersLogged: boolean
  inventorySigned: boolean
  profileActive: boolean
  welcomePackSent: boolean
  keysHandedOver: boolean
  electricityMeterReading: string | null
  waterMeterReading: string | null
  status: string
  completedAt: string | null
  notes: string | null
  createdAt: string
  tenant: {
    id: string
    name: string
    email: string
    phone: string
    unit: string | null
  }
  property: {
    id: string
    name: string
    address: string
  }
  lease: {
    id: string
    unit: string | null
    unitId: string | null
    startDate: string
    endDate: string
    status: string
    monthlyRent: number
  }
}

interface ChecklistsResponse {
  checklists: MoveInChecklist[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface LeaseOption {
  id: string
  tenantId: string
  propertyId: string
  unitId: string | null
  unit: string | null
  status: string
  tenant: { id: string; name: string; email: string }
  property: { id: string; name: string }
}

// ---------------------------------------------------------------------------
// Checklist item definitions
// ---------------------------------------------------------------------------

const CHECKLIST_ITEMS = [
  { key: 'agreementSigned', label: 'Agreement Signed' },
  { key: 'depositCleared', label: 'Deposit Cleared' },
  { key: 'firstMonthCleared', label: 'First Month Rent Cleared' },
  { key: 'inspectionDone', label: 'Move-In Inspection Done' },
  { key: 'metersLogged', label: 'Meter Readings Logged' },
  { key: 'inventorySigned', label: 'Inventory Signed' },
  { key: 'profileActive', label: 'Tenant Profile Active' },
  { key: 'welcomePackSent', label: 'Welcome Pack Sent' },
  { key: 'keysHandedOver', label: 'Keys Handed Over' },
] as const

type ChecklistKey = (typeof CHECKLIST_ITEMS)[number]['key']

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function fetchChecklists(status: string): Promise<ChecklistsResponse> {
  const params = new URLSearchParams()
  if (status !== 'all') params.set('status', status)
  const res = await fetch(`/api/move-in?${params}`)
  if (!res.ok) throw new Error('Failed to fetch checklists')
  return res.json()
}

async function fetchLeases(): Promise<LeaseOption[]> {
  const res = await fetch('/api/leases?limit=200')
  if (!res.ok) throw new Error('Failed to fetch leases')
  const data = await res.json()
  return (data.leases || []).map((l: any) => ({
    id: l.id,
    tenantId: l.tenantId,
    propertyId: l.propertyId,
    unitId: l.unitId || null,
    unit: l.unit || null,
    status: l.status,
    tenant: l.tenant || { id: l.tenantId, name: '', email: '' },
    property: l.property || { id: l.propertyId, name: '' },
  }))
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusBadgeVariant(status: string) {
  switch (status) {
    case 'PENDING':
      return 'warning' as const
    case 'IN_PROGRESS':
      return 'primary' as const
    case 'COMPLETED':
      return 'success' as const
    case 'CANCELLED':
      return 'danger' as const
    default:
      return 'neutral' as const
  }
}

function formatStatus(status: string) {
  return status.replace(/_/g, ' ')
}

function getCheckedCount(checklist: MoveInChecklist): number {
  return CHECKLIST_ITEMS.filter((item) => checklist[item.key as keyof MoveInChecklist]).length
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MoveInPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedChecklist, setSelectedChecklist] = useState<MoveInChecklist | null>(null)

  // Fetch checklists
  const { data, isLoading, error } = useQuery({
    queryKey: ['move-in-checklists', statusFilter],
    queryFn: () => fetchChecklists(statusFilter),
  })

  const checklists = data?.checklists || []

  // Fetch all for stats
  const allQuery = useQuery({
    queryKey: ['move-in-checklists', 'all'],
    queryFn: () => fetchChecklists('all'),
  })
  const allChecklists = allQuery.data?.checklists || []

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const stats = {
    pending: allChecklists.filter((c) => c.status === 'PENDING').length,
    inProgress: allChecklists.filter((c) => c.status === 'IN_PROGRESS').length,
    completedThisMonth: allChecklists.filter(
      (c) => c.status === 'COMPLETED' && c.completedAt && new Date(c.completedAt) >= startOfMonth
    ).length,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load move-in checklists. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Move-In Checklists</h1>
          <p className="text-neutral-600 mt-1">
            Manage move-in workflows and ensure all steps are completed
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowCreateModal(true)}>
          + Start Move-In
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface shadow rounded-lg p-6 border border-border">
          <p className="text-sm text-neutral-600">Pending Move-Ins</p>
          <p className="text-3xl font-bold text-warning-600">{stats.pending}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-6 border border-border">
          <p className="text-sm text-neutral-600">In Progress</p>
          <p className="text-3xl font-bold text-primary-600">{stats.inProgress}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-6 border border-border">
          <p className="text-sm text-neutral-600">Completed This Month</p>
          <p className="text-3xl font-bold text-success-600">{stats.completedThisMonth}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-surface shadow rounded-lg p-4 border border-border">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="min-w-[200px]">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface shadow rounded-lg overflow-hidden border border-border">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                Tenant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                Property / Unit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-neutral-200">
            {checklists.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                  No move-in checklists found. Click &quot;Start Move-In&quot; to create one.
                </td>
              </tr>
            ) : (
              checklists.map((checklist) => {
                const checked = getCheckedCount(checklist)
                const total = CHECKLIST_ITEMS.length
                const pct = Math.round((checked / total) * 100)

                return (
                  <tr key={checklist.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 text-sm font-medium">
                      <Link
                        href={`/admin/tenants/${checklist.tenant.id}`}
                        className="text-primary-600 hover:text-primary-800 hover:underline"
                      >
                        {checklist.tenant.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/admin/properties/${checklist.property.id}`}
                        className="text-primary-600 hover:text-primary-800 hover:underline"
                      >
                        {checklist.property.name}
                      </Link>
                      {checklist.lease.unit && (
                        <>
                          <br />
                          <span className="text-neutral-500">Unit {checklist.lease.unit}</span>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-neutral-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              pct === 100
                                ? 'bg-success-500'
                                : pct > 50
                                ? 'bg-primary-500'
                                : pct > 0
                                ? 'bg-warning-500'
                                : 'bg-neutral-300'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-neutral-600 text-xs font-medium">
                          {checked}/{total}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusBadgeVariant(checklist.status)}>
                        {formatStatus(checklist.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">
                      {formatDate(checklist.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        className="text-primary-600 hover:text-primary-800 hover:underline"
                        onClick={() => {
                          setSelectedChecklist(checklist)
                          setShowDetailModal(true)
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <CreateMoveInModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false)
          queryClient.invalidateQueries({ queryKey: ['move-in-checklists'] })
        }}
      />

      {/* Detail Modal */}
      {selectedChecklist && (
        <MoveInDetailModal
          open={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedChecklist(null)
          }}
          checklist={selectedChecklist}
          onUpdate={(updated) => {
            setSelectedChecklist(updated)
            queryClient.invalidateQueries({ queryKey: ['move-in-checklists'] })
          }}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Create Move-In Modal
// ---------------------------------------------------------------------------

function CreateMoveInModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [selectedLeaseId, setSelectedLeaseId] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const { data: leases } = useQuery({
    queryKey: ['leases-for-move-in'],
    queryFn: fetchLeases,
    enabled: open,
  })

  const activeLeases = leases?.filter((l) => l.status === 'ACTIVE' || l.status === 'PENDING') || []
  const selectedLease = activeLeases.find((l) => l.id === selectedLeaseId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!selectedLease) {
      setFormError('Please select a lease')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/move-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaseId: selectedLease.id,
          tenantId: selectedLease.tenantId,
          propertyId: selectedLease.propertyId,
          unitId: selectedLease.unitId || null,
          notes: notes || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setFormError(data.error || 'Failed to create checklist')
        setSubmitting(false)
        return
      }

      setSelectedLeaseId('')
      setNotes('')
      onSuccess()
    } catch {
      setFormError('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} className="max-w-xl">
      <ModalHeader>
        <h2 className="text-xl font-semibold text-neutral-900">Start Move-In</h2>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
          &#x2715;
        </button>
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          {formError && (
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-3 text-sm text-danger-700">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Select Lease
            </label>
            <select
              value={selectedLeaseId}
              onChange={(e) => setSelectedLeaseId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select a lease...</option>
              {activeLeases.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.tenant.name} - {l.property.name}
                  {l.unit ? ` (Unit ${l.unit})` : ''}
                </option>
              ))}
            </select>
          </div>

          {selectedLease && (
            <div className="bg-neutral-50 rounded-lg p-4 space-y-1 text-sm">
              <p className="text-neutral-600">
                Tenant:{' '}
                <span className="font-medium text-neutral-900">{selectedLease.tenant.name}</span>
              </p>
              <p className="text-neutral-600">
                Property:{' '}
                <span className="font-medium text-neutral-900">{selectedLease.property.name}</span>
              </p>
              {selectedLease.unit && (
                <p className="text-neutral-600">
                  Unit:{' '}
                  <span className="font-medium text-neutral-900">{selectedLease.unit}</span>
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any initial notes about this move-in..."
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Start Move-In'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

// ---------------------------------------------------------------------------
// Move-In Detail Modal (visual checklist)
// ---------------------------------------------------------------------------

function MoveInDetailModal({
  open,
  onClose,
  checklist,
  onUpdate,
}: {
  open: boolean
  onClose: () => void
  checklist: MoveInChecklist
  onUpdate: (updated: MoveInChecklist) => void
}) {
  const [updating, setUpdating] = useState<string | null>(null)
  const [electricityReading, setElectricityReading] = useState(
    checklist.electricityMeterReading || ''
  )
  const [waterReading, setWaterReading] = useState(checklist.waterMeterReading || '')
  const [notes, setNotes] = useState(checklist.notes || '')
  const [savingNotes, setSavingNotes] = useState(false)
  const [savingMeters, setSavingMeters] = useState(false)
  const [actionError, setActionError] = useState('')

  const checked = getCheckedCount(checklist)
  const total = CHECKLIST_ITEMS.length
  const pct = Math.round((checked / total) * 100)

  const keysBlocked =
    !checklist.agreementSigned || !checklist.depositCleared || !checklist.firstMonthCleared

  const toggleItem = async (key: ChecklistKey) => {
    if (key === 'keysHandedOver' && keysBlocked && !checklist.keysHandedOver) {
      setActionError(
        'Cannot hand over keys until agreement is signed, deposit is cleared, and first month rent is cleared.'
      )
      return
    }

    setActionError('')
    setUpdating(key)
    try {
      const res = await fetch(`/api/move-in/${checklist.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [key]: !checklist[key as keyof MoveInChecklist],
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setActionError(data.error || 'Failed to update')
        return
      }

      const updated = await res.json()
      onUpdate(updated)
    } catch {
      setActionError('Something went wrong')
    } finally {
      setUpdating(null)
    }
  }

  const saveMeters = async () => {
    setSavingMeters(true)
    setActionError('')
    try {
      const res = await fetch(`/api/move-in/${checklist.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          electricityMeterReading: electricityReading || null,
          waterMeterReading: waterReading || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setActionError(data.error || 'Failed to save meter readings')
        return
      }

      const updated = await res.json()
      onUpdate(updated)
    } catch {
      setActionError('Something went wrong')
    } finally {
      setSavingMeters(false)
    }
  }

  const saveNotes = async () => {
    setSavingNotes(true)
    setActionError('')
    try {
      const res = await fetch(`/api/move-in/${checklist.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notes || null }),
      })

      if (!res.ok) {
        const data = await res.json()
        setActionError(data.error || 'Failed to save notes')
        return
      }

      const updated = await res.json()
      onUpdate(updated)
    } catch {
      setActionError('Something went wrong')
    } finally {
      setSavingNotes(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} className="max-w-2xl">
      <ModalHeader>
        <h2 className="text-xl font-semibold text-neutral-900">Move-In Checklist</h2>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
          &#x2715;
        </button>
      </ModalHeader>
      <ModalBody className="space-y-5">
        {actionError && (
          <div className="bg-danger-50 border border-danger-200 rounded-lg p-3 text-sm text-danger-700">
            {actionError}
          </div>
        )}

        {/* Tenant & Property Info */}
        <div className="bg-neutral-50 rounded-lg p-4 space-y-1 text-sm">
          <p className="text-neutral-600">
            Tenant:{' '}
            <span className="font-medium text-neutral-900">{checklist.tenant.name}</span>
          </p>
          <p className="text-neutral-600">
            Property:{' '}
            <span className="font-medium text-neutral-900">
              {checklist.property.name}
              {checklist.lease.unit ? ` - Unit ${checklist.lease.unit}` : ''}
            </span>
          </p>
          <p className="text-neutral-600">
            Status:{' '}
            <Badge variant={statusBadgeVariant(checklist.status)}>
              {formatStatus(checklist.status)}
            </Badge>
          </p>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-neutral-700">Progress</span>
            <span className="text-sm font-medium text-neutral-700">
              {checked}/{total} ({pct}%)
            </span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                pct === 100
                  ? 'bg-success-500'
                  : pct > 50
                  ? 'bg-primary-500'
                  : pct > 0
                  ? 'bg-warning-500'
                  : 'bg-neutral-300'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Checklist Items */}
        <div className="space-y-1">
          {CHECKLIST_ITEMS.map((item) => {
            const isChecked = checklist[item.key as keyof MoveInChecklist] as boolean
            const isKeysItem = item.key === 'keysHandedOver'
            const isDisabled = isKeysItem && keysBlocked && !isChecked

            return (
              <div
                key={item.key}
                className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
                  isChecked
                    ? 'bg-success-50 border-success-200'
                    : isDisabled
                    ? 'bg-neutral-100 border-neutral-200 opacity-70'
                    : 'bg-surface border-border hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleItem(item.key)}
                    disabled={updating === item.key || checklist.status === 'CANCELLED'}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition ${
                      isChecked
                        ? 'bg-success-500 border-success-500 text-white'
                        : isDisabled
                        ? 'border-neutral-300 cursor-not-allowed'
                        : 'border-neutral-400 hover:border-primary-500 cursor-pointer'
                    }`}
                  >
                    {updating === item.key ? (
                      <svg
                        className="w-3 h-3 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    ) : isChecked ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : null}
                  </button>
                  <span
                    className={`text-sm font-medium ${
                      isChecked ? 'text-success-800' : 'text-neutral-700'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                <span className="text-lg">{isChecked ? '\u2713' : '\u2717'}</span>
              </div>
            )
          })}

          {/* Tooltip for keys blocked */}
          {keysBlocked && (
            <p className="text-xs text-warning-600 bg-warning-50 border border-warning-200 rounded-lg px-4 py-2">
              Keys cannot be handed over until the agreement is signed, deposit is cleared, and
              first month rent is cleared.
            </p>
          )}
        </div>

        {/* Meter Readings */}
        <div className="border border-border rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-neutral-700">Meter Readings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Electricity Meter
              </label>
              <input
                type="text"
                value={electricityReading}
                onChange={(e) => setElectricityReading(e.target.value)}
                placeholder="e.g. 12345"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Water Meter
              </label>
              <input
                type="text"
                value={waterReading}
                onChange={(e) => setWaterReading(e.target.value)}
                placeholder="e.g. 67890"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={saveMeters}
            disabled={savingMeters}
          >
            {savingMeters ? 'Saving...' : 'Save Meter Readings'}
          </Button>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-700">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Additional observations or notes..."
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={saveNotes}
            disabled={savingNotes}
          >
            {savingNotes ? 'Saving...' : 'Save Notes'}
          </Button>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  )
}
