'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';

interface Payout {
  id: string;
  amount: string;
  period: string;
  status: string;
  method: string;
  paidDate?: string | null;
  createdAt: string;
  landlord: { id: string; name: string; email: string };
  unit: {
    id: string;
    unitNumber: string;
    property: { id: string; name: string };
  };
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetch('/api/payouts?limit=200')
      .then((r) => r.json())
      .then((data) => {
        setPayouts(data.payouts || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const filteredPayouts = payouts.filter(
    (p) => filterStatus === 'all' || p.status === filterStatus
  );

  const stats = {
    totalPending: payouts
      .filter((p) => p.status === 'PENDING')
      .reduce((sum, p) => sum + Number(p.amount), 0),
    totalProcessed: payouts
      .filter((p) => p.status === 'PAID' || p.status === 'PROCESSING')
      .reduce((sum, p) => sum + Number(p.amount), 0),
    totalAmount: payouts.reduce((sum, p) => sum + Number(p.amount), 0),
    pendingCount: payouts.filter((p) => p.status === 'PENDING').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-primary-100 text-primary-800';
      case 'PAID':
        return 'bg-success-100 text-green-800';
      case 'FAILED':
        return 'bg-danger-100 text-red-800';
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
          <h1 className='text-3xl font-bold text-neutral-900'>Landlord Payouts</h1>
          <p className='text-neutral-600 mt-1'>
            Manage payout schedules and track commission deductions
          </p>
        </div>
        <button className='bg-primary-600 hover:bg-primary-700'>+ Process Payout</button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Pending Payouts</p>
          <p className='text-3xl font-bold text-yellow-600'>
            KES {stats.totalPending.toLocaleString()}
          </p>
          <p className='text-xs text-neutral-500 mt-1'>{stats.pendingCount} payouts</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Total Processed</p>
          <p className='text-3xl font-bold text-success-600'>
            KES {stats.totalProcessed.toLocaleString()}
          </p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Total Amount</p>
          <p className='text-3xl font-bold text-primary-600'>
            KES {stats.totalAmount.toLocaleString()}
          </p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>All Payouts</p>
          <p className='text-3xl font-bold text-purple-600'>{payouts.length}</p>
        </div>
      </div>

      <div className='bg-surface shadow rounded-lg p-4'>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className='px-4 py-2 border border-neutral-300 rounded-lg'
        >
          <option value='all'>All Status</option>
          <option value='PENDING'>Pending</option>
          <option value='PROCESSING'>Processing</option>
          <option value='PAID'>Paid</option>
          <option value='FAILED'>Failed</option>
        </select>
      </div>

      <div className='bg-surface shadow rounded-lg overflow-hidden'>
        {filteredPayouts.length === 0 ? (
          <div className='p-12 text-center'>
            <p className='text-neutral-500'>No payouts found.</p>
            <p className='text-sm text-neutral-400 mt-2'>Process rent to generate landlord payouts.</p>
          </div>
        ) : (
          <table className='min-w-full divide-y divide-neutral-200'>
            <thead className='bg-neutral-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                  Landlord
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                  Property / Unit
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                  Period
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                  Payout Amount
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                  Method
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-surface divide-y divide-neutral-200'>
              {filteredPayouts.map((payout) => (
                <tr key={payout.id} className='hover:bg-neutral-50'>
                  <td className='px-6 py-4 text-sm font-medium text-neutral-900'>
                    {payout.landlord?.name || '\u2014'}
                  </td>
                  <td className='px-6 py-4 text-sm text-neutral-900'>
                    <div>{payout.unit?.property?.name || '\u2014'}</div>
                    <div className='text-neutral-500'>
                      {payout.unit?.unitNumber ? `Unit ${payout.unit.unitNumber}` : ''}
                    </div>
                  </td>
                  <td className='px-6 py-4 text-sm text-neutral-900'>{payout.period}</td>
                  <td className='px-6 py-4 text-sm font-semibold text-neutral-900'>
                    KES {Number(payout.amount).toLocaleString()}
                  </td>
                  <td className='px-6 py-4 text-sm text-neutral-900'>{payout.method}</td>
                  <td className='px-6 py-4'>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payout.status)}`}
                    >
                      {payout.status}
                    </span>
                    {payout.paidDate && (
                      <div className='text-xs text-neutral-500 mt-1'>
                        Paid {formatDate(payout.paidDate)}
                      </div>
                    )}
                  </td>
                  <td className='px-6 py-4 text-sm space-x-2'>
                    <button>View</button>
                    {payout.status === 'PENDING' && <button>Process</button>}
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
