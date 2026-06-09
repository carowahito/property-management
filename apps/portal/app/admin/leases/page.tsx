'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatDate } from '@/lib/utils'

interface Lease {
  id: string
  monthlyRent: number
  securityDeposit: number
  startDate: string
  endDate: string
  status: string
  unit: string | null
  unitRef?: { unitNumber: string } | null
  renewal?: boolean
  tenantSignedAt: string | null
  landlordSignedAt: string | null
  tenant: {
    id: string
    name: string
  }
  property: {
    id: string
    name: string
    landlord: {
      id: string
      name: string
    } | null
  }
  _count: {
    payments: number
  }
}

interface LeasesResponse {
  leases: Lease[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

async function fetchLeases(): Promise<LeasesResponse> {
  const response = await fetch('/api/leases')
  if (!response.ok) {
    throw new Error('Failed to fetch leases')
  }
  return response.json()
}

export default function AdminLeasesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'TERMINATED'>('all')
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['leases', statusFilter],
    queryFn: fetchLeases,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load leases. Please try again.</p>
      </div>
    )
  }

  const leases = data?.leases || []

  // Calculate statistics
  const now = new Date()
  const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

  const activeLeases = leases.filter(l => l.status === 'ACTIVE')
  const expiringSoon = leases.filter(l => {
    const endDate = new Date(l.endDate)
    return endDate > now && endDate <= ninetyDaysFromNow && l.status === 'ACTIVE'
  })

  const stats = {
    activeLeases: activeLeases.length,
    expiringSoon: expiringSoon.length,
    totalLeases: leases.length,
    totalAnnualValue: activeLeases.reduce((sum, l) => sum + (Number(l.monthlyRent) * 12), 0),
  }

  // Filter leases
  const filteredLeases = leases.filter(lease => {
    const matchesSearch =
      lease.tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lease.property.landlord?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      lease.property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lease.unit && lease.unit.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus =
      statusFilter === 'all' || lease.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getDaysUntilExpiry = (endDate: string) => {
    const end = new Date(endDate)
    const today = new Date()
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-neutral-900">Leases</h1>
        <p className="text-neutral-600 mt-2">Manage all lease agreements and terms across all properties</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface rounded-lg border border-neutral-200 p-4 md:p-6">
          <p className="text-sm text-neutral-600">Active Leases</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.activeLeases}</p>
          <p className="text-xs text-neutral-500 mt-2">{stats.totalLeases} total leases</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-4 md:p-6">
          <p className="text-sm text-neutral-600">Expiring Soon</p>
          <p className="text-3xl font-bold text-warning-600 mt-2">{stats.expiringSoon}</p>
          <p className="text-xs text-warning-600 mt-2">Within 90 days</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-4 md:p-6">
          <p className="text-sm text-neutral-600">Total Payments</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{leases.reduce((sum, l) => sum + l._count.payments, 0)}</p>
          <p className="text-xs text-primary-600 mt-2">All lease payments</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-4 md:p-6">
          <p className="text-sm text-neutral-600">Total Annual Value</p>
          <p className="text-3xl font-bold text-success-600 mt-2">KES {stats.totalAnnualValue.toLocaleString()}</p>
          <p className="text-xs text-neutral-500 mt-2">Combined rental value</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-lg border border-neutral-200 p-3 md:p-4">
        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by tenant, landlord, property, or unit..."
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              All ({stats.totalLeases})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'ACTIVE'
                  ? 'bg-success-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Active ({stats.activeLeases})
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'PENDING'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Pending ({leases.filter(l => l.status === 'PENDING').length})
            </button>
            <button
              onClick={() => setStatusFilter('EXPIRED')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'EXPIRED'
                  ? 'bg-warning-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Expired ({leases.filter(l => l.status === 'EXPIRED').length})
            </button>
            <button
              onClick={() => setStatusFilter('TERMINATED')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'TERMINATED'
                  ? 'bg-danger-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Terminated ({leases.filter(l => l.status === 'TERMINATED').length})
            </button>
          </div>
        </div>
      </div>

      {/* Leases Table */}
      <div className="bg-surface rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden lg:table-cell">
                  Lease ID
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden lg:table-cell">
                  Landlord
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell">
                  Property / Unit
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Monthly Rent
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell">
                  Start Date
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell">
                  End Date
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-neutral-200">
              {filteredLeases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-neutral-500">
                    <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-2 text-sm">No leases found</p>
                  </td>
                </tr>
              ) : (
                filteredLeases.map((lease) => {
                  const daysUntilExpiry = getDaysUntilExpiry(lease.endDate)
                  const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 90

                  return (
                    <tr key={lease.id} className="hover:bg-neutral-50">
                      <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm font-medium text-neutral-900 hidden lg:table-cell">
                        {lease.id.substring(0, 8)}...
                      </td>
                      <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-neutral-900">
                        <Link href={`/admin/tenants/${lease.tenant.id}`} className="text-primary-600 hover:text-primary-800 hover:underline">
                          {lease.tenant.name}
                        </Link>
                        <p className="text-xs text-neutral-500">{lease._count.payments} payments</p>
                      </td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-sm text-neutral-900 hidden lg:table-cell">
                        {lease.property.landlord ? (
                          <div>
                            <Link href={`/admin/landlords/${lease.property.landlord.id}`} className="text-primary-600 hover:text-primary-800 hover:underline">
                              {lease.property.landlord.name}
                            </Link>
                            {(lease.property.landlord as any).type === 'JOINT_OWNERSHIP' && (lease.property.landlord as any).members?.length > 0 && (
                              <p className="text-xs text-neutral-400">& {(lease.property.landlord as any).members.map((m: any) => m.name).join(' & ')}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-400">--</span>
                        )}
                      </td>
                      <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm hidden md:table-cell">
                        <Link href={`/admin/properties/${lease.property.id}`} className="text-primary-600 hover:text-primary-800 hover:underline">
                          {lease.property.name}
                        </Link>
                        <p className="text-xs text-neutral-500">{lease.unitRef?.unitNumber || lease.unit || 'N/A'}</p>
                      </td>
                      <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm font-semibold text-neutral-900">
                        KES {Number(lease.monthlyRent).toLocaleString()}
                      </td>
                      <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-neutral-500 hidden md:table-cell">
                        {formatDate(lease.startDate)}
                      </td>
                      <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-neutral-500 hidden md:table-cell">
                        {formatDate(lease.endDate)}
                        {isExpiringSoon && (
                          <p className="text-xs text-warning-600 font-medium mt-1">
                            {daysUntilExpiry} days left
                          </p>
                        )}
                      </td>
                      <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            lease.status === 'ACTIVE'
                              ? 'bg-success-100 text-green-800'
                              : lease.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : lease.status === 'EXPIRED'
                              ? 'bg-warning-100 text-orange-800'
                              : lease.status === 'TERMINATED'
                              ? 'bg-danger-100 text-red-800'
                              : 'bg-neutral-100 text-neutral-800'
                          }`}>
                            {lease.status}
                          </span>
                          {lease.status === 'PENDING' && (
                            <span className="text-xs text-neutral-500">
                              {lease.landlordSignedAt && lease.tenantSignedAt ? 'Both signed' : lease.landlordSignedAt ? 'Awaiting tenant' : lease.tenantSignedAt ? 'Awaiting landlord' : 'Awaiting signatures'}
                            </span>
                          )}
                          {isExpiringSoon && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-orange-800">
                              Expiring Soon
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-3">
                          <Link href={`/admin/leases/${lease.id}`} className="text-primary-600 hover:text-primary-900">
                            View
                          </Link>
                          <button
                            onClick={() => window.open(`/api/leases/${lease.id}/generate-pdf`, '_blank')}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lease Detail Modal */}
      {selectedLease && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-neutral-900">Lease Agreement Details</h2>
                <button
                  onClick={() => setSelectedLease(null)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 md:space-y-6">
                {/* Lease Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-600">Lease ID</p>
                    <p className="text-lg font-semibold text-neutral-900">{selectedLease.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Status</p>
                    <div className="flex gap-2 mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        selectedLease.status === 'Active' 
                          ? 'bg-success-100 text-green-800'
                          : 'bg-neutral-100 text-neutral-800'
                      }`}>
                        {selectedLease.status}
                      </span>
                      {selectedLease.renewal && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                          Renewal Available
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Parties */}
                <div className="border-t border-neutral-200 pt-4">
                  <h3 className="font-semibold text-neutral-900 mb-3">Parties</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 md:p-4 bg-neutral-50 rounded-lg">
                      <p className="text-sm text-neutral-600">Tenant</p>
                      <Link href={`/admin/tenants/${selectedLease.tenant.id}`} className="font-semibold text-primary-600 hover:text-primary-800 hover:underline">
                        {selectedLease.tenant.name}
                      </Link>
                      <p className="text-xs text-neutral-500">{selectedLease._count.payments} payments</p>
                    </div>
                    <div className="p-3 md:p-4 bg-neutral-50 rounded-lg">
                      <p className="text-sm text-neutral-600">Landlord</p>
                      {selectedLease.property.landlord ? (
                        <>
                          <Link href={`/admin/landlords/${selectedLease.property.landlord.id}`} className="font-semibold text-primary-600 hover:text-primary-800 hover:underline">
                            {selectedLease.property.landlord.name}
                          </Link>
                          {(selectedLease.property.landlord as any).type === 'JOINT_OWNERSHIP' && (selectedLease.property.landlord as any).members?.length > 0 && (
                            <p className="text-xs text-neutral-500">& {(selectedLease.property.landlord as any).members.map((m: any) => m.name).join(' & ')}</p>
                          )}
                        </>
                      ) : (
                        <p className="font-semibold text-neutral-900">—</p>
                      )}
                      <p className="text-xs text-neutral-500">Property Owner</p>
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="border-t border-neutral-200 pt-4">
                  <h3 className="font-semibold text-neutral-900 mb-3">Property Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-neutral-600">Property</p>
                      <Link href={`/admin/properties/${selectedLease.property.id}`} className="text-lg font-semibold text-primary-600 hover:text-primary-800 hover:underline">
                        {selectedLease.property.name}
                      </Link>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Unit</p>
                      <p className="text-lg font-semibold text-neutral-900">{selectedLease.unit || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Financial Terms */}
                <div className="border-t border-neutral-200 pt-4">
                  <h3 className="font-semibold text-neutral-900 mb-3">Financial Terms</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 md:p-4 bg-primary-50 rounded-lg">
                      <p className="text-sm text-neutral-600">Monthly Rent</p>
                      <p className="text-xl md:text-2xl font-bold text-neutral-900">KES {Number(selectedLease.monthlyRent).toLocaleString()}</p>
                    </div>
                    <div className="p-3 md:p-4 bg-success-50 rounded-lg">
                      <p className="text-sm text-neutral-600">Security Deposit</p>
                      <p className="text-xl md:text-2xl font-bold text-neutral-900">KES {Number(selectedLease.securityDeposit).toLocaleString()}</p>
                    </div>
                    <div className="p-3 md:p-4 bg-neutral-50 rounded-lg">
                      <p className="text-sm text-neutral-600">Annual Value</p>
                      <p className="text-xl md:text-2xl font-bold text-neutral-900">KES {(Number(selectedLease.monthlyRent) * 12).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Lease Term */}
                <div className="border-t border-neutral-200 pt-4">
                  <h3 className="font-semibold text-neutral-900 mb-3">Lease Term</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-neutral-600">Start Date</p>
                      <p className="text-lg font-semibold text-neutral-900">
                        {formatDate(selectedLease.startDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">End Date</p>
                      <p className="text-lg font-semibold text-neutral-900">
                        {formatDate(selectedLease.endDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Days Remaining</p>
                      <p className="text-lg font-semibold text-neutral-900">
                        {getDaysUntilExpiry(selectedLease.endDate)} days
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-4 flex gap-3">
                  <button
                    onClick={() => setSelectedLease(null)}
                    className="flex-1 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 font-medium"
                  >
                    Close
                  </button>
                  <button className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
                    Edit Lease
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
