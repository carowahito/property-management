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
        <p className="text-gray-500 text-lg">Landlord not found</p>
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
  const totalMonthlyRevenue = landlordPayouts.filter((p: any) => p.status === 'PAID').reduce((sum: number, p: any) => sum + Number(p.amount), 0)
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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {landlord.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{landlord.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  landlord.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {landlord.status}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  Landlord
                </span>
              </div>
              <div className="grid grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-gray-600">📧 Email</p>
                  <p className="font-medium text-gray-900">{landlord.email}</p>
                </div>
                <div>
                  <p className="text-gray-600">📱 Phone</p>
                  <p className="font-medium text-gray-900">{landlord.phone}</p>
                </div>
                <div>
                  <p className="text-gray-600">🏢 Properties</p>
                  <p className="font-medium text-gray-900">{landlord.totalUnits} units in {landlord.properties.length} properties</p>
                </div>
                <div>
                  <p className="text-gray-600">🏦 Bank</p>
                  <p className="font-medium text-gray-900">{landlord.bankAccount}</p>
                </div>
                <div>
                  <p className="text-gray-600">💳 Account</p>
                  <p className="font-medium text-gray-900">{landlord.accountNumber}</p>
                </div>
                <div>
                  <p className="text-gray-600">📋 Tax ID</p>
                  <p className="font-medium text-gray-900">{landlord.taxId}</p>
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
          <p className="text-sm text-gray-600">Portfolio Value</p>
          <p className="text-2xl font-bold text-green-600 mt-2">KES {yearlyRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Annual revenue</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Properties</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">{totalProperties}</p>
          <p className="text-xs text-gray-500 mt-1">{totalUnits} total units</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Occupancy Rate</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">{Math.round((occupiedUnits / totalUnits) * 100)}%</p>
          <p className="text-xs text-gray-500 mt-1">{occupiedUnits}/{totalUnits} units occupied</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Active Tenants</p>
          <p className="text-2xl font-bold text-orange-600 mt-2">{landlord.totalTenants}</p>
          <p className="text-xs text-gray-500 mt-1">Across all properties</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
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
                {/* Portfolio Summary */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Portfolio Summary</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Properties</span>
                      <span className="text-sm font-medium text-gray-900">{totalProperties}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Units</span>
                      <span className="text-sm font-medium text-gray-900">{totalUnits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Occupied Units</span>
                      <span className="text-sm font-medium text-gray-900">{occupiedUnits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Monthly Revenue</span>
                      <span className="text-sm font-medium text-gray-900">KES {totalMonthlyRevenue.toLocaleString()}</span>
                    </div>
                    <Button variant="outline" className="w-full mt-2">View All Properties</Button>
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

              {/* Payout History Chart */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Payout History (Last 6 Months)</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-6 gap-2">
                    {[225000, 237500, 240000, 235000, 242000, 237500].map((amount, idx) => (
                      <div key={idx} className="text-center">
                        <div className="h-32 bg-purple-500 rounded flex items-end justify-center pb-2"
                          style={{ height: `${(amount / 250000) * 128}px` }}>
                          <span className="text-white text-xs font-medium">
                            {(amount / 1000).toFixed(0)}K
                          </span>
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

          {/* Properties Tab */}
          {activeTab === 'properties' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Properties</h3>
                <Button variant="primary">+ Add Property</Button>
              </div>
              <div className="grid gap-4">
                {landlordProperties.map((property: any) => (
                  <div key={property.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900 text-lg">{property.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{property.address}</p>
                        <div className="flex gap-4 mt-3 text-sm">
                          <span className="text-gray-600">Units: <strong>{property.units}</strong></span>
                          <span className="text-gray-600">Type: <strong>{property.type}</strong></span>
                          <span className="text-gray-600">Occupied: <strong>{property.occupied}/{property.units}</strong></span>
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
                <h3 className="font-semibold text-gray-900">Financial History</h3>
                <Button 
                  variant="primary" 
                  onClick={() => router.push(`/admin/landlords/${landlordId}/statements`)}
                >
                  📊 View Detailed Statements
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collected</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Management Fee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payout</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[
                      { month: 'November 2024', collected: 250000, fee: 12500, payout: 237500, status: 'Processed' },
                      { month: 'October 2024', collected: 245000, fee: 12250, payout: 232750, status: 'Processed' },
                      { month: 'September 2024', collected: 240000, fee: 12000, payout: 228000, status: 'Processed' },
                    ].map((record, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{record.month}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">KES {record.collected.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">KES {record.fee.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-600">KES {record.payout.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tenants Tab */}
          {activeTab === 'tenants' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Tenants Across All Properties</h3>
              <div className="grid gap-3">
                {landlordTenants.map(tenant => (
                  <div key={tenant.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">{tenant.name}</p>
                      <p className="text-sm text-gray-600">{tenant.property} - Unit {tenant.unit}</p>
                      <p className="text-xs text-gray-500 mt-1">KES {tenant.rent?.toLocaleString()}/month</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
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
                <h3 className="font-semibold text-gray-900">Documents</h3>
                <Button variant="primary">📤 Upload Document</Button>
              </div>
              <div className="grid gap-3">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
