'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface PropertyDetail {
  id: string
  name: string
  address: string
  units: number
  occupied: number
  totalRent: number
  landlordId: string
  landlord: string
  status: string
  yearBuilt: number
  type: string
  tenants: Array<{
    id: string
    name: string
    email: string
    phone: string
    unit: string
    rent: number
    status: string
  }>
  leases: Array<{
    id: string
    tenant: { id: string; name: string }
    unit: string
    monthlyRent: number
    startDate: string
    endDate: string
    status: string
  }>
  stats: {
    totalUnits: number
    occupiedUnits: number
    vacantUnits: number
    occupancyRate: string
    totalRent: number
    activeLeases: number
  }
}

async function fetchProperty(id: string): Promise<{ property: PropertyDetail }> {
  const response = await fetch(`/api/mock/properties/${id}`)
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

  const { data, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => fetchProperty(id),
  })

  const { data: landlordsData } = useQuery({
    queryKey: ['landlords'],
    queryFn: async () => {
      const response = await fetch('/api/mock/landlords')
      if (!response.ok) throw new Error('Failed to fetch landlords')
      return response.json()
    },
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load property details. Please try again.</p>
      </div>
    )
  }

  const property = data?.property

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
        return 'bg-green-100 text-green-800'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const unitAmenities = [
    'Balcony', 'Air Conditioning', 'Heating', 'Washer/Dryer', 
    'Dishwasher', 'Microwave', 'Refrigerator', 'Walk-in Closet',
    'Hardwood Floors', 'Carpet', 'Tile', 'Fireplace',
    'High Ceilings', 'Bay Windows', 'Private Entrance', 'Storage'
  ]

  const handleAddUnit = () => {
    // TODO: API call to create unit
    console.log('Creating unit:', newUnit)
    setShowAddUnitModal(false)
    // Reset form
    setNewUnit({
      unitNumber: '',
      floor: '',
      bedrooms: '',
      bathrooms: '',
      squareFootage: '',
      monthlyRent: '',
      unitType: 'apartment',
      status: 'vacant',
      description: '',
      amenities: [],
      landlordId: '',
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
        .map(lease => lease.tenant.id) // This is a simplification, in real data you'd have landlordId
        .filter(Boolean)
    )).map(id => {
      // In a real scenario, you'd fetch actual landlord data
      // For now, we'll use mock data
      return landlords.find((l: any) => l.id === id)
    }).filter(Boolean)
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center text-white text-3xl font-bold">
              {property.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
              <p className="text-gray-600 mt-1">
                📍 {property.address}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(property.status)}`}>
                  {property.status}
                </span>
                <span className="text-sm text-gray-600">
                  {property.type} • Built {property.yearBuilt}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Edit Property</Button>
            <Button variant="primary" onClick={() => setShowAddUnitModal(true)}>+ Add Unit</Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Total Units</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{property.stats.totalUnits}</p>
          <p className="text-xs text-gray-500 mt-1">{property.type}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Occupied Units</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{property.stats.occupiedUnits}</p>
          <p className="text-xs text-gray-500 mt-1">{property.stats.vacantUnits} vacant</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Occupancy Rate</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{property.stats.occupancyRate}%</p>
          <p className="text-xs text-gray-500 mt-1">Current rate</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Monthly Revenue</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            KES {property.stats.totalRent.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">{property.stats.activeLeases} active leases</p>
        </div>
      </div>

      {/* Property Owners */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Property Owners ({landlords.length})</h2>
          <p className="text-sm text-gray-600">Multiple landlords can own units in this property</p>
        </div>
        
        {landlords.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-2">No landlords assigned to units yet</p>
            <p className="text-xs text-gray-400">Landlords will be listed here when units are assigned to them</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {landlords.slice(0, 6).map((landlord: any) => (
              <Link
                key={landlord.id}
                href={`/admin/landlords/${landlord.id}`}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition"
              >
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {landlord.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{landlord.name}</p>
                  <p className="text-xs text-gray-600 truncate">{landlord.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {landlord._count?.properties || 0} {landlord._count?.properties === 1 ? 'property' : 'properties'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {landlords.length > 6 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Showing 6 of {landlords.length} landlords. 
              <Link href="/admin/landlords" className="text-blue-600 hover:text-blue-800 ml-1">
                View all
              </Link>
            </p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-semibold flex-shrink-0">
              {property.landlord.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Primary Contact</p>
              <Link 
                href={`/admin/landlords/${property.landlordId}`}
                className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                {property.landlord}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Location Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Location & Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Address</p>
            <p className="text-lg font-medium text-gray-900">{property.address}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Property Type</p>
            <p className="text-lg font-medium text-gray-900">{property.type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Year Built</p>
            <p className="text-lg font-medium text-gray-900">{property.yearBuilt}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Units</p>
            <p className="text-lg font-medium text-gray-900">{property.units} units</p>
          </div>
        </div>
      </div>

      {/* Current Tenants */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Current Tenants ({property.tenants.length})</h2>
        
        {property.tenants.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No tenants currently</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Tenant</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Rent</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {property.tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link 
                        href={`/admin/tenants/${tenant.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {tenant.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{tenant.unit}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{tenant.email}</div>
                      <div className="text-xs text-gray-500">{tenant.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      KES {tenant.rent.toLocaleString()}
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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Active Leases ({property.leases.filter(l => l.status === 'ACTIVE').length})</h2>
        
        {property.leases.filter(l => l.status === 'ACTIVE').length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No active leases</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Tenant</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Monthly Rent</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {property.leases.filter(l => l.status === 'ACTIVE' || l.status === 'Active').map((lease) => (
                  <tr key={lease.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link 
                        href={`/admin/tenants/${lease.tenant.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {lease.tenant.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{lease.unit}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      KES {lease.monthlyRent.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(lease.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
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

      {/* Add Unit Modal */}
      {showAddUnitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Add New Unit to {property.name}</h2>
              <button
                onClick={() => setShowAddUnitModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Unit Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Unit Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Number *
                    </label>
                    <input
                      type="text"
                      value={newUnit.unitNumber}
                      onChange={(e) => setNewUnit({ ...newUnit, unitNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 101, A-12, 2B"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Floor
                    </label>
                    <input
                      type="text"
                      value={newUnit.floor}
                      onChange={(e) => setNewUnit({ ...newUnit, floor: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 1st, 2nd, Ground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Type
                    </label>
                    <select
                      value={newUnit.unitType}
                      onChange={(e) => setNewUnit({ ...newUnit, unitType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={newUnit.status}
                      onChange={(e) => setNewUnit({ ...newUnit, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Unit Owner</h3>
                <p className="text-sm text-gray-600 mb-4">Select the landlord who owns this unit or add a new landlord</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Landlord *
                    </label>
                    <select
                      value={newUnit.landlordId}
                      onChange={(e) => setNewUnit({ ...newUnit, landlordId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="text-sm text-gray-500">OR</span>
                    <div className="flex-1 border-t border-gray-300"></div>
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
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">
                        Selected: {landlords.find((l: any) => l.id === newUnit.landlordId)?.name}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        {landlords.find((l: any) => l.id === newUnit.landlordId)?.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Unit Specifications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      value={newUnit.bedrooms}
                      onChange={(e) => setNewUnit({ ...newUnit, bedrooms: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 2"
                      min="0"
                      step="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      value={newUnit.bathrooms}
                      onChange={(e) => setNewUnit({ ...newUnit, bathrooms: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 2"
                      min="0"
                      step="0.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Square Footage
                    </label>
                    <input
                      type="number"
                      value={newUnit.squareFootage}
                      onChange={(e) => setNewUnit({ ...newUnit, squareFootage: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 850"
                      min="0"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Rent (KES) *
                    </label>
                    <input
                      type="number"
                      value={newUnit.monthlyRent}
                      onChange={(e) => setNewUnit({ ...newUnit, monthlyRent: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 45000"
                      min="0"
                      required
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newUnit.description}
                      onChange={(e) => setNewUnit({ ...newUnit, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Enter unit description, features, or notes..."
                    />
                  </div>
                </div>
              </div>

              {/* Unit Amenities */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Unit Amenities</h3>
                <p className="text-sm text-gray-600 mb-4">Select amenities specific to this unit</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {unitAmenities.map((amenity) => (
                    <label
                      key={amenity}
                      className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newUnit.amenities.includes(amenity)}
                        onChange={() => toggleUnitAmenity(amenity)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAddUnitModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddUnit}
                disabled={!newUnit.unitNumber || !newUnit.monthlyRent || !newUnit.landlordId}
              >
                Add Unit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Landlord Modal */}
      {showAddLandlordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h2 className="text-xl font-bold text-gray-900">Add New Landlord</h2>
              <button
                onClick={() => setShowAddLandlordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={newLandlord.name}
                      onChange={(e) => setNewLandlord({ ...newLandlord, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={newLandlord.email}
                      onChange={(e) => setNewLandlord({ ...newLandlord, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={newLandlord.phone}
                      onChange={(e) => setNewLandlord({ ...newLandlord, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={newLandlord.address}
                      onChange={(e) => setNewLandlord({ ...newLandlord, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Tax Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax ID / EIN
                    </label>
                    <input
                      type="text"
                      value={newLandlord.taxId}
                      onChange={(e) => setNewLandlord({ ...newLandlord, taxId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="XX-XXXXXXX"
                    />
                  </div>
                </div>
              </div>

              {/* Banking Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Banking Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={newLandlord.bankName}
                      onChange={(e) => setNewLandlord({ ...newLandlord, bankName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={newLandlord.accountNumber}
                      onChange={(e) => setNewLandlord({ ...newLandlord, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Last 4 digits recommended"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
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
    </div>
  )
}
