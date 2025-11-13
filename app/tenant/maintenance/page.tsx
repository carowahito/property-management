'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState('open')

  // Mock data
  const requests = [
    {
      id: 1,
      title: 'Leaking Faucet in Kitchen',
      category: 'Plumbing',
      priority: 'High',
      status: 'In Progress',
      submittedDate: '2025-10-20',
      scheduledDate: '2025-10-25',
      vendor: 'Quick Fix Plumbing',
      description: 'The kitchen sink faucet has been dripping constantly for the past week.',
    },
    {
      id: 2,
      title: 'Broken Window Lock',
      category: 'General',
      priority: 'Medium',
      status: 'Open',
      submittedDate: '2025-10-22',
      scheduledDate: null,
      vendor: null,
      description: 'The lock on the bedroom window is broken and won\'t close properly.',
    },
    {
      id: 3,
      title: 'AC Not Cooling',
      category: 'HVAC',
      priority: 'Urgent',
      status: 'Completed',
      submittedDate: '2025-09-15',
      scheduledDate: '2025-09-16',
      completedDate: '2025-09-16',
      vendor: 'Cool Air Services',
      description: 'Air conditioner is running but not cooling the room.',
      rating: 5,
    },
    {
      id: 4,
      title: 'Light Fixture Not Working',
      category: 'Electrical',
      priority: 'Low',
      status: 'Completed',
      submittedDate: '2025-08-10',
      completedDate: '2025-08-12',
      vendor: 'Bright Spark Electricians',
      description: 'Living room ceiling light stopped working.',
      rating: 4,
    },
  ]

  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'open') return r.status === 'Open' || r.status === 'In Progress'
    if (activeTab === 'completed') return r.status === 'Completed'
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-yellow-100 text-yellow-800'
      case 'In Progress':
        return 'bg-blue-100 text-blue-800'
      case 'Completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'text-red-600'
      case 'High':
        return 'text-orange-600'
      case 'Medium':
        return 'text-yellow-600'
      case 'Low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Maintenance Requests</h1>
        <Link
          href="/tenant/maintenance/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          + New Request
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <p className="text-sm font-medium text-gray-500">Open Requests</p>
            <p className="mt-1 text-2xl font-semibold text-yellow-600">
              {requests.filter((r) => r.status === 'Open').length}
            </p>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <p className="text-sm font-medium text-gray-500">In Progress</p>
            <p className="mt-1 text-2xl font-semibold text-blue-600">
              {requests.filter((r) => r.status === 'In Progress').length}
            </p>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <p className="text-sm font-medium text-gray-500">Completed</p>
            <p className="mt-1 text-2xl font-semibold text-green-600">
              {requests.filter((r) => r.status === 'Completed').length}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('open')}
              className={`${
                activeTab === 'open'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Open & In Progress
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`${
                activeTab === 'completed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Completed
            </button>
          </nav>
        </div>

        {/* Requests List */}
        <div className="divide-y divide-gray-200">
          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-500">
                {activeTab === 'open'
                  ? 'You have no open maintenance requests.'
                  : 'You have no completed maintenance requests.'}
              </p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request.id}
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => (window.location.href = `/tenant/maintenance/${request.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {request.title}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{request.description}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span className="flex items-center">
                        <strong className="mr-2">Category:</strong> {request.category}
                      </span>
                      <span className="flex items-center">
                        <strong className={`mr-2 ${getPriorityColor(request.priority)}`}>
                          Priority:
                        </strong>
                        <span className={getPriorityColor(request.priority)}>
                          {request.priority}
                        </span>
                      </span>
                      <span className="flex items-center">
                        <strong className="mr-2">Submitted:</strong> {request.submittedDate}
                      </span>
                      {request.vendor && (
                        <span className="flex items-center">
                          <strong className="mr-2">Vendor:</strong> {request.vendor}
                        </span>
                      )}
                    </div>
                    {request.scheduledDate && request.status !== 'Completed' && (
                      <div className="mt-2 text-sm text-blue-600">
                        Scheduled for: {request.scheduledDate}
                      </div>
                    )}
                    {request.status === 'Completed' && request.rating && (
                      <div className="mt-2 flex items-center gap-1">
                        <span className="text-sm text-gray-500">Your rating:</span>
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-yellow-400">
                            {i < request.rating! ? '★' : '☆'}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <Link
                      href={`/tenant/maintenance/${request.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Need Emergency Assistance?</h3>
        <p className="text-sm text-blue-800 mb-3">
          For urgent issues that require immediate attention (e.g., flooding, gas leak, no
          power), please call our emergency line:
        </p>
        <a
          href="tel:+254700000000"
          className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-900 bg-white hover:bg-blue-50"
        >
          📞 +254 700 000 000
        </a>
      </div>
    </div>
  )
}
