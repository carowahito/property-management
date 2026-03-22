'use client';

import { useState, useEffect } from 'react';

interface PaymentSummary {
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  count: number;
}

interface PayoutSummary {
  totalPaid: number;
  totalPending: number;
  count: number;
}

export default function FinancialReportsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<string>('current');

  useEffect(() => {
    Promise.all([
      fetch('/api/payments?type=RENT&limit=500').then(r => r.json()),
      fetch('/api/payouts?limit=500').then(r => r.json()),
    ])
      .then(([paymentData, payoutData]) => {
        setPayments(paymentData.payments || []);
        setPayouts(payoutData.payouts || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // Filter by time period
  const getDateRange = () => {
    const now = new Date();
    switch (timePeriod) {
      case 'current': {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { start, end, label: now.toLocaleString('en-US', { month: 'long', year: 'numeric' }) };
      }
      case 'last': {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        return { start, end, label: start.toLocaleString('en-US', { month: 'long', year: 'numeric' }) };
      }
      case 'quarter': {
        const start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        return { start, end: now, label: 'Last 3 Months' };
      }
      default: return { start: new Date(0), end: now, label: 'All Time' };
    }
  };

  const dateRange = getDateRange();

  const filteredPayments = payments.filter(p => {
    const due = new Date(p.dueDate);
    return due >= dateRange.start && due <= dateRange.end;
  });

  const filteredPayouts = payouts.filter(p => {
    const created = new Date(p.createdAt);
    return created >= dateRange.start && created <= dateRange.end;
  });

  const paymentStats: PaymentSummary = {
    totalCollected: filteredPayments.filter(p => p.status === 'PAID').reduce((sum: number, p: any) => sum + Number(p.amount), 0),
    totalPending: filteredPayments.filter(p => p.status === 'PENDING').reduce((sum: number, p: any) => sum + Number(p.amount), 0),
    totalOverdue: filteredPayments.filter(p => p.status === 'OVERDUE').reduce((sum: number, p: any) => sum + Number(p.amount), 0),
    count: filteredPayments.length,
  };

  const payoutStats: PayoutSummary = {
    totalPaid: filteredPayouts.filter((p: any) => p.status === 'PAID').reduce((sum: number, p: any) => sum + Number(p.amount), 0),
    totalPending: filteredPayouts.filter((p: any) => p.status === 'PENDING' || p.status === 'PROCESSING').reduce((sum: number, p: any) => sum + Number(p.amount), 0),
    count: filteredPayouts.length,
  };

  const totalRevenue = paymentStats.totalCollected;
  const totalExpenses = payoutStats.totalPaid; // landlord payouts = expenses from management perspective
  const netIncome = totalRevenue - totalExpenses; // retained fees (service charge + management fee)
  const profitMargin = totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : '0.0';

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>;
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-neutral-900'>Financial Reports</h1>
          <p className='text-neutral-600 mt-1'>Revenue and expense overview computed from real transactions</p>
        </div>
      </div>

      <div className='bg-surface shadow rounded-lg p-4'>
        <select
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          className='px-4 py-2 border border-neutral-300 rounded-lg'
        >
          <option value='current'>Current Month</option>
          <option value='last'>Last Month</option>
          <option value='quarter'>Last 3 Months</option>
          <option value='all'>All Time</option>
        </select>
        <span className='ml-3 text-sm text-neutral-500'>{dateRange.label}</span>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Rent Collected</p>
          <p className='text-3xl font-bold text-success-600'>
            KES {totalRevenue.toLocaleString()}
          </p>
          <p className='text-xs text-neutral-500 mt-1'>{paymentStats.count} payments</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Landlord Payouts</p>
          <p className='text-3xl font-bold text-danger-600'>
            KES {totalExpenses.toLocaleString()}
          </p>
          <p className='text-xs text-neutral-500 mt-1'>{payoutStats.count} payouts</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Retained (Fees)</p>
          <p className='text-3xl font-bold text-primary-600'>KES {netIncome.toLocaleString()}</p>
          <p className='text-xs text-neutral-500 mt-1'>Service + management fees</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Fee Margin</p>
          <p className='text-3xl font-bold text-purple-600'>{profitMargin}%</p>
        </div>
      </div>

      {/* Pending / Overdue */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Pending Rent</p>
          <p className='text-2xl font-bold text-yellow-600'>KES {paymentStats.totalPending.toLocaleString()}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Overdue Rent</p>
          <p className='text-2xl font-bold text-danger-600'>KES {paymentStats.totalOverdue.toLocaleString()}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Pending Payouts</p>
          <p className='text-2xl font-bold text-yellow-600'>KES {payoutStats.totalPending.toLocaleString()}</p>
        </div>
      </div>

      {filteredPayments.length === 0 && filteredPayouts.length === 0 && (
        <div className='bg-surface shadow rounded-lg p-12 text-center'>
          <p className='text-neutral-500'>No financial transactions found for this period.</p>
          <p className='text-sm text-neutral-400 mt-2'>Process rent payments to generate financial data.</p>
        </div>
      )}
    </div>
  );
}
