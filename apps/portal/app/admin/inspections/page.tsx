'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { EmptyState } from '@/components/ui/empty-state'
import {
  type ChecklistData,
  type ChecklistItem,
  CONDITION_CODES,
  ACTION_CODES,
  defaultChecklistData,
  rebuildItems,
} from '@/lib/inspection-checklists'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Inspection {
  id: string
  propertyId: string
  unitId: string | null
  tenantId: string | null
  leaseId: string | null
  type: string
  propertyCategory: string | null
  scheduledDate: string
  completedDate: string | null
  inspector: string | null
  overallCondition: string | null
  summary: string | null
  rooms: any
  followUpRequired: boolean
  maintenanceItems: any[] | null
  violations: any[] | null
  status: string
  property: { id: string; name: string; address: string }
  unit: { id: string; unitNumber: string } | null
  tenant: { id: string; name: string; email: string; phone: string } | null
  lease: { id: string; startDate: string; endDate: string; status: string } | null
}

interface PropertyOption { id: string; name: string; address: string }
interface UnitOption { id: string; unitNumber: string }
interface TenantOption { id: string; name: string }

// ── Constants ─────────────────────────────────────────────────────────────────

const INSPECTION_TYPES = [
  { value: 'MOVE_IN', label: 'Move-In' },
  { value: 'THREE_MONTH', label: '3-Month (New Tenancy)' },
  { value: 'ROUTINE_6_MONTH', label: '6-Month Routine' },
  { value: 'PRE_MOVE_OUT', label: 'Pre Move-Out (2+ wks before)' },
  { value: 'MOVE_OUT', label: 'Move-Out' },
  { value: 'ANNUAL', label: 'Annual Condition Report' },
]

const RESIDENTIAL_PREMISES_TYPES = ['Apartment', 'Maisonette', 'Bungalow', 'Townhouse', 'Other']
const COMMERCIAL_PREMISES_TYPES = ['Office', 'Retail', 'Warehouse / Industrial', 'Mixed Use', 'Other']

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatType(type: string) {
  return INSPECTION_TYPES.find(t => t.value === type)?.label || type.replace(/_/g, ' ')
}

function statusVariant(s: string): 'primary' | 'warning' | 'success' | 'neutral' | 'danger' {
  if (s === 'SCHEDULED') return 'primary'
  if (s === 'IN_PROGRESS') return 'warning'
  if (s === 'COMPLETED') return 'success'
  return 'neutral'
}

function condVariant(c: string): 'success' | 'primary' | 'warning' | 'danger' | 'neutral' {
  if (c === 'EXCELLENT') return 'success'
  if (c === 'GOOD') return 'primary'
  if (c === 'FAIR') return 'warning'
  if (c === 'POOR') return 'danger'
  return 'neutral'
}

function getUniqueSections(items: ChecklistItem[]) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const it of items) {
    if (!seen.has(it.section)) { seen.add(it.section); out.push(it.section) }
  }
  return out
}

// ── Checklist row ─────────────────────────────────────────────────────────────

function ChecklistRow({
  item, idx, onUpdate, readonly,
}: {
  item: ChecklistItem
  idx: number
  onUpdate: (idx: number, field: keyof ChecklistItem, value: string) => void
  readonly: boolean
}) {
  const condColor: Record<string, string> = {
    P: 'bg-red-50', D: 'bg-red-50', F: 'bg-yellow-50', M: 'bg-orange-50',
  }
  const rowBg = condColor[item.condition] || ''
  return (
    <tr className={`border-b border-neutral-100 ${rowBg}`}>
      <td className="px-3 py-1.5 text-xs text-neutral-800 min-w-[200px]">{item.item}</td>
      <td className="px-2 py-1.5 w-20">
        {readonly ? (
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold ${
            item.condition === 'G' || item.condition === 'N' ? 'bg-green-100 text-green-800' :
            item.condition === 'F' ? 'bg-yellow-100 text-yellow-800' :
            item.condition === 'P' || item.condition === 'D' ? 'bg-red-100 text-red-800' :
            item.condition === 'M' ? 'bg-orange-100 text-orange-800' :
            'bg-neutral-100 text-neutral-600'
          }`}>{item.condition}</span>
        ) : (
          <select
            value={item.condition}
            onChange={e => onUpdate(idx, 'condition', e.target.value)}
            className="text-xs border border-neutral-300 rounded px-1 py-1 w-full bg-white focus:ring-1 focus:ring-primary-500"
          >
            {CONDITION_CODES.map(c => (
              <option key={c.value} value={c.value}>{c.value}</option>
            ))}
          </select>
        )}
      </td>
      <td className="px-2 py-1.5 w-20">
        {readonly ? (
          <span className="text-xs text-neutral-600">{item.action}</span>
        ) : (
          <select
            value={item.action}
            onChange={e => onUpdate(idx, 'action', e.target.value)}
            className="text-xs border border-neutral-300 rounded px-1 py-1 w-full bg-white focus:ring-1 focus:ring-primary-500"
          >
            {ACTION_CODES.map(c => (
              <option key={c.value} value={c.value}>{c.value}</option>
            ))}
          </select>
        )}
      </td>
      <td className="px-2 py-1.5">
        {readonly ? (
          <span className="text-xs text-neutral-600">{item.comments || '—'}</span>
        ) : (
          <input
            type="text"
            value={item.comments}
            onChange={e => onUpdate(idx, 'comments', e.target.value)}
            placeholder="Comments / Photo Ref."
            className="text-xs border border-neutral-200 rounded px-2 py-1 w-full focus:ring-1 focus:ring-primary-500 focus:border-transparent"
          />
        )}
      </td>
    </tr>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

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
    propertyCategory: 'RESIDENTIAL' as 'RESIDENTIAL' | 'COMMERCIAL',
  })
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [scheduleError, setScheduleError] = useState('')

  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null)
  const [checklistData, setChecklistData] = useState<ChecklistData | null>(null)
  // Legacy room state (for old non-checklist inspections)
  const [legacyRooms, setLegacyRooms] = useState<any[]>([])
  const [legacySummary, setLegacySummary] = useState('')
  const [legacyViolations, setLegacyViolations] = useState<any[]>([])
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
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
    } catch { setInspections([]) }
    finally { setLoading(false) }
  }, [filterType, filterStatus])

  useEffect(() => { fetchInspections() }, [fetchInspections])

  useEffect(() => {
    fetch('/api/properties?limit=500').then(r => r.json()).then(d => setProperties(d.properties || [])).catch(() => {})
    fetch('/api/tenants?limit=500').then(r => r.json()).then(d => setTenants(d.tenants || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (scheduleForm.propertyId) {
      fetch(`/api/properties/${scheduleForm.propertyId}`)
        .then(r => r.json()).then(d => setUnits(d.propertyUnits || [])).catch(() => setUnits([]))
    } else { setUnits([]) }
  }, [scheduleForm.propertyId])

  const now = new Date()
  const stats = {
    scheduled: inspections.filter(i => i.status === 'SCHEDULED').length,
    inProgress: inspections.filter(i => i.status === 'IN_PROGRESS').length,
    completed: inspections.filter(i => i.status === 'COMPLETED').length,
    overdue: inspections.filter(i =>
      (i.status === 'SCHEDULED' || i.status === 'IN_PROGRESS') && new Date(i.scheduledDate) < now
    ).length,
  }

  // ── Schedule ───────────────────────────────────────────────────────────────

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
          propertyCategory: scheduleForm.propertyCategory,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        setScheduleError(err.error || 'Failed to schedule inspection')
        return
      }
      setShowScheduleModal(false)
      setScheduleForm({ propertyId: '', unitId: '', tenantId: '', type: 'ROUTINE_6_MONTH', scheduledDate: '', inspector: '', propertyCategory: 'RESIDENTIAL' })
      fetchInspections()
    } catch { setScheduleError('Network error') }
    finally { setScheduleLoading(false) }
  }

  // ── Open detail ────────────────────────────────────────────────────────────

  function openDetail(inspection: Inspection) {
    setSelectedInspection(inspection)
    setShowCompleteConfirm(false)

    if (inspection.propertyCategory) {
      // Checklist-mode
      const stored = inspection.rooms
      if (stored && (stored as any)._v === 2) {
        setChecklistData(stored as ChecklistData)
        // Expand all sections for SCHEDULED/IN_PROGRESS
        if (inspection.status !== 'COMPLETED') {
          const sections = getUniqueSections((stored as ChecklistData).items)
          setExpandedSections(new Set(sections))
        } else {
          setExpandedSections(new Set())
        }
      } else {
        const data = defaultChecklistData(
          inspection.propertyCategory as 'RESIDENTIAL' | 'COMMERCIAL',
          2, 1
        )
        setChecklistData(data)
        setExpandedSections(new Set(getUniqueSections(data.items)))
      }
    } else {
      // Legacy mode
      setChecklistData(null)
      const rooms = Array.isArray(inspection.rooms) && inspection.rooms.length > 0
        ? inspection.rooms
        : ['Living Room', 'Kitchen', 'Bedroom 1', 'Bedroom 2', 'Bathroom 1', 'Balcony/Patio', 'Exterior'].map(room => ({
            room, condition: 'GOOD', notes: '', photos: [],
          }))
      setLegacyRooms(rooms)
      setLegacyViolations(Array.isArray(inspection.violations) ? inspection.violations : [])
      setLegacySummary(inspection.summary || '')
    }
    setShowDetailModal(true)
  }

  // ── Checklist updates ──────────────────────────────────────────────────────

  function updateItem(idx: number, field: keyof ChecklistItem, value: string) {
    setChecklistData(prev => {
      if (!prev) return prev
      const items = [...prev.items]
      items[idx] = { ...items[idx], [field]: value }
      return { ...prev, items }
    })
  }

  function updateMeta(field: string, value: any) {
    setChecklistData(prev => prev ? { ...prev, [field]: value } : prev)
  }

  function updateMeter(i: number, field: string, value: string) {
    setChecklistData(prev => {
      if (!prev) return prev
      const meters = [...prev.meters]
      meters[i] = { ...meters[i], [field]: value }
      return { ...prev, meters }
    })
  }

  function updateKey(i: number, field: string, value: string) {
    setChecklistData(prev => {
      if (!prev) return prev
      const keys = [...prev.keys]
      keys[i] = { ...keys[i], [field]: value }
      return { ...prev, keys }
    })
  }

  function updateDefect(i: number, field: string, value: string) {
    setChecklistData(prev => {
      if (!prev) return prev
      const defects = [...prev.defects]
      defects[i] = { ...defects[i], [field]: value }
      return { ...prev, defects }
    })
  }

  function addDefect() {
    setChecklistData(prev => prev
      ? { ...prev, defects: [...prev.defects, { item: '', responsibility: 'LANDLORD', deadline: '', notes: '' }] }
      : prev
    )
  }

  function removeDefect(i: number) {
    setChecklistData(prev => prev
      ? { ...prev, defects: prev.defects.filter((_, idx) => idx !== i) }
      : prev
    )
  }

  function toggleSection(section: string) {
    setExpandedSections(prev => {
      const next = new Set(prev)
      next.has(section) ? next.delete(section) : next.add(section)
      return next
    })
  }

  function handleBedroomChange(n: number) {
    setChecklistData(prev => {
      if (!prev) return prev
      const updated = { ...prev, numBedrooms: n }
      return rebuildItems(updated)
    })
  }

  function handleBathroomChange(n: number) {
    setChecklistData(prev => {
      if (!prev) return prev
      const updated = { ...prev, numBathrooms: n }
      return rebuildItems(updated)
    })
  }

  // ── Save progress ──────────────────────────────────────────────────────────

  async function saveProgress() {
    if (!selectedInspection) return
    try {
      const body: any = { status: 'IN_PROGRESS' }
      if (checklistData) {
        body.rooms = checklistData
      } else {
        body.rooms = legacyRooms
        body.violations = legacyViolations.length > 0 ? legacyViolations : null
        body.summary = legacySummary || null
      }
      await fetch(`/api/inspections/${selectedInspection.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      fetchInspections()
    } catch { /* silent */ }
  }

  // ── Complete ───────────────────────────────────────────────────────────────

  async function handleComplete() {
    if (!selectedInspection) return
    setCompleteLoading(true)

    try {
      let rooms: any = null
      let overallCondition = 'GOOD'
      let maintenanceItems: any[] = []
      let followUpRequired = false

      if (checklistData) {
        rooms = checklistData
        overallCondition = checklistData.overallCondition || 'GOOD'
        maintenanceItems = checklistData.defects
          .filter(d => d.item.trim())
          .map(d => ({
            description: d.item,
            priority: 'MEDIUM',
            room: '',
          }))
        followUpRequired = checklistData.items.some(it => it.condition === 'P' || it.condition === 'D')
      } else {
        // Legacy: validate Fair/Poor have notes
        const missing = legacyRooms.filter(r => (r.condition === 'FAIR' || r.condition === 'POOR') && !r.notes?.trim())
        if (missing.length > 0) {
          alert(`Add notes for Fair/Poor rooms: ${missing.map((r: any) => r.room).join(', ')}`)
          setShowCompleteConfirm(false)
          return
        }
        rooms = legacyRooms
        const scores: Record<string, number> = { EXCELLENT: 4, GOOD: 3, FAIR: 2, POOR: 1 }
        const avg = legacyRooms.reduce((s, r) => s + (scores[r.condition] || 3), 0) / (legacyRooms.length || 1)
        overallCondition = avg >= 3.5 ? 'EXCELLENT' : avg >= 2.5 ? 'GOOD' : avg >= 1.5 ? 'FAIR' : 'POOR'
        maintenanceItems = legacyRooms
          .filter(r => (r.condition === 'FAIR' || r.condition === 'POOR') && r.notes?.trim())
          .map(r => ({ description: r.notes, priority: r.condition === 'POOR' ? 'HIGH' : 'MEDIUM', room: r.room }))
        followUpRequired = legacyRooms.some(r => r.condition === 'POOR')
      }

      const res = await fetch(`/api/inspections/${selectedInspection.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overallCondition,
          summary: checklistData ? (checklistData.violationDetails || null) : (legacySummary || null),
          rooms,
          maintenanceItems: maintenanceItems.length > 0 ? maintenanceItems : null,
          followUpRequired,
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
    } catch { alert('Network error') }
    finally { setCompleteLoading(false) }
  }

  const isCompleted = selectedInspection?.status === 'COMPLETED'
  const isCancelled = selectedInspection?.status === 'CANCELLED'
  const isChecklist = !!(selectedInspection?.propertyCategory)

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-neutral-900">Property Inspections</h1>
          <p className="text-neutral-500 text-sm mt-1">SOP 006 — All inspections are digital-first. Photograph every room and defect.</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowScheduleModal(true)}>+ Schedule Inspection</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Scheduled', value: stats.scheduled, color: 'text-primary-600' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-yellow-600' },
          { label: 'Completed', value: stats.completed, color: 'text-success-600' },
          { label: 'Overdue', value: stats.overdue, color: 'text-danger-600' },
        ].map(s => (
          <div key={s.label} className="bg-white shadow rounded-lg p-4 md:p-6 border border-neutral-200">
            <p className="text-sm text-neutral-600">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 border border-neutral-200 flex flex-wrap gap-4">
        <Select label="Type" value={filterType} onChange={e => setFilterType(e.target.value)}
          options={[{ value: 'all', label: 'All Types' }, ...INSPECTION_TYPES]} />
        <Select label="Status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'SCHEDULED', label: 'Scheduled' },
            { value: 'IN_PROGRESS', label: 'In Progress' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'CANCELLED', label: 'Cancelled' },
          ]} />
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden overflow-x-auto border border-neutral-200">
        {loading ? (
          <div className="p-12 text-center text-neutral-500">Loading inspections...</div>
        ) : inspections.length === 0 ? (
          <EmptyState title="No inspections found" description="Schedule your first property inspection."
            action={<Button variant="primary" onClick={() => setShowScheduleModal(true)}>Schedule Inspection</Button>} />
        ) : (
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Property / Unit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Tenant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Scheduled</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Condition</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {inspections.map(inspection => {
                const overdue = (inspection.status === 'SCHEDULED' || inspection.status === 'IN_PROGRESS') && new Date(inspection.scheduledDate) < now
                return (
                  <tr key={inspection.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-neutral-900">{inspection.property?.name}</div>
                      {inspection.unit && <div className="text-xs text-neutral-500">Unit {inspection.unit.unitNumber}</div>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {inspection.propertyCategory ? (
                        <span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${
                          inspection.propertyCategory === 'RESIDENTIAL' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>{inspection.propertyCategory === 'RESIDENTIAL' ? '🏠 Residential' : '🏢 Commercial'}</span>
                      ) : <span className="text-xs text-neutral-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700 hidden md:table-cell">{inspection.tenant?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700 hidden md:table-cell">{formatType(inspection.type)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={overdue ? 'text-danger-600 font-semibold' : 'text-neutral-700'}>
                        {new Date(inspection.scheduledDate).toLocaleDateString()}
                      </span>
                      {overdue && <Badge variant="danger" size="sm" className="ml-1">Overdue</Badge>}
                    </td>
                    <td className="px-4 py-3"><Badge variant={statusVariant(inspection.status)}>{inspection.status.replace('_', ' ')}</Badge></td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {inspection.overallCondition
                        ? <Badge variant={condVariant(inspection.overallCondition)}>{inspection.overallCondition}</Badge>
                        : <span className="text-sm text-neutral-400">—</span>}
                      {inspection.followUpRequired && <Badge variant="danger" size="sm" className="ml-1">Follow-up</Badge>}
                    </td>
                    <td className="px-4 py-3">
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

      {/* ── Schedule Modal ──────────────────────────────────────────────────── */}
      <Modal open={showScheduleModal} onClose={() => setShowScheduleModal(false)} className="max-w-lg">
        <ModalHeader>
          <h2 className="text-lg font-semibold text-neutral-900">Schedule Inspection</h2>
          <button onClick={() => setShowScheduleModal(false)} className="text-neutral-400 hover:text-neutral-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </ModalHeader>
        <ModalBody className="space-y-4">
          {scheduleError && (
            <div className="p-3 bg-danger-50 border border-danger-200 rounded text-danger-700 text-sm">{scheduleError}</div>
          )}

          {/* Property Category Toggle */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Property Category <span className="text-danger-600">*</span></label>
            <div className="flex rounded-lg overflow-hidden border border-neutral-300">
              {(['RESIDENTIAL', 'COMMERCIAL'] as const).map(cat => (
                <button key={cat} type="button"
                  onClick={() => setScheduleForm(f => ({ ...f, propertyCategory: cat }))}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    scheduleForm.propertyCategory === cat
                      ? 'bg-[#1A3A5C] text-white'
                      : 'bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}>
                  {cat === 'RESIDENTIAL' ? '🏠 Residential' : '🏢 Commercial'}
                </button>
              ))}
            </div>
          </div>

          <Select label="Property *" value={scheduleForm.propertyId}
            onChange={e => setScheduleForm(f => ({ ...f, propertyId: e.target.value, unitId: '' }))}
            placeholder="Select a property"
            options={properties.map(p => ({ value: p.id, label: p.name }))} />

          {units.length > 0 && (
            <Select label="Unit" value={scheduleForm.unitId}
              onChange={e => setScheduleForm(f => ({ ...f, unitId: e.target.value }))}
              placeholder="Select a unit (optional)"
              options={[{ value: '', label: 'No specific unit' }, ...units.map(u => ({ value: u.id, label: u.unitNumber }))]} />
          )}

          <Select label="Tenant" value={scheduleForm.tenantId}
            onChange={e => setScheduleForm(f => ({ ...f, tenantId: e.target.value }))}
            placeholder="Select a tenant (optional)"
            options={[{ value: '', label: 'No specific tenant' }, ...tenants.map(t => ({ value: t.id, label: t.name }))]} />

          <Select label="Inspection Type *" value={scheduleForm.type}
            onChange={e => setScheduleForm(f => ({ ...f, type: e.target.value }))}
            options={INSPECTION_TYPES} />

          <Input label="Scheduled Date *" type="datetime-local" value={scheduleForm.scheduledDate}
            onChange={e => setScheduleForm(f => ({ ...f, scheduledDate: e.target.value }))} />

          <Input label="Inspector" placeholder="Agent name" value={scheduleForm.inspector}
            onChange={e => setScheduleForm(f => ({ ...f, inspector: e.target.value }))} />
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowScheduleModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSchedule} disabled={scheduleLoading}>
            {scheduleLoading ? 'Scheduling...' : 'Schedule'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── Detail / Form Modal ─────────────────────────────────────────────── */}
      <Modal open={showDetailModal} onClose={() => setShowDetailModal(false)} className="max-w-5xl">
        {selectedInspection && (
          <>
            <ModalHeader>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">
                  {isCompleted ? 'Inspection Report' : 'Inspection Form'}
                  {selectedInspection.propertyCategory && (
                    <span className={`ml-2 text-sm font-normal px-2 py-0.5 rounded-full ${
                      selectedInspection.propertyCategory === 'RESIDENTIAL' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {selectedInspection.propertyCategory === 'RESIDENTIAL' ? '🏠 Residential' : '🏢 Commercial'}
                    </span>
                  )}
                </h2>
                <p className="text-sm text-neutral-500 mt-0.5">
                  {selectedInspection.property?.name}
                  {selectedInspection.unit ? ` · Unit ${selectedInspection.unit.unitNumber}` : ''}
                  {' · '}{formatType(selectedInspection.type)}
                  {' · '}{new Date(selectedInspection.scheduledDate).toLocaleDateString()}
                  {selectedInspection.inspector ? ` · ${selectedInspection.inspector}` : ''}
                </p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </ModalHeader>

            <ModalBody className="space-y-0 p-0">
              {isChecklist && checklistData ? (
                <div className="divide-y divide-neutral-100">

                  {/* SOP notice */}
                  <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 text-xs text-amber-800">
                    <strong>SOP 006</strong> — Digital-first inspection. Photograph every room and every defect; add photo refs in Comments.
                    {checklistData.propertyCategory === 'COMMERCIAL' && <> · <strong>SOP 009</strong> — Commercial tenants must restore premises to original condition at lease end (dilapidations).</>}
                    {isCompleted && checklistData.propertyCategory === 'RESIDENTIAL' && <> · <strong>SOP 008</strong> — Move-out deductions require photos, comparison report, and invoices/quotes.</>}
                  </div>

                  {/* Inspection Header */}
                  <div className="px-6 py-4 bg-neutral-50 space-y-4">
                    <h3 className="text-sm font-semibold text-[#1A3A5C] uppercase tracking-wide">1. Inspection Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {/* Premises Type */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">Premises Type</label>
                        {isCompleted ? (
                          <span className="text-sm text-neutral-800">{checklistData.premisesType || '—'}</span>
                        ) : (
                          <select value={checklistData.premisesType} onChange={e => updateMeta('premisesType', e.target.value)}
                            className="text-sm border border-neutral-300 rounded px-2 py-1.5 w-full bg-white">
                            <option value="">— Select —</option>
                            {(checklistData.propertyCategory === 'RESIDENTIAL' ? RESIDENTIAL_PREMISES_TYPES : COMMERCIAL_PREMISES_TYPES).map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Residential: Furnished */}
                      {checklistData.propertyCategory === 'RESIDENTIAL' && (
                        <div>
                          <label className="block text-xs font-medium text-neutral-600 mb-1">Furnished</label>
                          {isCompleted ? (
                            <span className="text-sm text-neutral-800">{checklistData.furnished || '—'}</span>
                          ) : (
                            <select value={checklistData.furnished} onChange={e => updateMeta('furnished', e.target.value)}
                              className="text-sm border border-neutral-300 rounded px-2 py-1.5 w-full bg-white">
                              <option value="">— Select —</option>
                              {['Unfurnished', 'Semi-furnished', 'Fully furnished'].map(f => (
                                <option key={f} value={f}>{f}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      )}

                      {/* Commercial: Business Name */}
                      {checklistData.propertyCategory === 'COMMERCIAL' && (
                        <div>
                          <label className="block text-xs font-medium text-neutral-600 mb-1">Business Name & Trading Use</label>
                          {isCompleted ? (
                            <span className="text-sm text-neutral-800">{checklistData.businessName || '—'}</span>
                          ) : (
                            <input type="text" value={checklistData.businessName} onChange={e => updateMeta('businessName', e.target.value)}
                              placeholder="e.g. Acme Ltd — Retail"
                              className="text-sm border border-neutral-300 rounded px-2 py-1.5 w-full" />
                          )}
                        </div>
                      )}

                      {/* Commercial: Floor Area */}
                      {checklistData.propertyCategory === 'COMMERCIAL' && (
                        <div>
                          <label className="block text-xs font-medium text-neutral-600 mb-1">Floor / Unit Area (sq ft / m²)</label>
                          {isCompleted ? (
                            <span className="text-sm text-neutral-800">{checklistData.floorArea || '—'}</span>
                          ) : (
                            <input type="text" value={checklistData.floorArea} onChange={e => updateMeta('floorArea', e.target.value)}
                              placeholder="e.g. 1,200 sq ft"
                              className="text-sm border border-neutral-300 rounded px-2 py-1.5 w-full" />
                          )}
                        </div>
                      )}

                      {/* Tenant Present */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">Tenant Present?</label>
                        {isCompleted ? (
                          <span className="text-sm text-neutral-800">{checklistData.tenantPresent ? 'Yes' : `No — notice given ${checklistData.noticeDate || ''}`}</span>
                        ) : (
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1 text-sm cursor-pointer">
                              <input type="radio" checked={checklistData.tenantPresent} onChange={() => updateMeta('tenantPresent', true)} />Yes
                            </label>
                            <label className="flex items-center gap-1 text-sm cursor-pointer">
                              <input type="radio" checked={!checklistData.tenantPresent} onChange={() => updateMeta('tenantPresent', false)} />No
                            </label>
                            {!checklistData.tenantPresent && (
                              <input type="date" value={checklistData.noticeDate} onChange={e => updateMeta('noticeDate', e.target.value)}
                                className="text-xs border border-neutral-300 rounded px-2 py-1 flex-1" placeholder="Notice date" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Residential: Bedrooms & Bathrooms */}
                      {checklistData.propertyCategory === 'RESIDENTIAL' && !isCompleted && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-neutral-600 mb-1">No. of Bedrooms</label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4].map(n => (
                                <button key={n} type="button" onClick={() => handleBedroomChange(n)}
                                  className={`px-2 py-1 text-xs rounded border ${checklistData.numBedrooms === n ? 'bg-[#1A3A5C] text-white border-[#1A3A5C]' : 'border-neutral-300 text-neutral-600 hover:border-primary-400'}`}>
                                  {n}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-neutral-600 mb-1">No. of Bathrooms</label>
                            <div className="flex gap-1">
                              {[1, 2, 3].map(n => (
                                <button key={n} type="button" onClick={() => handleBathroomChange(n)}
                                  className={`px-2 py-1 text-xs rounded border ${checklistData.numBathrooms === n ? 'bg-[#1A3A5C] text-white border-[#1A3A5C]' : 'border-neutral-300 text-neutral-600 hover:border-primary-400'}`}>
                                  {n}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="px-6 py-2 bg-neutral-50 border-b border-neutral-200 flex flex-wrap gap-x-6 gap-y-1 text-xs text-neutral-500">
                    <span><strong>Condition:</strong> N=New · G=Good · F=Fair · P=Poor · D=Damaged · M=Missing · N/A=Not applicable</span>
                    <span><strong>Action:</strong> OK=No action · CL=Cleaning · RP=Repair · RC=Replace · TC=Tenant charge (evidence required)</span>
                  </div>

                  {/* Checklist Sections */}
                  {getUniqueSections(checklistData.items).map(section => {
                    const sectionItems = checklistData.items
                    const sectionItemsFiltered = sectionItems.map((item, globalIdx) => ({ item, globalIdx })).filter(({ item }) => item.section === section)
                    const isExpanded = expandedSections.has(section)
                    const hasIssue = sectionItemsFiltered.some(({ item }) => item.condition === 'P' || item.condition === 'D' || item.condition === 'F')

                    return (
                      <div key={section}>
                        <button type="button" onClick={() => toggleSection(section)}
                          className="w-full flex items-center justify-between px-6 py-2.5 bg-[#1A3A5C] text-white text-left hover:bg-[#142d47] transition-colors">
                          <span className="text-sm font-semibold">{section}</span>
                          <div className="flex items-center gap-2">
                            {hasIssue && !isCompleted && (
                              <span className="text-xs bg-[#E8960C] text-white px-2 py-0.5 rounded-full">Needs attention</span>
                            )}
                            <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="overflow-x-auto">
                            <table className="min-w-full">
                              <thead>
                                <tr className="bg-neutral-100 border-b border-neutral-200">
                                  <th className="px-3 py-1.5 text-left text-xs font-semibold text-neutral-600">Item</th>
                                  <th className="px-2 py-1.5 text-left text-xs font-semibold text-neutral-600 w-20">Cond.</th>
                                  <th className="px-2 py-1.5 text-left text-xs font-semibold text-neutral-600 w-20">Action</th>
                                  <th className="px-2 py-1.5 text-left text-xs font-semibold text-neutral-600">Comments / Photo Ref.</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sectionItemsFiltered.map(({ item, globalIdx }) => (
                                  <ChecklistRow key={`${section}-${item.item}`} item={item} idx={globalIdx}
                                    onUpdate={updateItem} readonly={isCompleted} />
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Utility Meters */}
                  <div>
                    <button type="button" onClick={() => toggleSection('_METERS_')}
                      className="w-full flex items-center justify-between px-6 py-2.5 bg-[#1A3A5C] text-white text-left hover:bg-[#142d47] transition-colors">
                      <span className="text-sm font-semibold">Utility Meter Readings</span>
                      <svg className={`w-4 h-4 transition-transform ${expandedSections.has('_METERS_') ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedSections.has('_METERS_') && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="bg-neutral-100 border-b border-neutral-200">
                              <th className="px-3 py-1.5 text-left text-xs font-semibold text-neutral-600">Meter</th>
                              <th className="px-3 py-1.5 text-left text-xs font-semibold text-neutral-600">Meter No.</th>
                              <th className="px-3 py-1.5 text-left text-xs font-semibold text-neutral-600">Reading</th>
                              <th className="px-3 py-1.5 text-left text-xs font-semibold text-neutral-600">Photo Ref. / Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {checklistData.meters.map((m, i) => (
                              <tr key={m.meter} className="border-b border-neutral-100">
                                <td className="px-3 py-1.5 text-xs text-neutral-700">{m.meter}</td>
                                {isCompleted ? (
                                  <>
                                    <td className="px-3 py-1.5 text-xs text-neutral-700">{m.meterNo || '—'}</td>
                                    <td className="px-3 py-1.5 text-xs text-neutral-700">{m.reading || '—'}</td>
                                    <td className="px-3 py-1.5 text-xs text-neutral-700">{m.notes || '—'}</td>
                                  </>
                                ) : (
                                  <>
                                    <td className="px-2 py-1.5"><input type="text" value={m.meterNo} onChange={e => updateMeter(i, 'meterNo', e.target.value)} placeholder="Meter no." className="text-xs border border-neutral-200 rounded px-2 py-1 w-full" /></td>
                                    <td className="px-2 py-1.5"><input type="text" value={m.reading} onChange={e => updateMeter(i, 'reading', e.target.value)} placeholder="Reading" className="text-xs border border-neutral-200 rounded px-2 py-1 w-full" /></td>
                                    <td className="px-2 py-1.5"><input type="text" value={m.notes} onChange={e => updateMeter(i, 'notes', e.target.value)} placeholder="Photo ref / notes" className="text-xs border border-neutral-200 rounded px-2 py-1 w-full" /></td>
                                  </>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Keys & Access */}
                  <div>
                    <button type="button" onClick={() => toggleSection('_KEYS_')}
                      className="w-full flex items-center justify-between px-6 py-2.5 bg-[#1A3A5C] text-white text-left hover:bg-[#142d47] transition-colors">
                      <span className="text-sm font-semibold">Keys & Access</span>
                      <svg className={`w-4 h-4 transition-transform ${expandedSections.has('_KEYS_') ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedSections.has('_KEYS_') && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="bg-neutral-100 border-b border-neutral-200">
                              <th className="px-3 py-1.5 text-left text-xs font-semibold text-neutral-600">Item</th>
                              <th className="px-3 py-1.5 text-left text-xs font-semibold text-neutral-600">No. Issued</th>
                              <th className="px-3 py-1.5 text-left text-xs font-semibold text-neutral-600">No. Returned</th>
                              <th className="px-3 py-1.5 text-left text-xs font-semibold text-neutral-600">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {checklistData.keys.map((k, i) => (
                              <tr key={k.item} className="border-b border-neutral-100">
                                <td className="px-3 py-1.5 text-xs text-neutral-700">{k.item}</td>
                                {isCompleted ? (
                                  <>
                                    <td className="px-3 py-1.5 text-xs text-neutral-700">{k.issued || '—'}</td>
                                    <td className="px-3 py-1.5 text-xs text-neutral-700">{k.returned || '—'}</td>
                                    <td className="px-3 py-1.5 text-xs text-neutral-700">{k.notes || '—'}</td>
                                  </>
                                ) : (
                                  <>
                                    <td className="px-2 py-1.5"><input type="text" value={k.issued} onChange={e => updateKey(i, 'issued', e.target.value)} placeholder="0" className="text-xs border border-neutral-200 rounded px-2 py-1 w-20" /></td>
                                    <td className="px-2 py-1.5"><input type="text" value={k.returned} onChange={e => updateKey(i, 'returned', e.target.value)} placeholder="0" className="text-xs border border-neutral-200 rounded px-2 py-1 w-20" /></td>
                                    <td className="px-2 py-1.5"><input type="text" value={k.notes} onChange={e => updateKey(i, 'notes', e.target.value)} placeholder="Notes" className="text-xs border border-neutral-200 rounded px-2 py-1 w-full" /></td>
                                  </>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Defects & Actions Summary */}
                  <div>
                    <div className="flex items-center justify-between px-6 py-2.5 bg-[#1A3A5C]">
                      <span className="text-sm font-semibold text-white">Defects & Actions Summary</span>
                      {!isCompleted && (
                        <button type="button" onClick={addDefect} className="text-xs bg-[#E8960C] text-white px-2 py-0.5 rounded hover:bg-[#d4850a] transition-colors">+ Add Defect</button>
                      )}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-neutral-100 border-b border-neutral-200">
                            <th className="px-3 py-1.5 text-left text-xs font-semibold text-neutral-600">Defect / Item</th>
                            <th className="px-3 py-1.5 text-left text-xs font-semibold text-neutral-600">Responsibility</th>
                            <th className="px-3 py-1.5 text-left text-xs font-semibold text-neutral-600">Deadline</th>
                            <th className="px-3 py-1.5 text-left text-xs font-semibold text-neutral-600">Work Order / Notes</th>
                            {!isCompleted && <th className="px-2 py-1.5 w-8"></th>}
                          </tr>
                        </thead>
                        <tbody>
                          {checklistData.defects.map((d, i) => (
                            <tr key={i} className="border-b border-neutral-100">
                              {isCompleted ? (
                                <>
                                  <td className="px-3 py-1.5 text-xs text-neutral-700">{d.item || '—'}</td>
                                  <td className="px-3 py-1.5 text-xs text-neutral-700">{d.responsibility}</td>
                                  <td className="px-3 py-1.5 text-xs text-neutral-700">{d.deadline || '—'}</td>
                                  <td className="px-3 py-1.5 text-xs text-neutral-700">{d.notes || '—'}</td>
                                </>
                              ) : (
                                <>
                                  <td className="px-2 py-1.5"><input type="text" value={d.item} onChange={e => updateDefect(i, 'item', e.target.value)} placeholder="Describe defect" className="text-xs border border-neutral-200 rounded px-2 py-1 w-full" /></td>
                                  <td className="px-2 py-1.5">
                                    <select value={d.responsibility} onChange={e => updateDefect(i, 'responsibility', e.target.value)} className="text-xs border border-neutral-300 rounded px-1 py-1 w-full bg-white">
                                      <option value="LANDLORD">Landlord</option>
                                      <option value="TENANT">Tenant</option>
                                    </select>
                                  </td>
                                  <td className="px-2 py-1.5"><input type="date" value={d.deadline} onChange={e => updateDefect(i, 'deadline', e.target.value)} className="text-xs border border-neutral-200 rounded px-2 py-1 w-full" /></td>
                                  <td className="px-2 py-1.5"><input type="text" value={d.notes} onChange={e => updateDefect(i, 'notes', e.target.value)} placeholder="Work order / notes" className="text-xs border border-neutral-200 rounded px-2 py-1 w-full" /></td>
                                  <td className="px-2 py-1.5">
                                    <button type="button" onClick={() => removeDefect(i)} className="text-danger-400 hover:text-danger-600 text-xs">✕</button>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Overall Assessment */}
                  <div className="px-6 py-4 space-y-4">
                    <h3 className="text-sm font-semibold text-[#1A3A5C] uppercase tracking-wide">Overall Assessment</h3>
                    <div className="flex flex-wrap gap-3">
                      {['EXCELLENT', 'GOOD', 'FAIR', 'POOR'].map(c => (
                        <label key={c} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm cursor-pointer transition-colors ${
                          checklistData.overallCondition === c
                            ? (c === 'EXCELLENT' || c === 'GOOD') ? 'border-green-500 bg-green-50 text-green-800'
                              : c === 'FAIR' ? 'border-yellow-500 bg-yellow-50 text-yellow-800'
                              : 'border-red-500 bg-red-50 text-red-800'
                            : 'border-neutral-300 text-neutral-600'
                        }`}>
                          <input type="radio" name="overallCondition" value={c}
                            checked={checklistData.overallCondition === c}
                            onChange={() => !isCompleted && updateMeta('overallCondition', c)}
                            disabled={isCompleted} className="sr-only" />
                          {c.charAt(0) + c.slice(1).toLowerCase()}
                        </label>
                      ))}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Lease violations observed? (pets, subletting, unauthorised alterations, prohibited use)
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-1 text-sm cursor-pointer">
                          <input type="radio" checked={!checklistData.leaseViolations}
                            onChange={() => !isCompleted && updateMeta('leaseViolations', false)} disabled={isCompleted} />No
                        </label>
                        <label className="flex items-center gap-1 text-sm cursor-pointer">
                          <input type="radio" checked={checklistData.leaseViolations}
                            onChange={() => !isCompleted && updateMeta('leaseViolations', true)} disabled={isCompleted} />Yes
                        </label>
                      </div>
                      {checklistData.leaseViolations && (
                        isCompleted ? (
                          <p className="text-sm text-neutral-700 mt-2">{checklistData.violationDetails || '—'}</p>
                        ) : (
                          <textarea rows={2} value={checklistData.violationDetails}
                            onChange={e => updateMeta('violationDetails', e.target.value)}
                            placeholder="Describe violations..."
                            className="mt-2 text-sm border border-neutral-300 rounded px-3 py-2 w-full focus:ring-2 focus:ring-primary-500" />
                        )
                      )}
                    </div>

                    {isCompleted && checklistData.propertyCategory === 'COMMERCIAL' && (
                      <div className="p-3 bg-amber-50 border-l-4 border-amber-400 text-xs text-amber-800 rounded">
                        <strong>SOP 009</strong> — Lease-end: assess dilapidations against the original-condition record from lease start. Produce Statement of Repair Costs from defects above with supporting evidence.
                      </div>
                    )}
                    {isCompleted && checklistData.propertyCategory === 'RESIDENTIAL' && (
                      <div className="p-3 bg-amber-50 border-l-4 border-amber-400 text-xs text-amber-800 rounded">
                        <strong>SOP 008</strong> — Move-out: use move-in report and photos as baseline; produce Statement of Repair Costs. Deductions require evidence — photos, comparison report, and invoices/quotes.
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                /* ── Legacy room-by-room form ─────────────────────────────── */
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant={statusVariant(selectedInspection.status)}>{selectedInspection.status.replace('_', ' ')}</Badge>
                    {selectedInspection.inspector && <span className="text-sm text-neutral-600">Inspector: <strong>{selectedInspection.inspector}</strong></span>}
                    {selectedInspection.tenant && <span className="text-sm text-neutral-600">Tenant: <strong>{selectedInspection.tenant.name}</strong></span>}
                  </div>
                  <div>
                    <h3 className="text-md font-semibold text-neutral-900 mb-3">Room Assessment</h3>
                    <div className="space-y-3">
                      {legacyRooms.map((room, idx) => (
                        <div key={room.room} className="border border-neutral-200 rounded-lg p-4">
                          <div className="flex items-center gap-4 mb-2">
                            <span className="text-sm font-medium text-neutral-900 min-w-[120px]">{room.room}</span>
                            {isCompleted ? (
                              <Badge variant={condVariant(room.condition)}>{room.condition}</Badge>
                            ) : (
                              <Select value={room.condition}
                                onChange={e => { const r = [...legacyRooms]; r[idx] = { ...r[idx], condition: e.target.value }; setLegacyRooms(r) }}
                                options={[
                                  { value: 'EXCELLENT', label: 'Excellent' },
                                  { value: 'GOOD', label: 'Good' },
                                  { value: 'FAIR', label: 'Fair' },
                                  { value: 'POOR', label: 'Poor' },
                                ]} className="w-36" />
                            )}
                          </div>
                          {isCompleted ? (
                            room.notes && <p className="text-sm text-neutral-600">{room.notes}</p>
                          ) : (
                            <Textarea placeholder={room.condition === 'FAIR' || room.condition === 'POOR' ? 'Notes required...' : 'Optional notes...'}
                              value={room.notes} onChange={e => { const r = [...legacyRooms]; r[idx] = { ...r[idx], notes: e.target.value }; setLegacyRooms(r) }} className="mt-1" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {!isCompleted && (
                    <div>
                      <h3 className="text-md font-semibold mb-2">Summary</h3>
                      <Textarea placeholder="Overall summary..." value={legacySummary} onChange={e => setLegacySummary(e.target.value)} rows={3} />
                    </div>
                  )}
                </div>
              )}
            </ModalBody>

            <ModalFooter>
              {!isCompleted && !isCancelled && (
                <>
                  <Button variant="outline" onClick={saveProgress}>Save Progress</Button>
                  {!showCompleteConfirm ? (
                    <Button variant="success" onClick={() => setShowCompleteConfirm(true)}>Complete Inspection</Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-neutral-600">Are you sure?</span>
                      <Button variant="outline" size="sm" onClick={() => setShowCompleteConfirm(false)}>Cancel</Button>
                      <Button variant="success" size="sm" onClick={handleComplete} disabled={completeLoading}>
                        {completeLoading ? 'Completing...' : 'Confirm Complete'}
                      </Button>
                    </div>
                  )}
                </>
              )}
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>Close</Button>
            </ModalFooter>
          </>
        )}
      </Modal>
    </div>
  )
}
