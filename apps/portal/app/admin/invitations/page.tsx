'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface Invitation {
  id: string
  role: 'TENANT' | 'LANDLORD' | 'VENDOR'
  email: string
  name: string
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED'
  createdAt: string
  expiresAt: string
  acceptedAt: string | null
  tenant: { id: string; name: string; unit: string | null } | null
}

export default function InvitationsPage() {
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteType, setInviteType] = useState<'TENANT' | 'LANDLORD' | 'VENDOR'>('TENANT')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'ACCEPTED' | 'EXPIRED'>(
    (searchParams.get('status')?.toUpperCase() as any) || 'all'
  )
  const [roleFilter, setRoleFilter] = useState<'all' | 'TENANT' | 'LANDLORD' | 'VENDOR'>(
    (searchParams.get('role')?.toUpperCase() as any) || 'all'
  )
  const [sending, setSending] = useState(false)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      const res = await fetch('/api/invitations')
      if (!res.ok) throw new Error('Failed to load invitations')
      return res.json() as Promise<{ invitations: Invitation[]; pendingTenantCount: number }>
    },
  })

  const invitations = data?.invitations ?? []

  const stats = {
    total: invitations.length,
    pending: invitations.filter(i => i.status === 'PENDING').length,
    accepted: invitations.filter(i => i.status === 'ACCEPTED').length,
    expired: invitations.filter(i => i.status === 'EXPIRED').length,
  }

  const filteredInvitations = invitations.filter(inv => {
    const matchesSearch =
      inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter
    const matchesRole   = roleFilter   === 'all' || inv.role   === roleFilter
    return matchesSearch && matchesStatus && matchesRole
  })

  const handleSendInvitation = async () => {
    setSending(true)
    setInviteUrl(null)
    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, name: formData.name, role: inviteType }),
      })
      const json = await res.json()
      if (!res.ok) { alert(json.error || 'Failed to send invitation'); return }
      setInviteUrl(json.inviteUrl)
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
      queryClient.invalidateQueries({ queryKey: ['pending-tenant-invites'] })
      setFormData({ name: '', email: '', message: '' })
    } finally {
      setSending(false)
    }
  }

  const revokeInvitation = async (invitationId: string) => {
    const res = await fetch(`/api/invitations?id=${invitationId}`, { method: 'DELETE' })
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
      queryClient.invalidateQueries({ queryKey: ['pending-tenant-invites'] })
    }
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
          <div className="flex flex-wrap gap-2">
            {(['all', 'PENDING', 'ACCEPTED', 'EXPIRED'] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  statusFilter === s
                    ? s === 'PENDING' ? 'bg-yellow-600 text-white' : s === 'ACCEPTED' ? 'bg-success-600 text-white' : s === 'EXPIRED' ? 'bg-danger-600 text-white' : 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}>
                {s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)}
              className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
              <option value="all">All Roles</option>
              <option value="TENANT">Tenants</option>
              <option value="LANDLORD">Landlords</option>
              <option value="VENDOR">Vendors</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invitations List */}
      <div className="bg-surface rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-neutral-500 text-sm">Loading invitations…</div>
        ) : filteredInvitations.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 text-sm">No invitations found.</div>
        ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Sent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Expires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-neutral-200">
              {filteredInvitations.map((inv) => (
                <tr key={inv.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{inv.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{inv.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      inv.role === 'TENANT' ? 'bg-primary-100 text-primary-800'
                      : inv.role === 'LANDLORD' ? 'bg-success-100 text-green-800'
                      : 'bg-warning-100 text-orange-800'
                    }`}>{inv.role.charAt(0) + inv.role.slice(1).toLowerCase()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {inv.tenant?.unit ?? '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatDate(inv.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatDate(inv.expiresAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      inv.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800'
                      : inv.status === 'ACCEPTED' ? 'bg-success-100 text-green-800'
                      : 'bg-danger-100 text-red-800'
                    }`}>{inv.status.charAt(0) + inv.status.slice(1).toLowerCase()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {inv.status === 'PENDING' && (
                      <button onClick={() => revokeInvitation(inv.id)}
                        className="text-danger-600 hover:text-red-900" title="Revoke">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
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
                    onClick={() => setInviteType('TENANT')}
                    className={`p-4 border-2 rounded-lg transition ${
                      inviteType === 'TENANT'
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
                    onClick={() => setInviteType('LANDLORD')}
                    className={`p-4 border-2 rounded-lg transition ${
                      inviteType === 'LANDLORD'
                        ? 'border-success-600 bg-success-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <svg className="w-8 h-8 mx-auto mb-2 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <p className="font-medium text-sm">Landlord</p>
                  </button>
                  <button
                    onClick={() => setInviteType('VENDOR')}
                    className={`p-4 border-2 rounded-lg transition ${
                      inviteType === 'VENDOR'
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

              {inviteUrl ? (
                <div className="space-y-4">
                  <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-success-800 mb-2">Invitation created. Share this link with the invitee:</p>
                    <div className="flex gap-2">
                      <input readOnly value={inviteUrl}
                        className="flex-1 px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs font-mono text-neutral-700 focus:outline-none" />
                      <button onClick={() => navigator.clipboard.writeText(inviteUrl)}
                        className="px-3 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">Copy</button>
                    </div>
                    <p className="text-xs text-success-700 mt-2">Link expires in 7 days.</p>
                  </div>
                  <button onClick={() => { setInviteUrl(null); setShowInviteModal(false) }}
                    className="w-full px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 font-medium">Done</button>
                </div>
              ) : (
              <form onSubmit={(e) => { e.preventDefault(); handleSendInvitation(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Full Name <span className="text-danger-600">*</span>
                  </label>
                  <input type="text" required
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
                  <input type="email" required
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-sm text-primary-800">
                  <p className="font-medium">What happens next?</p>
                  <p className="mt-1">A secure invite link will be generated. Share it with the invitee so they can register. The link expires in 7 days.</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowInviteModal(false)}
                    className="flex-1 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 font-medium">
                    Cancel
                  </button>
                  <Button type="submit" variant="primary" className="flex-1" disabled={sending}>
                    {sending ? 'Creating…' : 'Create Invite Link'}
                  </Button>
                </div>
              </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
