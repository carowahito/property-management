'use client'

import { useState } from 'react'

interface SubleaseRequest {
  id: string
  status: 'draft' | 'pending' | 'approved' | 'declined' | 'active' | 'completed'
  startDate: string
  endDate: string
  subtenantName?: string
  subtenantEmail?: string
  subtenantPhone?: string
  reason: string
  submittedDate?: string
  approvedDate?: string
  monthlyRent: number
}

export default function SubleaseManagementPage() {
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'request' | 'find'>('overview')
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    subtenantName: '',
    subtenantEmail: '',
    subtenantPhone: '',
  })

  const currentLease = {
    unitNumber: 'Apt 4B',
    leaseStart: '2024-01-01',
    leaseEnd: '2024-12-31',
    monthlyRent: 45000,
    remainingMonths: 2,
  }

  const subleaseRequests: SubleaseRequest[] = [
    {
      id: 'sub1',
      status: 'pending',
      startDate: '2025-12-01',
      endDate: '2025-12-31',
      subtenantName: 'Emily Johnson',
      subtenantEmail: 'emily.j@example.com',
      subtenantPhone: '+254722000000',
      reason: 'Temporary work assignment abroad',
      submittedDate: '2025-11-01',
      monthlyRent: 45000,
    },
  ]

  const potentialSubtenants = [
    {
      id: 'p1',
      name: 'Alex Thompson',
      email: 'alex.t@example.com',
      phone: '+254733000000',
      moveInDate: '2025-12-01',
      duration: '2 months',
      verified: true,
      rating: 4.8,
    },
    {
      id: 'p2',
      name: 'Maria Garcia',
      email: 'maria.g@example.com',
      phone: '+254744000000',
      moveInDate: '2025-11-15',
      duration: '3 months',
      verified: true,
      rating: 4.9,
    },
  ]

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Sublease request submitted! Property management will review within 3-5 business days.')
    setShowRequestForm(false)
    setFormData({
      startDate: '',
      endDate: '',
      reason: '',
      subtenantName: '',
      subtenantEmail: '',
      subtenantPhone: '',
    })
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-purple-100 text-purple-800',
    }
    return badges[status] || badges.draft
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sublease Management</h1>
        <p className="mt-2 text-gray-600">
          Request sublease approval and manage sublease agreements
        </p>
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> All subleases require property management approval. Unauthorized subleases may result in lease termination.
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('request')}
            className={`${
              activeTab === 'request'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Request Sublease
          </button>
          <button
            onClick={() => setActiveTab('find')}
            className={`${
              activeTab === 'find'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Find Subtenants
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Current Lease Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Current Lease</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Unit</p>
                <p className="text-lg font-medium text-gray-900">{currentLease.unitNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Lease Period</p>
                <p className="text-lg font-medium text-gray-900">
                  {new Date(currentLease.leaseStart).toLocaleDateString()} - {new Date(currentLease.leaseEnd).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Rent</p>
                <p className="text-lg font-medium text-gray-900">KES {currentLease.monthlyRent.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Remaining</p>
                <p className="text-lg font-medium text-gray-900">{currentLease.remainingMonths} months</p>
              </div>
            </div>
          </div>

          {/* Sublease Requests */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Sublease Requests</h2>
              <button
                onClick={() => setActiveTab('request')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                + New Request
              </button>
            </div>

            {subleaseRequests.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">🏠</div>
                <p className="text-gray-600 mb-4">No sublease requests</p>
                <button
                  onClick={() => setActiveTab('request')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {subleaseRequests.map((request) => (
                  <div key={request.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{request.reason}</p>
                      </div>
                    </div>

                    {request.subtenantName && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Proposed Subtenant</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><strong>Name:</strong> {request.subtenantName}</p>
                          <p><strong>Email:</strong> {request.subtenantEmail}</p>
                          <p><strong>Phone:</strong> {request.subtenantPhone}</p>
                        </div>
                      </div>
                    )}

                    {request.submittedDate && (
                      <p className="mt-4 text-xs text-gray-500">
                        Submitted: {new Date(request.submittedDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sublease Policy */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sublease Policy</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p>Sublease requests must be submitted at least 30 days in advance</p>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p>Minimum sublease period: 2 months</p>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p>Subtenant must pass background and credit check</p>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p>Original tenant remains responsible for lease obligations</p>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p>Sublease fee: KES 15,000 (one-time administrative fee)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Sublease Tab */}
      {activeTab === 'request' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit Sublease Request</h2>
          <form onSubmit={handleSubmitRequest} className="space-y-6">
            {/* Sublease Period */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Sublease Period</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    max={currentLease.leaseEnd}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    max={currentLease.leaseEnd}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Sublease *
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
                placeholder="Please explain why you need to sublease..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Proposed Subtenant (Optional) */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Proposed Subtenant (Optional)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                If you already have someone in mind, provide their information. Otherwise, we can help you find a qualified subtenant.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.subtenantName}
                    onChange={(e) => setFormData({ ...formData, subtenantName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.subtenantEmail}
                    onChange={(e) => setFormData({ ...formData, subtenantEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.subtenantPhone}
                    onChange={(e) => setFormData({ ...formData, subtenantPhone: e.target.value })}
                    placeholder="+254700000000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Fee Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">
                    <strong>Sublease Fee:</strong> A one-time administrative fee of KES 15,000 will be charged upon approval. Processing time: 3-5 business days.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Find Subtenants Tab */}
      {activeTab === 'find' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Find Qualified Subtenants</h2>
            <p className="text-sm text-gray-600 mb-6">
              Browse pre-screened potential subtenants looking for short-term rentals in your area.
            </p>

            {/* Search Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Move-in Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Any duration</option>
                  <option>2-3 months</option>
                  <option>3-6 months</option>
                  <option>6+ months</option>
                </select>
              </div>
              <div className="flex items-end">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                  Search
                </button>
              </div>
            </div>

            {/* Potential Subtenants */}
            <div className="space-y-4">
              {potentialSubtenants.map((person) => (
                <div key={person.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-blue-600">
                          {person.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900">{person.name}</h3>
                          {person.verified && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>Move-in: {new Date(person.moveInDate).toLocaleDateString()}</p>
                          <p>Duration: {person.duration}</p>
                          <div className="flex items-center">
                            <span className="text-yellow-500">★</span>
                            <span className="ml-1">{person.rating} rating</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                        Contact
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-semibold text-blue-600">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Submit Sublease Request</h3>
                  <p className="text-sm text-gray-600">Fill out the sublease request form with your dates and reason</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-semibold text-blue-600">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Find or Propose Subtenant</h3>
                  <p className="text-sm text-gray-600">Browse our platform or propose your own qualified subtenant</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-semibold text-blue-600">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Background Check</h3>
                  <p className="text-sm text-gray-600">Property management screens the proposed subtenant</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-semibold text-blue-600">4</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Sign Agreement & Transfer</h3>
                  <p className="text-sm text-gray-600">Once approved, sign the sublease agreement and transfer possession</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
