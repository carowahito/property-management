'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import TaskManager from '@/components/crm/TaskManager'
import ArchiveDeleteButtons from '@/components/ui/ArchiveDeleteButtons'

interface Props {
  params: Promise<{ id: string }>
}

export default function LandlordCRMPage({ params }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'financials' | 'tenants' | 'documents' | 'communications' | 'notes' | 'tasks' | 'activity'>('overview')
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [docsList, setDocsList] = useState<any[]>([])
  const [docsLoading, setDocsLoading] = useState(false)
  const [editTab, setEditTab] = useState<'details' | 'units'>('details')
  const [landlordUnits, setLandlordUnits] = useState<any[]>([])
  const [propertiesList, setPropertiesList] = useState<any[]>([])
  const [unitsLoading, setUnitsLoading] = useState(false)
  const [newUnit, setNewUnit] = useState({ propertyId: '', unitNumber: '', floor: '', bedrooms: '', bathrooms: '', monthlyRent: '', status: 'VACANT' })
  const [addingUnit, setAddingUnit] = useState(false)
  const [propertyUnitsForDropdown, setPropertyUnitsForDropdown] = useState<any[]>([])
  const [useNewUnitNumber, setUseNewUnitNumber] = useState(false)
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null)
  const [unitEditForm, setUnitEditForm] = useState<any>({})
  const [savingUnit, setSavingUnit] = useState(false)
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
    type: 'INDIVIDUAL',
    managementFeePercent: '', managementFeeType: 'PERCENTAGE',
    tenantPlacementFee: '', tenantPlacementFeeType: 'MONTHS',
  })
  const [editMembers, setEditMembers] = useState<Array<{
    name: string; idNumber: string; phone: string; email: string; ownershipPercent: string; isPrimary: boolean
  }>>([])

  const fetchDocuments = () => {
    if (!landlordId) return
    setDocsLoading(true)
    fetch(`/api/landlords/${landlordId}/documents`)
      .then(r => r.json())
      .then(d => setDocsList(d.documents || []))
      .finally(() => setDocsLoading(false))
  }

  const handleUpload = async () => {
    if (!uploadFile || !landlordId) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', uploadFile)
      const res = await fetch(`/api/landlords/${landlordId}/documents`, { method: 'POST', body: fd })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Upload failed')
      } else {
        setUploadFile(null)
        setShowUploadModal(false)
        fetchDocuments()
      }
    } catch { alert('Upload failed') }
    finally { setUploading(false) }
  }

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
      type: landlordApiData?.type || 'INDIVIDUAL',
      managementFeePercent: landlord?.managementFeePercent ?? '',
      managementFeeType: landlord?.managementFeeType || 'PERCENTAGE',
      tenantPlacementFee: landlord?.tenantPlacementFee ?? '',
      tenantPlacementFeeType: landlord?.tenantPlacementFeeType || 'MONTHS',
    })
    setEditMembers(
      (landlordApiData?.members || []).map((m: any) => ({
        name: m.name || '',
        idNumber: m.idNumber || '',
        phone: m.phone || '',
        email: m.email || '',
        ownershipPercent: m.ownershipPercent != null ? String(m.ownershipPercent) : '',
        isPrimary: m.isPrimary || false,
      }))
    )
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
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
  // propertiesViaUnits = distinct properties containing this landlord's units
  // (preferred over landlordApiData.properties which uses property.landlordId)
  const landlordProperties: any[] = landlordApiData?.propertiesViaUnits || landlordApiData?.properties || []
  const landlordUnitsFromApi: any[] = landlordApiData?.units || []
  const landlordTenants: any[] = landlordUnitsFromApi.flatMap((u: any) =>
    (u.tenants || []).map((t: any) => ({
      ...t,
      unit: u.unitNumber,
      property: u.property?.name || '',
      propertyId: u.propertyId,
      rent: Number(u.monthlyRent) || 0,
    }))
  )
  const landlordPayouts = landlordApiData?.payouts || []

  const allMessages: any[] = landlordApiData?.messages || []
  const tenantNotes = allMessages.filter((m: any) => m.type === 'NOTE')
  const communications = allMessages.filter((m: any) => m.type !== 'NOTE')
  const rentTransactions: any[] = landlordApiData?.rentTransactions || []

  const activityLog = [
    ...allMessages.map((m: any) => ({ id: m.id, type: m.type === 'NOTE' ? 'note' : 'communication', description: `${m.type}: ${m.subject}`, date: m.sentAt, user: '' })),
    ...landlordPayouts.map((p: any) => ({ id: p.id, type: 'payment', description: `Payout: KES ${Number(p.amount).toLocaleString()}`, date: p.paidDate, user: '' })),
    ...rentTransactions.map((t: any) => ({ id: t.id, type: 'payment', description: `Rent collected: KES ${Number(t.grossRent).toLocaleString()}`, date: t.createdAt, user: '' })),
  ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

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
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                  {landlordApiData?.type === 'JOINT_OWNERSHIP' ? 'Joint Ownership' :
                   landlordApiData?.type === 'COMPANY' ? 'Company' : 'Individual'}
                </span>
              </div>
              {landlordApiData?.type === 'JOINT_OWNERSHIP' && landlordApiData?.members?.length > 0 && (
                <p className="text-sm text-neutral-600 mb-3">
                  Co-owners: <span className="font-semibold text-neutral-800">
                    {landlordApiData.members.map((m: any) => m.name).join(' & ')}
                  </span>
                </p>
              )}
              {landlordApiData?.type === 'COMPANY' && landlordApiData?.members?.length > 0 && (
                <p className="text-sm text-neutral-600 mb-3">
                  Contact person: <span className="font-semibold text-neutral-800">
                    {(landlordApiData.members.find((m: any) => m.isPrimary) || landlordApiData.members[0])?.name}
                  </span>
                </p>
              )}
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
                  <p className="text-neutral-600">🏠 Units</p>
                  <button onClick={() => setActiveTab('properties')} className="font-medium text-primary-600 hover:underline text-left">{totalUnits} unit{totalUnits !== 1 ? 's' : ''} across {totalProperties} {totalProperties !== 1 ? 'properties' : 'property'}</button>
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
            <ArchiveDeleteButtons
              entityName="landlord"
              entityLabel={landlord.name}
              archiveUrl={`/api/landlords/${landlordId}`}
              deleteUrl={`/api/landlords/${landlordId}`}
              isArchived={landlord.status === 'ARCHIVED'}
              onSuccess={() => router.push('/admin/landlords')}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button onClick={() => setActiveTab('financials')} className="bg-surface rounded-lg border border-neutral-200 p-6 text-left hover:border-primary-300 transition">
          <p className="text-sm text-neutral-600">Portfolio Value</p>
          <p className="text-2xl font-bold text-success-600 mt-2">KES {yearlyRevenue.toLocaleString()}</p>
          <p className="text-xs text-neutral-500 mt-1">KES {totalMonthlyRevenue.toLocaleString()}/mo</p>
        </button>
        <button onClick={() => setActiveTab('properties')} className="bg-surface rounded-lg border border-neutral-200 p-6 text-left hover:border-primary-300 transition">
          <p className="text-sm text-neutral-600">Units</p>
          <p className="text-2xl font-bold text-primary-600 mt-2">{totalUnits}</p>
          <p className="text-xs text-neutral-500 mt-1">across {totalProperties} {totalProperties !== 1 ? 'properties' : 'property'}</p>
        </button>
        <button onClick={() => setActiveTab('properties')} className="bg-surface rounded-lg border border-neutral-200 p-6 text-left hover:border-primary-300 transition">
          <p className="text-sm text-neutral-600">Occupancy Rate</p>
          <p className="text-2xl font-bold text-primary-600 mt-2">{totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0}%</p>
          <p className="text-xs text-neutral-500 mt-1">{occupiedUnits}/{totalUnits} units occupied</p>
        </button>
        <button onClick={() => setActiveTab('tenants')} className="bg-surface rounded-lg border border-neutral-200 p-6 text-left hover:border-primary-300 transition">
          <p className="text-sm text-neutral-600">Active Tenants</p>
          <p className="text-2xl font-bold text-warning-600 mt-2">{landlordTenants.length}</p>
          <p className="text-xs text-neutral-500 mt-1">Across all properties</p>
        </button>
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
                onClick={() => {
                  setActiveTab(tab.id as any)
                  if (tab.id === 'documents') fetchDocuments()
                }}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
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
                      <span className="text-sm text-neutral-600">Total Units</span>
                      <span className="text-sm font-medium text-neutral-900">{totalUnits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Properties</span>
                      <span className="text-sm font-medium text-neutral-900">{totalProperties}</span>
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

              {/* Members (Joint Ownership / Company) */}
              {landlordApiData?.members?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-3">
                    {landlordApiData.type === 'JOINT_OWNERSHIP' ? 'Joint Owners' : 'Members'}
                  </h3>
                  <div className="border border-neutral-200 rounded-lg divide-y divide-neutral-100">
                    {landlordApiData.members.map((m: any) => (
                      <div key={m.id} className="flex items-center justify-between px-4 py-3 text-sm">
                        <div>
                          <span className="font-medium text-neutral-900">{m.name}</span>
                          {m.isPrimary && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">Primary</span>}
                          {m.idNumber && <span className="text-neutral-500 ml-2">ID: {m.idNumber}</span>}
                        </div>
                        <div className="text-right text-neutral-500 text-xs space-y-0.5">
                          {m.ownershipPercent && <p>{Number(m.ownershipPercent)}% share</p>}
                          {m.phone && <p>{m.phone}</p>}
                          {m.email && <p>{m.email}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                            <Link href={`/admin/properties/${property.id}`} className="font-semibold text-primary-600 hover:underline text-lg">{property.name}</Link>
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
                                <div>
                                  <span className="font-medium text-neutral-900">{unit.unitNumber}</span>
                                    </div>
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
            <div className="space-y-6">
              {/* Rent Transactions */}
              {rentTransactions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-3">Rent Transactions</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Period</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Gross Rent</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Mgmt Fee</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Net Payout</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-surface divide-y divide-neutral-200">
                        {rentTransactions.map((tx: any) => (
                          <tr key={tx.id} className="hover:bg-neutral-50">
                            <td className="px-6 py-4 text-sm text-neutral-900">{tx.rentPeriod || formatDate(tx.createdAt)}</td>
                            <td className="px-6 py-4 text-sm text-neutral-900">KES {Number(tx.grossRent).toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-neutral-500">KES {Number(tx.managementFee).toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-success-600">KES {Number(tx.netAmount).toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.payoutStatus === 'PAID' ? 'bg-success-100 text-green-800' : 'bg-warning-100 text-yellow-800'}`}>{tx.payoutStatus}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Payouts */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-neutral-900">Payout History</h3>
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
              <h3 className="font-semibold text-neutral-900">Tenants in {landlord.name}&apos;s Units ({landlordTenants.length})</h3>
              {landlordTenants.length === 0 ? (
                <div className="text-center py-12 bg-neutral-50 rounded-lg border border-dashed border-neutral-300">
                  <p className="text-4xl mb-2">👥</p>
                  <p className="text-neutral-500 font-medium">No active tenants</p>
                  <p className="text-sm text-neutral-400 mt-1">Tenants will appear here when assigned to this landlord&apos;s units</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {landlordTenants.map(tenant => (
                    <div key={tenant.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50">
                      <div>
                        <Link href={`/admin/tenants/${tenant.id}`} className="font-medium text-primary-600 hover:underline">{tenant.name}</Link>
                        <p className="text-sm text-neutral-600">
                          <Link href={`/admin/properties/${tenant.propertyId}`} className="hover:underline">{tenant.property}</Link> — Unit <Link href={`/admin/units/${tenant.unit}`} className="hover:underline">{tenant.unit}</Link>
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">KES {tenant.rent?.toLocaleString()}/month</p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-green-800">
                        {tenant.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-neutral-900">Documents ({docsList.length})</h3>
                <Button variant="primary" onClick={() => setShowUploadModal(true)}>📤 Upload Document</Button>
              </div>
              {docsLoading ? (
                <p className="text-sm text-neutral-400 text-center py-8">Loading documents…</p>
              ) : docsList.length === 0 ? (
                <div className="text-center py-12 bg-neutral-50 rounded-lg border border-dashed border-neutral-300">
                  <p className="text-4xl mb-2">📄</p>
                  <p className="text-neutral-500 font-medium">No documents yet</p>
                  <p className="text-sm text-neutral-400 mt-1">Upload KRA PIN, ID copy, bank letters, etc.</p>
                  <Button variant="outline" className="mt-4" onClick={() => setShowUploadModal(true)}>Upload First Document</Button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {docsList.map((doc: any) => {
                    const sizeMb = (doc.fileSize / (1024 * 1024)).toFixed(2)
                    const ext = doc.name.split('.').pop()?.toUpperCase() ?? 'FILE'
                    return (
                      <div key={doc.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary-600">{ext}</span>
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900">{doc.name}</p>
                            <p className="text-xs text-neutral-500">{sizeMb} MB • {formatDate(doc.uploadedAt)}</p>
                          </div>
                        </div>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">⬇ Download</Button>
                        </a>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Communications Tab */}
          {activeTab === 'communications' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-neutral-900">Communication History ({communications.length})</h3>
                <Button variant="primary" onClick={() => setShowContactModal(true)}>✉️ Send Message</Button>
              </div>
              {communications.length === 0 ? (
                <div className="text-center py-12 bg-neutral-50 rounded-lg border border-dashed border-neutral-300">
                  <p className="text-4xl mb-2">💬</p>
                  <p className="text-neutral-500 font-medium">No messages yet</p>
                  <Button variant="outline" className="mt-4" onClick={() => setShowContactModal(true)}>Send First Message</Button>
                </div>
              ) : communications.map((comm: any) => (
                <div key={comm.id} className="border border-neutral-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-neutral-900">{comm.subject}</h4>
                      <p className="text-sm text-neutral-600 mt-1">{comm.content}</p>
                      <p className="text-xs text-neutral-500 mt-2 capitalize">{comm.type?.toLowerCase()} • {comm.category?.toLowerCase()} • {formatDate(comm.sentAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-neutral-900">Notes ({tenantNotes.length})</h3>
                <Button variant="primary" onClick={() => setShowNoteModal(true)}>+ Add Note</Button>
              </div>
              {tenantNotes.length === 0 ? (
                <div className="text-center py-12 bg-neutral-50 rounded-lg border border-dashed border-neutral-300">
                  <p className="text-4xl mb-2">📝</p>
                  <p className="text-neutral-500 font-medium">No notes yet</p>
                  <Button variant="outline" className="mt-4" onClick={() => setShowNoteModal(true)}>Add First Note</Button>
                </div>
              ) : tenantNotes.map((note: any) => (
                <div key={note.id} className="border border-neutral-200 rounded-lg p-4">
                  {note.subject && note.subject !== 'Note' && <p className="font-medium text-neutral-900 mb-1">{note.subject}</p>}
                  <p className="text-neutral-700">{note.content}</p>
                  <p className="text-xs text-neutral-500 mt-2">{formatDate(note.sentAt)}</p>
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
          {activeTab === 'activity' && (() => {
            const activities = [
              ...allMessages.map((m: any) => ({ id: m.id, type: m.type === 'NOTE' ? 'note' : 'communication', description: `${m.type}: ${m.subject}`, date: m.sentAt })),
              ...landlordPayouts.map((p: any) => ({ id: p.id, type: 'payment', description: `Payout: KES ${Number(p.amount).toLocaleString()} (${p.period || 'N/A'})`, date: p.paidDate || p.createdAt })),
              ...rentTransactions.map((t: any) => ({ id: t.id, type: 'payment', description: `Rent: KES ${Number(t.grossRent).toLocaleString()} → Net KES ${Number(t.netAmount).toLocaleString()}`, date: t.createdAt })),
            ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

            return (
              <div className="space-y-3">
                <h3 className="font-semibold text-neutral-900 mb-4">Activity Timeline</h3>
                {activities.length === 0 ? (
                  <div className="text-center py-12 bg-neutral-50 rounded-lg border border-dashed border-neutral-300">
                    <p className="text-4xl mb-2">📋</p>
                    <p className="text-neutral-500 font-medium">No activity yet</p>
                  </div>
                ) : activities.map(activity => (
                  <div key={activity.id} className="flex items-start space-x-4 pb-4 border-b border-neutral-200 last:border-0">
                    <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">{getActivityIcon(activity.type)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">{activity.description}</p>
                      <p className="text-sm text-neutral-500">{formatDate(activity.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}
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
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {landlordUnits.map((u: any) => (
                        <div key={u.id} className="border border-neutral-200 rounded-lg overflow-hidden">
                          {/* Unit header row */}
                          <div className="flex items-center justify-between bg-neutral-50 px-3 py-2 text-sm">
                            <div>
                              <span className="font-medium text-neutral-900">{u.unitNumber}</span>
                              <span className="text-neutral-400 ml-2 text-xs">{u.property?.name || ''}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-neutral-600 text-xs">KES {Number(u.monthlyRent || 0).toLocaleString()}/mo</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.status === 'OCCUPIED' ? 'bg-success-100 text-green-700' : u.status === 'VACANT' ? 'bg-yellow-100 text-yellow-700' : 'bg-neutral-100 text-neutral-600'}`}>{u.status}</span>
                              <button
                                className="text-xs text-primary-600 hover:text-primary-800 font-medium px-2 py-0.5 border border-primary-200 rounded"
                                onClick={() => {
                                  if (editingUnitId === u.id) {
                                    setEditingUnitId(null)
                                  } else {
                                    setEditingUnitId(u.id)
                                    setUnitEditForm({
                                      monthlyRent: u.monthlyRent ?? '',
                                      status: u.status ?? 'VACANT',
                                      bedrooms: u.bedrooms ?? '',
                                      bathrooms: u.bathrooms ?? '',
                                      floor: u.floor ?? '',
                                      serviceCharge: u.serviceCharge ?? '',
                                      serviceChargeType: u.serviceChargeType ?? 'FIXED',
                                      managementFee: u.managementFee ?? '',
                                      managementFeeType: u.managementFeeType ?? 'FIXED',
                                    })
                                  }
                                }}
                              >
                                {editingUnitId === u.id ? 'Cancel' : '✏️ Edit'}
                              </button>
                            </div>
                          </div>

                          {/* Inline edit form */}
                          {editingUnitId === u.id && (
                            <div className="p-3 bg-white border-t border-neutral-100 space-y-3">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-xs text-neutral-500 mb-1">Monthly Rent (KES)</label>
                                  <input type="number" min="0" value={unitEditForm.monthlyRent}
                                    onChange={e => setUnitEditForm({ ...unitEditForm, monthlyRent: e.target.value })}
                                    className="w-full px-2 py-1.5 border border-neutral-300 rounded text-sm focus:ring-1 focus:ring-primary-500" />
                                </div>
                                <div>
                                  <label className="block text-xs text-neutral-500 mb-1">Status</label>
                                  <select value={unitEditForm.status}
                                    onChange={e => setUnitEditForm({ ...unitEditForm, status: e.target.value })}
                                    className="w-full px-2 py-1.5 border border-neutral-300 rounded text-sm focus:ring-1 focus:ring-primary-500">
                                    <option value="VACANT">Vacant</option>
                                    <option value="OCCUPIED">Occupied</option>
                                    <option value="MAINTENANCE">Maintenance</option>
                                    <option value="RESERVED">Reserved</option>
                                    <option value="ARCHIVED">Archived</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs text-neutral-500 mb-1">Floor</label>
                                  <input type="number" min="0" value={unitEditForm.floor}
                                    onChange={e => setUnitEditForm({ ...unitEditForm, floor: e.target.value })}
                                    className="w-full px-2 py-1.5 border border-neutral-300 rounded text-sm focus:ring-1 focus:ring-primary-500" />
                                </div>
                                <div>
                                  <label className="block text-xs text-neutral-500 mb-1">Bedrooms</label>
                                  <input type="number" min="0" value={unitEditForm.bedrooms}
                                    onChange={e => setUnitEditForm({ ...unitEditForm, bedrooms: e.target.value })}
                                    className="w-full px-2 py-1.5 border border-neutral-300 rounded text-sm focus:ring-1 focus:ring-primary-500" />
                                </div>
                                <div>
                                  <label className="block text-xs text-neutral-500 mb-1">Bathrooms</label>
                                  <input type="number" min="0" value={unitEditForm.bathrooms}
                                    onChange={e => setUnitEditForm({ ...unitEditForm, bathrooms: e.target.value })}
                                    className="w-full px-2 py-1.5 border border-neutral-300 rounded text-sm focus:ring-1 focus:ring-primary-500" />
                                </div>
                                <div>
                                  <label className="block text-xs text-neutral-500 mb-1">Service Charge</label>
                                  <div className="flex gap-1">
                                    <select value={unitEditForm.serviceChargeType}
                                      onChange={e => setUnitEditForm({ ...unitEditForm, serviceChargeType: e.target.value })}
                                      className="w-20 px-1 py-1.5 border border-neutral-300 rounded text-xs focus:ring-1 focus:ring-primary-500">
                                      <option value="FIXED">KES</option>
                                      <option value="PERCENTAGE">%</option>
                                    </select>
                                    <input type="number" min="0" value={unitEditForm.serviceCharge}
                                      onChange={e => setUnitEditForm({ ...unitEditForm, serviceCharge: e.target.value })}
                                      className="flex-1 px-2 py-1.5 border border-neutral-300 rounded text-sm focus:ring-1 focus:ring-primary-500" />
                                  </div>
                                </div>
                                <div className="col-span-2">
                                  <label className="block text-xs text-neutral-500 mb-1">Management Fee</label>
                                  <div className="flex gap-1">
                                    <select value={unitEditForm.managementFeeType}
                                      onChange={e => setUnitEditForm({ ...unitEditForm, managementFeeType: e.target.value })}
                                      className="w-20 px-1 py-1.5 border border-neutral-300 rounded text-xs focus:ring-1 focus:ring-primary-500">
                                      <option value="FIXED">KES</option>
                                      <option value="PERCENTAGE">%</option>
                                    </select>
                                    <input type="number" min="0" value={unitEditForm.managementFee}
                                      onChange={e => setUnitEditForm({ ...unitEditForm, managementFee: e.target.value })}
                                      className="flex-1 px-2 py-1.5 border border-neutral-300 rounded text-sm focus:ring-1 focus:ring-primary-500" />
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 pt-1">
                                <button
                                  disabled={savingUnit}
                                  className="flex-1 py-1.5 bg-primary-600 text-white rounded text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
                                  onClick={async () => {
                                    setSavingUnit(true)
                                    try {
                                      const p: any = {}
                                      if (unitEditForm.monthlyRent !== '') p.monthlyRent = parseFloat(unitEditForm.monthlyRent)
                                      if (unitEditForm.status) p.status = unitEditForm.status
                                      if (unitEditForm.floor !== '') p.floor = parseInt(unitEditForm.floor)
                                      if (unitEditForm.bedrooms !== '') p.bedrooms = parseInt(unitEditForm.bedrooms)
                                      if (unitEditForm.bathrooms !== '') p.bathrooms = parseInt(unitEditForm.bathrooms)
                                      if (unitEditForm.serviceCharge !== '') p.serviceCharge = parseFloat(unitEditForm.serviceCharge)
                                      if (unitEditForm.serviceChargeType) p.serviceChargeType = unitEditForm.serviceChargeType
                                      if (unitEditForm.managementFee !== '') p.managementFee = parseFloat(unitEditForm.managementFee)
                                      if (unitEditForm.managementFeeType) p.managementFeeType = unitEditForm.managementFeeType
                                      const res = await fetch(`/api/units/${u.unitNumber}`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(p),
                                      })
                                      if (!res.ok) {
                                        const err = await res.json()
                                        alert(err.error || 'Failed to update unit')
                                      } else {
                                        const updated = await res.json()
                                        setLandlordUnits(prev => prev.map(x => x.id === u.id ? { ...x, ...updated } : x))
                                        setEditingUnitId(null)
                                        refreshLandlord()
                                      }
                                    } catch { alert('Failed to update unit') }
                                    finally { setSavingUnit(false) }
                                  }}
                                >
                                  {savingUnit ? 'Saving…' : 'Save'}
                                </button>

                                <button
                                  disabled={savingUnit}
                                  title="Archive unit — marks it as archived but keeps its history"
                                  className="px-3 py-1.5 bg-neutral-100 text-neutral-600 rounded text-sm font-medium hover:bg-neutral-200 disabled:opacity-50"
                                  onClick={async () => {
                                    if (!confirm(`Archive unit ${u.unitNumber}? It will be hidden from active lists but its history is preserved.`)) return
                                    setSavingUnit(true)
                                    try {
                                      const res = await fetch(`/api/units/${u.unitNumber}`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ status: 'ARCHIVED' }),
                                      })
                                      if (!res.ok) {
                                        const err = await res.json()
                                        alert(err.error || 'Failed to archive unit')
                                      } else {
                                        setLandlordUnits(prev => prev.map(x => x.id === u.id ? { ...x, status: 'ARCHIVED' } : x))
                                        setEditingUnitId(null)
                                        refreshLandlord()
                                      }
                                    } catch { alert('Failed to archive unit') }
                                    finally { setSavingUnit(false) }
                                  }}
                                >
                                  📦 Archive
                                </button>

                                <button
                                  disabled={savingUnit}
                                  title="Remove this unit from this landlord's portfolio (unit is not deleted)"
                                  className="px-3 py-1.5 bg-danger-50 text-danger-600 rounded text-sm font-medium hover:bg-danger-100 disabled:opacity-50"
                                  onClick={async () => {
                                    if (!confirm(`Remove unit ${u.unitNumber} from this landlord's portfolio?\n\nThe unit will still exist in the app — it will just no longer be linked to this landlord.`)) return
                                    setSavingUnit(true)
                                    try {
                                      const res = await fetch(`/api/units/${u.unitNumber}`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ landlordId: null }),
                                      })
                                      if (!res.ok) {
                                        const err = await res.json()
                                        alert(err.error || 'Failed to remove unit')
                                      } else {
                                        setLandlordUnits(prev => prev.filter(x => x.id !== u.id))
                                        setEditingUnitId(null)
                                        refreshLandlord()
                                      }
                                    } catch { alert('Failed to remove unit') }
                                    finally { setSavingUnit(false) }
                                  }}
                                >
                                  ✂️ Remove
                                </button>
                              </div>
                            </div>
                          )}
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
                        onChange={async (e) => {
                          const pid = e.target.value
                          setNewUnit({ ...newUnit, propertyId: pid, unitNumber: '', monthlyRent: '', floor: '', bedrooms: '', bathrooms: '' })
                          setUseNewUnitNumber(false)
                          if (pid) {
                            const res = await fetch(`/api/units?propertyId=${pid}`)
                            const data = await res.json()
                            setPropertyUnitsForDropdown(data.units || [])
                          } else {
                            setPropertyUnitsForDropdown([])
                          }
                        }}
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
                      {!useNewUnitNumber && propertyUnitsForDropdown.length > 0 ? (
                        <>
                          <select
                            value={newUnit.unitNumber}
                            onChange={e => {
                              const selected = propertyUnitsForDropdown.find((u: any) => u.unitNumber === e.target.value)
                              if (selected) {
                                setNewUnit({
                                  ...newUnit,
                                  unitNumber: selected.unitNumber,
                                  monthlyRent: String(Number(selected.monthlyRent) || ''),
                                  floor: selected.floor ? String(selected.floor) : '',
                                  bedrooms: selected.bedrooms ? String(selected.bedrooms) : '',
                                  bathrooms: selected.bathrooms ? String(selected.bathrooms) : '',
                                })
                              } else {
                                setNewUnit({ ...newUnit, unitNumber: e.target.value })
                              }
                            }}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value="">Select unit…</option>
                            {propertyUnitsForDropdown.map((u: any) => (
                              <option key={u.id} value={u.unitNumber}>
                                {u.unitNumber} — KES {Number(u.monthlyRent).toLocaleString()}/mo {u.tenants?.length > 0 ? '(occupied)' : ''}
                              </option>
                            ))}
                          </select>
                          <button onClick={() => setUseNewUnitNumber(true)} className="text-xs text-primary-600 hover:underline mt-1">+ Enter new unit number</button>
                        </>
                      ) : (
                        <>
                          <input value={newUnit.unitNumber} onChange={e => setNewUnit({ ...newUnit, unitNumber: e.target.value })} placeholder="e.g. GWG3-A18" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                          {propertyUnitsForDropdown.length > 0 && (
                            <button onClick={() => setUseNewUnitNumber(false)} className="text-xs text-primary-600 hover:underline mt-1">Select existing unit</button>
                          )}
                        </>
                      )}
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

              {/* Ownership Type */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Ownership Type</label>
                <select
                  value={editForm.type}
                  onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="JOINT_OWNERSHIP">Joint Ownership</option>
                  <option value="COMPANY">Company</option>
                </select>
              </div>

              {/* Members editor — for joint ownership and company */}
              {editForm.type !== 'INDIVIDUAL' && (
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-neutral-700">
                      {editForm.type === 'JOINT_OWNERSHIP' ? 'Joint Owners' : 'Company Members'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditMembers(prev => [...prev, { name: '', idNumber: '', phone: '', email: '', ownershipPercent: '', isPrimary: false }])}
                      className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                    >
                      + Add {editForm.type === 'JOINT_OWNERSHIP' ? 'Owner' : 'Member'}
                    </button>
                  </div>
                  {editMembers.length === 0 ? (
                    <p className="text-sm text-neutral-400 bg-neutral-50 rounded-lg p-3">
                      No {editForm.type === 'JOINT_OWNERSHIP' ? 'owners' : 'members'} yet. Click &ldquo;Add&rdquo; above to add one.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-72 overflow-y-auto">
                      {editMembers.map((member, idx) => (
                        <div key={idx} className="border border-neutral-200 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-neutral-500">
                              {editForm.type === 'JOINT_OWNERSHIP' ? `Owner ${idx + 1}` : `Member ${idx + 1}`}
                              {member.isPrimary && <span className="ml-2 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs">Primary</span>}
                            </span>
                            <button
                              type="button"
                              onClick={() => setEditMembers(prev => prev.filter((_, i) => i !== idx))}
                              className="text-xs text-danger-600 hover:text-danger-800 font-medium"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="col-span-2">
                              <label className="block text-xs text-neutral-500 mb-1">Full Name *</label>
                              <input
                                type="text"
                                value={member.name}
                                onChange={e => setEditMembers(prev => prev.map((m, i) => i === idx ? { ...m, name: e.target.value } : m))}
                                className="w-full px-2 py-1.5 border border-neutral-300 rounded text-sm focus:ring-1 focus:ring-primary-500"
                                placeholder="Full name"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-neutral-500 mb-1">ID Number</label>
                              <input
                                type="text"
                                value={member.idNumber}
                                onChange={e => setEditMembers(prev => prev.map((m, i) => i === idx ? { ...m, idNumber: e.target.value } : m))}
                                className="w-full px-2 py-1.5 border border-neutral-300 rounded text-sm focus:ring-1 focus:ring-primary-500"
                                placeholder="National ID"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-neutral-500 mb-1">Ownership %</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={member.ownershipPercent}
                                onChange={e => setEditMembers(prev => prev.map((m, i) => i === idx ? { ...m, ownershipPercent: e.target.value } : m))}
                                className="w-full px-2 py-1.5 border border-neutral-300 rounded text-sm focus:ring-1 focus:ring-primary-500"
                                placeholder="e.g. 50"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-neutral-500 mb-1">Phone</label>
                              <input
                                type="text"
                                value={member.phone}
                                onChange={e => setEditMembers(prev => prev.map((m, i) => i === idx ? { ...m, phone: e.target.value } : m))}
                                className="w-full px-2 py-1.5 border border-neutral-300 rounded text-sm focus:ring-1 focus:ring-primary-500"
                                placeholder="+254..."
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-neutral-500 mb-1">Email</label>
                              <input
                                type="email"
                                value={member.email}
                                onChange={e => setEditMembers(prev => prev.map((m, i) => i === idx ? { ...m, email: e.target.value } : m))}
                                className="w-full px-2 py-1.5 border border-neutral-300 rounded text-sm focus:ring-1 focus:ring-primary-500"
                                placeholder="email@example.com"
                              />
                            </div>
                            <div className="col-span-2 flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`primary-${idx}`}
                                checked={member.isPrimary}
                                onChange={e => setEditMembers(prev => prev.map((m, i) => i === idx
                                  ? { ...m, isPrimary: e.target.checked }
                                  : { ...m, isPrimary: false }
                                ))}
                                className="w-4 h-4 text-primary-600 border-neutral-300 rounded"
                              />
                              <label htmlFor={`primary-${idx}`} className="text-xs text-neutral-700">Primary contact</label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

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
                    payload.type = editForm.type
                    payload.members = editForm.type !== 'INDIVIDUAL'
                      ? editMembers
                          .filter(m => m.name.trim())
                          .map(m => ({
                            name: m.name.trim(),
                            idNumber: m.idNumber.trim() || undefined,
                            phone: m.phone.trim() || undefined,
                            email: m.email.trim() || undefined,
                            ownershipPercent: m.ownershipPercent ? parseFloat(m.ownershipPercent) : undefined,
                            isPrimary: m.isPrimary,
                          }))
                      : []

                    const res = await fetch(`/api/landlords/${landlordId}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                    })
                    if (!res.ok) {
                      const err = await res.json()
                      const detail = err.details?.map((d: any) => d.message).join(', ')
                      alert(detail || err.error || 'Failed to update landlord')
                    } else {
                      setShowEditModal(false)
                      refreshLandlord()  // refetch full data with all includes
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

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-neutral-900">Upload Document</h3>
              <button onClick={() => { setShowUploadModal(false); setUploadFile(null) }} className="text-neutral-400 hover:text-neutral-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <label className="block">
              <div className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${uploadFile ? 'border-primary-400 bg-primary-50' : 'border-neutral-300 hover:border-primary-400'}`}>
                {uploadFile ? (
                  <>
                    <p className="text-3xl mb-2">📄</p>
                    <p className="font-medium text-neutral-900 text-sm">{uploadFile.name}</p>
                    <p className="text-xs text-neutral-500 mt-1">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </>
                ) : (
                  <>
                    <p className="text-3xl mb-2">📁</p>
                    <p className="text-sm text-neutral-600">Click or drag a file here</p>
                    <p className="text-xs text-neutral-400 mt-1">PDF, JPG, PNG, DOCX — max 10 MB</p>
                  </>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                onChange={e => setUploadFile(e.target.files?.[0] ?? null)}
              />
            </label>

            <div className="flex gap-3 mt-5">
              <Button variant="outline" className="flex-1" onClick={() => { setShowUploadModal(false); setUploadFile(null) }}>
                Cancel
              </Button>
              <Button variant="primary" className="flex-1" disabled={!uploadFile || uploading} onClick={handleUpload}>
                {uploading ? 'Uploading…' : 'Upload'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
