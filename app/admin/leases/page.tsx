'use client'

import { useState } from 'react'
import { mockLeases, getTenantById, getLandlordById, getPropertyById } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'

export default function AdminLeasesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Expiring' | 'Renewal'>('all')
  const [selectedLease, setSelectedLease] = useState<typeof mockLeases[0] | null>(null)

  // Calculate statistics
  const now = new Date()
  const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

  const stats = {
    activeLeases: mockLeases.filter(l => l.status === 'Active').length,
    expiringSoon: mockLeases.filter(l => {
      const endDate = new Date(l.endDate)
      return endDate > now && endDate <= ninetyDaysFromNow && l.status === 'Active'
    }).length,
    renewalsPending: mockLeases.filter(l => l.renewal).length,
    totalAnnualValue: mockLeases.reduce((sum, l) => sum + (l.monthlyRent * 12), 0),
  }

  // Filter leases
  const filteredLeases = mockLeases.filter(lease => {
    const matchesSearch = 
      lease.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lease.landlordName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lease.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lease.unit.toLowerCase().includes(searchTerm.toLowerCase())
    
    const endDate = new Date(lease.endDate)
    const isExpiringSoon = endDate > now && endDate <= ninetyDaysFromNow

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'Active' && lease.status === 'Active') ||
      (statusFilter === 'Expiring' && isExpiringSoon) ||
      (statusFilter === 'Renewal' && lease.renewal)

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
          <p className="text-xs text-gray-500 mt-2">{mockLeases.length} total leases</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Expiring Soon</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.expiringSoon}</p>
          <p className="text-xs text-orange-600 mt-2">Within 90 days</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Renewals Pending</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.renewalsPending}</p>
          <p className="text-xs text-blue-600 mt-2">Ready for renewal</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Total Annual Value</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">KES {stats.totalAnnualValue.toLocaleString()}</p>
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
              All ({mockLeases.length})
            </button>
            <button
              onClick={() => setStatusFilter('Active')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'Active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active ({stats.activeLeases})
            </button>
            <button
              onClick={() => setStatusFilter('Expiring')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'Expiring'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Expiring ({stats.expiringSoon})
            </button>
            <button
              onClick={() => setStatusFilter('Renewal')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'Renewal'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Renewal ({stats.renewalsPending})
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
                        {lease.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lease.tenantName}
                        <p className="text-xs text-gray-500">ID: {lease.tenantId}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lease.landlordName}
                        <p className="text-xs text-gray-500">ID: {lease.landlordId}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lease.property}
                        <p className="text-xs text-gray-500">Unit {lease.unit}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        KES {lease.monthlyRent.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(lease.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(lease.endDate).toLocaleDateString()}
                        {isExpiringSoon && (
                          <p className="text-xs text-orange-600 font-medium mt-1">
                            {daysUntilExpiry} days left
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            lease.status === 'Active' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {lease.status}
                          </span>
                          {lease.renewal && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Renewal
                            </span>
                          )}
                          {isExpiringSoon && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              Expiring
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
                      <p className="font-semibold text-gray-900">{selectedLease.tenantName}</p>
                      <p className="text-xs text-gray-500">ID: {selectedLease.tenantId}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Landlord</p>
                      <p className="font-semibold text-gray-900">{selectedLease.landlordName}</p>
                      <p className="text-xs text-gray-500">ID: {selectedLease.landlordId}</p>
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Property Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Property</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedLease.property}</p>
                      <p className="text-xs text-gray-500">ID: {selectedLease.propertyId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Unit</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedLease.unit}</p>
                    </div>
                  </div>
                </div>

                {/* Financial Terms */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Financial Terms</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Monthly Rent</p>
                      <p className="text-2xl font-bold text-gray-900">KES {selectedLease.monthlyRent.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Annual Value</p>
                      <p className="text-2xl font-bold text-gray-900">KES {(selectedLease.monthlyRent * 12).toLocaleString()}</p>
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
                        {new Date(selectedLease.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">End Date</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(selectedLease.endDate).toLocaleDateString()}
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

                {/* Documents */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Documents</h3>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <div className="flex items-center">
                      <svg className="h-8 w-8 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900">Lease Agreement</p>
                        <p className="text-xs text-gray-500">{selectedLease.termsFile}</p>
                      </div>
                    </div>
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 flex gap-3">
                  <button
                    onClick={() => setSelectedLease(null)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                  >
                    Close
                  </button>
                  {selectedLease.renewal && (
                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                      Process Renewal
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
