'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'

interface Property {
  id: string
  name: string
  address: string
  city: string | null
  type: string
  units: number
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
  const response = await fetch('/api/mock/properties')
  if (!response.ok) {
    throw new Error('Failed to fetch properties')
  }
  return response.json()
}

export default function PropertiesPage() {
  const [showAddModal, setShowAddModal] = useState(false)
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

  const { data, isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: fetchProperties,
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
        <p className="text-red-800">Failed to load properties. Please try again.</p>
      </div>
    )
  }

  const properties = data?.properties || []
  const totalUnits = properties.reduce((sum, p) => sum + p.units, 0)
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

  const handleAddProperty = () => {
    // TODO: API call to create property
    console.log('Creating property:', newProperty)
    console.log('Photo files:', newProperty.photos)
    console.log('Video URLs:', newProperty.videoUrls)
    setShowAddModal(false)
    // Reset form
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
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600 mt-2">Manage and monitor all your properties</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowAddModal(true)}>+ Add Property</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Properties</h2>

        {properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No properties found</p>
            <Button variant="primary">Add Your First Property</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => (
              <Link
                key={property.id}
                href={`/admin/properties/${property.id}`}
                className="block"
              >
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-gray-900">{property.name}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        property.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        property.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {property.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{property.address}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Landlord: {property.landlord.name} • Type: {property.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{property.units} Units</p>
                    <p className={`text-xs ${property._count.tenants === property.units ? 'text-green-600' : 'text-yellow-600'}`}>
                      {property._count.tenants}/{property.units} Occupied
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {property._count.leases} Leases
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Add New Property</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Name *
                    </label>
                    <input
                      type="text"
                      value={newProperty.name}
                      onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Sunset Apartments"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={newProperty.address}
                      onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 123 Mombasa Road"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={newProperty.city}
                      onChange={(e) => setNewProperty({ ...newProperty, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Nairobi"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State/County
                    </label>
                    <input
                      type="text"
                      value={newProperty.state}
                      onChange={(e) => setNewProperty({ ...newProperty, state: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Nairobi County"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zip/Postal Code
                    </label>
                    <input
                      type="text"
                      value={newProperty.zipCode}
                      onChange={(e) => setNewProperty({ ...newProperty, zipCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 00100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      value={newProperty.country}
                      onChange={(e) => setNewProperty({ ...newProperty, country: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Property Type */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Classification</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Type *
                    </label>
                    <select
                      value={newProperty.propertyType}
                      onChange={(e) => setNewProperty({ ...newProperty, propertyType: e.target.value, propertySubtype: '' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Subtype *
                    </label>
                    <select
                      value={newProperty.propertySubtype}
                      onChange={(e) => setNewProperty({ ...newProperty, propertySubtype: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Management Type
                    </label>
                    <select
                      value={newProperty.managementType}
                      onChange={(e) => setNewProperty({ ...newProperty, managementType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Units *
                    </label>
                    <input
                      type="number"
                      value={newProperty.totalUnits}
                      onChange={(e) => setNewProperty({ ...newProperty, totalUnits: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 50"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year Built
                    </label>
                    <input
                      type="number"
                      value={newProperty.yearBuilt}
                      onChange={(e) => setNewProperty({ ...newProperty, yearBuilt: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 2020"
                      min="1800"
                      max={new Date().getFullYear()}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Floors
                    </label>
                    <input
                      type="number"
                      value={newProperty.floors}
                      onChange={(e) => setNewProperty({ ...newProperty, floors: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 5"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Square Footage
                    </label>
                    <input
                      type="number"
                      value={newProperty.squareFootage}
                      onChange={(e) => setNewProperty({ ...newProperty, squareFootage: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Total sq ft"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lot Size (acres)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProperty.lotSize}
                      onChange={(e) => setNewProperty({ ...newProperty, lotSize: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 2.5"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parking Spaces
                    </label>
                    <input
                      type="number"
                      value={newProperty.parkingSpaces}
                      onChange={(e) => setNewProperty({ ...newProperty, parkingSpaces: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 100"
                      min="0"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newProperty.description}
                      onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Enter property description, features, or notes..."
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Information</h3>
                <p className="text-sm text-gray-600 mb-4">Property caretaker and/or management company details</p>
                
                {/* Caretaker Information */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Property Caretaker</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Caretaker Name
                      </label>
                      <input
                        type="text"
                        value={newProperty.caretakerName}
                        onChange={(e) => setNewProperty({ ...newProperty, caretakerName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., John Kamau"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Caretaker Phone
                      </label>
                      <input
                        type="tel"
                        value={newProperty.caretakerPhone}
                        onChange={(e) => setNewProperty({ ...newProperty, caretakerPhone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., +254 712 345 678"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Caretaker Email
                      </label>
                      <input
                        type="email"
                        value={newProperty.caretakerEmail}
                        onChange={(e) => setNewProperty({ ...newProperty, caretakerEmail: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., caretaker@example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Management Company Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Management Company</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={newProperty.managementCompany}
                        onChange={(e) => setNewProperty({ ...newProperty, managementCompany: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., ABC Property Management Ltd"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Person Name
                      </label>
                      <input
                        type="text"
                        value={newProperty.managementContactName}
                        onChange={(e) => setNewProperty({ ...newProperty, managementContactName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Jane Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={newProperty.managementPhone}
                        onChange={(e) => setNewProperty({ ...newProperty, managementPhone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., +254 700 123 456"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={newProperty.managementEmail}
                        onChange={(e) => setNewProperty({ ...newProperty, managementEmail: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., contact@abcpropertymanagement.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Photos & Videos */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Photos & Videos</h3>
                <p className="text-sm text-gray-600 mb-4">Upload property photos and add video links</p>
                
                {/* Photo Upload */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Property Photos</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, JPEG, GIF (MAX. 10MB each)</p>
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
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          {photoPreview.length} photo{photoPreview.length !== 1 ? 's' : ''} selected
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {photoPreview.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                  <h4 className="text-md font-medium text-gray-900 mb-3">Property Videos</h4>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={currentVideoUrl}
                        onChange={(e) => setCurrentVideoUrl(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVideoUrl())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    <p className="text-xs text-gray-500">
                      Supported: YouTube, Vimeo, or direct video links (.mp4, .webm, .ogg)
                    </p>

                    {newProperty.videoUrls.length > 0 && (
                      <div className="space-y-3 mt-4">
                        <p className="text-sm font-medium text-gray-700">
                          {newProperty.videoUrls.length} video{newProperty.videoUrls.length !== 1 ? 's' : ''} added
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {newProperty.videoUrls.map((url, index) => (
                            <div key={index} className="relative group border border-gray-200 rounded-lg overflow-hidden">
                              <div className="aspect-video bg-gray-100">
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
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                              <div className="p-2 bg-gray-50">
                                <p className="text-xs text-gray-600 truncate">{url}</p>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Amenities</h3>
                <p className="text-sm text-gray-600 mb-4">Select all amenities available at this property</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {commonAmenities.map((amenity) => (
                    <label
                      key={amenity}
                      className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newProperty.amenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
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
                onClick={() => setShowAddModal(false)}
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
                  !newProperty.totalUnits
                }
              >
                Add Property
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
