'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { mockTenants, mockLeases, mockPayments, mockMaintenanceRequests } from '@/lib/mock-data'
import TaskManager from '@/components/crm/TaskManager'

interface Props {
  params: Promise<{ id: string }>
}

export default function TenantCRMPage({ params }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'maintenance' | 'documents' | 'communications' | 'notes' | 'tasks' | 'activity'>('overview')
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
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
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [whatsAppMessage, setWhatsAppMessage] = useState({
    message: '',
    template: '',
  })

  // In real app, this would be async
  const tenantId = '1' // Would come from unwrapped params
  const tenant = mockTenants.find(t => t.id === tenantId)

  if (!tenant) {
    return <div>Tenant not found</div>
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

  const handleSaveEdit = () => {
    console.log('Saving tenant updates:', editForm)
    // In real app, this would make an API call
    setShowEditModal(false)
  }

  const handleRecordPayment = () => {
    console.log('Recording payment:', paymentForm)
    // In real app, this would make an API call
    setShowRecordPaymentModal(false)
    setPaymentForm({
      month: '',
      amount: '',
      date: '',
      method: 'Bank Transfer',
      status: 'Paid',
    })
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
    { id: '1', date: '2024-11-25T10:00:00', type: 'email', subject: 'Rent Payment Reminder', status: 'sent', category: 'Rent Reminder' },
    { id: '2', date: '2024-11-10T15:30:00', type: 'sms', subject: 'Maintenance Update', status: 'delivered', category: 'Maintenance' },
    { id: '3', date: '2024-10-28T11:20:00', type: 'in-app', subject: 'Lease Renewal Discussion', status: 'read', category: 'Lease' },
    { id: '4', date: '2024-10-15T09:00:00', type: 'email', subject: 'Community Announcement', status: 'sent', category: 'Announcement' },
    { id: '5', date: '2024-09-30T16:45:00', type: 'sms', subject: 'Payment Received Confirmation', status: 'delivered', category: 'Payment Confirmation' },
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

  // Filter payments based on filters
  const filteredPayments = tenantPayments.filter(payment => {
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
  const filteredMaintenance = tenantMaintenance.filter(request => {
    // Status filter
    if (maintenanceFilters.status && request.status !== maintenanceFilters.status) {
      return false
    }
    
    // Priority filter
    if (maintenanceFilters.priority && request.priority !== maintenanceFilters.priority) {
      return false
    }
    
    // Vendor filter (exact match for dropdown)
    if (maintenanceFilters.vendor) {
      if (maintenanceFilters.vendor === 'unassigned') {
        if (request.vendorName && request.vendorName !== '') {
          return false
        }
      } else if (request.vendorName !== maintenanceFilters.vendor) {
        return false
      }
    }
    
    // Date range filter
    if (maintenanceFilters.startDate && request.dateSubmitted < maintenanceFilters.startDate) {
      return false
    }
    if (maintenanceFilters.endDate && request.dateSubmitted > maintenanceFilters.endDate) {
      return false
    }
    
    return true
  })

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    if (!documentSearch) return true
    
    const searchLower = documentSearch.toLowerCase()
    return doc.name.toLowerCase().includes(searchLower) || 
           doc.type.toLowerCase().includes(searchLower)
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
  const uniqueMonths = Array.from(new Set(tenantPayments.map(p => p.month))).sort().reverse()

  // Get unique vendors from maintenance requests for dropdown
  const uniqueVendors = Array.from(new Set(
    tenantMaintenance
      .map(r => r.vendorName)
      .filter(name => name && name !== '')
  )).sort()

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

  const handleSendWhatsApp = () => {
    console.log('Sending WhatsApp message:', {
      to: tenant.phone,
      message: whatsAppMessage.message,
      template: whatsAppMessage.template,
    })
    // In real app, this would call WhatsApp Business API
    setShowWhatsAppModal(false)
    setWhatsAppMessage({ message: '', template: '' })
  }

  const whatsAppTemplates = [
    { id: 'rent_reminder', name: 'Rent Reminder', message: 'Hi {name}, this is a friendly reminder that your rent payment of KES {amount} is due on {date}. Thank you!' },
    { id: 'payment_confirmation', name: 'Payment Confirmation', message: 'Hi {name}, we have received your payment of KES {amount}. Thank you for your prompt payment!' },
    { id: 'maintenance_update', name: 'Maintenance Update', message: 'Hi {name}, your maintenance request has been updated. Status: {status}. We will keep you informed.' },
    { id: 'lease_renewal', name: 'Lease Renewal', message: 'Hi {name}, your lease is expiring soon on {date}. Please contact us to discuss renewal options.' },
    { id: 'custom', name: 'Custom Message', message: '' },
  ]

  const handleTemplateSelect = (templateId: string) => {
    const template = whatsAppTemplates.find(t => t.id === templateId)
    if (template && template.message) {
      // Replace placeholders with actual data
      let message = template.message
        .replace('{name}', tenant.name.split(' ')[0])
        .replace('{amount}', tenant.rent?.toLocaleString() || '0')
        .replace('{date}', formatDate(currentLease?.endDate || new Date().toISOString()))
        .replace('{status}', 'In Progress')
      
      setWhatsAppMessage({ ...whatsAppMessage, template: templateId, message })
    } else {
      setWhatsAppMessage({ ...whatsAppMessage, template: templateId, message: '' })
    }
  }

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
            <Button variant="outline" onClick={handleEditClick}>
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
          <div className="flex space-x-1 p-1 overflow-x-auto">
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
                <Button variant="primary" onClick={() => setShowRecordPaymentModal(true)}>+ Record Payment</Button>
              </div>

              {/* Filters */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Filters</h4>
                  <button
                    onClick={clearPaymentFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Month
                    </label>
                    <select
                      value={paymentFilters.month}
                      onChange={(e) => setPaymentFilters({ ...paymentFilters, month: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Months</option>
                      {uniqueMonths.map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={paymentFilters.startDate}
                      onChange={(e) => setPaymentFilters({ ...paymentFilters, startDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={paymentFilters.endDate}
                      onChange={(e) => setPaymentFilters({ ...paymentFilters, endDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={paymentFilters.method}
                      onChange={(e) => setPaymentFilters({ ...paymentFilters, method: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={paymentFilters.status}
                      onChange={(e) => setPaymentFilters({ ...paymentFilters, status: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <div className="mt-3 text-sm text-gray-600">
                  Showing {filteredPayments.length} of {tenantPayments.length} payments
                </div>
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
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map(payment => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{payment.month}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">KES {payment.amount.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {payment.paidDate ? formatDate(payment.paidDate as string) : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{payment.method}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              payment.status === 'COMPLETED' || payment.status === 'Paid' ? 'bg-green-100 text-green-800' :
                              payment.status === 'PENDING' || payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              payment.status === 'OVERDUE' || payment.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {payment.status === 'COMPLETED' ? 'Paid' : payment.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
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
              <h3 className="font-semibold text-gray-900 mb-4">Maintenance Requests</h3>

              {/* Filters */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Filters</h4>
                  <button
                    onClick={clearMaintenanceFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={maintenanceFilters.status}
                      onChange={(e) => setMaintenanceFilters({ ...maintenanceFilters, status: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={maintenanceFilters.priority}
                      onChange={(e) => setMaintenanceFilters({ ...maintenanceFilters, priority: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Priorities</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Vendor
                    </label>
                    <select
                      value={maintenanceFilters.vendor}
                      onChange={(e) => setMaintenanceFilters({ ...maintenanceFilters, vendor: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Vendors</option>
                      {uniqueVendors.map(vendor => (
                        <option key={vendor} value={vendor}>{vendor}</option>
                      ))}
                      <option value="unassigned">Unassigned</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={maintenanceFilters.startDate}
                      onChange={(e) => setMaintenanceFilters({ ...maintenanceFilters, startDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={maintenanceFilters.endDate}
                      onChange={(e) => setMaintenanceFilters({ ...maintenanceFilters, endDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Filter summary */}
                <div className="mt-3 text-sm text-gray-600">
                  Showing {filteredMaintenance.length} of {tenantMaintenance.length} requests
                </div>
              </div>

              {filteredMaintenance.map(request => (
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

              {/* Search */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Documents
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={documentSearch}
                    onChange={(e) => setDocumentSearch(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search by document name or type..."
                  />
                  <svg 
                    className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  Showing {filteredDocuments.length} of {documents.length} documents
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map(doc => (
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
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No documents found matching your search
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Communications Tab */}
          {activeTab === 'communications' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Communication History</h3>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowWhatsAppModal(true)}>
                    💬 Send WhatsApp
                  </Button>
                  <Button variant="primary">✉️ Send Message</Button>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Filters</h4>
                  <button
                    onClick={clearCommunicationFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={communicationFilters.status}
                      onChange={(e) => setCommunicationFilters({ ...communicationFilters, status: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="sent">Sent</option>
                      <option value="delivered">Delivered</option>
                      <option value="read">Read</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Method
                    </label>
                    <select
                      value={communicationFilters.type}
                      onChange={(e) => setCommunicationFilters({ ...communicationFilters, type: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Methods</option>
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="in-app">In-App</option>
                      <option value="phone">Phone</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={communicationFilters.category}
                      onChange={(e) => setCommunicationFilters({ ...communicationFilters, category: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Categories</option>
                      <option value="Rent Reminder">Rent Reminder</option>
                      <option value="Payment Confirmation">Payment Confirmation</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Lease">Lease</option>
                      <option value="Announcement">Announcement</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={communicationFilters.startDate}
                      onChange={(e) => setCommunicationFilters({ ...communicationFilters, startDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={communicationFilters.endDate}
                      onChange={(e) => setCommunicationFilters({ ...communicationFilters, endDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Filter summary */}
                <div className="mt-3 text-sm text-gray-600">
                  Showing {filteredCommunications.length} of {communications.length} communications
                </div>
              </div>

              {filteredCommunications.length > 0 ? (
                filteredCommunications.map(comm => (
                  <div key={comm.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{comm.subject}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="capitalize">{comm.type}</span> • {formatDate(comm.date)}
                          {comm.category && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">{comm.category}</span>}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        comm.status === 'read' ? 'bg-green-100 text-green-800' :
                        comm.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                        comm.status === 'sent' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {comm.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No communications found matching the selected filters
                </div>
              )}
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
              stakeholderId={tenantId}
              stakeholderName={tenant.name}
              stakeholderType="Tenant"
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

      {/* Edit Tenant Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h2 className="text-xl font-bold text-gray-900">Edit Tenant Information</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lease Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property *
                    </label>
                    <input
                      type="text"
                      value={editForm.property}
                      onChange={(e) => setEditForm({ ...editForm, property: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit *
                    </label>
                    <input
                      type="text"
                      value={editForm.unit}
                      onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Rent (KES) *
                    </label>
                    <input
                      type="number"
                      value={editForm.rent}
                      onChange={(e) => setEditForm({ ...editForm, rent: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Move-in Date *
                    </label>
                    <input
                      type="date"
                      value={editForm.moveIn}
                      onChange={(e) => setEditForm({ ...editForm, moveIn: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
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
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h2 className="text-xl font-bold text-gray-900">Record Payment</h2>
              <button
                onClick={() => setShowRecordPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Month *
                  </label>
                  <input
                    type="text"
                    value={paymentForm.month}
                    onChange={(e) => setPaymentForm({ ...paymentForm, month: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., November 2024"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (KES) *
                  </label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="50000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Card">Card</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status *
                  </label>
                  <select
                    value={paymentForm.status}
                    onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
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

      {/* Send WhatsApp Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Send WhatsApp Message</h2>
                <p className="text-sm text-gray-600 mt-1">To: {tenant.name} ({tenant.phone})</p>
              </div>
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message Template
                </label>
                <select
                  value={whatsAppMessage.template}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a template...</option>
                  {whatsAppTemplates.map(template => (
                    <option key={template.id} value={template.id}>{template.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  rows={6}
                  value={whatsAppMessage.message}
                  onChange={(e) => setWhatsAppMessage({ ...whatsAppMessage, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Type your message here..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {whatsAppMessage.message.length} characters
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">WhatsApp Business API</p>
                    <p className="text-xs text-blue-700 mt-1">
                      This message will be sent via WhatsApp Business API. Ensure you have the necessary permissions and the tenant has opted in to receive WhatsApp messages.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setShowWhatsAppModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSendWhatsApp}
                disabled={!whatsAppMessage.message}
              >
                📤 Send WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
