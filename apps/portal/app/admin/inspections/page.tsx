'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { EmptyState } from '@/components/ui/empty-state'

// Types
interface Inspection {
  id: string
  propertyId: string
  unitId: string | null
  tenantId: string | null
  leaseId: string | null
  type: string
  scheduledDate: string
  completedDate: string | null
  inspector: string | null
  overallCondition: string | null
  summary: string | null
  rooms: RoomAssessment[] | null
  followUpRequired: boolean
  maintenanceItems: MaintenanceItem[] | null
  violations: Violation[] | null
  status: string
  property: { id: string; name: string; address: string }
  unit: { id: string; unitNumber: string } | null
  tenant: { id: string; name: string; email: string; phone: string } | null
  lease: { id: string; startDate: string; endDate: string; status: string } | null
}

interface RoomAssessment {
  room: string
  condition: string
  notes: string
  photos: string[]
}

interface MaintenanceItem {
  description: string
  priority: string
  room: string
}

interface Violation {
  type: string
  description: string
  severity: string
}

interface PropertyOption {
  id: string
  name: string
  address: string
}

interface UnitOption {
  id: string
  unitNumber: string
}

interface TenantOption {
  id: string
  name: string
}

const INSPECTION_TYPES = [
  { value: 'MOVE_IN', label: 'Move-In' },
  { value: 'THREE_MONTH', label: '3-Month' },
  { value: 'ROUTINE_6_MONTH', label: 'Routine (6-Month)' },
  { value: 'PRE_MOVE_OUT', label: 'Pre Move-Out' },
  { value: 'MOVE_OUT', label: 'Move-Out' },
  { value: 'ANNUAL', label: 'Annual' },
]

const INSPECTION_STATUSES = [
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const CONDITIONS = [
  { value: 'EXCELLENT', label: 'Excellent' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' },
]

const PREDEFINED_ROOMS = [
  'Living Room',
  'Kitchen',
  'Bedroom 1',
  'Bedroom 2',
  'Bedroom 3',
  'Bathroom 1',
  'Bathroom 2',
  'Balcony/Patio',
  'Exterior',
]

const VIOLATION_TYPES = [
  'Unauthorized Pets',
  'Subletting',
  'Property Damage',
  'Noise Violation',
  'Lease Violation',
  'Health/Safety Hazard',
  'Other',
]

function formatType(type: string): string {
  const t = INSPECTION_TYPES.find((t) => t.value === type)
  return t ? t.label : type.replace(/_/g, ' ')
}

function statusBadgeVariant(status: string): 'primary' | 'warning' | 'success' | 'neutral' | 'danger' {
  switch (status) {
    case 'SCHEDULED': return 'primary'
    case 'IN_PROGRESS': return 'warning'
    case 'COMPLETED': return 'success'
    case 'CANCELLED': return 'neutral'
    default: return 'neutral'
  }
}

function conditionBadgeVariant(condition: string): 'success' | 'primary' | 'warning' | 'danger' | 'neutral' {
  switch (condition) {
    case 'EXCELLENT': return 'success'
    case 'GOOD': return 'primary'
    case 'FAIR': return 'warning'
    case 'POOR': return 'danger'
    default: return 'neutral'
  }
}

function calculateOverallCondition(rooms: RoomAssessment[]): string {
  if (rooms.length === 0) return 'GOOD'
  const conditionScores: Record<string, number> = {
    EXCELLENT: 4,
    GOOD: 3,
    FAIR: 2,
    POOR: 1,
  }
  const avg = rooms.reduce((sum, r) => sum + (conditionScores[r.condition] || 3), 0) / rooms.length
  if (avg >= 3.5) return 'EXCELLENT'
  if (avg >= 2.5) return 'GOOD'
  if (avg >= 1.5) return 'FAIR'
  return 'POOR'
}

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // Schedule modal
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({
    propertyId: '',
    unitId: '',
    tenantId: '',
    type: 'ROUTINE_6_MONTH',
    scheduledDate: '',
    inspector: '',
  })
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [scheduleError, setScheduleError] = useState('')

  // Inspection detail / form modal
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null)
  const [roomAssessments, setRoomAssessments] = useState<RoomAssessment[]>([])
  const [violations, setViolations] = useState<Violation[]>([])
  const [inspectionSummary, setInspectionSummary] = useState('')
  const [completeLoading, setCompleteLoading] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)

  // Dropdown data
  const [properties, setProperties] = useState<PropertyOption[]>([])
  const [units, setUnits] = useState<UnitOption[]>([])
  const [tenants, setTenants] = useState<TenantOption[]>([])

  const fetchInspections = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterType !== 'all') params.set('type', filterType)
      if (filterStatus !== 'all') params.set('status', filterStatus)
      params.set('limit', '200')
      const res = await fetch(`/api/inspections?${params}`)
      const data = await res.json()
      setInspections(data.inspections || [])
    } catch {
      setInspections([])
    } finally {
      setLoading(false)
    }
  }, [filterType, filterStatus])

  useEffect(() => {
    fetchInspections()
  }, [fetchInspections])

  useEffect(() => {
    // Fetch dropdown data
    fetch('/api/properties?limit=500')
      .then((r) => r.json())
      .then((d) => setProperties(d.properties || []))
      .catch(() => {})
    fetch('/api/tenants?limit=500')
      .then((r) => r.json())
      .then((d) => setTenants(d.tenants || []))
      .catch(() => {})
  }, [])

  // Fetch units when property changes in schedule form
  useEffect(() => {
    if (scheduleForm.propertyId) {
      fetch(`/api/properties/${scheduleForm.propertyId}`)
        .then((r) => r.json())
        .then((d) => setUnits(d.propertyUnits || []))
        .catch(() => setUnits([]))
    } else {
      setUnits([])
    }
  }, [scheduleForm.propertyId])

  // Stats
  const now = new Date()
  const stats = {
    scheduled: inspections.filter((i) => i.status === 'SCHEDULED').length,
    inProgress: inspections.filter((i) => i.status === 'IN_PROGRESS').length,
    completed: inspections.filter((i) => i.status === 'COMPLETED').length,
    overdue: inspections.filter(
      (i) =>
        (i.status === 'SCHEDULED' || i.status === 'IN_PROGRESS') &&
        new Date(i.scheduledDate) < now
    ).length,
  }

  // Schedule Inspection
  async function handleSchedule() {
    setScheduleError('')
    if (!scheduleForm.propertyId || !scheduleForm.type || !scheduleForm.scheduledDate) {
      setScheduleError('Property, type, and scheduled date are required.')
      return
    }
    setScheduleLoading(true)
    try {
      const res = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: scheduleForm.propertyId,
          unitId: scheduleForm.unitId || null,
          tenantId: scheduleForm.tenantId || null,
          type: scheduleForm.type,
          scheduledDate: scheduleForm.scheduledDate,
          inspector: scheduleForm.inspector || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        setScheduleError(err.error || 'Failed to schedule inspection')
        return
      }
      setShowScheduleModal(false)
      setScheduleForm({
        propertyId: '',
        unitId: '',
        tenantId: '',
        type: 'ROUTINE_6_MONTH',
        scheduledDate: '',
        inspector: '',
      })
      fetchInspections()
    } catch {
      setScheduleError('Network error')
    } finally {
      setScheduleLoading(false)
    }
  }

  // Open inspection detail
  function openDetail(inspection: Inspection) {
    setSelectedInspection(inspection)
    // Init room assessments
    if (inspection.rooms && Array.isArray(inspection.rooms) && inspection.rooms.length > 0) {
      setRoomAssessments(inspection.rooms)
    } else {
      setRoomAssessments(
        PREDEFINED_ROOMS.map((room) => ({
          room,
          condition: 'GOOD',
          notes: '',
          photos: [],
        }))
      )
    }
    setViolations(
      inspection.violations && Array.isArray(inspection.violations) ? inspection.violations : []
    )
    setInspectionSummary(inspection.summary || '')
    setShowDetailModal(true)
    setShowCompleteConfirm(false)
  }

  // Update room assessment
  function updateRoom(index: number, field: string, value: string) {
    setRoomAssessments((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  // Add violation
  function addViolation() {
    setViolations((prev) => [
      ...prev,
      { type: 'Other', description: '', severity: 'LOW' },
    ])
  }

  function updateViolation(index: number, field: string, value: string) {
    setViolations((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  function removeViolation(index: number) {
    setViolations((prev) => prev.filter((_, i) => i !== index))
  }

  // Save progress (PATCH)
  async function saveProgress() {
    if (!selectedInspection) return
    try {
      await fetch(`/api/inspections/${selectedInspection.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rooms: roomAssessments,
          violations: violations.length > 0 ? violations : null,
          summary: inspectionSummary || null,
          status: 'IN_PROGRESS',
        }),
      })
      fetchInspections()
    } catch {
      // silent
    }
  }

  // Complete inspection
  async function handleComplete() {
    if (!selectedInspection) return

    // Validate: rooms with FAIR/POOR must have notes
    const roomsNeedingNotes = roomAssessments.filter(
      (r) => (r.condition === 'FAIR' || r.condition === 'POOR') && !r.notes.trim()
    )
    if (roomsNeedingNotes.length > 0) {
      alert(
        `Please add notes for rooms in Fair/Poor condition: ${roomsNeedingNotes.map((r) => r.room).join(', ')}`
      )
      setShowCompleteConfirm(false)
      return
    }

    setCompleteLoading(true)
    const overallCondition = calculateOverallCondition(roomAssessments)

    // Extract maintenance items from Fair/Poor rooms
    const maintenanceItems = roomAssessments
      .filter((r) => (r.condition === 'FAIR' || r.condition === 'POOR') && r.notes.trim())
      .map((r) => ({
        description: r.notes,
        priority: r.condition === 'POOR' ? 'HIGH' : 'MEDIUM',
        room: r.room,
      }))

    try {
      const res = await fetch(`/api/inspections/${selectedInspection.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overallCondition,
          summary: inspectionSummary || null,
          rooms: roomAssessments,
          maintenanceItems: maintenanceItems.length > 0 ? maintenanceItems : null,
          violations: violations.length > 0 ? violations : null,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to complete inspection')
        return
      }
      setShowDetailModal(false)
      setShowCompleteConfirm(false)
      fetchInspections()
    } catch {
      alert('Network error')
    } finally {
      setCompleteLoading(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-neutral-900">Property Inspections</h1>
          <p className="text-neutral-600 mt-1">
            Schedule and track property inspection activities
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowScheduleModal(true)}>
          + Schedule Inspection
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white shadow rounded-lg p-4 md:p-6 border border-neutral-200">
          <p className="text-sm text-neutral-600">Scheduled</p>
          <p className="text-3xl font-bold text-primary-600">{stats.scheduled}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 md:p-6 border border-neutral-200">
          <p className="text-sm text-neutral-600">In Progress</p>
          <p className="text-3xl font-bold text-warning-600">{stats.inProgress}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 md:p-6 border border-neutral-200">
          <p className="text-sm text-neutral-600">Completed</p>
          <p className="text-3xl font-bold text-success-600">{stats.completed}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 md:p-6 border border-neutral-200">
          <p className="text-sm text-neutral-600">Overdue</p>
          <p className="text-3xl font-bold text-danger-600">{stats.overdue}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 border border-neutral-200 flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4 flex-wrap">
        <Select
          label="Type"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          options={[{ value: 'all', label: 'All Types' }, ...INSPECTION_TYPES]}
        />
        <Select
          label="Status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          options={[{ value: 'all', label: 'All Statuses' }, ...INSPECTION_STATUSES]}
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden overflow-x-auto border border-neutral-200">
        {loading ? (
          <div className="p-12 text-center text-neutral-500">Loading inspections...</div>
        ) : inspections.length === 0 ? (
          <EmptyState
            title="No inspections found"
            description="Schedule your first property inspection to get started."
            action={
              <Button variant="primary" onClick={() => setShowScheduleModal(true)}>
                Schedule Inspection
              </Button>
            }
          />
        ) : (
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  Property / Unit
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">
                  Tenant
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">
                  Type
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  Scheduled Date
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  Status
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">
                  Condition
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {inspections.map((inspection) => {
                const isOverdue =
                  (inspection.status === 'SCHEDULED' || inspection.status === 'IN_PROGRESS') &&
                  new Date(inspection.scheduledDate) < now
                return (
                  <tr key={inspection.id} className="hover:bg-neutral-50">
                    <td className="px-3 md:px-6 py-2 md:py-4">
                      <div className="text-sm font-medium text-neutral-900">
                        {inspection.property?.name}
                      </div>
                      {inspection.unit && (
                        <div className="text-sm text-neutral-500">
                          Unit {inspection.unit.unitNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4 text-sm text-neutral-900 hidden md:table-cell">
                      {inspection.tenant?.name || '--'}
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4 text-sm text-neutral-900 hidden md:table-cell">
                      {formatType(inspection.type)}
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4 text-sm text-neutral-900">
                      <span className={isOverdue ? 'text-danger-600 font-semibold' : ''}>
                        {new Date(inspection.scheduledDate).toLocaleDateString()}
                      </span>
                      {isOverdue && (
                        <Badge variant="danger" size="sm" className="ml-2">
                          Overdue
                        </Badge>
                      )}
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4">
                      <Badge variant={statusBadgeVariant(inspection.status)}>
                        {inspection.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4 hidden md:table-cell">
                      {inspection.overallCondition ? (
                        <Badge variant={conditionBadgeVariant(inspection.overallCondition)}>
                          {inspection.overallCondition}
                        </Badge>
                      ) : (
                        <span className="text-sm text-neutral-400">--</span>
                      )}
                      {inspection.followUpRequired && (
                        <Badge variant="danger" size="sm" className="ml-1">
                          Follow-up
                        </Badge>
                      )}
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4 text-sm space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => openDetail(inspection)}>
                        {inspection.status === 'COMPLETED' ? 'View' : 'Open'}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Schedule Modal */}
      <Modal
        open={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        className="max-w-lg"
      >
        <ModalHeader>
          <h2 className="text-lg font-semibold text-neutral-900">Schedule Inspection</h2>
          <button
            onClick={() => setShowScheduleModal(false)}
            className="text-neutral-400 hover:text-neutral-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </ModalHeader>
        <ModalBody className="space-y-4">
          {scheduleError && (
            <div className="p-3 bg-danger-50 border border-danger-200 rounded-md text-danger-700 text-sm">
              {scheduleError}
            </div>
          )}
          <Select
            label="Property *"
            value={scheduleForm.propertyId}
            onChange={(e) =>
              setScheduleForm((f) => ({ ...f, propertyId: e.target.value, unitId: '' }))
            }
            placeholder="Select a property"
            options={properties.map((p) => ({ value: p.id, label: p.name }))}
          />
          {units.length > 0 && (
            <Select
              label="Unit"
              value={scheduleForm.unitId}
              onChange={(e) => setScheduleForm((f) => ({ ...f, unitId: e.target.value }))}
              placeholder="Select a unit (optional)"
              options={[
                { value: '', label: 'No specific unit' },
                ...units.map((u) => ({ value: u.id, label: u.unitNumber })),
              ]}
            />
          )}
          <Select
            label="Tenant"
            value={scheduleForm.tenantId}
            onChange={(e) => setScheduleForm((f) => ({ ...f, tenantId: e.target.value }))}
            placeholder="Select a tenant (optional)"
            options={[
              { value: '', label: 'No specific tenant' },
              ...tenants.map((t) => ({ value: t.id, label: t.name })),
            ]}
          />
          <Select
            label="Inspection Type *"
            value={scheduleForm.type}
            onChange={(e) => setScheduleForm((f) => ({ ...f, type: e.target.value }))}
            options={INSPECTION_TYPES}
          />
          <Input
            label="Scheduled Date *"
            type="datetime-local"
            value={scheduleForm.scheduledDate}
            onChange={(e) => setScheduleForm((f) => ({ ...f, scheduledDate: e.target.value }))}
          />
          <Input
            label="Inspector"
            placeholder="Agent name"
            value={scheduleForm.inspector}
            onChange={(e) => setScheduleForm((f) => ({ ...f, inspector: e.target.value }))}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSchedule} disabled={scheduleLoading}>
            {scheduleLoading ? 'Scheduling...' : 'Schedule'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Inspection Detail / Form Modal */}
      <Modal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        className="max-w-4xl"
      >
        {selectedInspection && (
          <>
            <ModalHeader>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">
                  {selectedInspection.status === 'COMPLETED'
                    ? 'Inspection Report'
                    : 'Inspection Form'}
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  {selectedInspection.property?.name}
                  {selectedInspection.unit
                    ? ` - Unit ${selectedInspection.unit.unitNumber}`
                    : ''}
                  {' | '}
                  {formatType(selectedInspection.type)}
                  {' | '}
                  {new Date(selectedInspection.scheduledDate).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </ModalHeader>
            <ModalBody className="space-y-6">
              {/* Info bar */}
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant={statusBadgeVariant(selectedInspection.status)}>
                  {selectedInspection.status.replace('_', ' ')}
                </Badge>
                {selectedInspection.inspector && (
                  <span className="text-sm text-neutral-600">
                    Inspector: <strong>{selectedInspection.inspector}</strong>
                  </span>
                )}
                {selectedInspection.tenant && (
                  <span className="text-sm text-neutral-600">
                    Tenant: <strong>{selectedInspection.tenant.name}</strong>
                  </span>
                )}
                {selectedInspection.overallCondition && (
                  <Badge variant={conditionBadgeVariant(selectedInspection.overallCondition)}>
                    Overall: {selectedInspection.overallCondition}
                  </Badge>
                )}
                {selectedInspection.followUpRequired && (
                  <Badge variant="danger">Follow-up Required</Badge>
                )}
              </div>

              {/* Room-by-Room Assessment */}
              <div>
                <h3 className="text-md font-semibold text-neutral-900 mb-3">
                  Room-by-Room Assessment
                </h3>
                <div className="space-y-3">
                  {roomAssessments.map((room, idx) => (
                    <div
                      key={room.room}
                      className="border border-neutral-200 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-sm font-medium text-neutral-900 min-w-[120px]">
                          {room.room}
                        </span>
                        {selectedInspection.status === 'COMPLETED' ? (
                          <Badge variant={conditionBadgeVariant(room.condition)}>
                            {room.condition}
                          </Badge>
                        ) : (
                          <Select
                            value={room.condition}
                            onChange={(e) => updateRoom(idx, 'condition', e.target.value)}
                            options={CONDITIONS}
                            className="w-36"
                          />
                        )}
                      </div>
                      {selectedInspection.status === 'COMPLETED' ? (
                        room.notes && (
                          <p className="text-sm text-neutral-600 mt-1">{room.notes}</p>
                        )
                      ) : (
                        <Textarea
                          placeholder={
                            room.condition === 'FAIR' || room.condition === 'POOR'
                              ? 'Notes required for Fair/Poor condition...'
                              : 'Optional notes...'
                          }
                          value={room.notes}
                          onChange={(e) => updateRoom(idx, 'notes', e.target.value)}
                          className="mt-1"
                        />
                      )}
                      {(room.condition === 'FAIR' || room.condition === 'POOR') &&
                        !room.notes.trim() &&
                        selectedInspection.status !== 'COMPLETED' && (
                          <p className="text-xs text-danger-600 mt-1">
                            Notes are mandatory for Fair/Poor condition.
                          </p>
                        )}
                    </div>
                  ))}
                </div>
                {selectedInspection.status !== 'COMPLETED' && (
                  <div className="mt-3 p-3 bg-neutral-50 rounded-lg">
                    <span className="text-sm text-neutral-600">
                      Auto-calculated overall condition:{' '}
                      <Badge
                        variant={conditionBadgeVariant(
                          calculateOverallCondition(roomAssessments)
                        )}
                      >
                        {calculateOverallCondition(roomAssessments)}
                      </Badge>
                    </span>
                  </div>
                )}
              </div>

              {/* Maintenance Items (auto-extracted, shown in completed view) */}
              {selectedInspection.status === 'COMPLETED' &&
                selectedInspection.maintenanceItems &&
                Array.isArray(selectedInspection.maintenanceItems) &&
                selectedInspection.maintenanceItems.length > 0 && (
                  <div>
                    <h3 className="text-md font-semibold text-neutral-900 mb-3">
                      Maintenance Items Flagged
                    </h3>
                    <div className="space-y-2">
                      {selectedInspection.maintenanceItems.map(
                        (item: MaintenanceItem, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg"
                          >
                            <Badge
                              variant={
                                item.priority === 'HIGH' || item.priority === 'URGENT'
                                  ? 'danger'
                                  : item.priority === 'MEDIUM'
                                    ? 'warning'
                                    : 'neutral'
                              }
                              size="sm"
                            >
                              {item.priority}
                            </Badge>
                            <span className="text-sm text-neutral-500">{item.room}</span>
                            <span className="text-sm text-neutral-900">{item.description}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Violations */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-md font-semibold text-neutral-900">
                    Lease Violations
                  </h3>
                  {selectedInspection.status !== 'COMPLETED' && (
                    <Button variant="outline" size="sm" onClick={addViolation}>
                      + Add Violation
                    </Button>
                  )}
                </div>
                {violations.length === 0 ? (
                  <p className="text-sm text-neutral-500">No violations recorded.</p>
                ) : (
                  <div className="space-y-3">
                    {violations.map((v, idx) => (
                      <div
                        key={idx}
                        className="border border-neutral-200 rounded-lg p-3 space-y-2"
                      >
                        {selectedInspection.status === 'COMPLETED' ? (
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={
                                v.severity === 'HIGH'
                                  ? 'danger'
                                  : v.severity === 'MEDIUM'
                                    ? 'warning'
                                    : 'neutral'
                              }
                              size="sm"
                            >
                              {v.severity}
                            </Badge>
                            <span className="text-sm font-medium">{v.type}</span>
                            <span className="text-sm text-neutral-600">{v.description}</span>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3">
                              <Select
                                value={v.type}
                                onChange={(e) =>
                                  updateViolation(idx, 'type', e.target.value)
                                }
                                options={VIOLATION_TYPES.map((t) => ({
                                  value: t,
                                  label: t,
                                }))}
                                className="w-48"
                              />
                              <Select
                                value={v.severity}
                                onChange={(e) =>
                                  updateViolation(idx, 'severity', e.target.value)
                                }
                                options={[
                                  { value: 'LOW', label: 'Low' },
                                  { value: 'MEDIUM', label: 'Medium' },
                                  { value: 'HIGH', label: 'High' },
                                ]}
                                className="w-32"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeViolation(idx)}
                                className="text-danger-600"
                              >
                                Remove
                              </Button>
                            </div>
                            <Input
                              placeholder="Describe the violation..."
                              value={v.description}
                              onChange={(e) =>
                                updateViolation(idx, 'description', e.target.value)
                              }
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary */}
              <div>
                <h3 className="text-md font-semibold text-neutral-900 mb-2">Summary</h3>
                {selectedInspection.status === 'COMPLETED' ? (
                  <p className="text-sm text-neutral-700">
                    {selectedInspection.summary || 'No summary provided.'}
                  </p>
                ) : (
                  <Textarea
                    placeholder="Overall inspection summary..."
                    value={inspectionSummary}
                    onChange={(e) => setInspectionSummary(e.target.value)}
                    rows={3}
                  />
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              {selectedInspection.status !== 'COMPLETED' &&
                selectedInspection.status !== 'CANCELLED' && (
                  <>
                    <Button variant="outline" onClick={saveProgress}>
                      Save Progress
                    </Button>
                    {!showCompleteConfirm ? (
                      <Button
                        variant="success"
                        onClick={() => setShowCompleteConfirm(true)}
                      >
                        Complete Inspection
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-600">Are you sure?</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCompleteConfirm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={handleComplete}
                          disabled={completeLoading}
                        >
                          {completeLoading ? 'Completing...' : 'Confirm Complete'}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>
    </div>
  )
}
