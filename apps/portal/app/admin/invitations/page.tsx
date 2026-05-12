'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface Invitation {
  id: string
  type: 'tenant' | 'landlord' | 'vendor'
  email: string
  name: string
  phone?: string
  property?: string
  status: 'pending' | 'accepted' | 'expired'
  sentDate: string
  expiryDate: string
  invitedBy: string
}

export default function InvitationsPage() {
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteType, setInviteType] = useState<'tenant' | 'landlord' | 'vendor'>('tenant')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'expired'>('all')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    property: '',
    message: '',
  })

  const [invitations, setInvitations] = useState<Invitation[]>([])

  const stats = {
    total: invitations.length,
    pending: invitations.filter(i => i.status === 'pending').length,
    accepted: invitations.filter(i => i.status === 'accepted').length,
    expired: invitations.filter(i => i.status === 'expired').length,
  }

  const filteredInvitations = invitations.filter(invitation => {
    const matchesSearch = 
      invitation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invitation.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || invitation.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleSendInvitation = () => {
    const newInvitation: Invitation = {
      id: `INV-${String(invitations.length + 1).padStart(3, '0')}`,
      type: inviteType,
      email: formData.email,
      name: formData.name,
      phone: formData.phone,
      property: inviteType === 'tenant' ? formData.property : undefined,
      status: 'pending',
      sentDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      invitedBy: 'Admin',
    }

    setInvitations([newInvitation, ...invitations])
    setShowInviteModal(false)
    setFormData({ name: '', email: '', phone: '', property: '', message: '' })
    
    // In real app, send email invitation here
    console.log('Sending invitation email to:', formData.email)
  }

  const resendInvitation = (invitationId: string) => {
    console.log('Resending invitation:', invitationId)
    // In real app, resend email invitation
  }

  const revokeInvitation = (invitationId: string) => {
    setInvitations(invitations.map(inv => 
      inv.id === invitationId ? { ...inv, status: 'expired' as const } : inv
    ))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Invitations</h1>
          <p className="text-neutral-600 mt-2">Invite tenants, landlords, and vendors to join the platform</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-medium rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Send Invitation
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface rounded-lg border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-100 rounded-lg p-3">
              <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Total Sent</p>
              <p className="text-2xl font-semibold text-neutral-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-lg border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Pending</p>
              <p className="text-2xl font-semibold text-neutral-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-lg border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-success-100 rounded-lg p-3">
              <svg className="h-6 w-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Accepted</p>
              <p className="text-2xl font-semibold text-neutral-900">{stats.accepted}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-lg border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-danger-100 rounded-lg p-3">
              <svg className="h-6 w-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Expired</p>
              <p className="text-2xl font-semibold text-neutral-900">{stats.expired}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-lg border border-neutral-200 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'all'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'pending'
                  ? 'bg-yellow-600 text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('accepted')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'accepted'
                  ? 'bg-success-600 text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Accepted
            </button>
            <button
              onClick={() => setStatusFilter('expired')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'expired'
                  ? 'bg-danger-600 text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Expired
            </button>
          </div>
        </div>
      </div>

      {/* Invitations List */}
      <div className="bg-surface rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  ID / Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Property/Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Sent Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-neutral-200">
              {filteredInvitations.map((invitation) => (
                <tr key={invitation.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-neutral-900">{invitation.id}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      invitation.type === 'tenant' 
                        ? 'bg-primary-100 text-primary-800'
                        : invitation.type === 'landlord'
                        ? 'bg-success-100 text-green-800'
                        : 'bg-warning-100 text-orange-800'
                    }`}>
                      {invitation.type.charAt(0).toUpperCase() + invitation.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {invitation.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    <p>{invitation.email}</p>
                    {invitation.phone && <p className="text-xs">{invitation.phone}</p>}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500">
                    {invitation.property || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {formatDate(invitation.sentDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {formatDate(invitation.expiryDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      invitation.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : invitation.status === 'accepted'
                        ? 'bg-success-100 text-green-800'
                        : 'bg-danger-100 text-red-800'
                    }`}>
                      {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {invitation.status === 'pending' && (
                        <>
                          <button
                            onClick={() => resendInvitation(invitation.id)}
                            className="text-primary-600 hover:text-primary-900"
                            title="Resend invitation"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                          <button
                            onClick={() => revokeInvitation(invitation.id)}
                            className="text-danger-600 hover:text-red-900"
                            title="Revoke invitation"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">Send Invitation</h2>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* User Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Invite as <span className="text-danger-600">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setInviteType('tenant')}
                    className={`p-4 border-2 rounded-lg transition ${
                      inviteType === 'tenant'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <svg className="w-8 h-8 mx-auto mb-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="font-medium text-sm">Tenant</p>
                  </button>
                  <button
                    onClick={() => setInviteType('landlord')}
                    className={`p-4 border-2 rounded-lg transition ${
                      inviteType === 'landlord'
                        ? 'border-success-600 bg-success-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <svg className="w-8 h-8 mx-auto mb-2 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <p className="font-medium text-sm">Landlord</p>
                  </button>
                  <button
                    onClick={() => setInviteType('vendor')}
                    className={`p-4 border-2 rounded-lg transition ${
                      inviteType === 'vendor'
                        ? 'border-warning-600 bg-warning-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <svg className="w-8 h-8 mx-auto mb-2 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="font-medium text-sm">Vendor</p>
                  </button>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSendInvitation(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Full Name <span className="text-danger-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email Address <span className="text-danger-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+254 712 345 678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                {inviteType === 'tenant' && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Property / Unit
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Sunset Apartments - Unit 3C"
                      value={formData.property}
                      onChange={(e) => setFormData({ ...formData, property: e.target.value })}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Personal Message (Optional)
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Add a personal message to the invitation..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-primary-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-primary-800">
                      <p className="font-medium">What happens next?</p>
                      <p className="mt-1">The invitee will receive an email with a secure link to create their account. The invitation expires in 14 days.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 font-medium"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                  >
                    Send Invitation
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
