'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

interface Message {
  id: string
  type: 'email' | 'sms' | 'in-app' | 'system'
  category: 'rent-reminder' | 'maintenance' | 'lease' | 'payment' | 'announcement' | 'support' | 'other'
  direction: 'sent' | 'received'
  stakeholderType: 'tenant' | 'landlord' | 'vendor' | 'all'
  stakeholderId: string
  stakeholderName: string
  subject: string
  message: string
  sentBy: string
  sentDate: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  propertyId?: string
  propertyName?: string
  relatedTo?: string // e.g., "Maintenance Request #123"
  attachments?: string[]
}

export default function CommunicationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'email' | 'sms' | 'in-app' | 'system'>('all')
  const [stakeholderFilter, setStakeholderFilter] = useState<'all' | 'tenant' | 'landlord' | 'vendor'>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | Message['category']>('all')
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showCompose, setShowCompose] = useState(false)

  // Mock data - in production this would come from API
  const mockMessages: Message[] = [
    {
      id: 'msg_001',
      type: 'email',
      category: 'rent-reminder',
      direction: 'sent',
      stakeholderType: 'tenant',
      stakeholderId: '1',
      stakeholderName: 'John Smith',
      subject: 'Rent Payment Reminder - December 2024',
      message: 'Dear John,\n\nThis is a friendly reminder that your rent payment of KES 50,000 for December 2024 is due on December 1st, 2024.\n\nPlease ensure timely payment to avoid late fees.\n\nThank you,\nProperty Management Team',
      sentBy: 'Alice Johnson',
      sentDate: '2024-11-25T10:00:00',
      status: 'read',
      propertyId: '1',
      propertyName: 'Sunset Apartments',
      relatedTo: 'Monthly Rent - December 2024',
    },
    {
      id: 'msg_002',
      type: 'sms',
      category: 'maintenance',
      direction: 'sent',
      stakeholderType: 'vendor',
      stakeholderId: '1',
      stakeholderName: 'Quick Repairs Ltd',
      subject: 'New Work Order Assignment',
      message: 'New work order #WO-456 assigned. Property: Vista Plaza, Unit 3B. Issue: AC not cooling. Priority: High. Please confirm receipt.',
      sentBy: 'System',
      sentDate: '2024-11-24T14:30:00',
      status: 'delivered',
      propertyId: '2',
      propertyName: 'Vista Plaza',
      relatedTo: 'Work Order #WO-456',
    },
    {
      id: 'msg_003',
      type: 'in-app',
      category: 'maintenance',
      direction: 'received',
      stakeholderType: 'tenant',
      stakeholderId: '2',
      stakeholderName: 'Sarah Johnson',
      subject: 'Maintenance Request Update Inquiry',
      message: 'Hi, I submitted a maintenance request for my leaky faucet 3 days ago. Can you provide an update on when it will be fixed? Thanks.',
      sentBy: 'Sarah Johnson',
      sentDate: '2024-11-23T16:45:00',
      status: 'read',
      propertyId: '2',
      propertyName: 'Vista Plaza',
      relatedTo: 'Maintenance Request #MR-789',
    },
    {
      id: 'msg_004',
      type: 'email',
      category: 'lease',
      direction: 'sent',
      stakeholderType: 'tenant',
      stakeholderId: '3',
      stakeholderName: 'Michael Brown',
      subject: 'Lease Renewal Offer - Riverside Tower Unit 8C',
      message: 'Dear Michael,\n\nYour current lease is expiring on January 31st, 2025. We would like to offer you a lease renewal with the following terms:\n\n- New Term: 12 months\n- Monthly Rent: KES 52,500 (5% increase)\n- Security Deposit: No change\n\nPlease review and let us know your decision by December 15th, 2024.\n\nBest regards,\nProperty Management Team',
      sentBy: 'Bob Smith',
      sentDate: '2024-11-22T09:15:00',
      status: 'read',
      propertyId: '3',
      propertyName: 'Riverside Tower',
      relatedTo: 'Lease Renewal - Unit 8C',
    },
    {
      id: 'msg_005',
      type: 'email',
      category: 'payment',
      direction: 'sent',
      stakeholderType: 'landlord',
      stakeholderId: '1',
      stakeholderName: 'Robert K. Williams',
      subject: 'November Rent Collection Report',
      message: 'Dear Mr. Williams,\n\nPlease find attached your rent collection report for November 2024:\n\n- Total Collected: KES 250,000\n- Outstanding: KES 50,000\n- Collection Rate: 83.3%\n\nYour payout of KES 237,500 (after 5% management fee) will be processed on December 5th, 2024.\n\nBest regards,\nFinance Team',
      sentBy: 'Carol White',
      sentDate: '2024-11-21T11:00:00',
      status: 'delivered',
      propertyId: '1',
      propertyName: 'Sunset Apartments',
      relatedTo: 'Monthly Payout - November 2024',
      attachments: ['november_2024_report.pdf'],
    },
    {
      id: 'msg_006',
      type: 'sms',
      category: 'rent-reminder',
      direction: 'sent',
      stakeholderType: 'tenant',
      stakeholderId: '4',
      stakeholderName: 'Emily Davis',
      subject: 'Late Rent Payment Notice',
      message: 'Your rent payment for November 2024 is now 5 days overdue. Please pay KES 45,000 + KES 2,250 late fee immediately to avoid further penalties. Pay via M-Pesa: 0712345678',
      sentBy: 'System',
      sentDate: '2024-11-20T08:00:00',
      status: 'delivered',
      propertyId: '4',
      propertyName: 'Garden View Estate',
      relatedTo: 'Late Payment - November 2024',
    },
    {
      id: 'msg_007',
      type: 'in-app',
      category: 'maintenance',
      direction: 'sent',
      stakeholderType: 'tenant',
      stakeholderId: '2',
      stakeholderName: 'Sarah Johnson',
      subject: 'Re: Maintenance Request Update',
      message: 'Hi Sarah,\n\nThank you for your inquiry. Your maintenance request for the leaky faucet has been assigned to Quick Repairs Ltd. A technician will visit your unit tomorrow (November 24th) between 2-4 PM.\n\nPlease ensure someone is available to provide access.\n\nBest regards,\nMaintenance Team',
      sentBy: 'Bob Smith',
      sentDate: '2024-11-23T17:00:00',
      status: 'read',
      propertyId: '2',
      propertyName: 'Vista Plaza',
      relatedTo: 'Maintenance Request #MR-789',
    },
    {
      id: 'msg_008',
      type: 'email',
      category: 'announcement',
      direction: 'sent',
      stakeholderType: 'all',
      stakeholderId: 'all',
      stakeholderName: 'All Tenants - Sunset Apartments',
      subject: 'Scheduled Water Maintenance - December 2nd',
      message: 'Dear Residents,\n\nPlease be informed that scheduled water system maintenance will take place on December 2nd, 2024, from 9:00 AM to 3:00 PM.\n\nWater supply will be interrupted during this period. Please plan accordingly and store sufficient water.\n\nWe apologize for any inconvenience.\n\nBest regards,\nProperty Management',
      sentBy: 'Alice Johnson',
      sentDate: '2024-11-19T15:30:00',
      status: 'sent',
      propertyId: '1',
      propertyName: 'Sunset Apartments',
      relatedTo: 'Maintenance Notice',
    },
    {
      id: 'msg_009',
      type: 'email',
      category: 'support',
      direction: 'received',
      stakeholderType: 'landlord',
      stakeholderId: '2',
      stakeholderName: 'Jennifer M. Anderson',
      subject: 'Question about Tax Documentation',
      message: 'Hello,\n\nI need the annual tax documentation for my rental properties for the 2024 tax year. Can you please send me the rental income statements and expense reports?\n\nThank you,\nJennifer Anderson',
      sentBy: 'Jennifer M. Anderson',
      sentDate: '2024-11-18T10:20:00',
      status: 'read',
      relatedTo: 'Tax Documentation Request',
    },
    {
      id: 'msg_010',
      type: 'in-app',
      category: 'maintenance',
      direction: 'received',
      stakeholderType: 'vendor',
      stakeholderId: '1',
      stakeholderName: 'Quick Repairs Ltd',
      subject: 'Work Order #WO-456 Completed',
      message: 'Work order completed successfully. AC unit refrigerant recharged and compressor checked. All systems functioning normally. Invoice #INV-1234 submitted for KES 8,500.\n\nPlease approve payment.\n\nThank you,\nQuick Repairs Ltd',
      sentBy: 'Quick Repairs Ltd',
      sentDate: '2024-11-17T16:00:00',
      status: 'read',
      propertyId: '2',
      propertyName: 'Vista Plaza',
      relatedTo: 'Work Order #WO-456',
      attachments: ['invoice_1234.pdf', 'completion_photos.zip'],
    },
  ]

  // Filter messages
  const filteredMessages = mockMessages.filter(msg => {
    const matchesSearch = 
      msg.stakeholderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (msg.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = typeFilter === 'all' || msg.type === typeFilter
    const matchesStakeholder = stakeholderFilter === 'all' || msg.stakeholderType === stakeholderFilter
    const matchesCategory = categoryFilter === 'all' || msg.category === categoryFilter

    return matchesSearch && matchesType && matchesStakeholder && matchesCategory
  })

  // Statistics
  const stats = {
    total: mockMessages.length,
    sent: mockMessages.filter(m => m.direction === 'sent').length,
    received: mockMessages.filter(m => m.direction === 'received').length,
    unread: mockMessages.filter(m => m.status !== 'read' && m.direction === 'received').length,
  }

  const getStatusColor = (status: Message['status']) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'read': return 'bg-gray-100 text-gray-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: Message['type']) => {
    switch (type) {
      case 'email': return '📧'
      case 'sms': return '💬'
      case 'in-app': return '📱'
      case 'system': return '⚙️'
      default: return '📨'
    }
  }

  const getCategoryColor = (category: Message['category']) => {
    switch (category) {
      case 'rent-reminder': return 'bg-orange-100 text-orange-800'
      case 'maintenance': return 'bg-blue-100 text-blue-800'
      case 'lease': return 'bg-purple-100 text-purple-800'
      case 'payment': return 'bg-green-100 text-green-800'
      case 'announcement': return 'bg-yellow-100 text-yellow-800'
      case 'support': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communications</h1>
          <p className="text-gray-600 mt-2">View and manage all communications with tenants, landlords, and vendors</p>
        </div>
        <Button variant="primary" onClick={() => setShowCompose(true)}>
          + Compose Message
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Total Messages</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Sent</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.sent}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Received</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.received}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Unread</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{stats.unread}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="space-y-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search messages, stakeholders, or properties..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {/* Type Filter */}
            <div className="flex gap-2">
              <span className="text-sm font-medium text-gray-700 flex items-center">Type:</span>
              {(['all', 'email', 'sms', 'in-app', 'system'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    typeFilter === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            <div className="w-px bg-gray-300"></div>

            {/* Stakeholder Filter */}
            <div className="flex gap-2">
              <span className="text-sm font-medium text-gray-700 flex items-center">To/From:</span>
              {(['all', 'tenant', 'landlord', 'vendor'] as const).map(stakeholder => (
                <button
                  key={stakeholder}
                  onClick={() => setStakeholderFilter(stakeholder)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    stakeholderFilter === stakeholder
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {stakeholder.charAt(0).toUpperCase() + stakeholder.slice(1)}
                </button>
              ))}
            </div>

            <div className="w-px bg-gray-300"></div>

            {/* Category Filter */}
            <div className="flex gap-2">
              <span className="text-sm font-medium text-gray-700 flex items-center">Category:</span>
              {(['all', 'rent-reminder', 'maintenance', 'lease', 'payment', 'announcement', 'support'] as const).map(category => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    categoryFilter === category
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All' : category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="divide-y divide-gray-200">
          {filteredMessages.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p className="mt-2 text-sm">No messages found</p>
            </div>
          ) : (
            filteredMessages.map((message) => (
              <div
                key={message.id}
                onClick={() => setSelectedMessage(message)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition ${
                  message.direction === 'received' && message.status !== 'read' ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(message.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{message.subject}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(message.category)}`}>
                            {message.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </span>
                          {message.direction === 'received' && message.status !== 'read' && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              New
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="font-medium">
                            {message.direction === 'sent' ? '→' : '←'} {message.stakeholderName}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span>{formatDate(message.sentDate)}</span>
                          {message.propertyName && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span>{message.propertyName}</span>
                            </>
                          )}
                          {message.relatedTo && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-blue-600">{message.relatedTo}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2 ml-11">
                      {message.message}
                    </p>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="flex items-center gap-2 mt-2 ml-11">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="text-xs text-gray-500">{message.attachments.length} attachment(s)</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                      {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{getTypeIcon(selectedMessage.type)}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedMessage.subject}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedMessage.category)}`}>
                          {selectedMessage.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedMessage.status)}`}>
                          {selectedMessage.status.charAt(0).toUpperCase() + selectedMessage.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Message Metadata */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Direction</p>
                    <p className="font-semibold text-gray-900">
                      {selectedMessage.direction === 'sent' ? '→ Sent' : '← Received'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-semibold text-gray-900 capitalize">{selectedMessage.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {selectedMessage.direction === 'sent' ? 'To' : 'From'}
                    </p>
                    <p className="font-semibold text-gray-900">{selectedMessage.stakeholderName}</p>
                    <p className="text-xs text-gray-500 capitalize">{selectedMessage.stakeholderType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-semibold text-gray-900">{formatDate(selectedMessage.sentDate)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(selectedMessage.sentDate).toLocaleTimeString()}
                    </p>
                  </div>
                  {selectedMessage.propertyName && (
                    <div>
                      <p className="text-sm text-gray-600">Property</p>
                      <p className="font-semibold text-gray-900">{selectedMessage.propertyName}</p>
                    </div>
                  )}
                  {selectedMessage.relatedTo && (
                    <div>
                      <p className="text-sm text-gray-600">Related To</p>
                      <p className="font-semibold text-blue-600">{selectedMessage.relatedTo}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Sent By</p>
                    <p className="font-semibold text-gray-900">{selectedMessage.sentBy}</p>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Message</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              {/* Attachments */}
              {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                <div className="border-t border-gray-200 pt-6 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Attachments</h3>
                  <div className="space-y-2">
                    {selectedMessage.attachments.map((attachment, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                        <div className="flex items-center">
                          <svg className="h-8 w-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <p className="font-medium text-gray-900">{attachment}</p>
                            <p className="text-xs text-gray-500">PDF Document</p>
                          </div>
                        </div>
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-gray-200 pt-6 flex gap-3">
                <Button variant="outline" onClick={() => setSelectedMessage(null)} className="flex-1">
                  Close
                </Button>
                {selectedMessage.direction === 'received' && (
                  <Button variant="primary" className="flex-1">
                    Reply
                  </Button>
                )}
                <Button variant="secondary">
                  Forward
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Compose Message</h2>
                <button
                  onClick={() => setShowCompose(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="in-app">In-App Notification</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="rent-reminder">Rent Reminder</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="lease">Lease</option>
                      <option value="payment">Payment</option>
                      <option value="announcement">Announcement</option>
                      <option value="support">Support</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="tenant">Tenant</option>
                      <option value="landlord">Landlord</option>
                      <option value="vendor">Vendor</option>
                      <option value="all">All (Broadcast)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recipient</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Select recipient...</option>
                      <option value="1">John Smith (Tenant)</option>
                      <option value="2">Sarah Johnson (Tenant)</option>
                      <option value="3">Robert Williams (Landlord)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter message subject..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Type your message here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 cursor-pointer">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">Click to upload files or drag and drop</p>
                    <p className="text-xs text-gray-500">PDF, DOC, JPG, PNG up to 10MB</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowCompose(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button variant="secondary" className="flex-1">
                    Save Draft
                  </Button>
                  <Button variant="primary" className="flex-1">
                    Send Message
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
