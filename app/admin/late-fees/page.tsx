'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TimeFilter } from '@/components/shared/TimeFilter';

interface LateFee {
  id: string;
  tenantId: string;
  tenantName: string;
  propertyId: string;
  propertyName: string;
  unitNumber: string;
  rentAmount: number;
  dueDate: string;
  daysLate: number;
  feeAmount: number;
  status: 'pending' | 'waived' | 'collected';
  notes?: string;
}

export default function LateFeesPage() {
  const [timePeriod, setTimePeriod] = useState('current');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [lateFees, setLateFees] = useState<LateFee[]>([]);

  useEffect(() => {
    fetch('/api/payments?status=OVERDUE&limit=100')
      .then(r => r.json())
      .then(data => {
        const mapped = (data.payments || []).map((p: any) => {
          const dueDate = p.dueDate ? new Date(p.dueDate) : new Date();
          const now = new Date();
          const daysLate = Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / 86400000));
          return {
            id: p.id,
            tenantId: p.tenantId,
            tenantName: p.tenant?.name || '',
            propertyId: p.lease?.propertyId || '',
            propertyName: p.lease?.property?.name || '',
            unitNumber: p.lease?.unit || '',
            rentAmount: Number(p.amount) || 0,
            dueDate: p.dueDate ? p.dueDate.split('T')[0] : '',
            daysLate,
            feeAmount: daysLate * 500,
            status: 'pending' as LateFee['status'],
          };
        });
        setLateFees(mapped);
      })
      .catch(() => {});
  }, []);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const filteredFees = lateFees.filter((f) => filterStatus === 'all' || f.status === filterStatus);

  const stats = {
    totalPending: lateFees
      .filter((f) => f.status === 'pending')
      .reduce((sum, f) => sum + f.feeAmount, 0),
    totalCollected: lateFees
      .filter((f) => f.status === 'collected')
      .reduce((sum, f) => sum + f.feeAmount, 0),
    totalWaived: lateFees
      .filter((f) => f.status === 'waived')
      .reduce((sum, f) => sum + f.feeAmount, 0),
    count: lateFees.filter((f) => f.status === 'pending').length,
  };

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Late Fees Management</h1>
          <p className='text-gray-600 mt-1'>Track and manage late payment fees</p>
        </div>
        <Button variant="primary" size="lg">Configure Policies</Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Pending Fees</p>
          <p className='text-3xl font-bold text-yellow-600'>
            KES {stats.totalPending.toLocaleString()}
          </p>
          <p className='text-xs text-gray-500 mt-1'>{stats.count} outstanding</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Collected Fees</p>
          <p className='text-3xl font-bold text-green-600'>
            KES {stats.totalCollected.toLocaleString()}
          </p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Waived Fees</p>
          <p className='text-3xl font-bold text-blue-600'>
            KES {stats.totalWaived.toLocaleString()}
          </p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>All Late Fees</p>
          <p className='text-3xl font-bold text-purple-600'>{lateFees.length}</p>
        </div>
      </div>

      <div className='bg-white shadow rounded-lg p-4 space-y-4'>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            >
              <option value='all'>All Status</option>
              <option value='pending'>Pending</option>
              <option value='collected'>Collected</option>
              <option value='waived'>Waived</option>
            </select>
          </div>
        </div>
      </div>

      <div className='bg-white shadow rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Tenant
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Property/Unit
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Rent Amount
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Due Date
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Days Late
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Fee Amount
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
            {filteredFees.map((fee) => (
              <tr key={fee.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 text-sm font-medium'>
                  <Link href={`/admin/tenants/${fee.tenantId}`} className='text-blue-600 hover:text-blue-800 hover:underline'>
                    {fee.tenantName}
                  </Link>
                </td>
                <td className='px-6 py-4'>
                  <div className='text-sm'>
                    <Link href={`/admin/properties/${fee.propertyId}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                      {fee.propertyName}
                    </Link>
                  </div>
                  <div className='text-sm text-gray-500'>Unit {fee.unitNumber}</div>
                </td>
                <td className='px-6 py-4 text-sm text-gray-900'>
                  KES {fee.rentAmount.toLocaleString()}
                </td>
                <td className='px-6 py-4 text-sm text-gray-900'>{fee.dueDate}</td>
                <td className='px-6 py-4'>
                  <span
                    className={`text-sm font-semibold ${
                      fee.daysLate > 10
                        ? 'text-red-600'
                        : fee.daysLate > 5
                          ? 'text-orange-600'
                          : 'text-yellow-600'
                    }`}
                  >
                    {fee.daysLate} days
                  </span>
                </td>
                <td className='px-6 py-4 text-sm font-semibold text-gray-900'>
                  KES {fee.feeAmount.toLocaleString()}
                  {fee.notes && <div className='text-xs text-gray-500 mt-1'>{fee.notes}</div>}
                </td>
                <td className='px-6 py-4'>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      fee.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : fee.status === 'collected'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {fee.status}
                  </span>
                </td>
                <td className='px-6 py-4 text-sm space-x-2'>
                  <button  >
                    View
                  </button>
                  {fee.status === 'pending' && (
                    <button  >
                      Waive
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
