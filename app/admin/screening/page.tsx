'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

// ─── Types ──────────────────────────────────────────────────────────

interface TenantApplication {
  id: string
  propertyId: string
  unitId: string | null
  fullName: string
  email: string
  phone: string
  idNumber: string
  currentAddress: string | null
  employer: string | null
  jobTitle: string | null
  monthlyIncome: string | number | null
  employmentDuration: string | null
  previousLandlord: string | null
  previousLandlordPhone: string | null
  personalReference: string | null
  personalReferencePhone: string | null
  status: string
  incomeCheckPassed: boolean | null
  crbCheckStatus: string | null
  crbCheckDate: string | null
  employerVerified: boolean | null
  employerVerifyNotes: string | null
  landlordRefChecked: boolean | null
  landlordRefNotes: string | null
  screeningNotes: string | null
  decidedBy: string | null
  decidedAt: string | null
  landlordApproved: boolean | null
  landlordApprovalDate: string | null
  convertedTenantId: string | null
  createdAt: string
  updatedAt: string
  property: {
    id: string
    name: string
    address: string
  }
  unit: {
    id: string
    unitNumber: string
    monthlyRent: string | number | null
  } | null
}

interface ApplicationsResponse {
  applications: TenantApplication[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface Property {
  id: string
  name: string
}

interface Unit {
  id: string
  unitNumber: string
  monthlyRent: string | number | null
}

// ─── Helpers ────────────────────────────────────────────────────────

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'DOCUMENTS_PENDING', label: 'Documents Pending' },
  { value: 'SCREENING', label: 'Screening' },
  { value: 'LANDLORD_REVIEW', label: 'Landlord Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
]

function statusBadgeVariant(status: string): 'primary' | 'success' | 'danger' | 'warning' | 'neutral' {
  switch (status) {
    case 'SUBMITTED': return 'primary'
    case 'DOCUMENTS_PENDING': return 'warning'
    case 'SCREENING': return 'primary'
    case 'LANDLORD_REVIEW': return 'warning'
    case 'APPROVED': return 'success'
    case 'REJECTED': return 'danger'
    case 'CONVERTED': return 'success'
    case 'WITHDRAWN': return 'neutral'
    default: return 'neutral'
  }
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

function formatCurrency(amount: string | number | null): string {
  if (amount === null || amount === undefined) return '-'
  return `KES ${Number(amount).toLocaleString()}`
}

// ─── API Functions ──────────────────────────────────────────────────

async function fetchApplications(status: string): Promise<ApplicationsResponse> {
  const params = new URLSearchParams()
  if (status !== 'all') params.set('status', status)
  params.set('limit', '100')
  const res = await fetch(`/api/tenant-applications?${params}`)
  if (!res.ok) throw new Error('Failed to fetch applications')
  return res.json()
}

async function fetchProperties(): Promise<{ properties: Property[] }> {
  const res = await fetch('/api/properties?limit=200')
  if (!res.ok) throw new Error('Failed to fetch properties')
  return res.json()
}

async function fetchUnits(propertyId: string): Promise<{ units: Unit[] }> {
  const res = await fetch(`/api/units?propertyId=${propertyId}`)
  if (!res.ok) throw new Error('Failed to fetch units')
  return res.json()
}

// ─── Component ──────────────────────────────────────────────────────

export default function ScreeningPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('all')
  const [selectedApp, setSelectedApp] = useState<TenantApplication | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState(false)

  // ─── Queries ────────────────────────────────────────────

  const { data, isLoading, error } = useQuery({
    queryKey: ['tenant-applications', activeTab],
    queryFn: () => fetchApplications(activeTab),
  })

  const { data: propertiesData } = useQuery({
    queryKey: ['properties-for-dropdown'],
    queryFn: fetchProperties,
  })

  const applications = data?.applications || []
  const properties = propertiesData?.properties || []

  // ─── Stats ──────────────────────────────────────────────

  const { data: allData } = useQuery({
    queryKey: ['tenant-applications', 'all'],
    queryFn: () => fetchApplications('all'),
  })

  const allApps = allData?.applications || []
  const stats = [
    { label: 'Total Applications', value: allApps.length, color: 'text-primary-600' },
    { label: 'In Screening', value: allApps.filter(a => a.status === 'SCREENING').length, color: 'text-primary-600' },
    { label: 'Approved', value: allApps.filter(a => a.status === 'APPROVED').length, color: 'text-success-600' },
    { label: 'Rejected', value: allApps.filter(a => a.status === 'REJECTED').length, color: 'text-danger-600' },
  ]

  // ─── Mutations ──────────────────────────────────────────

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/tenant-applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update')
      }
      return res.json()
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['tenant-applications'] })
      setSelectedApp(updated)
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/tenant-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-applications'] })
      setShowNewModal(false)
    },
  })

  const convertMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/tenant-applications/${id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to convert')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-applications'] })
      setShowConvertModal(false)
      setShowDetailModal(false)
      setSelectedApp(null)
    },
  })

  // ─── Loading / Error States ────────────────────────────

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
        <p className="text-red-800">Failed to load applications. Please try again.</p>
      </div>
    )
  }

  // ─── Render ─────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Tenant Screening</h1>
          <p className="text-neutral-600 mt-2">Review applications and manage the screening pipeline</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowNewModal(true)}>
          + New Application
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-surface rounded-lg border border-neutral-200 p-6">
            <p className="text-sm text-neutral-600">{stat.label}</p>
            <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-surface rounded-lg border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <div className="flex gap-2 flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
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

        {/* Applications Table */}
        {applications.length === 0 ? (
          <EmptyState
            title="No applications found"
            description={activeTab === 'all' ? 'Create a new application to get started.' : `No applications with status "${activeTab}".`}
            action={
              <Button variant="primary" onClick={() => setShowNewModal(true)}>
                + New Application
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700">Property / Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700">Monthly Income</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700">Days</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{app.fullName}</p>
                        <p className="text-xs text-neutral-500">{app.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {app.property.name}
                      {app.unit && <span className="text-neutral-400"> / {app.unit.unitNumber}</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {formatCurrency(app.monthlyIncome)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusBadgeVariant(app.status)} size="sm">
                        {app.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-500">
                      {daysSince(app.createdAt)}d
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedApp(app)
                          setShowDetailModal(true)
                        }}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── New Application Modal ─────────────────────────── */}
      <NewApplicationModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        properties={properties}
        onSubmit={(data) => createMutation.mutate(data)}
        isSubmitting={createMutation.isPending}
      />

      {/* ─── Application Detail / Screening Modal ─────────── */}
      {selectedApp && (
        <ApplicationDetailModal
          open={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedApp(null)
          }}
          application={selectedApp}
          onUpdate={(data) => updateMutation.mutate({ id: selectedApp.id, data })}
          isUpdating={updateMutation.isPending}
          onConvertClick={() => setShowConvertModal(true)}
        />
      )}

      {/* ─── Convert to Tenant Modal ──────────────────────── */}
      {selectedApp && (
        <ConvertModal
          open={showConvertModal}
          onClose={() => setShowConvertModal(false)}
          application={selectedApp}
          onConvert={(data) => convertMutation.mutate({ id: selectedApp.id, data })}
          isConverting={convertMutation.isPending}
        />
      )}
    </div>
  )
}

// ─── New Application Modal ──────────────────────────────────────────

function NewApplicationModal({
  open,
  onClose,
  properties,
  onSubmit,
  isSubmitting,
}: {
  open: boolean
  onClose: () => void
  properties: Property[]
  onSubmit: (data: any) => void
  isSubmitting: boolean
}) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    idNumber: '',
    currentAddress: '',
    propertyId: '',
    unitId: '',
    employer: '',
    jobTitle: '',
    monthlyIncome: '',
    employmentDuration: '',
    previousLandlord: '',
    previousLandlordPhone: '',
    personalReference: '',
    personalReferencePhone: '',
  })

  const { data: unitsData } = useQuery({
    queryKey: ['units-for-property', form.propertyId],
    queryFn: () => fetchUnits(form.propertyId),
    enabled: !!form.propertyId,
  })

  const units: Unit[] = unitsData?.units || []

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => {
      const updated = { ...prev, [name]: value }
      if (name === 'propertyId') updated.unitId = ''
      return updated
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...form,
      monthlyIncome: form.monthlyIncome ? Number(form.monthlyIncome) : null,
      unitId: form.unitId || null,
      currentAddress: form.currentAddress || null,
      employer: form.employer || null,
      jobTitle: form.jobTitle || null,
      employmentDuration: form.employmentDuration || null,
      previousLandlord: form.previousLandlord || null,
      previousLandlordPhone: form.previousLandlordPhone || null,
      personalReference: form.personalReference || null,
      personalReferencePhone: form.personalReferencePhone || null,
    })
  }

  return (
    <Modal open={open} onClose={onClose} className="max-w-2xl">
      <ModalHeader>
        <h2 className="text-xl font-bold text-neutral-900">New Application</h2>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </ModalHeader>

      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-5">
          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name *</label>
                <input
                  type="text" name="fullName" value={form.fullName} onChange={handleChange} required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">ID Number *</label>
                <input
                  type="text" name="idNumber" value={form.idNumber} onChange={handleChange} required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email *</label>
                <input
                  type="email" name="email" value={form.email} onChange={handleChange} required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Phone *</label>
                <input
                  type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="+254 7XX XXX XXX"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Current Address</label>
                <input
                  type="text" name="currentAddress" value={form.currentAddress} onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Property & Unit */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">Property</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Property *</label>
                <select
                  name="propertyId" value={form.propertyId} onChange={handleChange} required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select property</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Unit</label>
                <select
                  name="unitId" value={form.unitId} onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={!form.propertyId}
                >
                  <option value="">Select unit (optional)</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.unitNumber} {u.monthlyRent ? `- ${formatCurrency(u.monthlyRent)}/mo` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Employment */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">Employment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Employer</label>
                <input
                  type="text" name="employer" value={form.employer} onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Job Title</label>
                <input
                  type="text" name="jobTitle" value={form.jobTitle} onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Monthly Income (KES)</label>
                <input
                  type="number" name="monthlyIncome" value={form.monthlyIncome} onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Employment Duration</label>
                <input
                  type="text" name="employmentDuration" value={form.employmentDuration} onChange={handleChange}
                  placeholder="e.g., 2 years"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* References */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">References</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Previous Landlord</label>
                <input
                  type="text" name="previousLandlord" value={form.previousLandlord} onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Previous Landlord Phone</label>
                <input
                  type="tel" name="previousLandlordPhone" value={form.previousLandlordPhone} onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Personal Reference</label>
                <input
                  type="text" name="personalReference" value={form.personalReference} onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Personal Reference Phone</label>
                <input
                  type="tel" name="personalReferencePhone" value={form.personalReferencePhone} onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

// ─── Application Detail / Screening Modal ───────────────────────────

function ApplicationDetailModal({
  open,
  onClose,
  application,
  onUpdate,
  isUpdating,
  onConvertClick,
}: {
  open: boolean
  onClose: () => void
  application: TenantApplication
  onUpdate: (data: any) => void
  isUpdating: boolean
  onConvertClick: () => void
}) {
  const app = application
  const unitRent = app.unit?.monthlyRent ? Number(app.unit.monthlyRent) : null
  const income = app.monthlyIncome ? Number(app.monthlyIncome) : null

  const [crbStatus, setCrbStatus] = useState(app.crbCheckStatus || '')
  const [employerVerified, setEmployerVerified] = useState(app.employerVerified ?? false)
  const [employerNotes, setEmployerNotes] = useState(app.employerVerifyNotes || '')
  const [landlordChecked, setLandlordChecked] = useState(app.landlordRefChecked ?? false)
  const [landlordNotes, setLandlordNotes] = useState(app.landlordRefNotes || '')
  const [screeningNotes, setScreeningNotes] = useState(app.screeningNotes || '')

  const handleSaveScreening = () => {
    onUpdate({
      crbCheckStatus: crbStatus || null,
      crbCheckDate: crbStatus ? new Date().toISOString() : null,
      employerVerified,
      employerVerifyNotes: employerNotes || null,
      landlordRefChecked: landlordChecked,
      landlordRefNotes: landlordNotes || null,
      screeningNotes: screeningNotes || null,
      status: 'SCREENING',
    })
  }

  const handleStatusChange = (newStatus: string) => {
    onUpdate({ status: newStatus })
  }

  const isTerminal = ['CONVERTED', 'REJECTED', 'WITHDRAWN'].includes(app.status)

  return (
    <Modal open={open} onClose={onClose} className="max-w-3xl">
      <ModalHeader>
        <div>
          <h2 className="text-xl font-bold text-neutral-900">{app.fullName}</h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            {app.property.name}
            {app.unit && ` / ${app.unit.unitNumber}`}
            {' '}&middot;{' '}Applied {daysSince(app.createdAt)} days ago
          </p>
        </div>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </ModalHeader>

      <ModalBody className="space-y-5">
        {/* Current Status */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-neutral-700">Status:</span>
          <Badge variant={statusBadgeVariant(app.status)} size="lg">
            {app.status.replace(/_/g, ' ')}
          </Badge>
        </div>

        {/* Applicant Details */}
        <div className="bg-neutral-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">Applicant Details</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div><span className="text-neutral-500">Email:</span> <span className="text-neutral-900">{app.email}</span></div>
            <div><span className="text-neutral-500">Phone:</span> <span className="text-neutral-900">{app.phone}</span></div>
            <div><span className="text-neutral-500">ID Number:</span> <span className="text-neutral-900">{app.idNumber}</span></div>
            <div><span className="text-neutral-500">Address:</span> <span className="text-neutral-900">{app.currentAddress || '-'}</span></div>
            <div><span className="text-neutral-500">Employer:</span> <span className="text-neutral-900">{app.employer || '-'}</span></div>
            <div><span className="text-neutral-500">Job Title:</span> <span className="text-neutral-900">{app.jobTitle || '-'}</span></div>
            <div><span className="text-neutral-500">Monthly Income:</span> <span className="text-neutral-900">{formatCurrency(app.monthlyIncome)}</span></div>
            <div><span className="text-neutral-500">Employment Duration:</span> <span className="text-neutral-900">{app.employmentDuration || '-'}</span></div>
          </div>
        </div>

        {/* Screening Checklist */}
        {!isTerminal && (
          <div className="border border-neutral-200 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-semibold text-neutral-700">Screening Checklist</h3>

            {/* Income Check (auto) */}
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${
                  app.incomeCheckPassed === true ? 'bg-success-100 text-success-700' :
                  app.incomeCheckPassed === false ? 'bg-danger-100 text-danger-700' :
                  'bg-neutral-100 text-neutral-400'
                }`}>
                  {app.incomeCheckPassed === true ? '\u2713' : app.incomeCheckPassed === false ? '\u2717' : '?'}
                </span>
                <span className="text-sm text-neutral-900">Income Check (auto: income &ge; 3x rent)</span>
              </div>
              <span className="text-xs text-neutral-500">
                {income !== null && unitRent !== null
                  ? `${formatCurrency(income)} vs ${formatCurrency(unitRent * 3)} required`
                  : 'Not enough data'}
              </span>
            </div>

            {/* CRB Check */}
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${
                  crbStatus === 'PASS' ? 'bg-success-100 text-success-700' :
                  crbStatus === 'FAIL' ? 'bg-danger-100 text-danger-700' :
                  crbStatus === 'REFER' ? 'bg-warning-100 text-warning-700' :
                  'bg-neutral-100 text-neutral-400'
                }`}>
                  {crbStatus === 'PASS' ? '\u2713' : crbStatus === 'FAIL' ? '\u2717' : crbStatus === 'REFER' ? '!' : '?'}
                </span>
                <span className="text-sm text-neutral-900">CRB Check</span>
              </div>
              <select
                value={crbStatus}
                onChange={(e) => setCrbStatus(e.target.value)}
                className="px-2 py-1 text-sm border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Not checked</option>
                <option value="PASS">Pass</option>
                <option value="REFER">Refer</option>
                <option value="FAIL">Fail</option>
              </select>
            </div>

            {/* Employer Verification */}
            <div className="py-2 border-b border-neutral-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={employerVerified}
                      onChange={(e) => setEmployerVerified(e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-900">Employer Verification</span>
                  </label>
                </div>
              </div>
              <input
                type="text"
                value={employerNotes}
                onChange={(e) => setEmployerNotes(e.target.value)}
                placeholder="Verification notes..."
                className="mt-2 w-full px-3 py-1.5 text-sm border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Previous Landlord Reference */}
            <div className="py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={landlordChecked}
                      onChange={(e) => setLandlordChecked(e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-900">Previous Landlord Reference</span>
                  </label>
                </div>
                {app.previousLandlord && (
                  <span className="text-xs text-neutral-500">
                    {app.previousLandlord} ({app.previousLandlordPhone || 'no phone'})
                  </span>
                )}
              </div>
              <input
                type="text"
                value={landlordNotes}
                onChange={(e) => setLandlordNotes(e.target.value)}
                placeholder="Reference notes..."
                className="mt-2 w-full px-3 py-1.5 text-sm border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Screening Notes */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Screening Notes</label>
              <textarea
                value={screeningNotes}
                onChange={(e) => setScreeningNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Additional screening notes..."
              />
            </div>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={handleSaveScreening} disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Screening'}
              </Button>
            </div>
          </div>
        )}

        {/* Decision info if decided */}
        {app.decidedBy && (
          <div className="bg-neutral-50 rounded-lg p-4 text-sm">
            <p className="text-neutral-500">
              Decision by <span className="text-neutral-900 font-medium">{app.decidedBy}</span>
              {app.decidedAt && ` on ${new Date(app.decidedAt).toLocaleDateString()}`}
            </p>
          </div>
        )}
      </ModalBody>

      {!isTerminal && (
        <ModalFooter>
          <div className="flex gap-2 w-full justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange('REJECTED')}
                disabled={isUpdating}
                className="text-danger-600 border-danger-300 hover:bg-danger-50"
              >
                Reject
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange('LANDLORD_REVIEW')}
                disabled={isUpdating}
              >
                Send to Landlord
              </Button>
            </div>
            <div className="flex gap-2">
              {app.status !== 'APPROVED' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleStatusChange('APPROVED')}
                  disabled={isUpdating}
                >
                  Approve
                </Button>
              )}
              {app.status === 'APPROVED' && !app.convertedTenantId && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onConvertClick}
                  disabled={isUpdating}
                >
                  Convert to Tenant
                </Button>
              )}
            </div>
          </div>
        </ModalFooter>
      )}
    </Modal>
  )
}

// ─── Convert to Tenant Modal ────────────────────────────────────────

function ConvertModal({
  open,
  onClose,
  application,
  onConvert,
  isConverting,
}: {
  open: boolean
  onClose: () => void
  application: TenantApplication
  onConvert: (data: any) => void
  isConverting: boolean
}) {
  const today = new Date().toISOString().split('T')[0]
  const oneYearLater = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]

  const [leaseStart, setLeaseStart] = useState(today)
  const [leaseEnd, setLeaseEnd] = useState(oneYearLater)
  const [securityDeposit, setSecurityDeposit] = useState(
    application.unit?.monthlyRent ? String(Number(application.unit.monthlyRent)) : ''
  )

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault()
    onConvert({
      leaseStartDate: leaseStart,
      leaseEndDate: leaseEnd,
      securityDeposit: securityDeposit ? Number(securityDeposit) : undefined,
    })
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader>
        <h2 className="text-xl font-bold text-neutral-900">Convert to Tenant</h2>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </ModalHeader>

      <form onSubmit={handleConvert}>
        <ModalBody className="space-y-4">
          <p className="text-sm text-neutral-600">
            This will create a <span className="font-medium text-neutral-900">Tenant</span> record and a new <span className="font-medium text-neutral-900">Lease</span> for{' '}
            <span className="font-semibold">{application.fullName}</span>.
          </p>

          <div className="bg-neutral-50 rounded-lg p-3 text-sm">
            <p className="text-neutral-700">
              Property: <span className="font-medium">{application.property.name}</span>
              {application.unit && <> / Unit: <span className="font-medium">{application.unit.unitNumber}</span></>}
            </p>
            {application.unit?.monthlyRent && (
              <p className="text-neutral-700 mt-1">
                Monthly Rent: <span className="font-medium">{formatCurrency(application.unit.monthlyRent)}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Lease Start</label>
              <input
                type="date" value={leaseStart} onChange={(e) => setLeaseStart(e.target.value)} required
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Lease End</label>
              <input
                type="date" value={leaseEnd} onChange={(e) => setLeaseEnd(e.target.value)} required
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Security Deposit (KES)</label>
            <input
              type="number" value={securityDeposit} onChange={(e) => setSecurityDeposit(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={isConverting}>
            {isConverting ? 'Converting...' : 'Convert & Create Lease'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
