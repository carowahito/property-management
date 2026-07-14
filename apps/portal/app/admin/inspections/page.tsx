'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { EmptyState } from '@/components/ui/empty-state'
import { SignaturePad } from '@/components/ui/SignaturePad'
import { MoveOutQuotePanel } from '@/components/move-out/MoveOutQuotePanel'
import { ClearancePanel } from '@/components/move-out/ClearancePanel'
import {
  type ChecklistData,
  type ChecklistItem,
  type MatrixRow,
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
  inspectorSignature?: string | null
  inspectorSignedAt?: string | null
  tenantSignature?: string | null
  tenantSignedAt?: string | null
  landlordSignature?: string | null
  landlordSignedAt?: string | null
  referenceCode?: string | null
  rootInspectionId?: string | null
  reassessmentNumber?: number
  property: { id: string; name: string; address: string; landlordId?: string | null }
  unit: { id: string; unitNumber: string; bedrooms?: number | null; bathrooms?: number | null } | null
  tenant: { id: string; name: string; email: string; phone: string } | null
  lease: { id: string; startDate: string; endDate: string; status: string } | null
}

interface PropertyOption { id: string; name: string; address: string }
interface UnitOption { id: string; unitNumber: string }
interface TenantOption { id: string; name: string }

// ── Constants ─────────────────────────────────────────────────────────────────

const INSPECTION_TYPES = [
  { value: 'MOVE_IN', label: 'Move-In' },
  { value: 'POST_MOVE_IN', label: 'Post-Move-In Confirmation (5+ days)' },
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

const COND_SCORES: Record<string, number> = { N: 4, G: 3, F: 2, P: 1, D: 1, M: 1 }

function computeOverall(data: ChecklistData): string {
  const all: number[] = []
  data.items.forEach(it => { if (it.condition in COND_SCORES) all.push(COND_SCORES[it.condition]) })
  ;(data.bedroomMatrix || []).forEach(row => row.cond.forEach(c => { if (c in COND_SCORES) all.push(COND_SCORES[c]) }))
  ;(data.bathroomMatrix || []).forEach(row => row.cond.forEach(c => { if (c in COND_SCORES) all.push(COND_SCORES[c]) }))
  ;(data.additionalItems || []).filter(it => it.item.trim()).forEach(it => { if (it.condition in COND_SCORES) all.push(COND_SCORES[it.condition]) })
  if (!all.length) return 'GOOD'
  const avg = all.reduce((s, n) => s + n, 0) / all.length
  return avg >= 3.5 ? 'EXCELLENT' : avg >= 2.5 ? 'GOOD' : avg >= 1.5 ? 'FAIR' : 'POOR'
}

// ── Image resize helper ────────────────────────────────────────────────────────

async function resizeImage(file: File, maxPx = 1200, quality = 0.72): Promise<string> {
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxPx / img.width, maxPx / img.height)
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.src = url
  })
}

const NEEDS_EVIDENCE = new Set(['P', 'D', 'M'])

// ── Checklist row ─────────────────────────────────────────────────────────────

function ChecklistRow({
  item, idx, onUpdate, onAddPhoto, onRemovePhoto, readonly, editableName,
}: {
  item: ChecklistItem
  idx: number
  onUpdate: (idx: number, field: keyof ChecklistItem, value: string) => void
  onAddPhoto?: (idx: number, dataUrl: string) => void
  onRemovePhoto?: (idx: number, photoIdx: number) => void
  readonly: boolean
  editableName?: boolean
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const photos = item.photos || []
  const needsEvidence = NEEDS_EVIDENCE.has(item.condition)
  const hasEvidence = !!(item.comments.trim() || photos.length)
  const showWarning = needsEvidence && !hasEvidence && !readonly

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !onAddPhoto) return
    const dataUrl = await resizeImage(file)
    onAddPhoto(idx, dataUrl)
    e.target.value = ''
  }

  const condColor: Record<string, string> = {
    P: 'bg-red-50', D: 'bg-red-50', F: 'bg-yellow-50', M: 'bg-orange-50',
  }
  const rowBg = condColor[item.condition] || ''

  return (
    <>
      <tr className={`border-b border-neutral-100 ${rowBg}${showWarning ? ' ring-1 ring-inset ring-red-400' : ''}`}>
        <td className="px-3 py-1.5 text-xs text-neutral-800 min-w-[200px]">
          {showWarning && (
            <span className="inline-block text-red-500 mr-1" title="Add a comment or photo for P / D / M items">⚠</span>
          )}
          {editableName && !readonly ? (
            <input type="text" value={item.item}
              onChange={e => onUpdate(idx, 'item', e.target.value)}
              placeholder="Area or item name"
              className="text-xs border border-neutral-200 rounded px-2 py-1 w-full focus:ring-1 focus:ring-primary-500" />
          ) : (
            item.item || '—'
          )}
        </td>
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
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={item.comments}
                onChange={e => onUpdate(idx, 'comments', e.target.value)}
                placeholder={needsEvidence ? 'Comment required for P/D/M…' : 'Comments / Photo Ref.'}
                className={`text-xs border rounded px-2 py-1 w-full focus:ring-1 focus:ring-primary-500 focus:border-transparent ${
                  showWarning ? 'border-red-300 bg-red-50 placeholder:text-red-400' : 'border-neutral-200'
                }`}
              />
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              <button
                type="button"
                title="Add photo"
                onClick={() => fileRef.current?.click()}
                className={`flex-shrink-0 px-1.5 py-1 rounded border text-sm transition-colors ${
                  showWarning
                    ? 'border-red-300 text-red-400 hover:bg-red-50 hover:text-red-600'
                    : 'border-neutral-200 text-neutral-400 hover:border-primary-300 hover:text-primary-600'
                }`}
              >
                📷
              </button>
            </div>
          )}
        </td>
      </tr>
      {/* Photo thumbnails */}
      {photos.length > 0 && (
        <tr className={`border-b border-neutral-100 ${rowBg}`}>
          <td colSpan={4} className="px-3 pb-2 pt-0.5">
            <div className="flex gap-2 flex-wrap">
              {photos.map((src, i) => (
                <div key={i} className="relative group">
                  <img src={src} alt={`Photo ${i + 1}`}
                    className="w-16 h-16 object-cover rounded border border-neutral-200 cursor-pointer"
                    onClick={() => window.open(src, '_blank')} />
                  <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] bg-black/50 text-white rounded-b pointer-events-none">
                    P{String(i + 1).padStart(3, '0')}
                  </span>
                  {!readonly && (
                    <button type="button" onClick={() => onRemovePhoto?.(idx, i)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center leading-none">
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function InspectionsPage() {
  const { data: session } = useSession()
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
  const [guideOpenKey, setGuideOpenKey] = useState<string | null>(null)
  const [completeLoading, setCompleteLoading] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [inspectorSigData, setInspectorSigData] = useState<string | null>(null)
  const [showInspectorSigPad, setShowInspectorSigPad] = useState(false)
  const [resumeLinkLoading, setResumeLinkLoading] = useState(false)
  const [quotePanelOpen, setQuotePanelOpen] = useState(false)
  const [moveOutQuoteReady, setMoveOutQuoteReady] = useState(false)
  const [clearancePanelOpen, setClearancePanelOpen] = useState(false)

  // Editable inspection details (date / type / agent)
  const [editScheduledDate, setEditScheduledDate] = useState('')
  const [editType, setEditType] = useState('')
  const [editInspector, setEditInspector] = useState('')
  const [savingDetails, setSavingDetails] = useState(false)
  const [agents, setAgents] = useState<{ id: string; name: string; email: string; role: string }[]>([])

  // Row actions dropdown
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null)
  const [menuPos, setMenuPos] = useState<{ top?: number; bottom?: number; left: number } | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ type: 'archive' | 'delete' | 'reassess'; inspection: Inspection } | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [validateTarget, setValidateTarget] = useState<Inspection | null>(null)
  const [validateLoading, setValidateLoading] = useState(false)
  const [sendValidationLoadingId, setSendValidationLoadingId] = useState<string | null>(null)
  // Report email
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [emailTo, setEmailTo] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)

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

  // Close the row-actions dropdown on scroll so it doesn't drift away from its button
  useEffect(() => {
    if (!openActionMenuId) return
    const close = () => { setOpenActionMenuId(null); setMenuPos(null) }
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [openActionMenuId])

  // Close the code-guide tooltip when clicking anywhere else
  useEffect(() => {
    if (!guideOpenKey) return
    const close = () => setGuideOpenKey(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [guideOpenKey])

  // Deep-link: open a specific inspection when ?id=... is present (e.g. from a resume-link email)
  useEffect(() => {
    const linkedId = new URLSearchParams(window.location.search).get('id')
    if (!linkedId) return
    fetch(`/api/inspections/${linkedId}`)
      .then(r => r.ok ? r.json() : null)
      .then(inspection => { if (inspection) openDetail(inspection) })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Deep-link: open the schedule modal prefilled when ?schedule=1 is present
  // (e.g. from a tenant's move-out → "Schedule preliminary inspection" button)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    if (p.get('schedule') !== '1') return
    setScheduleForm(f => ({
      ...f,
      propertyId: p.get('propertyId') || '',
      unitId: p.get('unitId') || '',
      tenantId: p.get('tenantId') || '',
      type: p.get('type') || 'PRE_MOVE_OUT',
    }))
    setShowScheduleModal(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetch('/api/properties?limit=500').then(r => r.json()).then(d => setProperties(d.properties || [])).catch(() => {})
    fetch('/api/tenants?limit=500').then(r => r.json()).then(d => setTenants(d.tenants || [])).catch(() => {})
    fetch('/api/users').then(r => r.json()).then(d => setAgents(d.users || [])).catch(() => {})
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

  // ── Open schedule modal ─────────────────────────────────────────────────────

  function openScheduleModal() {
    setScheduleForm(f => ({ ...f, inspector: f.inspector || session?.user?.name || '' }))
    setShowScheduleModal(true)
  }

  // ── Open detail ────────────────────────────────────────────────────────────

  function openDetail(inspection: Inspection) {
    setSelectedInspection(inspection)
    setShowCompleteConfirm(false)
    setShowEmailForm(false)
    setEmailTo('')
    setInspectorSigData(null)
    setShowInspectorSigPad(false)
    setEditScheduledDate(new Date(inspection.scheduledDate).toISOString().slice(0, 10))
    setEditType(inspection.type)
    setEditInspector(inspection.inspector || '')

    if (inspection.propertyCategory) {
      // Checklist-mode
      const stored = inspection.rooms
      if (stored && (stored as any)._v === 2) {
        const data = stored as ChecklistData
        // Auto-compute overall from saved conditions (for in-progress forms)
        const withComputed = inspection.status !== 'COMPLETED'
          ? { ...data, overallCondition: computeOverall(data) }
          : data
        setChecklistData(withComputed)
        if (inspection.status !== 'COMPLETED') {
          const sections = getUniqueSections(data.items)
          setExpandedSections(new Set(sections))
        } else {
          setExpandedSections(new Set())
        }
      } else {
        const data = defaultChecklistData(
          inspection.propertyCategory as 'RESIDENTIAL' | 'COMMERCIAL',
          inspection.unit?.bedrooms ?? 2,
          inspection.unit?.bathrooms ?? 1
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
      const next = { ...prev, items }
      return { ...next, overallCondition: computeOverall(next) }
    })
  }

  function updateMeta(field: string, value: any) {
    setChecklistData(prev => {
      if (!prev) return prev
      const next = { ...prev, [field]: value }
      // When the property is unfurnished, there is nothing to inspect in
      // 3.9 Furnishings & Inventory — auto-set every item's condition to NA.
      if (field === 'furnished' && value === 'Unfurnished') {
        next.items = prev.items.map(it => it.section === '3.9' ? { ...it, condition: 'NA' } : it)
      }
      return next
    })
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

  function updateMatrixCond(
    matrix: 'bedroomMatrix' | 'bathroomMatrix',
    rowIdx: number,
    colIdx: number,
    value: string,
  ) {
    setChecklistData(prev => {
      if (!prev) return prev
      const rows = [...prev[matrix]] as MatrixRow[]
      const cond = [...rows[rowIdx].cond]
      cond[colIdx] = value
      rows[rowIdx] = { ...rows[rowIdx], cond }
      const next = { ...prev, [matrix]: rows }
      return { ...next, overallCondition: computeOverall(next) }
    })
  }

  function updateMatrixComments(
    matrix: 'bedroomMatrix' | 'bathroomMatrix',
    rowIdx: number,
    value: string,
  ) {
    setChecklistData(prev => {
      if (!prev) return prev
      const rows = [...prev[matrix]] as MatrixRow[]
      rows[rowIdx] = { ...rows[rowIdx], comments: value }
      return { ...prev, [matrix]: rows }
    })
  }

  function updateAdditionalItem(idx: number, field: keyof ChecklistItem, value: string) {
    setChecklistData(prev => {
      if (!prev) return prev
      const items = [...prev.additionalItems]
      items[idx] = { ...items[idx], [field]: value }
      const next = { ...prev, additionalItems: items }
      return { ...next, overallCondition: computeOverall(next) }
    })
  }

  function addPhotoToItem(idx: number, dataUrl: string) {
    setChecklistData(prev => {
      if (!prev) return prev
      const items = [...prev.items]
      items[idx] = { ...items[idx], photos: [...(items[idx].photos || []), dataUrl] }
      return { ...prev, items }
    })
  }

  function removePhotoFromItem(idx: number, photoIdx: number) {
    setChecklistData(prev => {
      if (!prev) return prev
      const items = [...prev.items]
      items[idx] = { ...items[idx], photos: (items[idx].photos || []).filter((_, i) => i !== photoIdx) }
      return { ...prev, items }
    })
  }

  function addPhotoToAdditional(idx: number, dataUrl: string) {
    setChecklistData(prev => {
      if (!prev) return prev
      const items = [...prev.additionalItems]
      items[idx] = { ...items[idx], photos: [...(items[idx].photos || []), dataUrl] }
      return { ...prev, additionalItems: items }
    })
  }

  function removePhotoFromAdditional(idx: number, photoIdx: number) {
    setChecklistData(prev => {
      if (!prev) return prev
      const items = [...prev.additionalItems]
      items[idx] = { ...items[idx], photos: (items[idx].photos || []).filter((_, i) => i !== photoIdx) }
      return { ...prev, additionalItems: items }
    })
  }

  async function handleEmailReport() {
    if (!selectedInspection || !emailTo.trim()) return
    setEmailLoading(true)
    try {
      const res = await fetch(`/api/inspections/${selectedInspection.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: emailTo }),
      })
      if (res.ok) {
        setShowEmailForm(false)
        setEmailTo('')
        alert('Report sent successfully')
      } else {
        alert('Failed to send report email')
      }
    } catch { alert('Network error') }
    finally { setEmailLoading(false) }
  }

  function toggleSection(section: string) {
    setExpandedSections(prev => {
      const next = new Set(prev)
      next.has(section) ? next.delete(section) : next.add(section)
      return next
    })
  }

  function toggleGuide(key: string) {
    setGuideOpenKey(prev => prev === key ? null : key)
  }

  function renderGuideIcon(key: string) {
    return (
      <span className="relative">
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); toggleGuide(key) }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); toggleGuide(key) } }}
          title="Condition & action code guide"
          className="w-5 h-5 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-[11px] font-bold cursor-pointer select-none"
        >?</span>
        {guideOpenKey === key && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-full mt-1 w-72 bg-white text-neutral-700 text-xs rounded-lg shadow-lg border border-neutral-200 p-3 z-50 normal-case font-normal"
          >
            <p className="mb-1.5"><strong>Condition:</strong> N=New · G=Good · F=Fair · P=Poor · D=Damaged · M=Missing · N/A=Not applicable</p>
            <p><strong>Action:</strong> OK=No action · CL=Cleaning · RP=Repair · RC=Replace · TC=Tenant charge (evidence required)</p>
          </div>
        )}
      </span>
    )
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

  // ── Save inspection details (date / type / agent) ───────────────────────────

  async function saveDetails() {
    if (!selectedInspection) return
    setSavingDetails(true)
    try {
      const res = await fetch(`/api/inspections/${selectedInspection.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledDate: editScheduledDate,
          type: editType,
          inspector: editInspector || null,
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        setSelectedInspection(prev => prev ? { ...prev, scheduledDate: updated.scheduledDate, type: updated.type, inspector: updated.inspector } : prev)
        fetchInspections()
      } else {
        const d = await res.json()
        alert(d.error || 'Failed to save inspection details')
      }
    } catch { alert('Network error') }
    finally { setSavingDetails(false) }
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

  async function handleEmailResumeLink() {
    if (!selectedInspection) return
    setResumeLinkLoading(true)
    try {
      await saveProgress()
      const res = await fetch(`/api/inspections/${selectedInspection.id}/email-resume-link`, { method: 'POST' })
      if (res.ok) {
        const d = await res.json()
        alert(`Resume link emailed to ${d.sentTo}`)
      } else {
        const d = await res.json()
        alert(d.error || 'Failed to send resume link')
      }
    } catch { alert('Network error') }
    finally { setResumeLinkLoading(false) }
  }

  // ── Row actions: Validate / Send for Validation / Archive / Delete ─────────

  function openValidate(inspection: Inspection) {
    setOpenActionMenuId(null)
    setValidateTarget(inspection)
  }

  async function handleValidateSign(dataUrl: string) {
    if (!validateTarget) return
    setValidateLoading(true)
    try {
      const res = await fetch(`/api/inspections/${validateTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspectorSignature: dataUrl, inspectorSignedAt: new Date().toISOString() }),
      })
      if (res.ok) {
        setValidateTarget(null)
        fetchInspections()
      } else {
        const d = await res.json()
        alert(d.error || 'Failed to save inspector signature')
      }
    } catch { alert('Network error') }
    finally { setValidateLoading(false) }
  }

  async function handleSendForValidation(inspection: Inspection) {
    setOpenActionMenuId(null)
    if (inspection.status !== 'COMPLETED') {
      alert('Inspection must be completed before it can be sent for validation.')
      return
    }
    setSendValidationLoadingId(inspection.id)
    try {
      const res = await fetch(`/api/inspections/${inspection.id}/send-for-validation`, { method: 'POST' })
      const d = await res.json()
      if (res.ok) {
        alert(`Sent for validation to ${d.sentTo}`)
      } else {
        alert(d.error || 'Failed to send for validation')
      }
    } catch { alert('Network error') }
    finally { setSendValidationLoadingId(null) }
  }

  function requestArchive(inspection: Inspection) {
    setOpenActionMenuId(null)
    setConfirmAction({ type: 'archive', inspection })
  }

  function requestDelete(inspection: Inspection) {
    setOpenActionMenuId(null)
    setConfirmAction({ type: 'delete', inspection })
  }

  function requestReassess(inspection: Inspection) {
    setOpenActionMenuId(null)
    if (inspection.status !== 'COMPLETED' || !inspection.inspectorSignature) {
      alert('You can only reassess an inspection after the current inspection has been validated')
      return
    }
    setConfirmAction({ type: 'reassess', inspection })
  }

  async function handleConfirmAction() {
    if (!confirmAction) return
    setConfirmLoading(true)
    try {
      if (confirmAction.type === 'archive') {
        const res = await fetch(`/api/inspections/${confirmAction.inspection.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'ARCHIVED' }),
        })
        if (!res.ok) {
          const d = await res.json()
          alert(d.error || 'Failed to archive inspection')
          return
        }
      } else if (confirmAction.type === 'delete') {
        const res = await fetch(`/api/inspections/${confirmAction.inspection.id}`, { method: 'DELETE' })
        if (!res.ok) {
          const d = await res.json()
          alert(d.error || 'Failed to delete inspection')
          return
        }
      } else {
        const res = await fetch(`/api/inspections/${confirmAction.inspection.id}/reassess`, { method: 'POST' })
        if (!res.ok) {
          const d = await res.json()
          alert(d.error || 'Failed to reassess inspection')
          return
        }
        const created = await res.json()
        setConfirmAction(null)
        fetchInspections()
        const full = await fetch(`/api/inspections/${created.id}`).then(r => r.ok ? r.json() : null).catch(() => null)
        openDetail(full || created)
        return
      }
      setConfirmAction(null)
      fetchInspections()
    } catch { alert('Network error') }
    finally { setConfirmLoading(false) }
  }

  // ── Complete ───────────────────────────────────────────────────────────────

  async function handleComplete() {
    if (!selectedInspection) return
    if (!inspectorSigData) {
      alert('Inspector signature is required to complete the inspection')
      setShowInspectorSigPad(true)
      return
    }
    setCompleteLoading(true)

    try {
      let rooms: any = null
      let overallCondition = 'GOOD'
      let maintenanceItems: any[] = []
      let followUpRequired = false

      if (checklistData) {
        // Validate: P / D / M items must have a comment or at least one photo
        const noEvidence = [
          ...checklistData.items,
          ...checklistData.additionalItems.filter(it => it.item.trim()),
        ].filter(it => NEEDS_EVIDENCE.has(it.condition) && !it.comments.trim() && !(it.photos?.length))

        // Matrix rows: require at least a comment if any column is P/D/M
        const matrixNoEvidence = [
          ...checklistData.bedroomMatrix,
          ...checklistData.bathroomMatrix,
        ].filter(row =>
          row.cond.some(c => NEEDS_EVIDENCE.has(c)) && !row.comments.trim()
        )

        if (noEvidence.length > 0 || matrixNoEvidence.length > 0) {
          const names = [
            ...noEvidence.map(it => it.item),
            ...matrixNoEvidence.map(row => row.item),
          ]
          alert(`Add a comment or photo for these P / D / M items before completing:\n\n• ${names.join('\n• ')}`)
          setShowCompleteConfirm(false)
          setCompleteLoading(false)
          return
        }

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
          inspectorSignature: inspectorSigData,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to complete inspection')
        return
      }
      const completed = await res.json().catch(() => ({}))
      setShowCompleteConfirm(false)
      fetchInspections()
      // Move-out inspections auto-draft a Statement of Repair Costs — prompt the
      // agent to review and send it to the tenant.
      if (completed?.moveOutQuoteId) {
        setMoveOutQuoteReady(true)
      } else {
        setShowDetailModal(false)
      }
    } catch { alert('Network error') }
    finally { setCompleteLoading(false) }
  }

  const isCompleted = selectedInspection?.status === 'COMPLETED'
  const isCancelled = selectedInspection?.status === 'CANCELLED' || selectedInspection?.status === 'ARCHIVED'
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
        <Button variant="primary" size="lg" onClick={openScheduleModal}>+ Schedule Inspection</Button>
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
            { value: 'ARCHIVED', label: 'Archived' },
          ]} />
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden overflow-x-auto border border-neutral-200">
        {loading ? (
          <div className="p-12 text-center text-neutral-500">Loading inspections...</div>
        ) : inspections.length === 0 ? (
          <EmptyState title="No inspections found" description="Schedule your first property inspection."
            action={<Button variant="primary" onClick={openScheduleModal}>Schedule Inspection</Button>} />
        ) : (
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden lg:table-cell">Ref</th>
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
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-neutral-500 font-mono">{inspection.referenceCode || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-neutral-900">
                        {inspection.property?.id ? (
                          <Link href={`/admin/properties/${inspection.property.id}`} className="hover:text-primary-600 hover:underline" onClick={e => e.stopPropagation()}>
                            {inspection.property.name}
                          </Link>
                        ) : inspection.property?.name}
                      </div>
                      {inspection.unit && (
                        <div className="text-xs text-neutral-500">
                          <Link href={`/admin/units/${inspection.unit.unitNumber}`} className="hover:text-primary-600 hover:underline" onClick={e => e.stopPropagation()}>
                            Unit {inspection.unit.unitNumber}
                          </Link>
                        </div>
                      )}
                      <div className="text-xs text-neutral-400 lg:hidden">{inspection.referenceCode}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {inspection.propertyCategory ? (
                        <span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${
                          inspection.propertyCategory === 'RESIDENTIAL' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>{inspection.propertyCategory === 'RESIDENTIAL' ? '🏠 Residential' : '🏢 Commercial'}</span>
                      ) : <span className="text-xs text-neutral-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700 hidden md:table-cell">
                      {inspection.tenant ? (
                        <Link href={`/admin/tenants/${inspection.tenant.id}`} className="hover:text-primary-600 hover:underline" onClick={e => e.stopPropagation()}>
                          {inspection.tenant.name}
                        </Link>
                      ) : '—'}
                    </td>
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
                    <td className="px-4 py-3 relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          if (openActionMenuId === inspection.id) {
                            setOpenActionMenuId(null)
                            setMenuPos(null)
                            return
                          }
                          const rect = e.currentTarget.getBoundingClientRect()
                          const menuWidth = 192 // w-48
                          const menuMaxHeight = 288 // max-h-72
                          const spaceBelow = window.innerHeight - rect.bottom
                          const openUpward = spaceBelow < menuMaxHeight && rect.top > spaceBelow
                          setMenuPos({
                            top: openUpward ? undefined : rect.bottom + 4,
                            bottom: openUpward ? window.innerHeight - rect.top + 4 : undefined,
                            left: Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8)),
                          })
                          setOpenActionMenuId(inspection.id)
                        }}
                      >
                        Actions ▾
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Row actions dropdown (fixed-position so it isn't clipped by the table's overflow) ── */}
      {openActionMenuId && menuPos && (() => {
        const inspection = inspections.find(i => i.id === openActionMenuId)
        if (!inspection) return null
        const closeMenu = () => { setOpenActionMenuId(null); setMenuPos(null) }
        return (
          <>
            <div className="fixed inset-0 z-40" onClick={closeMenu} />
            <div
              className="fixed z-50 w-48 max-h-72 overflow-y-auto bg-white border border-neutral-200 rounded-lg shadow-lg py-1"
              style={{ top: menuPos.top, bottom: menuPos.bottom, left: menuPos.left }}
            >
              {inspection.status === 'COMPLETED' ? (
                <button
                  className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  onClick={() => { closeMenu(); openDetail(inspection) }}
                >View</button>
              ) : (
                <button
                  className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  onClick={() => { closeMenu(); openDetail(inspection) }}
                >Edit</button>
              )}
              {inspection.propertyCategory && (
                <button
                  className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  onClick={() => { closeMenu(); window.open(`/api/inspections/${inspection.id}/report`, '_blank') }}
                >Download</button>
              )}
              {inspection.status === 'COMPLETED' && !inspection.inspectorSignature && (
                <button
                  className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  onClick={() => { setMenuPos(null); openValidate(inspection) }}
                >Validate</button>
              )}
              {inspection.status === 'COMPLETED' && (
                <button
                  className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                  disabled={sendValidationLoadingId === inspection.id}
                  onClick={() => { setMenuPos(null); handleSendForValidation(inspection) }}
                >{sendValidationLoadingId === inspection.id ? 'Sending…' : 'Send for Validation'}</button>
              )}
              {inspection.status === 'COMPLETED' && (
                <button
                  className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  onClick={() => { setMenuPos(null); requestReassess(inspection) }}
                >Reassess</button>
              )}
              {inspection.status !== 'ARCHIVED' && (
                <button
                  className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  onClick={() => { setMenuPos(null); requestArchive(inspection) }}
                >Archive</button>
              )}
              <button
                className="w-full text-left px-4 py-2 text-sm text-danger-600 hover:bg-danger-50"
                onClick={() => { setMenuPos(null); requestDelete(inspection) }}
              >Delete</button>
            </div>
          </>
        )
      })()}

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
                  {selectedInspection.property?.id ? (
                    <Link href={`/admin/properties/${selectedInspection.property.id}`} className="hover:text-primary-600 hover:underline">
                      {selectedInspection.property.name}
                    </Link>
                  ) : selectedInspection.property?.name}
                  {selectedInspection.unit ? (
                    <>
                      {' · '}
                      <Link href={`/admin/units/${selectedInspection.unit.unitNumber}`} className="hover:text-primary-600 hover:underline">
                        Unit {selectedInspection.unit.unitNumber}
                      </Link>
                    </>
                  ) : ''}
                  {selectedInspection.tenant ? (
                    <>
                      {' · '}
                      <Link href={`/admin/tenants/${selectedInspection.tenant.id}`} className="hover:text-primary-600 hover:underline">
                        {selectedInspection.tenant.name}
                      </Link>
                    </>
                  ) : ''}
                </p>
                {!isCompleted && !isCancelled ? (
                  <div className="flex flex-wrap items-end gap-2 mt-2">
                    <Input
                      type="date"
                      className="w-auto py-1 text-sm"
                      value={editScheduledDate}
                      onChange={e => setEditScheduledDate(e.target.value)}
                    />
                    <Select
                      className="w-auto py-1 text-sm"
                      options={INSPECTION_TYPES}
                      value={editType}
                      onChange={e => setEditType(e.target.value)}
                    />
                    <Select
                      className="w-auto py-1 text-sm"
                      options={[
                        { value: '', label: 'Select agent…' },
                        ...(editInspector && !agents.some(a => a.name === editInspector)
                          ? [{ value: editInspector, label: `${editInspector} (unlisted)` }]
                          : []),
                        ...agents.map(a => ({ value: a.name, label: a.name })),
                      ]}
                      value={editInspector}
                      onChange={e => setEditInspector(e.target.value)}
                    />
                    <Button size="sm" variant="outline" onClick={saveDetails} disabled={savingDetails}>
                      {savingDetails ? 'Saving…' : 'Save Details'}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {formatType(selectedInspection.type)}
                    {' · '}{new Date(selectedInspection.scheduledDate).toLocaleDateString()}
                    {selectedInspection.inspector ? ` · ${selectedInspection.inspector}` : ''}
                  </p>
                )}
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

                  {/* General Notes */}
                  <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-200">
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      General Inspection Notes
                      {!isCompleted && <span className="ml-1 text-neutral-400 font-normal">(overall observations, access issues, anything not captured in sections below)</span>}
                    </label>
                    {isCompleted ? (
                      <p className="text-sm text-neutral-700 whitespace-pre-wrap">{(checklistData as any).notes || '—'}</p>
                    ) : (
                      <textarea
                        rows={2}
                        value={(checklistData as any).notes || ''}
                        onChange={e => updateMeta('notes', e.target.value)}
                        placeholder="e.g. Property well maintained overall. Tenant was present. Access via estate agent key…"
                        className="text-sm border border-neutral-300 rounded px-3 py-2 w-full focus:ring-2 focus:ring-primary-500 resize-none"
                      />
                    )}
                  </div>

                  {/* Legend */}
                  <div className="px-6 py-2 bg-neutral-50 border-b border-neutral-200 flex flex-wrap gap-x-6 gap-y-1 text-xs text-neutral-500">
                    <span><strong>Condition:</strong> N=New · G=Good · F=Fair · P=Poor · D=Damaged · M=Missing · N/A=Not applicable</span>
                    <span><strong>Action:</strong> OK=No action · CL=Cleaning · RP=Repair · RC=Replace · TC=Tenant charge (evidence required)</span>
                    <span className="text-amber-600"><strong>⚠ P / D / M</strong> items require a comment or photo before completing.</span>
                  </div>

                  {/* Checklist Sections — residential interleaves matrices; commercial renders all directly */}
                  {(() => {
                    const allSections = getUniqueSections(checklistData.items)
                    const isRes = checklistData.propertyCategory === 'RESIDENTIAL'
                    const earlyIds = ['3.1', '3.2', '3.3']
                    const earlySections = isRes ? allSections.filter(s => earlyIds.some(id => s.startsWith(id))) : allSections
                    const lateSections = isRes ? allSections.filter(s => !earlyIds.some(id => s.startsWith(id))) : []

                    const renderSection = (section: string) => {
                      const sectionItemsFiltered = checklistData.items.map((item, globalIdx) => ({ item, globalIdx })).filter(({ item }) => item.section === section)
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
                              {renderGuideIcon(section)}
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
                                      onUpdate={updateItem} readonly={isCompleted}
                                      onAddPhoto={isCompleted ? undefined : addPhotoToItem}
                                      onRemovePhoto={isCompleted ? undefined : removePhotoFromItem} />
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )
                    }

                    const renderMatrixSection = (
                      sectionId: string,
                      title: string,
                      subtitle: string,
                      matrixKey: 'bedroomMatrix' | 'bathroomMatrix',
                      colLabels: string[],
                    ) => {
                      const rows = checklistData[matrixKey] as MatrixRow[]
                      if (!rows?.length) return null
                      const key = `_${matrixKey}_`
                      const isExpanded = expandedSections.has(key)
                      const hasIssue = rows.some(r => r.cond.some(c => c === 'P' || c === 'D' || c === 'F'))
                      return (
                        <div key={key}>
                          <button type="button" onClick={() => toggleSection(key)}
                            className="w-full flex items-center justify-between px-6 py-2.5 bg-[#1A3A5C] text-white text-left hover:bg-[#142d47] transition-colors">
                            <span className="text-sm font-semibold">{sectionId} {title} <span className="text-xs font-normal opacity-75">— {subtitle}</span></span>
                            <div className="flex items-center gap-2">
                              {hasIssue && !isCompleted && (
                                <span className="text-xs bg-[#E8960C] text-white px-2 py-0.5 rounded-full">Needs attention</span>
                              )}
                              {renderGuideIcon(key)}
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
                                    <th className="px-3 py-1.5 text-left text-xs font-semibold text-neutral-600 min-w-[180px]">Item</th>
                                    {colLabels.map(l => (
                                      <th key={l} className="px-2 py-1.5 text-center text-xs font-semibold text-neutral-600 w-16">{l}</th>
                                    ))}
                                    <th className="px-2 py-1.5 text-left text-xs font-semibold text-neutral-600">Comments / Photo Ref.</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {rows.map((row, rowIdx) => {
                                    const rowBg = row.cond.some(c => c === 'P' || c === 'D') ? 'bg-red-50' :
                                      row.cond.some(c => c === 'F') ? 'bg-yellow-50' : ''
                                    return (
                                      <tr key={row.item} className={`border-b border-neutral-100 ${rowBg}`}>
                                        <td className="px-3 py-1.5 text-xs text-neutral-800">{row.item}</td>
                                        {colLabels.map((_, colIdx) => {
                                          const cv = row.cond[colIdx] ?? 'G'
                                          return (
                                            <td key={colIdx} className="px-2 py-1.5 w-16 text-center">
                                              {isCompleted ? (
                                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold ${
                                                  cv === 'G' || cv === 'N' ? 'bg-green-100 text-green-800' :
                                                  cv === 'F' ? 'bg-yellow-100 text-yellow-800' :
                                                  cv === 'P' || cv === 'D' ? 'bg-red-100 text-red-800' :
                                                  cv === 'M' ? 'bg-orange-100 text-orange-800' :
                                                  'bg-neutral-100 text-neutral-600'
                                                }`}>{cv}</span>
                                              ) : (
                                                <select value={cv}
                                                  onChange={e => updateMatrixCond(matrixKey, rowIdx, colIdx, e.target.value)}
                                                  className="text-xs border border-neutral-300 rounded px-1 py-1 w-full bg-white focus:ring-1 focus:ring-primary-500">
                                                  {CONDITION_CODES.map(c => (
                                                    <option key={c.value} value={c.value}>{c.value}</option>
                                                  ))}
                                                </select>
                                              )}
                                            </td>
                                          )
                                        })}
                                        <td className="px-2 py-1.5">
                                          {isCompleted ? (
                                            <span className="text-xs text-neutral-600">{row.comments || '—'}</span>
                                          ) : (
                                            <input type="text" value={row.comments}
                                              onChange={e => updateMatrixComments(matrixKey, rowIdx, e.target.value)}
                                              placeholder="Comments / Photo Ref."
                                              className="text-xs border border-neutral-200 rounded px-2 py-1 w-full focus:ring-1 focus:ring-primary-500" />
                                          )}
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )
                    }

                    const bedCols = Array.from({ length: checklistData.numBedrooms || 2 }, (_, i) => `Bed ${i + 1}`)
                    const bathCols = Array.from({ length: checklistData.numBathrooms || 1 }, (_, i) => `WC ${i + 1}`)

                    return (
                      <>
                        {earlySections.map(renderSection)}
                        {isRes && renderMatrixSection('3.4', 'Bedrooms', 'one column per bedroom', 'bedroomMatrix', bedCols)}
                        {isRes && renderMatrixSection('3.5', 'Bathrooms & Toilets', 'one column per bathroom', 'bathroomMatrix', bathCols)}
                        {lateSections.map(renderSection)}
                      </>
                    )
                  })()}

                  {/* Additional Areas */}
                  {(() => {
                    const addKey = '_ADDITIONAL_'
                    const addSectionNum = checklistData.propertyCategory === 'RESIDENTIAL' ? '3.10' : '3.11'
                    const isExpanded = expandedSections.has(addKey)
                    const items = checklistData.additionalItems || []
                    return (
                      <div>
                        <button type="button" onClick={() => toggleSection(addKey)}
                          className="w-full flex items-center justify-between px-6 py-2.5 bg-[#1A3A5C] text-white text-left hover:bg-[#142d47] transition-colors">
                          <span className="text-sm font-semibold">{addSectionNum} Additional Areas / Items</span>
                          <div className="flex items-center gap-2">
                            {renderGuideIcon(addKey)}
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
                                {items.map((it, idx) => (
                                  <ChecklistRow
                                    key={idx}
                                    item={it}
                                    idx={idx}
                                    onUpdate={updateAdditionalItem}
                                    onAddPhoto={isCompleted ? undefined : addPhotoToAdditional}
                                    onRemovePhoto={isCompleted ? undefined : removePhotoFromAdditional}
                                    readonly={isCompleted}
                                    editableName
                                  />
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )
                  })()}

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
                    {(() => {
                      const c = checklistData.overallCondition
                      const colorClass =
                        c === 'EXCELLENT' ? 'border-green-500 bg-green-50 text-green-800' :
                        c === 'GOOD'      ? 'border-green-400 bg-green-50 text-green-700' :
                        c === 'FAIR'      ? 'border-yellow-500 bg-yellow-50 text-yellow-800' :
                                            'border-red-500 bg-red-50 text-red-800'
                      return (
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center px-4 py-1.5 rounded-full border text-sm font-semibold ${colorClass}`}>
                            {c ? c.charAt(0) + c.slice(1).toLowerCase() : '—'}
                          </span>
                          {!isCompleted && (
                            <span className="text-xs text-neutral-400 italic">Auto-calculated from condition codes above</span>
                          )}
                        </div>
                      )
                    })()}

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
                    {selectedInspection.tenant && (
                      <span className="text-sm text-neutral-600">
                        Tenant: <Link href={`/admin/tenants/${selectedInspection.tenant.id}`} className="font-semibold hover:text-primary-600 hover:underline">{selectedInspection.tenant.name}</Link>
                      </span>
                    )}
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
              {isCompleted && isChecklist && (
                <div className="flex items-center gap-2 flex-wrap mr-auto">
                  <Button variant="outline" size="sm"
                    onClick={() => window.open(`/api/inspections/${selectedInspection.id}/report`, '_blank')}>
                    Download Report
                  </Button>
                  {!showEmailForm ? (
                    <Button variant="outline" size="sm" onClick={() => setShowEmailForm(true)}>
                      Email Report
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        value={emailTo}
                        onChange={e => setEmailTo(e.target.value)}
                        placeholder="Recipient email"
                        className="text-xs border border-neutral-300 rounded px-2 py-1.5 w-48 focus:ring-1 focus:ring-primary-500"
                        onKeyDown={e => e.key === 'Enter' && handleEmailReport()}
                      />
                      <Button variant="primary" size="sm" onClick={handleEmailReport} disabled={emailLoading || !emailTo.trim()}>
                        {emailLoading ? 'Sending...' : 'Send'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setShowEmailForm(false); setEmailTo('') }}>✕</Button>
                    </div>
                  )}
                </div>
              )}
              {isCompleted && (selectedInspection.type === 'MOVE_OUT' || selectedInspection.type === 'PRE_MOVE_OUT') && (
                <>
                  <Button variant="primary" size="sm" onClick={() => setQuotePanelOpen(true)}>
                    Repairs Quote
                  </Button>
                  {selectedInspection.leaseId && (
                    <Button variant="outline" size="sm" onClick={() => setClearancePanelOpen(true)}>
                      Clearance to Vacate
                    </Button>
                  )}
                </>
              )}
              {!isCompleted && !isCancelled && (
                <>
                  <Button variant="outline" onClick={saveProgress}>Save Progress</Button>
                  <Button variant="outline" onClick={handleEmailResumeLink} disabled={resumeLinkLoading}>
                    {resumeLinkLoading ? 'Sending...' : 'Email Me a Resume Link'}
                  </Button>
                  {!showCompleteConfirm ? (
                    <Button
                      variant="success"
                      onClick={() => inspectorSigData ? setShowCompleteConfirm(true) : setShowInspectorSigPad(true)}
                    >
                      Complete Inspection
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      {inspectorSigData && (
                        <span className="flex items-center gap-1 text-xs text-success-700">
                          <img src={inspectorSigData} alt="Inspector signature" className="h-6 border border-neutral-200 rounded bg-white" />
                          <button type="button" className="underline text-neutral-500" onClick={() => setShowInspectorSigPad(true)}>change</button>
                        </span>
                      )}
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

      {/* ── Move-Out Repairs Quote (Statement of Repair Costs) ─────────────── */}
      {selectedInspection && (
        <MoveOutQuotePanel
          inspectionId={selectedInspection.id}
          open={quotePanelOpen}
          onClose={() => setQuotePanelOpen(false)}
        />
      )}
      {selectedInspection?.leaseId && (
        <ClearancePanel
          leaseId={selectedInspection.leaseId}
          open={clearancePanelOpen}
          onClose={() => setClearancePanelOpen(false)}
        />
      )}

      {/* ── "Quote ready — send to tenant" prompt after move-out completion ── */}
      <Modal open={moveOutQuoteReady} onClose={() => setMoveOutQuoteReady(false)} className="max-w-md">
        <ModalHeader>
          <h2 className="text-lg font-semibold">Inspection completed</h2>
          <button onClick={() => setMoveOutQuoteReady(false)} className="text-neutral-400 hover:text-neutral-600">✕</button>
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-neutral-600">
            A draft <strong>Statement of Repair Costs</strong> has been prepared from the inspection findings.
            Review the costs and send it to the tenant for approval.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setMoveOutQuoteReady(false); setShowDetailModal(false) }}>Later</Button>
          <Button variant="primary" onClick={() => { setMoveOutQuoteReady(false); setQuotePanelOpen(true) }}>
            Review &amp; Send
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── Inspector Signature Modal ──────────────────────────────────────── */}
      <Modal open={showInspectorSigPad} onClose={() => setShowInspectorSigPad(false)} className="max-w-lg">
        <ModalHeader>
          <h2 className="text-lg font-semibold">Inspector Signature</h2>
          <button onClick={() => setShowInspectorSigPad(false)} className="text-neutral-400 hover:text-neutral-600">
            ✕
          </button>
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-neutral-600 mb-3">
            Sign below to confirm you conducted this inspection. Your signature will appear on the inspection report.
          </p>
          <SignaturePad
            label="Inspector sign here"
            onSave={(dataUrl) => {
              setInspectorSigData(dataUrl)
              setShowInspectorSigPad(false)
              setShowCompleteConfirm(true)
            }}
            onCancel={() => setShowInspectorSigPad(false)}
          />
        </ModalBody>
      </Modal>

      {/* ── Validate (Inspector Signature, row action) Modal ──────────────── */}
      <Modal open={!!validateTarget} onClose={() => setValidateTarget(null)} className="max-w-lg">
        <ModalHeader>
          <h2 className="text-lg font-semibold">Validate Inspection</h2>
          <button onClick={() => setValidateTarget(null)} className="text-neutral-400 hover:text-neutral-600">
            ✕
          </button>
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-neutral-600 mb-3">
            {validateTarget?.property?.name}{validateTarget?.unit ? ` — Unit ${validateTarget.unit.unitNumber}` : ''}
            <br />
            Sign below as the inspector to validate this inspection report.
          </p>
          <SignaturePad
            label="Inspector sign here"
            saving={validateLoading}
            onSave={handleValidateSign}
            onCancel={() => setValidateTarget(null)}
          />
        </ModalBody>
      </Modal>

      {/* ── Archive / Delete / Reassess Confirm Modal ───────────────────────── */}
      <Modal open={!!confirmAction} onClose={() => setConfirmAction(null)} className="max-w-sm">
        <ModalHeader>
          <h2 className="text-lg font-semibold">
            {confirmAction?.type === 'archive' ? 'Archive Inspection?' : confirmAction?.type === 'reassess' ? 'Reassess Inspection?' : 'Delete Inspection?'}
          </h2>
          <button onClick={() => setConfirmAction(null)} className="text-neutral-400 hover:text-neutral-600">
            ✕
          </button>
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-neutral-600">
            {confirmAction?.type === 'archive'
              ? 'This will mark the inspection as archived and remove it from active views.'
              : confirmAction?.type === 'reassess'
                ? 'This will archive the current inspection report and create a new inspection for this unit, continuing the reference number sequence.'
                : 'This will permanently delete this inspection and all its data. This action cannot be undone.'}
          </p>
          <p className="text-sm font-medium text-neutral-900 mt-2">
            {confirmAction?.inspection.referenceCode && <span className="text-neutral-500 font-normal">{confirmAction.inspection.referenceCode} — </span>}
            {confirmAction?.inspection.property?.name}
            {confirmAction?.inspection.unit ? ` — Unit ${confirmAction.inspection.unit.unitNumber}` : ''}
          </p>
          {confirmAction?.type === 'delete' && (
            <p className="text-sm text-neutral-500 mt-2">
              Note: the assigned agent and the tenant or landlord on this inspection will be notified by email that it has been cancelled.
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
          <Button
            variant={confirmAction?.type === 'delete' ? 'danger' : 'primary'}
            onClick={handleConfirmAction}
            disabled={confirmLoading}
          >
            {confirmLoading ? 'Working…' : confirmAction?.type === 'archive' ? 'Archive' : confirmAction?.type === 'reassess' ? 'Reassess' : 'Delete'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
