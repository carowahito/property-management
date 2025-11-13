'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface LateFee {
  id: string;
  tenantName: string;
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
  const [lateFees] = useState<LateFee[]>([
    {
      id: '1',
      tenantName: 'John Mwangi',
      propertyName: 'Sunset Apartments',
      unitNumber: '5A',
      rentAmount: 45000,
      dueDate: '2024-03-01',
      daysLate: 8,
      feeAmount: 2250,
      status: 'pending',
    },
    {
      id: '2',
      tenantName: 'Mary Wanjiku',
      propertyName: 'Garden Estate',
      unitNumber: '3C',
      rentAmount: 40000,
      dueDate: '2024-02-01',
      daysLate: 15,
      feeAmount: 3000,
      status: 'collected',
    },
    {
      id: '3',
      tenantName: 'Peter Omondi',
      propertyName: 'Vista Plaza',
      unitNumber: '8B',
      rentAmount: 80000,
      dueDate: '2024-03-01',
      daysLate: 5,
      feeAmount: 2000,
      status: 'waived',
      notes: 'First-time late, waived as courtesy',
    },
    {
      id: '4',
      tenantName: 'Grace Akinyi',
      propertyName: 'Highland House',
      unitNumber: '12',
      rentAmount: 60000,
      dueDate: '2024-03-01',
      daysLate: 12,
      feeAmount: 3600,
      status: 'pending',
    },
  ]);

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
        <Button className='bg-blue-600 hover:bg-blue-700'>Configure Policies</Button>
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

      <div className='bg-white shadow rounded-lg p-4'>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className='px-4 py-2 border border-gray-300 rounded-lg'
        >
          <option value='all'>All Status</option>
          <option value='pending'>Pending</option>
          <option value='collected'>Collected</option>
          <option value='waived'>Waived</option>
        </select>
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
                <td className='px-6 py-4 text-sm font-medium text-gray-900'>{fee.tenantName}</td>
                <td className='px-6 py-4'>
                  <div className='text-sm text-gray-900'>{fee.propertyName}</div>
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
                  <Button variant='outline' size='sm'>
                    View
                  </Button>
                  {fee.status === 'pending' && (
                    <Button variant='outline' size='sm'>
                      Waive
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
