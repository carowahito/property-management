'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import TaskManager from '@/components/crm/TaskManager'

interface Props {
  params: Promise<{ id: string }>
}

export default function LandlordCRMPage({ params }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'financials' | 'tenants' | 'documents' | 'communications' | 'notes' | 'tasks' | 'activity'>('overview')
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [landlordId, setLandlordId] = useState<string | null>(null)
  const [landlordApiData, setLandlordApiData] = useState<any>(null)
  const [isLoadingLandlord, setIsLoadingLandlord] = useState(false)
  const [inviteSending, setInviteSending] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    params.then(p => setLandlordId(p.id))
  }, [params])

  useEffect(() => {
    if (!landlordId) return
    setIsLoadingLandlord(true)
    fetch(`/api/landlords/${landlordId}`)
      .then(r => r.json())
      .then(data => { setLandlordApiData(data); setIsLoadingLandlord(false) })
      .catch(() => setIsLoadingLandlord(false))
  }, [landlordId])

  if (!landlordId || isLoadingLandlord) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>
  }

  const landlord = landlordApiData

  if (!landlord) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-neutral-500 text-lg">Landlord not found</p>
        <Button onClick={() => router.push('/admin/landlords')} className="mt-4">
          Back to Landlords
        </Button>
      </div>
    </div>
  }

  // Get related data from API response
  const landlordProperties = landlordApiData?.properties || []
  const landlordTenants: any[] = []
  const landlordPayouts = landlordApiData?.payouts || []

  const tenantNotes: any[] = []
  const communications: any[] = []
  const activityLog: any[] = []
  const documents: any[] = []

  // Calculate statistics from real data
  const totalProperties = landlordProperties.length
  const totalUnits = landlordProperties.reduce((sum: number, p: any) => sum + (p.totalUnits || 0), 0)
  const occupiedUnits = 0
  const paidPayouts = landlordPayouts.filter((p: any) => p.status === 'PAID')
  // Most recent payout = monthly revenue; sum of all paid payouts = total collected
  const latestPayout = paidPayouts.length > 0 ? Number(paidPayouts[0].amount) : 0
  const totalMonthlyRevenue = latestPayout
  const totalCollected = paidPayouts.reduce((sum: number, p: any) => sum + Number(p.amount), 0)
  const yearlyRevenue = totalMonthlyRevenue * 12

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment': return '💰'
      case 'property': return '🏠'
      case 'communication': return '💬'
      case 'note': return '📝'
      case 'document': return '📄'
      default: return '📌'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface rounded-lg border border-neutral-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {landlord.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-neutral-900">{landlord.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  landlord.status === 'Active' ? 'bg-success-100 text-green-800' : 'bg-neutral-100 text-neutral-800'
                }`}>
                  {landlord.status}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  Landlord
                </span>
              </div>
              <div className="grid grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-neutral-600">📧 Email</p>
                  <p className="font-medium text-neutral-900">{landlord.email}</p>
                </div>
                <div>
                  <p className="text-neutral-600">📱 Phone</p>
                  <p className="font-medium text-neutral-900">{landlord.phone}</p>
                </div>
                <div>
                  <p className="text-neutral-600">🏢 Properties</p>
                  <p className="font-medium text-neutral-900">{landlord.totalUnits} units in {landlord.properties.length} properties</p>
                </div>
                <div>
                  <p className="text-neutral-600">🏦 Bank</p>
                  <p className="font-medium text-neutral-900">{landlord.bankAccount}</p>
                </div>
                <div>
                  <p className="text-neutral-600">💳 Account</p>
                  <p className="font-medium text-neutral-900">{landlord.accountNumber}</p>
                </div>
                <div>
                  <p className="text-neutral-600">📋 Tax ID</p>
                  <p className="font-medium text-neutral-900">{landlord.taxId}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              setEditForm({
                name: landlord.name || '',
                email: landlord.email || '',
                phone: landlord.phone || '',
                idNumber: landlord.idNumber || '',
                address: landlord.address || '',
                bankName: landlord.bankName || '',
                bankAccount: landlord.bankAccount || '',
                taxId: landlord.taxId || '',
                status: landlord.status || 'ACTIVE',
                managementFeePercent: landlord.managementFeePercent ?? '',
                tenantPlacementFee: landlord.tenantPlacementFee ?? '',
              })
              setShowEditModal(true)
            }}>✏️ Edit</Button>
            <Button variant="outline" onClick={() => {
              window.open(`/api/landlords/${landlordId}/statement?format=html&startDate=2025-07-01&endDate=2026-04-30`, '_blank')
            }}>
              📄 Statement
            </Button>
            <Button variant="outline" onClick={async () => {
              if (inviteSending) return
              setInviteSending(true)
              try {
                const res = await fetch('/api/invitations', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: landlord.email, name: landlord.name, role: 'LANDLORD', landlordId }),
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
          <p className="text-sm text-neutral-600">Portfolio Value</p>
          <p className="text-2xl font-bold text-success-600 mt-2">KES {yearlyRevenue.toLocaleString()}</p>
          <p className="text-xs text-neutral-500 mt-1">Annual revenue</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600">Properties</p>
          <p className="text-2xl font-bold text-primary-600 mt-2">{totalProperties}</p>
          <p className="text-xs text-neutral-500 mt-1">{totalUnits} total units</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600">Occupancy Rate</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">{Math.round((occupiedUnits / totalUnits) * 100)}%</p>
          <p className="text-xs text-neutral-500 mt-1">{occupiedUnits}/{totalUnits} units occupied</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600">Active Tenants</p>
          <p className="text-2xl font-bold text-warning-600 mt-2">{landlord.totalTenants}</p>
          <p className="text-xs text-neutral-500 mt-1">Across all properties</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-surface rounded-lg border border-neutral-200">
        <div className="border-b border-neutral-200">
          <div className="flex space-x-1 p-1 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'properties', label: 'Properties', icon: '🏠' },
              { id: 'financials', label: 'Financials', icon: '💰' },
              { id: 'tenants', label: 'Tenants', icon: '👥' },
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
                    ? 'bg-purple-600 text-white'
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
                {/* Portfolio Summary */}
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-4">Portfolio Summary</h3>
                  <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Total Properties</span>
                      <span className="text-sm font-medium text-neutral-900">{totalProperties}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Total Units</span>
                      <span className="text-sm font-medium text-neutral-900">{totalUnits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Occupied Units</span>
                      <span className="text-sm font-medium text-neutral-900">{occupiedUnits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Monthly Revenue</span>
                      <span className="text-sm font-medium text-neutral-900">KES {totalMonthlyRevenue.toLocaleString()}</span>
                    </div>
                    <Button variant="outline" className="w-full mt-2">View All Properties</Button>
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

              {/* Payout History Chart */}
              <div>
                <h3 className="font-semibold text-neutral-900 mb-4">Payout History (Recent)</h3>
                <div className="bg-neutral-50 rounded-lg p-4">
                  {paidPayouts.length > 0 ? (
                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(paidPayouts.length, 6)}, 1fr)` }}>
                      {[...paidPayouts].reverse().slice(-6).map((payout: any, idx: number) => {
                        const amount = Number(payout.amount)
                        const maxAmount = Math.max(...paidPayouts.map((p: any) => Number(p.amount)))
                        const label = payout.period || (payout.paidDate ? new Date(payout.paidDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : `#${idx + 1}`)
                        return (
                          <div key={payout.id} className="text-center">
                            <div className="bg-purple-500 rounded flex items-end justify-center pb-2"
                              style={{ height: `${(amount / maxAmount) * 128}px` }}>
                              <span className="text-white text-xs font-medium">
                                {(amount / 1000).toFixed(0)}K
                              </span>
                            </div>
                            <p className="text-xs text-neutral-600 mt-1">{label}</p>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-500 text-center py-4">No payout history yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Properties Tab */}
          {activeTab === 'properties' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-neutral-900">Properties</h3>
                <Button variant="primary">+ Add Property</Button>
              </div>
              <div className="grid gap-4">
                {landlordProperties.map((property: any) => (
                  <div key={property.id} className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-neutral-900 text-lg">{property.name}</h4>
                        <p className="text-sm text-neutral-600 mt-1">{property.address}</p>
                        <div className="flex gap-4 mt-3 text-sm">
                          <span className="text-neutral-600">Units: <strong>{property.units}</strong></span>
                          <span className="text-neutral-600">Type: <strong>{property.type}</strong></span>
                          <span className="text-neutral-600">Occupied: <strong>{property.occupied}/{property.units}</strong></span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financials Tab */}
          {activeTab === 'financials' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-neutral-900">Financial History</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.open(`/api/landlords/${landlordId}/statement?format=html&startDate=2025-07-01&endDate=2026-04-30`, '_blank')
                    }}
                  >
                    📄 Download Statement
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => router.push(`/admin/landlords/${landlordId}/statements`)}
                  >
                    📊 View Detailed Statements
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Period</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Payout</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Date Paid</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-surface divide-y divide-neutral-200">
                    {landlordPayouts.length > 0 ? landlordPayouts.map((payout: any) => (
                      <tr key={payout.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 text-sm text-neutral-900">{payout.period || '—'}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-success-600">KES {Number(payout.amount).toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-neutral-900">{payout.method || '—'}</td>
                        <td className="px-6 py-4 text-sm text-neutral-900">{payout.paidDate ? formatDate(payout.paidDate) : '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payout.status === 'PAID' ? 'bg-success-100 text-green-800' :
                            payout.status === 'PENDING' ? 'bg-warning-100 text-yellow-800' :
                            'bg-neutral-100 text-neutral-800'
                          }`}>
                            {payout.status}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-neutral-500">No payout records yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tenants Tab */}
          {activeTab === 'tenants' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-neutral-900">Tenants Across All Properties</h3>
              <div className="grid gap-3">
                {landlordTenants.map(tenant => (
                  <div key={tenant.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50">
                    <div>
                      <p className="font-medium text-neutral-900">{tenant.name}</p>
                      <p className="text-sm text-neutral-600">{tenant.property} - Unit {tenant.unit}</p>
                      <p className="text-xs text-neutral-500 mt-1">KES {tenant.rent?.toLocaleString()}/month</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-green-800">
                      {tenant.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-neutral-900">Documents</h3>
                <Button variant="primary">📤 Upload Document</Button>
              </div>
              <div className="grid gap-3">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-danger-100 rounded flex items-center justify-center">
                        <span className="text-danger-600">📄</span>
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
              {tenantNotes.map(note => (
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
              stakeholderId={landlordId}
              stakeholderName={landlord.name}
              stakeholderType="Landlord"
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

      {/* Edit Landlord Modal */}
      {showEditModal && editForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-neutral-900">Edit Landlord</h3>
              <button onClick={() => setShowEditModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Phone', key: 'phone', type: 'text' },
                { label: 'ID Number', key: 'idNumber', type: 'text' },
                { label: 'Address', key: 'address', type: 'text' },
                { label: 'Bank Name', key: 'bankName', type: 'text' },
                { label: 'Bank Account', key: 'bankAccount', type: 'text' },
                { label: 'Tax ID (KRA PIN)', key: 'taxId', type: 'text' },
                { label: 'Management Fee %', key: 'managementFeePercent', type: 'number' },
                { label: 'Tenant Placement Fee (months)', key: 'tenantPlacementFee', type: 'number' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">{label}</label>
                  <input
                    type={type}
                    value={editForm[key]}
                    onChange={e => setEditForm({ ...editForm, [key]: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">Cancel</Button>
              <Button
                variant="primary"
                className="flex-1"
                disabled={isSaving}
                onClick={async () => {
                  setIsSaving(true)
                  try {
                    const payload: any = { ...editForm }
                    if (payload.managementFeePercent !== '') payload.managementFeePercent = parseFloat(payload.managementFeePercent)
                    else delete payload.managementFeePercent
                    if (payload.tenantPlacementFee !== '') payload.tenantPlacementFee = parseFloat(payload.tenantPlacementFee)
                    else delete payload.tenantPlacementFee

                    const res = await fetch(`/api/landlords/${landlordId}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                    })
                    if (!res.ok) {
                      const err = await res.json()
                      alert(err.error || 'Failed to update landlord')
                    } else {
                      const updated = await res.json()
                      setLandlordApiData(updated)
                      setShowEditModal(false)
                    }
                  } catch {
                    alert('Failed to update landlord')
                  } finally {
                    setIsSaving(false)
                  }
                }}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">Add Note</h3>
            <textarea
              rows={6}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter note about this landlord..."
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
