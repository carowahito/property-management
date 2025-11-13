'use client';

import { useState } from 'react';

interface Lease {
  id: string;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  securityDeposit: number;
  status: 'active' | 'expiring-soon' | 'expired' | 'pending';
  renewalOption: boolean;
}

export default function LeasesPage() {
  const [leases] = useState<Lease[]>([
    {
      id: '1',
      tenantName: 'John Mwangi',
      propertyName: 'Sunset Apartments',
      unitNumber: '5A',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      rentAmount: 45000,
      securityDeposit: 90000,
      status: 'expiring-soon',
      renewalOption: true,
    },
    {
      id: '2',
      tenantName: 'Jane Achieng',
      propertyName: 'Highland House',
      unitNumber: '12',
      startDate: '2024-03-15',
      endDate: '2025-03-14',
      rentAmount: 75000,
      securityDeposit: 150000,
      status: 'active',
      renewalOption: true,
    },
    {
      id: '3',
      tenantName: 'Peter Omondi',
      propertyName: 'Vista Plaza Office',
      unitNumber: '8B',
      startDate: '2024-02-01',
      endDate: '2025-01-31',
      rentAmount: 120000,
      securityDeposit: 240000,
      status: 'active',
      renewalOption: false,
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredLeases = leases.filter(
    (lease) => filterStatus === 'all' || lease.status === filterStatus
  );

  const stats = {
    totalLeases: leases.length,
    activeLeases: leases.filter((l) => l.status === 'active').length,
    expiringSoon: leases.filter((l) => l.status === 'expiring-soon').length,
    totalRevenue: leases.reduce((sum, l) => sum + l.rentAmount, 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expiring-soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Lease Management</h1>
          <p className='text-gray-600 mt-1'>View and manage all lease agreements</p>
        </div>
        <button className='bg-blue-600 hover:bg-blue-700'>+ Create New Lease</button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Total Leases</p>
          <p className='text-3xl font-bold text-gray-900'>{stats.totalLeases}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Active Leases</p>
          <p className='text-3xl font-bold text-green-600'>{stats.activeLeases}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Expiring Soon</p>
          <p className='text-3xl font-bold text-yellow-600'>{stats.expiringSoon}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Monthly Revenue</p>
          <p className='text-3xl font-bold text-blue-600'>
            KES {stats.totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className='bg-white shadow rounded-lg p-4'>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        >
          <option value='all'>All Leases</option>
          <option value='active'>Active</option>
          <option value='expiring-soon'>Expiring Soon</option>
          <option value='expired'>Expired</option>
          <option value='pending'>Pending</option>
        </select>
      </div>

      {/* Leases Table */}
      <div className='bg-white shadow rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Tenant
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Property/Unit
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Lease Period
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Rent Amount
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Security Deposit
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Status
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {filteredLeases.map((lease) => (
              <tr key={lease.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm font-medium text-gray-900'>{lease.tenantName}</div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-900'>{lease.propertyName}</div>
                  <div className='text-sm text-gray-500'>Unit {lease.unitNumber}</div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-900'>{lease.startDate}</div>
                  <div className='text-sm text-gray-500'>to {lease.endDate}</div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  KES {lease.rentAmount.toLocaleString()}/mo
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  KES {lease.securityDeposit.toLocaleString()}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lease.status)}`}
                  >
                    {lease.status.replace('-', ' ')}
                  </span>
                  {lease.renewalOption && (
                    <span className='ml-2 text-xs text-blue-600'>🔄 Renewable</span>
                  )}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2'>
                  <button  >
                    View
                  </button>
                  <button  >
                    Renew
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
