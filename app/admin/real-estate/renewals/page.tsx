'use client';

import { useState } from 'react';

interface Renewal {
  id: string;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  currentLeaseEnd: string;
  monthsRemaining: number;
  currentRent: number;
  proposedRent: number;
  status: 'pending' | 'negotiating' | 'accepted' | 'declined';
  renewalDate?: string;
  notes?: string;
}

export default function RenewalsPage() {
  const [renewals] = useState<Renewal[]>([
    {
      id: '1',
      tenantName: 'John Mwangi',
      propertyName: 'Sunset Apartments',
      unitNumber: '5A',
      currentLeaseEnd: '2024-05-01',
      monthsRemaining: 2,
      currentRent: 45000,
      proposedRent: 47000,
      status: 'pending',
    },
    {
      id: '2',
      tenantName: 'Jane Achieng',
      propertyName: 'Highland House',
      unitNumber: '12',
      currentLeaseEnd: '2024-04-15',
      monthsRemaining: 1,
      currentRent: 60000,
      proposedRent: 62000,
      status: 'negotiating',
      notes: 'Tenant requested 5% increase instead of proposed 10%',
    },
    {
      id: '3',
      tenantName: 'Mark Otieno',
      propertyName: 'Vista Plaza',
      unitNumber: '8B',
      currentLeaseEnd: '2024-06-01',
      monthsRemaining: 3,
      currentRent: 80000,
      proposedRent: 80000,
      status: 'accepted',
      renewalDate: '2024-06-01',
    },
    {
      id: '4',
      tenantName: 'Sarah Wanjiku',
      propertyName: 'Garden Estate',
      unitNumber: '3C',
      currentLeaseEnd: '2024-04-01',
      monthsRemaining: 1,
      currentRent: 40000,
      proposedRent: 45000,
      status: 'declined',
      notes: 'Tenant relocating',
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const filteredRenewals = renewals.filter(
    (r) => filterStatus === 'all' || r.status === filterStatus
  );

  const stats = {
    pending: renewals.filter((r) => r.status === 'pending').length,
    accepted: renewals.filter((r) => r.status === 'accepted').length,
    expiringSoon: renewals.filter((r) => r.monthsRemaining <= 2).length,
    total: renewals.length,
  };

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-neutral-900'>Lease Renewals</h1>
          <p className='text-neutral-600 mt-1'>Track and manage upcoming lease renewals</p>
        </div>
        <button className='bg-primary-600 hover:bg-primary-700'>+ Send Renewal Notice</button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Pending</p>
          <p className='text-3xl font-bold text-yellow-600'>{stats.pending}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Accepted</p>
          <p className='text-3xl font-bold text-success-600'>{stats.accepted}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Expiring Soon</p>
          <p className='text-3xl font-bold text-danger-600'>{stats.expiringSoon}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Total Renewals</p>
          <p className='text-3xl font-bold text-purple-600'>{stats.total}</p>
        </div>
      </div>

      <div className='bg-surface shadow rounded-lg p-4'>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className='px-4 py-2 border border-neutral-300 rounded-lg'
        >
          <option value='all'>All Status</option>
          <option value='pending'>Pending</option>
          <option value='negotiating'>Negotiating</option>
          <option value='accepted'>Accepted</option>
          <option value='declined'>Declined</option>
        </select>
      </div>

      <div className='bg-surface shadow rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-neutral-200'>
          <thead className='bg-neutral-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Tenant
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Property/Unit
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Lease End
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Time Remaining
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Current Rent
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Proposed Rent
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
            {filteredRenewals.map((renewal) => (
              <tr key={renewal.id} className='hover:bg-neutral-50'>
                <td className='px-6 py-4 text-sm font-medium text-neutral-900'>
                  {renewal.tenantName}
                </td>
                <td className='px-6 py-4'>
                  <div className='text-sm text-neutral-900'>{renewal.propertyName}</div>
                  <div className='text-sm text-neutral-500'>Unit {renewal.unitNumber}</div>
                </td>
                <td className='px-6 py-4 text-sm text-neutral-900'>{renewal.currentLeaseEnd}</td>
                <td className='px-6 py-4'>
                  <span
                    className={`text-sm font-semibold ${renewal.monthsRemaining <= 1 ? 'text-danger-600' : 'text-neutral-900'}`}
                  >
                    {renewal.monthsRemaining} month{renewal.monthsRemaining !== 1 ? 's' : ''}
                  </span>
                </td>
                <td className='px-6 py-4 text-sm text-neutral-900'>
                  KES {renewal.currentRent.toLocaleString()}
                </td>
                <td className='px-6 py-4 text-sm font-semibold text-neutral-900'>
                  KES {renewal.proposedRent.toLocaleString()}
                  {renewal.proposedRent > renewal.currentRent && (
                    <span className='text-xs text-success-600 ml-2'>
                      +
                      {(
                        ((renewal.proposedRent - renewal.currentRent) / renewal.currentRent) *
                        100
                      ).toFixed(0)}
                      %
                    </span>
                  )}
                  {renewal.notes && (
                    <div className='text-xs text-neutral-500 mt-1'>{renewal.notes}</div>
                  )}
                </td>
                <td className='px-6 py-4'>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      renewal.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : renewal.status === 'negotiating'
                          ? 'bg-primary-100 text-primary-800'
                          : renewal.status === 'accepted'
                            ? 'bg-success-100 text-green-800'
                            : 'bg-danger-100 text-red-800'
                    }`}
                  >
                    {renewal.status}
                  </span>
                </td>
                <td className='px-6 py-4 text-sm space-x-2'>
                  <button  >
                    View
                  </button>
                  {renewal.status === 'pending' && (
                    <button  >
                      Contact
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
