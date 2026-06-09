'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface Viewing {
  id: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  scheduledDate: string;
  status: string;
  notes?: string;
  property: {
    id: string;
    name: string;
    address: string;
  };
}

export default function ViewingsPage() {
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetch('/api/viewings')
      .then(r => r.json())
      .then(data => { setViewings(data.viewings || []); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  const filteredViewings = viewings.filter(
    (v) => filterStatus === 'all' || v.status === filterStatus
  );

  const stats = {
    scheduled: viewings.filter((v) => v.status === 'SCHEDULED').length,
    completed: viewings.filter((v) => v.status === 'COMPLETED').length,
    total: viewings.length,
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
          <h1 className='text-3xl font-bold text-neutral-900'>Property Viewings</h1>
          <p className='text-neutral-600 mt-1'>Schedule and manage property viewing appointments</p>
        </div>
        <Button variant="primary" size="lg">+ Schedule Viewing</Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Scheduled</p>
          <p className='text-3xl font-bold text-primary-600'>{stats.scheduled}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Completed</p>
          <p className='text-3xl font-bold text-success-600'>{stats.completed}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Total Viewings</p>
          <p className='text-3xl font-bold text-primary-600'>{stats.total}</p>
        </div>
      </div>

      <div className='bg-surface shadow rounded-lg p-4'>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className='px-4 py-2 border border-neutral-300 rounded-lg'
        >
          <option value='all'>All Status</option>
          <option value='SCHEDULED'>Scheduled</option>
          <option value='COMPLETED'>Completed</option>
          <option value='CANCELLED'>Cancelled</option>
          <option value='NO_SHOW'>No Show</option>
        </select>
      </div>

      <div className='bg-surface shadow rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-neutral-200'>
          <thead className='bg-neutral-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>Property</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>Visitor</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>Contact</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>Scheduled</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>Status</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>Actions</th>
            </tr>
          </thead>
          <tbody className='bg-surface divide-y divide-neutral-200'>
            {filteredViewings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-neutral-500">
                  No viewings found. Schedule a viewing to get started.
                </td>
              </tr>
            ) : filteredViewings.map((viewing) => (
              <tr key={viewing.id} className='hover:bg-neutral-50'>
                <td className='px-6 py-4'>
                  <div className='text-sm font-medium text-neutral-900'>{viewing.property?.name}</div>
                  <div className='text-sm text-neutral-500'>{viewing.property?.address}</div>
                </td>
                <td className='px-6 py-4 text-sm font-medium text-neutral-900'>
                  {viewing.visitorName}
                </td>
                <td className='px-6 py-4'>
                  <div className='text-sm text-neutral-900'>{viewing.visitorPhone}</div>
                  <div className='text-sm text-neutral-500'>{viewing.visitorEmail}</div>
                </td>
                <td className='px-6 py-4'>
                  <div className='text-sm text-neutral-900'>
                    {new Date(viewing.scheduledDate).toLocaleDateString()}
                  </div>
                  <div className='text-sm text-neutral-500'>
                    {new Date(viewing.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td className='px-6 py-4'>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    viewing.status === 'SCHEDULED' ? 'bg-primary-100 text-primary-800' :
                    viewing.status === 'COMPLETED' ? 'bg-success-100 text-green-800' :
                    viewing.status === 'CANCELLED' ? 'bg-neutral-100 text-neutral-800' :
                    'bg-danger-100 text-red-800'
                  }`}>
                    {viewing.status.replace('_', ' ')}
                  </span>
                </td>
                <td className='px-6 py-4 text-sm space-x-2'>
                  <Button variant="primary" size="sm">View</Button>
                  {viewing.status === 'SCHEDULED' && (
                    <Button variant="success" size="sm">Complete</Button>
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
