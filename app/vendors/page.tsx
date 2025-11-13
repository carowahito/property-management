'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Vendor {
  id: string;
  name: string;
  category: 'plumbing' | 'electrical' | 'cleaning' | 'landscaping' | 'hvac' | 'general-maintenance';
  phone: string;
  email: string;
  rating: number;
  activeContracts: number;
  totalJobs: number;
  status: 'active' | 'inactive';
}

export default function VendorsPage() {
  const [vendors] = useState<Vendor[]>([
    {
      id: '1',
      name: 'Nairobi Plumbing Services',
      category: 'plumbing',
      phone: '+254 712 345 678',
      email: 'info@nairobiPlumbing.co.ke',
      rating: 4.8,
      activeContracts: 3,
      totalJobs: 45,
      status: 'active',
    },
    {
      id: '2',
      name: 'Bright Electric Ltd',
      category: 'electrical',
      phone: '+254 723 456 789',
      email: 'contact@brightelectric.co.ke',
      rating: 4.5,
      activeContracts: 2,
      totalJobs: 32,
      status: 'active',
    },
    {
      id: '3',
      name: 'CleanSweep Co',
      category: 'cleaning',
      phone: '+254 734 567 890',
      email: 'hello@cleansweep.co.ke',
      rating: 4.9,
      activeContracts: 5,
      totalJobs: 78,
      status: 'active',
    },
    {
      id: '4',
      name: 'Green Gardens',
      category: 'landscaping',
      phone: '+254 745 678 901',
      email: 'info@greengardens.co.ke',
      rating: 4.3,
      activeContracts: 1,
      totalJobs: 18,
      status: 'active',
    },
    {
      id: '5',
      name: 'HVAC Masters',
      category: 'hvac',
      phone: '+254 756 789 012',
      email: 'service@hvacmasters.co.ke',
      rating: 4.6,
      activeContracts: 2,
      totalJobs: 28,
      status: 'inactive',
    },
  ]);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const filteredVendors = vendors.filter(
    (v) => filterCategory === 'all' || v.category === filterCategory
  );

  const stats = {
    totalActive: vendors.filter((v) => v.status === 'active').length,
    totalContracts: vendors.reduce((sum, v) => sum + v.activeContracts, 0),
    avgRating: (vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length).toFixed(1),
    totalVendors: vendors.length,
  };

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Vendor Management</h1>
          <p className='text-gray-600 mt-1'>Track and manage service vendors and contractors</p>
        </div>
        <Button className='bg-blue-600 hover:bg-blue-700'>+ Add Vendor</Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Active Vendors</p>
          <p className='text-3xl font-bold text-green-600'>{stats.totalActive}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Active Contracts</p>
          <p className='text-3xl font-bold text-blue-600'>{stats.totalContracts}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Avg Rating</p>
          <p className='text-3xl font-bold text-yellow-600'>{stats.avgRating} ★</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Total Vendors</p>
          <p className='text-3xl font-bold text-purple-600'>{stats.totalVendors}</p>
        </div>
      </div>

      <div className='bg-white shadow rounded-lg p-4'>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className='px-4 py-2 border border-gray-300 rounded-lg'
        >
          <option value='all'>All Categories</option>
          <option value='plumbing'>Plumbing</option>
          <option value='electrical'>Electrical</option>
          <option value='cleaning'>Cleaning</option>
          <option value='landscaping'>Landscaping</option>
          <option value='hvac'>HVAC</option>
          <option value='general-maintenance'>General Maintenance</option>
        </select>
      </div>

      <div className='bg-white shadow rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Vendor Name
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Category
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Contact
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Rating
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Active Contracts
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Total Jobs
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
            {filteredVendors.map((vendor) => (
              <tr key={vendor.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 text-sm font-medium text-gray-900'>{vendor.name}</td>
                <td className='px-6 py-4 text-sm text-gray-900 capitalize'>
                  {vendor.category.replace('-', ' ')}
                </td>
                <td className='px-6 py-4'>
                  <div className='text-sm text-gray-900'>{vendor.phone}</div>
                  <div className='text-sm text-gray-500'>{vendor.email}</div>
                </td>
                <td className='px-6 py-4 text-sm font-semibold text-yellow-600'>
                  {vendor.rating} ★
                </td>
                <td className='px-6 py-4 text-sm text-gray-900'>{vendor.activeContracts}</td>
                <td className='px-6 py-4 text-sm text-gray-900'>{vendor.totalJobs}</td>
                <td className='px-6 py-4'>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      vendor.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {vendor.status}
                  </span>
                </td>
                <td className='px-6 py-4 text-sm space-x-2'>
                  <Button variant='outline' size='sm'>
                    View
                  </Button>
                  <Button variant='outline' size='sm'>
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
