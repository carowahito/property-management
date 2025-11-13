'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Payout {
  id: string;
  landlordName: string;
  propertyName: string;
  period: string;
  rentCollected: number;
  commission: number;
  deductions: number;
  payoutAmount: number;
  status: 'pending' | 'processed' | 'completed';
  paymentDate?: string;
  schedule: 'monthly' | 'bi-weekly' | 'weekly';
}

export default function PayoutsPage() {
  const [payouts] = useState<Payout[]>([
    {
      id: '1',
      landlordName: 'David Kamau',
      propertyName: 'Sunset Apartments',
      period: 'Jan 2024',
      rentCollected: 450000,
      commission: 45000,
      deductions: 5000,
      payoutAmount: 400000,
      status: 'completed',
      paymentDate: '2024-02-05',
      schedule: 'monthly',
    },
    {
      id: '2',
      landlordName: 'Sarah Njeri',
      propertyName: 'Highland House',
      period: 'Jan 2024',
      rentCollected: 600000,
      commission: 60000,
      deductions: 0,
      payoutAmount: 540000,
      status: 'completed',
      paymentDate: '2024-02-05',
      schedule: 'monthly',
    },
    {
      id: '3',
      landlordName: 'James Odhiambo',
      propertyName: 'Vista Plaza',
      period: 'Feb 2024',
      rentCollected: 800000,
      commission: 80000,
      deductions: 15000,
      payoutAmount: 705000,
      status: 'processed',
      schedule: 'monthly',
    },
    {
      id: '4',
      landlordName: 'Mary Wanjiku',
      propertyName: 'Garden Estate',
      period: 'Feb 2024',
      rentCollected: 350000,
      commission: 35000,
      deductions: 0,
      payoutAmount: 315000,
      status: 'pending',
      schedule: 'bi-weekly',
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const filteredPayouts = payouts.filter(
    (p) => filterStatus === 'all' || p.status === filterStatus
  );

  const stats = {
    totalPending: payouts
      .filter((p) => p.status === 'pending')
      .reduce((sum, p) => sum + p.payoutAmount, 0),
    totalProcessed: payouts
      .filter((p) => p.status === 'processed' || p.status === 'completed')
      .reduce((sum, p) => sum + p.payoutAmount, 0),
    thisMonth: payouts
      .filter((p) => p.period.includes('Feb 2024'))
      .reduce((sum, p) => sum + p.payoutAmount, 0),
    pendingCount: payouts.filter((p) => p.status === 'pending').length,
  };

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Landlord Payouts</h1>
          <p className='text-gray-600 mt-1'>
            Manage payout schedules and track commission deductions
          </p>
        </div>
        <Button className='bg-blue-600 hover:bg-blue-700'>+ Process Payout</Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Pending Payouts</p>
          <p className='text-3xl font-bold text-yellow-600'>
            KES {stats.totalPending.toLocaleString()}
          </p>
          <p className='text-xs text-gray-500 mt-1'>{stats.pendingCount} payouts</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Total Processed</p>
          <p className='text-3xl font-bold text-green-600'>
            KES {stats.totalProcessed.toLocaleString()}
          </p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>This Month</p>
          <p className='text-3xl font-bold text-blue-600'>KES {stats.thisMonth.toLocaleString()}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>All Payouts</p>
          <p className='text-3xl font-bold text-purple-600'>{payouts.length}</p>
        </div>
      </div>

      <div className='bg-white shadow rounded-lg p-4'>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className='px-4 py-2 border border-gray-300 rounded-lg'
        >
          <option value='all'>All Status</option>
          <option value='pending'>Pending</option>
          <option value='processed'>Processed</option>
          <option value='completed'>Completed</option>
        </select>
      </div>

      <div className='bg-white shadow rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Landlord
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Property
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Period
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Rent Collected
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Commission
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Payout Amount
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Schedule
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Status
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {filteredPayouts.map((payout) => (
              <tr key={payout.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 text-sm font-medium text-gray-900'>
                  {payout.landlordName}
                </td>
                <td className='px-6 py-4 text-sm text-gray-900'>{payout.propertyName}</td>
                <td className='px-6 py-4 text-sm text-gray-900'>{payout.period}</td>
                <td className='px-6 py-4 text-sm text-gray-900'>
                  KES {payout.rentCollected.toLocaleString()}
                </td>
                <td className='px-6 py-4 text-sm text-red-600'>
                  -KES {payout.commission.toLocaleString()}
                </td>
                <td className='px-6 py-4 text-sm font-semibold text-gray-900'>
                  KES {payout.payoutAmount.toLocaleString()}
                </td>
                <td className='px-6 py-4 text-sm text-gray-900 capitalize'>{payout.schedule}</td>
                <td className='px-6 py-4'>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      payout.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : payout.status === 'processed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {payout.status}
                  </span>
                </td>
                <td className='px-6 py-4 text-sm space-x-2'>
                  <Button variant='outline' size='sm'>
                    View
                  </Button>
                  {payout.status === 'pending' && (
                    <Button variant='outline' size='sm'>
                      Process
                    </Button>
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
