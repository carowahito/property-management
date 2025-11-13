'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function MaintenanceDetailPage() {
  const params = useParams()
  const requestId = params.id as string

  // Mock maintenance request data - would be fetched based on requestId
  const request = {
    id: requestId,
    title: 'Leaking Faucet in Kitchen',
    category: 'Plumbing',
    priority: 'High',
    status: 'In Progress',
    description: 'The kitchen faucet has been leaking for the past two days. Water drips continuously even when fully closed. It\'s wasting a lot of water and the dripping sound is disturbing.',
    submittedDate: '2025-10-20',
    updatedDate: '2025-10-21',
    scheduledDate: '2025-10-23',
    estimatedCompletion: '2025-10-23',
    propertyAddress: '123 Main Street, Apt 4B, Nairobi',
    photos: [
      'https://via.placeholder.com/400x300?text=Faucet+Photo+1',
      'https://via.placeholder.com/400x300?text=Faucet+Photo+2',
    ],
    vendor: {
      name: 'Quick Fix Plumbing',
      phone: '+254 722 000 000',
      assignedDate: '2025-10-21',
    },
    updates: [
      {
        date: '2025-10-21 10:30 AM',
        author: 'Property Manager',
        message: 'Maintenance request received and assigned to Quick Fix Plumbing.',
        type: 'status',
      },
      {
        date: '2025-10-21 02:15 PM',
        author: 'Quick Fix Plumbing',
        message: 'Vendor has reviewed the request and scheduled a visit for Oct 23.',
        type: 'vendor',
      },
      {
        date: '2025-10-22 09:00 AM',
        author: 'Quick Fix Plumbing',
        message: 'Parts ordered. Will be delivered by Oct 23 morning.',
        type: 'vendor',
      },
    ],
  }

  const [newMessage, setNewMessage] = useState('')

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    // TODO: Implement message sending
    alert('Message sent successfully!')
    setNewMessage('')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-yellow-100 text-yellow-800'
      case 'In Progress':
        return 'bg-blue-100 text-blue-800'
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Cancelled':
        return 'bg-red-100 text-red-800'
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
      {/* Breadcrumb */}
      <nav className="mb-6 flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href="/tenant/maintenance" className="text-blue-600 hover:text-blue-800">
              Maintenance
            </Link>
          </li>
          <li>
            <span className="mx-2 text-gray-400">/</span>
          </li>
          <li className="text-gray-500">Request #{requestId}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{request.title}</h1>
            <p className="mt-2 text-gray-600">Request #{requestId}</p>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              request.status
            )}`}
          >
            {request.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="font-medium text-gray-900">{request.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Priority</p>
                <p className={`font-medium ${getPriorityColor(request.priority)}`}>
                  {request.priority}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Submitted Date</p>
                <p className="font-medium text-gray-900">{request.submittedDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium text-gray-900">{request.updatedDate}</p>
              </div>
              {request.scheduledDate && (
                <div>
                  <p className="text-sm text-gray-600">Scheduled Date</p>
                  <p className="font-medium text-gray-900">{request.scheduledDate}</p>
                </div>
              )}
              {request.estimatedCompletion && (
                <div>
                  <p className="text-sm text-gray-600">Estimated Completion</p>
                  <p className="font-medium text-gray-900">{request.estimatedCompletion}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Description</p>
              <p className="text-gray-900">{request.description}</p>
            </div>
          </div>

          {/* Photos */}
          {request.photos && request.photos.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Photos</h2>
              <div className="grid grid-cols-2 gap-4">
                {request.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Maintenance photo ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                    <button className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 font-medium">
                        View Full Size
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Timeline */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h2>
            <div className="space-y-4">
              {request.updates.map((update, index) => (
                <div key={index} className="flex">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        update.type === 'status'
                          ? 'bg-blue-100'
                          : update.type === 'vendor'
                          ? 'bg-green-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      {update.type === 'status' ? '📋' : update.type === 'vendor' ? '🔧' : '💬'}
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{update.author}</p>
                      <p className="text-xs text-gray-500">{update.date}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{update.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Comment */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add a Comment</h2>
            <form onSubmit={handleSendMessage}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any additional information or questions about this request..."
              ></textarea>
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Vendor Information */}
          {request.vendor && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Assigned Vendor</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="font-medium text-gray-900">{request.vendor.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <a
                    href={`tel:${request.vendor.phone}`}
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    {request.vendor.phone}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Assigned Date</p>
                  <p className="font-medium text-gray-900">{request.vendor.assignedDate}</p>
                </div>
              </div>
            </div>
          )}

          {/* Property Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Property</h2>
            <p className="text-sm text-gray-900">{request.propertyAddress}</p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                Contact Support
              </button>
              {request.status !== 'Completed' && request.status !== 'Cancelled' && (
                <button className="w-full px-4 py-2 bg-white border border-red-300 text-red-600 rounded-md text-sm font-medium hover:bg-red-50">
                  Cancel Request
                </button>
              )}
              {request.status === 'Completed' && (
                <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50">
                  Rate Service
                </button>
              )}
            </div>
          </div>

          {/* Need Help */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Need Immediate Help?</h3>
            <p className="text-sm text-blue-800 mb-3">
              For urgent maintenance issues, call our emergency line:
            </p>
            <a
              href="tel:+254711111111"
              className="block text-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              📞 +254 711 111 111
            </a>
            <p className="mt-2 text-xs text-blue-700">Available 24/7 for emergencies</p>
          </div>
        </div>
      </div>
    </div>
  )
}
