'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatDate } from '@/lib/utils'

interface Payment {
  id: string
  amount: number
  type: string
  method: string
  status: string
  dueDate: string
  paidDate: string | null
  reference: string | null
  month?: string
  tenant: {
    id: string
    name: string
    email: string
  }
  lease: {
    id: string
    property: {
      id: string
      name: string
    }
    unitRef?: {
      id: string
      unitNumber: string
      landlord?: {
        id: string
        name: string
        type?: string
        members?: { id: string; name: string }[]
      }
    }
    landlord?: {
      id: string
      name: string
      type?: string
      members?: { id: string; name: string }[]
    }
  } | null
  property?: { id: string; name: string } | null
  unit?: {
    id: string
    unitNumber: string
    landlord?: {
      id: string
      name: string
      type?: string
      members?: { id: string; name: string }[]
    }
  } | null
}

interface PaymentsResponse {
  payments: Payment[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

async function fetchPayments(): Promise<PaymentsResponse> {
  const response = await fetch('/api/payments')
  if (!response.ok) {
    throw new Error('Failed to fetch payments')
  }
  return response.json()
}

export default function AdminPaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'PAID' | 'PENDING' | 'OVERDUE'>('all')
  const [timePeriod, setTimePeriod] = useState<'all' | 'current' | 'last30' | 'last90' | 'custom'>('current')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['payments', statusFilter],
    queryFn: fetchPayments,
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
        <p className="text-red-800">Failed to load payments. Please try again.</p>
      </div>
    )
  }

  const payments = data?.payments || []

  // Get current month for default filter
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })

  // Filter by time period
  const getFilteredByTime = (payments: Payment[]) => {
    const now = new Date()
    
    switch (timePeriod) {
      case 'current':
        return payments.filter(p => {
          const paymentMonth = new Date(p.dueDate).toLocaleString('en-US', { month: 'long', year: 'numeric' })
          return paymentMonth === currentMonth
        })
      case 'last30':
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return payments.filter(p => new Date(p.dueDate) >= last30Days)
      case 'last90':
        const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        return payments.filter(p => new Date(p.dueDate) >= last90Days)
      case 'custom':
        if (!customStartDate || !customEndDate) return payments
        return payments.filter(p => {
          const dueDate = new Date(p.dueDate)
          return dueDate >= new Date(customStartDate) && dueDate <= new Date(customEndDate)
        })
      default:
        return payments
    }
  }

  const timeFilteredPayments = getFilteredByTime(payments)

  // Calculate statistics
  const paidPayments = timeFilteredPayments.filter(p => p.status === 'PAID')
  const pendingPayments = timeFilteredPayments.filter(p => p.status === 'PENDING')
  const overduePayments = timeFilteredPayments.filter(p => p.status === 'OVERDUE')

  const stats = {
    totalCollected: paidPayments.reduce((sum, p) => sum + Number(p.amount), 0),
    pending: pendingPayments.reduce((sum, p) => sum + Number(p.amount), 0),
    overdue: overduePayments.reduce((sum, p) => sum + Number(p.amount), 0),
    overdueCount: overduePayments.length,
    totalTransactions: timeFilteredPayments.length,
    collectionRate: timeFilteredPayments.length > 0 ? (paidPayments.length / timeFilteredPayments.length) * 100 : 0,
  }

  // Filter payments by search and status
  const filteredPayments = timeFilteredPayments.filter(payment => {
    const matchesSearch =
      payment.tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.lease?.property.name || payment.property?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.reference && payment.reference.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-neutral-900">Payments</h1>
        <p className="text-neutral-600 mt-2">Track and manage all payment transactions across all properties</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface rounded-lg border border-neutral-200 p-4 md:p-6">
          <p className="text-sm text-neutral-600">Total Collected</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">KES {stats.totalCollected.toLocaleString()}</p>
          <p className="text-xs text-success-600 mt-2">This month</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-4 md:p-6">
          <p className="text-sm text-neutral-600">Pending Payments</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">KES {stats.pending.toLocaleString()}</p>
          <p className="text-xs text-neutral-500 mt-2">Awaiting payment</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-4 md:p-6">
          <p className="text-sm text-neutral-600">Overdue</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">KES {stats.overdue.toLocaleString()}</p>
          <p className="text-xs text-warning-600 mt-2">{stats.overdueCount} overdue</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-4 md:p-6">
          <p className="text-sm text-neutral-600">Collection Rate</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.collectionRate.toFixed(1)}%</p>
          <p className="text-xs text-neutral-500 mt-2">{paidPayments.length} of {stats.totalTransactions} paid</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-lg border border-neutral-200 p-3 md:p-4 space-y-4">
        {/* Time Period Filter */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-4 items-stretch sm:items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Time Period</label>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as any)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="current">Current Month ({currentMonth})</option>
              <option value="last30">Last 30 Days</option>
              <option value="last90">Last 90 Days</option>
              <option value="all">All Time</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {timePeriod === 'custom' && (
            <>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-neutral-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-neutral-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </>
          )}
        </div>

        {/* Search and Status Filter */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by tenant, landlord, or transaction ID..."
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
              All ({stats.totalTransactions})
            </button>
            <button
              onClick={() => setStatusFilter('PAID')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'PAID'
                  ? 'bg-success-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Paid ({paidPayments.length})
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'PENDING'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Pending ({pendingPayments.length})
            </button>
            <button
              onClick={() => setStatusFilter('OVERDUE')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'OVERDUE'
                  ? 'bg-danger-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Overdue ({overduePayments.length})
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-surface rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden lg:table-cell">
                  Transaction ID
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden lg:table-cell">
                  Landlord
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell">
                  Property
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell">
                  Month
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden lg:table-cell">
                  Method
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell">
                  Date
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-neutral-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-neutral-500">
                    <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mt-2 text-sm">No transactions found</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-neutral-50">
                    <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm font-medium text-neutral-900 hidden lg:table-cell">
                      {payment.reference || payment.id.slice(0, 8)}
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-neutral-900">
                      <Link href={`/admin/tenants/${payment.tenant.id}`} className="text-primary-600 hover:text-primary-800 hover:underline">
                        {payment.tenant.name}
                      </Link>
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4 text-sm text-neutral-900 hidden lg:table-cell">
                      {(() => {
                        const ll = payment.lease?.unitRef?.landlord || payment.lease?.landlord || payment.unit?.landlord
                        if (!ll) return 'N/A'
                        return (
                          <div>
                            <Link href={`/admin/landlords/${ll.id}`} className="text-primary-600 hover:text-primary-800 hover:underline">
                              {ll.name}
                            </Link>
                            {ll.type === 'JOINT_OWNERSHIP' && (ll.members?.length ?? 0) > 0 && (
                              <p className="text-xs text-neutral-400">& {ll.members!.map(m => m.name).join(' & ')}</p>
                            )}
                          </div>
                        )
                      })()}
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm hidden md:table-cell">
                      {(() => {
                        const property = payment.lease?.property || payment.property
                        if (!property) return <span className="text-neutral-400">—</span>
                        return (
                          <Link href={`/admin/properties/${property.id}`} className="text-primary-600 hover:text-primary-800 hover:underline">
                            {property.name}
                          </Link>
                        )
                      })()}
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm font-semibold text-neutral-900">
                      KES {Number(payment.amount).toLocaleString()}
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-neutral-500 hidden md:table-cell">
                      {new Date(payment.dueDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-neutral-500 hidden lg:table-cell">
                      {payment.method}
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === 'PAID'
                          ? 'bg-success-100 text-green-800'
                          : payment.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-danger-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-neutral-500 hidden md:table-cell">
                      {formatDate(payment.paidDate || payment.dueDate)}
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-neutral-900">Payment Details</h2>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-600">Transaction ID</p>
                    <p className="text-lg font-semibold text-neutral-900">{selectedPayment.reference || selectedPayment.id.slice(0, 8)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Status</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedPayment.status === 'COMPLETED'
                        ? 'bg-success-100 text-green-800'
                        : selectedPayment.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-danger-100 text-red-800'
                    }`}>
                      {selectedPayment.status === 'COMPLETED' ? 'PAID' : selectedPayment.status}
                    </span>
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-4">
                  <h3 className="font-semibold text-neutral-900 mb-3">Payment Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-neutral-600">Amount</p>
                      <p className="text-xl font-bold text-neutral-900">KES {Number(selectedPayment.amount).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Payment Method</p>
                      <p className="text-lg font-semibold text-neutral-900">{selectedPayment.method}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Period</p>
                      <p className="text-lg font-semibold text-neutral-900">{new Date(selectedPayment.dueDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Payment Date</p>
                      <p className="text-lg font-semibold text-neutral-900">
                        {formatDate(selectedPayment.paidDate || selectedPayment.dueDate)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-4">
                  <h3 className="font-semibold text-neutral-900 mb-3">Parties Involved</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <div>
                        <p className="text-sm text-neutral-600">Tenant</p>
                        <Link href={`/admin/tenants/${selectedPayment.tenant.id}`} className="font-semibold text-primary-600 hover:text-primary-800 hover:underline">
                          {selectedPayment.tenant.name}
                        </Link>
                        <p className="text-xs text-neutral-500">{selectedPayment.tenant.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <div>
                        <p className="text-sm text-neutral-600">Landlord</p>
                        {(() => {
                          const ll = selectedPayment.lease?.unitRef?.landlord || selectedPayment.lease?.landlord || selectedPayment.unit?.landlord
                          if (!ll) return <p className="font-semibold text-neutral-900">N/A</p>
                          return (
                            <>
                              <Link href={`/admin/landlords/${ll.id}`} className="font-semibold text-primary-600 hover:text-primary-800 hover:underline">
                                {ll.name}
                              </Link>
                              {ll.type === 'JOINT_OWNERSHIP' && (ll.members?.length ?? 0) > 0 && (
                                <p className="text-xs text-neutral-500">& {ll.members!.map(m => m.name).join(' & ')}</p>
                              )}
                            </>
                          )
                        })()}
                        <p className="text-xs text-neutral-500">Property Owner</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <div>
                        <p className="text-sm text-neutral-600">Property</p>
                        {(() => {
                          const property = selectedPayment.lease?.property || selectedPayment.property
                          if (!property) return <p className="font-semibold text-neutral-900">N/A</p>
                          return (
                            <Link href={`/admin/properties/${property.id}`} className="text-primary-600 hover:text-primary-800 hover:underline font-semibold">
                              {property.name}
                            </Link>
                          )
                        })()}
                        <p className="text-xs text-neutral-500">
                          {selectedPayment.lease ? `Lease ID: ${selectedPayment.lease.id.slice(0, 8)}` : 'No lease (recorded before signing)'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-4">
                  <button
                    onClick={() => setSelectedPayment(null)}
                    className="w-full px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 font-medium"
                  >
                    Close
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
