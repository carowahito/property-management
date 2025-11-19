'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import TaskManager from '@/components/crm/TaskManager'

interface Props {
  params: Promise<{ id: string }>
}

export default function LeadCRMPage({ params }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'communications' | 'notes' | 'tasks' | 'activity'>('overview')
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [leadId, setLeadId] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => setLeadId(p.id))
  }, [params])

  if (!leadId) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  }

  // Mock lead data - in production, fetch based on leadId
  const lead = {
    id: leadId,
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@email.com',
    phone: '+254 790 123 456',
    type: 'Property Inquiry',
    status: 'Qualified',
    source: 'Website',
    createdDate: '2024-11-10T09:00:00',
    lastContact: '2024-11-14T10:30:00',
    assignedTo: 'Alice Johnson',
    notes: 'Interested in 2-bedroom apartment in Westlands. Budget: KES 80,000/month',
    company: 'Tech Innovations Ltd',
    budget: 'KES 70,000 - 90,000',
    moveInDate: '2024-12-01',
    preferences: '2 bedrooms, parking, near public transport',
  }

  const leadNotes = [
    { id: '1', date: '2024-11-14T10:30:00', author: 'Alice Johnson', note: 'Showed virtual tour of 3 properties in Westlands. Client very interested in Sunset Apartments Unit 203.' },
    { id: '2', date: '2024-11-12T14:00:00', author: 'Alice Johnson', note: 'Initial call completed. Lead is serious, has stable income, works at Tech Innovations Ltd. Pre-qualified.' },
    { id: '3', date: '2024-11-10T09:15:00', author: 'System', note: 'Lead created from website inquiry form.' },
  ]

  const communications = [
    { id: '1', date: '2024-11-14T10:00:00', type: 'email', subject: 'Property Options in Westlands', status: 'sent' },
    { id: '2', date: '2024-11-12T14:30:00', type: 'phone', subject: 'Initial consultation call', status: 'completed' },
    { id: '3', date: '2024-11-10T09:30:00', type: 'email', subject: 'Thank you for your inquiry', status: 'delivered' },
  ]

  const activityLog = [
    { id: '1', date: '2024-11-14T10:30:00', type: 'note', description: 'Note added - Virtual tour completed', user: 'Alice Johnson' },
    { id: '2', date: '2024-11-14T10:00:00', type: 'communication', description: 'Email sent - Property options', user: 'System' },
    { id: '3', date: '2024-11-13T09:00:00', type: 'status', description: 'Status changed from Contacted to Qualified', user: 'Alice Johnson' },
    { id: '4', date: '2024-11-12T14:30:00', type: 'communication', description: 'Phone call completed', user: 'Alice Johnson' },
    { id: '5', date: '2024-11-12T14:00:00', type: 'note', description: 'Initial consultation notes added', user: 'Alice Johnson' },
    { id: '6', date: '2024-11-10T09:15:00', type: 'lead', description: 'Lead created from website', user: 'System' },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'communication': return '💬'
      case 'note': return '📝'
      case 'task': return '✓'
      case 'status': return '🔄'
      case 'lead': return '🎯'
      default: return '📌'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Enquiry': return 'bg-blue-100 text-blue-800'
      case 'Prospect': return 'bg-purple-100 text-purple-800'
      case 'Qualified': return 'bg-green-100 text-green-800'
      case 'Viewing Scheduled': return 'bg-cyan-100 text-cyan-800'
      case 'Application Submitted': return 'bg-indigo-100 text-indigo-800'
      case 'Tenant': return 'bg-emerald-100 text-emerald-800'
      case 'Past Tenant': return 'bg-amber-100 text-amber-800'
      case 'Dropped': return 'bg-orange-100 text-orange-800'
      case 'Lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {lead.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{lead.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lead.status)}`}>
                  {lead.status}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  Lead - {lead.type}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-gray-600">📧 Email</p>
                  <p className="font-medium text-gray-900">{lead.email}</p>
                </div>
                <div>
                  <p className="text-gray-600">📱 Phone</p>
                  <p className="font-medium text-gray-900">{lead.phone}</p>
                </div>
                <div>
                  <p className="text-gray-600">🏢 Company</p>
                  <p className="font-medium text-gray-900">{lead.company || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">📊 Source</p>
                  <p className="font-medium text-gray-900">{lead.source}</p>
                </div>
                <div>
                  <p className="text-gray-600">👤 Assigned To</p>
                  <p className="font-medium text-gray-900">{lead.assignedTo}</p>
                </div>
                <div>
                  <p className="text-gray-600">📅 Created</p>
                  <p className="font-medium text-gray-900">{formatDate(lead.createdDate)}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowEditModal(true)}>✏️ Edit</Button>
            <Button variant="primary" onClick={() => setShowConvertModal(true)}>🎯 Convert to Tenant</Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Budget Range</p>
          <p className="text-2xl font-bold text-green-600 mt-2">{lead.budget}</p>
          <p className="text-xs text-gray-500 mt-1">Monthly rent</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Move-in Date</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">{formatDate(lead.moveInDate)}</p>
          <p className="text-xs text-gray-500 mt-1">Target date</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Communications</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">{communications.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total interactions</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Last Contact</p>
          <p className="text-2xl font-bold text-orange-600 mt-2">{formatDate(lead.lastContact)}</p>
          <p className="text-xs text-gray-500 mt-1">Most recent</p>
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
                    ? 'bg-indigo-600 text-white'
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
                {/* Lead Details */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Lead Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Lead ID</span>
                      <span className="text-sm font-medium text-gray-900">{lead.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Type</span>
                      <span className="text-sm font-medium text-gray-900">{lead.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Source</span>
                      <span className="text-sm font-medium text-gray-900">{lead.source}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Assigned To</span>
                      <span className="text-sm font-medium text-gray-900">{lead.assignedTo}</span>
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Requirements</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Budget</p>
                      <p className="text-sm font-medium text-gray-900">{lead.budget}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Move-in Date</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(lead.moveInDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Preferences</p>
                      <p className="text-sm font-medium text-gray-900">{lead.preferences}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Initial Notes */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Initial Notes</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-900">{lead.notes}</p>
                </div>
              </div>

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
                      comm.status === 'completed' || comm.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      comm.status === 'sent' ? 'bg-blue-100 text-blue-800' :
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
              {leadNotes.map(note => (
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
              stakeholderId={leadId}
              stakeholderName={lead.name}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter note about this lead..."
            />
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowNoteModal(false)} className="flex-1">Cancel</Button>
              <Button variant="primary" className="flex-1">Save Note</Button>
            </div>
          </div>
        </div>
      )}

      {/* Convert Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Convert Lead to Tenant</h3>
            <p className="text-gray-600 mb-6">
              This will convert <strong>{lead.name}</strong> from a lead to an active tenant. 
              You'll need to complete the lease agreement process.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowConvertModal(false)} className="flex-1">Cancel</Button>
              <Button variant="primary" className="flex-1">Convert & Create Lease</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Edit Lead</h3>
            
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  defaultValue={lead.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue={lead.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    defaultValue={lead.phone}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status - Primary Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  defaultValue={lead.status}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="Enquiry">Enquiry</option>
                  <option value="Prospect">Prospect</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Viewing Scheduled">Viewing Scheduled</option>
                  <option value="Application Submitted">Application Submitted</option>
                  <option value="Tenant">Tenant</option>
                  <option value="Past Tenant">Past Tenant</option>
                  <option value="Dropped">Dropped</option>
                  <option value="Lost">Lost</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Track lead progression through the sales pipeline
                </p>
              </div>

              {/* Type & Source */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    defaultValue={lead.type}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="Property Inquiry">Property Inquiry</option>
                    <option value="Lease Inquiry">Lease Inquiry</option>
                    <option value="Commercial Space">Commercial Space</option>
                    <option value="Apartment Rental">Apartment Rental</option>
                    <option value="Office Space">Office Space</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                  <select
                    defaultValue={lead.source}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Email Campaign">Email Campaign</option>
                    <option value="Previous Customer">Previous Customer</option>
                  </select>
                </div>
              </div>

              {/* Assigned To & Company */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                  <select
                    defaultValue={lead.assignedTo}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="Alice Johnson">Alice Johnson</option>
                    <option value="Bob Smith">Bob Smith</option>
                    <option value="Carol White">Carol White</option>
                    <option value="David Brown">David Brown</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company (Optional)</label>
                  <input
                    type="text"
                    defaultValue={lead.company}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Company name"
                  />
                </div>
              </div>

              {/* Budget & Move-in Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                  <input
                    type="text"
                    defaultValue={lead.budget}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., KES 50,000 - 70,000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Move-in Date</label>
                  <input
                    type="date"
                    defaultValue={lead.moveInDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferences</label>
                <textarea
                  rows={3}
                  defaultValue={lead.preferences}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Bedrooms, amenities, location preferences..."
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  rows={4}
                  defaultValue={lead.notes}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Additional information about this lead..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
              <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                variant="primary" 
                className="flex-1"
                onClick={() => {
                  // In production, save changes here
                  setShowEditModal(false)
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
