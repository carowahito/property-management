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
  const [showEditModal, setShowEditModal] = useState(false)
  const [editTab, setEditTab] = useState<'details' | 'units'>('details')
  const [landlordUnits, setLandlordUnits] = useState<any[]>([])
  const [propertiesList, setPropertiesList] = useState<any[]>([])
  const [unitsLoading, setUnitsLoading] = useState(false)
  const [newUnit, setNewUnit] = useState({ propertyId: '', unitNumber: '', floor: '', bedrooms: '', bathrooms: '', monthlyRent: '', status: 'VACANT' })
  const [addingUnit, setAddingUnit] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [landlordId, setLandlordId] = useState<string | null>(null)
  const [landlordApiData, setLandlordApiData] = useState<any>(null)
  const [isLoadingLandlord, setIsLoadingLandlord] = useState(false)
  const [inviteSending, setInviteSending] = useState(false)
  const [saving, setSaving] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [contactMessage, setContactMessage] = useState({ subject: '', content: '', method: 'EMAIL' })
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '', email: '', phone: '', idNumber: '', address: '',
    bankName: '', bankAccount: '', taxId: '', status: 'ACTIVE',
    managementFeePercent: '', managementFeeType: 'PERCENTAGE',
    tenantPlacementFee: '', tenantPlacementFeeType: 'MONTHS',
  })

  const refreshLandlord = () => {
    if (!landlordId) return
    fetch(`/api/landlords/${landlordId}`)
      .then(r => r.json())
      .then(data => setLandlordApiData(data))
  }

  const handleEditClick = () => {
    setEditForm({
      name: landlord?.name || '',
      email: landlord?.email || '',
      phone: landlord?.phone || '',
      idNumber: landlord?.idNumber || '',
      address: landlord?.address || '',
      bankName: landlord?.bankName || '',
      bankAccount: landlord?.bankAccount || '',
      taxId: landlord?.taxId || '',
      status: landlord?.status || 'ACTIVE',
      managementFeePercent: landlord?.managementFeePercent ?? '',
      managementFeeType: landlord?.managementFeeType || 'PERCENTAGE',
      tenantPlacementFee: landlord?.tenantPlacementFee ?? '',
      tenantPlacementFeeType: landlord?.tenantPlacementFeeType || 'MONTHS',
    })
    setEditTab('details')
    setNewUnit({ propertyId: '', unitNumber: '', floor: '', bedrooms: '', bathrooms: '', monthlyRent: '', status: 'VACANT' })
    setShowEditModal(true)
    // Fetch units and properties for the units tab
    setUnitsLoading(true)
    Promise.all([
      fetch(`/api/units?landlordId=${landlordId}`).then(r => r.json()),
      fetch('/api/properties').then(r => r.json()),
    ]).then(([unitsData, propsData]) => {
      setLandlordUnits(unitsData.units || [])
      setPropertiesList(propsData.properties || [])
    }).finally(() => setUnitsLoading(false))
  }

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/landlords/${landlordId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (res.ok) {
        refreshLandlord()
        setShowEditModal(false)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to save changes')
      }
    } catch { alert('Failed to save changes') }
    finally { setSaving(false) }
  }

  const handleSaveNote = async () => {
    if (!noteText.trim()) return
    // Notes are stored as messages with category NOTE
    setSaving(true)
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'NOTE',
          stakeholderType: 'LANDLORD',
          stakeholderId: landlordId,
          subject: 'Note',
          content: noteText,
          category: 'GENERAL',
        }),
      })
      setNoteText('')
      setShowNoteModal(false)
    } catch { alert('Failed to save note') }
    finally { setSaving(false) }
  }

  const handleSendContact = async () => {
    if (!contactMessage.subject.trim() || !contactMessage.content.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: contactMessage.method,
          stakeholderType: 'LANDLORD',
          stakeholderId: landlordId,
          subject: contactMessage.subject,
          content: contactMessage.content,
          category: 'GENERAL',
        }),
      })
      if (res.ok) {
        setContactMessage({ subject: '', content: '', method: 'EMAIL' })
        setShowContactModal(false)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to send message')
      }
    } catch { alert('Failed to send message') }
    finally { setSaving(false) }
  }

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

  if (!landlord || !landlord.id) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-neutral-500 text-lg">{landlordApiData?.error || 'Landlord not found'}</p>
        <Button onClick={() => router.push('/admin/landlords')} className="mt-4">
          Back to Landlords
        </Button>
      </div>
    </div>
  }

  // Get related data from API response
  const landlordProperties = landlordApiData?.properties || []
  const landlordUnitsFromApi: any[] = landlordApiData?.units || []
  const landlordTenants: any[] = []
  const landlordPayouts = landlordApiData?.payouts || []

  const tenantNotes: any[] = []
  const communications: any[] = []
  const activityLog: any[] = []
  const documents: any[] = []

  // Calculate statistics from real data
  const totalProperties = landlordProperties.length
  const totalUnits = landlordUnitsFromApi.length  // actual unit records, not property.totalUnits
  const occupiedUnits = landlordUnitsFromApi.filter((u: any) => u.status === 'OCCUPIED').length
  const paidPayouts = landlordPayouts.filter((p: any) => p.status === 'PAID')
  const totalCollected = paidPayouts.reduce((sum: number, p: any) => sum + Number(p.amount), 0)
  // Portfolio value = sum of monthly rents from actual units
  const totalMonthlyRevenue = landlordUnitsFromApi.reduce((sum: number, u: any) => sum + Number(u.monthlyRent || 0), 0)
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
                  <p className="font-medium text-neutral-900">{totalUnits} unit{totalUnits !== 1 ? 's' : ''} in {totalProperties} {totalProperties !== 1 ? 'properties' : 'property'}</p>
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
            <Button variant="outline" onClick={handleEditClick}>✏️ Edit</Button>
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
            <Button variant="primary" onClick={() => setShowContactModal(true)}>💬 Contact</Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600">Portfolio Value</p>
          <p className="text-2xl font-bold text-success-600 mt-2">KES {yearlyRevenue.toLocaleString()}</p>
          <p className="text-xs text-neutral-500 mt-1">KES {totalMonthlyRevenue.toLocaleString()}/mo</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600">Properties</p>
          <p className="text-2xl font-bold text-primary-600 mt-2">{totalProperties}</p>
          <p className="text-xs text-neutral-500 mt-1">{totalUnits} total units</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600">Occupancy Rate</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">{totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0}%</p>
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
                    <Button variant="outline" className="w-full mt-2" onClick={() => setActiveTab('properties')}>View All Properties</Button>
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
                <h3 className="font-semibold text-neutral-900">
                  Properties ({landlordProperties.length})
                </h3>
                <Button variant="primary" onClick={() => router.push('/admin/properties')}>+ Add Property</Button>
              </div>
              {landlordProperties.length === 0 ? (
                <div className="text-center py-12 bg-neutral-50 rounded-lg">
                  <p className="text-neutral-500">No properties linked to this landlord yet.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {landlordProperties.map((property: any) => {
                    const propertyUnits = landlordUnitsFromApi.filter((u: any) => u.property?.id === property.id || u.propertyId === property.id)
                    const occupiedCount = propertyUnits.filter((u: any) => u.status === 'OCCUPIED').length
                    const monthlyRent = propertyUnits.reduce((sum: number, u: any) => sum + Number(u.monthlyRent || 0), 0)
                    return (
                      <div key={property.id} className="border border-neutral-200 rounded-lg overflow-hidden">
                        {/* Property header */}
                        <div className="flex justify-between items-start p-4 bg-neutral-50">
                          <div>
                            <h4 className="font-semibold text-neutral-900 text-lg">{property.name}</h4>
                            <p className="text-sm text-neutral-600 mt-0.5">{property.address}</p>
                            <div className="flex gap-4 mt-2 text-sm text-neutral-600">
                              <span>Type: <strong>{property.type}</strong></span>
                              <span>Units (this landlord): <strong>{propertyUnits.length}</strong></span>
                              <span>Occupied: <strong>{occupiedCount}/{propertyUnits.length}</strong></span>
                              {monthlyRent > 0 && <span>Monthly Rent: <strong>KES {monthlyRent.toLocaleString()}</strong></span>}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => router.push(`/admin/properties/${property.id}`)}>
                            View Details
                          </Button>
                        </div>
                        {/* Units under this property */}
                        {propertyUnits.length > 0 && (
                          <div className="divide-y divide-neutral-100">
                            <div className="grid grid-cols-5 gap-2 px-4 py-2 bg-neutral-100 text-xs font-medium text-neutral-500 uppercase">
                              <span>Unit</span>
                              <span>Bedrooms</span>
                              <span>Bathrooms</span>
                              <span>Monthly Rent</span>
                              <span>Status</span>
                            </div>
                            {propertyUnits.map((unit: any) => (
                              <div key={unit.id} className="grid grid-cols-5 gap-2 px-4 py-3 text-sm items-center">
                                <span className="font-medium text-neutral-900">{unit.unitNumber}</span>
                                <span className="text-neutral-600">{unit.bedrooms ?? '—'} bed</span>
                                <span className="text-neutral-600">{unit.bathrooms ?? '—'} bath</span>
                                <span className="text-neutral-700 font-medium">KES {Number(unit.monthlyRent || 0).toLocaleString()}</span>
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium w-fit ${
                                  unit.status === 'OCCUPIED' ? 'bg-success-100 text-green-700' :
                                  unit.status === 'VACANT' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-neutral-100 text-neutral-600'
                                }`}>{unit.status}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {propertyUnits.length === 0 && (
                          <p className="px-4 py-3 text-sm text-neutral-400 italic">No units assigned to this landlord in this property.</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-neutral-900">Edit Landlord</h3>
              <button onClick={() => setShowEditModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-neutral-200 mb-6">
              {(['details', 'units'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setEditTab(tab)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition -mb-px ${editTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}
                >
                  {tab === 'details' ? 'Details' : 'Units'}
                </button>
              ))}
            </div>

            {editTab === 'units' ? (
              <div className="space-y-4">
                {/* Existing units */}
                <div>
                  <p className="text-sm font-medium text-neutral-700 mb-2">Assigned Units ({landlordUnits.length})</p>
                  {unitsLoading ? (
                    <p className="text-sm text-neutral-400">Loading…</p>
                  ) : landlordUnits.length === 0 ? (
                    <p className="text-sm text-neutral-400 bg-neutral-50 rounded-lg p-3">No units assigned yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {landlordUnits.map((u: any) => (
                        <div key={u.id} className="flex items-center justify-between bg-neutral-50 rounded-lg px-3 py-2 text-sm">
                          <div>
                            <span className="font-medium text-neutral-900">{u.unitNumber}</span>
                            <span className="text-neutral-500 ml-2">{u.property?.name || ''}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-neutral-600">KES {Number(u.monthlyRent || 0).toLocaleString()}/mo</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.status === 'OCCUPIED' ? 'bg-success-100 text-green-700' : u.status === 'VACANT' ? 'bg-yellow-100 text-yellow-700' : 'bg-neutral-100 text-neutral-600'}`}>{u.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add new unit */}
                <div className="border-t border-neutral-200 pt-4">
                  <p className="text-sm font-medium text-neutral-700 mb-3">Add New Unit</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs text-neutral-600 mb-1">Property *</label>
                      <select
                        value={newUnit.propertyId}
                        onChange={e => setNewUnit({ ...newUnit, propertyId: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Select property…</option>
                        {propertiesList.map((p: any) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-600 mb-1">Unit Number *</label>
                      <input value={newUnit.unitNumber} onChange={e => setNewUnit({ ...newUnit, unitNumber: e.target.value })} placeholder="e.g. GWG3-A18" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-600 mb-1">Monthly Rent (KES) *</label>
                      <input type="number" min="0" value={newUnit.monthlyRent} onChange={e => setNewUnit({ ...newUnit, monthlyRent: e.target.value })} placeholder="e.g. 30000" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-600 mb-1">Floor</label>
                      <input type="number" min="0" value={newUnit.floor} onChange={e => setNewUnit({ ...newUnit, floor: e.target.value })} placeholder="e.g. 2" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-600 mb-1">Bedrooms</label>
                      <input type="number" min="0" value={newUnit.bedrooms} onChange={e => setNewUnit({ ...newUnit, bedrooms: e.target.value })} placeholder="e.g. 3" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-600 mb-1">Bathrooms</label>
                      <input type="number" min="0" value={newUnit.bathrooms} onChange={e => setNewUnit({ ...newUnit, bathrooms: e.target.value })} placeholder="e.g. 2" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-600 mb-1">Status</label>
                      <select value={newUnit.status} onChange={e => setNewUnit({ ...newUnit, status: e.target.value })} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option value="VACANT">Vacant</option>
                        <option value="OCCUPIED">Occupied</option>
                        <option value="MAINTENANCE">Maintenance</option>
                      </select>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    className="w-full mt-3"
                    disabled={addingUnit || !newUnit.propertyId || !newUnit.unitNumber || !newUnit.monthlyRent}
                    onClick={async () => {
                      setAddingUnit(true)
                      try {
                        const res = await fetch('/api/units', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            propertyId: newUnit.propertyId,
                            landlordId,
                            unitNumber: newUnit.unitNumber,
                            monthlyRent: parseFloat(newUnit.monthlyRent),
                            floor: newUnit.floor ? parseInt(newUnit.floor) : undefined,
                            bedrooms: newUnit.bedrooms ? parseInt(newUnit.bedrooms) : undefined,
                            bathrooms: newUnit.bathrooms ? parseInt(newUnit.bathrooms) : undefined,
                            status: newUnit.status,
                          }),
                        })
                        const data = await res.json()
                        if (!res.ok) {
                          alert(data.error || 'Failed to add unit')
                        } else {
                          setLandlordUnits(prev => [...prev, data])
                          setNewUnit({ propertyId: '', unitNumber: '', floor: '', bedrooms: '', bathrooms: '', monthlyRent: '', status: 'VACANT' })
                          refreshLandlord()
                        }
                      } catch { alert('Failed to add unit') }
                      finally { setAddingUnit(false) }
                    }}
                  >
                    {addingUnit ? 'Adding…' : '+ Add Unit'}
                  </Button>
                </div>
              </div>
            ) : (
            <><div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Phone', key: 'phone', type: 'text' },
                { label: 'ID Number', key: 'idNumber', type: 'text' },
                { label: 'Address', key: 'address', type: 'text' },
                { label: 'Bank Name', key: 'bankName', type: 'text' },
                { label: 'Bank Account', key: 'bankAccount', type: 'text' },
                { label: 'Tax ID (KRA PIN)', key: 'taxId', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">{label}</label>
                  <input
                    type={type}
                    value={(editForm as any)[key]}
                    onChange={e => setEditForm({ ...editForm, [key]: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              ))}

              {/* Management Fee */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Management Fee</label>
                <div className="flex gap-2">
                  <select
                    value={editForm.managementFeeType}
                    onChange={e => setEditForm({ ...editForm, managementFeeType: e.target.value })}
                    className="w-48 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="PERCENTAGE">% of Rent</option>
                    <option value="FIXED">Fixed Amount (KES)</option>
                  </select>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="0"
                      step={editForm.managementFeeType === 'PERCENTAGE' ? '0.01' : '1'}
                      value={editForm.managementFeePercent}
                      onChange={e => setEditForm({ ...editForm, managementFeePercent: e.target.value })}
                      placeholder={editForm.managementFeeType === 'PERCENTAGE' ? 'e.g. 10' : 'e.g. 5000'}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm pointer-events-none">
                      {editForm.managementFeeType === 'PERCENTAGE' ? '%' : 'KES'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tenant Placement Fee */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Tenant Placement Fee</label>
                <div className="flex gap-2">
                  <select
                    value={editForm.tenantPlacementFeeType}
                    onChange={e => setEditForm({ ...editForm, tenantPlacementFeeType: e.target.value, tenantPlacementFee: '' })}
                    className="w-48 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="MONTHS">Months of Rent</option>
                    <option value="PERCENTAGE">% of Rent</option>
                  </select>
                  {editForm.tenantPlacementFeeType === 'MONTHS' ? (
                    <select
                      value={editForm.tenantPlacementFee}
                      onChange={e => setEditForm({ ...editForm, tenantPlacementFee: e.target.value })}
                      className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select months</option>
                      {[0.5, 1, 1.5, 2, 2.5, 3, 4, 6].map(m => (
                        <option key={m} value={m}>{m} month{m !== 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editForm.tenantPlacementFee}
                        onChange={e => setEditForm({ ...editForm, tenantPlacementFee: e.target.value })}
                        placeholder="e.g. 50"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm pointer-events-none">%</span>
                    </div>
                  )}
                </div>
              </div>
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
                    payload.managementFeeType = editForm.managementFeeType
                    payload.tenantPlacementFeeType = editForm.tenantPlacementFeeType

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
            </>) } {/* end details tab */}
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
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter note about this landlord..."
            />
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => { setShowNoteModal(false); setNoteText('') }} className="flex-1">Cancel</Button>
              <Button variant="primary" onClick={handleSaveNote} disabled={saving || !noteText.trim()} className="flex-1">
                {saving ? 'Saving...' : 'Save Note'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Landlord Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">Contact {landlord.name}</h3>
            <p className="text-sm text-neutral-500 mb-4">{landlord.email} • {landlord.phone}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Subject</label>
                <input value={contactMessage.subject} onChange={(e) => setContactMessage(prev => ({ ...prev, subject: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" placeholder="e.g. Monthly statement update" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Message</label>
                <textarea rows={5} value={contactMessage.content} onChange={(e) => setContactMessage(prev => ({ ...prev, content: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" placeholder="Type your message..." />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowContactModal(false)} className="flex-1">Cancel</Button>
              <Button variant="primary" onClick={handleSendContact} disabled={saving || !contactMessage.subject || !contactMessage.content} className="flex-1">
                {saving ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
