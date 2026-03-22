'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface Quote {
  id: string
  requestDate: string
  property: string
  unit: string
  issue: string
  vendor: string
  vendorCategory: string
  vendorRating: number
  status: 'pending' | 'submitted' | 'accepted' | 'rejected' | 'completed'
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  quote?: {
    materialsAmount: number
    laborAmount: number
    totalAmount: number
    estimatedDays: number
    notes: string
    submittedDate: string
  }
  acceptedDate?: string
  completedDate?: string
}

export default function LandlordQuotes() {
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'all'>('pending')
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)

  // Mock data - in production, filter by landlordId
  const quotes: Quote[] = [
    {
      id: 'QR-001',
      requestDate: '2025-11-14',
      property: 'Skyline Apartments',
      unit: 'Unit 305',
      issue: 'Kitchen sink drain completely blocked',
      vendor: 'Nairobi Plumbing Services',
      vendorCategory: 'Plumbing',
      vendorRating: 4.8,
      status: 'submitted',
      priority: 'High',
      quote: {
        materialsAmount: 8000,
        laborAmount: 7000,
        totalAmount: 15000,
        estimatedDays: 2,
        notes: 'Includes cleaning drain, replacing drain trap, and testing all connections',
        submittedDate: '2025-11-14'
      }
    },
    {
      id: 'QR-002',
      requestDate: '2025-11-15',
      property: 'Skyline Apartments',
      unit: 'Unit 102',
      issue: 'Replace all bathroom faucets (3) with modern fixtures',
      vendor: 'Nairobi Plumbing Services',
      vendorCategory: 'Plumbing',
      vendorRating: 4.8,
      status: 'pending',
      priority: 'Medium'
    },
    {
      id: 'QR-003',
      requestDate: '2025-11-12',
      property: 'Riverside Towers',
      unit: 'Unit 204',
      issue: 'Install new water heater (50 gallon capacity)',
      vendor: 'Nairobi Plumbing Services',
      vendorCategory: 'Plumbing',
      vendorRating: 4.8,
      status: 'accepted',
      priority: 'Medium',
      quote: {
        materialsAmount: 28000,
        laborAmount: 17000,
        totalAmount: 45000,
        estimatedDays: 2,
        notes: 'Includes removal of old unit and installation of energy-efficient model',
        submittedDate: '2025-11-13'
      },
      acceptedDate: '2025-11-13'
    },
    {
      id: 'QR-004',
      requestDate: '2025-11-10',
      property: 'Skyline Apartments',
      unit: 'Common Area - Basement',
      issue: 'Repair main water line leak in basement',
      vendor: 'Nairobi Plumbing Services',
      vendorCategory: 'Plumbing',
      vendorRating: 4.8,
      status: 'completed',
      priority: 'Urgent',
      quote: {
        materialsAmount: 45000,
        laborAmount: 40000,
        totalAmount: 85000,
        estimatedDays: 1,
        notes: 'Emergency repair with 24-hour completion',
        submittedDate: '2025-11-10'
      },
      acceptedDate: '2025-11-10',
      completedDate: '2025-11-11'
    },
    {
      id: 'QR-005',
      requestDate: '2025-11-08',
      property: 'Garden View Estate',
      unit: 'Unit 401',
      issue: 'AC unit not cooling properly',
      vendor: 'HVAC Masters',
      vendorCategory: 'HVAC',
      vendorRating: 4.6,
      status: 'accepted',
      priority: 'High',
      quote: {
        materialsAmount: 15000,
        laborAmount: 8000,
        totalAmount: 23000,
        estimatedDays: 1,
        notes: 'Refrigerant recharge and compressor check',
        submittedDate: '2025-11-09'
      },
      acceptedDate: '2025-11-09'
    },
    {
      id: 'QR-006',
      requestDate: '2025-11-05',
      property: 'Riverside Towers',
      unit: 'Unit 506',
      issue: 'Electrical outlet sparking in bedroom',
      vendor: 'Bright Electric Ltd',
      vendorCategory: 'Electrical',
      vendorRating: 4.7,
      status: 'completed',
      priority: 'Urgent',
      quote: {
        materialsAmount: 3500,
        laborAmount: 4500,
        totalAmount: 8000,
        estimatedDays: 1,
        notes: 'Replace faulty outlet and check circuit',
        submittedDate: '2025-11-05'
      },
      acceptedDate: '2025-11-05',
      completedDate: '2025-11-06'
    }
  ]

  const filteredQuotes = quotes.filter(q => {
    if (activeTab === 'pending') return q.status === 'pending' || q.status === 'submitted'
    if (activeTab === 'accepted') return q.status === 'accepted' || q.status === 'completed'
    return true
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-danger-100 text-danger-800'
      case 'High': return 'bg-warning-100 text-warning-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-success-100 text-success-800'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-neutral-100 text-neutral-800'
      case 'submitted': return 'bg-primary-100 text-primary-800'
      case 'accepted': return 'bg-success-100 text-success-800'
      case 'rejected': return 'bg-danger-100 text-danger-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  const pendingQuotes = quotes.filter(q => q.status === 'pending' || q.status === 'submitted')
  const acceptedQuotes = quotes.filter(q => q.status === 'accepted' || q.status === 'completed')
  const totalQuoteAmount = quotes.filter(q => q.quote).reduce((sum, q) => sum + (q.quote?.totalAmount || 0), 0)
  const completedAmount = quotes.filter(q => q.status === 'completed' && q.quote).reduce((sum, q) => sum + (q.quote?.totalAmount || 0), 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Repair Quotes</h1>
          <p className="text-neutral-600 mt-1">Review quotes from vendors for your properties</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-sm text-neutral-600">Total Quotes</p>
          <p className="text-2xl font-bold text-neutral-900">{quotes.length}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-sm text-neutral-600">Pending Review</p>
          <p className="text-2xl font-bold text-primary-600">{pendingQuotes.length}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-sm text-neutral-600">Total Quote Value</p>
          <p className="text-2xl font-bold text-neutral-900">KES {(totalQuoteAmount / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-sm text-neutral-600">Completed Value</p>
          <p className="text-2xl font-bold text-success-600">KES {(completedAmount / 1000).toFixed(0)}K</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-surface shadow rounded-lg">
        <div className="border-b border-neutral-200">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-success-500 text-success-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              Pending Review ({pendingQuotes.length})
            </button>
            <button
              onClick={() => setActiveTab('accepted')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'accepted'
                  ? 'border-success-500 text-success-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              Accepted/Completed ({acceptedQuotes.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-success-500 text-success-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              All Quotes ({quotes.length})
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {filteredQuotes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-neutral-400 text-5xl mb-4">📋</div>
              <p className="text-neutral-500">No quotes in this category</p>
            </div>
          ) : (
            filteredQuotes.map((quote) => (
              <div key={quote.id} className="border rounded-lg p-4 hover:bg-neutral-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-neutral-900">{quote.id}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(quote.priority)}`}>
                        {quote.priority}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(quote.status)}`}>
                        {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-neutral-600 mb-2">
                      {quote.property} - {quote.unit}
                    </p>
                    
                    <p className="text-neutral-900 mb-3">{quote.issue}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-neutral-600 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Vendor:</span>
                        <span>{quote.vendor}</span>
                        <span className="text-yellow-600">({quote.vendorRating} ⭐)</span>
                      </div>
                      <div>
                        <span className="font-medium">Category:</span> {quote.vendorCategory}
                      </div>
                    </div>

                    {quote.quote && (
                      <div className="bg-primary-50 border border-primary-200 rounded p-3 mb-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                          <div>
                            <p className="text-xs text-primary-700">Materials</p>
                            <p className="font-semibold text-primary-900">KES {quote.quote.materialsAmount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-primary-700">Labor</p>
                            <p className="font-semibold text-primary-900">KES {quote.quote.laborAmount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-primary-700">Total</p>
                            <p className="text-lg font-bold text-primary-900">KES {quote.quote.totalAmount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-primary-700">Duration</p>
                            <p className="font-semibold text-primary-900">{quote.quote.estimatedDays} day(s)</p>
                          </div>
                        </div>
                        <p className="text-sm text-neutral-700">{quote.quote.notes}</p>
                        <p className="text-xs text-neutral-600 mt-1">Submitted: {new Date(quote.quote.submittedDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-neutral-600">
                      <span>Requested: {new Date(quote.requestDate).toLocaleDateString()}</span>
                      {quote.acceptedDate && (
                        <span className="text-success-600">Accepted: {new Date(quote.acceptedDate).toLocaleDateString()}</span>
                      )}
                      {quote.completedDate && (
                        <span className="text-purple-600">Completed: {new Date(quote.completedDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    {quote.quote && (
                      <div className="text-right mb-3">
                        <p className="text-2xl font-bold text-neutral-900">KES {quote.quote.totalAmount.toLocaleString()}</p>
                      </div>
                    )}
                    <Button
                      onClick={() => setSelectedQuote(quote)}
                      variant="success"
                      size="sm"
                      className="w-full"
                    >
                      View Details
                    </Button>
                    {quote.status === 'submitted' && (
                      <div className="mt-2 space-y-2">
                        <Button 
                          variant="primary" 
                          size="sm"
                          className="w-full"
                        >
                          Accept Quote
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full"
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quote Details Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">Quote Details - {selectedQuote.id}</h2>
                <button
                  onClick={() => setSelectedQuote(null)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-neutral-50 rounded-lg p-4">
                  <h3 className="font-semibold text-neutral-900 mb-2">Property & Issue</h3>
                  <p className="text-sm text-neutral-600 mb-1">{selectedQuote.property} - {selectedQuote.unit}</p>
                  <p className="text-neutral-900">{selectedQuote.issue}</p>
                </div>

                <div className="bg-neutral-50 rounded-lg p-4">
                  <h3 className="font-semibold text-neutral-900 mb-2">Vendor Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-neutral-600">Name:</span>
                      <span className="ml-2 font-medium">{selectedQuote.vendor}</span>
                    </div>
                    <div>
                      <span className="text-neutral-600">Category:</span>
                      <span className="ml-2 font-medium">{selectedQuote.vendorCategory}</span>
                    </div>
                    <div>
                      <span className="text-neutral-600">Rating:</span>
                      <span className="ml-2 font-medium">{selectedQuote.vendorRating} ⭐</span>
                    </div>
                  </div>
                </div>

                {selectedQuote.quote && (
                  <div className="bg-primary-50 rounded-lg p-4">
                    <h3 className="font-semibold text-primary-900 mb-3">Quote Breakdown</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-neutral-700">Materials:</span>
                        <span className="font-semibold">KES {selectedQuote.quote.materialsAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-700">Labor:</span>
                        <span className="font-semibold">KES {selectedQuote.quote.laborAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-primary-200">
                        <span className="font-semibold text-neutral-900">Total:</span>
                        <span className="text-xl font-bold text-primary-900">KES {selectedQuote.quote.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="pt-2">
                        <span className="text-neutral-700">Estimated Duration:</span>
                        <span className="ml-2 font-semibold">{selectedQuote.quote.estimatedDays} day(s)</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-primary-200">
                      <p className="text-sm text-neutral-700"><strong>Notes:</strong> {selectedQuote.quote.notes}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  {selectedQuote.status === 'submitted' && (
                    <>
                      <Button 
                        variant="success" 
                        className="flex-1"
                      >
                        Accept Quote
                      </Button>
                      <Button 
                        variant="danger" 
                        className="flex-1"
                      >
                        Decline Quote
                      </Button>
                    </>
                  )}
                  {(selectedQuote.status === 'accepted' || selectedQuote.status === 'completed') && (
                    <Button
                      onClick={() => {
                        setSelectedQuote(null)
                        window.location.href = `/landlord/repairs?quote=${selectedQuote.id}`
                      }}
                      variant="primary"
                      className="flex-1"
                    >
                      View Work Evidence
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
