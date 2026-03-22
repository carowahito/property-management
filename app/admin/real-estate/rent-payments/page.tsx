'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';

interface Payment {
  id: string;
  amount: string;
  dueDate: string;
  paidDate?: string | null;
  status: string;
  method: string;
  reference?: string | null;
  tenant: { id: string; name: string };
  lease: {
    id: string;
    property: { id: string; name: string };
    unitRef?: { id: string; unitNumber: string } | null;
  };
}

export default function RentPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetch('/api/payments?type=RENT&limit=200')
      .then((r) => r.json())
      .then((data) => {
        setPayments(data.payments || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const filteredPayments = payments.filter(
    (payment) => filterStatus === 'all' || payment.status === filterStatus
  );

  const stats = {
    totalPayments: payments.length,
    paidAmount: payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0),
    pendingAmount: payments
      .filter((p) => p.status === 'PENDING')
      .reduce((sum, p) => sum + Number(p.amount), 0),
    overdueAmount: payments
      .filter((p) => p.status === 'OVERDUE')
      .reduce((sum, p) => sum + Number(p.amount), 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-success-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE':
        return 'bg-danger-100 text-red-800';
      case 'FAILED':
        return 'bg-neutral-100 text-neutral-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600'></div>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-neutral-900'>Rent Payments</h1>
          <p className='text-neutral-600 mt-1'>Track and manage rent payment transactions</p>
        </div>
        <button className='bg-primary-600 hover:bg-primary-700'>+ Record Payment</button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Total Payments</p>
          <p className='text-3xl font-bold text-neutral-900'>{stats.totalPayments}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Collected</p>
          <p className='text-3xl font-bold text-success-600'>
            KES {stats.paidAmount.toLocaleString()}
          </p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Pending</p>
          <p className='text-3xl font-bold text-yellow-600'>
            KES {stats.pendingAmount.toLocaleString()}
          </p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Overdue</p>
          <p className='text-3xl font-bold text-danger-600'>
            KES {stats.overdueAmount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className='bg-surface shadow rounded-lg p-4'>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className='px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
        >
          <option value='all'>All Payments</option>
          <option value='PAID'>Paid</option>
          <option value='PENDING'>Pending</option>
          <option value='OVERDUE'>Overdue</option>
          <option value='FAILED'>Failed</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className='bg-surface shadow rounded-lg overflow-hidden'>
        {filteredPayments.length === 0 ? (
          <div className='p-12 text-center'>
            <p className='text-neutral-500'>No payments found.</p>
            <p className='text-sm text-neutral-400 mt-2'>Record a payment to get started.</p>
          </div>
        ) : (
          <table className='min-w-full divide-y divide-neutral-200'>
            <thead className='bg-neutral-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                  Tenant
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                  Property/Unit
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                  Amount
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                  Due Date
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                  Paid Date
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                  Payment Method
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-surface divide-y divide-neutral-200'>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className='hover:bg-neutral-50'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm font-medium text-neutral-900'>
                      {payment.tenant?.name || '\u2014'}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-neutral-900'>
                      {payment.lease?.property?.name || '\u2014'}
                    </div>
                    <div className='text-sm text-neutral-500'>
                      {payment.lease?.unitRef?.unitNumber
                        ? `Unit ${payment.lease.unitRef.unitNumber}`
                        : ''}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-semibold text-neutral-900'>
                    KES {Number(payment.amount).toLocaleString()}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-neutral-900'>
                    {formatDate(payment.dueDate)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-neutral-900'>
                    {payment.paidDate ? (
                      formatDate(payment.paidDate)
                    ) : (
                      <span className='text-neutral-400'>{'\u2014'}</span>
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-neutral-900'>
                    {payment.method || <span className='text-neutral-400'>{'\u2014'}</span>}
                    {payment.reference && (
                      <div className='text-xs text-neutral-500'>{payment.reference}</div>
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-neutral-500 space-x-2'>
                    <button>View</button>
                    {payment.status !== 'PAID' && (
                      <button className='text-success-600'>Pay</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
