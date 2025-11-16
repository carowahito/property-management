'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Viewing {
  id: string;
  propertyName: string;
  unitNumber: string;
  prospectName: string;
  phone: string;
  email: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  feedback?: string;
  interest: 'high' | 'medium' | 'low' | 'none';
}

export default function ViewingsPage() {
  const [viewings] = useState<Viewing[]>([
    {
      id: '1',
      propertyName: 'Sunset Apartments',
      unitNumber: '5A',
      prospectName: 'Michael Kariuki',
      phone: '+254 712 345 678',
      email: 'michael@email.com',
      scheduledDate: '2024-03-18',
      scheduledTime: '10:00 AM',
      status: 'scheduled',
      interest: 'high',
    },
    {
      id: '2',
      propertyName: 'Highland House',
      unitNumber: '12',
      prospectName: 'Grace Akinyi',
      phone: '+254 723 456 789',
      email: 'grace@email.com',
      scheduledDate: '2024-03-15',
      scheduledTime: '2:00 PM',
      status: 'completed',
      interest: 'high',
      feedback: 'Very interested, wants to apply',
    },
    {
      id: '3',
      propertyName: 'Vista Plaza',
      unitNumber: '8B',
      prospectName: 'Daniel Mutua',
      phone: '+254 734 567 890',
      email: 'daniel@email.com',
      scheduledDate: '2024-03-17',
      scheduledTime: '11:30 AM',
      status: 'scheduled',
      interest: 'medium',
    },
    {
      id: '4',
      propertyName: 'Garden Estate',
      unitNumber: '3C',
      prospectName: 'Lucy Wambui',
      phone: '+254 745 678 901',
      email: 'lucy@email.com',
      scheduledDate: '2024-03-14',
      scheduledTime: '3:00 PM',
      status: 'no-show',
      interest: 'none',
    },
    {
      id: '5',
      propertyName: 'Riverside Towers',
      unitNumber: '15D',
      prospectName: 'Kevin Omondi',
      phone: '+254 756 789 012',
      email: 'kevin@email.com',
      scheduledDate: '2024-03-16',
      scheduledTime: '4:30 PM',
      status: 'cancelled',
      interest: 'none',
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const filteredViewings = viewings.filter(
    (v) => filterStatus === 'all' || v.status === filterStatus
  );

  const stats = {
    scheduled: viewings.filter((v) => v.status === 'scheduled').length,
    completed: viewings.filter((v) => v.status === 'completed').length,
    highInterest: viewings.filter((v) => v.interest === 'high').length,
    total: viewings.length,
  };

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Property Viewings</h1>
          <p className='text-gray-600 mt-1'>Schedule and manage property viewing appointments</p>
        </div>
        <Button variant="primary" size="lg">+ Schedule Viewing</Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Scheduled</p>
          <p className='text-3xl font-bold text-blue-600'>{stats.scheduled}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Completed</p>
          <p className='text-3xl font-bold text-green-600'>{stats.completed}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>High Interest</p>
          <p className='text-3xl font-bold text-yellow-600'>{stats.highInterest}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Total Viewings</p>
          <p className='text-3xl font-bold text-purple-600'>{stats.total}</p>
        </div>
      </div>

      <div className='bg-white shadow rounded-lg p-4'>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className='px-4 py-2 border border-gray-300 rounded-lg'
        >
          <option value='all'>All Status</option>
          <option value='scheduled'>Scheduled</option>
          <option value='completed'>Completed</option>
          <option value='cancelled'>Cancelled</option>
          <option value='no-show'>No Show</option>
        </select>
      </div>

      <div className='bg-white shadow rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Property/Unit
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Prospect
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Contact
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Scheduled
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Interest Level
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
            {filteredViewings.map((viewing) => (
              <tr key={viewing.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4'>
                  <div className='text-sm font-medium text-gray-900'>{viewing.propertyName}</div>
                  <div className='text-sm text-gray-500'>Unit {viewing.unitNumber}</div>
                </td>
                <td className='px-6 py-4 text-sm font-medium text-gray-900'>
                  {viewing.prospectName}
                </td>
                <td className='px-6 py-4'>
                  <div className='text-sm text-gray-900'>{viewing.phone}</div>
                  <div className='text-sm text-gray-500'>{viewing.email}</div>
                </td>
                <td className='px-6 py-4'>
                  <div className='text-sm text-gray-900'>{viewing.scheduledDate}</div>
                  <div className='text-sm text-gray-500'>{viewing.scheduledTime}</div>
                </td>
                <td className='px-6 py-4'>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      viewing.interest === 'high'
                        ? 'bg-green-100 text-green-800'
                        : viewing.interest === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : viewing.interest === 'low'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {viewing.interest}
                  </span>
                  {viewing.feedback && (
                    <div className='text-xs text-gray-500 mt-1'>{viewing.feedback}</div>
                  )}
                </td>
                <td className='px-6 py-4'>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      viewing.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-800'
                        : viewing.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : viewing.status === 'cancelled'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {viewing.status.replace('-', ' ')}
                  </span>
                </td>
                <td className='px-6 py-4 text-sm space-x-2'>
                  <Button variant="primary" size="sm">
                    View
                  </Button>
                  {viewing.status === 'scheduled' && (
                    <Button variant="success" size="sm">
                      Complete
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
