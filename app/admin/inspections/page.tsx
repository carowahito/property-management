'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface Inspection {
  id: string;
  propertyName: string;
  unitNumber: string;
  type: 'move-in' | 'move-out' | 'routine' | 'maintenance';
  scheduledDate: string;
  inspector: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  issuesFound?: number;
  notes?: string;
}

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);

  useEffect(() => {
    fetch('/api/inspections?limit=100')
      .then(r => r.json())
      .then(data => {
        const mapped = (data.inspections || []).map((i: any) => ({
          id: i.id,
          propertyName: i.property?.name || '',
          unitNumber: '',
          type: (i.type || 'MAINTENANCE').toLowerCase().replace('_', '-') as Inspection['type'],
          scheduledDate: i.date ? i.date.split('T')[0] : '',
          inspector: i.inspector || '',
          status: (i.status || 'SCHEDULED').toLowerCase() as Inspection['status'],
          issuesFound: undefined,
          notes: i.findings || undefined,
        }));
        setInspections(mapped);
      })
      .catch(() => {});
  }, []);

  const [filterType, setFilterType] = useState<string>('all');
  const filteredInspections = inspections.filter(
    (i) => filterType === 'all' || i.type === filterType
  );

  const stats = {
    scheduled: inspections.filter((i) => i.status === 'scheduled').length,
    completed: inspections.filter((i) => i.status === 'completed').length,
    totalIssues: inspections.reduce((sum, i) => sum + (i.issuesFound || 0), 0),
    thisMonth: inspections.length,
  };

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-neutral-900'>Property Inspections</h1>
          <p className='text-neutral-600 mt-1'>Schedule and track property inspection activities</p>
        </div>
        <Button variant="primary" size="lg">+ Schedule Inspection</Button>
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
          <p className='text-sm text-neutral-600'>Issues Found</p>
          <p className='text-3xl font-bold text-danger-600'>{stats.totalIssues}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>This Month</p>
          <p className='text-3xl font-bold text-purple-600'>{stats.thisMonth}</p>
        </div>
      </div>

      <div className='bg-surface shadow rounded-lg p-4'>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className='px-4 py-2 border border-neutral-300 rounded-lg'
        >
          <option value='all'>All Types</option>
          <option value='move-in'>Move-In</option>
          <option value='move-out'>Move-Out</option>
          <option value='routine'>Routine</option>
          <option value='maintenance'>Maintenance</option>
        </select>
      </div>

      <div className='bg-surface shadow rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-neutral-200'>
          <thead className='bg-neutral-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Property/Unit
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Type
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Scheduled Date
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Inspector
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Issues Found
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
            {filteredInspections.map((inspection) => (
              <tr key={inspection.id} className='hover:bg-neutral-50'>
                <td className='px-6 py-4'>
                  <div className='text-sm font-medium text-neutral-900'>{inspection.propertyName}</div>
                  <div className='text-sm text-neutral-500'>Unit {inspection.unitNumber}</div>
                </td>
                <td className='px-6 py-4 text-sm text-neutral-900 capitalize'>
                  {inspection.type.replace('-', ' ')}
                </td>
                <td className='px-6 py-4 text-sm text-neutral-900'>{inspection.scheduledDate}</td>
                <td className='px-6 py-4 text-sm text-neutral-900'>{inspection.inspector}</td>
                <td className='px-6 py-4 text-sm text-neutral-900'>
                  {inspection.issuesFound !== undefined ? inspection.issuesFound : '—'}
                  {inspection.notes && (
                    <div className='text-xs text-neutral-500 mt-1'>{inspection.notes}</div>
                  )}
                </td>
                <td className='px-6 py-4'>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      inspection.status === 'scheduled'
                        ? 'bg-primary-100 text-primary-800'
                        : inspection.status === 'completed'
                          ? 'bg-success-100 text-green-800'
                          : 'bg-neutral-100 text-neutral-800'
                    }`}
                  >
                    {inspection.status}
                  </span>
                </td>
                <td className='px-6 py-4 text-sm space-x-2'>
                  <button  >
                    View
                  </button>
                  {inspection.status === 'scheduled' && (
                    <button  >
                      Complete
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
