'use client';

import { useState } from 'react';

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyName: string;
  unitNumber: string;
  leaseStart: string;
  leaseEnd: string;
  rentAmount: number;
  status: 'active' | 'pending' | 'expired';
  paymentStatus: 'current' | 'late' | 'overdue';
}

export default function RentersPage() {
  const [tenants] = useState<Tenant[]>([
    {
      id: '1',
      name: 'John Mwangi',
      email: 'john.mwangi@email.com',
      phone: '+254 712 345 678',
      propertyName: 'Sunset Apartments',
      unitNumber: '5A',
      leaseStart: '2024-01-01',
      leaseEnd: '2024-12-31',
      rentAmount: 45000,
      status: 'active',
      paymentStatus: 'current',
    },
    {
      id: '2',
      name: 'Jane Achieng',
      email: 'jane.achieng@email.com',
      phone: '+254 723 456 789',
      propertyName: 'Highland House',
      unitNumber: '12',
      leaseStart: '2024-03-15',
      leaseEnd: '2025-03-14',
      rentAmount: 75000,
      status: 'active',
      paymentStatus: 'current',
    },
    {
      id: '3',
      name: 'Peter Omondi',
      email: 'peter.omondi@email.com',
      phone: '+254 734 567 890',
      propertyName: 'Vista Plaza Office',
      unitNumber: '8B',
      leaseStart: '2024-02-01',
      leaseEnd: '2025-01-31',
      rentAmount: 120000,
      status: 'active',
      paymentStatus: 'late',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.propertyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || tenant.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalTenants: tenants.length,
    activeTenants: tenants.filter((t) => t.status === 'active').length,
    currentPayments: tenants.filter((t) => t.paymentStatus === 'current').length,
    latePayments: tenants.filter((t) => t.paymentStatus === 'late').length,
  };

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Tenants & Renters</h1>
          <p className='text-gray-600 mt-1'>Manage tenant information and lease agreements</p>
        </div>
        <button className='bg-blue-600 hover:bg-blue-700'>+ Add New Tenant</button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Total Tenants</p>
          <p className='text-3xl font-bold text-gray-900'>{stats.totalTenants}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Active Leases</p>
          <p className='text-3xl font-bold text-green-600'>{stats.activeTenants}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Current Payments</p>
          <p className='text-3xl font-bold text-blue-600'>{stats.currentPayments}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Late Payments</p>
          <p className='text-3xl font-bold text-red-600'>{stats.latePayments}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className='bg-white shadow rounded-lg p-4'>
        <div className='flex gap-4'>
          <input
            type='text'
            placeholder='Search by name, email, or property...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          >
            <option value='all'>All Status</option>
            <option value='active'>Active</option>
            <option value='pending'>Pending</option>
            <option value='expired'>Expired</option>
          </select>
        </div>
      </div>

      {/* Tenants Table */}
      <div className='bg-white shadow rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Tenant
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Contact
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Property
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Lease Period
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Rent
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
            {filteredTenants.map((tenant) => (
              <tr key={tenant.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center'>
                    <div className='h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center'>
                      <span className='text-blue-600 font-semibold'>
                        {tenant.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                    </div>
                    <div className='ml-4'>
                      <div className='text-sm font-medium text-gray-900'>{tenant.name}</div>
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-900'>{tenant.email}</div>
                  <div className='text-sm text-gray-500'>{tenant.phone}</div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-900'>{tenant.propertyName}</div>
                  <div className='text-sm text-gray-500'>Unit {tenant.unitNumber}</div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-900'>{tenant.leaseStart}</div>
                  <div className='text-sm text-gray-500'>to {tenant.leaseEnd}</div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  KES {tenant.rentAmount.toLocaleString()}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      tenant.paymentStatus === 'current'
                        ? 'bg-green-100 text-green-800'
                        : tenant.paymentStatus === 'late'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {tenant.paymentStatus}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  <button   className='mr-2'>
                    View
                  </button>
                  <button  >
                    Edit
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
