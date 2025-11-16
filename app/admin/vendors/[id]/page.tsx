'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { mockVendors, mockMaintenanceRequests } from '@/lib/mock-data'
import TaskManager from '@/components/crm/TaskManager'

interface Props {
  params: Promise<{ id: string }>
}

export default function VendorCRMPage({ params }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'invoices' | 'performance' | 'documents' | 'communications' | 'notes' | 'tasks' | 'activity'>('overview')
  const [showNoteModal, setShowNoteModal] = useState(false)

  const vendorId = '1'
  const vendor = mockVendors.find(v => v.id === vendorId)

  if (!vendor) {
    return <div>Vendor not found</div>
  }

  // Get related data (mock)
  const vendorJobs = mockMaintenanceRequests.filter(m => ['1', '2', '3'].includes(m.id))

  const vendorNotes = [
    { id: '1', date: '2024-11-20T10:00:00', author: 'Alice Johnson', note: 'Excellent work on emergency plumbing repair. Very responsive.' },
    { id: '2', date: '2024-10-15T14:30:00', author: 'Bob Smith', note: 'Vendor provides competitive quotes. Reliable for HVAC work.' },
    { id: '3', date: '2024-09-05T09:00:00', note: 'All certifications verified and up to date.' },
  ]

  const communications = [
    { id: '1', date: '2024-11-22T11:00:00', type: 'email', subject: 'New Work Order Assignment - Unit 203', status: 'read' },
    { id: '2', date: '2024-11-15T09:30:00', type: 'sms', subject: 'Urgent: Emergency plumbing request', status: 'read' },
    { id: '3', date: '2024-11-08T14:20:00', type: 'in-app', subject: 'Payment processed for Invoice #INV-1234', status: 'read' },
  ]

  const activityLog = [
    { id: '1', date: '2024-11-24T10:00:00', type: 'job', description: 'Completed work order #WO-157', user: 'System' },
    { id: '2', date: '2024-11-22T11:00:00', type: 'communication', description: 'New work order assigned', user: 'Alice Johnson' },
    { id: '3', date: '2024-11-20T14:00:00', type: 'payment', description: 'Payment received - KES 45,000', user: 'System' },
    { id: '4', date: '2024-11-18T09:00:00', type: 'job', description: 'Started work order #WO-157', user: vendor.name },
    { id: '5', date: '2024-11-15T10:00:00', type: 'note', description: 'Note added by Alice Johnson', user: 'Alice Johnson' },
  ]

  const documents = [
    { id: '1', name: 'Business License 2024.pdf', type: 'License', date: '2024-01-10', size: '1.2 MB' },
    { id: '2', name: 'Insurance Certificate.pdf', type: 'Insurance', date: '2024-02-15', size: '850 KB' },
    { id: '3', name: 'Tax Compliance Certificate.pdf', type: 'Tax', date: '2024-03-01', size: '620 KB' },
    { id: '4', name: 'Service Agreement 2024.pdf', type: 'Contract', date: '2024-01-05', size: '2.1 MB' },
  ]

  const invoices = [
    { id: 'INV-1234', date: '2024-11-20', amount: 45000, description: 'Plumbing repair - Unit 203', status: 'Paid' },
    { id: 'INV-1198', date: '2024-11-05', amount: 32000, description: 'HVAC maintenance - Common area', status: 'Paid' },
    { id: 'INV-1156', date: '2024-10-28', amount: 28500, description: 'Electrical inspection', status: 'Paid' },
    { id: 'INV-1112', date: '2024-10-15', amount: 51000, description: 'Emergency repair - Water heater', status: 'Paid' },
  ]

  // Calculate statistics
  const totalJobs = 47
  const completedJobs = 42
  const completionRate = Math.round((completedJobs / totalJobs) * 100)
  const averageRating = 4.7
  const totalEarnings = invoices.reduce((sum, inv) => sum + inv.amount, 0)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'job': return '🔧'
      case 'payment': return '💰'
      case 'communication': return '💬'
      case 'note': return '📝'
      case 'document': return '📄'
      default: return '📌'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800'
      case 'In Progress': return 'bg-blue-100 text-blue-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Paid': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {vendor.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{vendor.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  vendor.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {vendor.status}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  Vendor
                </span>
              </div>
              <div className="grid grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-gray-600">📧 Email</p>
                  <p className="font-medium text-gray-900">{vendor.email}</p>
                </div>
                <div>
                  <p className="text-gray-600">📱 Phone</p>
                  <p className="font-medium text-gray-900">{vendor.phone}</p>
                </div>
                <div>
                  <p className="text-gray-600">🔧 Specialization</p>
                  <p className="font-medium text-gray-900">{vendor.specialization}</p>
                </div>
                <div>
                  <p className="text-gray-600">⭐ Rating</p>
                  <p className="font-medium text-gray-900">{vendor.rating} / 5.0</p>
                </div>
                <div>
                  <p className="text-gray-600">💼 Jobs Completed</p>
                  <p className="font-medium text-gray-900">{completedJobs}</p>
                </div>
                <div>
                  <p className="text-gray-600">🏆 Verified</p>
                  <p className="font-medium text-gray-900">Yes</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">✏️ Edit</Button>
            <Button variant="primary">💬 Contact</Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Total Earnings</p>
          <p className="text-2xl font-bold text-green-600 mt-2">KES {totalEarnings.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Last 4 invoices</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Completion Rate</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">{completionRate}%</p>
          <p className="text-xs text-gray-500 mt-1">{completedJobs}/{totalJobs} jobs</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Average Rating</p>
          <p className="text-2xl font-bold text-orange-600 mt-2">{averageRating}</p>
          <p className="text-xs text-gray-500 mt-1">⭐⭐⭐⭐⭐</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Active Jobs</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">{totalJobs - completedJobs}</p>
          <p className="text-xs text-gray-500 mt-1">Currently assigned</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-1 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'jobs', label: 'Jobs', icon: '🔧' },
              { id: 'invoices', label: 'Invoices', icon: '💳' },
              { id: 'performance', label: 'Performance', icon: '📈' },
              { id: 'documents', label: 'Documents', icon: '📄' },
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
                    ? 'bg-orange-600 text-white'
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
                {/* Service Summary */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Service Summary</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Specialization</span>
                      <span className="text-sm font-medium text-gray-900">{vendor.specialization}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Jobs Completed</span>
                      <span className="text-sm font-medium text-gray-900">{completedJobs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="text-sm font-medium text-gray-900">{completionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Response Time</span>
                      <span className="text-sm font-medium text-gray-900">2.5 hours</span>
                    </div>
                    <Button variant="outline" className="w-full mt-2">Assign New Job</Button>
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

              {/* Performance Chart */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Monthly Job Completion (Last 6 Months)</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-6 gap-2">
                    {[6, 8, 7, 9, 8, 10].map((jobs, idx) => (
                      <div key={idx} className="text-center">
                        <div className="h-32 bg-orange-500 rounded flex items-end justify-center pb-2"
                          style={{ height: `${(jobs / 10) * 128}px` }}>
                          <span className="text-white text-xs font-medium">{jobs}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'][idx]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Assigned Jobs</h3>
                <Button variant="primary">+ Assign Job</Button>
              </div>
              <div className="grid gap-4">
                {vendorJobs.map(job => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-gray-900">{job.issue}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            job.priority === 'High' ? 'bg-red-100 text-red-800' :
                            job.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {job.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{job.property} - Unit {job.unit}</p>
                        <p className="text-xs text-gray-500 mt-1">Reported: {formatDate(job.dateSubmitted)}</p>
                      </div>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Invoice History</h3>
                <div className="text-sm">
                  <span className="text-gray-600">Total Paid: </span>
                  <span className="font-bold text-green-600">KES {totalEarnings.toLocaleString()}</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map(invoice => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{invoice.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{formatDate(invoice.date)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{invoice.description}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">KES {invoice.amount.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-900">Performance Metrics</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Rating Breakdown</h4>
                  <div className="space-y-2">
                    {[
                      { stars: 5, count: 35, percentage: 83 },
                      { stars: 4, count: 6, percentage: 14 },
                      { stars: 3, count: 1, percentage: 2 },
                      { stars: 2, count: 0, percentage: 0 },
                      { stars: 1, count: 0, percentage: 0 },
                    ].map(rating => (
                      <div key={rating.stars} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 w-8">{rating.stars}⭐</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500" style={{ width: `${rating.percentage}%` }} />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{rating.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Key Metrics</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Average Response Time</p>
                      <p className="text-2xl font-bold text-blue-600">2.5 hrs</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Average Completion Time</p>
                      <p className="text-2xl font-bold text-green-600">1.8 days</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Customer Satisfaction</p>
                      <p className="text-2xl font-bold text-purple-600">94%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Documents & Certifications</h3>
                <Button variant="primary">📤 Upload Document</Button>
              </div>
              <div className="grid gap-3">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded flex items-center justify-center">
                        <span className="text-orange-600">📄</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.type} • {doc.size} • {formatDate(doc.date)}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Download</Button>
                  </div>
                ))}
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
                      comm.status === 'read' ? 'bg-green-100 text-green-800' :
                      comm.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
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
              {vendorNotes.map(note => (
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
              stakeholderId={vendorId}
              stakeholderName={vendor.name}
              stakeholderType="Vendor"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter note about this vendor..."
            />
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowNoteModal(false)} className="flex-1">Cancel</Button>
              <Button variant="primary" className="flex-1">Save Note</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
