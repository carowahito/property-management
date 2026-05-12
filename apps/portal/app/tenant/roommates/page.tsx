'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Roommate {
  id: string
  name: string
  email: string
  phone: string
  relationshipType: 'spouse' | 'partner' | 'roommate' | 'family' | 'other'
  moveInDate: string
  leaseHolder: boolean
  status: 'active' | 'pending' | 'removed'
  emergencyContact: boolean
  photo?: string
}

export default function RoommatesPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    relationshipType: 'roommate',
    isEmergencyContact: false,
  })

  const roommates: Roommate[] = [
    {
      id: 'rm1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+254700000000',
      relationshipType: 'roommate',
      moveInDate: '2024-01-01',
      leaseHolder: true,
      status: 'active',
      emergencyContact: true,
    },
    {
      id: 'rm2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+254711111111',
      relationshipType: 'spouse',
      moveInDate: '2024-01-01',
      leaseHolder: false,
      status: 'active',
      emergencyContact: false,
    },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Submit to API
    alert('Roommate added! Pending property management approval.')
    setShowAddForm(false)
    setFormData({
      name: '',
      email: '',
      phone: '',
      relationshipType: 'roommate',
      isEmergencyContact: false,
    })
  }

  const getRelationshipBadge = (type: string) => {
    const colors: Record<string, string> = {
      spouse: 'bg-purple-100 text-purple-800',
      partner: 'bg-pink-100 text-pink-800',
      roommate: 'bg-primary-100 text-primary-800',
      family: 'bg-success-100 text-success-800',
      other: 'bg-neutral-100 text-neutral-800',
    }
    return colors[type] || colors.other
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Roommates & Occupants</h1>
        <p className="mt-2 text-neutral-600">
          Manage authorized occupants and roommate information
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-primary-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-primary-800">
              <strong>Important:</strong> All occupants must be approved by property management. Unauthorized occupants may result in lease violations.
            </p>
          </div>
        </div>
      </div>

      {/* Add Roommate Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
        >
          {showAddForm ? 'Cancel' : '+ Add Roommate/Occupant'}
        </button>
      </div>

      {/* Add Roommate Form */}
      {showAddForm && (
        <div className="bg-surface shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Add New Occupant</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="relationshipType" className="block text-sm font-medium text-neutral-700 mb-1">
                  Relationship *
                </label>
                <select
                  id="relationshipType"
                  value={formData.relationshipType}
                  onChange={(e) => setFormData({ ...formData, relationshipType: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="roommate">Roommate</option>
                  <option value="spouse">Spouse</option>
                  <option value="partner">Partner</option>
                  <option value="family">Family Member</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="isEmergencyContact"
                checked={formData.isEmergencyContact}
                onChange={(e) => setFormData({ ...formData, isEmergencyContact: e.target.checked })}
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
              />
              <label htmlFor="isEmergencyContact" className="ml-3 text-sm text-neutral-700">
                Add as emergency contact
              </label>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This request will be sent to property management for approval. The occupant will receive portal access once approved.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
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

      {/* Current Roommates List */}
      <div className="bg-surface shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">Current Occupants</h2>
        </div>

        <div className="divide-y divide-neutral-200">
          {roommates.map((roommate) => (
            <div key={roommate.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary-600">
                        {roommate.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-neutral-900">{roommate.name}</h3>
                      {roommate.leaseHolder && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          Lease Holder
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRelationshipBadge(roommate.relationshipType)}`}>
                        {roommate.relationshipType.charAt(0).toUpperCase() + roommate.relationshipType.slice(1)}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        roommate.status === 'active' ? 'bg-success-100 text-success-800' :
                        roommate.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-danger-100 text-danger-800'
                      }`}>
                        {roommate.status.charAt(0).toUpperCase() + roommate.status.slice(1)}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-neutral-600">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {roommate.email}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {roommate.phone}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Moved in: {new Date(roommate.moveInDate).toLocaleDateString()}
                      </div>
                      {roommate.emergencyContact && (
                        <div className="flex items-center text-primary-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Emergency Contact
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {!roommate.leaseHolder && (
                  <div>
                    <button className="text-sm text-danger-600 hover:text-danger-800 font-medium">
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bill Splitting Section */}
      <div className="mt-6 bg-surface shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Rent & Utility Split</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-neutral-100">
            <div>
              <p className="text-sm font-medium text-neutral-900">Monthly Rent Split</p>
              <p className="text-xs text-neutral-500">Total: KES 45,000</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-neutral-900">50% each (2 occupants)</p>
              <p className="text-xs text-neutral-500">KES 22,500 per person</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-neutral-100">
            <div>
              <p className="text-sm font-medium text-neutral-900">Utilities Split</p>
              <p className="text-xs text-neutral-500">Average: KES 8,000/month</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-neutral-900">50% each</p>
              <p className="text-xs text-neutral-500">KES 4,000 per person</p>
            </div>
          </div>
          <div className="pt-3">
            <Link
              href="/tenant/utilities"
              className="text-sm text-primary-600 hover:text-primary-800 font-medium"
            >
              View Detailed Utility Breakdown →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
