'use client';

import { useState } from 'react';

interface Payment {
  id: string;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue' | 'partial';
  paymentMethod?: string;
  transactionId?: string;
}

export default function RentPaymentsPage() {
  const [payments] = useState<Payment[]>([
    {
      id: '1',
      tenantName: 'John Mwangi',
      propertyName: 'Sunset Apartments',
      unitNumber: '5A',
      amount: 45000,
      dueDate: '2024-11-01',
      paidDate: '2024-11-01',
      status: 'paid',
      paymentMethod: 'M-PESA',
      transactionId: 'QH12X3Y4Z5',
    },
    {
      id: '2',
      tenantName: 'Jane Achieng',
      propertyName: 'Highland House',
      unitNumber: '12',
      amount: 75000,
      dueDate: '2024-11-05',
      status: 'pending',
    },
    {
      id: '3',
      tenantName: 'Peter Omondi',
      propertyName: 'Vista Plaza Office',
      unitNumber: '8B',
      amount: 120000,
      dueDate: '2024-10-01',
      status: 'overdue',
    },
    {
      id: '4',
      tenantName: 'Mary Wanjiru',
      propertyName: 'Garden Estate',
      unitNumber: '3C',
      amount: 60000,
      dueDate: '2024-11-10',
      paidDate: '2024-11-10',
      status: 'paid',
      paymentMethod: 'Bank Transfer',
      transactionId: 'BT789012',
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredPayments = payments.filter(
    (payment) => filterStatus === 'all' || payment.status === filterStatus
  );

  const stats = {
    totalPayments: payments.length,
    paidAmount: payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: payments
      .filter((p) => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0),
    overdueAmount: payments
      .filter((p) => p.status === 'overdue')
      .reduce((sum, p) => sum + p.amount, 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'partial':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Rent Payments</h1>
          <p className='text-gray-600 mt-1'>Track and manage rent payment transactions</p>
        </div>
        <button className='bg-blue-600 hover:bg-blue-700'>+ Record Payment</button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Total Payments</p>
          <p className='text-3xl font-bold text-gray-900'>{stats.totalPayments}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Collected</p>
          <p className='text-3xl font-bold text-green-600'>
            KES {stats.paidAmount.toLocaleString()}
          </p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Pending</p>
          <p className='text-3xl font-bold text-yellow-600'>
            KES {stats.pendingAmount.toLocaleString()}
          </p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Overdue</p>
          <p className='text-3xl font-bold text-red-600'>
            KES {stats.overdueAmount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className='bg-white shadow rounded-lg p-4'>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        >
          <option value='all'>All Payments</option>
          <option value='paid'>Paid</option>
          <option value='pending'>Pending</option>
          <option value='overdue'>Overdue</option>
          <option value='partial'>Partial</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className='bg-white shadow rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Tenant
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Property/Unit
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Amount
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Due Date
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Paid Date
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Payment Method
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Status
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {filteredPayments.map((payment) => (
              <tr key={payment.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm font-medium text-gray-900'>{payment.tenantName}</div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-900'>{payment.propertyName}</div>
                  <div className='text-sm text-gray-500'>Unit {payment.unitNumber}</div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900'>
                  KES {payment.amount.toLocaleString()}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {payment.dueDate}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {payment.paidDate || <span className='text-gray-400'>—</span>}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {payment.paymentMethod || <span className='text-gray-400'>—</span>}
                  {payment.transactionId && (
                    <div className='text-xs text-gray-500'>{payment.transactionId}</div>
                  )}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}
                  >
                    {payment.status}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2'>
                  <button  >
                    View
                  </button>
                  {payment.status !== 'paid' && (
                    <button   className='text-green-600'>
                      Pay
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
