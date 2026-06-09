'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'
import ArchiveDeleteButtons from '@/components/ui/ArchiveDeleteButtons'

interface Property {
  id: string
  name: string
  address: string
  city: string | null
  type: string
  totalUnits: number
  status: string
  landlord: {
    id: string
    name: string
  }
  _count: {
    tenants: number
    leases: number
  }
}

// Unit types
const unitTypes = [
  { value: 'studio', label: 'Studio' },
  { value: 'bedsitter', label: 'Bedsitter' },
  { value: '1br', label: '1 Bedroom' },
  { value: '2br', label: '2 Bedroom' },
  { value: '3br', label: '3 Bedroom' },
  { value: '4br', label: '4 Bedroom' },
  { value: '5br', label: '5+ Bedroom' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'office', label: 'Office Space' },
  { value: 'retail', label: 'Retail Space' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'other', label: 'Other' },
]

// Unit status options
const unitStatuses = [
  { value: 'vacant', label: 'Vacant' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'maintenance', label: 'Under Maintenance' },
  { value: 'reserved', label: 'Reserved' },
]

interface UnitDetail {
  unitNumber: string;
  unitType: string;
  floor: string;
  bedrooms: string;
  bathrooms: string;
  squareFootage: string;
  monthlyRent: string;
  securityDeposit: string;
  status: string;
  landlordId: string;
  amenities: string[];
  description: string;
}

interface PropertiesResponse {
  properties: Property[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

async function fetchProperties(): Promise<PropertiesResponse> {
  const response = await fetch('/api/properties')
  if (!response.ok) {
    throw new Error('Failed to fetch properties')
  }
  return response.json()
}

export default function PropertiesPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showUnitSection, setShowUnitSection] = useState(false)
  const [units, setUnits] = useState<UnitDetail[]>([])
  const [newProperty, setNewProperty] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Kenya',
    propertyType: '',
    propertySubtype: '',
    totalUnits: '',
    description: '',
    yearBuilt: '',
    squareFootage: '',
    lotSize: '',
    amenities: [] as string[],
    parkingSpaces: '',
    floors: '',
    managementType: 'full-service',
    // Contact Information
    caretakerName: '',
    caretakerPhone: '',
    caretakerEmail: '',
    managementCompany: '',
    managementContactName: '',
    managementPhone: '',
    managementEmail: '',
    // Media
    photos: [] as File[],
    videoUrls: [] as string[],
  })
  const [photoPreview, setPhotoPreview] = useState<string[]>([])
  const [currentVideoUrl, setCurrentVideoUrl] = useState('')
  const [isImprovingText, setIsImprovingText] = useState(false)

  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: fetchProperties,
  })

  const { data: landlordsData } = useQuery({
    queryKey: ['landlords'],
    queryFn: async () => {
      const response = await fetch('/api/landlords')
      if (!response.ok) {
        throw new Error('Failed to fetch landlords')
      }
      return response.json()
    },
  })

  const createPropertyMutation = useMutation({
    mutationFn: async (propertyData: any) => {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propertyData),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create property')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      alert('Property created successfully!')
    },
    onError: (error: any) => {
      alert(`Error creating property: ${error.message}`)
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
      <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load properties. Please try again.</p>
      </div>
    )
  }

  const properties = data?.properties || []
  const totalUnits = properties.reduce((sum, p) => sum + p.totalUnits, 0)
  const totalOccupied = properties.reduce((sum, p) => sum + p._count.tenants, 0)
  const occupancyRate = totalUnits > 0 ? ((totalOccupied / totalUnits) * 100).toFixed(1) : '0'

  const stats = [
    { label: 'Total Properties', value: properties.length.toString(), change: `${properties.filter(p => p.status === 'ACTIVE').length} active` },
    { label: 'Total Units', value: totalUnits.toString(), change: `${totalOccupied} occupied` },
    { label: 'Occupancy Rate', value: `${occupancyRate}%`, change: totalUnits > 0 ? `${totalUnits - totalOccupied} vacant` : 'No units' },
    { label: 'Total Leases', value: properties.reduce((sum, p) => sum + p._count.leases, 0).toString(), change: 'All properties' },
  ]

  const propertyTypes = [
    {
      category: 'Residential Properties',
      subtypes: [
        'Single-family homes',
        'Multi-family homes (duplex, triplex, fourplex)',
        'Apartments',
        'Condominiums',
        'Townhouses',
        'Student housing',
        'Short-term rentals (Airbnb, vacation rentals)'
      ]
    },
    {
      category: 'Commercial Properties',
      subtypes: [
        'Office buildings (Class A, B, C)',
        'Retail spaces (shopping centers, strip malls, standalone retail)',
        'Industrial properties (warehouses, distribution centers)',
        'Flex spaces (office + warehouse)',
        'Hospitality (hotels/motels)'
      ]
    },
    {
      category: 'Industrial Properties',
      subtypes: [
        'Manufacturing facilities',
        'Warehouses',
        'Distribution/logistics centers'
      ]
    },
    {
      category: 'Mixed-Use Properties',
      subtypes: [
        'Residential units above retail',
        'Urban developments (housing, office, retail, entertainment)'
      ]
    },
    {
      category: 'Special-Purpose Properties',
      subtypes: [
        'Self-storage facilities',
        'Senior/assisted living',
        'Medical buildings',
        'Schools and educational facilities',
        'Religious buildings',
        'Parking facilities',
        'Marinas',
        'Recreational facilities (gyms, golf courses)'
      ]
    },
    {
      category: 'HOA / Community Associations',
      subtypes: [
        'Homeowners associations (HOA)',
        'Condo associations',
        'Co-ops',
        'Planned unit developments (PUDs)'
      ]
    },
    {
      category: 'Government / Public Properties',
      subtypes: [
        'Public housing',
        'Municipal buildings',
        'Military housing',
        'Parks and recreational buildings'
      ]
    }
  ]

  const commonAmenities = [
    'Parking', 'Elevator', 'Swimming Pool', 'Gym/Fitness Center', 
    'Security System', 'Backup Generator', 'Central AC', 'Balcony/Terrace',
    'Garden/Green Space', 'Playground', 'Laundry Facilities', 'Storage Units',
    'Conference Room', 'Reception/Lobby', 'Wheelchair Access', 'Pet-friendly'
  ]

  const landlords = landlordsData?.landlords || []

  const handleAddProperty = async () => {
    // Validate required fields
    if (!newProperty.name || !newProperty.address || !newProperty.city || !newProperty.propertyType) {
      alert('Please fill in all required fields (Name, Address, City, Property Type)')
      return
    }

    if (!newProperty.zipCode) {
      alert('Please fill in the postal code')
      return
    }

    // Get first landlord from the API data
    const landlords = landlordsData?.landlords || []
    const landlordId = landlords[0]?.id
    if (!landlordId) {
      alert('No landlord available. Please create a landlord first.')
      return
    }

    // Map category label to Prisma enum value
    const propertyTypeMap: Record<string, string> = {
      'Residential Properties': 'APARTMENT',
      'Commercial Properties': 'COMMERCIAL',
      'Industrial Properties': 'COMMERCIAL',
      'Mixed-Use Properties': 'APARTMENT',
      'Special-Purpose Properties': 'COMMERCIAL',
      'HOA / Community Associations': 'APARTMENT',
      'Government / Public Properties': 'COMMERCIAL',
    }
    const mappedType = propertyTypeMap[newProperty.propertyType] ?? newProperty.propertyType.toUpperCase()

    // Prepare data for API - map form fields to database schema
    const propertyData = {
      name: newProperty.name,
      address: newProperty.address,
      city: newProperty.city,
      state: newProperty.state,
      postalCode: newProperty.zipCode,
      country: newProperty.country,
      type: mappedType,
      totalUnits: newProperty.totalUnits ? parseInt(newProperty.totalUnits) : 1,
      description: newProperty.description,
      yearBuilt: newProperty.yearBuilt ? parseInt(newProperty.yearBuilt) : undefined,
      landlordId,
    }

    try {
      await createPropertyMutation.mutateAsync(propertyData)
      
      // Reset form
      setShowAddModal(false)
      setUnits([])
      setShowUnitSection(false)
      setNewProperty({
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Kenya',
        propertyType: '',
        propertySubtype: '',
        totalUnits: '',
        description: '',
        yearBuilt: '',
        squareFootage: '',
        lotSize: '',
        amenities: [],
        parkingSpaces: '',
        floors: '',
        managementType: 'full-service',
        caretakerName: '',
        caretakerPhone: '',
        caretakerEmail: '',
        managementCompany: '',
        managementContactName: '',
        managementPhone: '',
        managementEmail: '',
        photos: [],
        videoUrls: [],
      })
      setPhotoPreview([])
      setCurrentVideoUrl('')
    } catch (error) {
      console.error('Error creating property:', error)
    }
  }

  const toggleAmenity = (amenity: string) => {
    setNewProperty(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files)
      const validFiles = fileArray.filter(file => 
        file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB limit
      )

      if (validFiles.length !== fileArray.length) {
        alert('Some files were skipped. Only images under 10MB are allowed.')
      }

      // Create preview URLs
      const newPreviews = validFiles.map(file => URL.createObjectURL(file))
      setPhotoPreview(prev => [...prev, ...newPreviews])
      
      setNewProperty(prev => ({
        ...prev,
        photos: [...prev.photos, ...validFiles]
      }))
    }
  }

  const removePhoto = (index: number) => {
    // Revoke the preview URL to free memory
    URL.revokeObjectURL(photoPreview[index])
    
    setPhotoPreview(prev => prev.filter((_, i) => i !== index))
    setNewProperty(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
  }

  const addVideoUrl = () => {
    if (currentVideoUrl.trim()) {
      // Basic validation for YouTube, Vimeo, or direct video URLs
      const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com|.*\.(mp4|webm|ogg)).*$/i
      
      if (urlPattern.test(currentVideoUrl)) {
        setNewProperty(prev => ({
          ...prev,
          videoUrls: [...prev.videoUrls, currentVideoUrl.trim()]
        }))
        setCurrentVideoUrl('')
      } else {
        alert('Please enter a valid video URL (YouTube, Vimeo, or direct video link)')
      }
    }
  }

  const handleImproveWithAI = async () => {
    setIsImprovingText(true)
    
    // Simulate AI API call - in production, this would call your LLM API configured in settings
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    if (newProperty.description) {
      const improved = newProperty.description + '\n\nEnhanced with professional details highlighting property features, location benefits, and amenities.'
      setNewProperty({ ...newProperty, description: improved })
    }
    
    setIsImprovingText(false)
  }

  // Unit Management Functions
  const generateUnits = (count: number) => {
    const numUnits = parseInt(count.toString()) || 0
    if (numUnits > 1 && numUnits <= 100) {
      setShowUnitSection(true)
      const newUnits: UnitDetail[] = Array.from({ length: numUnits }, (_, i) => ({
        unitNumber: `${i + 1}`,
        unitType: '',
        floor: '',
        bedrooms: '',
        bathrooms: '',
        squareFootage: '',
        monthlyRent: '',
        securityDeposit: '',
        status: 'vacant',
        landlordId: '',
        amenities: [],
        description: '',
      }))
      setUnits(newUnits)
    } else if (numUnits === 1) {
      setShowUnitSection(false)
      setUnits([])
    }
  }

  const updateUnit = (index: number, field: keyof UnitDetail, value: string | string[]) => {
    setUnits(prev => prev.map((unit, i) => 
      i === index ? { ...unit, [field]: value } : unit
    ))
  }

  const toggleUnitAmenity = (index: number, amenity: string) => {
    setUnits(prev => prev.map((unit, i) => {
      if (i === index) {
        const newAmenities = unit.amenities.includes(amenity)
          ? unit.amenities.filter(a => a !== amenity)
          : [...unit.amenities, amenity]
        return { ...unit, amenities: newAmenities }
      }
      return unit
    }))
  }

  const applyToAllUnits = (field: keyof UnitDetail, value: string) => {
    setUnits(prev => prev.map(unit => ({ ...unit, [field]: value })))
  }

  const unitAmenities = [
    'Balcony', 'En-suite', 'Walk-in Closet', 'Air Conditioning', 'Furnished', 
    'Semi-furnished', 'Kitchen Appliances', 'Water Heater', 'CCTV', 'Intercom'
  ]

  const removeVideoUrl = (index: number) => {
    setNewProperty(prev => ({
      ...prev,
      videoUrls: prev.videoUrls.filter((_, i) => i !== index)
    }))
  }

  const getVideoEmbedUrl = (url: string) => {
    // Convert YouTube URLs to embed format
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0]
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url
    }
    // Convert Vimeo URLs to embed format
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0]
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url
    }
    return url
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Properties</h1>
          <p className="text-neutral-600 mt-2">Manage and monitor all your properties</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowAddModal(true)}>+ Add Property</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-surface rounded-lg border border-neutral-200 p-6">
            <p className="text-sm text-neutral-600 font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-neutral-900 mt-2">{stat.value}</p>
            <p className="text-xs text-neutral-500 mt-2">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface rounded-lg border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">All Properties</h2>

        {properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500 mb-4">No properties found</p>
            <Button variant="primary">Add Your First Property</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => (
              <div key={property.id} className="flex items-center gap-2 p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition">
                <Link
                  href={`/admin/properties/${property.id}`}
                  className="flex-1 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-neutral-900">{property.name}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        property.status === 'ACTIVE' ? 'bg-success-100 text-green-800' :
                        property.status === 'INACTIVE' ? 'bg-neutral-100 text-neutral-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {property.status}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 mt-1">{property.address}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {(property as any).unitLandlords?.length > 1 ? (
                        <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `/admin/properties/${property.id}` }} className="text-primary-600 hover:underline cursor-pointer">{(property as any).unitLandlords.length} landlords</span>
                      ) : (property as any).unitLandlords?.length === 1 ? (
                        <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `/admin/landlords/${(property as any).unitLandlords[0].id}` }} className="text-primary-600 hover:underline cursor-pointer">{(property as any).unitLandlords[0].name}</span>
                      ) : property.landlord?.id ? (
                        <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `/admin/landlords/${property.landlord!.id}` }} className="text-primary-600 hover:underline cursor-pointer">{property.landlord.name}</span>
                      ) : 'Unassigned'} • {property.type}
                    </p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="text-sm font-medium text-neutral-900">{property.totalUnits} Units</p>
                    <p className={`text-xs ${property._count.tenants === property.totalUnits ? 'text-success-600' : 'text-yellow-600'}`}>
                      {property._count.tenants}/{property.totalUnits} Occupied
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {property._count.leases} Leases
                    </p>
                  </div>
                </Link>
                <ArchiveDeleteButtons
                  entityName="property"
                  entityLabel={property.name}
                  archiveUrl={`/api/properties/${property.id}`}
                  deleteUrl={`/api/properties/${property.id}`}
                  isArchived={property.status === 'ARCHIVED'}
                  onSuccess={() => queryClient.invalidateQueries({ queryKey: ['properties'] })}
                  size="sm"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-surface border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-900">Add New Property</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Property Name *
                    </label>
                    <input
                      type="text"
                      value={newProperty.name}
                      onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., Sunset Apartments"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={newProperty.address}
                      onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., 123 Mombasa Road"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={newProperty.city}
                      onChange={(e) => setNewProperty({ ...newProperty, city: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., Nairobi"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      State/County
                    </label>
                    <input
                      type="text"
                      value={newProperty.state}
                      onChange={(e) => setNewProperty({ ...newProperty, state: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., Nairobi County"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Zip/Postal Code
                    </label>
                    <input
                      type="text"
                      value={newProperty.zipCode}
                      onChange={(e) => setNewProperty({ ...newProperty, zipCode: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., 00100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      value={newProperty.country}
                      onChange={(e) => setNewProperty({ ...newProperty, country: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Property Type */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Property Classification</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Property Type *
                    </label>
                    <select
                      value={newProperty.propertyType}
                      onChange={(e) => setNewProperty({ ...newProperty, propertyType: e.target.value, propertySubtype: '' })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="">Select Property Type</option>
                      {propertyTypes.map((type) => (
                        <option key={type.category} value={type.category}>
                          {type.category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Property Subtype *
                    </label>
                    <select
                      value={newProperty.propertySubtype}
                      onChange={(e) => setNewProperty({ ...newProperty, propertySubtype: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      disabled={!newProperty.propertyType}
                      required
                    >
                      <option value="">Select Subtype</option>
                      {newProperty.propertyType && propertyTypes
                        .find(t => t.category === newProperty.propertyType)
                        ?.subtypes.map((subtype) => (
                          <option key={subtype} value={subtype}>
                            {subtype}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Management Type
                    </label>
                    <select
                      value={newProperty.managementType}
                      onChange={(e) => setNewProperty({ ...newProperty, managementType: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="full-service">Full-Service Management</option>
                      <option value="partial">Partial Management</option>
                      <option value="financial-only">Financial Management Only</option>
                      <option value="lease-only">Lease Management Only</option>
                      <option value="consulting">Consulting Services</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Property Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Total Units *
                    </label>
                    <input
                      type="number"
                      value={newProperty.totalUnits}
                      onChange={(e) => {
                        setNewProperty({ ...newProperty, totalUnits: e.target.value })
                        generateUnits(parseInt(e.target.value) || 0)
                      }}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., 50"
                      min="1"
                      max="100"
                      required
                    />
                    {parseInt(newProperty.totalUnits) > 1 && (
                      <p className="text-xs text-primary-600 mt-1">
                        ℹ️ {newProperty.totalUnits} units will be created. Configure each unit below.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Year Built
                    </label>
                    <input
                      type="number"
                      value={newProperty.yearBuilt}
                      onChange={(e) => setNewProperty({ ...newProperty, yearBuilt: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., 2020"
                      min="1800"
                      max={new Date().getFullYear()}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Number of Floors
                    </label>
                    <input
                      type="number"
                      value={newProperty.floors}
                      onChange={(e) => setNewProperty({ ...newProperty, floors: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., 5"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Square Footage
                    </label>
                    <input
                      type="number"
                      value={newProperty.squareFootage}
                      onChange={(e) => setNewProperty({ ...newProperty, squareFootage: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Total sq ft"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Lot Size (acres)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProperty.lotSize}
                      onChange={(e) => setNewProperty({ ...newProperty, lotSize: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., 2.5"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Parking Spaces
                    </label>
                    <input
                      type="number"
                      value={newProperty.parkingSpaces}
                      onChange={(e) => setNewProperty({ ...newProperty, parkingSpaces: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., 100"
                      min="0"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-neutral-700">
                        Description
                      </label>
                      <button
                        type="button"
                        onClick={handleImproveWithAI}
                        disabled={!newProperty.description || isImprovingText}
                        className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 disabled:text-neutral-400 disabled:cursor-not-allowed transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        {isImprovingText ? 'Improving...' : 'Improve with AI'}
                      </button>
                    </div>
                    <textarea
                      value={newProperty.description}
                      onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      rows={3}
                      placeholder="Enter property description, features, or notes..."
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Contact Information</h3>
                <p className="text-sm text-neutral-600 mb-4">Property caretaker and/or management company details</p>
                
                {/* Caretaker Information */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-neutral-900 mb-3">Property Caretaker</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Caretaker Name
                      </label>
                      <input
                        type="text"
                        value={newProperty.caretakerName}
                        onChange={(e) => setNewProperty({ ...newProperty, caretakerName: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., John Kamau"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Caretaker Phone
                      </label>
                      <input
                        type="tel"
                        value={newProperty.caretakerPhone}
                        onChange={(e) => setNewProperty({ ...newProperty, caretakerPhone: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., +254 712 345 678"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Caretaker Email
                      </label>
                      <input
                        type="email"
                        value={newProperty.caretakerEmail}
                        onChange={(e) => setNewProperty({ ...newProperty, caretakerEmail: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., caretaker@example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Management Company Information */}
                <div>
                  <h4 className="text-md font-medium text-neutral-900 mb-3">Management Company</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={newProperty.managementCompany}
                        onChange={(e) => setNewProperty({ ...newProperty, managementCompany: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., ABC Property Management Ltd"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Contact Person Name
                      </label>
                      <input
                        type="text"
                        value={newProperty.managementContactName}
                        onChange={(e) => setNewProperty({ ...newProperty, managementContactName: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., Jane Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={newProperty.managementPhone}
                        onChange={(e) => setNewProperty({ ...newProperty, managementPhone: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., +254 700 123 456"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={newProperty.managementEmail}
                        onChange={(e) => setNewProperty({ ...newProperty, managementEmail: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., contact@abcpropertymanagement.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Photos & Videos */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Photos & Videos</h3>
                <p className="text-sm text-neutral-600 mb-4">Upload property photos and add video links</p>
                
                {/* Photo Upload */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-neutral-900 mb-3">Property Photos</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-neutral-300 border-dashed rounded-lg cursor-pointer bg-neutral-50 hover:bg-neutral-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-10 h-10 mb-3 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="mb-2 text-sm text-neutral-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-neutral-500">PNG, JPG, JPEG, GIF (MAX. 10MB each)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                        />
                      </label>
                    </div>

                    {photoPreview.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-neutral-700 mb-2">
                          {photoPreview.length} photo{photoPreview.length !== 1 ? 's' : ''} selected
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {photoPreview.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-neutral-200"
                              />
                              <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                className="absolute top-1 right-1 bg-danger-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                              <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                {(newProperty.photos[index].size / 1024 / 1024).toFixed(2)} MB
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Video URLs */}
                <div>
                  <h4 className="text-md font-medium text-neutral-900 mb-3">Property Videos</h4>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={currentVideoUrl}
                        onChange={(e) => setCurrentVideoUrl(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVideoUrl())}
                        className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter YouTube, Vimeo, or video URL"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addVideoUrl}
                        disabled={!currentVideoUrl.trim()}
                      >
                        Add Video
                      </Button>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Supported: YouTube, Vimeo, or direct video links (.mp4, .webm, .ogg)
                    </p>

                    {newProperty.videoUrls.length > 0 && (
                      <div className="space-y-3 mt-4">
                        <p className="text-sm font-medium text-neutral-700">
                          {newProperty.videoUrls.length} video{newProperty.videoUrls.length !== 1 ? 's' : ''} added
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {newProperty.videoUrls.map((url, index) => (
                            <div key={index} className="relative group border border-neutral-200 rounded-lg overflow-hidden">
                              <div className="aspect-video bg-neutral-100">
                                {(url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')) ? (
                                  <iframe
                                    src={getVideoEmbedUrl(url)}
                                    className="w-full h-full"
                                    allowFullScreen
                                    title={`Property video ${index + 1}`}
                                  />
                                ) : (
                                  <video
                                    src={url}
                                    className="w-full h-full"
                                    controls
                                  />
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeVideoUrl(index)}
                                className="absolute top-2 right-2 bg-danger-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                              <div className="p-2 bg-neutral-50">
                                <p className="text-xs text-neutral-600 truncate">{url}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Property Amenities</h3>
                <p className="text-sm text-neutral-600 mb-4">Select all amenities available at this property</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {commonAmenities.map((amenity) => (
                    <label
                      key={amenity}
                      className="flex items-center gap-2 p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newProperty.amenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="text-sm text-neutral-700">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Individual Unit Management Section */}
              {showUnitSection && units.length > 1 && (
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900">Individual Unit Configuration</h3>
                      <p className="text-sm text-neutral-600">Configure details for each of the {units.length} units</p>
                    </div>
                    <div className="flex gap-2">
                      <select
                        className="px-3 py-1 text-sm border border-neutral-300 rounded-lg"
                        onChange={(e) => {
                          if (e.target.value) applyToAllUnits('unitType', e.target.value)
                        }}
                        defaultValue=""
                      >
                        <option value="">Apply type to all...</option>
                        {unitTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                      <select
                        className="px-3 py-1 text-sm border border-neutral-300 rounded-lg"
                        onChange={(e) => {
                          if (e.target.value) applyToAllUnits('landlordId', e.target.value)
                        }}
                        defaultValue=""
                      >
                        <option value="">Apply landlord to all...</option>
                        {landlords.map((ll: any) => (
                          <option key={ll.id} value={ll.id}>{ll.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {units.map((unit, index) => (
                      <div key={index} className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-neutral-800">Unit {index + 1}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            unit.status === 'vacant' ? 'bg-success-100 text-success-700' :
                            unit.status === 'occupied' ? 'bg-primary-100 text-primary-700' :
                            unit.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-primary-100 text-primary-700'
                          }`}>
                            {unitStatuses.find(s => s.value === unit.status)?.label || 'Vacant'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {/* Unit Number */}
                          <div>
                            <label className="block text-xs font-medium text-neutral-600 mb-1">Unit Number *</label>
                            <input
                              type="text"
                              value={unit.unitNumber}
                              onChange={(e) => updateUnit(index, 'unitNumber', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                              placeholder="e.g., A1, 101"
                            />
                          </div>

                          {/* Unit Type */}
                          <div>
                            <label className="block text-xs font-medium text-neutral-600 mb-1">Unit Type *</label>
                            <select
                              value={unit.unitType}
                              onChange={(e) => updateUnit(index, 'unitType', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            >
                              <option value="">Select type...</option>
                              {unitTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                              ))}
                            </select>
                          </div>

                          {/* Floor */}
                          <div>
                            <label className="block text-xs font-medium text-neutral-600 mb-1">Floor</label>
                            <input
                              type="text"
                              value={unit.floor}
                              onChange={(e) => updateUnit(index, 'floor', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                              placeholder="e.g., 1, 2, G"
                            />
                          </div>

                          {/* Status */}
                          <div>
                            <label className="block text-xs font-medium text-neutral-600 mb-1">Status</label>
                            <select
                              value={unit.status}
                              onChange={(e) => updateUnit(index, 'status', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            >
                              {unitStatuses.map(status => (
                                <option key={status.value} value={status.value}>{status.label}</option>
                              ))}
                            </select>
                          </div>

                          {/* Bedrooms */}
                          <div>
                            <label className="block text-xs font-medium text-neutral-600 mb-1">Bedrooms</label>
                            <input
                              type="number"
                              value={unit.bedrooms}
                              onChange={(e) => updateUnit(index, 'bedrooms', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                              min="0"
                              placeholder="0"
                            />
                          </div>

                          {/* Bathrooms */}
                          <div>
                            <label className="block text-xs font-medium text-neutral-600 mb-1">Bathrooms</label>
                            <input
                              type="number"
                              value={unit.bathrooms}
                              onChange={(e) => updateUnit(index, 'bathrooms', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                              min="0"
                              step="0.5"
                              placeholder="1"
                            />
                          </div>

                          {/* Square Footage */}
                          <div>
                            <label className="block text-xs font-medium text-neutral-600 mb-1">Size (sq ft)</label>
                            <input
                              type="number"
                              value={unit.squareFootage}
                              onChange={(e) => updateUnit(index, 'squareFootage', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                              min="0"
                              placeholder="500"
                            />
                          </div>

                          {/* Monthly Rent */}
                          <div>
                            <label className="block text-xs font-medium text-neutral-600 mb-1">Monthly Rent (KES)</label>
                            <input
                              type="number"
                              value={unit.monthlyRent}
                              onChange={(e) => updateUnit(index, 'monthlyRent', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                              min="0"
                              placeholder="25000"
                            />
                          </div>

                          {/* Security Deposit */}
                          <div>
                            <label className="block text-xs font-medium text-neutral-600 mb-1">Security Deposit</label>
                            <input
                              type="number"
                              value={unit.securityDeposit}
                              onChange={(e) => updateUnit(index, 'securityDeposit', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                              min="0"
                              placeholder="25000"
                            />
                          </div>

                          {/* Landlord Assignment */}
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-neutral-600 mb-1">
                              Assign Landlord
                              <Link href="/admin/landlords" className="ml-2 text-primary-600 hover:underline text-xs">
                                + Add New
                              </Link>
                            </label>
                            <select
                              value={unit.landlordId}
                              onChange={(e) => updateUnit(index, 'landlordId', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            >
                              <option value="">Select landlord...</option>
                              {landlords.map((ll: any) => (
                                <option key={ll.id} value={ll.id}>{ll.name}</option>
                              ))}
                            </select>
                          </div>

                          {/* Description */}
                          <div className="col-span-2 md:col-span-4">
                            <label className="block text-xs font-medium text-neutral-600 mb-1">Unit Description</label>
                            <textarea
                              value={unit.description}
                              onChange={(e) => updateUnit(index, 'description', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                              rows={2}
                              placeholder="Additional details about this unit..."
                            />
                          </div>

                          {/* Unit Amenities */}
                          <div className="col-span-2 md:col-span-4">
                            <label className="block text-xs font-medium text-neutral-600 mb-1">Unit-Specific Amenities</label>
                            <div className="flex flex-wrap gap-2">
                              {unitAmenities.map(amenity => (
                                <label key={amenity} className="flex items-center gap-1 text-xs">
                                  <input
                                    type="checkbox"
                                    checked={unit.amenities.includes(amenity)}
                                    onChange={() => toggleUnitAmenity(index, amenity)}
                                    className="w-3 h-3 text-primary-600 rounded"
                                  />
                                  {amenity}
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="mt-4 bg-primary-50 border border-primary-200 rounded-lg p-3">
                    <h5 className="font-medium text-primary-800 mb-2">Units Summary</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-primary-600">Total Units:</span>
                        <span className="ml-1 font-semibold">{units.length}</span>
                      </div>
                      <div>
                        <span className="text-primary-600">Vacant:</span>
                        <span className="ml-1 font-semibold">{units.filter(u => u.status === 'vacant').length}</span>
                      </div>
                      <div>
                        <span className="text-primary-600">Configured:</span>
                        <span className="ml-1 font-semibold">{units.filter(u => u.unitType && u.unitNumber).length}</span>
                      </div>
                      <div>
                        <span className="text-primary-600">With Landlord:</span>
                        <span className="ml-1 font-semibold">{units.filter(u => u.landlordId).length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-neutral-50 border-t border-neutral-200 px-6 py-4 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
                disabled={createPropertyMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddProperty}
                disabled={
                  !newProperty.name ||
                  !newProperty.address ||
                  !newProperty.city ||
                  !newProperty.country ||
                  !newProperty.propertyType ||
                  !newProperty.propertySubtype ||
                  !newProperty.totalUnits ||
                  createPropertyMutation.isPending
                }
              >
                {createPropertyMutation.isPending ? 'Creating...' : 'Add Property'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
