'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import TaskManager from '@/components/crm/TaskManager'

interface Props {
  params: Promise<{ id: string }>
}

export default function EnquiryCRMPage({ params }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'communications' | 'notes' | 'tasks' | 'activity'>('overview')
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [showResponseModal, setShowResponseModal] = useState(false)

  const enquiryId = 'E001' // Would come from unwrapped params

  // Mock enquiry data
  const enquiry = {
    id: 'E001',
    name: 'Grace Wanjiru',
    email: 'grace.w@email.com',
    phone: '+254 755 678 901',
    subject: 'Lease Terms Question',
    message: 'What are the penalties for early lease termination? I may need to relocate for work in 6 months.',
    status: 'Resolved',
    priority: 'Medium',
    category: 'Lease Policy',
    createdDate: '2024-11-14T09:30:00',
    resolvedDate: '2024-11-14T14:00:00',
    assignedTo: 'Carol White',
    relatedProperty: 'Sunset Apartments',
    relatedUnit: 'Unit 302',
    resolution: 'Provided detailed information about early termination clause. 60 days notice required, prorated rent refund applies.',
  }

  const enquiryNotes = [
    { id: '1', date: '2024-11-14T14:00:00', author: 'Carol White', note: 'Enquiry resolved. Sent detailed email with lease termination policy and FAQ document.' },
    { id: '2', date: '2024-11-14T10:00:00', author: 'Carol White', note: 'Reviewed current lease agreement. Customer is in good standing, no issues.' },
    { id: '3', date: '2024-11-14T09:35:00', author: 'System', note: 'Enquiry automatically assigned based on category rules.' },
  ]

  const communications = [
    { id: '1', date: '2024-11-14T14:00:00', type: 'email', subject: 'Re: Lease Terms Question - Early Termination Policy', status: 'sent' },
    { id: '2', date: '2024-11-14T09:45:00', type: 'email', subject: 'We received your enquiry', status: 'delivered' },
    { id: '3', date: '2024-11-14T09:30:00', type: 'in-app', subject: 'New enquiry submitted', status: 'read' },
  ]

  const activityLog = [
    { id: '1', date: '2024-11-14T14:00:00', type: 'status', description: 'Enquiry marked as Resolved', user: 'Carol White' },
    { id: '2', date: '2024-11-14T14:00:00', type: 'communication', description: 'Response email sent with policy details', user: 'Carol White' },
    { id: '3', date: '2024-11-14T14:00:00', type: 'note', description: 'Resolution note added', user: 'Carol White' },
    { id: '4', date: '2024-11-14T10:00:00', type: 'note', description: 'Lease review note added', user: 'Carol White' },
    { id: '5', date: '2024-11-14T09:45:00', type: 'communication', description: 'Auto-response email sent', user: 'System' },
    { id: '6', date: '2024-11-14T09:35:00', type: 'assignment', description: 'Enquiry assigned to Carol White', user: 'System' },
    { id: '7', date: '2024-11-14T09:30:00', type: 'enquiry', description: 'Enquiry created', user: 'Grace Wanjiru' },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'communication': return '💬'
      case 'note': return '📝'
      case 'task': return '✓'
      case 'status': return '🔄'
      case 'enquiry': return '💬'
      case 'assignment': return '👤'
      default: return '📌'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800'
      case 'In Progress': return 'bg-yellow-100 text-yellow-800'
      case 'Resolved': return 'bg-green-100 text-green-800'
      case 'Closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {enquiry.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{enquiry.subject}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(enquiry.status)}`}>
                  {enquiry.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(enquiry.priority)}`}>
                  {enquiry.priority} Priority
                </span>
              </div>
              <p className="text-gray-700 mb-3">{enquiry.message}</p>
              <div className="grid grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-gray-600">👤 Name</p>
                  <p className="font-medium text-gray-900">{enquiry.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">📧 Email</p>
                  <p className="font-medium text-gray-900">{enquiry.email}</p>
                </div>
                <div>
                  <p className="text-gray-600">📱 Phone</p>
                  <p className="font-medium text-gray-900">{enquiry.phone}</p>
                </div>
                <div>
                  <p className="text-gray-600">📂 Category</p>
                  <p className="font-medium text-gray-900">{enquiry.category}</p>
                </div>
                <div>
                  <p className="text-gray-600">👤 Assigned To</p>
                  <p className="font-medium text-gray-900">{enquiry.assignedTo}</p>
                </div>
                <div>
                  <p className="text-gray-600">📅 Created</p>
                  <p className="font-medium text-gray-900">{formatDate(enquiry.createdDate)}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">✏️ Edit</Button>
            {enquiry.status !== 'Resolved' && enquiry.status !== 'Closed' && (
              <Button variant="primary" onClick={() => setShowResponseModal(true)}>✉️ Respond</Button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Response Time</p>
          <p className="text-2xl font-bold text-green-600 mt-2">4.5 hrs</p>
          <p className="text-xs text-gray-500 mt-1">First response</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Resolution Time</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">4.5 hrs</p>
          <p className="text-xs text-gray-500 mt-1">Total time</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Communications</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">{communications.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total messages</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Related Property</p>
          <p className="text-lg font-bold text-orange-600 mt-2">{enquiry.relatedProperty}</p>
          <p className="text-xs text-gray-500 mt-1">{enquiry.relatedUnit}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-1 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'communications', label: 'Communications', icon: '💬' },
              { id: 'notes', label: 'Notes', icon: '📝' },
              { id: 'tasks', label: 'Tasks', icon: '✓' },
              { id: 'activity', label: 'Activity Log', icon: '📋' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-pink-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Enquiry Details */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Enquiry Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Enquiry ID</span>
                      <span className="text-sm font-medium text-gray-900">{enquiry.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enquiry.status)}`}>
                        {enquiry.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Priority</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(enquiry.priority)}`}>
                        {enquiry.priority}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Category</span>
                      <span className="text-sm font-medium text-gray-900">{enquiry.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Assigned To</span>
                      <span className="text-sm font-medium text-gray-900">{enquiry.assignedTo}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Created</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(enquiry.createdDate)}</p>
                    </div>
                    {enquiry.resolvedDate && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Resolved</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(enquiry.resolvedDate)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Related Property</p>
                      <p className="text-sm font-medium text-gray-900">{enquiry.relatedProperty}</p>
                      <p className="text-xs text-gray-500">{enquiry.relatedUnit}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resolution */}
              {enquiry.resolution && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Resolution</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-gray-900">{enquiry.resolution}</p>
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-2">
                  {activityLog.slice(0, 5).map(activity => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-xl">{getActivityIcon(activity.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{formatDate(activity.date)} • {activity.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Communications Tab */}
          {activeTab === 'communications' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Communication History</h3>
                <Button variant="primary">✉️ Send Message</Button>
              </div>
              {communications.map(comm => (
                <div key={comm.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{comm.subject}</h4>
                      <p className="text-sm text-gray-600 capitalize">{comm.type} • {formatDate(comm.date)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      comm.status === 'delivered' || comm.status === 'sent' ? 'bg-green-100 text-green-800' :
                      comm.status === 'read' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {comm.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Notes</h3>
                <Button variant="primary" onClick={() => setShowNoteModal(true)}>+ Add Note</Button>
              </div>
              {enquiryNotes.map(note => (
                <div key={note.id} className="border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-900 mb-2">{note.note}</p>
                  <p className="text-sm text-gray-500">
                    {note.author && `${note.author} • `}{formatDate(note.date)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <TaskManager
              stakeholderId={enquiryId}
              stakeholderName={enquiry.name}
              stakeholderType="Tenant"
            />
          )}

          {/* Activity Log Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 mb-4">Activity Timeline</h3>
              {activityLog.map(activity => (
                <div key={activity.id} className="flex items-start space-x-4 pb-4 border-b border-gray-200 last:border-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">{getActivityIcon(activity.type)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.description}</p>
                    <p className="text-sm text-gray-500">{formatDate(activity.date)} • {activity.user}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Note</h3>
            <textarea
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Enter note about this enquiry..."
            />
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowNoteModal(false)} className="flex-1">Cancel</Button>
              <Button variant="primary" className="flex-1">Save Note</Button>
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Send Response</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input
                  type="text"
                  value={`${enquiry.name} <${enquiry.email}>`}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  defaultValue={`Re: ${enquiry.subject}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="Type your response..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="markResolved" className="rounded" />
                <label htmlFor="markResolved" className="text-sm text-gray-700">
                  Mark enquiry as resolved after sending
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowResponseModal(false)} className="flex-1">Cancel</Button>
              <Button variant="primary" className="flex-1">Send Response</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
