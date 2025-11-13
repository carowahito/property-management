'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function TenantPaymentsPage() {
  const [filter, setFilter] = useState('all')

  // Mock data
  const payments = [
    { id: 1, date: '2025-11-05', amount: 45000, status: 'Pending', method: '-', dueDate: '2025-11-05', lateFee: 0 },
    { id: 2, date: '2025-10-05', amount: 45000, status: 'Paid', method: 'M-Pesa', dueDate: '2025-10-05', lateFee: 0, paidDate: '2025-10-04' },
    { id: 3, date: '2025-09-05', amount: 45000, status: 'Paid', method: 'M-Pesa', dueDate: '2025-09-05', lateFee: 0, paidDate: '2025-09-03' },
    { id: 4, date: '2025-08-05', amount: 45000, status: 'Paid', method: 'Bank Transfer', dueDate: '2025-08-05', lateFee: 0, paidDate: '2025-08-05' },
    { id: 5, date: '2025-07-05', amount: 45000, status: 'Paid', method: 'Bank Transfer', dueDate: '2025-07-05', lateFee: 1500, paidDate: '2025-07-08' },
    { id: 6, date: '2025-06-05', amount: 45000, status: 'Paid', method: 'M-Pesa', dueDate: '2025-06-05', lateFee: 0, paidDate: '2025-06-04' },
  ]

  const filteredPayments = payments.filter((p) => {
    if (filter === 'all') return true
    if (filter === 'paid') return p.status === 'Paid'
    if (filter === 'pending') return p.status === 'Pending'
    return true
  })

  const totalPaid = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount + p.lateFee, 0)
  const totalPending = payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
        <Link
          href="/tenant/payments/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Make Payment
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <p className="text-sm font-medium text-gray-500">Total Paid (This Year)</p>
            <p className="mt-1 text-2xl font-semibold text-green-600">
              KES {totalPaid.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <p className="text-sm font-medium text-gray-500">Pending Payments</p>
            <p className="mt-1 text-2xl font-semibold text-red-600">
              KES {totalPending.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <p className="text-sm font-medium text-gray-500">Monthly Rent</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">KES 45,000</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setFilter('all')}
              className={`${
                filter === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              All Payments
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`${
                filter === 'paid'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Paid
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`${
                filter === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Pending
            </button>
          </nav>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Late Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.dueDate}
                    {payment.paidDate && (
                      <p className="text-xs text-gray-500">Paid: {payment.paidDate}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    KES {payment.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.lateFee > 0 ? (
                      <span className="text-red-600">KES {payment.lateFee.toLocaleString()}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === 'Paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {payment.status === 'Pending' ? (
                      <Link
                        href={`/tenant/payments/${payment.id}/pay`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Pay Now
                      </Link>
                    ) : (
                      <Link
                        href={`/tenant/payments/${payment.id}/receipt`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Receipt
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Statistics */}
      <div className="mt-6 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Payments Made</p>
            <p className="text-xl font-semibold text-gray-900">{payments.filter(p => p.status === 'Paid').length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">On-Time Payments</p>
            <p className="text-xl font-semibold text-green-600">
              {payments.filter(p => p.status === 'Paid' && p.lateFee === 0).length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Late Payments</p>
            <p className="text-xl font-semibold text-red-600">
              {payments.filter(p => p.lateFee > 0).length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Average Payment Time</p>
            <p className="text-xl font-semibold text-gray-900">2 days early</p>
          </div>
        </div>
      </div>
    </div>
  )
}
