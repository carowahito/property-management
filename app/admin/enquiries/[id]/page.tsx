'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import TaskManager from '@/components/crm/TaskManager'

interface Props {
  params: Promise<{ id: string }>
}

export default function EnquiryCRMPage({ params }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'communications' | 'notes' | 'tasks'>('overview')
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [enquiryId, setEnquiryId] = useState<string | null>(null)
  const [enquiry, setEnquiry] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    params.then(p => setEnquiryId(p.id))
  }, [params])

  useEffect(() => {
    if (!enquiryId) return
    fetch(`/api/enquiries/${enquiryId}`)
      .then(r => r.json())
      .then(data => { if (!data.error) setEnquiry(data); setIsLoading(false); })
      .catch(() => setIsLoading(false))
  }, [enquiryId])

  if (!enquiryId || isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  }

  if (!enquiry) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-neutral-500 text-lg">Enquiry not found</p>
        <Button onClick={() => router.push('/admin/crm/enquiries')} className="mt-4">Back to Enquiries</Button>
      </div>
    </div>
  }

  const communications = enquiry.communications || []
  const enquiryNotes = enquiry.notes_rel || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-primary-100 text-primary-800'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800'
      case 'RESOLVED': return 'bg-success-100 text-green-800'
      case 'CLOSED': return 'bg-neutral-100 text-neutral-800'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': case 'HIGH': return 'bg-danger-100 text-red-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-primary-100 text-primary-800'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface rounded-lg border border-neutral-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {enquiry.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-neutral-900">{enquiry.subject}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(enquiry.status)}`}>
                  {enquiry.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(enquiry.priority)}`}>
                  {enquiry.priority} Priority
                </span>
              </div>
              <p className="text-neutral-700 mb-3">{enquiry.message}</p>
              <div className="grid grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-neutral-600">Name</p>
                  <p className="font-medium text-neutral-900">{enquiry.name}</p>
                </div>
                <div>
                  <p className="text-neutral-600">Email</p>
                  <p className="font-medium text-neutral-900">{enquiry.email}</p>
                </div>
                <div>
                  <p className="text-neutral-600">Phone</p>
                  <p className="font-medium text-neutral-900">{enquiry.phone}</p>
                </div>
                {enquiry.assignedTo && (
                  <div>
                    <p className="text-neutral-600">Assigned To</p>
                    <p className="font-medium text-neutral-900">{enquiry.assignedTo}</p>
                  </div>
                )}
                <div>
                  <p className="text-neutral-600">Created</p>
                  <p className="font-medium text-neutral-900">{formatDate(enquiry.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {enquiry.status !== 'RESOLVED' && enquiry.status !== 'CLOSED' && (
              <Button variant="primary" onClick={() => setShowResponseModal(true)}>Respond</Button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600">Communications</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">{communications.length}</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600">Notes</p>
          <p className="text-2xl font-bold text-primary-600 mt-2">{enquiryNotes.length}</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600">Resolved</p>
          <p className="text-2xl font-bold text-success-600 mt-2">{enquiry.resolvedAt ? formatDate(enquiry.resolvedAt) : 'Pending'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-surface rounded-lg border border-neutral-200">
        <div className="border-b border-neutral-200">
          <div className="flex space-x-1 p-1 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'communications', label: 'Communications' },
              { id: 'notes', label: 'Notes' },
              { id: 'tasks', label: 'Tasks' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-pink-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-4">Enquiry Information</h3>
                  <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enquiry.status)}`}>{enquiry.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Priority</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(enquiry.priority)}`}>{enquiry.priority}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-4">Timeline</h3>
                  <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">Created</p>
                      <p className="text-sm font-medium text-neutral-900">{formatDate(enquiry.createdAt)}</p>
                    </div>
                    {enquiry.resolvedAt && (
                      <div>
                        <p className="text-sm text-neutral-600 mb-1">Resolved</p>
                        <p className="text-sm font-medium text-neutral-900">{formatDate(enquiry.resolvedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'communications' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-neutral-900">Communication History</h3>
                <Button variant="primary">Send Message</Button>
              </div>
              {communications.length === 0 ? (
                <p className="text-center py-8 text-neutral-500">No communications yet</p>
              ) : communications.map((comm: any) => (
                <div key={comm.id} className="border border-neutral-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-neutral-900">{comm.subject || 'No subject'}</h4>
                      <p className="text-sm text-neutral-600 capitalize">{comm.type} &bull; {formatDate(comm.sentAt)}</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-green-800">
                      {comm.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-neutral-900">Notes</h3>
                <Button variant="primary" onClick={() => setShowNoteModal(true)}>+ Add Note</Button>
              </div>
              {enquiryNotes.length === 0 ? (
                <p className="text-center py-8 text-neutral-500">No notes yet</p>
              ) : enquiryNotes.map((note: any) => (
                <div key={note.id} className="border border-neutral-200 rounded-lg p-4">
                  <p className="text-neutral-900 mb-2">{note.content}</p>
                  <p className="text-sm text-neutral-500">{formatDate(note.createdAt)}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tasks' && (
            <TaskManager
              stakeholderId={enquiryId}
              stakeholderName={enquiry.name}
              stakeholderType="Tenant"
            />
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
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
          <div className="bg-surface rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">Send Response</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">To</label>
                <input
                  type="text"
                  value={`${enquiry.name} <${enquiry.email}>`}
                  disabled
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-neutral-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Subject</label>
                <input
                  type="text"
                  defaultValue={`Re: ${enquiry.subject}`}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Message</label>
                <textarea
                  rows={8}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="Type your response..."
                />
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
