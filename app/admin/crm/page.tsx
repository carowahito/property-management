'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { mockTenants, mockLandlords, mockVendors } from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  type: 'Property Inquiry' | 'Service Request' | 'Partnership' | 'General'
  status: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost'
  source: 'Website' | 'Referral' | 'Social Media' | 'Walk-in' | 'Email'
  createdDate: string
  lastContact?: string
  assignedTo?: string
  notes?: string
}

interface Enquiry {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'
  priority: 'Low' | 'Medium' | 'High'
  createdDate: string
  resolvedDate?: string
  assignedTo?: string
}

export default function CRMContactsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'tenants' | 'landlords' | 'vendors' | 'leads' | 'enquiries'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddLeadModal, setShowAddLeadModal] = useState(false)

  // Mock leads data
  const mockLeads: Lead[] = [
    {
      id: 'L001',
      name: 'Sarah Mitchell',
      email: 'sarah.mitchell@email.com',
      phone: '+254 790 123 456',
      type: 'Property Inquiry',
      status: 'Qualified',
      source: 'Website',
      createdDate: '2024-11-10T09:00:00',
      lastContact: '2024-11-14T10:30:00',
      assignedTo: 'Alice Johnson',
      notes: 'Interested in 2-bedroom apartment in Westlands. Budget: KES 80,000/month',
    },
    {
      id: 'L002',
      name: 'James Kamau',
      email: 'james.k@email.com',
      phone: '+254 722 345 678',
      type: 'Property Inquiry',
      status: 'New',
      source: 'Referral',
      createdDate: '2024-11-15T14:20:00',
      assignedTo: 'David Brown',
      notes: 'Looking for commercial space in Upperhill',
    },
    {
      id: 'L003',
      name: 'Linda Mwangi',
      email: 'linda.mwangi@company.com',
      phone: '+254 733 456 789',
      type: 'Partnership',
      status: 'Contacted',
      source: 'Social Media',
      createdDate: '2024-11-12T11:00:00',
      lastContact: '2024-11-13T15:00:00',
      assignedTo: 'Alice Johnson',
      notes: 'Property owner with 5 units, interested in management services',
    },
    {
      id: 'L004',
      name: 'Peter Odhiambo',
      email: 'p.odhiambo@email.com',
      phone: '+254 744 567 890',
      type: 'Service Request',
      status: 'Lost',
      source: 'Walk-in',
      createdDate: '2024-10-28T10:00:00',
      lastContact: '2024-11-05T12:00:00',
      assignedTo: 'Bob Smith',
      notes: 'Chose competitor. Price sensitive.',
    },
  ]

  // Mock enquiries data
  const mockEnquiries: Enquiry[] = [
    {
      id: 'E001',
      name: 'Grace Wanjiru',
      email: 'grace.w@email.com',
      phone: '+254 755 678 901',
      subject: 'Lease Terms Question',
      message: 'What are the penalties for early lease termination?',
      status: 'Resolved',
      priority: 'Medium',
      createdDate: '2024-11-14T09:30:00',
      resolvedDate: '2024-11-14T14:00:00',
      assignedTo: 'Carol White',
    },
    {
      id: 'E002',
      name: 'Michael Otieno',
      email: 'michael.o@email.com',
      phone: '+254 766 789 012',
      subject: 'Payment Methods',
      message: 'Do you accept cryptocurrency payments?',
      status: 'In Progress',
      priority: 'Low',
      createdDate: '2024-11-15T11:00:00',
      assignedTo: 'Carol White',
    },
    {
      id: 'E003',
      name: 'Anna Njeri',
      email: 'anna.njeri@email.com',
      phone: '+254 777 890 123',
      subject: 'Maintenance Emergency',
      message: 'Water heater not working in Unit 405',
      status: 'Open',
      priority: 'High',
      createdDate: '2024-11-16T08:00:00',
      assignedTo: 'Bob Smith',
    },
  ]

  // Combine all contacts
  const allContacts = [
    ...mockTenants.map(t => ({ ...t, contactType: 'Tenant' as const, link: `/admin/tenants/${t.id}` })),
    ...mockLandlords.map(l => ({ ...l, contactType: 'Landlord' as const, link: `/admin/landlords/${l.id}` })),
    ...mockVendors.map(v => ({ ...v, contactType: 'Vendor' as const, link: `/admin/vendors/${v.id}` })),
  ]

  const getFilteredData = () => {
    switch (activeTab) {
      case 'tenants':
        return mockTenants.filter(t => 
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      case 'landlords':
        return mockLandlords.filter(l => 
          l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      case 'vendors':
        return mockVendors.filter(v => 
          v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      case 'leads':
        return mockLeads.filter(l => {
          const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.email.toLowerCase().includes(searchTerm.toLowerCase())
          const matchesStatus = filterStatus === 'all' || l.status === filterStatus
          return matchesSearch && matchesStatus
        })
      case 'enquiries':
        return mockEnquiries.filter(e => {
          const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.subject.toLowerCase().includes(searchTerm.toLowerCase())
          const matchesStatus = filterStatus === 'all' || e.status === filterStatus
          return matchesSearch && matchesStatus
        })
      default:
        return allContacts.filter(c => 
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
      case 'Qualified':
      case 'Resolved':
        return 'bg-green-100 text-green-800'
      case 'New':
      case 'Open':
        return 'bg-blue-100 text-blue-800'
      case 'Contacted':
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'Lost':
      case 'Closed':
        return 'bg-gray-100 text-gray-800'
      case 'Converted':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const stats = {
    totalContacts: allContacts.length,
    tenants: mockTenants.length,
    landlords: mockLandlords.length,
    vendors: mockVendors.length,
    leads: mockLeads.length,
    enquiries: mockEnquiries.length,
    activeLeads: mockLeads.filter(l => ['New', 'Contacted', 'Qualified'].includes(l.status)).length,
    openEnquiries: mockEnquiries.filter(e => ['Open', 'In Progress'].includes(e.status)).length,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CRM - All Contacts</h1>
          <p className="text-gray-600 mt-1">Manage all stakeholders, leads, and enquiries</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="lg">📊 Reports</Button>
          <Button variant="primary" size="lg" onClick={() => setShowAddLeadModal(true)}>+ Add Lead</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-xs text-gray-600">Total Contacts</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalContacts}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-xs text-gray-600">Tenants</p>
          <p className="text-2xl font-bold text-green-600">{stats.tenants}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-xs text-gray-600">Landlords</p>
          <p className="text-2xl font-bold text-purple-600">{stats.landlords}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-xs text-gray-600">Vendors</p>
          <p className="text-2xl font-bold text-orange-600">{stats.vendors}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-xs text-gray-600">Total Leads</p>
          <p className="text-2xl font-bold text-indigo-600">{stats.leads}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-xs text-gray-600">Active Leads</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.activeLeads}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-xs text-gray-600">Enquiries</p>
          <p className="text-2xl font-bold text-pink-600">{stats.enquiries}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-xs text-gray-600">Open</p>
          <p className="text-2xl font-bold text-red-600">{stats.openEnquiries}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-2 overflow-x-auto">
            {[
              { id: 'all', label: 'All Contacts', count: stats.totalContacts, icon: '👥' },
              { id: 'tenants', label: 'Tenants', count: stats.tenants, icon: '🏠' },
              { id: 'landlords', label: 'Landlords', count: stats.landlords, icon: '🏢' },
              { id: 'vendors', label: 'Vendors', count: stats.vendors, icon: '🔧' },
              { id: 'leads', label: 'Leads', count: stats.leads, icon: '🎯' },
              { id: 'enquiries', label: 'Enquiries', count: stats.enquiries, icon: '💬' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any)
                  setFilterStatus('all')
                }}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.icon} {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Search and Filter */}
          <div className="mb-4 flex gap-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {(activeTab === 'leads' || activeTab === 'enquiries') && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                {activeTab === 'leads' && (
                  <>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Converted">Converted</option>
                    <option value="Lost">Lost</option>
                  </>
                )}
                {activeTab === 'enquiries' && (
                  <>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </>
                )}
              </select>
            )}
          </div>

          {/* All Contacts View */}
          {activeTab === 'all' && (
            <div className="grid gap-3">
              {getFilteredData().map((contact: any) => (
                <Link
                  key={contact.id}
                  href={contact.link}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                      contact.contactType === 'Tenant' ? 'bg-green-500' :
                      contact.contactType === 'Landlord' ? 'bg-purple-500' :
                      'bg-orange-500'
                    }`}>
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{contact.name}</p>
                      <p className="text-sm text-gray-600">{contact.email}</p>
                      <p className="text-xs text-gray-500">{contact.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      contact.contactType === 'Tenant' ? 'bg-green-100 text-green-800' :
                      contact.contactType === 'Landlord' ? 'bg-purple-100 text-purple-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {contact.contactType}
                    </span>
                    <span className="text-gray-400">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Tenants View */}
          {activeTab === 'tenants' && (
            <div className="grid gap-3">
              {getFilteredData().map((tenant: any) => (
                <Link
                  key={tenant.id}
                  href={`/admin/tenants/${tenant.id}`}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {tenant.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{tenant.name}</p>
                      <p className="text-sm text-gray-600">{tenant.property} - Unit {tenant.unit}</p>
                      <p className="text-xs text-gray-500">{tenant.email} • {tenant.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tenant.status)}`}>
                      {tenant.status}
                    </span>
                    <span className="text-gray-400">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Landlords View */}
          {activeTab === 'landlords' && (
            <div className="grid gap-3">
              {getFilteredData().map((landlord: any) => (
                <Link
                  key={landlord.id}
                  href={`/admin/landlords/${landlord.id}`}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {landlord.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{landlord.name}</p>
                      <p className="text-sm text-gray-600">{landlord.properties.length} properties • {landlord.totalUnits} units</p>
                      <p className="text-xs text-gray-500">{landlord.email} • {landlord.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(landlord.status)}`}>
                      {landlord.status}
                    </span>
                    <span className="text-gray-400">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Vendors View */}
          {activeTab === 'vendors' && (
            <div className="grid gap-3">
              {getFilteredData().map((vendor: any) => (
                <Link
                  key={vendor.id}
                  href={`/admin/vendors/${vendor.id}`}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {vendor.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{vendor.name}</p>
                      <p className="text-sm text-gray-600">{vendor.specialization} • ⭐ {vendor.rating}</p>
                      <p className="text-xs text-gray-500">{vendor.email} • {vendor.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.status)}`}>
                      {vendor.status}
                    </span>
                    <span className="text-gray-400">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Leads View */}
          {activeTab === 'leads' && (
            <div className="grid gap-3">
              {getFilteredData().map((lead: any) => (
                <div
                  key={lead.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{lead.name}</p>
                        <p className="text-sm text-gray-600">{lead.email} • {lead.phone}</p>
                        <div className="flex gap-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                            {lead.status}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {lead.type}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {lead.source}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                  {lead.notes && (
                    <p className="text-sm text-gray-600 bg-gray-50 rounded p-2 mb-2">{lead.notes}</p>
                  )}
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Created: {formatDate(lead.createdDate)}</span>
                    {lead.lastContact && <span>Last contact: {formatDate(lead.lastContact)}</span>}
                    {lead.assignedTo && <span>Assigned to: {lead.assignedTo}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Enquiries View */}
          {activeTab === 'enquiries' && (
            <div className="grid gap-3">
              {getFilteredData().map((enquiry: any) => (
                <div
                  key={enquiry.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{enquiry.subject}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enquiry.status)}`}>
                          {enquiry.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(enquiry.priority)}`}>
                          {enquiry.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{enquiry.message}</p>
                      <p className="text-sm text-gray-700">
                        <strong>{enquiry.name}</strong> • {enquiry.email} • {enquiry.phone}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Respond</Button>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 border-t pt-2">
                    <span>Created: {formatDate(enquiry.createdDate)}</span>
                    {enquiry.assignedTo && <span>Assigned to: {enquiry.assignedTo}</span>}
                    {enquiry.resolvedDate && <span>Resolved: {formatDate(enquiry.resolvedDate)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Add New Lead</h3>
                <button
                  onClick={() => setShowAddLeadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input type="tel" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lead Type *</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option>Property Inquiry</option>
                      <option>Service Request</option>
                      <option>Partnership</option>
                      <option>General</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source *</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option>Website</option>
                      <option>Referral</option>
                      <option>Social Media</option>
                      <option>Walk-in</option>
                      <option>Email</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select team member...</option>
                    <option>Alice Johnson</option>
                    <option>Bob Smith</option>
                    <option>Carol White</option>
                    <option>David Brown</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowAddLeadModal(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button variant="primary" className="flex-1">
                    Add Lead
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
