'use client'

import { useState } from 'react'

interface Pet {
  id: string
  name: string
  type: 'dog' | 'cat' | 'bird' | 'fish' | 'other'
  breed: string
  age: number
  weight: number
  color: string
  photo?: string
  registrationDate: string
  status: 'approved' | 'pending' | 'denied'
  petFee: number
  monthlyPetRent: number
  vaccinations: {
    name: string
    date: string
    nextDue: string
    verified: boolean
  }[]
  emergencyVet: {
    name: string
    phone: string
  }
}

export default function PetManagementPage() {
  const [showAddPet, setShowAddPet] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'dog',
    breed: '',
    age: '',
    weight: '',
    color: '',
    vetName: '',
    vetPhone: '',
  })

  const pets: Pet[] = [
    {
      id: 'pet1',
      name: 'Max',
      type: 'dog',
      breed: 'Golden Retriever',
      age: 3,
      weight: 30,
      color: 'Golden',
      registrationDate: '2024-01-01',
      status: 'approved',
      petFee: 5000,
      monthlyPetRent: 1000,
      vaccinations: [
        {
          name: 'Rabies',
          date: '2024-01-15',
          nextDue: '2025-01-15',
          verified: true,
        },
        {
          name: 'DHPP',
          date: '2024-01-15',
          nextDue: '2025-01-15',
          verified: true,
        },
      ],
      emergencyVet: {
        name: 'Nairobi Animal Hospital',
        phone: '+254 722 000 000',
      },
    },
  ]

  const petPolicy = {
    maxPets: 2,
    allowedTypes: ['dog', 'cat', 'bird', 'fish'],
    weightLimit: 50, // kg
    petFee: 5000, // one-time
    monthlyPetRent: 1000,
    requiresApproval: true,
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Pet registration submitted! Pending property management approval.')
    setShowAddPet(false)
    setFormData({
      name: '',
      type: 'dog',
      breed: '',
      age: '',
      weight: '',
      color: '',
      vetName: '',
      vetPhone: '',
    })
  }

  const getPetIcon = (type: string) => {
    const icons: Record<string, string> = {
      dog: '🐕',
      cat: '🐈',
      bird: '🦜',
      fish: '🐠',
      other: '🐾',
    }
    return icons[type] || '🐾'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Pet Management</h1>
        <p className="mt-2 text-neutral-600">
          Register and manage your pets
        </p>
      </div>

      {/* Pet Policy Banner */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-primary-900 mb-2">Pet Policy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-primary-800">
          <div>
            <span className="font-medium">Max Pets:</span> {petPolicy.maxPets}
          </div>
          <div>
            <span className="font-medium">Weight Limit:</span> {petPolicy.weightLimit} kg
          </div>
          <div>
            <span className="font-medium">Pet Fee:</span> KES {petPolicy.petFee.toLocaleString()}
          </div>
          <div>
            <span className="font-medium">Monthly Rent:</span> KES {petPolicy.monthlyPetRent.toLocaleString()}/pet
          </div>
        </div>
        <p className="text-xs text-primary-700 mt-2">
          Allowed: Dogs, Cats, Birds, Fish. All pets require management approval and vaccination records.
        </p>
      </div>

      {/* Add Pet Button */}
      {pets.filter(p => p.status === 'approved').length < petPolicy.maxPets && (
        <div className="mb-6">
          <button
            onClick={() => setShowAddPet(!showAddPet)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
          >
            {showAddPet ? 'Cancel' : '+ Register New Pet'}
          </button>
        </div>
      )}

      {/* Add Pet Form */}
      {showAddPet && (
        <div className="bg-surface shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Register New Pet</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Pet Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Pet Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
                  <option value="fish">Fish</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Breed *
                </label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Age (years) *
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  min="0"
                  max="30"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <p className="text-xs text-neutral-500 mt-1">Weight limit: {petPolicy.weightLimit} kg</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Color/Markings *
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Veterinarian Name *
                </label>
                <input
                  type="text"
                  value={formData.vetName}
                  onChange={(e) => setFormData({ ...formData, vetName: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Veterinarian Phone *
                </label>
                <input
                  type="tel"
                  value={formData.vetPhone}
                  onChange={(e) => setFormData({ ...formData, vetPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Pet Photo
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-neutral-500 mt-1">Clear photo showing pet's face and markings</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Vaccination Records *
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              <p className="text-xs text-neutral-500 mt-1">Upload current vaccination records (PDF or images)</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-yellow-900 mb-2">Fees</h4>
              <div className="text-sm text-yellow-800 space-y-1">
                <div className="flex justify-between">
                  <span>One-time Pet Fee:</span>
                  <span className="font-semibold">KES {petPolicy.petFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Pet Rent:</span>
                  <span className="font-semibold">KES {petPolicy.monthlyPetRent.toLocaleString()}/month</span>
                </div>
              </div>
              <p className="text-xs text-yellow-700 mt-2">
                Fees will be added to your account upon approval
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddPet(false)}
                className="px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
              >
                Submit for Approval
              </button>
            </div>
          </form>
        </div>
      )}

      {/* My Pets */}
      <div className="space-y-4">
        {pets.map((pet) => (
          <div key={pet.id} className="bg-surface shadow rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="text-6xl">{getPetIcon(pet.type)}</div>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold text-neutral-900">{pet.name}</h2>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      pet.status === 'approved' ? 'bg-success-100 text-success-800' :
                      pet.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-danger-100 text-danger-800'
                    }`}>
                      {pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-neutral-600">{pet.breed} • {pet.age} years old</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pet Details */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">Pet Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-neutral-100">
                    <span className="text-neutral-600">Type</span>
                    <span className="font-medium text-neutral-900">{pet.type.charAt(0).toUpperCase() + pet.type.slice(1)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-neutral-100">
                    <span className="text-neutral-600">Weight</span>
                    <span className="font-medium text-neutral-900">{pet.weight} kg</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-neutral-100">
                    <span className="text-neutral-600">Color</span>
                    <span className="font-medium text-neutral-900">{pet.color}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-neutral-600">Registered</span>
                    <span className="font-medium text-neutral-900">{new Date(pet.registrationDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Vaccinations */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">Vaccinations</h3>
                <div className="space-y-2">
                  {pet.vaccinations.map((vax, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-neutral-50 rounded">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{vax.name}</p>
                        <p className="text-xs text-neutral-500">Next due: {new Date(vax.nextDue).toLocaleDateString()}</p>
                      </div>
                      {vax.verified && (
                        <span className="text-success-600">✓</span>
                      )}
                    </div>
                  ))}
                  <button className="text-sm text-primary-600 hover:text-primary-800 font-medium">
                    + Upload New Vaccination Record
                  </button>
                </div>
              </div>

              {/* Emergency Vet */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">Emergency Veterinarian</h3>
                <div className="bg-neutral-50 rounded p-3 text-sm">
                  <p className="font-medium text-neutral-900">{pet.emergencyVet.name}</p>
                  <a href={`tel:${pet.emergencyVet.phone}`} className="text-primary-600 hover:text-primary-800">
                    {pet.emergencyVet.phone}
                  </a>
                </div>
              </div>

              {/* Fees */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">Pet Fees</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-neutral-100">
                    <span className="text-neutral-600">Registration Fee (paid)</span>
                    <span className="font-medium text-neutral-900">KES {pet.petFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-neutral-600">Monthly Pet Rent</span>
                    <span className="font-medium text-neutral-900">KES {pet.monthlyPetRent.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pet Rules */}
      <div className="mt-6 bg-surface shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Pet Rules & Guidelines</h2>
        <ul className="space-y-2 text-sm text-neutral-700">
          <li className="flex items-start">
            <span className="text-primary-600 mr-2">•</span>
            Pets must be leashed in common areas
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-2">•</span>
            Clean up after your pet immediately
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-2">•</span>
            Pets must not disturb other residents (excessive barking, etc.)
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-2">•</span>
            Pets are not allowed in pool, gym, or clubhouse areas
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-2">•</span>
            Maintain current vaccination records at all times
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-2">•</span>
            Tenant is responsible for any damage caused by pets
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-2">•</span>
            Aggressive breeds may require additional approval
          </li>
        </ul>
      </div>
    </div>
  )
}
