'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatDate } from '@/lib/utils'

interface MaintenanceRequest {
  id: string
  title: string
  description: string
  unit: string | null
  priority: string
  status: string
  category: string | null
  createdAt: string
  resolvedAt: string | null
  tenant: {
    id: string
    name: string
    email: string
    phone: string | null
  }
  property: {
    id: string
    name: string
    address: string
    landlord?: { id: string; name: string } | null
  }
  _count: {
    workOrders: number
  }
}

async function fetchMaintenanceRequests(): Promise<{ maintenanceRequests: MaintenanceRequest[] }> {
  const res = await fetch('/api/maintenance-requests')
  if (!res.ok) throw new Error('Failed to fetch maintenance requests')
  return res.json()
}

export default function LandlordMaintenancePage() {
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['landlord-maintenance-requests'],
    queryFn: fetchMaintenanceRequests,
  })

  const getPriorityColor = (priority: string) => {
    return priority === 'URGENT' ? 'bg-danger-100 text-danger-800' :
           priority === 'HIGH' ? 'bg-warning-100 text-warning-800' :
           priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
           'bg-success-100 text-success-800'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS': return 'bg-primary-100 text-primary-800'
      case 'COMPLETED': return 'bg-success-100 text-success-800'
      case 'CANCELLED': return 'bg-neutral-100 text-neutral-800'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return 'In Progress'
      default: return status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, ' ')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-danger-600">Failed to load maintenance requests.</p>
      </div>
    )
  }

  const requests = data?.maintenanceRequests || []

  const pendingCount = requests.filter(r => r.status === 'PENDING').length
  const inProgressCount = requests.filter(r => r.status === 'IN_PROGRESS').length
  const completedCount = requests.filter(r => r.status === 'COMPLETED').length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Maintenance Requests</h1>
          <p className="text-neutral-600 mt-1">Track and manage maintenance across your properties</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/landlord/quotes"
            className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 text-sm"
          >
            View All Quotes
          </Link>
          <Link
            href="/landlord/repairs"
            className="bg-success-600 text-white px-4 py-2 rounded hover:bg-success-700 text-sm"
          >
            View Work Evidence
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface shadow rounded-lg p-6">
          <span className="text-3xl mb-2 block">📋</span>
          <p className="text-sm text-neutral-600">Total Requests</p>
          <p className="text-3xl font-bold text-neutral-900">{requests.length}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-6">
          <span className="text-3xl mb-2 block">⏳</span>
          <p className="text-sm text-neutral-600">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-6">
          <span className="text-3xl mb-2 block">🔧</span>
          <p className="text-sm text-neutral-600">In Progress</p>
          <p className="text-3xl font-bold text-primary-600">{inProgressCount}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-6">
          <span className="text-3xl mb-2 block">✅</span>
          <p className="text-sm text-neutral-600">Completed</p>
          <p className="text-3xl font-bold text-success-600">{completedCount}</p>
        </div>
      </div>

      <div className="bg-surface shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Property/Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Issue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Tenant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-neutral-200">
            {requests.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-neutral-500">
                  No maintenance requests found
                </td>
              </tr>
            )}
            {requests.map(req => (
              <tr key={req.id} className={`hover:bg-neutral-50 ${req.status === 'PENDING' ? 'bg-yellow-50/50' : ''}`}>
                <td className="px-6 py-4 text-sm text-neutral-900">
                  <div className="font-medium">{req.property.name}</div>
                  <div className="text-neutral-600">{req.unit || '-'}</div>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-900">
                  <div className="font-medium">{req.title}</div>
                  {req.category && <div className="text-xs text-neutral-500">{req.category}</div>}
                </td>
                <td className="px-6 py-4 text-sm text-neutral-600">{req.tenant.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(req.priority)}`}>
                    {req.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(req.status)}`}>
                    {getStatusLabel(req.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{formatDate(req.createdAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => setSelectedRequest(req)}
                    className="text-primary-600 hover:text-primary-800"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">Request Details</h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-neutral-50 rounded-lg p-4">
                  <h3 className="font-semibold text-neutral-900 mb-2">Property & Unit</h3>
                  <p className="text-neutral-900">{selectedRequest.property.name}{selectedRequest.unit ? ` - ${selectedRequest.unit}` : ''}</p>
                  <p className="text-sm text-neutral-600">Tenant: {selectedRequest.tenant.name}</p>
                </div>

                <div className="bg-neutral-50 rounded-lg p-4">
                  <h3 className="font-semibold text-neutral-900 mb-2">Issue</h3>
                  <p className="text-lg text-neutral-900 mb-2">{selectedRequest.title}</p>
                  <p className="text-sm text-neutral-700">{selectedRequest.description}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h3 className="font-semibold text-neutral-900 mb-1 text-sm">Priority</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedRequest.priority)}`}>
                      {selectedRequest.priority}
                    </span>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h3 className="font-semibold text-neutral-900 mb-1 text-sm">Status</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedRequest.status)}`}>
                      {getStatusLabel(selectedRequest.status)}
                    </span>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h3 className="font-semibold text-neutral-900 mb-1 text-sm">Submitted</h3>
                    <p className="text-sm text-neutral-700">{formatDate(selectedRequest.createdAt)}</p>
                  </div>
                </div>

                {selectedRequest._count.workOrders > 0 && (
                  <div className="bg-primary-50 rounded-lg p-4">
                    <p className="text-sm text-primary-800">
                      {selectedRequest._count.workOrders} work order{selectedRequest._count.workOrders !== 1 ? 's' : ''} assigned
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
