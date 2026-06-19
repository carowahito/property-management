'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StatementMenuButton } from '@/components/ui/statement-menu-button'
import { getStatementDateRange } from '@/lib/statement-period'
import { formatDate, formatRefNumber } from '@/lib/utils'
import { setAssumedTenant } from '@/lib/assumed-tenant'
import TaskManager from '@/components/crm/TaskManager'
import ArchiveDeleteButtons from '@/components/ui/ArchiveDeleteButtons'

interface Props {
  params: Promise<{ id: string }>
}

export default function TenantCRMPage({ params }: Props) {
  const [tenantId, setTenantId] = useState<string | null>(null)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'maintenance' | 'documents' | 'communications' | 'notes' | 'tasks' | 'activity'>('overview')
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [inviteSending, setInviteSending] = useState(false)
  const [showInvitePreview, setShowInvitePreview] = useState(false)
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    property: '',
    unit: '',
    rent: '',
    moveIn: '',
    status: '',
  })
  const [paymentForm, setPaymentForm] = useState({
    month: '',
    amount: '',
    date: '',
    method: 'Bank Transfer',
    status: 'Paid',
    reference: '',
  })
  const [paymentFilters, setPaymentFilters] = useState({
    month: '',
    startDate: '',
    endDate: '',
    method: '',
    status: '',
  })
  const [maintenanceFilters, setMaintenanceFilters] = useState({
    status: '',
    priority: '',
    vendor: '',
    startDate: '',
    endDate: '',
  })
  const [documentSearch, setDocumentSearch] = useState('')
  const [communicationFilters, setCommunicationFilters] = useState({
    status: '',
    type: '',
    startDate: '',
    endDate: '',
    category: '',
  })
  const [showSendMessageModal, setShowSendMessageModal] = useState(false)
  const [messageForm, setMessageForm] = useState({
    method: 'email',
    subject: '',
    message: '',
    template: '',
  })
  const [attachments, setAttachments] = useState<File[]>([])
  const [isImprovingText, setIsImprovingText] = useState(false)
  const [showGenerateLeaseModal, setShowGenerateLeaseModal] = useState(false)
  const [generateLeaseForm, setGenerateLeaseForm] = useState({
    startDate: '',
    leaseTerm: '12',
    endDate: '',
    monthlyRent: '',
    securityDeposit: '',
    rentDueDay: '1',
    gracePeriodDays: '5',
    latePenaltyPerDay: '500',
    noticePeriod: '1',
    rentEscalation: '',
    paymentRecipient: 'agent',
    mpesaTill: '',
    bankDetails: '',
    petPolicy: '',
    specialConditions: '',
    terms: '',
    tenant2Name: '',
    tenant2IdNumber: '',
    tenant2Email: '',
    tenant2Phone: '',
  })
  const [isGeneratingLease, setIsGeneratingLease] = useState(false)
  const [showUploadLeaseModal, setShowUploadLeaseModal] = useState(false)
  const [isUploadingLease, setIsUploadingLease] = useState(false)
  const [leaseUploadFile, setLeaseUploadFile] = useState<File | null>(null)
  const [showNewLeaseChoiceModal, setShowNewLeaseChoiceModal] = useState(false)
  const [showUploadNewLeaseModal, setShowUploadNewLeaseModal] = useState(false)
  const [uploadNewLeaseForm, setUploadNewLeaseForm] = useState({
    startDate: '',
    leaseTerm: '12',
    endDate: '',
    monthlyRent: '',
    securityDeposit: '',
    rentDueDay: '1',
    gracePeriodDays: '5',
    latePenaltyPerDay: '500',
    noticePeriod: '1',
    rentEscalation: '',
    paymentRecipient: 'agent',
    mpesaTill: '',
    bankDetails: '',
    petPolicy: '',
    specialConditions: '',
    terms: '',
    tenant2Name: '',
    tenant2IdNumber: '',
    tenant2Email: '',
    tenant2Phone: '',
  })
  const [uploadNewLeaseFile, setUploadNewLeaseFile] = useState<File | null>(null)
  const [isUploadingNewLease, setIsUploadingNewLease] = useState(false)
  const [uploadNewLeaseError, setUploadNewLeaseError] = useState('')

  const [tenantApiData, setTenantApiData] = useState<any>(null)
  const [isLoadingTenant, setIsLoadingTenant] = useState(false)
  const [docsList, setDocsList] = useState<any[]>([])
  const [docsLoading, setDocsLoading] = useState(false)
  const [showUploadDocModal, setShowUploadDocModal] = useState(false)
  const [uploadDocFile, setUploadDocFile] = useState<File | null>(null)
  const [uploadingDoc, setUploadingDoc] = useState(false)

  // Unwrap params to get tenant ID
  useEffect(() => {
    params.then(p => setTenantId(p.id))
  }, [params])

  // Fetch real tenant data from API
  useEffect(() => {
    if (!tenantId) return
    setIsLoadingTenant(true)
    fetch(`/api/tenants/${tenantId}`)
      .then(r => r.json())
      .then(data => { if (data && !data.error) setTenantApiData(data); setIsLoadingTenant(false) })
      .catch(() => setIsLoadingTenant(false))
  }, [tenantId])

  const fetchDocuments = () => {
    if (!tenantId) return
    setDocsLoading(true)
    fetch(`/api/tenants/${tenantId}/documents`)
      .then(r => r.json())
      .then(d => setDocsList(d.documents || []))
      .finally(() => setDocsLoading(false))
  }

  useEffect(() => {
    if (activeTab === 'documents') fetchDocuments()
  }, [activeTab, tenantId])

  const handleUploadDoc = async () => {
    if (!uploadDocFile || !tenantId) return
    setUploadingDoc(true)
    try {
      const fd = new FormData()
      fd.append('file', uploadDocFile)
      const res = await fetch(`/api/tenants/${tenantId}/documents`, { method: 'POST', body: fd })
      if (res.ok) {
        setUploadDocFile(null)
        setShowUploadDocModal(false)
        fetchDocuments()
      } else {
        const err = await res.json()
        alert(err.error || 'Upload failed')
      }
    } catch { alert('Upload failed') }
    finally { setUploadingDoc(false) }
  }

  const handleDeleteDoc = async (docId: string) => {
    if (!confirm('Delete this document?')) return
    await fetch(`/api/tenants/${tenantId}/documents?docId=${docId}`, { method: 'DELETE' })
    fetchDocuments()
  }

  // Adapt API response to shape used by this component
  const unitData = tenantApiData?.unitRef || null
  const tenant = tenantApiData ? {
    ...tenantApiData,
    property: tenantApiData.property?.name || '',
    unit: tenantApiData.unit || unitData?.unitNumber || '',
    rent: Number(tenantApiData.leases?.[0]?.monthlyRent) || Number(unitData?.monthlyRent) || 0,
    serviceCharge: Number(unitData?.serviceCharge) || 0,
    deposit: Number(tenantApiData.leases?.[0]?.securityDeposit) || 0,
    landlordName: unitData?.landlord?.name || tenantApiData.property?.landlord?.name || '',
    landlordId: unitData?.landlord?.id || tenantApiData.property?.landlord?.id || '',
    moveIn: tenantApiData.moveInDate ? tenantApiData.moveInDate.split('T')[0] : '',
  } : null

  // Show loading state while params are being unwrapped
  if (!tenantId || isLoadingTenant) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading tenant data...</p>
        </div>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900">Tenant Not Found</h1>
          <p className="mt-2 text-neutral-600">The tenant with ID {tenantId} could not be found.</p>
        </div>
      </div>
    )
  }

  // Initialize edit form when modal opens
  const handleEditClick = () => {
    setEditForm({
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      property: tenant.property,
      unit: tenant.unit,
      rent: tenant.rent?.toString() || '',
      moveIn: tenant.moveIn,
      status: tenant.status,
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    try {
      // 1. Update tenant fields
      const res = await fetch(`/api/tenants/${tenantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          unit: editForm.unit,
          status: editForm.status,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Failed to save changes')
        return
      }

      // 2. Update the active lease's monthly rent if it changed
      const newRent = editForm.rent ? parseFloat(editForm.rent.toString()) : null
      const currentLease = tenantLeases.find((l: any) => l.status === 'ACTIVE')
      if (currentLease && newRent !== null && newRent !== Number(currentLease.monthlyRent)) {
        const leaseRes = await fetch(`/api/leases/${currentLease.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ monthlyRent: newRent }),
        })
        if (!leaseRes.ok) {
          const err = await leaseRes.json()
          alert(err.error || 'Tenant saved but rent update failed')
        }
      }

      setShowEditModal(false)
      window.location.reload()
    } catch { alert('Failed to save changes') }
  }

  const handleRecordPayment = async () => {
    if (!paymentForm.amount || !paymentForm.date) return
    if (!currentLease?.id) {
      alert('This tenant has no active lease. Please create a lease before recording a payment.')
      return
    }
    const methodMap: Record<string, string> = {
      'Bank Transfer': 'BANK_TRANSFER', 'M-Pesa': 'MPESA', 'Cash': 'CASH', 'Cheque': 'CHEQUE', 'Card': 'CARD'
    }
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          leaseId: currentLease.id,
          amount: parseFloat(paymentForm.amount),
          type: 'RENT',
          method: methodMap[paymentForm.method] || 'BANK_TRANSFER',
          dueDate: paymentForm.date,
          paidDate: paymentForm.date,
          status: paymentForm.status === 'Paid' ? 'PAID' : 'PENDING',
          reference: paymentForm.reference || undefined,
          notes: paymentForm.month ? `${paymentForm.month} rent` : undefined,
        }),
      })
      if (res.ok) {
        setShowRecordPaymentModal(false)
        setPaymentForm({ month: '', amount: '', date: '', method: 'Bank Transfer', status: 'Paid', reference: '' })
        window.location.reload()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to record payment')
      }
    } catch { alert('Failed to record payment') }
  }

  // Get related data from API response — show active lease, or fall back to most recent
  const tenantLeases = tenantApiData?.leases || []
  const currentLease = tenantLeases.find((l: any) => l.status === 'ACTIVE') || tenantLeases[0] || null
  const tenantPayments = (tenantApiData?.payments || []).map((p: any) => ({
    ...p,
    month: p.paidDate ? new Date(p.paidDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '',
    paidDate: p.paidDate ? p.paidDate.split('T')[0] : '',
    status: p.status === 'PAID' ? 'Paid' : p.status === 'OVERDUE' ? 'Overdue' : p.status,
  }))
  const tenantMaintenance = (tenantApiData?.maintenanceRequests || []).map((m: any) => ({
    ...m,
    dateSubmitted: m.createdAt ? m.createdAt.split('T')[0] : '',
    vendorName: m.assignedContractor?.name || '',
  }))

  const allMessages: any[] = tenantApiData?.messages || []
  const tenantNotes = allMessages
    .filter((m: any) => m.type === 'IN_APP' || m.type === 'SYSTEM')
    .map((m: any) => ({ id: m.id, note: m.content, subject: m.subject, date: m.sentAt, author: '' }))
  const communications = allMessages
    .filter((m: any) => m.type !== 'IN_APP' && m.type !== 'SYSTEM')
    .map((m: any) => ({ id: m.id, subject: m.subject, type: m.type?.toLowerCase(), category: m.category, status: m.status?.toLowerCase(), date: m.sentAt ? m.sentAt.split('T')[0] : '', content: m.content }))
  const activityLog = [
    ...allMessages.map((m: any) => ({ id: m.id, type: (m.type === 'IN_APP' || m.type === 'SYSTEM') ? 'note' : 'communication', description: `${m.type}: ${m.subject}`, date: m.sentAt, user: '' })),
    ...tenantPayments.map((p: any) => ({ id: p.id, type: 'payment', description: `Payment: KES ${Number(p.amount).toLocaleString()} — ${p.month}`, date: p.paidDate, user: '' })),
    ...tenantMaintenance.map((m: any) => ({ id: m.id, type: 'maintenance', description: `${m.title} (${m.status})`, date: m.createdAt, user: '' })),
  ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
  // Merge the uploaded lease PDF into the documents list as a virtual entry
  const leaseDocEntry = currentLease?.documentUrl
    ? [{
        id: `lease-doc-${currentLease.id}`,
        name: 'Lease Agreement',
        url: currentLease.documentUrl,
        fileType: 'application/pdf',
        fileSize: null,
        uploadedAt: currentLease.updatedAt || currentLease.createdAt,
        isLease: true,
      }]
    : []
  const documents = [...leaseDocEntry, ...docsList]

  // Filter payments based on filters
  const filteredPayments = tenantPayments.filter((payment: any) => {
    // Month filter
    if (paymentFilters.month && payment.month !== paymentFilters.month) {
      return false
    }
    
    // Date range filter (using paidDate)
    if (paymentFilters.startDate && payment.paidDate && payment.paidDate < paymentFilters.startDate) {
      return false
    }
    if (paymentFilters.endDate && payment.paidDate && payment.paidDate > paymentFilters.endDate) {
      return false
    }
    
    // Method filter
    if (paymentFilters.method && payment.method !== paymentFilters.method) {
      return false
    }
    
    // Status filter
    if (paymentFilters.status && payment.status !== paymentFilters.status) {
      return false
    }
    
    return true
  })

  // Filter maintenance requests
  const filteredMaintenance = tenantMaintenance.filter((request: any) => {
    if (maintenanceFilters.status && request.status !== maintenanceFilters.status) return false
    if (maintenanceFilters.priority && request.priority !== maintenanceFilters.priority) return false
    if (maintenanceFilters.vendor) {
      if (maintenanceFilters.vendor === 'unassigned') {
        if (request.vendorName) return false
      } else if (request.vendorName !== maintenanceFilters.vendor) return false
    }
    if (maintenanceFilters.startDate && request.dateSubmitted < maintenanceFilters.startDate) return false
    if (maintenanceFilters.endDate && request.dateSubmitted > maintenanceFilters.endDate) return false
    return true
  })

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    if (!documentSearch) return true
    
    const searchLower = documentSearch.toLowerCase()
    return doc.name.toLowerCase().includes(searchLower) ||
           (doc.fileType || '').toLowerCase().includes(searchLower)
  })

  // Filter communications
  const filteredCommunications = communications.filter(comm => {
    // Status filter
    if (communicationFilters.status && comm.status !== communicationFilters.status) {
      return false
    }
    
    // Type filter
    if (communicationFilters.type && comm.type !== communicationFilters.type) {
      return false
    }
    
    // Category filter
    if (communicationFilters.category && comm.category !== communicationFilters.category) {
      return false
    }
    
    // Date range filter
    if (communicationFilters.startDate && comm.date < communicationFilters.startDate) {
      return false
    }
    if (communicationFilters.endDate && comm.date > communicationFilters.endDate) {
      return false
    }
    
    return true
  })

  // Get unique months from payments for dropdown
  const uniqueMonths: string[] = [...new Set<string>(tenantPayments.map((p: any) => p.month as string))].sort().reverse()

  // Get unique vendors from maintenance requests for dropdown
  const uniqueVendors: string[] = [...new Set<string>(
    tenantMaintenance
      .map((r: any) => r.vendorName as string)
      .filter((name: string) => name && name !== '')
  )].sort()

  const clearPaymentFilters = () => {
    setPaymentFilters({
      month: '',
      startDate: '',
      endDate: '',
      method: '',
      status: '',
    })
  }

  const clearMaintenanceFilters = () => {
    setMaintenanceFilters({
      status: '',
      priority: '',
      vendor: '',
      startDate: '',
      endDate: '',
    })
  }

  const clearCommunicationFilters = () => {
    setCommunicationFilters({
      status: '',
      type: '',
      startDate: '',
      endDate: '',
      category: '',
    })
  }

  const handleSendMessage = () => {
    console.log('Sending message:', {
      to: tenant.phone,
      method: messageForm.method,
      subject: messageForm.subject,
      message: messageForm.message,
      template: messageForm.template,
      attachments: attachments.map(f => f.name),
    })
    // In real app, this would call appropriate API (Email, SMS, or WhatsApp)
    setShowSendMessageModal(false)
    setMessageForm({ method: 'email', subject: '', message: '', template: '' })
    setAttachments([])
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newFiles = Array.from(files)
      setAttachments(prev => [...prev, ...newFiles])
    }
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleImproveWithAI = async (field: 'message' | 'subject') => {
    setIsImprovingText(true)
    
    // Simulate AI API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    if (field === 'message' && messageForm.message) {
      // In real app, this would call your LLM API configured in settings
      const improved = messageForm.message + '\n\nThis message has been enhanced for clarity and professionalism.'
      setMessageForm({ ...messageForm, message: improved })
    } else if (field === 'subject' && messageForm.subject) {
      const improved = '✨ ' + messageForm.subject
      setMessageForm({ ...messageForm, subject: improved })
    }
    
    setIsImprovingText(false)
  }

  const messageTemplates = [
    { id: 'rent_reminder', name: 'Rent Reminder', category: 'all', message: 'Hi {name}, this is a friendly reminder that your rent payment of KES {amount} is due on {date}. Thank you!', subject: 'Rent Payment Reminder' },
    { id: 'payment_confirmation', name: 'Payment Confirmation', category: 'all', message: 'Hi {name}, we have received your payment of KES {amount}. Thank you for your prompt payment!', subject: 'Payment Received Confirmation' },
    { id: 'maintenance_update', name: 'Maintenance Update', category: 'all', message: 'Hi {name}, your maintenance request has been updated. Status: {status}. We will keep you informed.', subject: 'Maintenance Request Update' },
    { id: 'lease_renewal', name: 'Lease Renewal', category: 'all', message: 'Hi {name}, your lease is expiring soon on {date}. Please contact us to discuss renewal options.', subject: 'Lease Renewal Notice' },
    { id: 'custom', name: 'Custom Message', category: 'all', message: '', subject: '' },
  ]

  const handleTemplateSelect = (templateId: string) => {
    const template = messageTemplates.find(t => t.id === templateId)
    if (template && template.message) {
      // Replace placeholders with actual data
      let message = template.message
        .replace('{name}', tenant.name.split(' ')[0])
        .replace('{amount}', tenant.rent?.toLocaleString() || '0')
        .replace('{date}', formatDate(currentLease?.endDate || new Date().toISOString()))
        .replace('{status}', 'In Progress')
      
      let subject = template.subject
        .replace('{name}', tenant.name.split(' ')[0])
      
      setMessageForm({ ...messageForm, template: templateId, message, subject })
    } else {
      setMessageForm({ ...messageForm, template: templateId, message: '', subject: '' })
    }
  }

  const handleGenerateLease = async () => {
    const propertyId = tenantApiData?.property?.id
    if (!propertyId) {
      alert('No property found for this tenant. Please assign the tenant to a unit first.')
      return
    }
    if (!generateLeaseForm.startDate || !generateLeaseForm.endDate || !generateLeaseForm.monthlyRent || !generateLeaseForm.securityDeposit) {
      alert('Please fill in all required fields.')
      return
    }
    setIsGeneratingLease(true)
    try {
      const f = generateLeaseForm
      const res = await fetch('/api/leases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          propertyId,
          unitId: unitData?.id || undefined,
          startDate: f.startDate,
          endDate: f.endDate,
          monthlyRent: parseFloat(f.monthlyRent),
          securityDeposit: parseFloat(f.securityDeposit),
          rentDueDay: parseInt(f.rentDueDay) || 1,
          gracePeriodDays: parseInt(f.gracePeriodDays) || 5,
          latePenaltyPerDay: parseFloat(f.latePenaltyPerDay) || 500,
          noticePeriod: parseInt(f.noticePeriod) || 1,
          ...(f.rentEscalation ? { rentEscalation: parseFloat(f.rentEscalation) } : {}),
          ...(f.mpesaTill ? { mpesaTill: f.mpesaTill } : {}),
          ...(f.bankDetails ? { bankDetails: f.bankDetails } : {}),
          ...(f.petPolicy ? { petPolicy: f.petPolicy } : {}),
          ...(f.specialConditions ? { specialConditions: f.specialConditions } : {}),
          ...(f.terms ? { terms: f.terms } : {}),
          ...(f.tenant2Name ? { tenant2Name: f.tenant2Name } : {}),
          ...(f.tenant2IdNumber ? { tenant2IdNumber: f.tenant2IdNumber } : {}),
          ...(f.tenant2Email ? { tenant2Email: f.tenant2Email } : {}),
          ...(f.tenant2Phone ? { tenant2Phone: f.tenant2Phone } : {}),
        }),
      })
      if (res.ok) {
        setShowGenerateLeaseModal(false)
        setGenerateLeaseForm({ startDate: '', leaseTerm: '12', endDate: '', monthlyRent: '', securityDeposit: '', rentDueDay: '1', gracePeriodDays: '5', latePenaltyPerDay: '500', noticePeriod: '1', rentEscalation: '', paymentRecipient: 'agent', mpesaTill: '', bankDetails: '', petPolicy: '', specialConditions: '', terms: '', tenant2Name: '', tenant2IdNumber: '', tenant2Email: '', tenant2Phone: '' })
        window.location.reload()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to create lease')
      }
    } catch { alert('Failed to create lease') }
    finally { setIsGeneratingLease(false) }
  }

  const handleUploadLease = async () => {
    if (!leaseUploadFile || !currentLease?.id) return
    setIsUploadingLease(true)
    try {
      const fd = new FormData()
      fd.append('file', leaseUploadFile)
      fd.append('type', 'document')
      const res = await fetch(`/api/leases/${currentLease.id}/upload`, {
        method: 'POST',
        body: fd,
      })
      if (res.ok) {
        setShowUploadLeaseModal(false)
        setLeaseUploadFile(null)
        window.location.reload()
      } else {
        const data = await res.json()
        alert(data.error || 'Upload failed')
      }
    } catch { alert('Upload failed') }
    finally { setIsUploadingLease(false) }
  }

  const handleUploadNewLease = async () => {
    const propertyId = tenantApiData?.property?.id
    setUploadNewLeaseError('')
    if (!propertyId) {
      setUploadNewLeaseError('No property found for this tenant. Please assign the tenant to a unit first.')
      return
    }
    const uf = uploadNewLeaseForm
    if (!uf.startDate || !uf.endDate || !uf.monthlyRent || !uf.securityDeposit) {
      setUploadNewLeaseError('Please fill in all date and rent fields.')
      return
    }
    if (!uf.terms.trim()) {
      setUploadNewLeaseError('Lease terms are required when uploading a signed document.')
      return
    }
    if (!uploadNewLeaseFile) {
      setUploadNewLeaseError('Please select a lease document to upload.')
      return
    }
    setIsUploadingNewLease(true)
    try {
      // Step 1: create the new lease record
      const createRes = await fetch('/api/leases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          propertyId,
          unitId: unitData?.id || undefined,
          startDate: uf.startDate,
          endDate: uf.endDate,
          monthlyRent: parseFloat(uf.monthlyRent),
          securityDeposit: parseFloat(uf.securityDeposit),
          rentDueDay: parseInt(uf.rentDueDay) || 1,
          gracePeriodDays: parseInt(uf.gracePeriodDays) || 5,
          latePenaltyPerDay: parseFloat(uf.latePenaltyPerDay) || 500,
          noticePeriod: parseInt(uf.noticePeriod) || 1,
          ...(uf.rentEscalation ? { rentEscalation: parseFloat(uf.rentEscalation) } : {}),
          ...(uf.mpesaTill ? { mpesaTill: uf.mpesaTill } : {}),
          ...(uf.bankDetails ? { bankDetails: uf.bankDetails } : {}),
          ...(uf.petPolicy ? { petPolicy: uf.petPolicy } : {}),
          ...(uf.specialConditions ? { specialConditions: uf.specialConditions } : {}),
          terms: uf.terms,
          ...(uf.tenant2Name ? { tenant2Name: uf.tenant2Name } : {}),
          ...(uf.tenant2IdNumber ? { tenant2IdNumber: uf.tenant2IdNumber } : {}),
          ...(uf.tenant2Email ? { tenant2Email: uf.tenant2Email } : {}),
          ...(uf.tenant2Phone ? { tenant2Phone: uf.tenant2Phone } : {}),
        }),
      })
      if (!createRes.ok) {
        const err = await createRes.json()
        setUploadNewLeaseError(err.error || 'Failed to create lease record.')
        return
      }
      const newLease = await createRes.json()

      // Step 2: upload the signed document
      const fd = new FormData()
      fd.append('file', uploadNewLeaseFile)
      fd.append('type', 'document')
      const uploadRes = await fetch(`/api/leases/${newLease.id}/upload`, { method: 'POST', body: fd })
      if (!uploadRes.ok) {
        const err = await uploadRes.json()
        setUploadNewLeaseError(err.error || 'Lease created but document upload failed.')
        return
      }

      // Step 3: mark as hard-copy signed and activate
      const now = new Date().toISOString()
      await fetch(`/api/leases/${newLease.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantSignature: 'HARD_COPY',
          landlordSignature: 'HARD_COPY',
          tenantSignedAt: now,
          landlordSignedAt: now,
          status: 'ACTIVE',
        }),
      })

      setShowUploadNewLeaseModal(false)
      setUploadNewLeaseForm({ startDate: '', leaseTerm: '12', endDate: '', monthlyRent: '', securityDeposit: '', rentDueDay: '1', gracePeriodDays: '5', latePenaltyPerDay: '500', noticePeriod: '1', rentEscalation: '', paymentRecipient: 'agent', mpesaTill: '', bankDetails: '', petPolicy: '', specialConditions: '', terms: '', tenant2Name: '', tenant2IdNumber: '', tenant2Email: '', tenant2Phone: '' })
      setUploadNewLeaseFile(null)
      window.location.reload()
    } catch {
      setUploadNewLeaseError('An unexpected error occurred. Please try again.')
    } finally {
      setIsUploadingNewLease(false)
    }
  }

  // Calculate statistics
  const totalPaid = tenantPayments.filter((p: any) => p.status === 'Paid').reduce((sum: number, p: any) => sum + Number(p.amount), 0)
  const totalOverdue = tenantPayments.filter((p: any) => p.status === 'Overdue').reduce((sum: number, p: any) => sum + Number(p.amount), 0)
  const onTimePayments = tenantPayments.filter((p: any) => p.status === 'Paid').length
  const totalPayments = tenantPayments.length
  const paymentRate = totalPayments > 0 ? Math.round((onTimePayments / totalPayments) * 100) : 0

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-success-100 text-green-800'
      case 'inactive': return 'bg-neutral-100 text-neutral-800'
      case 'late': return 'bg-danger-100 text-red-800'
      default: return 'bg-neutral-100 text-neutral-800'
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
      <div className="bg-surface rounded-lg border border-neutral-200 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
              {tenant.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900">{tenant.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tenant.status)}`}>
                  {tenant.status}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                  Tenant
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 text-sm">
                <div className="min-w-0">
                  <p className="text-neutral-600">📧 Email</p>
                  <p className="font-medium text-neutral-900 break-all">{tenant.email}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-neutral-600">📱 Phone</p>
                  <p className="font-medium text-neutral-900">{tenant.phone}</p>
                </div>
                <div>
                  <p className="text-neutral-600">🏠 Property</p>
                  {tenantApiData?.property?.id ? (
                    <Link href={`/admin/properties/${tenantApiData.property.id}`} className="font-medium text-primary-600 hover:underline">{tenant.property}</Link>
                  ) : (
                    <p className="font-medium text-neutral-900">{tenant.property || '-'}</p>
                  )}
                </div>
                <div>
                  <p className="text-neutral-600">🚪 Unit</p>
                  {tenantApiData?.unitRef?.unitNumber ? (
                    <Link href={`/admin/units/${tenantApiData.unitRef.unitNumber}`} className="font-medium text-primary-600 hover:underline">{tenant.unit}</Link>
                  ) : (
                    <p className="font-medium text-neutral-900">{tenant.unit || '-'}</p>
                  )}
                </div>
                <div>
                  <p className="text-neutral-600">💵 Monthly Rent</p>
                  <p className="font-medium text-neutral-900">KES {tenant.rent?.toLocaleString()}</p>
                </div>
                {tenant.serviceCharge > 0 && (
                  <div>
                    <p className="text-neutral-600">🏷️ Service Charge</p>
                    <p className="font-medium text-neutral-900">KES {tenant.serviceCharge?.toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-neutral-600">📅 Move-in Date</p>
                  <p className="font-medium text-neutral-900">{formatDate(tenant.moveIn)}</p>
                </div>
                {currentLease?.startDate && (
                  <div>
                    <p className="text-neutral-600">🗓️ Lease Start</p>
                    <p className="font-medium text-neutral-900">{formatDate(currentLease.startDate)}</p>
                  </div>
                )}
                {currentLease?.endDate && (
                  <div>
                    <p className="text-neutral-600">🗓️ Lease End</p>
                    <p className={`font-medium ${
                      currentLease.status === 'EXPIRED' || currentLease.status === 'TERMINATED'
                        ? 'text-red-600'
                        : new Date(currentLease.endDate) < new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
                          ? 'text-amber-600'
                          : 'text-neutral-900'
                    }`}>
                      {formatDate(currentLease.endDate)}
                      {currentLease.status === 'EXPIRED' && <span className="ml-1 text-xs">(Expired)</span>}
                      {currentLease.status === 'TERMINATED' && <span className="ml-1 text-xs">(Terminated)</span>}
                    </p>
                  </div>
                )}
                {tenant.landlordName && (
                  <div>
                    <p className="text-neutral-600">🏢 Landlord</p>
                    <div className="space-y-1">
                      {tenant.landlordId ? (
                        <Link href={`/admin/landlords/${tenant.landlordId}`} className="font-medium text-primary-600 hover:underline block">
                          {tenant.landlordName}
                        </Link>
                      ) : (
                        <p className="font-medium text-neutral-900">{tenant.landlordName}</p>
                      )}
                      {tenantApiData?.unitRef?.landlord?.type === 'JOINT_OWNERSHIP' && tenantApiData.unitRef.landlord.members?.length > 0 && (
                        <p className="text-xs text-neutral-500">
                          & {tenantApiData.unitRef.landlord.members.map((m: any) => m.name).join(' & ')}
                        </p>
                      )}
                      {tenantApiData?.unitRef?.landlord?.type === 'COMPANY' && (
                        <span className="text-xs text-neutral-500">Company</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleEditClick}>
              ✏️ Edit
            </Button>
            <StatementMenuButton
              label="📄 Statement"
              onSelect={(period) => {
                const { startDate, endDate } = getStatementDateRange(period)
                window.open(`/api/tenants/${tenantId}/statement?format=html&startDate=${startDate}&endDate=${endDate}`, '_blank')
              }}
            />
            <Button
              variant="outline"
              onClick={() => {
                setAssumedTenant({
                  id: tenantId,
                  name: tenant.name,
                  unitNumber: tenantApiData?.unitRef?.unitNumber ?? tenant.unit ?? '',
                })
                router.push('/tenant/dashboard')
              }}
            >
              Assume Tenant
            </Button>
            <Button variant="outline" onClick={() => setShowInvitePreview(true)}>
              ✉️ Invite
            </Button>
            <Button variant="primary" onClick={() => setShowSendMessageModal(true)}>
              💬 Contact
            </Button>
            <ArchiveDeleteButtons
              entityName="tenant"
              entityLabel={tenant.name}
              archiveUrl={`/api/tenants/${tenantId}`}
              deleteUrl={`/api/tenants/${tenantId}`}
              isArchived={tenant.status === 'ARCHIVED'}
              onSuccess={() => router.push('/admin/tenants')}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface rounded-lg border border-neutral-200 p-4 md:p-6">
          <p className="text-sm text-neutral-600">Total Paid</p>
          <p className="text-xl md:text-2xl font-bold text-success-600 mt-2">KES {totalPaid.toLocaleString()}</p>
          <p className="text-xs text-neutral-500 mt-1">{onTimePayments} payments</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-4 md:p-6">
          <p className="text-sm text-neutral-600">Payment Rate</p>
          <p className="text-xl md:text-2xl font-bold text-primary-600 mt-2">{paymentRate}%</p>
          <p className="text-xs text-neutral-500 mt-1">On-time payments</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-4 md:p-6">
          <p className="text-sm text-neutral-600">Maintenance Requests</p>
          <p className="text-xl md:text-2xl font-bold text-warning-600 mt-2">{tenantMaintenance.length}</p>
          <p className="text-xs text-neutral-500 mt-1">Total requests</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-4 md:p-6">
          <p className="text-sm text-neutral-600">Lease Status</p>
          <p className={`text-xl md:text-2xl font-bold mt-2 ${
            currentLease?.status === 'ACTIVE' ? 'text-success-600' :
            currentLease?.status === 'EXPIRED' ? 'text-danger-600' :
            currentLease?.status === 'TERMINATED' ? 'text-danger-600' :
            currentLease?.status === 'PENDING' ? 'text-warning-600' :
            'text-neutral-400'
          }`}>{currentLease?.status || 'No Lease'}</p>
          <p className="text-xs text-neutral-500 mt-1">
            {currentLease
              ? currentLease.status === 'ACTIVE'
                ? `Ends ${formatDate(currentLease.endDate)}`
                : `Ended ${formatDate(currentLease.endDate)}`
              : 'No lease on record'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-surface rounded-lg border border-neutral-200">
        <div className="border-b border-neutral-200">
          <div className="flex flex-nowrap whitespace-nowrap space-x-1 p-1 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'payments', label: 'Payments', icon: '💰' },
              { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
              { id: 'documents', label: 'Documents', icon: '📄' },
              { id: 'communications', label: 'Communications', icon: '💬' },
              { id: 'notes', label: 'Notes', icon: '📝' },
              { id: 'tasks', label: 'Tasks', icon: '✓' },
              { id: 'activity', label: 'Activity Log', icon: '📋' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
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

        <div className="p-4 md:p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Leases */}
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-4">Leases</h3>
                  {tenantLeases.length > 0 ? (
                    <div className="space-y-3">
                      {[...tenantLeases].sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map((lease: any) => {
                        const isActive = lease.status === 'ACTIVE'
                        const statusColor = isActive
                          ? 'bg-success-100 text-success-700'
                          : lease.status === 'PENDING'
                          ? 'bg-warning-100 text-warning-700'
                          : 'bg-danger-100 text-danger-700'
                        return (
                          <div
                            key={lease.id}
                            className={`rounded-lg p-4 space-y-2 ${isActive ? 'bg-neutral-50 border border-neutral-200' : 'bg-neutral-50 border border-neutral-100 opacity-80'}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${statusColor}`}>{lease.status}</span>
                              <span className="text-xs text-neutral-500">{formatDate(lease.startDate)} – {formatDate(lease.endDate)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-neutral-600">Monthly Rent</span>
                              <span className="font-medium text-neutral-900">KES {Number(lease.monthlyRent).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-neutral-600">Security Deposit</span>
                              <span className="font-medium text-neutral-900">KES {Number(lease.securityDeposit).toLocaleString()}</span>
                            </div>
                            <Button
                              variant="outline"
                              className="w-full mt-1"
                              onClick={() => router.push(`/admin/leases/${lease.id}`)}
                            >
                              View Lease Details
                            </Button>
                          </div>
                        )
                      })}
                      {!currentLease?.documentUrl && currentLease && currentLease.status === 'ACTIVE' && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setShowUploadLeaseModal(true)}
                        >
                          Upload Signed Lease
                        </Button>
                      )}
                      {!tenantLeases.find((l: any) => l.status === 'ACTIVE') && (
                        <Button
                          className="w-full"
                          onClick={() => setShowNewLeaseChoiceModal(true)}
                        >
                          + New Lease
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="bg-neutral-50 rounded-lg p-4 text-center">
                      <p className="text-neutral-500 mb-3">No lease on record</p>
                      <Button
                        className="w-full"
                        onClick={() => setShowNewLeaseChoiceModal(true)}
                      >
                        + New Lease
                      </Button>
                    </div>
                  )}
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

              {/* Payment History Summary */}
              <div>
                <h3 className="font-semibold text-neutral-900 mb-4">Payment History (Last 6 Months)</h3>
                <div className="bg-neutral-50 rounded-lg p-4">
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {tenantPayments.slice(0, 6).map((payment: any, idx: number) => (
                      <div key={idx} className="text-center">
                        <div className={`h-20 rounded flex items-end justify-center pb-2 ${
                          payment.status === 'Paid' ? 'bg-success-500' : 
                          payment.status === 'Pending' ? 'bg-yellow-500' : 'bg-danger-500'
                        }`}>
                          <span className="text-white text-xs font-medium">
                            {payment.amount / 1000}K
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600 mt-1">{payment.month}</p>
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                <h3 className="font-semibold text-neutral-900">Payment History</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <StatementMenuButton
                    label="📄 Download Statement"
                    onSelect={(period) => {
                      const { startDate, endDate } = getStatementDateRange(period)
                      window.open(`/api/tenants/${tenantId}/statement?format=html&startDate=${startDate}&endDate=${endDate}`, '_blank')
                    }}
                  />
                  <Button variant="primary" onClick={() => setShowRecordPaymentModal(true)}>+ Record Payment</Button>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-neutral-50 rounded-lg p-3 md:p-4 border border-neutral-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-neutral-900">Filters</h4>
                  <button
                    onClick={clearPaymentFilters}
                    className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Month
                    </label>
                    <select
                      value={paymentFilters.month}
                      onChange={(e) => setPaymentFilters({ ...paymentFilters, month: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Months</option>
                      {uniqueMonths.map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={paymentFilters.startDate}
                      onChange={(e) => setPaymentFilters({ ...paymentFilters, startDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={paymentFilters.endDate}
                      onChange={(e) => setPaymentFilters({ ...paymentFilters, endDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={paymentFilters.method}
                      onChange={(e) => setPaymentFilters({ ...paymentFilters, method: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Methods</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="M-Pesa">M-Pesa</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Card">Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Status
                    </label>
                    <select
                      value={paymentFilters.status}
                      onChange={(e) => setPaymentFilters({ ...paymentFilters, status: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="COMPLETED">Paid</option>
                      <option value="PENDING">Pending</option>
                      <option value="OVERDUE">Overdue</option>
                      <option value="PARTIAL">Partial</option>
                    </select>
                  </div>
                </div>

                {/* Filter summary */}
                <div className="mt-3 text-sm text-neutral-600">
                  Showing {filteredPayments.length} of {tenantPayments.length} payments
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase">Month</th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase">Amount</th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase">Date</th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase">Method</th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase">Reference</th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="bg-surface divide-y divide-neutral-200">
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map((payment: any) => (
                        <tr key={payment.id} className="hover:bg-neutral-50">
                          <td className="px-3 md:px-6 py-2 md:py-4 text-sm text-neutral-900">{payment.month}</td>
                          <td className="px-3 md:px-6 py-2 md:py-4 text-sm font-semibold text-neutral-900">KES {payment.amount.toLocaleString()}</td>
                          <td className="px-3 md:px-6 py-2 md:py-4 text-sm text-neutral-500">
                            {payment.paidDate ? formatDate(payment.paidDate as string) : '-'}
                          </td>
                          <td className="px-3 md:px-6 py-2 md:py-4 text-sm text-neutral-900">{payment.method}</td>
                          <td className="px-3 md:px-6 py-2 md:py-4 text-sm text-neutral-500 font-mono">
                            {payment.reference || <span className="text-neutral-300">—</span>}
                          </td>
                          <td className="px-3 md:px-6 py-2 md:py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              payment.status === 'COMPLETED' || payment.status === 'Paid' ? 'bg-success-100 text-green-800' :
                              payment.status === 'PENDING' || payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              payment.status === 'OVERDUE' || payment.status === 'Overdue' ? 'bg-danger-100 text-red-800' :
                              'bg-neutral-100 text-neutral-800'
                            }`}>
                              {payment.status === 'COMPLETED' ? 'Paid' : payment.status}
                            </span>
                          </td>
                          <td className="px-3 md:px-6 py-2 md:py-4">
                            <button
                              onClick={() => window.open(`/api/payments/${payment.id}/receipt`, '_blank')}
                              className="text-xs text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
                              title="View receipt"
                            >
                              🧾 Receipt
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-3 md:px-6 py-8 text-center text-sm text-neutral-500">
                          No payments found matching the selected filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-neutral-900">Service Requests</h3>
                <Link
                  href={`/admin/maintenance?tenantId=${tenantId}`}
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                  View all on Maintenance page →
                </Link>
              </div>

              {/* Filters */}
              <div className="bg-neutral-50 rounded-lg p-3 md:p-4 border border-neutral-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-neutral-900">Filters</h4>
                  <button onClick={clearMaintenanceFilters} className="text-sm text-primary-600 hover:text-primary-800 font-medium">
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Status</label>
                    <select
                      value={maintenanceFilters.status}
                      onChange={(e) => setMaintenanceFilters({ ...maintenanceFilters, status: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="NEW">New</option>
                      <option value="PENDING">Pending</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="RESPONSIBILITY_ASSIGNED">Vendor Assigned</option>
                      <option value="QUOTING">Quoting</option>
                      <option value="AWAITING_APPROVAL">Awaiting Approval</option>
                      <option value="AWAITING_FUNDS">Awaiting Funds</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED_PENDING_CONFIRMATION">Pending Confirmation</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CLOSED">Closed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Priority</label>
                    <select
                      value={maintenanceFilters.priority}
                      onChange={(e) => setMaintenanceFilters({ ...maintenanceFilters, priority: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Priorities</option>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Vendor</label>
                    <select
                      value={maintenanceFilters.vendor}
                      onChange={(e) => setMaintenanceFilters({ ...maintenanceFilters, vendor: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Vendors</option>
                      {uniqueVendors.map(vendor => (
                        <option key={vendor} value={vendor}>{vendor}</option>
                      ))}
                      <option value="unassigned">Unassigned</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Start Date</label>
                    <input type="date" value={maintenanceFilters.startDate}
                      onChange={(e) => setMaintenanceFilters({ ...maintenanceFilters, startDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">End Date</label>
                    <input type="date" value={maintenanceFilters.endDate}
                      onChange={(e) => setMaintenanceFilters({ ...maintenanceFilters, endDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div className="mt-3 text-sm text-neutral-600">
                  Showing {filteredMaintenance.length} of {tenantMaintenance.length} requests
                </div>
              </div>

              {filteredMaintenance.length === 0 ? (
                <div className="text-center py-10 text-neutral-500 border border-dashed border-neutral-300 rounded-lg">
                  <p className="text-3xl mb-2">🔧</p>
                  <p className="font-medium">No requests found</p>
                </div>
              ) : (
                filteredMaintenance.map((request: any) => {
                  const statusColors: Record<string, string> = {
                    NEW: 'bg-neutral-100 text-neutral-700',
                    PENDING: 'bg-yellow-100 text-yellow-800',
                    UNDER_REVIEW: 'bg-blue-100 text-blue-800',
                    RESPONSIBILITY_ASSIGNED: 'bg-indigo-100 text-indigo-800',
                    QUOTING: 'bg-purple-100 text-purple-800',
                    AWAITING_APPROVAL: 'bg-orange-100 text-orange-800',
                    AWAITING_FUNDS: 'bg-red-100 text-red-800',
                    IN_PROGRESS: 'bg-primary-100 text-primary-800',
                    COMPLETED_PENDING_CONFIRMATION: 'bg-teal-100 text-teal-800',
                    COMPLETED: 'bg-success-100 text-green-800',
                    CLOSED: 'bg-success-100 text-green-800',
                    CANCELLED: 'bg-neutral-100 text-neutral-700',
                    DISPUTED: 'bg-red-100 text-red-800',
                  }
                  const statusLabels: Record<string, string> = {
                    NEW: 'New', PENDING: 'Pending', UNDER_REVIEW: 'Under Review',
                    RESPONSIBILITY_ASSIGNED: 'Vendor Assigned', QUOTING: 'Quoting',
                    AWAITING_APPROVAL: 'Awaiting Approval', AWAITING_FUNDS: 'Awaiting Funds',
                    IN_PROGRESS: 'In Progress', COMPLETED_PENDING_CONFIRMATION: 'Pending Confirmation',
                    COMPLETED: 'Completed', CLOSED: 'Closed', CANCELLED: 'Cancelled', DISPUTED: 'Disputed',
                  }
                  return (
                    <div key={request.id} className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50">
                      <div className="flex justify-between items-start mb-2 gap-3">
                        <div className="flex-1 min-w-0">
                          {request.refNumber && (
                            <p className="text-xs font-mono text-neutral-400 mb-0.5">{formatRefNumber(request.refNumber)}</p>
                          )}
                          <h4 className="font-medium text-neutral-900">{request.title}</h4>
                          {request.description && (
                            <p className="text-sm text-neutral-500 mt-0.5 line-clamp-2">{request.description}</p>
                          )}
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusColors[request.status] ?? 'bg-neutral-100 text-neutral-700'}`}>
                          {statusLabels[request.status] ?? request.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mt-3">
                        <div>
                          <p className="text-xs text-neutral-500">Priority</p>
                          <p className="font-medium text-neutral-900">{request.priority}</p>
                        </div>
                        {request.category && (
                          <div>
                            <p className="text-xs text-neutral-500">Category</p>
                            <p className="font-medium text-neutral-900">{request.category}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-neutral-500">Submitted</p>
                          <p className="font-medium text-neutral-900">{formatDate(request.dateSubmitted)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500">Vendor</p>
                          <p className="font-medium text-neutral-900">{request.vendorName || <span className="text-neutral-400">Not assigned</span>}</p>
                        </div>
                        {request.responsibleParty && (
                          <div>
                            <p className="text-xs text-neutral-500">Responsibility</p>
                            <p className="font-medium text-neutral-900">{request.responsibleParty}</p>
                          </div>
                        )}
                        {request.resolvedAt && (
                          <div>
                            <p className="text-xs text-neutral-500">Resolved</p>
                            <p className="font-medium text-neutral-900">{formatDate(request.resolvedAt)}</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t border-neutral-100">
                        <Link
                          href={`/admin/maintenance`}
                          className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Manage on Maintenance page →
                        </Link>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                <h3 className="font-semibold text-neutral-900">Documents ({documents.length})</h3>
                <Button variant="primary" onClick={() => setShowUploadDocModal(true)}>📤 Upload Document</Button>
              </div>

              {/* Search */}
              <div className="bg-neutral-50 rounded-lg p-3 md:p-4 border border-neutral-200">
                <div className="relative">
                  <input
                    type="text"
                    value={documentSearch}
                    onChange={(e) => setDocumentSearch(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Search by document name..."
                  />
                  <svg className="absolute left-3 top-2.5 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {docsLoading ? (
                <p className="text-sm text-neutral-400 text-center py-8">Loading documents…</p>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded flex items-center justify-center text-lg">
                            {doc.fileType?.includes('pdf') ? '📄' : doc.fileType?.includes('image') ? '🖼️' : '📎'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-neutral-900">{doc.name}</p>
                              {doc.isLease && (
                                <span className="text-xs font-medium bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Lease</span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-500">
                              {doc.fileType} • {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : ''} {doc.uploadedAt ? `• ${formatDate(doc.uploadedAt)}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {doc.url && (
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm">View</Button>
                            </a>
                          )}
                          {!doc.isLease && (
                            <Button variant="outline" size="sm" onClick={() => handleDeleteDoc(doc.id)}>
                              <span className="text-danger-600">Delete</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-neutral-500">
                      <p className="text-4xl mb-3">📁</p>
                      <p className="font-medium">No documents yet</p>
                      <p className="text-sm mt-1">Upload IDs, passport photos, or any supporting documents</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Communications Tab */}
          {activeTab === 'communications' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                <h3 className="font-semibold text-neutral-900">Communication History</h3>
                <Button variant="primary" onClick={() => setShowSendMessageModal(true)}>✉️ Send Message</Button>
              </div>

              {/* Filters */}
              <div className="bg-neutral-50 rounded-lg p-3 md:p-4 border border-neutral-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-neutral-900">Filters</h4>
                  <button
                    onClick={clearCommunicationFilters}
                    className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Status
                    </label>
                    <select
                      value={communicationFilters.status}
                      onChange={(e) => setCommunicationFilters({ ...communicationFilters, status: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="sent">Sent</option>
                      <option value="delivered">Delivered</option>
                      <option value="read">Read</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Method
                    </label>
                    <select
                      value={communicationFilters.type}
                      onChange={(e) => setCommunicationFilters({ ...communicationFilters, type: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Methods</option>
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="in_app">In-App</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="system">System</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Category
                    </label>
                    <select
                      value={communicationFilters.category}
                      onChange={(e) => setCommunicationFilters({ ...communicationFilters, category: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Categories</option>
                      <option value="RENT_REMINDER">Rent Reminder</option>
                      <option value="PAYMENT">Payment</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="LEASE">Lease</option>
                      <option value="ANNOUNCEMENT">Announcement</option>
                      <option value="SUPPORT">Support</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={communicationFilters.startDate}
                      onChange={(e) => setCommunicationFilters({ ...communicationFilters, startDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={communicationFilters.endDate}
                      onChange={(e) => setCommunicationFilters({ ...communicationFilters, endDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Filter summary */}
                <div className="mt-3 text-sm text-neutral-600">
                  Showing {filteredCommunications.length} of {communications.length} communications
                </div>
              </div>

              {filteredCommunications.length > 0 ? (
                filteredCommunications.map(comm => (
                  <div key={comm.id} className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-neutral-900">{comm.subject}</h4>
                        <p className="text-sm text-neutral-600 mt-1">{comm.content}</p>
                        <p className="text-xs text-neutral-500 mt-2 capitalize">
                          {comm.type} • {comm.category?.toLowerCase()?.replace('_', ' ')} • {formatDate(comm.date)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-3 ${
                        comm.status === 'read' ? 'bg-success-100 text-green-800' :
                        comm.status === 'delivered' ? 'bg-primary-100 text-primary-800' :
                        comm.status === 'sent' ? 'bg-neutral-100 text-neutral-800' :
                        'bg-danger-100 text-red-800'
                      }`}>
                        {comm.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  No communications found matching the selected filters
                </div>
              )}
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                <h3 className="font-semibold text-neutral-900">Notes</h3>
                <Button variant="primary" onClick={() => setShowNoteModal(true)}>+ Add Note</Button>
              </div>
              {tenantNotes.length === 0 ? (
                <div className="text-center py-12 bg-neutral-50 rounded-lg border border-dashed border-neutral-300">
                  <p className="text-4xl mb-2">📝</p>
                  <p className="text-neutral-500 font-medium">No notes yet</p>
                  <Button variant="outline" className="mt-4" onClick={() => setShowNoteModal(true)}>Add First Note</Button>
                </div>
              ) : tenantNotes.map(note => (
                <div key={note.id} className="border border-neutral-200 rounded-lg p-4">
                  {note.subject && note.subject !== 'Note' && <p className="font-medium text-neutral-900 mb-1">{note.subject}</p>}
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
              stakeholderId={tenantId}
              stakeholderName={tenant.name}
              stakeholderType="Tenant"
            />
          )}

          {/* Activity Log Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-900 mb-4">Activity Timeline</h3>
              {activityLog.map(activity => (
                <div key={activity.id} className="flex items-start space-x-2 md:space-x-4 pb-4 border-b border-neutral-200 last:border-0">
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
          <div className="bg-surface rounded-lg max-w-full sm:max-w-2xl w-full mx-4 sm:mx-auto p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-neutral-900 mb-4">Add Note</h3>
            <textarea
              rows={6}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter note about this tenant..."
            />
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowNoteModal(false)} className="flex-1">Cancel</Button>
              <Button variant="primary" className="flex-1">Save Note</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Tenant Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-full sm:max-w-3xl w-full mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-surface border-b border-neutral-200 px-4 md:px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h2 className="text-lg md:text-xl font-bold text-neutral-900">Edit Tenant Information</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-4 md:px-6 py-4 space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Status *
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Late">Late</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Lease Information */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Lease Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Property *
                    </label>
                    <input
                      type="text"
                      value={editForm.property}
                      onChange={(e) => setEditForm({ ...editForm, property: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Unit *
                    </label>
                    <input
                      type="text"
                      value={editForm.unit}
                      onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Monthly Rent (KES) *
                    </label>
                    <input
                      type="number"
                      value={editForm.rent}
                      onChange={(e) => setEditForm({ ...editForm, rent: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Move-in Date *
                    </label>
                    <input
                      type="date"
                      value={editForm.moveIn}
                      onChange={(e) => setEditForm({ ...editForm, moveIn: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-neutral-50 border-t border-neutral-200 px-4 md:px-6 py-4 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveEdit}
                disabled={!editForm.name || !editForm.email || !editForm.phone}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showRecordPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-full sm:max-w-2xl w-full mx-4 sm:mx-auto">
            <div className="bg-surface border-b border-neutral-200 px-4 md:px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h2 className="text-lg md:text-xl font-bold text-neutral-900">Record Payment</h2>
              <button
                onClick={() => setShowRecordPaymentModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-4 md:px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Month *
                  </label>
                  <input
                    type="text"
                    value={paymentForm.month}
                    onChange={(e) => setPaymentForm({ ...paymentForm, month: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., November 2024"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Amount (KES) *
                  </label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="50000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Card">Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Payment Status *
                  </label>
                  <select
                    value={paymentForm.status}
                    onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Transaction Reference
                  </label>
                  <input
                    type="text"
                    value={paymentForm.reference}
                    onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., QGH7K2M9P4"
                  />
                  <p className="mt-1 text-xs text-neutral-400">M-Pesa code, bank ref, cheque no., etc.</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 border-t border-neutral-200 px-4 md:px-6 py-4 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setShowRecordPaymentModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleRecordPayment}
                disabled={!paymentForm.month || !paymentForm.amount || !paymentForm.date}
              >
                Record Payment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Preview Modal */}
      {showInvitePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-full sm:max-w-lg w-full mx-4 sm:mx-auto">
            <div className="border-b border-neutral-200 px-4 md:px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold text-neutral-900">Invitation Preview</h2>
              <button
                onClick={() => setShowInvitePreview(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-4 md:px-6 py-5 space-y-4">
              {/* Invitation details */}
              <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Recipient</span>
                  <span className="text-sm font-medium text-neutral-900">{tenant.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Email</span>
                  <span className="text-sm font-medium text-neutral-900">{tenant.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Role</span>
                  <span className="text-sm font-medium text-primary-700">Tenant</span>
                </div>
                {tenant.property && (
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Property</span>
                    <span className="text-sm font-medium text-neutral-900">{tenant.property}{tenant.unit ? ` — ${tenant.unit}` : ''}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Expires</span>
                  <span className="text-sm font-medium text-neutral-900">7 days from now</span>
                </div>
              </div>

              {/* Email preview */}
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Email Preview</p>
                <div className="border border-neutral-200 rounded-lg p-4 bg-white">
                  <p className="text-sm text-neutral-900 font-medium mb-2">
                    Hi {tenant.name.split(' ')[0]},
                  </p>
                  <p className="text-sm text-neutral-700 mb-2">
                    You&apos;ve been invited to join the tenant portal. Click the link below to set up your account and access your property information, payments, and maintenance requests.
                  </p>
                  <div className="bg-primary-50 border border-primary-200 rounded px-3 py-2 text-center">
                    <span className="text-sm text-primary-700 font-medium">Set Up Your Account</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-3">
                    This invitation expires in 7 days. If you did not expect this invitation, you can ignore this email.
                  </p>
                </div>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-primary-800">
                    A secure invite link will be generated and copied to your clipboard. You can share it manually or the tenant will receive it via email once email sending is configured.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 border-t border-neutral-200 px-4 md:px-6 py-4 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setShowInvitePreview(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={inviteSending}
                onClick={async () => {
                  setInviteSending(true)
                  try {
                    const res = await fetch('/api/invitations', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email: tenant.email,
                        name: tenant.name,
                        role: 'TENANT',
                        tenantId,
                        leaseStartDate: currentLease?.startDate ?? null,
                        leaseEndDate: currentLease?.endDate ?? null,
                      }),
                    })
                    const data = await res.json()
                    if (!res.ok) {
                      alert(data.error)
                    } else {
                      const copied = await navigator.clipboard.writeText(data.inviteUrl).then(() => true).catch(() => false)
                      setShowInvitePreview(false)
                      alert(copied ? 'Invite link copied to clipboard!' : `Invite created! Share this link:\n${data.inviteUrl}`)
                    }
                  } catch {
                    alert('Failed to send invitation')
                  } finally {
                    setInviteSending(false)
                  }
                }}
              >
                {inviteSending ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {showSendMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-full sm:max-w-2xl w-full mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-surface border-b border-neutral-200 px-4 md:px-6 py-4 flex items-center justify-between rounded-t-lg">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-neutral-900">Send Message</h2>
                <p className="text-sm text-neutral-600 mt-1">To: {tenant.name} ({tenant.email} / {tenant.phone})</p>
              </div>
              <button
                onClick={() => setShowSendMessageModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-4 md:px-6 py-4 space-y-4">
              {/* Communication Method */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Message Type *
                </label>
                <select
                  value={messageForm.method}
                  onChange={(e) => setMessageForm({ ...messageForm, method: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="email">� Email</option>
                  <option value="sms">💬 SMS</option>
                  <option value="whatsapp">📱 WhatsApp</option>
                  <option value="in-app">📱 In-App Notification</option>
                </select>
              </div>

              {/* Message Template */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Message Template
                </label>
                <select
                  value={messageForm.template}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select a template...</option>
                  {messageTemplates.map(template => (
                    <option key={template.id} value={template.id}>{template.name}</option>
                  ))}
                </select>
              </div>

              {/* Subject (Email only) */}
              {messageForm.method === 'email' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-neutral-700">
                      Subject *
                    </label>
                    <button
                      type="button"
                      onClick={() => handleImproveWithAI('subject')}
                      disabled={!messageForm.subject || isImprovingText}
                      className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 disabled:text-neutral-400 disabled:cursor-not-allowed transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      {isImprovingText ? 'Improving...' : 'Improve with AI'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={messageForm.subject}
                    onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter email subject..."
                    required
                  />
                </div>
              )}

              {/* Message */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-neutral-700">
                    Message *
                  </label>
                  <button
                    type="button"
                    onClick={() => handleImproveWithAI('message')}
                    disabled={!messageForm.message || isImprovingText}
                    className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 disabled:text-neutral-400 disabled:cursor-not-allowed transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    {isImprovingText ? 'Improving...' : 'Improve with AI'}
                  </button>
                </div>
                <textarea
                  rows={messageForm.method === 'sms' ? 4 : 8}
                  value={messageForm.message}
                  onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Type your message here..."
                  required
                />
                <p className="text-xs text-neutral-500 mt-1">
                  {messageForm.message.length} characters
                  {messageForm.method === 'sms' && messageForm.message.length > 160 && (
                    <span className="text-warning-600 ml-2">
                      (Will be sent as {Math.ceil(messageForm.message.length / 160)} SMS)
                    </span>
                  )}
                </p>
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Attachments
                </label>
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary-500 cursor-pointer transition">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mt-2 text-sm text-neutral-600">Click to upload files or drag and drop</p>
                    <p className="text-xs text-neutral-500">PDF, DOC, JPG, PNG, Excel up to 10MB each</p>
                  </label>
                </div>

                {/* Attached Files List */}
                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <svg className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <p className="font-medium text-neutral-900 text-sm">{file.name}</p>
                            <p className="text-xs text-neutral-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(index)}
                          className="text-danger-600 hover:text-red-800 p-1"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Method-specific notices */}
              {messageForm.method === 'whatsapp' && (
                <div className="bg-success-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-success-900">WhatsApp Business API</p>
                      <p className="text-xs text-success-700 mt-1">
                        This message will be sent via WhatsApp Business API. Ensure you have configured your API keys in Settings and the tenant has opted in.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {messageForm.method === 'sms' && (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary-900">SMS Gateway</p>
                      <p className="text-xs text-primary-700 mt-1">
                        SMS messages over 160 characters will be split into multiple messages. Configure your SMS gateway in Settings.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-neutral-50 border-t border-neutral-200 px-4 md:px-6 py-4 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setShowSendMessageModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSendMessage}
                disabled={
                  !messageForm.message || 
                  (messageForm.method === 'email' && !messageForm.subject)
                }
              >
                {messageForm.method === 'email' && '📧 Send Email'}
                {messageForm.method === 'sms' && '💬 Send SMS'}
                {messageForm.method === 'whatsapp' && '� Send WhatsApp'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Lease Modal */}
      {showGenerateLeaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-neutral-900">Generate Lease</h3>
              <button onClick={() => setShowGenerateLeaseModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-6 overflow-y-auto flex-1">

              {/* Lease Dates */}
              <div>
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Lease Period</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      value={generateLeaseForm.startDate}
                      onChange={e => {
                        const start = e.target.value
                        const term = generateLeaseForm.leaseTerm
                        let endDate = generateLeaseForm.endDate
                        if (start && term !== 'custom') {
                          const d = new Date(start)
                          d.setMonth(d.getMonth() + parseInt(term))
  
                          endDate = d.toISOString().split('T')[0]
                        }
                        setGenerateLeaseForm(f => ({ ...f, startDate: start, endDate }))
                      }}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Lease Term *</label>
                    <select
                      value={generateLeaseForm.leaseTerm}
                      onChange={e => {
                        const term = e.target.value
                        let endDate = generateLeaseForm.endDate
                        if (generateLeaseForm.startDate && term !== 'custom') {
                          const d = new Date(generateLeaseForm.startDate)
                          d.setMonth(d.getMonth() + parseInt(term))
  
                          endDate = d.toISOString().split('T')[0]
                        }
                        setGenerateLeaseForm(f => ({ ...f, leaseTerm: term, endDate }))
                      }}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                    >
                      <option value="6">6 months</option>
                      <option value="12">12 months (1 year)</option>
                      <option value="18">18 months</option>
                      <option value="24">24 months (2 years)</option>
                      <option value="36">36 months (3 years)</option>
                      <option value="custom">Custom end date</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    End Date *
                    {generateLeaseForm.leaseTerm !== 'custom' && generateLeaseForm.endDate && (
                      <span className="ml-2 font-normal text-xs text-success-600">auto-calculated</span>
                    )}
                  </label>
                  <input
                    type="date"
                    value={generateLeaseForm.endDate}
                    readOnly={generateLeaseForm.leaseTerm !== 'custom'}
                    onChange={e => generateLeaseForm.leaseTerm === 'custom' && setGenerateLeaseForm(f => ({ ...f, endDate: e.target.value }))}
                    className={`w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${generateLeaseForm.leaseTerm !== 'custom' ? 'bg-neutral-50 text-neutral-500 cursor-default' : ''}`}
                  />
                </div>
              </div>

              {/* Financial Terms */}
              <div>
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Financial Terms</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Monthly Rent (KES) *</label>
                    <input
                      type="number" min="0" step="0.01" placeholder="e.g. 25000"
                      value={generateLeaseForm.monthlyRent}
                      onChange={e => setGenerateLeaseForm(f => ({ ...f, monthlyRent: e.target.value }))}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Security Deposit (KES) *</label>
                    <input
                      type="number" min="0" step="0.01" placeholder="e.g. 50000"
                      value={generateLeaseForm.securityDeposit}
                      onChange={e => setGenerateLeaseForm(f => ({ ...f, securityDeposit: e.target.value }))}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Annual Rent Escalation (%)</label>
                    <input
                      type="number" min="0" max="100" step="0.1" placeholder="e.g. 5"
                      value={generateLeaseForm.rentEscalation}
                      onChange={e => setGenerateLeaseForm(f => ({ ...f, rentEscalation: e.target.value }))}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <p className="mt-1 text-xs text-neutral-500">Tenant must receive minimum 60 days notice before any increase</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Move Out Notice Period (months)</label>
                    <input
                      type="number" min="1" step="1"
                      value={generateLeaseForm.noticePeriod}
                      onChange={e => setGenerateLeaseForm(f => ({ ...f, noticePeriod: e.target.value }))}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <p className="mt-1 text-xs text-neutral-500">Standard is 1 month for either party to terminate</p>
                  </div>
                </div>
              </div>

              {/* Rent Payment & Late Penalty */}
              <div>
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Rent Payment &amp; Late Penalty</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Rent Due Day</label>
                    <select
                      value={generateLeaseForm.rentDueDay}
                      onChange={e => setGenerateLeaseForm(f => ({ ...f, rentDueDay: e.target.value }))}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                    >
                      {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                        <option key={d} value={d}>{d === 1 ? '1st' : d === 2 ? '2nd' : d === 3 ? '3rd' : `${d}th`} of month</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Grace Period (days)</label>
                    <input
                      type="number" min="0" step="1" placeholder="5"
                      value={generateLeaseForm.gracePeriodDays}
                      onChange={e => setGenerateLeaseForm(f => ({ ...f, gracePeriodDays: e.target.value }))}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Late Penalty (KES/day)</label>
                    <input
                      type="number" min="0" step="1" placeholder="500"
                      value={generateLeaseForm.latePenaltyPerDay}
                      onChange={e => setGenerateLeaseForm(f => ({ ...f, latePenaltyPerDay: e.target.value }))}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              {(() => {
                const ll = tenantApiData?.property?.landlord || tenantApiData?.unitRef?.landlord
                const llBank = ll?.bankName && ll?.bankAccount ? `${ll.bankName} — A/C ${ll.bankAccount}` : null
                return (
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Payment Methods</h4>
                    <div className="space-y-3">
                      {/* Recipient toggle */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Rent paid to</label>
                        <div className="grid grid-cols-2 gap-2">
                          {(['agent', 'landlord'] as const).map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                const nextBank = opt === 'landlord' ? (llBank ?? '') : ''
                                setGenerateLeaseForm(f => ({ ...f, paymentRecipient: opt, bankDetails: nextBank }))
                              }}
                              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors text-left ${generateLeaseForm.paymentRecipient === opt ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'}`}
                            >
                              {opt === 'agent' ? '🏢 Through agent' : '👤 Directly to landlord'}
                            </button>
                          ))}
                        </div>
                        {generateLeaseForm.paymentRecipient === 'landlord' && !llBank && (
                          <p className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                            No bank details on file for this landlord. Please enter them below or update the landlord profile first.
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">M-Pesa Till / Paybill</label>
                        <input type="text" placeholder="e.g. Till No. 1234567 — Tochi Property"
                          value={generateLeaseForm.mpesaTill}
                          onChange={e => setGenerateLeaseForm(f => ({ ...f, mpesaTill: e.target.value }))}
                          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Bank Details
                          {generateLeaseForm.paymentRecipient === 'landlord' && llBank && (
                            <span className="ml-2 font-normal text-xs text-success-600">auto-populated from landlord profile</span>
                          )}
                        </label>
                        <input type="text" placeholder="e.g. Equity Bank, A/C 0140XXXXXX, Branch: Westlands"
                          value={generateLeaseForm.bankDetails}
                          readOnly={generateLeaseForm.paymentRecipient === 'landlord' && !!llBank}
                          onChange={e => setGenerateLeaseForm(f => ({ ...f, bankDetails: e.target.value }))}
                          className={`w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${generateLeaseForm.paymentRecipient === 'landlord' && llBank ? 'bg-neutral-50 text-neutral-600 cursor-default' : ''}`}
                        />
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Policies */}
              <div>
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Policies &amp; Conditions</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Pet Policy</label>
                    <input
                      type="text" placeholder="e.g. No pets allowed / Pets permitted with prior written consent"
                      value={generateLeaseForm.petPolicy}
                      onChange={e => setGenerateLeaseForm(f => ({ ...f, petPolicy: e.target.value }))}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Special Conditions</label>
                    <textarea
                      rows={3} placeholder="Any additional conditions specific to this tenancy..."
                      value={generateLeaseForm.specialConditions}
                      onChange={e => setGenerateLeaseForm(f => ({ ...f, specialConditions: e.target.value }))}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Lease Terms &amp; Conditions</label>
                    <textarea
                      rows={4} placeholder="Enter the standard lease terms and conditions..."
                      value={generateLeaseForm.terms}
                      onChange={e => setGenerateLeaseForm(f => ({ ...f, terms: e.target.value }))}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Co-Tenant */}
              <div>
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Co-Tenant <span className="font-normal normal-case text-neutral-400">(optional)</span></h4>
                <p className="text-xs text-neutral-500 mb-3">Add a second occupant who will also be named on the lease.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
                    <input
                      type="text" placeholder="Co-tenant full name"
                      value={generateLeaseForm.tenant2Name}
                      onChange={e => setGenerateLeaseForm(f => ({ ...f, tenant2Name: e.target.value }))}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">ID / Passport Number</label>
                    <input
                      type="text" placeholder="National ID or Passport No."
                      value={generateLeaseForm.tenant2IdNumber}
                      onChange={e => setGenerateLeaseForm(f => ({ ...f, tenant2IdNumber: e.target.value }))}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                    <input
                      type="email" placeholder="co-tenant@email.com"
                      value={generateLeaseForm.tenant2Email}
                      onChange={e => setGenerateLeaseForm(f => ({ ...f, tenant2Email: e.target.value }))}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
                    <input
                      type="tel" placeholder="+254..."
                      value={generateLeaseForm.tenant2Phone}
                      onChange={e => setGenerateLeaseForm(f => ({ ...f, tenant2Phone: e.target.value }))}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

            </div>
            <div className="px-6 py-4 border-t border-neutral-200 flex justify-end gap-3 flex-shrink-0">
              <Button variant="outline" onClick={() => setShowGenerateLeaseModal(false)}>Cancel</Button>
              <Button onClick={handleGenerateLease} disabled={isGeneratingLease}>
                {isGeneratingLease ? 'Creating...' : 'Create Lease'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Signed Lease Modal */}
      {showUploadLeaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">Upload Signed Lease</h3>
              <button onClick={() => setShowUploadLeaseModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-4 md:px-6 py-5 space-y-4">
              <p className="text-sm text-neutral-600">Upload the signed lease document (PDF or image, max 10 MB).</p>
              <div
                className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 transition-colors"
                onClick={() => document.getElementById('lease-file-input')?.click()}
              >
                {leaseUploadFile ? (
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{leaseUploadFile.name}</p>
                    <p className="text-xs text-neutral-500 mt-1">{(leaseUploadFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <svg className="w-10 h-10 text-neutral-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    <p className="text-sm text-neutral-500">Click to select file</p>
                    <p className="text-xs text-neutral-400 mt-1">PDF, PNG, JPG up to 10 MB</p>
                  </div>
                )}
                <input
                  id="lease-file-input"
                  type="file"
                  accept=".pdf,image/*"
                  className="hidden"
                  onChange={e => setLeaseUploadFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <div className="px-4 md:px-6 py-4 border-t border-neutral-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setShowUploadLeaseModal(false); setLeaseUploadFile(null) }}>Cancel</Button>
              <Button onClick={handleUploadLease} disabled={!leaseUploadFile || isUploadingLease}>
                {isUploadingLease ? 'Uploading...' : 'Upload Document'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadDocModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">Upload Document</h3>
              <button onClick={() => { setShowUploadDocModal(false); setUploadDocFile(null) }} className="text-neutral-400 hover:text-neutral-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-neutral-500">Upload IDs, passport photos, lease documents, or any supporting documents for this tenant.</p>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${uploadDocFile ? 'border-primary-400 bg-primary-50' : 'border-neutral-300 hover:border-primary-400'}`}
                onClick={() => document.getElementById('doc-file-input')?.click()}
              >
                <input
                  id="doc-file-input"
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={e => setUploadDocFile(e.target.files?.[0] || null)}
                />
                {uploadDocFile ? (
                  <div className="flex items-center justify-center gap-2 text-primary-700">
                    <span className="text-2xl">📄</span>
                    <div className="text-left">
                      <p className="font-medium text-sm">{uploadDocFile.name}</p>
                      <p className="text-xs text-neutral-500">{(uploadDocFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <svg className="mx-auto h-10 w-10 text-neutral-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-neutral-600">Click to select a file</p>
                    <p className="text-xs text-neutral-400 mt-1">PDF, images, Word documents — max 10 MB</p>
                  </>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-neutral-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setShowUploadDocModal(false); setUploadDocFile(null) }}>Cancel</Button>
              <Button onClick={handleUploadDoc} disabled={!uploadDocFile || uploadingDoc}>
                {uploadingDoc ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* New Lease Choice Modal */}
      {showNewLeaseChoiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">New Lease</h3>
              <button onClick={() => setShowNewLeaseChoiceModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p className="text-sm text-neutral-600 mb-4">How would you like to create the new lease?</p>
              <button
                className="w-full flex items-center gap-4 p-4 border border-neutral-200 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors text-left"
                onClick={() => { setShowNewLeaseChoiceModal(false); setShowGenerateLeaseModal(true) }}
              >
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Generate New Lease</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Create a lease from a template and send for digital signing</p>
                </div>
              </button>
              <button
                className="w-full flex items-center gap-4 p-4 border border-neutral-200 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors text-left"
                onClick={() => { setShowNewLeaseChoiceModal(false); setShowUploadNewLeaseModal(true) }}
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Upload Signed Lease</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Upload a hard-copy lease already signed by both parties</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload New Lease Modal */}
      {showUploadNewLeaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-neutral-900">Upload Signed Lease</h3>
              <button onClick={() => { setShowUploadNewLeaseModal(false); setUploadNewLeaseFile(null); setUploadNewLeaseError('') }} className="text-neutral-400 hover:text-neutral-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-6 overflow-y-auto flex-1">
              {uploadNewLeaseError && (
                <div className="bg-danger-50 border border-danger-200 rounded-lg px-4 py-3 text-sm text-danger-700">
                  {uploadNewLeaseError}
                </div>
              )}

              {/* Lease Period */}
              <div>
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Lease Period</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      value={uploadNewLeaseForm.startDate}
                      onChange={e => {
                        const start = e.target.value
                        const term = uploadNewLeaseForm.leaseTerm
                        let endDate = uploadNewLeaseForm.endDate
                        if (start && term !== 'custom') {
                          const d = new Date(start)
                          d.setMonth(d.getMonth() + parseInt(term))
  
                          endDate = d.toISOString().split('T')[0]
                        }
                        setUploadNewLeaseForm(f => ({ ...f, startDate: start, endDate }))
                      }}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Lease Term *</label>
                    <select
                      value={uploadNewLeaseForm.leaseTerm}
                      onChange={e => {
                        const term = e.target.value
                        let endDate = uploadNewLeaseForm.endDate
                        if (uploadNewLeaseForm.startDate && term !== 'custom') {
                          const d = new Date(uploadNewLeaseForm.startDate)
                          d.setMonth(d.getMonth() + parseInt(term))
  
                          endDate = d.toISOString().split('T')[0]
                        }
                        setUploadNewLeaseForm(f => ({ ...f, leaseTerm: term, endDate }))
                      }}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                    >
                      <option value="6">6 months</option>
                      <option value="12">12 months (1 year)</option>
                      <option value="18">18 months</option>
                      <option value="24">24 months (2 years)</option>
                      <option value="36">36 months (3 years)</option>
                      <option value="custom">Custom end date</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    End Date *
                    {uploadNewLeaseForm.leaseTerm !== 'custom' && uploadNewLeaseForm.endDate && (
                      <span className="ml-2 font-normal text-xs text-success-600">auto-calculated</span>
                    )}
                  </label>
                  <input
                    type="date"
                    value={uploadNewLeaseForm.endDate}
                    readOnly={uploadNewLeaseForm.leaseTerm !== 'custom'}
                    onChange={e => uploadNewLeaseForm.leaseTerm === 'custom' && setUploadNewLeaseForm(f => ({ ...f, endDate: e.target.value }))}
                    className={`w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${uploadNewLeaseForm.leaseTerm !== 'custom' ? 'bg-neutral-50 text-neutral-500 cursor-default' : ''}`}
                  />
                </div>
              </div>

              {/* Financial Terms */}
              <div>
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Financial Terms</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Monthly Rent (KES) *</label>
                    <input type="number" min="0" step="0.01" placeholder="e.g. 25000"
                      value={uploadNewLeaseForm.monthlyRent}
                      onChange={e => setUploadNewLeaseForm(f => ({ ...f, monthlyRent: e.target.value }))}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Security Deposit (KES) *</label>
                    <input type="number" min="0" step="0.01" placeholder="e.g. 50000"
                      value={uploadNewLeaseForm.securityDeposit}
                      onChange={e => setUploadNewLeaseForm(f => ({ ...f, securityDeposit: e.target.value }))}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Annual Rent Escalation (%)</label>
                    <input type="number" min="0" max="100" step="0.1" placeholder="e.g. 5"
                      value={uploadNewLeaseForm.rentEscalation}
                      onChange={e => setUploadNewLeaseForm(f => ({ ...f, rentEscalation: e.target.value }))}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <p className="mt-1 text-xs text-neutral-500">Tenant must receive minimum 60 days notice before any increase</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Move Out Notice Period (months)</label>
                    <input type="number" min="1" step="1"
                      value={uploadNewLeaseForm.noticePeriod}
                      onChange={e => setUploadNewLeaseForm(f => ({ ...f, noticePeriod: e.target.value }))}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <p className="mt-1 text-xs text-neutral-500">Standard is 1 month for either party to terminate</p>
                  </div>
                </div>
              </div>

              {/* Rent Payment & Late Penalty */}
              <div>
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Rent Payment &amp; Late Penalty</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Rent Due Day</label>
                    <select
                      value={uploadNewLeaseForm.rentDueDay}
                      onChange={e => setUploadNewLeaseForm(f => ({ ...f, rentDueDay: e.target.value }))}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                    >
                      {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                        <option key={d} value={d}>{d === 1 ? '1st' : d === 2 ? '2nd' : d === 3 ? '3rd' : `${d}th`} of month</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Grace Period (days)</label>
                    <input type="number" min="0" step="1" placeholder="5"
                      value={uploadNewLeaseForm.gracePeriodDays}
                      onChange={e => setUploadNewLeaseForm(f => ({ ...f, gracePeriodDays: e.target.value }))}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Late Penalty (KES/day)</label>
                    <input type="number" min="0" step="1" placeholder="500"
                      value={uploadNewLeaseForm.latePenaltyPerDay}
                      onChange={e => setUploadNewLeaseForm(f => ({ ...f, latePenaltyPerDay: e.target.value }))}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              {(() => {
                const ll = tenantApiData?.property?.landlord || tenantApiData?.unitRef?.landlord
                const llBank = ll?.bankName && ll?.bankAccount ? `${ll.bankName} — A/C ${ll.bankAccount}` : null
                return (
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Payment Methods</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Rent paid to</label>
                        <div className="grid grid-cols-2 gap-2">
                          {(['agent', 'landlord'] as const).map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                const nextBank = opt === 'landlord' ? (llBank ?? '') : ''
                                setUploadNewLeaseForm(f => ({ ...f, paymentRecipient: opt, bankDetails: nextBank }))
                              }}
                              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors text-left ${uploadNewLeaseForm.paymentRecipient === opt ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'}`}
                            >
                              {opt === 'agent' ? '🏢 Through agent' : '👤 Directly to landlord'}
                            </button>
                          ))}
                        </div>
                        {uploadNewLeaseForm.paymentRecipient === 'landlord' && !llBank && (
                          <p className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                            No bank details on file for this landlord. Please enter them below or update the landlord profile first.
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">M-Pesa Till / Paybill</label>
                        <input type="text" placeholder="e.g. Till No. 1234567 — Tochi Property"
                          value={uploadNewLeaseForm.mpesaTill}
                          onChange={e => setUploadNewLeaseForm(f => ({ ...f, mpesaTill: e.target.value }))}
                          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Bank Details
                          {uploadNewLeaseForm.paymentRecipient === 'landlord' && llBank && (
                            <span className="ml-2 font-normal text-xs text-success-600">auto-populated from landlord profile</span>
                          )}
                        </label>
                        <input type="text" placeholder="e.g. Equity Bank, A/C 0140XXXXXX, Branch: Westlands"
                          value={uploadNewLeaseForm.bankDetails}
                          readOnly={uploadNewLeaseForm.paymentRecipient === 'landlord' && !!llBank}
                          onChange={e => setUploadNewLeaseForm(f => ({ ...f, bankDetails: e.target.value }))}
                          className={`w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${uploadNewLeaseForm.paymentRecipient === 'landlord' && llBank ? 'bg-neutral-50 text-neutral-600 cursor-default' : ''}`}
                        />
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Policies & Conditions */}
              <div>
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Policies &amp; Conditions</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Pet Policy</label>
                    <input type="text" placeholder="e.g. No pets allowed / Pets permitted with prior written consent"
                      value={uploadNewLeaseForm.petPolicy}
                      onChange={e => setUploadNewLeaseForm(f => ({ ...f, petPolicy: e.target.value }))}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Special Conditions</label>
                    <textarea rows={3} placeholder="Any additional conditions specific to this tenancy..."
                      value={uploadNewLeaseForm.specialConditions}
                      onChange={e => setUploadNewLeaseForm(f => ({ ...f, specialConditions: e.target.value }))}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Lease Terms &amp; Conditions *
                      <span className="ml-1 font-normal text-neutral-400 text-xs">(required)</span>
                    </label>
                    <textarea rows={4} placeholder="Enter the key terms and conditions of the lease — rental obligations, maintenance responsibilities, house rules, notice periods, etc."
                      value={uploadNewLeaseForm.terms}
                      onChange={e => setUploadNewLeaseForm(f => ({ ...f, terms: e.target.value }))}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Co-Tenant */}
              <div>
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Co-Tenant <span className="font-normal normal-case text-neutral-400">(optional)</span></h4>
                <p className="text-xs text-neutral-500 mb-3">Add a second occupant named on the lease.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
                    <input type="text" placeholder="Co-tenant full name"
                      value={uploadNewLeaseForm.tenant2Name}
                      onChange={e => setUploadNewLeaseForm(f => ({ ...f, tenant2Name: e.target.value }))}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">ID / Passport Number</label>
                    <input type="text" placeholder="National ID or Passport No."
                      value={uploadNewLeaseForm.tenant2IdNumber}
                      onChange={e => setUploadNewLeaseForm(f => ({ ...f, tenant2IdNumber: e.target.value }))}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                    <input type="email" placeholder="co-tenant@email.com"
                      value={uploadNewLeaseForm.tenant2Email}
                      onChange={e => setUploadNewLeaseForm(f => ({ ...f, tenant2Email: e.target.value }))}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
                    <input type="tel" placeholder="+254..."
                      value={uploadNewLeaseForm.tenant2Phone}
                      onChange={e => setUploadNewLeaseForm(f => ({ ...f, tenant2Phone: e.target.value }))}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Signed Lease Document *</label>
                <div
                  className="border-2 border-dashed border-neutral-300 rounded-lg p-5 text-center cursor-pointer hover:border-primary-400 transition-colors"
                  onClick={() => document.getElementById('upload-new-lease-file')?.click()}
                >
                  {uploadNewLeaseFile ? (
                    <div>
                      <p className="text-sm font-medium text-neutral-800">{uploadNewLeaseFile.name}</p>
                      <p className="text-xs text-neutral-500 mt-1">{(uploadNewLeaseFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <svg className="w-9 h-9 text-neutral-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      <p className="text-sm text-neutral-500">Click to select file</p>
                      <p className="text-xs text-neutral-400 mt-1">PDF up to 10 MB</p>
                    </div>
                  )}
                  <input
                    id="upload-new-lease-file"
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={e => setUploadNewLeaseFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-neutral-200 flex justify-end gap-3 flex-shrink-0">
              <Button variant="outline" onClick={() => { setShowUploadNewLeaseModal(false); setUploadNewLeaseFile(null); setUploadNewLeaseError('') }}>
                Cancel
              </Button>
              <Button onClick={handleUploadNewLease} disabled={isUploadingNewLease}>
                {isUploadingNewLease ? 'Saving...' : 'Save Lease'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
