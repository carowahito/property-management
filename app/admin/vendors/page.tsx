'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Vendor {
  id: string;
  name: string;
  category: string;
  email: string;
  phone: string;
  rating: number;
  completedJobs: number;
  activeJobs: number;
  status: 'active' | 'inactive' | 'suspended';
  vendorType: 'individual' | 'company';
}

export default function AdminVendorsPage() {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const vendors: Vendor[] = [
    {
      id: 'VND-001',
      name: 'John Plumbing Services',
      category: 'Plumbing',
      email: 'john@plumbing.com',
      phone: '+254 712 345 678',
      rating: 4.8,
      completedJobs: 45,
      activeJobs: 3,
      status: 'active',
      vendorType: 'individual',
    },
    {
      id: 'VND-002',
      name: 'Elite Electrical Co.',
      category: 'Electrical',
      email: 'info@eliteelectrical.com',
      phone: '+254 723 456 789',
      rating: 4.9,
      completedJobs: 62,
      activeJobs: 5,
      status: 'active',
      vendorType: 'company',
    },
    {
      id: 'VND-003',
      name: 'Quick Paint Solutions',
      category: 'Painting',
      email: 'quickpaint@email.com',
      phone: '+254 734 567 890',
      rating: 4.5,
      completedJobs: 38,
      activeJobs: 2,
      status: 'active',
      vendorType: 'company',
    },
    {
      id: 'VND-004',
      name: 'Garden Pro Landscaping',
      category: 'Landscaping',
      email: 'gardenpro@email.com',
      phone: '+254 745 678 901',
      rating: 4.7,
      completedJobs: 28,
      activeJobs: 1,
      status: 'active',
      vendorType: 'company',
    },
    {
      id: 'VND-005',
      name: 'Mike HVAC Repairs',
      category: 'HVAC',
      email: 'mike@hvacrepairs.com',
      phone: '+254 756 789 012',
      rating: 4.6,
      completedJobs: 51,
      activeJobs: 4,
      status: 'active',
      vendorType: 'individual',
    },
  ];

  const filteredVendors = vendors.filter(
    (vendor) =>
      (vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterCategory === 'all' || vendor.category === filterCategory)
  );

  const stats = {
    totalVendors: vendors.length,
    activeVendors: vendors.filter((v) => v.status === 'active').length,
    totalCompletedJobs: vendors.reduce((sum, v) => sum + v.completedJobs, 0),
    avgRating: (vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length).toFixed(1),
  };

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Vendors CRM</h1>
          <p className='text-gray-600 mt-1'>Manage vendor relationships and performance</p>
        </div>
        <Button variant="primary" size="lg">+ Add Vendor</Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Total Vendors</p>
          <p className='text-3xl font-bold text-blue-600'>{stats.totalVendors}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Active Vendors</p>
          <p className='text-3xl font-bold text-green-600'>{stats.activeVendors}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Completed Jobs</p>
          <p className='text-3xl font-bold text-purple-600'>{stats.totalCompletedJobs}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Average Rating</p>
          <p className='text-3xl font-bold text-yellow-600'>{stats.avgRating} ⭐</p>
        </div>
      </div>

      <div className='bg-white shadow rounded-lg p-6'>
        <div className='mb-4 flex gap-4'>
          <input
            type='text'
            placeholder='Search vendors by name or category...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
          >
            <option value='all'>All Categories</option>
            <option value='Plumbing'>Plumbing</option>
            <option value='Electrical'>Electrical</option>
            <option value='Painting'>Painting</option>
            <option value='Landscaping'>Landscaping</option>
            <option value='HVAC'>HVAC</option>
          </select>
        </div>

        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Vendor
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Category
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Contact
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Type
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Rating
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Jobs
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
                <tr key={vendor.id} className='hover:bg-gray-50 cursor-pointer' onClick={() => window.location.href = `/admin/vendors/${vendor.id}`}>
                  <td className='px-6 py-4'>
                    <div className='flex items-center'>
                      <div className='h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center'>
                        <span className='text-orange-600 font-semibold text-lg'>
                          {vendor.name.charAt(0)}
                        </span>
                      </div>
                      <div className='ml-4'>
                        <Link href={`/admin/vendors/${vendor.id}`} className='text-sm font-medium text-blue-600 hover:text-blue-800'>
                          {vendor.name}
                        </Link>
                        <p className='text-sm text-gray-500'>ID: {vendor.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <span className='px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800'>
                      {vendor.category}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <p className='text-sm text-gray-900'>{vendor.email}</p>
                    <p className='text-sm text-gray-500'>{vendor.phone}</p>
                  </td>
                  <td className='px-6 py-4'>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        vendor.vendorType === 'company'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {vendor.vendorType}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center'>
                      <span className='text-yellow-500 mr-1'>⭐</span>
                      <span className='text-sm font-semibold text-gray-900'>{vendor.rating}</span>
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <p className='text-sm text-gray-900'>
                      <span className='font-semibold text-green-600'>{vendor.completedJobs}</span> completed
                    </p>
                    <p className='text-sm text-gray-500'>
                      <span className='font-semibold text-blue-600'>{vendor.activeJobs}</span> active
                    </p>
                  </td>
                  <td className='px-6 py-4'>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        vendor.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : vendor.status === 'suspended'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {vendor.status}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-sm space-x-2'>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedVendor(vendor)}
                    >
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Details Modal */}
      {selectedVendor && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold text-gray-900'>Vendor Details</h2>
                <button
                  onClick={() => setSelectedVendor(null)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>

              <div className='space-y-4'>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h3 className='font-semibold text-gray-900 mb-2'>Contact Information</h3>
                  <p className='text-sm text-gray-600'>Name: {selectedVendor.name}</p>
                  <p className='text-sm text-gray-600'>Category: {selectedVendor.category}</p>
                  <p className='text-sm text-gray-600'>Type: {selectedVendor.vendorType}</p>
                  <p className='text-sm text-gray-600'>Email: {selectedVendor.email}</p>
                  <p className='text-sm text-gray-600'>Phone: {selectedVendor.phone}</p>
                </div>

                <div className='bg-gray-50 rounded-lg p-4'>
                  <h3 className='font-semibold text-gray-900 mb-2'>Performance</h3>
                  <p className='text-sm text-gray-600'>Rating: {selectedVendor.rating} ⭐</p>
                  <p className='text-sm text-gray-600'>
                    Completed Jobs: {selectedVendor.completedJobs}
                  </p>
                  <p className='text-sm text-gray-600'>Active Jobs: {selectedVendor.activeJobs}</p>
                  <p className='text-sm text-gray-600'>Status: {selectedVendor.status}</p>
                </div>

                <div className='flex gap-3 pt-4'>
                  <Button
                    onClick={() => setSelectedVendor(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button variant="primary" className="flex-1">
                    Edit Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
