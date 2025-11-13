'use client';

import { useState } from 'react';

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
  const [inspections] = useState<Inspection[]>([
    {
      id: '1',
      propertyName: 'Sunset Apartments',
      unitNumber: '5A',
      type: 'move-in',
      scheduledDate: '2024-03-15',
      inspector: 'John Kamau',
      status: 'scheduled',
    },
    {
      id: '2',
      propertyName: 'Highland House',
      unitNumber: '12',
      type: 'move-out',
      scheduledDate: '2024-03-10',
      inspector: 'Sarah Njeri',
      status: 'completed',
      issuesFound: 3,
      notes: 'Minor wall damage, carpet cleaning needed',
    },
    {
      id: '3',
      propertyName: 'Vista Plaza',
      unitNumber: '8B',
      type: 'routine',
      scheduledDate: '2024-03-20',
      inspector: 'Peter Omondi',
      status: 'scheduled',
    },
    {
      id: '4',
      propertyName: 'Garden Estate',
      unitNumber: '3C',
      type: 'maintenance',
      scheduledDate: '2024-03-08',
      inspector: 'Mary Wanjiku',
      status: 'completed',
      issuesFound: 0,
      notes: 'All systems functioning properly',
    },
    {
      id: '5',
      propertyName: 'Riverside Towers',
      unitNumber: '15D',
      type: 'move-in',
      scheduledDate: '2024-03-12',
      inspector: 'James Otieno',
      status: 'cancelled',
    },
  ]);

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
          <h1 className='text-3xl font-bold text-gray-900'>Property Inspections</h1>
          <p className='text-gray-600 mt-1'>Schedule and track property inspection activities</p>
        </div>
        <button className='bg-blue-600 hover:bg-blue-700'>+ Schedule Inspection</button>
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
          <p className='text-sm text-gray-600'>Issues Found</p>
          <p className='text-3xl font-bold text-red-600'>{stats.totalIssues}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>This Month</p>
          <p className='text-3xl font-bold text-purple-600'>{stats.thisMonth}</p>
        </div>
      </div>

      <div className='bg-white shadow rounded-lg p-4'>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className='px-4 py-2 border border-gray-300 rounded-lg'
        >
          <option value='all'>All Types</option>
          <option value='move-in'>Move-In</option>
          <option value='move-out'>Move-Out</option>
          <option value='routine'>Routine</option>
          <option value='maintenance'>Maintenance</option>
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
                Type
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Scheduled Date
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Inspector
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Issues Found
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
            {filteredInspections.map((inspection) => (
              <tr key={inspection.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4'>
                  <div className='text-sm font-medium text-gray-900'>{inspection.propertyName}</div>
                  <div className='text-sm text-gray-500'>Unit {inspection.unitNumber}</div>
                </td>
                <td className='px-6 py-4 text-sm text-gray-900 capitalize'>
                  {inspection.type.replace('-', ' ')}
                </td>
                <td className='px-6 py-4 text-sm text-gray-900'>{inspection.scheduledDate}</td>
                <td className='px-6 py-4 text-sm text-gray-900'>{inspection.inspector}</td>
                <td className='px-6 py-4 text-sm text-gray-900'>
                  {inspection.issuesFound !== undefined ? inspection.issuesFound : '—'}
                  {inspection.notes && (
                    <div className='text-xs text-gray-500 mt-1'>{inspection.notes}</div>
                  )}
                </td>
                <td className='px-6 py-4'>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      inspection.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-800'
                        : inspection.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
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
