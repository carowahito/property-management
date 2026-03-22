'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface Payment {
  id: string;
  amount: string;
  type: string;
  method: string;
  status: string;
  dueDate: string;
  paidDate?: string;
  reference?: string;
  tenant: { id: string; name: string; email: string };
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
  const [timePeriod, setTimePeriod] = useState<string>('current');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    fetch('/api/payments?type=RENT&limit=200')
      .then(r => r.json())
      .then(data => { setPayments(data.payments || []); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  // Filter by time period
  const getDateRange = () => {
    const now = new Date();
    switch (timePeriod) {
      case 'current': {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { start, end };
      }
      case 'last30': {
        const start = new Date(now);
        start.setDate(start.getDate() - 30);
        return { start, end: now };
      }
      case 'last90': {
        const start = new Date(now);
        start.setDate(start.getDate() - 90);
        return { start, end: now };
      }
      case 'custom': {
        if (customStartDate && customEndDate) {
          return { start: new Date(customStartDate), end: new Date(customEndDate) };
        }
        return null;
      }
      default: return null; // 'all' — no filter
    }
  };

  const dateRange = getDateRange();
  const filteredPayments = payments.filter(p => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    if (!matchesStatus) return false;
    if (dateRange) {
      const due = new Date(p.dueDate);
      return due >= dateRange.start && due <= dateRange.end;
    }
    return true;
  });

  const stats = {
    totalPayments: filteredPayments.length,
    paidAmount: filteredPayments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + Number(p.amount), 0),
    pendingAmount: filteredPayments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + Number(p.amount), 0),
    overdueAmount: filteredPayments.filter(p => p.status === 'OVERDUE').reduce((sum, p) => sum + Number(p.amount), 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-success-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE': return 'bg-danger-100 text-red-800';
      case 'PARTIAL': return 'bg-primary-100 text-primary-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const formatMethod = (method: string) => {
    switch (method) {
      case 'MPESA': return 'M-PESA';
      case 'BANK_TRANSFER': return 'Bank Transfer';
      case 'CASH': return 'Cash';
      case 'CHEQUE': return 'Cheque';
      default: return method;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>;
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-neutral-900'>Rent Payments</h1>
          <p className='text-neutral-600 mt-1'>Track and manage rent payment transactions</p>
        </div>
        <Button variant="primary" size="lg">+ Record Payment</Button>
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
      <div className='bg-surface shadow rounded-lg p-4 space-y-4'>
        <div className='flex flex-wrap gap-4 items-end'>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Time Period</label>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500'
            >
              <option value='current'>Current Month</option>
              <option value='last30'>Last 30 Days</option>
              <option value='last90'>Last 90 Days</option>
              <option value='all'>All Time</option>
              <option value='custom'>Custom Range</option>
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
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-neutral-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </>
          )}

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Payment Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500'
            >
              <option value='all'>All Payments</option>
              <option value='PAID'>Paid</option>
              <option value='PENDING'>Pending</option>
              <option value='OVERDUE'>Overdue</option>
              <option value='PARTIAL'>Partial</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className='bg-surface shadow rounded-lg overflow-hidden'>
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500">No rent payments found for this period</p>
          </div>
        ) : (
          <table className='min-w-full divide-y divide-neutral-200'>
            <thead className='bg-neutral-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>Tenant</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>Property/Unit</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>Amount</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>Due Date</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>Paid Date</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>Payment Method</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>Status</th>
              </tr>
            </thead>
            <tbody className='bg-surface divide-y divide-neutral-200'>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className='hover:bg-neutral-50'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <Link href={`/admin/tenants/${payment.tenant.id}`} className='text-sm font-medium text-primary-600 hover:text-primary-800 hover:underline'>
                      {payment.tenant.name}
                    </Link>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm'>
                      <Link href={`/admin/properties/${payment.lease.property.id}`} className="text-primary-600 hover:text-primary-800 hover:underline">
                        {payment.lease.property.name}
                      </Link>
                    </div>
                    {payment.lease.unitRef && (
                      <div className='text-sm text-neutral-500'>Unit {payment.lease.unitRef.unitNumber}</div>
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-semibold text-neutral-900'>
                    KES {Number(payment.amount).toLocaleString()}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-neutral-900'>
                    {formatDate(payment.dueDate)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-neutral-900'>
                    {payment.paidDate ? formatDate(payment.paidDate) : <span className='text-neutral-400'>—</span>}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-neutral-900'>
                    {formatMethod(payment.method)}
                    {payment.reference && (
                      <div className='text-xs text-neutral-500'>{payment.reference}</div>
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
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
