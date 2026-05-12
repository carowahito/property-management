'use client'

import { useState } from 'react'

interface QuoteRequest {
  id: string
  requestDate: string
  property: string
  unit: string
  description: string
  category: string
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  deadline: string
  status: 'pending' | 'submitted' | 'accepted' | 'rejected'
  submittedQuote?: {
    amount: number
    notes: string
    estimatedDays: number
    submittedDate: string
  }
}

export default function VendorQuotes() {
  const [activeTab, setActiveTab] = useState<'pending' | 'submitted' | 'accepted'>('pending')
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null)
  const [quoteForm, setQuoteForm] = useState({
    amount: '',
    estimatedDays: '',
    materials: '',
    labor: '',
    notes: ''
  })

  // Mock data - replace with API calls
  const quoteRequests: QuoteRequest[] = [
    {
      id: 'QR-001',
      requestDate: '2025-11-14',
      property: 'Skyline Apartments',
      unit: 'Unit 305',
      description: 'Kitchen sink drain is completely blocked. Water backing up into both sink basins.',
      category: 'Plumbing',
      priority: 'High',
      deadline: '2025-11-17',
      status: 'pending'
    },
    {
      id: 'QR-002',
      requestDate: '2025-11-15',
      property: 'Riverside Towers',
      unit: 'Unit 102',
      description: 'Replace all bathroom faucets (3) with modern fixtures.',
      category: 'Plumbing',
      priority: 'Medium',
      deadline: '2025-11-20',
      status: 'pending'
    },
    {
      id: 'QR-003',
      requestDate: '2025-11-12',
      property: 'Garden View Estate',
      unit: 'Unit 204',
      description: 'Install new water heater (50 gallon capacity) in utility room.',
      category: 'Plumbing',
      priority: 'Medium',
      deadline: '2025-11-19',
      status: 'submitted',
      submittedQuote: {
        amount: 45000,
        notes: 'Includes removal of old unit and installation of energy-efficient model',
        estimatedDays: 2,
        submittedDate: '2025-11-13'
      }
    },
    {
      id: 'QR-004',
      requestDate: '2025-11-10',
      property: 'Skyline Apartments',
      unit: 'Common Area',
      description: 'Repair main water line leak in basement.',
      category: 'Plumbing',
      priority: 'Urgent',
      deadline: '2025-11-16',
      status: 'accepted',
      submittedQuote: {
        amount: 85000,
        notes: 'Emergency repair with 24-hour completion',
        estimatedDays: 1,
        submittedDate: '2025-11-10'
      }
    },
    {
      id: 'QR-005',
      requestDate: '2025-11-16',
      property: 'Riverside Towers',
      unit: 'Unit 501',
      description: 'Low water pressure in entire unit. Investigate and repair.',
      category: 'Plumbing',
      priority: 'High',
      deadline: '2025-11-18',
      status: 'pending'
    }
  ]

  const filteredRequests = quoteRequests.filter(req => {
    if (activeTab === 'pending') return req.status === 'pending'
    if (activeTab === 'submitted') return req.status === 'submitted'
    if (activeTab === 'accepted') return req.status === 'accepted'
    return false
  })

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle quote submission
    console.log('Submitting quote:', quoteForm)
    setShowQuoteForm(false)
    setSelectedRequest(null)
    setQuoteForm({ amount: '', estimatedDays: '', materials: '', labor: '', notes: '' })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-danger-100 text-danger-800'
      case 'High': return 'bg-warning-100 text-warning-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-success-100 text-success-800'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Quote Requests</h1>
          <p className="text-neutral-600 mt-1">Review and submit quotes for maintenance requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-sm text-neutral-600">Pending Requests</p>
          <p className="text-2xl font-bold text-neutral-900">
            {quoteRequests.filter(q => q.status === 'pending').length}
          </p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-sm text-neutral-600">Quotes Submitted</p>
          <p className="text-2xl font-bold text-primary-600">
            {quoteRequests.filter(q => q.status === 'submitted').length}
          </p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-sm text-neutral-600">Quotes Accepted</p>
          <p className="text-2xl font-bold text-success-600">
            {quoteRequests.filter(q => q.status === 'accepted').length}
          </p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-sm text-neutral-600">Acceptance Rate</p>
          <p className="text-2xl font-bold text-warning-600">75%</p>
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
                  ? 'border-warning-500 text-warning-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              Pending Requests ({quoteRequests.filter(q => q.status === 'pending').length})
            </button>
            <button
              onClick={() => setActiveTab('submitted')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'submitted'
                  ? 'border-warning-500 text-warning-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              Submitted ({quoteRequests.filter(q => q.status === 'submitted').length})
            </button>
            <button
              onClick={() => setActiveTab('accepted')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'accepted'
                  ? 'border-warning-500 text-warning-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              Accepted ({quoteRequests.filter(q => q.status === 'accepted').length})
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-neutral-400 text-5xl mb-4">📋</div>
              <p className="text-neutral-500">No {activeTab} quote requests</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 hover:bg-neutral-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-neutral-900">{request.id}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                      <span className="text-sm text-neutral-600">Deadline: {new Date(request.deadline).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-neutral-600 mb-2">
                      {request.property} - {request.unit}
                    </p>
                    <p className="text-neutral-900 mb-3">{request.description}</p>
                    
                    {request.submittedQuote && (
                      <div className="bg-primary-50 border border-primary-200 rounded p-3 mt-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-primary-900">Your Quote</p>
                            <p className="text-lg font-bold text-primary-900">KES {request.submittedQuote.amount.toLocaleString()}</p>
                            <p className="text-sm text-primary-700">Est. {request.submittedQuote.estimatedDays} days</p>
                            <p className="text-sm text-neutral-600 mt-1">{request.submittedQuote.notes}</p>
                          </div>
                          <div className="text-sm text-neutral-600">
                            Submitted: {new Date(request.submittedQuote.submittedDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    {request.status === 'pending' && (
                      <button
                        onClick={() => {
                          setSelectedRequest(request)
                          setShowQuoteForm(true)
                        }}
                        className="bg-warning-600 text-white px-4 py-2 rounded hover:bg-warning-700"
                      >
                        Submit Quote
                      </button>
                    )}
                    {request.status === 'accepted' && (
                      <span className="text-success-600 font-medium">✓ Accepted</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quote Submission Form Modal */}
      {showQuoteForm && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">Submit Quote</h2>
                <button
                  onClick={() => {
                    setShowQuoteForm(false)
                    setSelectedRequest(null)
                  }}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-neutral-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-neutral-900 mb-2">{selectedRequest.id}</h3>
                <p className="text-sm text-neutral-600 mb-1">{selectedRequest.property} - {selectedRequest.unit}</p>
                <p className="text-neutral-900">{selectedRequest.description}</p>
              </div>

              <form onSubmit={handleSubmitQuote} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Materials Cost (KES)
                    </label>
                    <input
                      type="number"
                      required
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500"
                      placeholder="25000"
                      value={quoteForm.materials}
                      onChange={(e) => setQuoteForm({ ...quoteForm, materials: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Labor Cost (KES)
                    </label>
                    <input
                      type="number"
                      required
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500"
                      placeholder="15000"
                      value={quoteForm.labor}
                      onChange={(e) => setQuoteForm({ ...quoteForm, labor: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Total Amount (KES)
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500 bg-neutral-50"
                    value={(parseInt(quoteForm.materials || '0') + parseInt(quoteForm.labor || '0')).toString()}
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Estimated Completion (Days)
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500"
                    placeholder="3"
                    value={quoteForm.estimatedDays}
                    onChange={(e) => setQuoteForm({ ...quoteForm, estimatedDays: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Notes & Details
                  </label>
                  <textarea
                    rows={4}
                    required
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500"
                    placeholder="Include warranty information, materials to be used, and any other relevant details..."
                    value={quoteForm.notes}
                    onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-warning-600 text-white py-2 px-4 rounded-lg hover:bg-warning-700"
                  >
                    Submit Quote
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuoteForm(false)
                      setSelectedRequest(null)
                    }}
                    className="px-6 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
