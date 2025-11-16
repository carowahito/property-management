'use client'

import { useState } from 'react'

interface Payment {
  id: string
  jobId: string
  jobDescription: string
  property: string
  amount: number
  paidAmount: number
  paymentDate?: string
  dueDate: string
  status: 'Pending' | 'Partial' | 'Paid' | 'Overdue'
  method?: 'Bank Transfer' | 'M-Pesa' | 'Check' | 'Cash'
  reference?: string
}

export default function VendorPayments() {
  const [activeTab, setActiveTab] = useState<'pending' | 'paid'>('pending')

  // Mock data
  const payments: Payment[] = [
    {
      id: 'PAY-001',
      jobId: 'JOB-044',
      jobDescription: 'Main Line Leak Repair',
      property: 'Skyline Apartments',
      amount: 85000,
      paidAmount: 85000,
      paymentDate: '2025-11-12',
      dueDate: '2025-11-12',
      status: 'Paid',
      method: 'Bank Transfer',
      reference: 'BT-2025-0891'
    },
    {
      id: 'PAY-002',
      jobId: 'JOB-045',
      jobDescription: 'Toilet Flush Mechanism Repair',
      property: 'Riverside Towers',
      amount: 4500,
      paidAmount: 4500,
      paymentDate: '2025-11-14',
      dueDate: '2025-11-14',
      status: 'Paid',
      method: 'M-Pesa',
      reference: 'SKL9043HT2'
    },
    {
      id: 'PAY-003',
      jobId: 'JOB-046',
      jobDescription: 'Shower Drain Unclogging',
      property: 'Garden View Estate',
      amount: 6000,
      paidAmount: 6000,
      paymentDate: '2025-11-15',
      dueDate: '2025-11-15',
      status: 'Paid',
      method: 'Bank Transfer',
      reference: 'BT-2025-0905'
    },
    {
      id: 'PAY-004',
      jobId: 'JOB-047',
      jobDescription: 'Pipe Leak Repair',
      property: 'Skyline Apartments',
      amount: 15000,
      paidAmount: 0,
      dueDate: '2025-11-17',
      status: 'Pending',
    },
    {
      id: 'PAY-005',
      jobId: 'JOB-048',
      jobDescription: 'Water Heater Installation',
      property: 'Riverside Towers',
      amount: 35000,
      paidAmount: 0,
      dueDate: '2025-11-20',
      status: 'Pending',
    },
    {
      id: 'PAY-006',
      jobId: 'JOB-049',
      jobDescription: 'Bathroom Faucet Replacement',
      property: 'Garden View Estate',
      amount: 8500,
      paidAmount: 0,
      dueDate: '2025-11-18',
      status: 'Pending',
    }
  ]

  const pendingPayments = payments.filter(p => p.status === 'Pending' || p.status === 'Partial')
  const paidPayments = payments.filter(p => p.status === 'Paid')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800'
      case 'Partial': return 'bg-yellow-100 text-yellow-800'
      case 'Pending': return 'bg-orange-100 text-orange-800'
      case 'Overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredPayments = activeTab === 'pending' ? pendingPayments : paidPayments

  const totalPending = pendingPayments.reduce((sum, p) => sum + (p.amount - p.paidAmount), 0)
  const totalPaid = paidPayments.reduce((sum, p) => sum + p.paidAmount, 0)
  const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">Track your earnings and payment status</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Earnings</p>
          <p className="text-2xl font-bold text-gray-900">KES {(totalEarnings / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-600">Paid</p>
          <p className="text-2xl font-bold text-green-600">KES {(totalPaid / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-orange-600">KES {(totalPending / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-600">Payment Rate</p>
          <p className="text-2xl font-bold text-blue-600">
            {totalEarnings > 0 ? ((totalPaid / totalEarnings) * 100).toFixed(0) : 0}%
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Payments ({pendingPayments.length})
            </button>
            <button
              onClick={() => setActiveTab('paid')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'paid'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Paid ({paidPayments.length})
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-5xl mb-4">💰</div>
              <p className="text-gray-500">No {activeTab} payments</p>
            </div>
          ) : (
            filteredPayments.map((payment) => (
              <div key={payment.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{payment.id}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-1">
                      Job: {payment.jobId} - {payment.jobDescription}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">Property: {payment.property}</p>
                    
                    {payment.method && (
                      <div className="flex items-center gap-4 text-sm mb-2">
                        <span className="text-gray-600">Method:</span>
                        <span className="font-medium">{payment.method}</span>
                        {payment.reference && (
                          <>
                            <span className="text-gray-600">Reference:</span>
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{payment.reference}</span>
                          </>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Due: {new Date(payment.dueDate).toLocaleDateString()}</span>
                      {payment.paymentDate && (
                        <span className="text-green-600">Paid: {new Date(payment.paymentDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 text-right">
                    <p className="text-2xl font-bold text-gray-900">KES {payment.amount.toLocaleString()}</p>
                    {payment.status === 'Partial' && (
                      <p className="text-sm text-gray-600 mt-1">
                        Paid: KES {payment.paidAmount.toLocaleString()}
                      </p>
                    )}
                    {payment.status === 'Paid' && (
                      <p className="text-sm text-green-600 mt-1">✓ Payment Received</p>
                    )}
                    {payment.status === 'Pending' && (
                      <p className="text-sm text-orange-600 mt-1">Awaiting Payment</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Invoiced:</span>
            <span className="font-semibold text-gray-900">KES {totalEarnings.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Paid:</span>
            <span className="font-semibold text-green-600">KES {totalPaid.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t">
            <span className="text-gray-900 font-medium">Outstanding Balance:</span>
            <span className="font-bold text-orange-600 text-lg">KES {totalPending.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
