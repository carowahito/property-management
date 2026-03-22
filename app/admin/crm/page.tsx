'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatDate } from '@/lib/utils'

interface Tenant {
  id: string
  name: string
  email: string
  phone: string
  status: string
  lease?: {
    property: {
      name: string
    }
    unit: string | null
  }
}

interface Landlord {
  id: string
  name: string
  email: string
  phone: string
  status: string
  _count: {
    properties: number
  }
}

interface Vendor {
  id: string
  name: string
  email: string
  phone: string
  company: string | null
  specialization: string
  rating: number
  status: string
}

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  type: string
  status: string
  source: string
  createdAt: string
  lastContactedAt?: string
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
  status: string
  priority: string
  createdAt: string
  resolvedAt?: string
  assignedTo?: string
}

async function fetchTenants() {
  const response = await fetch('/api/tenants')
  if (!response.ok) throw new Error('Failed to fetch tenants')
  return response.json()
}

async function fetchLandlords() {
  const response = await fetch('/api/landlords')
  if (!response.ok) throw new Error('Failed to fetch landlords')
  return response.json()
}

async function fetchVendors() {
  const response = await fetch('/api/vendors')
  if (!response.ok) throw new Error('Failed to fetch vendors')
  return response.json()
}

async function fetchLeads() {
  const response = await fetch('/api/leads')
  if (!response.ok) throw new Error('Failed to fetch leads')
  return response.json()
}

async function fetchEnquiries() {
  const response = await fetch('/api/enquiries')
  if (!response.ok) throw new Error('Failed to fetch enquiries')
  return response.json()
}

export default function CRMContactsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'tenants' | 'landlords' | 'vendors' | 'leads' | 'enquiries'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddContactModal, setShowAddContactModal] = useState(false)
  const [contactType, setContactType] = useState<'lead' | 'tenant' | 'landlord' | 'vendor'>('lead')

  // Fetch data from APIs
  const { data: tenantsData, isLoading: isLoadingTenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: fetchTenants,
  })

  const { data: landlordsData, isLoading: isLoadingLandlords } = useQuery({
    queryKey: ['landlords'],
    queryFn: fetchLandlords,
  })

  const { data: vendorsData, isLoading: isLoadingVendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: fetchVendors,
  })

  const { data: leadsData, isLoading: isLoadingLeads } = useQuery({
    queryKey: ['leads'],
    queryFn: fetchLeads,
  })

  const { data: enquiriesData, isLoading: isLoadingEnquiries } = useQuery({
    queryKey: ['enquiries'],
    queryFn: fetchEnquiries,
  })

  const isLoading = isLoadingTenants || isLoadingLandlords || isLoadingVendors || isLoadingLeads || isLoadingEnquiries

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const tenants = tenantsData?.tenants || []
  const landlords = landlordsData?.landlords || []
  const vendors = vendorsData?.vendors || []
  const leads = leadsData?.leads || []
  const enquiries = enquiriesData?.enquiries || []

  // Combine all contacts with unique keys
  const allContacts = [
    ...tenants.map((t: Tenant) => ({ ...t, uniqueKey: `tenant-${t.id}`, contactType: 'Tenant' as const, link: `/admin/tenants/${t.id}` })),
    ...landlords.map((l: Landlord) => ({ ...l, uniqueKey: `landlord-${l.id}`, contactType: 'Landlord' as const, link: `/admin/landlords/${l.id}` })),
    ...vendors.map((v: Vendor) => ({ ...v, uniqueKey: `vendor-${v.id}`, contactType: 'Vendor' as const, link: `/admin/vendors/${v.id}` })),
  ]

  const getFilteredData = () => {
    switch (activeTab) {
      case 'tenants':
        return tenants.filter((t: Tenant) =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      case 'landlords':
        return landlords.filter((l: Landlord) =>
          l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      case 'vendors':
        return vendors.filter((v: Vendor) =>
          v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      case 'leads':
        return leads.filter((l: Lead) => {
          const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.email.toLowerCase().includes(searchTerm.toLowerCase())
          const matchesStatus = filterStatus === 'all' || l.status === filterStatus
          return matchesSearch && matchesStatus
        })
      case 'enquiries':
        return enquiries.filter((e: Enquiry) => {
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
    const upperStatus = status.toUpperCase()
    switch (upperStatus) {
      case 'ACTIVE':
      case 'QUALIFIED':
      case 'RESOLVED':
        return 'bg-success-100 text-green-800'
      case 'NEW':
      case 'OPEN':
      case 'PENDING':
        return 'bg-primary-100 text-primary-800'
      case 'CONTACTED':
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800'
      case 'LOST':
      case 'CLOSED':
      case 'INACTIVE':
        return 'bg-neutral-100 text-neutral-800'
      case 'CONVERTED':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-neutral-100 text-neutral-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    const upperPriority = priority.toUpperCase()
    switch (upperPriority) {
      case 'HIGH':
      case 'URGENT': return 'bg-danger-100 text-red-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-primary-100 text-primary-800'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  const stats = {
    totalContacts: allContacts.length,
    tenants: tenants.length,
    landlords: landlords.length,
    vendors: vendors.length,
    leads: leads.length,
    enquiries: enquiries.length,
    activeLeads: leads.filter((l: Lead) => ['NEW', 'CONTACTED', 'QUALIFIED'].includes(l.status.toUpperCase())).length,
    openEnquiries: enquiries.filter((e: Enquiry) => ['OPEN', 'IN_PROGRESS', 'PENDING'].includes(e.status.toUpperCase())).length,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">CRM - All Contacts</h1>
          <p className="text-neutral-600 mt-1">Manage all stakeholders, leads, and enquiries</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="lg">📊 Reports</Button>
          <Button variant="primary" size="lg" onClick={() => setShowAddContactModal(true)}>+ Add Contact</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-xs text-neutral-600">Total Contacts</p>
          <p className="text-2xl font-bold text-primary-600">{stats.totalContacts}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-xs text-neutral-600">Tenants</p>
          <p className="text-2xl font-bold text-success-600">{stats.tenants}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-xs text-neutral-600">Landlords</p>
          <p className="text-2xl font-bold text-purple-600">{stats.landlords}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-xs text-neutral-600">Vendors</p>
          <p className="text-2xl font-bold text-warning-600">{stats.vendors}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-xs text-neutral-600">Total Leads</p>
          <p className="text-2xl font-bold text-indigo-600">{stats.leads}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-xs text-neutral-600">Active Leads</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.activeLeads}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-xs text-neutral-600">Enquiries</p>
          <p className="text-2xl font-bold text-pink-600">{stats.enquiries}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-xs text-neutral-600">Open</p>
          <p className="text-2xl font-bold text-danger-600">{stats.openEnquiries}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-surface shadow rounded-lg">
        <div className="border-b border-neutral-200">
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
                    ? 'bg-primary-600 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
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
              className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {(activeTab === 'leads' || activeTab === 'enquiries') && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
                  key={contact.uniqueKey}
                  href={contact.link}
                  className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                      contact.contactType === 'Tenant' ? 'bg-success-500' :
                      contact.contactType === 'Landlord' ? 'bg-purple-500' :
                      'bg-warning-500'
                    }`}>
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{contact.name}</p>
                      <p className="text-sm text-neutral-600">{contact.email}</p>
                      <p className="text-xs text-neutral-500">{contact.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      contact.contactType === 'Tenant' ? 'bg-success-100 text-green-800' :
                      contact.contactType === 'Landlord' ? 'bg-purple-100 text-purple-800' :
                      'bg-warning-100 text-orange-800'
                    }`}>
                      {contact.contactType}
                    </span>
                    <span className="text-neutral-400">→</span>
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
                  className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-success-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {tenant.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{tenant.name}</p>
                      <p className="text-sm text-neutral-600">
                        {tenant.lease ? `${tenant.lease.property.name} - Unit ${tenant.lease.unit || 'N/A'}` : 'No active lease'}
                      </p>
                      <p className="text-xs text-neutral-500">{tenant.email} • {tenant.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tenant.status)}`}>
                      {tenant.status}
                    </span>
                    <span className="text-neutral-400">→</span>
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
                  className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {landlord.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{landlord.name}</p>
                      <p className="text-sm text-neutral-600">{landlord._count.properties} properties</p>
                      <p className="text-xs text-neutral-500">{landlord.email} • {landlord.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(landlord.status)}`}>
                      {landlord.status}
                    </span>
                    <span className="text-neutral-400">→</span>
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
                  className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-warning-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {vendor.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{vendor.name}</p>
                      <p className="text-sm text-neutral-600">{vendor.specialization} • ⭐ {vendor.rating}</p>
                      <p className="text-xs text-neutral-500">{vendor.email} • {vendor.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.status)}`}>
                      {vendor.status}
                    </span>
                    <span className="text-neutral-400">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Leads View */}
          {activeTab === 'leads' && (
            <div className="grid gap-3">
              {getFilteredData().map((lead: any) => (
                <Link
                  key={lead.id}
                  href={`/admin/leads/${lead.id}`}
                  className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">{lead.name}</p>
                        <p className="text-sm text-neutral-600">{lead.email} • {lead.phone}</p>
                        <div className="flex gap-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                            {lead.status}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                            {lead.type}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            {lead.source}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                  {lead.notes && (
                    <p className="text-sm text-neutral-600 bg-neutral-50 rounded p-2 mb-2">{lead.notes}</p>
                  )}
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>Created: {formatDate(lead.createdAt)}</span>
                    {lead.lastContactedAt && <span>Last contact: {formatDate(lead.lastContactedAt)}</span>}
                    {lead.assignedTo && <span>Assigned to: {lead.assignedTo}</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Enquiries View */}
          {activeTab === 'enquiries' && (
            <div className="grid gap-3">
              {getFilteredData().map((enquiry: any) => (
                <Link
                  key={enquiry.id}
                  href={`/admin/enquiries/${enquiry.id}`}
                  className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-neutral-900">{enquiry.subject}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enquiry.status)}`}>
                          {enquiry.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(enquiry.priority)}`}>
                          {enquiry.priority}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 mb-2">{enquiry.message}</p>
                      <p className="text-sm text-neutral-700">
                        <strong>{enquiry.name}</strong> • {enquiry.email} • {enquiry.phone}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Respond</Button>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-500 border-t pt-2">
                    <span>Created: {formatDate(enquiry.createdAt)}</span>
                    {enquiry.assignedTo && <span>Assigned to: {enquiry.assignedTo}</span>}
                    {enquiry.resolvedAt && <span>Resolved: {formatDate(enquiry.resolvedAt)}</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-neutral-900">Add New Contact</h3>
                <button
                  onClick={() => setShowAddContactModal(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Contact Type *</label>
                  <select
                    value={contactType}
                    onChange={(e) => setContactType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="lead">Lead</option>
                    <option value="tenant">Tenant</option>
                    <option value="landlord">Landlord</option>
                    <option value="vendor">Vendor</option>
                  </select>
                </div>

                {contactType !== 'tenant' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Name *</label>
                        <input type="text" className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Phone *</label>
                        <input type="tel" className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Email *</label>
                      <input type="email" className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                    </div>
                  </>
                )}

                {contactType === 'lead' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Lead Type *</label>
                        <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                          <option>Property Inquiry</option>
                          <option>Service Request</option>
                          <option>Partnership</option>
                          <option>General</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Source *</label>
                        <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                          <option>Website</option>
                          <option>Referral</option>
                          <option>Social Media</option>
                          <option>Walk-in</option>
                          <option>Email</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Assign To</label>
                      <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                        <option value="">Select team member...</option>
                        <option>Alice Johnson</option>
                        <option>Bob Smith</option>
                        <option>Carol White</option>
                        <option>David Brown</option>
                      </select>
                    </div>
                  </>
                )}

                {contactType === 'tenant' && (
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-primary-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-lg font-medium text-primary-900">Tenant Registration Required</p>
                        <p className="text-sm text-primary-700 mt-2">
                          To add a new tenant, please use the dedicated tenant registration form which includes:
                        </p>
                        <ul className="text-sm text-primary-700 mt-2 list-disc list-inside space-y-1">
                          <li>Personal information and contact details</li>
                          <li>Property and unit assignment</li>
                          <li>Financial terms (rent, deposit, service charges)</li>
                          <li>Lease details and dates</li>
                          <li>Required document uploads (ID, passport photo)</li>
                          <li>Automatic lease document generation</li>
                        </ul>
                        <Link 
                          href="/admin/tenants" 
                          onClick={() => setShowAddContactModal(false)}
                          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                        >
                          Go to Tenant Registration
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {contactType === 'landlord' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">ID/Tax Number *</label>
                      <input type="text" className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Bank Account</label>
                      <input type="text" className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                    </div>
                  </div>
                )}

                {contactType === 'vendor' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Company Name</label>
                        <input type="text" className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Category *</label>
                        <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                          <option>Maintenance</option>
                          <option>Cleaning</option>
                          <option>Security</option>
                          <option>Landscaping</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Specialization</label>
                      <input type="text" placeholder="e.g., Plumbing, Electrical" className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                    </div>
                  </>
                )}

                {contactType !== 'tenant' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Notes</label>
                      <textarea rows={4} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button variant="outline" onClick={() => setShowAddContactModal(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button variant="primary" className="flex-1">
                        Add {contactType.charAt(0).toUpperCase() + contactType.slice(1)}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
