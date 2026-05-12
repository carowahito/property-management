'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface PropertyDetail {
  id: string
  name: string
  address: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  totalUnits: number
  type: string
  status: string
  description?: string
  yearBuilt?: number
  createdAt?: string
  updatedAt?: string
  landlordId?: string
  landlord?: {
    id: string
    name: string
    email?: string
    phone?: string
    bankName?: string
    bankAccount?: string
  }
  tenants: Array<{
    id: string
    name: string
    email?: string
    phone?: string
    status: string
  }>
  leases: Array<{
    id: string
    tenant: { id: string; name: string }
    monthlyRent: number
    startDate: string
    endDate: string
    status: string
  }>
  maintenanceRequests?: Array<{
    id: string
    title: string
    status: string
    priority: string
    createdAt: string
  }>
  _count?: {
    tenants: number
    leases: number
    maintenanceRequests: number
    inspections: number
    viewings: number
  }
}

async function fetchProperty(id: string): Promise<PropertyDetail> {
  const response = await fetch(`/api/properties/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch property')
  }
  return response.json()
}

export default function PropertyDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [showAddUnitModal, setShowAddUnitModal] = useState(false)
  const [showAddLandlordModal, setShowAddLandlordModal] = useState(false)
  const [isImprovingText, setIsImprovingText] = useState(false)
  const [newUnit, setNewUnit] = useState({
    unitNumber: '',
    floor: '',
    bedrooms: '',
    bathrooms: '',
    squareFootage: '',
    monthlyRent: '',
    unitType: 'apartment',
    status: 'vacant',
    description: '',
    amenities: [] as string[],
    landlordId: '',
    serviceCharge: '',
    serviceChargeType: 'FIXED' as 'FIXED' | 'PERCENTAGE',
    managementFee: '',
    managementFeeType: 'PERCENTAGE' as 'FIXED' | 'PERCENTAGE',
  })
  const [newLandlord, setNewLandlord] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    bankName: '',
    accountNumber: '',
  })
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    type: '',
    units: '',
    yearBuilt: '',
    status: '',
    description: '',
    landlordId: '',
  })
  const queryClient = useQueryClient()

  const updatePropertyMutation = useMutation({
    mutationFn: async (formData: any) => {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update property')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', id] })
      setShowEditModal(false)
      alert('Property updated successfully!')
    },
    onError: (error: any) => {
      alert(`Error updating property: ${error.message}`)
    },
  })

  const addUnitMutation = useMutation({
    mutationFn: async (unitData: any) => {
      const response = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unitData),
      })
      const json = await response.json()
      if (!response.ok) throw new Error(json.error || 'Failed to create unit')
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', id] })
      setShowAddUnitModal(false)
      setNewUnit({
        unitNumber: '', floor: '', bedrooms: '', bathrooms: '',
        squareFootage: '', monthlyRent: '', unitType: 'apartment',
        status: 'vacant', description: '', amenities: [], landlordId: '',
        serviceCharge: '', serviceChargeType: 'FIXED',
        managementFee: '', managementFeeType: 'PERCENTAGE',
      })
    },
    onError: (error: any) => {
      alert(`Error creating unit: ${error.message}`)
    },
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => fetchProperty(id),
  })

  const { data: landlordsData } = useQuery({
    queryKey: ['landlords'],
    queryFn: async () => {
      const response = await fetch('/api/landlords')
      if (!response.ok) throw new Error('Failed to fetch landlords')
      return response.json()
    },
  })

  // Initialize edit form with property data when it loads
  useEffect(() => {
    if (data) {
      setEditFormData({
        name: data.name || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        postalCode: data.postalCode || '',
        country: data.country || '',
        type: data.type || '',
        units: String(data.totalUnits || ''),
        yearBuilt: String(data.yearBuilt || ''),
        status: data.status || '',
        description: data.description || '',
        landlordId: data.landlordId || '',
      })
    }
  }, [data])

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
        <p className="text-red-800">Failed to load property details. Please try again.</p>
      </div>
    )
  }

  const property = data

  if (!property) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Property not found.</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-success-100 text-green-800'
      case 'INACTIVE':
        return 'bg-neutral-100 text-neutral-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-neutral-100 text-neutral-800'
    }
  }

  const unitAmenities = [
    'Balcony', 'Air Conditioning', 'Heating', 'Washer/Dryer', 
    'Dishwasher', 'Microwave', 'Refrigerator', 'Walk-in Closet',
    'Hardwood Floors', 'Carpet', 'Tile', 'Fireplace',
    'High Ceilings', 'Bay Windows', 'Private Entrance', 'Storage'
  ]

  const handleAddUnit = () => {
    addUnitMutation.mutate({
      unitNumber: newUnit.unitNumber,
      propertyId: id,
      landlordId: newUnit.landlordId,
      floor: newUnit.floor || null,
      bedrooms: newUnit.bedrooms || null,
      bathrooms: newUnit.bathrooms || null,
      sizeSqm: newUnit.squareFootage || null,
      monthlyRent: newUnit.monthlyRent,
      serviceCharge: newUnit.serviceCharge || null,
      serviceChargeType: newUnit.serviceChargeType,
      managementFee: newUnit.managementFee || null,
      managementFeeType: newUnit.managementFeeType,
      status: newUnit.status,
      description: newUnit.description || null,
    })
  }

  const handleAddLandlord = () => {
    // TODO: API call to create landlord
    console.log('Creating landlord:', newLandlord)
    // After successful creation, set the new landlord as selected
    // For now, just close the modal and reset
    setShowAddLandlordModal(false)
    setNewLandlord({
      name: '',
      email: '',
      phone: '',
      address: '',
      taxId: '',
      bankName: '',
      accountNumber: '',
    })
    // TODO: Refetch landlords and set newUnit.landlordId to the newly created landlord's ID
  }

  const handleImproveWithAI = async () => {
    setIsImprovingText(true)
    
    // Simulate AI API call - in production, this would call your LLM API configured in settings
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    if (newUnit.description) {
      const improved = newUnit.description + '\n\nEnhanced with professional details highlighting unit features and amenities.'
      setNewUnit({ ...newUnit, description: improved })
    }
    
    setIsImprovingText(false)
  }

  const toggleUnitAmenity = (amenity: string) => {
    setNewUnit(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const landlords = landlordsData?.landlords || []
  
  // Get unique landlords who own units in this property (from leases/tenants data)
  const propertyLandlords = property ? 
    Array.from(new Set(
      property.leases
        .map(lease => lease.tenant.id)
        .filter(Boolean)
    )).map(id => {
      return landlords.find((l: any) => l.id === id)
    }).filter(Boolean)
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface rounded-lg border border-neutral-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-primary-600 rounded-lg flex items-center justify-center text-white text-3xl font-bold">
              {property.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">{property.name}</h1>
              <p className="text-neutral-600 mt-1">
                📍 {property.address}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(property.status)}`}>
                  {property.status}
                </span>
                <span className="text-sm text-neutral-600">
                  {property.type} • Built {property.yearBuilt}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowEditModal(true)}>Edit Property</Button>
            <Button variant="primary" onClick={() => setShowAddUnitModal(true)}>+ Add Unit</Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600">Total Units</p>
          <p className="text-3xl font-bold text-primary-600 mt-2">{property.totalUnits}</p>
          <p className="text-xs text-neutral-500 mt-1">{property.type}</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600">Occupied Units</p>
          <p className="text-3xl font-bold text-success-600 mt-2">{property.tenants.length}</p>
          <p className="text-xs text-neutral-500 mt-1">{property.totalUnits - property.tenants.length} vacant</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600">Occupancy Rate</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {property.totalUnits > 0 ? Math.round((property.tenants.length / property.totalUnits) * 100) : 0}%
          </p>
          <p className="text-xs text-neutral-500 mt-1">Current rate</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600">Monthly Revenue</p>
          <p className="text-3xl font-bold text-warning-600 mt-2">
            KES {property.leases.reduce((sum, lease) => sum + Number(lease.monthlyRent), 0).toLocaleString()}
          </p>
          <p className="text-xs text-neutral-500 mt-1">{property._count?.leases || 0} active leases</p>
        </div>
      </div>

      {/* Property Owners */}
      <div className="bg-surface rounded-lg border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-neutral-900">Property Owners ({landlords.length})</h2>
          <p className="text-sm text-neutral-600">Multiple landlords can own units in this property</p>
        </div>
        
        {landlords.length === 0 ? (
          <div className="text-center py-8 bg-neutral-50 rounded-lg">
            <p className="text-neutral-500 mb-2">No landlords assigned to units yet</p>
            <p className="text-xs text-neutral-400">Landlords will be listed here when units are assigned to them</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {landlords.slice(0, 6).map((landlord: any) => (
              <Link
                key={landlord.id}
                href={`/admin/landlords/${landlord.id}`}
                className="flex items-center gap-3 p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-primary-300 transition"
              >
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {landlord.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-900 truncate">{landlord.name}</p>
                  <p className="text-xs text-neutral-600 truncate">{landlord.email}</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {landlord._count?.properties || 0} {landlord._count?.properties === 1 ? 'property' : 'properties'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {landlords.length > 6 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-neutral-600">
              Showing 6 of {landlords.length} landlords. 
              <Link href="/admin/landlords" className="text-primary-600 hover:text-primary-800 ml-1">
                View all
              </Link>
            </p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-neutral-200">
          {property.landlord ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-sm font-semibold flex-shrink-0">
                {property.landlord.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wide">Primary Contact</p>
                <Link 
                  href={`/admin/landlords/${property.landlordId}`}
                  className="text-lg font-semibold text-primary-600 hover:text-primary-800 hover:underline"
                >
                  {property.landlord.name}
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-500">No primary landlord assigned</p>
          )}
        </div>
      </div>

      {/* Location Details */}
      <div className="bg-surface rounded-lg border border-neutral-200 p-6">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">Location & Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-neutral-600">Address</p>
            <p className="text-lg font-medium text-neutral-900">{property.address}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-600">Property Type</p>
            <p className="text-lg font-medium text-neutral-900">{property.type}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-600">Year Built</p>
            <p className="text-lg font-medium text-neutral-900">{property.yearBuilt || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-600">Total Units</p>
            <p className="text-lg font-medium text-neutral-900">{property.totalUnits} units</p>
          </div>
        </div>
      </div>

      {/* Current Tenants */}
      <div className="bg-surface rounded-lg border border-neutral-200 p-6">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">Current Tenants ({property.tenants.length})</h2>
        
        {property.tenants.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-neutral-500">No tenants currently</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700">Tenant</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {property.tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <Link 
                        href={`/admin/tenants/${tenant.id}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-800 hover:underline"
                      >
                        {tenant.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-neutral-900">{tenant.email}</div>
                      <div className="text-xs text-neutral-500">{tenant.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tenant.status)}`}>
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

      {/* Active Leases */}
      <div className="bg-surface rounded-lg border border-neutral-200 p-6">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">Active Leases ({property.leases.filter(l => l.status === 'ACTIVE').length})</h2>
        
        {property.leases.filter(l => l.status === 'ACTIVE').length === 0 ? (
          <div className="text-center py-8">
            <p className="text-neutral-500">No active leases</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700">Tenant</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700">Monthly Rent</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {property.leases.filter(l => l.status === 'ACTIVE' || l.status === 'Active').map((lease) => (
                  <tr key={lease.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <Link 
                        href={`/admin/tenants/${lease.tenant.id}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-800 hover:underline"
                      >
                        {lease.tenant.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-neutral-900">
                      KES {lease.monthlyRent.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">
                      {new Date(lease.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">
                      {new Date(lease.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lease.status)}`}>
                        {lease.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Units List */}
      <div className="bg-surface rounded-lg border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-neutral-900">
            Units ({((property as any).propertyUnits)?.length ?? 0})
          </h2>
          <Button variant="primary" onClick={() => setShowAddUnitModal(true)}>+ Add Unit</Button>
        </div>

        {!((property as any).propertyUnits)?.length ? (
          <div className="text-center py-10 text-neutral-400">
            <p className="text-lg font-medium">No units yet</p>
            <p className="text-sm mt-1">Click &quot;+ Add Unit&quot; to add the first unit to this property.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Specs</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Rent</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Owner</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Tenant</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {((property as any).propertyUnits).map((unit: any) => (
                  <tr key={unit.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-semibold text-neutral-900">{unit.unitNumber}</td>
                    <td className="px-4 py-3 text-neutral-600">
                      {[unit.bedrooms && `${unit.bedrooms}bd`, unit.bathrooms && `${unit.bathrooms}ba`, unit.floor && `Flr ${unit.floor}`].filter(Boolean).join(' · ') || '—'}
                    </td>
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      KES {unit.monthlyRent ? Number(unit.monthlyRent).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{unit.landlord?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-neutral-600">
                      {unit.tenants?.[0]?.name ?? <span className="text-neutral-400">Vacant</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        unit.status === 'OCCUPIED' ? 'bg-success-100 text-success-700' :
                        unit.status === 'VACANT' ? 'bg-neutral-100 text-neutral-600' :
                        unit.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-primary-100 text-primary-700'
                      }`}>
                        {unit.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/units/${unit.unitNumber}`} className="text-primary-600 hover:underline text-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Unit Modal */}
      {showAddUnitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-surface border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-900">Add New Unit to {property.name}</h2>
              <button
                onClick={() => setShowAddUnitModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Unit Information */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Unit Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Unit Number *
                    </label>
                    <input
                      type="text"
                      value={newUnit.unitNumber}
                      onChange={(e) => setNewUnit({ ...newUnit, unitNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., 101, A-12, 2B"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Floor
                    </label>
                    <input
                      type="text"
                      value={newUnit.floor}
                      onChange={(e) => setNewUnit({ ...newUnit, floor: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., 1st, 2nd, Ground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Unit Type
                    </label>
                    <select
                      value={newUnit.unitType}
                      onChange={(e) => setNewUnit({ ...newUnit, unitType: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="apartment">Apartment</option>
                      <option value="studio">Studio</option>
                      <option value="penthouse">Penthouse</option>
                      <option value="loft">Loft</option>
                      <option value="duplex">Duplex</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="office">Office Space</option>
                      <option value="retail">Retail Space</option>
                      <option value="storage">Storage Unit</option>
                      <option value="parking">Parking Space</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Status
                    </label>
                    <select
                      value={newUnit.status}
                      onChange={(e) => setNewUnit({ ...newUnit, status: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="vacant">Vacant</option>
                      <option value="occupied">Occupied</option>
                      <option value="maintenance">Under Maintenance</option>
                      <option value="reserved">Reserved</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Landlord Assignment */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Unit Owner</h3>
                <p className="text-sm text-neutral-600 mb-4">Select the landlord who owns this unit or add a new landlord</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Select Landlord *
                    </label>
                    <select
                      value={newUnit.landlordId}
                      onChange={(e) => {
                        const selectedLandlord = landlords.find((l: any) => l.id === e.target.value);
                        setNewUnit({
                          ...newUnit,
                          landlordId: e.target.value,
                          // Pre-populate management fee from landlord defaults
                          ...(selectedLandlord?.managementFeePercent != null ? {
                            managementFee: String(Number(selectedLandlord.managementFeePercent)),
                            managementFeeType: 'PERCENTAGE' as const,
                          } : {}),
                        });
                      }}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="">-- Select a landlord --</option>
                      {landlords.map((landlord: any) => (
                        <option key={landlord.id} value={landlord.id}>
                          {landlord.name} ({landlord.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 border-t border-neutral-300"></div>
                    <span className="text-sm text-neutral-500">OR</span>
                    <div className="flex-1 border-t border-neutral-300"></div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddLandlordModal(true)}
                    className="w-full"
                  >
                    + Add New Landlord
                  </Button>

                  {newUnit.landlordId && (
                    <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
                      <p className="text-sm font-medium text-primary-900">
                        Selected: {landlords.find((l: any) => l.id === newUnit.landlordId)?.name}
                      </p>
                      <p className="text-xs text-primary-700 mt-1">
                        {landlords.find((l: any) => l.id === newUnit.landlordId)?.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Unit Specifications */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      value={newUnit.bedrooms}
                      onChange={(e) => setNewUnit({ ...newUnit, bedrooms: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., 2"
                      min="0"
                      step="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      value={newUnit.bathrooms}
                      onChange={(e) => setNewUnit({ ...newUnit, bathrooms: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., 2"
                      min="0"
                      step="0.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Square Footage
                    </label>
                    <input
                      type="number"
                      value={newUnit.squareFootage}
                      onChange={(e) => setNewUnit({ ...newUnit, squareFootage: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., 850"
                      min="0"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Monthly Rent (KES) *
                    </label>
                    <input
                      type="number"
                      value={newUnit.monthlyRent}
                      onChange={(e) => setNewUnit({ ...newUnit, monthlyRent: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., 45000"
                      min="0"
                      required
                    />
                  </div>

                  {/* Rent Split Configuration */}
                  <div className="md:col-span-3 bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-neutral-900 mb-3">Landlord Split Configuration</h4>
                    <p className="text-xs text-neutral-600 mb-3">Set the agreed fee arrangement with the landlord. These are deducted from rent before payout.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-neutral-700 mb-1">Service Charge</label>
                        <div className="flex gap-2">
                          <select
                            value={newUnit.serviceChargeType}
                            onChange={(e) => setNewUnit({ ...newUnit, serviceChargeType: e.target.value as 'FIXED' | 'PERCENTAGE' })}
                            className="px-2 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="FIXED">Fixed (KES)</option>
                            <option value="PERCENTAGE">% of Rent</option>
                          </select>
                          <input
                            type="number"
                            value={newUnit.serviceCharge}
                            onChange={(e) => setNewUnit({ ...newUnit, serviceCharge: e.target.value })}
                            className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                            placeholder={newUnit.serviceChargeType === 'FIXED' ? 'e.g., 5000' : 'e.g., 10'}
                            min="0"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-700 mb-1">Management Fee</label>
                        <div className="flex gap-2">
                          <select
                            value={newUnit.managementFeeType}
                            onChange={(e) => setNewUnit({ ...newUnit, managementFeeType: e.target.value as 'FIXED' | 'PERCENTAGE' })}
                            className="px-2 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="PERCENTAGE">% of Rent</option>
                            <option value="FIXED">Fixed (KES)</option>
                          </select>
                          <input
                            type="number"
                            value={newUnit.managementFee}
                            onChange={(e) => setNewUnit({ ...newUnit, managementFee: e.target.value })}
                            className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                            placeholder={newUnit.managementFeeType === 'PERCENTAGE' ? 'e.g., 8' : 'e.g., 3000'}
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-neutral-700">
                        Description
                      </label>
                      <button
                        type="button"
                        onClick={handleImproveWithAI}
                        disabled={!newUnit.description || isImprovingText}
                        className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 disabled:text-neutral-400 disabled:cursor-not-allowed transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        {isImprovingText ? 'Improving...' : 'Improve with AI'}
                      </button>
                    </div>
                    <textarea
                      value={newUnit.description}
                      onChange={(e) => setNewUnit({ ...newUnit, description: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      rows={3}
                      placeholder="Enter unit description, features, or notes..."
                    />
                  </div>
                </div>
              </div>

              {/* Unit Amenities */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Unit Amenities</h3>
                <p className="text-sm text-neutral-600 mb-4">Select amenities specific to this unit</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {unitAmenities.map((amenity) => (
                    <label
                      key={amenity}
                      className="flex items-center gap-2 p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newUnit.amenities.includes(amenity)}
                        onChange={() => toggleUnitAmenity(amenity)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="text-sm text-neutral-700">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-neutral-50 border-t border-neutral-200 px-6 py-4 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAddUnitModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddUnit}
                disabled={!newUnit.unitNumber || !newUnit.monthlyRent || !newUnit.landlordId || addUnitMutation.isPending}
              >
                {addUnitMutation.isPending ? 'Saving...' : 'Add Unit'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Landlord Modal */}
      {showAddLandlordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="sticky top-0 bg-surface border-b border-neutral-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h2 className="text-xl font-bold text-neutral-900">Add New Landlord</h2>
              <button
                onClick={() => setShowAddLandlordModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={newLandlord.name}
                      onChange={(e) => setNewLandlord({ ...newLandlord, name: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={newLandlord.email}
                      onChange={(e) => setNewLandlord({ ...newLandlord, email: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={newLandlord.phone}
                      onChange={(e) => setNewLandlord({ ...newLandlord, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={newLandlord.address}
                      onChange={(e) => setNewLandlord({ ...newLandlord, address: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Tax Information */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Tax Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Tax ID / EIN
                    </label>
                    <input
                      type="text"
                      value={newLandlord.taxId}
                      onChange={(e) => setNewLandlord({ ...newLandlord, taxId: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="XX-XXXXXXX"
                    />
                  </div>
                </div>
              </div>

              {/* Banking Information */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Banking Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={newLandlord.bankName}
                      onChange={(e) => setNewLandlord({ ...newLandlord, bankName: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={newLandlord.accountNumber}
                      onChange={(e) => setNewLandlord({ ...newLandlord, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Last 4 digits recommended"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-neutral-50 border-t border-neutral-200 px-6 py-4 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAddLandlordModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddLandlord}
                disabled={!newLandlord.name || !newLandlord.email || !newLandlord.phone}
              >
                Add Landlord
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Property Modal */}
      {showEditModal && property && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-surface border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-900">Edit Property</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Property Name *</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Property name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Property Type</label>
                  <select
                    value={editFormData.type}
                    onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select type</option>
                    <option value="APARTMENT">Apartment</option>
                    <option value="HOUSE">House</option>
                    <option value="CONDO">Condo</option>
                    <option value="TOWNHOUSE">Townhouse</option>
                    <option value="STUDIO">Studio</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Address *</label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">State/Province</label>
                  <input
                    type="text"
                    value={editFormData.state}
                    onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={editFormData.postalCode}
                    onChange={(e) => setEditFormData({ ...editFormData, postalCode: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Postal code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={editFormData.country}
                    onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Country"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Total Units</label>
                  <input
                    type="number"
                    value={editFormData.units}
                    onChange={(e) => setEditFormData({ ...editFormData, units: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Year Built</label>
                  <input
                    type="number"
                    value={editFormData.yearBuilt}
                    onChange={(e) => setEditFormData({ ...editFormData, yearBuilt: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Year"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Property description"
                  rows={4}
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-neutral-50 border-t border-neutral-200 px-6 py-4 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const updatedData: any = {
                    name: editFormData.name || undefined,
                    address: editFormData.address || undefined,
                    city: editFormData.city || undefined,
                    state: editFormData.state || undefined,
                    postalCode: editFormData.postalCode || undefined,
                    country: editFormData.country || undefined,
                    type: editFormData.type || undefined,
                    totalUnits: editFormData.units ? parseInt(editFormData.units) : undefined,
                    yearBuilt: editFormData.yearBuilt ? parseInt(editFormData.yearBuilt) : undefined,
                    status: editFormData.status || undefined,
                    description: editFormData.description || undefined,
                  }

                  // Remove undefined values
                  Object.keys(updatedData).forEach(key => 
                    updatedData[key] === undefined && delete updatedData[key]
                  )

                  updatePropertyMutation.mutate(updatedData)
                }}
                disabled={!editFormData.name || !editFormData.address}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
