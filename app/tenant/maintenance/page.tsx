'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatDate } from '@/lib/utils'

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState('open')

  const { data, isLoading, error } = useQuery({
    queryKey: ['tenant-maintenance-requests'],
    queryFn: () => fetch('/api/maintenance-requests').then(r => r.json()),
  })

  const requests: any[] = data?.maintenanceRequests || []

  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'open') return r.status === 'PENDING' || r.status === 'IN_PROGRESS'
    if (activeTab === 'completed') return r.status === 'COMPLETED'
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS':
        return 'bg-primary-100 text-primary-800'
      case 'COMPLETED':
        return 'bg-success-100 text-success-800'
      case 'CANCELLED':
        return 'bg-neutral-100 text-neutral-800'
      default:
        return 'bg-neutral-100 text-neutral-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pending'
      case 'IN_PROGRESS': return 'In Progress'
      case 'COMPLETED': return 'Completed'
      case 'CANCELLED': return 'Cancelled'
      default: return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'text-danger-600'
      case 'HIGH':
        return 'text-warning-600'
      case 'MEDIUM':
        return 'text-yellow-600'
      case 'LOW':
        return 'text-success-600'
      default:
        return 'text-neutral-600'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-neutral-600">Loading maintenance requests...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
          <p className="text-danger-800">Failed to load maintenance requests. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Maintenance Requests</h1>
        <Link
          href="/tenant/maintenance/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          + New Request
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
        <div className="bg-surface overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <p className="text-sm font-medium text-neutral-500">Pending</p>
            <p className="mt-1 text-2xl font-semibold text-yellow-600">
              {requests.filter((r) => r.status === 'PENDING').length}
            </p>
          </div>
        </div>
        <div className="bg-surface overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <p className="text-sm font-medium text-neutral-500">In Progress</p>
            <p className="mt-1 text-2xl font-semibold text-primary-600">
              {requests.filter((r) => r.status === 'IN_PROGRESS').length}
            </p>
          </div>
        </div>
        <div className="bg-surface overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <p className="text-sm font-medium text-neutral-500">Completed</p>
            <p className="mt-1 text-2xl font-semibold text-success-600">
              {requests.filter((r) => r.status === 'COMPLETED').length}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-surface shadow rounded-lg">
        <div className="border-b border-neutral-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('open')}
              className={`${
                activeTab === 'open'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Open & In Progress
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`${
                activeTab === 'completed'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Completed
            </button>
          </nav>
        </div>

        {/* Requests List */}
        <div className="divide-y divide-neutral-200">
          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No requests found</h3>
              <p className="text-neutral-500">
                {activeTab === 'open'
                  ? 'You have no open maintenance requests.'
                  : 'You have no completed maintenance requests.'}
              </p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request.id}
                className="p-6 hover:bg-neutral-50 transition-colors cursor-pointer"
                onClick={() => (window.location.href = `/tenant/maintenance/${request.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-neutral-900">
                        {request.title}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {getStatusLabel(request.status)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 mb-3">{request.description}</p>
                    <div className="flex items-center gap-6 text-sm text-neutral-500">
                      {request.category && (
                        <span className="flex items-center">
                          <strong className="mr-2">Category:</strong> {request.category}
                        </span>
                      )}
                      <span className="flex items-center">
                        <strong className={`mr-2 ${getPriorityColor(request.priority)}`}>
                          Priority:
                        </strong>
                        <span className={getPriorityColor(request.priority)}>
                          {request.priority}
                        </span>
                      </span>
                      <span className="flex items-center">
                        <strong className="mr-2">Submitted:</strong> {formatDate(request.createdAt)}
                      </span>
                      {request.property && (
                        <span className="flex items-center">
                          <strong className="mr-2">Property:</strong> {request.property.name}
                        </span>
                      )}
                    </div>
                    {request.status === 'COMPLETED' && request.resolvedAt && (
                      <div className="mt-2 text-sm text-success-600">
                        Resolved: {formatDate(request.resolvedAt)}
                      </div>
                    )}
                  </div>
                  <div>
                    <Link
                      href={`/tenant/maintenance/${request.id}`}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium"
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
      <div className="mt-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-primary-900 mb-2">Need Emergency Assistance?</h3>
        <p className="text-sm text-primary-800 mb-3">
          For urgent issues that require immediate attention (e.g., flooding, gas leak, no
          power), please call our emergency line:
        </p>
        <a
          href="tel:+254700000000"
          className="inline-flex items-center px-4 py-2 border border-primary-300 text-sm font-medium rounded-md text-primary-900 bg-surface hover:bg-primary-50"
        >
          📞 +254 700 000 000
        </a>
      </div>
    </div>
  )
}
