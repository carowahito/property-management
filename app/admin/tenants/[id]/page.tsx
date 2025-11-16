'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { mockTenants, mockLeases, mockPayments, mockMaintenanceRequests } from '@/lib/mock-data'

interface Props {
  params: Promise<{ id: string }>
}

export default function TenantCRMPage({ params }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'maintenance' | 'documents' | 'communications' | 'notes' | 'activity'>('overview')
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // In real app, this would be async
  const tenantId = '1' // Would come from unwrapped params
  const tenant = mockTenants.find(t => t.id === tenantId)

  if (!tenant) {
    return <div>Tenant not found</div>
  }

  // Get related data
  const tenantLeases = mockLeases.filter(l => l.tenantId === tenantId)
  const currentLease = tenantLeases.find(l => l.status === 'Active')
  const tenantPayments = mockPayments.filter(p => p.tenantId === tenantId)
  const tenantMaintenance = mockMaintenanceRequests.filter(m => m.tenantId === tenantId)

  // Mock additional CRM data
  const tenantNotes = [
    { id: '1', date: '2024-11-20T10:00:00', author: 'Alice Johnson', note: 'Tenant requested early lease renewal. Discussed 3% increase, tenant agreed.' },
    { id: '2', date: '2024-10-15T14:30:00', author: 'Bob Smith', note: 'Always pays rent on time. Excellent tenant, no issues.' },
    { id: '3', date: '2024-09-01T09:00:00', note: 'Move-in inspection completed. Unit in excellent condition.' },
  ]

  const communications = [
    { id: '1', date: '2024-11-25T10:00:00', type: 'email', subject: 'Rent Payment Reminder', status: 'sent' },
    { id: '2', date: '2024-11-10T15:30:00', type: 'sms', subject: 'Maintenance Update', status: 'delivered' },
    { id: '3', date: '2024-10-28T11:20:00', type: 'in-app', subject: 'Lease Renewal Discussion', status: 'read' },
  ]

  const activityLog = [
    { id: '1', date: '2024-11-25T10:00:00', type: 'payment', description: 'Rent payment received - KES 50,000', user: 'System' },
    { id: '2', date: '2024-11-20T14:30:00', type: 'note', description: 'Note added by Alice Johnson', user: 'Alice Johnson' },
    { id: '3', date: '2024-11-15T09:15:00', type: 'maintenance', description: 'Maintenance request submitted - Leaky faucet', user: 'John Smith' },
    { id: '4', date: '2024-11-10T16:45:00', type: 'communication', description: 'Email sent - Maintenance update', user: 'System' },
    { id: '5', date: '2024-10-25T10:00:00', type: 'payment', description: 'Rent payment received - KES 50,000', user: 'System' },
  ]

  const documents = [
    { id: '1', name: 'Lease Agreement - 2024.pdf', type: 'Lease', date: '2024-01-15', size: '2.4 MB' },
    { id: '2', name: 'ID Copy - John Smith.pdf', type: 'Identification', date: '2024-01-10', size: '856 KB' },
    { id: '3', name: 'Income Verification.pdf', type: 'Financial', date: '2024-01-10', size: '1.2 MB' },
    { id: '4', name: 'Move-in Inspection Report.pdf', type: 'Inspection', date: '2024-02-01', size: '3.1 MB' },
  ]

  // Calculate statistics
  const totalPaid = tenantPayments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0)
  const totalOverdue = tenantPayments.filter(p => p.status === 'Overdue').reduce((sum, p) => sum + p.amount, 0)
  const onTimePayments = tenantPayments.filter(p => p.status === 'Paid').length
  const totalPayments = tenantPayments.length
  const paymentRate = totalPayments > 0 ? Math.round((onTimePayments / totalPayments) * 100) : 0

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'late': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment': return '💰'
      case 'maintenance': return '🔧'
      case 'communication': return '💬'
      case 'note': return '📝'
      case 'document': return '📄'
      default: return '📌'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {tenant.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{tenant.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tenant.status)}`}>
                  {tenant.status}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Tenant
                </span>
              </div>
              <div className="grid grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-gray-600">📧 Email</p>
                  <p className="font-medium text-gray-900">{tenant.email}</p>
                </div>
                <div>
                  <p className="text-gray-600">📱 Phone</p>
                  <p className="font-medium text-gray-900">{tenant.phone}</p>
                </div>
                <div>
                  <p className="text-gray-600">🏠 Property</p>
                  <p className="font-medium text-gray-900">{tenant.property}</p>
                </div>
                <div>
                  <p className="text-gray-600">🚪 Unit</p>
                  <p className="font-medium text-gray-900">{tenant.unit}</p>
                </div>
                <div>
                  <p className="text-gray-600">💵 Monthly Rent</p>
                  <p className="font-medium text-gray-900">KES {tenant.rent?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">📅 Move-in Date</p>
                  <p className="font-medium text-gray-900">{formatDate(tenant.moveIn)}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowEditModal(true)}>
              ✏️ Edit
            </Button>
            <Button variant="primary">
              💬 Contact
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Total Paid</p>
          <p className="text-2xl font-bold text-green-600 mt-2">KES {totalPaid.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{onTimePayments} payments</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Payment Rate</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">{paymentRate}%</p>
          <p className="text-xs text-gray-500 mt-1">On-time payments</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Maintenance Requests</p>
          <p className="text-2xl font-bold text-orange-600 mt-2">{tenantMaintenance.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total requests</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Lease Status</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">{currentLease?.status || 'N/A'}</p>
          <p className="text-xs text-gray-500 mt-1">Ends {currentLease ? formatDate(currentLease.endDate) : 'N/A'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-1">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'payments', label: 'Payments', icon: '💰' },
              { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
              { id: 'documents', label: 'Documents', icon: '📄' },
              { id: 'communications', label: 'Communications', icon: '💬' },
              { id: 'notes', label: 'Notes', icon: '📝' },
              { id: 'activity', label: 'Activity Log', icon: '📋' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
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
                {/* Current Lease */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Current Lease</h3>
                  {currentLease ? (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Lease ID</span>
                        <span className="text-sm font-medium text-gray-900">{currentLease.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Start Date</span>
                        <span className="text-sm font-medium text-gray-900">{formatDate(currentLease.startDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">End Date</span>
                        <span className="text-sm font-medium text-gray-900">{formatDate(currentLease.endDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Monthly Rent</span>
                        <span className="text-sm font-medium text-gray-900">KES {currentLease.monthlyRent.toLocaleString()}</span>
                      </div>
                      <Button variant="outline" className="w-full mt-2">View Lease Details</Button>
                    </div>
                  ) : (
                    <p className="text-gray-500">No active lease</p>
                  )}
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

              {/* Payment History Summary */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Payment History (Last 6 Months)</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-6 gap-2">
                    {tenantPayments.slice(0, 6).map((payment, idx) => (
                      <div key={idx} className="text-center">
                        <div className={`h-20 rounded flex items-end justify-center pb-2 ${
                          payment.status === 'Paid' ? 'bg-green-500' : 
                          payment.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}>
                          <span className="text-white text-xs font-medium">
                            {payment.amount / 1000}K
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{payment.month}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Payment History</h3>
                <Button variant="primary">+ Record Payment</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tenantPayments.map(payment => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{payment.month}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">KES {payment.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(payment.date)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{payment.method}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'Paid' ? 'bg-green-100 text-green-800' :
                            payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Maintenance Requests</h3>
              {tenantMaintenance.map(request => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{request.issue}</h4>
                      <p className="text-sm text-gray-600">Request #{request.id}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      request.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      request.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                    <div>
                      <p className="text-gray-600">Priority</p>
                      <p className="font-medium">{request.priority}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Submitted</p>
                      <p className="font-medium">{formatDate(request.dateSubmitted)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Vendor</p>
                      <p className="font-medium">{request.vendorName || 'Not assigned'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Documents</h3>
                <Button variant="primary">📤 Upload Document</Button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center">
                        <span className="text-red-600">📄</span>
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
              {tenantNotes.map(note => (
                <div key={note.id} className="border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-900 mb-2">{note.note}</p>
                  <p className="text-sm text-gray-500">
                    {note.author && `${note.author} • `}{formatDate(note.date)}
                  </p>
                </div>
              ))}
            </div>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter note about this tenant..."
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
