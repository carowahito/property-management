'use client';

import { useState } from 'react';
import Link from 'next/link';
import { mockLandlords, getPropertiesByLandlordId } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';

export default function AdminLandlordsPage() {
  const [selectedLandlord, setSelectedLandlord] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLandlords = mockLandlords.filter(
    (landlord) =>
      landlord.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      landlord.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalLandlords: mockLandlords.length,
    activeLandlords: mockLandlords.filter((l) => l.status === 'active').length,
    inactiveLandlords: mockLandlords.filter((l) => l.status === 'inactive').length,
    totalProperties: mockLandlords.reduce(
      (sum, l) => sum + getPropertiesByLandlordId(l.id).length,
      0
    ),
  };

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Landlords CRM</h1>
          <p className='text-gray-600 mt-1'>Manage landlord relationships and portfolios</p>
        </div>
        <Button variant="primary" size="lg">+ Add Landlord</Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Total Landlords</p>
          <p className='text-3xl font-bold text-blue-600'>{stats.totalLandlords}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Active</p>
          <p className='text-3xl font-bold text-green-600'>{stats.activeLandlords}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Inactive</p>
          <p className='text-3xl font-bold text-gray-600'>{stats.inactiveLandlords}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Total Properties</p>
          <p className='text-3xl font-bold text-purple-600'>{stats.totalProperties}</p>
        </div>
      </div>

      <div className='bg-white shadow rounded-lg p-6'>
        <div className='mb-4'>
          <input
            type='text'
            placeholder='Search landlords by name or email...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>

        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Landlord
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Contact
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Properties
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
              {filteredLandlords.map((landlord) => {
                const properties = getPropertiesByLandlordId(landlord.id);
                return (
                  <tr key={landlord.id} className='hover:bg-gray-50 cursor-pointer' onClick={() => window.location.href = `/admin/landlords/${landlord.id}`}>
                    <td className='px-6 py-4'>
                      <div className='flex items-center'>
                        <div className='h-10 w-10 rounded-full bg-green-100 flex items-center justify-center'>
                          <span className='text-green-600 font-semibold text-lg'>
                            {landlord.name.charAt(0)}
                          </span>
                        </div>
                        <div className='ml-4'>
                          <Link href={`/admin/landlords/${landlord.id}`} className='text-sm font-medium text-blue-600 hover:text-blue-800'>
                            {landlord.name}
                          </Link>
                          <p className='text-sm text-gray-500'>ID: {landlord.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <p className='text-sm text-gray-900'>{landlord.email}</p>
                      <p className='text-sm text-gray-500'>{landlord.phone}</p>
                    </td>
                    <td className='px-6 py-4'>
                      <p className='text-sm font-semibold text-blue-600'>{properties.length} properties</p>
                    </td>
                    <td className='px-6 py-4'>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          landlord.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {landlord.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-sm space-x-2'>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedLandlord(landlord)}
                      >
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Landlord Details Modal */}
      {selectedLandlord && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold text-gray-900'>Landlord Details</h2>
                <button
                  onClick={() => setSelectedLandlord(null)}
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
                  <p className='text-sm text-gray-600'>Name: {selectedLandlord.name}</p>
                  <p className='text-sm text-gray-600'>Email: {selectedLandlord.email}</p>
                  <p className='text-sm text-gray-600'>Phone: {selectedLandlord.phone}</p>
                </div>

                <div className='bg-gray-50 rounded-lg p-4'>
                  <h3 className='font-semibold text-gray-900 mb-2'>Portfolio</h3>
                  <p className='text-sm text-gray-600'>
                    Properties: {getPropertiesByLandlordId(selectedLandlord.id).length}
                  </p>
                  <div className='mt-2 space-y-1'>
                    {getPropertiesByLandlordId(selectedLandlord.id).map((property) => (
                      <p key={property.id} className='text-sm text-blue-600'>
                        • {property.name}
                      </p>
                    ))}
                  </div>
                </div>

                <div className='flex gap-3 pt-4'>
                  <Button
                    onClick={() => setSelectedLandlord(null)}
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
