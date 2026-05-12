'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TimeFilter } from '@/components/shared/TimeFilter';
import { formatDate } from '@/lib/utils';

interface Payout {
  id: string;
  amount: string;
  period: string;
  status: string;
  method: string;
  reference?: string;
  paidDate?: string;
  createdAt: string;
  landlord: { id: string; name: string; email: string; bankName?: string; bankAccount?: string };
  unit: { id: string; unitNumber: string; property: { id: string; name: string } } | null;
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [timePeriod, setTimePeriod] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    fetch('/api/payouts?limit=200')
      .then(r => r.json())
      .then(data => { setPayouts(data.payouts || []); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  // Date range filtering
  const getDateRange = () => {
    const now = new Date();
    switch (timePeriod) {
      case 'current': {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { start, end };
      }
      case 'last30': {
        const start = new Date(now); start.setDate(start.getDate() - 30);
        return { start, end: now };
      }
      case 'last90': {
        const start = new Date(now); start.setDate(start.getDate() - 90);
        return { start, end: now };
      }
      case 'custom': {
        if (customStartDate && customEndDate) return { start: new Date(customStartDate), end: new Date(customEndDate) };
        return null;
      }
      default: return null;
    }
  };

  const dateRange = getDateRange();
  const filteredPayouts = payouts.filter(p => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    if (!matchesStatus) return false;
    if (dateRange) {
      const created = new Date(p.createdAt);
      return created >= dateRange.start && created <= dateRange.end;
    }
    return true;
  });

  const stats = {
    totalPending: filteredPayouts.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + Number(p.amount), 0),
    totalPaid: filteredPayouts.filter(p => p.status === 'PAID').reduce((sum, p) => sum + Number(p.amount), 0),
    pendingCount: filteredPayouts.filter(p => p.status === 'PENDING').length,
    totalCount: filteredPayouts.length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-primary-100 text-primary-800';
      case 'PAID': return 'bg-success-100 text-green-800';
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
          <h1 className='text-3xl font-bold text-neutral-900'>Landlord Payouts</h1>
          <p className='text-neutral-600 mt-1'>Manage payout schedules and track commission deductions</p>
        </div>
        <Button variant="primary" size="lg">+ Process Payout</Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Pending Payouts</p>
          <p className='text-3xl font-bold text-yellow-600'>KES {stats.totalPending.toLocaleString()}</p>
          <p className='text-xs text-neutral-500 mt-1'>{stats.pendingCount} payouts</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Total Paid</p>
          <p className='text-3xl font-bold text-success-600'>KES {stats.totalPaid.toLocaleString()}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>All Payouts</p>
          <p className='text-3xl font-bold text-primary-600'>{stats.totalCount}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Total Value</p>
          <p className='text-3xl font-bold text-purple-600'>
            KES {filteredPayouts.reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className='bg-surface shadow rounded-lg p-4 space-y-4'>
        <div className='flex flex-wrap gap-4 items-end'>
          <TimeFilter
            timePeriod={timePeriod}
            setTimePeriod={setTimePeriod}
            customStartDate={customStartDate}
            setCustomStartDate={setCustomStartDate}
            customEndDate={customEndDate}
            setCustomEndDate={setCustomEndDate}
          />
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500'
            >
              <option value='all'>All Status</option>
              <option value='PENDING'>Pending</option>
              <option value='PROCESSING'>Processing</option>
              <option value='PAID'>Paid</option>
            </select>
          </div>
        </div>
      </div>

      <div className='bg-surface shadow rounded-lg overflow-hidden'>
        {filteredPayouts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500">No payouts found</p>
          </div>
        ) : (
          <table className='min-w-full divide-y divide-neutral-200'>
            <thead className='bg-neutral-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>Landlord</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>Property / Unit</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>Period</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>Amount</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>Method</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>Paid Date</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>Status</th>
              </tr>
            </thead>
            <tbody className='bg-surface divide-y divide-neutral-200'>
              {filteredPayouts.map((payout) => (
                <tr key={payout.id} className='hover:bg-neutral-50'>
                  <td className='px-6 py-4 text-sm font-medium'>
                    <Link href={`/admin/landlords/${payout.landlord.id}`} className='text-primary-600 hover:text-primary-800 hover:underline'>
                      {payout.landlord.name}
                    </Link>
                  </td>
                  <td className='px-6 py-4 text-sm'>
                    {payout.unit ? (
                      <>
                        <Link href={`/admin/properties/${payout.unit.property.id}`} className="text-primary-600 hover:text-primary-800 hover:underline">
                          {payout.unit.property.name}
                        </Link>
                        <div className='text-xs text-neutral-500'>Unit {payout.unit.unitNumber}</div>
                      </>
                    ) : (
                      <span className='text-neutral-400'>—</span>
                    )}
                  </td>
                  <td className='px-6 py-4 text-sm text-neutral-900'>{payout.period}</td>
                  <td className='px-6 py-4 text-sm font-semibold text-neutral-900'>
                    KES {Number(payout.amount).toLocaleString()}
                  </td>
                  <td className='px-6 py-4 text-sm text-neutral-900'>
                    {formatMethod(payout.method)}
                    {payout.reference && <div className='text-xs text-neutral-500'>{payout.reference}</div>}
                  </td>
                  <td className='px-6 py-4 text-sm text-neutral-900'>
                    {payout.paidDate ? formatDate(payout.paidDate) : <span className='text-neutral-400'>—</span>}
                  </td>
                  <td className='px-6 py-4'>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payout.status)}`}>
                      {payout.status}
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
