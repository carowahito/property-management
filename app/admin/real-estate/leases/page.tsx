'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';

interface Lease {
  id: string;
  startDate: string;
  endDate: string;
  monthlyRent: string;
  securityDeposit: string;
  status: string;
  tenant: { id: string; name: string };
  property: { id: string; name: string };
  unitRef?: { id: string; unitNumber: string } | null;
  unit?: string | null;
}

export default function LeasesPage() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetch('/api/leases?limit=200')
      .then((r) => r.json())
      .then((data) => {
        setLeases(data.leases || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const filteredLeases = leases.filter(
    (lease) => filterStatus === 'all' || lease.status === filterStatus
  );

  const now = new Date();
  const sixMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());

  const stats = {
    totalLeases: leases.length,
    activeLeases: leases.filter((l) => l.status === 'ACTIVE').length,
    expiringSoon: leases.filter((l) => {
      const end = new Date(l.endDate);
      return l.status === 'ACTIVE' && end <= sixMonthsFromNow && end >= now;
    }).length,
    totalRevenue: leases
      .filter((l) => l.status === 'ACTIVE')
      .reduce((sum, l) => sum + Number(l.monthlyRent), 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-success-100 text-green-800';
      case 'EXPIRED':
        return 'bg-danger-100 text-red-800';
      case 'PENDING':
        return 'bg-primary-100 text-primary-800';
      case 'TERMINATED':
        return 'bg-neutral-100 text-neutral-800';
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
          <h1 className='text-3xl font-bold text-neutral-900'>Lease Management</h1>
          <p className='text-neutral-600 mt-1'>View and manage all lease agreements</p>
        </div>
        <button className='bg-primary-600 hover:bg-primary-700'>+ Create New Lease</button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Total Leases</p>
          <p className='text-3xl font-bold text-neutral-900'>{stats.totalLeases}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Active Leases</p>
          <p className='text-3xl font-bold text-success-600'>{stats.activeLeases}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Expiring Soon</p>
          <p className='text-3xl font-bold text-yellow-600'>{stats.expiringSoon}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Monthly Revenue</p>
          <p className='text-3xl font-bold text-primary-600'>
            KES {stats.totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className='bg-surface shadow rounded-lg p-4'>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className='px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
        >
          <option value='all'>All Leases</option>
          <option value='ACTIVE'>Active</option>
          <option value='EXPIRED'>Expired</option>
          <option value='PENDING'>Pending</option>
          <option value='TERMINATED'>Terminated</option>
        </select>
      </div>

      {/* Leases Table */}
      <div className='bg-surface shadow rounded-lg overflow-hidden'>
        {filteredLeases.length === 0 ? (
          <div className='p-12 text-center'>
            <p className='text-neutral-500'>No leases found.</p>
            <p className='text-sm text-neutral-400 mt-2'>Create a new lease to get started.</p>
          </div>
        ) : (
          <table className='min-w-full divide-y divide-neutral-200'>
            <thead className='bg-neutral-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                  Tenant
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                  Property/Unit
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                  Lease Period
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                  Rent Amount
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                  Security Deposit
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-surface divide-y divide-neutral-200'>
              {filteredLeases.map((lease) => (
                <tr key={lease.id} className='hover:bg-neutral-50'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm font-medium text-neutral-900'>
                      {lease.tenant?.name || '\u2014'}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-neutral-900'>{lease.property?.name || '\u2014'}</div>
                    <div className='text-sm text-neutral-500'>
                      {lease.unitRef?.unitNumber
                        ? `Unit ${lease.unitRef.unitNumber}`
                        : lease.unit
                          ? `Unit ${lease.unit}`
                          : ''}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-neutral-900'>{formatDate(lease.startDate)}</div>
                    <div className='text-sm text-neutral-500'>to {formatDate(lease.endDate)}</div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-neutral-900'>
                    KES {Number(lease.monthlyRent).toLocaleString()}/mo
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-neutral-900'>
                    KES {Number(lease.securityDeposit).toLocaleString()}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lease.status)}`}
                    >
                      {lease.status}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-neutral-500 space-x-2'>
                    <button>View</button>
                    <button>Renew</button>
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
