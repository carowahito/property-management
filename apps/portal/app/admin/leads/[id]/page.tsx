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
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [leadId, setLeadId] = useState<string | null>(null)
  const [lead, setLead] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    params.then(p => setLeadId(p.id))
  }, [params])

  useEffect(() => {
    if (!leadId) return
    fetch(`/api/leads/${leadId}`)
      .then(r => r.json())
      .then(data => { if (!data.error) setLead(data); setIsLoading(false); })
      .catch(() => setIsLoading(false))
  }, [leadId])

  if (!leadId || isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  }

  if (!lead) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-neutral-500 text-lg">Lead not found</p>
        <Button onClick={() => router.push('/admin/crm/leads')} className="mt-4">Back to Leads</Button>
      </div>
    </div>
  }

  const communications = lead.communications || []
  const leadNotes = lead.notes_rel || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-primary-100 text-primary-800'
      case 'CONTACTED': return 'bg-purple-100 text-purple-800'
      case 'QUALIFIED': return 'bg-success-100 text-green-800'
      case 'CONVERTED': return 'bg-emerald-100 text-emerald-800'
      case 'LOST': return 'bg-danger-100 text-red-800'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface rounded-lg border border-neutral-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {lead.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-neutral-900">{lead.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lead.status)}`}>
                  {lead.status}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  Lead - {lead.type}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-neutral-600">Email</p>
                  <p className="font-medium text-neutral-900">{lead.email}</p>
                </div>
                <div>
                  <p className="text-neutral-600">Phone</p>
                  <p className="font-medium text-neutral-900">{lead.phone}</p>
                </div>
                <div>
                  <p className="text-neutral-600">Source</p>
                  <p className="font-medium text-neutral-900">{lead.source}</p>
                </div>
                {lead.assignedTo && (
                  <div>
                    <p className="text-neutral-600">Assigned To</p>
                    <p className="font-medium text-neutral-900">{lead.assignedTo}</p>
                  </div>
                )}
                <div>
                  <p className="text-neutral-600">Created</p>
                  <p className="font-medium text-neutral-900">{formatDate(lead.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" onClick={() => setShowConvertModal(true)}>Convert to Tenant</Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600">Budget Range</p>
          <p className="text-2xl font-bold text-success-600 mt-2">{lead.budget || 'N/A'}</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600">Move-in Date</p>
          <p className="text-2xl font-bold text-primary-600 mt-2">{lead.moveInDate ? formatDate(lead.moveInDate) : 'N/A'}</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600">Communications</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">{communications.length}</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600">Last Contact</p>
          <p className="text-2xl font-bold text-warning-600 mt-2">{lead.lastContact ? formatDate(lead.lastContact) : 'N/A'}</p>
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
                  activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'
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
                  <h3 className="font-semibold text-neutral-900 mb-4">Lead Information</h3>
                  <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>{lead.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Type</span>
                      <span className="text-sm font-medium text-neutral-900">{lead.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Source</span>
                      <span className="text-sm font-medium text-neutral-900">{lead.source}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-4">Requirements</h3>
                  <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">Budget</p>
                      <p className="text-sm font-medium text-neutral-900">{lead.budget || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">Move-in Date</p>
                      <p className="text-sm font-medium text-neutral-900">{lead.moveInDate ? formatDate(lead.moveInDate) : 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">Preferences</p>
                      <p className="text-sm font-medium text-neutral-900">{lead.preferences || 'None specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
              {lead.notes && (
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-4">Initial Notes</h3>
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <p className="text-neutral-900">{lead.notes}</p>
                  </div>
                </div>
              )}
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
              {leadNotes.length === 0 ? (
                <p className="text-center py-8 text-neutral-500">No notes yet</p>
              ) : leadNotes.map((note: any) => (
                <div key={note.id} className="border border-neutral-200 rounded-lg p-4">
                  <p className="text-neutral-900 mb-2">{note.content}</p>
                  <p className="text-sm text-neutral-500">{formatDate(note.createdAt)}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tasks' && (
            <TaskManager
              stakeholderId={leadId}
              stakeholderName={lead.name}
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
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
          <div className="bg-surface rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">Convert Lead to Tenant</h3>
            <p className="text-neutral-600 mb-6">
              This will convert <strong>{lead.name}</strong> from a lead to an active tenant.
              You&apos;ll need to complete the lease agreement process.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowConvertModal(false)} className="flex-1">Cancel</Button>
              <Button variant="primary" className="flex-1">Convert & Create Lease</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
