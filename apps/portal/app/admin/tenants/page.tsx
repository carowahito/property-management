'use client'

import { useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'

interface Tenant {
  id: string
  name: string
  email: string
  phone: string
  status: string
  unit: string | null
  property: {
    id: string
    name: string
    address: string
  }
  _count: {
    leases: number
    payments: number
  }
}

interface Property {
  id: string
  name: string
  address: string
  units: number
}

interface TenantFormData {
  firstName: string
  lastName: string
  email: string
  mobilePhone: string
  workPhone: string
  idNumber: string
  kraPin: string
  propertyId: string
  unit: string
  rentAmount: string
  depositAmount: string
  serviceChargeAmount: string
  rentPaymentDeadline: string
  penaltyType: 'percentage' | 'fixed'
  penaltyRate: string
  moveInDate: string
  leaseTerm: string
  leaseStartDate: string
  leaseEndDate: string
  passportPhoto: File | null
  idCopy: File | null
  otherDocuments: Array<{ file: File; description: string }>
  leaseGenerated: boolean
  leaseApproved: boolean
}

interface TenantsResponse {
  tenants: Tenant[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

async function fetchTenants(): Promise<TenantsResponse> {
  const response = await fetch('/api/tenants')
  if (!response.ok) {
    throw new Error('Failed to fetch tenants')
  }
  return response.json()
}

export default function TenantsPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterProperty, setFilterProperty] = useState<string>('all')
  const [showAddTenantModal, setShowAddTenantModal] = useState(false)
  const [otherDocDescription, setOtherDocDescription] = useState('')
  const passportPhotoRef = useRef<HTMLInputElement>(null)
  const idCopyRef = useRef<HTMLInputElement>(null)
  const otherDocRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<TenantFormData>({
    firstName: '',
    lastName: '',
    email: '',
    mobilePhone: '',
    workPhone: '',
    idNumber: '',
    kraPin: '',
    propertyId: '',
    unit: '',
    rentAmount: '',
    depositAmount: '',
    serviceChargeAmount: '',
    rentPaymentDeadline: '5',
    penaltyType: 'percentage',
    penaltyRate: '2',
    moveInDate: '',
    leaseTerm: '12',
    leaseStartDate: '',
    leaseEndDate: '',
    passportPhoto: null,
    idCopy: null,
    otherDocuments: [],
    leaseGenerated: false,
    leaseApproved: false,
  })

  // Fetch properties from API for the dropdown
  const { data: propertiesData } = useQuery({
    queryKey: ['properties-for-dropdown'],
    queryFn: async () => {
      const res = await fetch('/api/properties')
      if (!res.ok) throw new Error('Failed to fetch properties')
      return res.json()
    },
  })

  const availableProperties: Property[] = (propertiesData?.properties || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    address: p.address,
    units: p.totalUnits,
  }))

  // Fetch units for selected property
  const { data: unitsData } = useQuery({
    queryKey: ['units-for-property', formData.propertyId],
    queryFn: async () => {
      const res = await fetch(`/api/units?propertyId=${formData.propertyId}`)
      if (!res.ok) throw new Error('Failed to fetch units')
      return res.json()
    },
    enabled: !!formData.propertyId,
  })

  const propertyUnitsList: string[] = (unitsData?.units || []).map((u: any) => u.unitNumber)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = { ...prev, [name]: value }
      // Reset unit when property changes
      if (name === 'propertyId') {
        updated.unit = ''
      }
      // Auto-calculate lease end date based on lease start date and lease term
      if (name === 'leaseStartDate' || name === 'leaseTerm') {
        const startDate = name === 'leaseStartDate' ? value : prev.leaseStartDate
        const term = name === 'leaseTerm' ? parseInt(value) : parseInt(prev.leaseTerm)
        if (startDate && term) {
          const endDate = new Date(startDate)
          endDate.setMonth(endDate.getMonth() + term)
          updated.leaseEndDate = endDate.toISOString().split('T')[0]
        }
      }
      return updated
    })
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'passportPhoto' | 'idCopy') => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({ ...prev, [field]: file }))
  }
  
  const isFormValid = () => {
    return (
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.mobilePhone.trim() !== '' &&
      formData.idNumber.trim() !== '' &&
      formData.propertyId !== '' &&
      formData.unit !== '' &&
      formData.rentAmount !== '' &&
      formData.depositAmount !== '' &&
      formData.moveInDate !== '' &&
      formData.passportPhoto !== null &&
      formData.idCopy !== null
    )
  }
  
  // Check if all fields needed for lease generation are filled
  const canGenerateLease = () => {
    return isFormValid() && 
      formData.leaseTerm !== '' &&
      formData.leaseStartDate !== '' &&
      formData.leaseEndDate !== '' &&
      formData.penaltyRate !== ''
  }
  
  const handleGenerateLease = () => {
    if (!canGenerateLease()) return
    setFormData(prev => ({ ...prev, leaseGenerated: true }))
    // TODO: Generate lease document
    console.log('Generating lease document...')
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid()) return
    
    // TODO: Submit to API
    console.log('Submitting tenant:', formData)
    setShowAddTenantModal(false)
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      mobilePhone: '',
      workPhone: '',
      idNumber: '',
      kraPin: '',
      propertyId: '',
      unit: '',
      rentAmount: '',
      depositAmount: '',
      serviceChargeAmount: '',
      rentPaymentDeadline: '5',
      penaltyType: 'percentage',
      penaltyRate: '2',
      moveInDate: '',
      leaseTerm: '12',
      leaseStartDate: '',
      leaseEndDate: '',
      passportPhoto: null,
      idCopy: null,
      otherDocuments: [],
      leaseGenerated: false,
      leaseApproved: false,
    })
  }
  
  const handleAddOtherDocument = (file: File, description: string) => {
    setFormData(prev => ({
      ...prev,
      otherDocuments: [...prev.otherDocuments, { file, description }]
    }))
  }
  
  const handleRemoveOtherDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      otherDocuments: prev.otherDocuments.filter((_, i) => i !== index)
    }))
  }
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['tenants'],
    queryFn: fetchTenants,
  })

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
        <p className="text-red-800">Failed to load tenants. Please try again.</p>
      </div>
    )
  }

  const tenants = data?.tenants || []
  
  // Get unique properties for filter
  const properties = Array.from(new Set(tenants.map(t => t.property.name))).sort()
  
  // Apply filters
  const filteredTenants = tenants.filter(tenant => {
    const matchesStatus = filterStatus === 'all' || tenant.status === filterStatus
    const matchesProperty = filterProperty === 'all' || tenant.property.name === filterProperty
    return matchesStatus && matchesProperty
  })
  
  const activeTenants = tenants.filter(t => t.status === 'ACTIVE')
  const pendingTenants = tenants.filter(t => t.status === 'PENDING')

  const stats = [
    { label: 'Total Tenants', value: tenants.length.toString(), change: `${activeTenants.length} active` },
    { label: 'Active Leases', value: activeTenants.length.toString(), change: `${tenants.reduce((sum, t) => sum + t._count.leases, 0)} total leases` },
    { label: 'Pending Move-ins', value: pendingTenants.length.toString(), change: 'Awaiting confirmation' },
    { label: 'Total Payments', value: tenants.reduce((sum, t) => sum + t._count.payments, 0).toString(), change: 'All tenants' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Tenants</h1>
          <p className="text-neutral-600 mt-2">Manage tenant information and leases</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowAddTenantModal(true)}>+ Add Tenant</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-surface rounded-lg border border-neutral-200 p-6">
            <p className="text-sm text-neutral-600">{stat.label}</p>
            <p className="text-3xl font-bold text-neutral-900 mt-2">{stat.value}</p>
            <p className="text-xs text-neutral-500 mt-2">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface rounded-lg border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">All Tenants</h2>
          </div>
          
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-neutral-700 mb-2">Property</label>
              <select
                value={filterProperty}
                onChange={(e) => setFilterProperty(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Properties</option>
                {properties.map(property => (
                  <option key={property} value={property}>{property}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredTenants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500 mb-4">No tenants found</p>
            <Button variant="primary">Add Your First Tenant</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700">Leases</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 text-sm font-medium">
                      <Link href={`/admin/tenants/${tenant.id}`} className="text-primary-600 hover:text-primary-800">
                        {tenant.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{tenant.email}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{tenant.phone}</td>
                    <td className="px-6 py-4 text-sm">
                      <Link href={`/admin/properties/${tenant.property.id}`} className="text-primary-600 hover:text-primary-800">
                        {tenant.property.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{tenant.unit || '-'}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{tenant._count.leases}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        tenant.status === 'ACTIVE' ? 'bg-success-50 text-success-700' :
                        tenant.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700' :
                        tenant.status === 'INACTIVE' ? 'bg-neutral-50 text-neutral-700' :
                        'bg-danger-50 text-danger-700'
                      }`}>
                        {tenant.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Tenant Modal */}
      {showAddTenantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-neutral-900">Add New Tenant</h3>
                <button
                  onClick={() => setShowAddTenantModal(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="border-b border-neutral-200 pb-4">
                  <h4 className="text-lg font-semibold text-neutral-800 mb-4">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">ID Number *</label>
                      <input
                        type="text"
                        name="idNumber"
                        value={formData.idNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Mobile Phone *</label>
                      <input
                        type="tel"
                        name="mobilePhone"
                        value={formData.mobilePhone}
                        onChange={handleInputChange}
                        placeholder="+254 7XX XXX XXX"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Work Phone</label>
                      <input
                        type="tel"
                        name="workPhone"
                        value={formData.workPhone}
                        onChange={handleInputChange}
                        placeholder="+254 2XX XXX XXX"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">KRA / Tax PIN</label>
                      <input
                        type="text"
                        name="kraPin"
                        value={formData.kraPin}
                        onChange={handleInputChange}
                        placeholder="A123456789B"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Property & Unit Assignment */}
                <div className="border-b border-neutral-200 pb-4">
                  <h4 className="text-lg font-semibold text-neutral-800 mb-4">Property & Unit Assignment</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Property *</label>
                      <select
                        name="propertyId"
                        value={formData.propertyId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select property...</option>
                        {availableProperties.map(property => (
                          <option key={property.id} value={property.id}>
                            {property.name} - {property.address}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Unit *</label>
                      <select
                        name="unit"
                        value={formData.unit}
                        onChange={handleInputChange}
                        disabled={!formData.propertyId}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-100 disabled:cursor-not-allowed"
                        required
                      >
                        <option value="">{formData.propertyId ? 'Select unit...' : 'Select property first'}</option>
                        {formData.propertyId && propertyUnitsList.map(unit => (
                          <option key={unit} value={unit}>Unit {unit}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="border-b border-neutral-200 pb-4">
                  <h4 className="text-lg font-semibold text-neutral-800 mb-4">Financial Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Rent Amount (KES) *</label>
                      <input
                        type="number"
                        name="rentAmount"
                        value={formData.rentAmount}
                        onChange={handleInputChange}
                        placeholder="40000"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Deposit Amount (KES) *</label>
                      <input
                        type="number"
                        name="depositAmount"
                        value={formData.depositAmount}
                        onChange={handleInputChange}
                        placeholder="40000"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Service Charge (KES)</label>
                      <input
                        type="number"
                        name="serviceChargeAmount"
                        value={formData.serviceChargeAmount}
                        onChange={handleInputChange}
                        placeholder="5000"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Rent Payment Deadline *</label>
                      <select
                        name="rentPaymentDeadline"
                        value={formData.rentPaymentDeadline}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      >
                        {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                          <option key={day} value={day}>{day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of each month</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Late Payment Penalty Type *</label>
                      <select
                        name="penaltyType"
                        value={formData.penaltyType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      >
                        <option value="percentage">Percentage (% of rent per day)</option>
                        <option value="fixed">Fixed Amount (KES per day)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Late Payment Penalty Rate {formData.penaltyType === 'percentage' ? '(%)' : '(KES)'} *
                      </label>
                      <input
                        type="number"
                        name="penaltyRate"
                        value={formData.penaltyRate}
                        onChange={handleInputChange}
                        step={formData.penaltyType === 'percentage' ? '0.1' : '1'}
                        min="0"
                        max={formData.penaltyType === 'percentage' ? '100' : '10000'}
                        placeholder={formData.penaltyType === 'percentage' ? '2' : '500'}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        {formData.penaltyType === 'percentage' 
                          ? 'Daily percentage of rent applied for each day past the deadline' 
                          : 'Fixed daily amount charged for each day past the deadline'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lease Details */}
                <div className="border-b border-neutral-200 pb-4">
                  <h4 className="text-lg font-semibold text-neutral-800 mb-4">Lease Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Move-in Date *</label>
                      <input
                        type="date"
                        name="moveInDate"
                        value={formData.moveInDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Lease Term *</label>
                      <select
                        name="leaseTerm"
                        value={formData.leaseTerm}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      >
                        <option value="6">6 months</option>
                        <option value="12">12 months (1 year)</option>
                        <option value="18">18 months</option>
                        <option value="24">24 months (2 years)</option>
                        <option value="36">36 months (3 years)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Lease Start Date *</label>
                      <input
                        type="date"
                        name="leaseStartDate"
                        value={formData.leaseStartDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Lease End Date</label>
                      <input
                        type="date"
                        name="leaseEndDate"
                        value={formData.leaseEndDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-neutral-50"
                        readOnly
                      />
                      <p className="text-xs text-neutral-500 mt-1">Auto-calculated from lease start date + lease term</p>
                    </div>
                  </div>
                </div>

                {/* Document Uploads */}
                <div className="border-b border-neutral-200 pb-4">
                  <h4 className="text-lg font-semibold text-neutral-800 mb-4">Document Uploads</h4>
                  
                  {/* Required Documents */}
                  <p className="text-sm text-neutral-600 mb-3">Required Documents</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Passport Photo <span className="text-danger-500">*</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          ref={passportPhotoRef}
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'passportPhoto')}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => passportPhotoRef.current?.click()}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50 transition-colors text-left"
                        >
                          {formData.passportPhoto ? (
                            <span className="text-neutral-900">{formData.passportPhoto.name}</span>
                          ) : (
                            <span className="text-neutral-400">Choose file...</span>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">JPG, PNG (max 5MB)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Copy of National ID <span className="text-danger-500">*</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          ref={idCopyRef}
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange(e, 'idCopy')}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => idCopyRef.current?.click()}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50 transition-colors text-left"
                        >
                          {formData.idCopy ? (
                            <span className="text-neutral-900">{formData.idCopy.name}</span>
                          ) : (
                            <span className="text-neutral-400">Choose file...</span>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">JPG, PNG, PDF (max 5MB)</p>
                    </div>
                  </div>
                  
                  {/* Other Documents */}
                  <p className="text-sm text-neutral-600 mb-3">Other Documents (Optional)</p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-1">
                        <input
                          type="file"
                          ref={otherDocRef}
                          accept="image/*,.pdf,.doc,.docx"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file && otherDocDescription.trim()) {
                              handleAddOtherDocument(file, otherDocDescription)
                              setOtherDocDescription('')
                              if (otherDocRef.current) otherDocRef.current.value = ''
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (otherDocDescription.trim()) {
                              otherDocRef.current?.click()
                            }
                          }}
                          disabled={!otherDocDescription.trim()}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50 transition-colors text-left disabled:bg-neutral-100 disabled:cursor-not-allowed"
                        >
                          <span className="text-neutral-400">Choose file...</span>
                        </button>
                      </div>
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          value={otherDocDescription}
                          onChange={(e) => setOtherDocDescription(e.target.value)}
                          placeholder="Document description (e.g., Employment letter, Bank statement)"
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500">Enter a description first, then click to upload the document</p>
                    
                    {/* List of uploaded other documents */}
                    {formData.otherDocuments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-neutral-700">Uploaded Documents:</p>
                        {formData.otherDocuments.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between bg-neutral-50 px-3 py-2 rounded-lg">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-sm text-neutral-700">{doc.file.name}</span>
                              <span className="text-xs text-neutral-500">({doc.description})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveOtherDocument(index)}
                              className="text-danger-500 hover:text-danger-700"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Lease Generation */}
                <div className="border-b border-neutral-200 pb-4">
                  <h4 className="text-lg font-semibold text-neutral-800 mb-4">Lease Document</h4>
                  
                  {!formData.leaseGenerated ? (
                    <div className="bg-neutral-50 rounded-lg p-4">
                      <p className="text-sm text-neutral-600 mb-3">
                        Generate a lease document after filling in all required tenant and lease information.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!canGenerateLease()}
                        onClick={handleGenerateLease}
                        className="w-full"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Generate Lease Document
                      </Button>
                      {!canGenerateLease() && (
                        <p className="text-xs text-warning-600 mt-2">
                          Please fill in all required fields including: personal info, property/unit, financial details, 
                          move-in date, lease term, and upload required documents before generating the lease.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-success-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium text-green-800">Lease Document Generated</span>
                        </div>
                        <p className="text-sm text-success-700 mt-2">
                          The lease document has been generated and is ready for admin approval.
                        </p>
                      </div>
                      
                      <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-warning-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <div>
                            <span className="text-sm font-medium text-warning-800">Pending Admin Approval</span>
                            <p className="text-sm text-warning-700 mt-1">
                              The lease will not be sent to the tenant until an administrator has reviewed and approved it.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Preview Lease
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setFormData(prev => ({ ...prev, leaseGenerated: false }))}
                          className="flex-1"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddTenantModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!isFormValid()}
                    className="flex-1"
                  >
                    Add Tenant
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
