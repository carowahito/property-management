'use client'

import { useState } from 'react'
import Link from 'next/link'
import { mockMaintenanceRequests, getTenantById, getPropertyById, getLandlordById } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'

interface MaintenanceRequest {
  id: string
  unit: string
  property: string
  issue: string
  description: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  status: 'pending' | 'quote-requested' | 'quote-submitted' | 'assigned' | 'in-progress' | 'completed'
  tenant: string
  date: string
  vendor?: string
  vendorCategory?: string
  vendorRating?: number
  quoteAmount?: number
  quoteId?: string
}

export default function LandlordMaintenancePage() {
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null)

  const requests: MaintenanceRequest[] = [
    { 
      id: 'MR-001', 
      property: 'Skyline Apartments',
      unit: '4B', 
      issue: 'Leaking faucet', 
      description: 'Kitchen faucet drips constantly, wasting water',
      priority: 'high', 
      status: 'in-progress', 
      tenant: 'John Smith', 
      date: '2025-11-05',
      vendor: 'Nairobi Plumbing Services',
      vendorCategory: 'Plumbing',
      vendorRating: 4.8,
      quoteAmount: 15000,
      quoteId: 'QR-001'
    },
    { 
      id: 'MR-002', 
      property: 'Riverside Towers',
      unit: '7A', 
      issue: 'AC not cooling', 
      description: 'Air conditioning unit runs but does not cool the room',
      priority: 'urgent', 
      status: 'assigned', 
      tenant: 'Sarah Johnson', 
      date: '2025-11-04',
      vendor: 'HVAC Masters',
      vendorCategory: 'HVAC',
      vendorRating: 4.6,
      quoteAmount: 23000,
      quoteId: 'QR-005'
    },
    { 
      id: 'MR-003', 
      property: 'Skyline Apartments',
      unit: '2C', 
      issue: 'Door lock stuck', 
      description: 'Front door lock is difficult to turn, tenant struggling to enter',
      priority: 'medium', 
      status: 'quote-submitted', 
      tenant: 'Mike Davis', 
      date: '2025-11-03',
      vendor: 'Quick Fix Services',
      vendorCategory: 'General Maintenance',
      vendorRating: 4.5,
      quoteAmount: 5500,
      quoteId: 'QR-007'
    },
    { 
      id: 'MR-004', 
      property: 'Garden View Estate',
      unit: '1A', 
      issue: 'Broken window', 
      description: 'Living room window cracked, needs replacement',
      priority: 'medium', 
      status: 'quote-requested', 
      tenant: 'Emily Brown', 
      date: '2025-11-02'
    },
    { 
      id: 'MR-005', 
      property: 'Riverside Towers',
      unit: '3B', 
      issue: 'Water heater not working', 
      description: 'No hot water for 2 days, heater making strange noises',
      priority: 'high', 
      status: 'pending', 
      tenant: 'David Wilson', 
      date: '2025-11-01'
    },
    { 
      id: 'MR-006', 
      property: 'Skyline Apartments',
      unit: 'Basement', 
      issue: 'Main water line leak', 
      description: 'Emergency - basement flooding from main line',
      priority: 'urgent', 
      status: 'completed', 
      tenant: 'N/A (Common Area)', 
      date: '2025-11-10',
      vendor: 'Nairobi Plumbing Services',
      vendorCategory: 'Plumbing',
      vendorRating: 4.8,
      quoteAmount: 85000,
      quoteId: 'QR-004'
    },
  ]

  const getPriorityColor = (priority: string) => {
    return priority === 'urgent' ? 'bg-red-100 text-red-800' :
           priority === 'high' ? 'bg-orange-100 text-orange-800' :
           priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
           'bg-green-100 text-green-800'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'quote-requested': return 'bg-blue-100 text-blue-800'
      case 'quote-submitted': return 'bg-purple-100 text-purple-800'
      case 'assigned': return 'bg-teal-100 text-teal-800'
      case 'in-progress': return 'bg-orange-100 text-orange-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'quote-requested': return 'Quote Requested'
      case 'quote-submitted': return 'Quote Submitted'
      case 'in-progress': return 'In Progress'
      default: return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const pendingCount = requests.filter(r => r.status === 'pending' || r.status === 'quote-requested').length
  const inProgressCount = requests.filter(r => r.status === 'in-progress' || r.status === 'assigned').length
  const completedCount = requests.filter(r => r.status === 'completed').length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Requests</h1>
          <p className="text-gray-600 mt-1">Track and manage maintenance across your properties</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/landlord/quotes"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            View All Quotes
          </Link>
          <Link 
            href="/landlord/repairs"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
          >
            View Work Evidence
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <span className="text-3xl mb-2 block">📋</span>
          <p className="text-sm text-gray-600">Total Requests</p>
          <p className="text-3xl font-bold text-gray-900">{requests.length}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <span className="text-3xl mb-2 block">⏳</span>
          <p className="text-sm text-gray-600">Pending/Quotes</p>
          <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <span className="text-3xl mb-2 block">🔧</span>
          <p className="text-sm text-gray-600">In Progress</p>
          <p className="text-3xl font-bold text-blue-600">{inProgressCount}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <span className="text-3xl mb-2 block">✅</span>
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-3xl font-bold text-green-600">{completedCount}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property/Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quote Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map(req => (
              <tr key={req.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="font-medium">{req.property}</div>
                  <div className="text-gray-600">{req.unit}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="font-medium">{req.issue}</div>
                  <div className="text-gray-600 text-xs">{req.tenant}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {req.vendor ? (
                    <div>
                      <div className="font-medium text-gray-900">{req.vendor}</div>
                      <div className="text-xs text-gray-500">{req.vendorCategory} • {req.vendorRating} ⭐</div>
                    </div>
                  ) : (
                    <span className="text-gray-400">Not assigned</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {req.quoteAmount ? (
                    <div>
                      <div className="font-semibold text-gray-900">KES {req.quoteAmount.toLocaleString()}</div>
                      {req.quoteId && (
                        <Link 
                          href={`/landlord/quotes?id=${req.quoteId}`}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          View Quote →
                        </Link>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{req.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button 
                    onClick={() => setSelectedRequest(req)}
                    className="text-blue-600 hover:text-blue-800"
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
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Request Details - {selectedRequest.id}</h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Property & Unit</h3>
                  <p className="text-gray-900">{selectedRequest.property} - {selectedRequest.unit}</p>
                  <p className="text-sm text-gray-600">Tenant: {selectedRequest.tenant}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Issue</h3>
                  <p className="text-lg text-gray-900 mb-2">{selectedRequest.issue}</p>
                  <p className="text-sm text-gray-700">{selectedRequest.description}</p>
                </div>

                {selectedRequest.vendor && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Assigned Vendor</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-blue-700">Name:</span>
                        <span className="ml-2 font-medium">{selectedRequest.vendor}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Category:</span>
                        <span className="ml-2 font-medium">{selectedRequest.vendorCategory}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Rating:</span>
                        <span className="ml-2 font-medium">{selectedRequest.vendorRating} ⭐</span>
                      </div>
                      {selectedRequest.quoteAmount && (
                        <div>
                          <span className="text-blue-700">Quote:</span>
                          <span className="ml-2 font-medium">KES {selectedRequest.quoteAmount.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  {selectedRequest.quoteId && (
                    <Link
                      href={`/landlord/quotes?id=${selectedRequest.quoteId}`}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-center"
                    >
                      View Quote Details
                    </Link>
                  )}
                  {selectedRequest.status === 'completed' && (
                    <Link
                      href={`/landlord/repairs?job=${selectedRequest.id}`}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 text-center"
                    >
                      View Work Evidence
                    </Link>
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
