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
  renewal?: boolean
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
    }
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
  const response = await fetch('/api/mock/leases')
  if (!response.ok) {
    throw new Error('Failed to fetch leases')
  }
  return response.json()
}

export default function AdminLeasesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED'>('all')
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
      lease.property.landlord.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Leases</h1>
        <p className="text-gray-600 mt-2">Manage all lease agreements and terms across all properties</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Active Leases</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeLeases}</p>
          <p className="text-xs text-gray-500 mt-2">{stats.totalLeases} total leases</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Expiring Soon</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{stats.expiringSoon}</p>
          <p className="text-xs text-orange-600 mt-2">Within 90 days</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Total Payments</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{leases.reduce((sum, l) => sum + l._count.payments, 0)}</p>
          <p className="text-xs text-blue-600 mt-2">All lease payments</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Total Annual Value</p>
          <p className="text-3xl font-bold text-green-600 mt-2">KES {stats.totalAnnualValue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">Combined rental value</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by tenant, landlord, property, or unit..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({stats.totalLeases})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'ACTIVE'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active ({stats.activeLeases})
            </button>
            <button
              onClick={() => setStatusFilter('EXPIRED')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'EXPIRED'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Expired ({leases.filter(l => l.status === 'EXPIRED').length})
            </button>
            <button
              onClick={() => setStatusFilter('TERMINATED')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'TERMINATED'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Terminated ({leases.filter(l => l.status === 'TERMINATED').length})
            </button>
          </div>
        </div>
      </div>

      {/* Leases Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lease ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Landlord
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property / Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Rent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <tr key={lease.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {lease.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Link href={`/admin/tenants/${lease.tenant.id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                          {lease.tenant.name}
                        </Link>
                        <p className="text-xs text-gray-500">{lease._count.payments} payments</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Link href={`/admin/landlords/${lease.property.landlord.id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                          {lease.property.landlord.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link href={`/admin/properties/${lease.property.id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                          {lease.property.name}
                        </Link>
                        <p className="text-xs text-gray-500">{lease.unit || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        KES {Number(lease.monthlyRent).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(lease.startDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(lease.endDate)}
                        {isExpiringSoon && (
                          <p className="text-xs text-orange-600 font-medium mt-1">
                            {daysUntilExpiry} days left
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            lease.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : lease.status === 'EXPIRED'
                              ? 'bg-orange-100 text-orange-800'
                              : lease.status === 'TERMINATED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {lease.status}
                          </span>
                          {isExpiringSoon && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              Expiring Soon
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedLease(lease)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
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
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Lease Agreement Details</h2>
                <button
                  onClick={() => setSelectedLease(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Lease Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Lease ID</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedLease.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <div className="flex gap-2 mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        selectedLease.status === 'Active' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedLease.status}
                      </span>
                      {selectedLease.renewal && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          Renewal Available
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Parties */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Parties</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Tenant</p>
                      <Link href={`/admin/tenants/${selectedLease.tenant.id}`} className="font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                        {selectedLease.tenant.name}
                      </Link>
                      <p className="text-xs text-gray-500">{selectedLease._count.payments} payments</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Landlord</p>
                      <Link href={`/admin/landlords/${selectedLease.property.landlord.id}`} className="font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                        {selectedLease.property.landlord.name}
                      </Link>
                      <p className="text-xs text-gray-500">Property Owner</p>
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Property Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Property</p>
                      <Link href={`/admin/properties/${selectedLease.property.id}`} className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                        {selectedLease.property.name}
                      </Link>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Unit</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedLease.unit || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Financial Terms */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Financial Terms</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Monthly Rent</p>
                      <p className="text-2xl font-bold text-gray-900">KES {Number(selectedLease.monthlyRent).toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Security Deposit</p>
                      <p className="text-2xl font-bold text-gray-900">KES {Number(selectedLease.securityDeposit).toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Annual Value</p>
                      <p className="text-2xl font-bold text-gray-900">KES {(Number(selectedLease.monthlyRent) * 12).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Lease Term */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Lease Term</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDate(selectedLease.startDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">End Date</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDate(selectedLease.endDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Days Remaining</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {getDaysUntilExpiry(selectedLease.endDate)} days
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 flex gap-3">
                  <button
                    onClick={() => setSelectedLease(null)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                  >
                    Close
                  </button>
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
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
