'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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
  
  // Compose form state
  const [composeRecipientType, setComposeRecipientType] = useState<'tenant' | 'landlord' | 'vendor' | 'all'>('tenant')
  const [composeRecipient, setComposeRecipient] = useState<string>('')
  const [composeProperty, setComposeProperty] = useState<string>('all')
  const [composeSubject, setComposeSubject] = useState<string>('')
  const [composeMessage, setComposeMessage] = useState<string>('')
  const [isImprovingText, setIsImprovingText] = useState(false)

  // Fetch properties for the compose dropdown
  const { data: propertiesData } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const response = await fetch('/api/properties')
      if (!response.ok) throw new Error('Failed to fetch properties')
      return response.json()
    },
  })

  const properties = propertiesData?.properties || []

  // Get filtered recipients based on selected type and property
  const getRecipientOptions = () => {
    let contacts: any[] = []
    
    if (composeRecipientType === 'all') {
      return []  // No individual selection when 'all' is selected
    }
    
    // TODO: Fetch real contacts from API based on type and property
    return contacts
  }

  // AI text improvement handler
  const handleImproveWithAI = async (field: 'message' | 'subject') => {
    setIsImprovingText(true)
    
    // Simulate AI API call - in production, this would call your LLM API configured in settings
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    if (field === 'message' && composeMessage) {
      const improved = composeMessage + '\n\nThis message has been enhanced for clarity and professionalism.'
      setComposeMessage(improved)
    } else if (field === 'subject' && composeSubject) {
      const improved = '✨ ' + composeSubject
      setComposeSubject(improved)
    }
    
    setIsImprovingText(false)
  }

  // TODO: Fetch real messages from API
  const messages: Message[] = []

  // Filter messages
  const filteredMessages = messages.filter(msg => {
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
    total: messages.length,
    sent: messages.filter(m => m.direction === 'sent').length,
    received: messages.filter(m => m.direction === 'received').length,
    unread: messages.filter(m => m.status !== 'read' && m.direction === 'received').length,
  }

  const getStatusColor = (status: Message['status']) => {
    switch (status) {
      case 'sent': return 'bg-primary-100 text-primary-800'
      case 'delivered': return 'bg-success-100 text-green-800'
      case 'read': return 'bg-neutral-100 text-neutral-800'
      case 'failed': return 'bg-danger-100 text-red-800'
      default: return 'bg-neutral-100 text-neutral-800'
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
      case 'rent-reminder': return 'bg-warning-100 text-orange-800'
      case 'maintenance': return 'bg-primary-100 text-primary-800'
      case 'lease': return 'bg-primary-100 text-primary-800'
      case 'payment': return 'bg-success-100 text-green-800'
      case 'announcement': return 'bg-yellow-100 text-yellow-800'
      case 'support': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-neutral-900">Communications</h1>
          <p className="text-neutral-600 mt-2">View and manage all communications with tenants, landlords, and vendors</p>
        </div>
        <Button variant="primary" onClick={() => setShowCompose(true)}>
          + Compose Message
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface rounded-lg border border-neutral-200 p-4 md:p-6">
          <p className="text-sm text-neutral-600">Total Messages</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-4 md:p-6">
          <p className="text-sm text-neutral-600">Sent</p>
          <p className="text-3xl font-bold text-primary-600 mt-2">{stats.sent}</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-4 md:p-6">
          <p className="text-sm text-neutral-600">Received</p>
          <p className="text-3xl font-bold text-success-600 mt-2">{stats.received}</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-4 md:p-6">
          <p className="text-sm text-neutral-600">Unread</p>
          <p className="text-3xl font-bold text-warning-600 mt-2">{stats.unread}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-lg border border-neutral-200 p-4">
        <div className="space-y-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search messages, stakeholders, or properties..."
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {/* Type Filter */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-neutral-700 flex items-center">Type:</span>
              {(['all', 'email', 'sms', 'in-app', 'system'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    typeFilter === type
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            <div className="w-px bg-neutral-300"></div>

            {/* Stakeholder Filter */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-neutral-700 flex items-center">To/From:</span>
              {(['all', 'tenant', 'landlord', 'vendor'] as const).map(stakeholder => (
                <button
                  key={stakeholder}
                  onClick={() => setStakeholderFilter(stakeholder)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    stakeholderFilter === stakeholder
                      ? 'bg-success-600 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {stakeholder.charAt(0).toUpperCase() + stakeholder.slice(1)}
                </button>
              ))}
            </div>

            <div className="w-px bg-neutral-300"></div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-neutral-700 flex items-center">Category:</span>
              {(['all', 'rent-reminder', 'maintenance', 'lease', 'payment', 'announcement', 'support'] as const).map(category => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    categoryFilter === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
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
      <div className="bg-surface rounded-lg border border-neutral-200">
        <div className="divide-y divide-neutral-200">
          {filteredMessages.length === 0 ? (
            <div className="p-12 text-center text-neutral-500">
              <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p className="mt-2 text-sm">No messages found</p>
            </div>
          ) : (
            filteredMessages.map((message) => (
              <div
                key={message.id}
                onClick={() => setSelectedMessage(message)}
                className={`p-4 hover:bg-neutral-50 cursor-pointer transition ${
                  message.direction === 'received' && message.status !== 'read' ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(message.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-neutral-900">{message.subject}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(message.category)}`}>
                            {message.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </span>
                          {message.direction === 'received' && message.status !== 'read' && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-orange-800">
                              New
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-neutral-600">
                          <span className="font-medium">
                            {message.direction === 'sent' ? '→' : '←'} {message.stakeholderName}
                          </span>
                          <span className="text-neutral-400">•</span>
                          <span>{formatDate(message.sentDate)}</span>
                          {message.propertyName && (
                            <>
                              <span className="text-neutral-400">•</span>
                              <span>{message.propertyName}</span>
                            </>
                          )}
                          {message.relatedTo && (
                            <>
                              <span className="text-neutral-400">•</span>
                              <span className="text-primary-600">{message.relatedTo}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-neutral-700 line-clamp-2 ml-11">
                      {message.message}
                    </p>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="flex items-center gap-2 mt-2 ml-11">
                        <svg className="h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="text-xs text-neutral-500">{message.attachments.length} attachment(s)</span>
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
          <div className="bg-surface rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{getTypeIcon(selectedMessage.type)}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-900">{selectedMessage.subject}</h2>
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
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Message Metadata */}
              <div className="bg-neutral-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-600">Direction</p>
                    <p className="font-semibold text-neutral-900">
                      {selectedMessage.direction === 'sent' ? '→ Sent' : '← Received'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Type</p>
                    <p className="font-semibold text-neutral-900 capitalize">{selectedMessage.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">
                      {selectedMessage.direction === 'sent' ? 'To' : 'From'}
                    </p>
                    <p className="font-semibold text-neutral-900">{selectedMessage.stakeholderName}</p>
                    <p className="text-xs text-neutral-500 capitalize">{selectedMessage.stakeholderType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Date & Time</p>
                    <p className="font-semibold text-neutral-900">{formatDate(selectedMessage.sentDate)}</p>
                    <p className="text-xs text-neutral-500">
                      {new Date(selectedMessage.sentDate).toLocaleTimeString()}
                    </p>
                  </div>
                  {selectedMessage.propertyName && (
                    <div>
                      <p className="text-sm text-neutral-600">Property</p>
                      <p className="font-semibold text-neutral-900">{selectedMessage.propertyName}</p>
                    </div>
                  )}
                  {selectedMessage.relatedTo && (
                    <div>
                      <p className="text-sm text-neutral-600">Related To</p>
                      <p className="font-semibold text-primary-600">{selectedMessage.relatedTo}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-neutral-600">Sent By</p>
                    <p className="font-semibold text-neutral-900">{selectedMessage.sentBy}</p>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="border-t border-neutral-200 pt-6 mb-6">
                <h3 className="font-semibold text-neutral-900 mb-3">Message</h3>
                <div className="bg-surface border border-neutral-200 rounded-lg p-4">
                  <p className="text-neutral-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              {/* Attachments */}
              {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                <div className="border-t border-neutral-200 pt-6 mb-6">
                  <h3 className="font-semibold text-neutral-900 mb-3">Attachments</h3>
                  <div className="space-y-2">
                    {selectedMessage.attachments.map((attachment, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 cursor-pointer">
                        <div className="flex items-center">
                          <svg className="h-8 w-8 text-primary-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <p className="font-medium text-neutral-900">{attachment}</p>
                            <p className="text-xs text-neutral-500">PDF Document</p>
                          </div>
                        </div>
                        <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-neutral-200 pt-6 flex gap-3">
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
          <div className="bg-surface rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-neutral-900">Compose Message</h2>
                <button
                  onClick={() => setShowCompose(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Message Type</label>
                    <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="in-app">In-App Notification</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Category</label>
                    <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Recipient Type</label>
                    <select 
                      value={composeRecipientType}
                      onChange={(e) => {
                        setComposeRecipientType(e.target.value as 'tenant' | 'landlord' | 'vendor' | 'all')
                        setComposeRecipient('') // Reset recipient when type changes
                        setComposeProperty('all') // Reset property filter
                      }}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="tenant">Tenant</option>
                      <option value="landlord">Landlord</option>
                      <option value="vendor">Vendor</option>
                      <option value="all">All Stakeholders (Broadcast)</option>
                    </select>
                  </div>
                  {composeRecipientType !== 'all' && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Recipient</label>
                      <select 
                        value={composeRecipient}
                        onChange={(e) => setComposeRecipient(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Select recipient...</option>
                        <option value="all">All {composeRecipientType}s</option>
                        {getRecipientOptions().map(contact => (
                          <option key={contact.id} value={contact.id}>
                            {contact.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Property Filter for Tenants and Landlords */}
                {(composeRecipientType === 'tenant' || composeRecipientType === 'landlord') && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Filter by Property</label>
                    <select 
                      value={composeProperty}
                      onChange={(e) => {
                        setComposeProperty(e.target.value)
                        setComposeRecipient('') // Reset recipient when property changes
                      }}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="all">All Properties</option>
                      {properties.map((property: any) => (
                        <option key={property.id} value={property.id}>
                          {property.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-neutral-700">Subject</label>
                    <button
                      type="button"
                      onClick={() => handleImproveWithAI('subject')}
                      disabled={!composeSubject || isImprovingText}
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
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter message subject..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-neutral-700">Message</label>
                    <button
                      type="button"
                      onClick={() => handleImproveWithAI('message')}
                      disabled={!composeMessage || isImprovingText}
                      className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 disabled:text-neutral-400 disabled:cursor-not-allowed transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      {isImprovingText ? 'Improving...' : 'Improve with AI'}
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    value={composeMessage}
                    onChange={(e) => setComposeMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Type your message here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Attachments</label>
                  <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary-500 cursor-pointer">
                    <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mt-2 text-sm text-neutral-600">Click to upload files or drag and drop</p>
                    <p className="text-xs text-neutral-500">PDF, DOC, JPG, PNG up to 10MB</p>
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
