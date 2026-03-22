'use client';

import { useState } from 'react';

interface Landlord {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertiesOwned: number;
  totalUnits: number;
  monthlyRevenue: number;
  status: 'active' | 'inactive';
  joinedDate: string;
  payoutSchedule: 'monthly' | 'bi-weekly' | 'weekly';
}

export default function LandlordsPage() {
  const [landlords] = useState<Landlord[]>([
    {
      id: '1',
      name: 'Samuel Kamau',
      email: 'samuel.kamau@email.com',
      phone: '+254 712 111 222',
      propertiesOwned: 3,
      totalUnits: 12,
      monthlyRevenue: 540000,
      status: 'active',
      joinedDate: '2023-01-15',
      payoutSchedule: 'monthly',
    },
    {
      id: '2',
      name: 'Grace Muthoni',
      email: 'grace.muthoni@email.com',
      phone: '+254 723 333 444',
      propertiesOwned: 5,
      totalUnits: 20,
      monthlyRevenue: 900000,
      status: 'active',
      joinedDate: '2022-08-20',
      payoutSchedule: 'monthly',
    },
    {
      id: '3',
      name: 'David Otieno',
      email: 'david.otieno@email.com',
      phone: '+254 734 555 666',
      propertiesOwned: 2,
      totalUnits: 8,
      monthlyRevenue: 360000,
      status: 'active',
      joinedDate: '2023-03-10',
      payoutSchedule: 'bi-weekly',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredLandlords = landlords.filter(
    (landlord) =>
      landlord.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      landlord.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalLandlords: landlords.length,
    activeLandlords: landlords.filter((l) => l.status === 'active').length,
    totalProperties: landlords.reduce((sum, l) => sum + l.propertiesOwned, 0),
    totalRevenue: landlords.reduce((sum, l) => sum + l.monthlyRevenue, 0),
  };

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-neutral-900'>Landlords</h1>
          <p className='text-neutral-600 mt-1'>Manage property owners and relationships</p>
        </div>
        <button className='bg-primary-600 hover:bg-primary-700'>+ Add Landlord</button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Total Landlords</p>
          <p className='text-3xl font-bold text-neutral-900'>{stats.totalLandlords}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Active</p>
          <p className='text-3xl font-bold text-success-600'>{stats.activeLandlords}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Total Properties</p>
          <p className='text-3xl font-bold text-primary-600'>{stats.totalProperties}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Monthly Revenue</p>
          <p className='text-3xl font-bold text-purple-600'>
            KES {stats.totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className='bg-surface shadow rounded-lg p-4'>
        <input
          type='text'
          placeholder='Search by name or email...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
        />
      </div>

      {/* Landlords Table */}
      <div className='bg-surface shadow rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-neutral-200'>
          <thead className='bg-neutral-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                Landlord
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                Contact
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                Properties
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                Total Units
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                Monthly Revenue
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                Payout Schedule
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
            {filteredLandlords.map((landlord) => (
              <tr key={landlord.id} className='hover:bg-neutral-50'>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center'>
                    <div className='h-10 w-10 flex-shrink-0 bg-purple-100 rounded-full flex items-center justify-center'>
                      <span className='text-purple-600 font-semibold'>
                        {landlord.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                    </div>
                    <div className='ml-4'>
                      <div className='text-sm font-medium text-neutral-900'>{landlord.name}</div>
                      <div className='text-xs text-neutral-500'>Joined {landlord.joinedDate}</div>
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-neutral-900'>{landlord.email}</div>
                  <div className='text-sm text-neutral-500'>{landlord.phone}</div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-neutral-900'>
                  {landlord.propertiesOwned}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-neutral-900'>
                  {landlord.totalUnits}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-semibold text-neutral-900'>
                  KES {landlord.monthlyRevenue.toLocaleString()}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-neutral-900'>
                  {landlord.payoutSchedule}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      landlord.status === 'active'
                        ? 'bg-success-100 text-green-800'
                        : 'bg-neutral-100 text-neutral-800'
                    }`}
                  >
                    {landlord.status}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-neutral-500 space-x-2'>
                  <button  >
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
