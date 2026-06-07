'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatDate } from '@/lib/utils'
import TaskManager from '@/components/crm/TaskManager'

interface Vendor {
  id: string
  name: string
  email: string
  phone: string
  specialization: string
  rating: number
  status: string
  address: string | null
  licenseNumber: string | null
  workOrders: {
    id: string
    title: string
    status: string
    priority: string
    estimatedCost: string | null
    actualCost: string | null
    scheduledDate: string | null
    completedDate: string | null
  }[]
  _count: {
    workOrders: number
    messages: number
  }
}

interface Props {
  params: Promise<{ id: string }>
}

async function fetchVendor(id: string): Promise<Vendor> {
  const response = await fetch(`/api/vendors/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch vendor')
  }
  return response.json()
}

export default function VendorCRMPage({ params }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'invoices' | 'performance' | 'documents' | 'communications' | 'notes' | 'tasks' | 'activity'>('overview')
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [inviteSending, setInviteSending] = useState(false)
  const [vendorId, setVendorId] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => setVendorId(p.id))
  }, [params])

  const { data: vendor, isLoading, error } = useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: () => fetchVendor(vendorId!),
    enabled: !!vendorId,
  })

  if (!vendorId || isLoading) {
    return <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  }

  if (error || !vendor) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-neutral-500 text-lg">Vendor not found</p>
        <Button onClick={() => router.push('/admin/vendors')} className="mt-4">
          Back to Vendors
        </Button>
      </div>
    </div>
  }

  const vendorJobs = vendor.workOrders || []
  const vendorNotes: any[] = []
  const communications: any[] = []
  const activityLog: any[] = []
  const documents: any[] = []
  const invoices: any[] = []

  // Calculate statistics
  const totalJobs = vendor._count.workOrders
  const completedJobs = vendorJobs.filter(j => j.status === 'COMPLETED').length
  const completionRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0
  const averageRating = vendor.rating || 0
  const totalEarnings = vendorJobs.reduce((sum, j) => sum + (parseFloat(j.actualCost || '0')), 0)

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
      case 'Completed': return 'bg-success-100 text-green-800'
      case 'In Progress': return 'bg-primary-100 text-primary-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Paid': return 'bg-success-100 text-green-800'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface rounded-lg border border-neutral-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-warning-500 to-warning-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {vendor.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-neutral-900">{vendor.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  vendor.status === 'Active' ? 'bg-success-100 text-green-800' : 'bg-neutral-100 text-neutral-800'
                }`}>
                  {vendor.status}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-warning-100 text-orange-800">
                  Vendor
                </span>
              </div>
              <div className="grid grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-neutral-600">📧 Email</p>
                  <p className="font-medium text-neutral-900">{vendor.email}</p>
                </div>
                <div>
                  <p className="text-neutral-600">📱 Phone</p>
                  <p className="font-medium text-neutral-900">{vendor.phone}</p>
                </div>
                <div>
                  <p className="text-neutral-600">🔧 Specialization</p>
                  <p className="font-medium text-neutral-900">{vendor.specialization}</p>
                </div>
                <div>
                  <p className="text-neutral-600">⭐ Rating</p>
                  <p className="font-medium text-neutral-900">{vendor.rating} / 5.0</p>
                </div>
                <div>
                  <p className="text-neutral-600">💼 Jobs Completed</p>
                  <p className="font-medium text-neutral-900">{completedJobs}</p>
                </div>
                <div>
                  <p className="text-neutral-600">🏆 Verified</p>
                  <p className="font-medium text-neutral-900">Yes</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">✏️ Edit</Button>
            <Button variant="outline" onClick={async () => {
              if (inviteSending) return
              setInviteSending(true)
              try {
                const res = await fetch('/api/invitations', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: vendor.email, name: vendor.name, role: 'VENDOR', vendorId }),
                })
                const data = await res.json()
                if (!res.ok) {
                  alert(data.error)
                } else {
                  const copied = await navigator.clipboard.writeText(data.inviteUrl).then(() => true).catch(() => false)
                  alert(copied ? 'Invite link copied to clipboard!' : `Invite created! Share this link:\n${data.inviteUrl}`)
                }
              } catch {
                alert('Failed to send invitation')
              } finally {
                setInviteSending(false)
              }
            }}>
              {inviteSending ? '⏳ Sending...' : '✉️ Invite'}
            </Button>
            <Button variant="primary">💬 Contact</Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600">Total Earnings</p>
          <p className="text-2xl font-bold text-success-600 mt-2">KES {totalEarnings.toLocaleString()}</p>
          <p className="text-xs text-neutral-500 mt-1">Last 4 invoices</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600">Completion Rate</p>
          <p className="text-2xl font-bold text-primary-600 mt-2">{completionRate}%</p>
          <p className="text-xs text-neutral-500 mt-1">{completedJobs}/{totalJobs} jobs</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600">Average Rating</p>
          <p className="text-2xl font-bold text-warning-600 mt-2">{averageRating}</p>
          <p className="text-xs text-neutral-500 mt-1">⭐⭐⭐⭐⭐</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600">Active Jobs</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">{totalJobs - completedJobs}</p>
          <p className="text-xs text-neutral-500 mt-1">Currently assigned</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-surface rounded-lg border border-neutral-200">
        <div className="border-b border-neutral-200">
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
                    ? 'bg-warning-600 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
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
                  <h3 className="font-semibold text-neutral-900 mb-4">Service Summary</h3>
                  <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Specialization</span>
                      <span className="text-sm font-medium text-neutral-900">{vendor.specialization}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Jobs Completed</span>
                      <span className="text-sm font-medium text-neutral-900">{completedJobs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Success Rate</span>
                      <span className="text-sm font-medium text-neutral-900">{completionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Average Response Time</span>
                      <span className="text-sm font-medium text-neutral-900">2.5 hours</span>
                    </div>
                    <Button variant="outline" className="w-full mt-2">Assign New Job</Button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-4">Recent Activity</h3>
                  <div className="space-y-2">
                    {activityLog.slice(0, 5).map(activity => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg">
                        <span className="text-xl">{getActivityIcon(activity.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900">{activity.description}</p>
                          <p className="text-xs text-neutral-500">{formatDate(activity.date)} • {activity.user}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Performance Chart */}
              <div>
                <h3 className="font-semibold text-neutral-900 mb-4">Monthly Job Completion (Last 6 Months)</h3>
                <div className="bg-neutral-50 rounded-lg p-4">
                  <div className="grid grid-cols-6 gap-2">
                    {[6, 8, 7, 9, 8, 10].map((jobs, idx) => (
                      <div key={idx} className="text-center">
                        <div className="h-32 bg-warning-500 rounded flex items-end justify-center pb-2"
                          style={{ height: `${(jobs / 10) * 128}px` }}>
                          <span className="text-white text-xs font-medium">{jobs}</span>
                        </div>
                        <p className="text-xs text-neutral-600 mt-1">
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
                <h3 className="font-semibold text-neutral-900">Assigned Jobs</h3>
                <Button variant="primary">+ Assign Job</Button>
              </div>
              <div className="grid gap-4">
                {vendorJobs.map(job => (
                  <div key={job.id} className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-neutral-900">{job.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            job.priority === 'HIGH' ? 'bg-danger-100 text-red-800' :
                            job.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-primary-100 text-primary-800'
                          }`}>
                            {job.priority}
                          </span>
                        </div>
                        {job.scheduledDate && (
                          <p className="text-xs text-neutral-500 mt-1">Scheduled: {formatDate(job.scheduledDate)}</p>
                        )}
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
                <h3 className="font-semibold text-neutral-900">Invoice History</h3>
                <div className="text-sm">
                  <span className="text-neutral-600">Total Paid: </span>
                  <span className="font-bold text-success-600">KES {totalEarnings.toLocaleString()}</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Invoice #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-surface divide-y divide-neutral-200">
                    {invoices.map(invoice => (
                      <tr key={invoice.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 text-sm font-medium text-neutral-900">{invoice.id}</td>
                        <td className="px-6 py-4 text-sm text-neutral-900">{formatDate(invoice.date)}</td>
                        <td className="px-6 py-4 text-sm text-neutral-900">{invoice.description}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-neutral-900">KES {invoice.amount.toLocaleString()}</td>
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
              <h3 className="font-semibold text-neutral-900">Performance Metrics</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="border border-neutral-200 rounded-lg p-4">
                  <h4 className="font-medium text-neutral-900 mb-4">Rating Breakdown</h4>
                  <div className="space-y-2">
                    {[
                      { stars: 5, count: 35, percentage: 83 },
                      { stars: 4, count: 6, percentage: 14 },
                      { stars: 3, count: 1, percentage: 2 },
                      { stars: 2, count: 0, percentage: 0 },
                      { stars: 1, count: 0, percentage: 0 },
                    ].map(rating => (
                      <div key={rating.stars} className="flex items-center gap-2">
                        <span className="text-sm text-neutral-600 w-8">{rating.stars}⭐</span>
                        <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                          <div className="h-full bg-warning-500" style={{ width: `${rating.percentage}%` }} />
                        </div>
                        <span className="text-sm text-neutral-600 w-12 text-right">{rating.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-neutral-200 rounded-lg p-4">
                  <h4 className="font-medium text-neutral-900 mb-4">Key Metrics</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-neutral-600">Average Response Time</p>
                      <p className="text-2xl font-bold text-primary-600">2.5 hrs</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Average Completion Time</p>
                      <p className="text-2xl font-bold text-success-600">1.8 days</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Customer Satisfaction</p>
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
                <h3 className="font-semibold text-neutral-900">Documents & Certifications</h3>
                <Button variant="primary">📤 Upload Document</Button>
              </div>
              <div className="grid gap-3">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-warning-100 rounded flex items-center justify-center">
                        <span className="text-warning-600">📄</span>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">{doc.name}</p>
                        <p className="text-xs text-neutral-500">{doc.type} • {doc.size} • {formatDate(doc.date)}</p>
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
                <h3 className="font-semibold text-neutral-900">Communication History</h3>
                <Button variant="primary">✉️ Send Message</Button>
              </div>
              {communications.map(comm => (
                <div key={comm.id} className="border border-neutral-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-neutral-900">{comm.subject}</h4>
                      <p className="text-sm text-neutral-600 capitalize">{comm.type} • {formatDate(comm.date)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      comm.status === 'read' ? 'bg-success-100 text-green-800' :
                      comm.status === 'delivered' ? 'bg-primary-100 text-primary-800' :
                      'bg-neutral-100 text-neutral-800'
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
                <h3 className="font-semibold text-neutral-900">Notes</h3>
                <Button variant="primary" onClick={() => setShowNoteModal(true)}>+ Add Note</Button>
              </div>
              {vendorNotes.map(note => (
                <div key={note.id} className="border border-neutral-200 rounded-lg p-4">
                  <p className="text-neutral-900 mb-2">{note.note}</p>
                  <p className="text-sm text-neutral-500">
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
              <h3 className="font-semibold text-neutral-900 mb-4">Activity Timeline</h3>
              {activityLog.map(activity => (
                <div key={activity.id} className="flex items-start space-x-4 pb-4 border-b border-neutral-200 last:border-0">
                  <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">{getActivityIcon(activity.type)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">{activity.description}</p>
                    <p className="text-sm text-neutral-500">{formatDate(activity.date)} • {activity.user}</p>
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
          <div className="bg-surface rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">Add Note</h3>
            <textarea
              rows={6}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500 focus:border-transparent"
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
