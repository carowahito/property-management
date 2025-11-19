'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Landlord {
  id: string
  name: string
  email: string
  phone: string
  status: string
  _count: {
    properties: number
    payouts: number
  }
}

interface LandlordsResponse {
  landlords: Landlord[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

async function fetchLandlords(): Promise<LandlordsResponse> {
  const response = await fetch('/api/mock/landlords')
  if (!response.ok) {
    throw new Error('Failed to fetch landlords')
  }
  return response.json()
}

export default function AdminLandlordsPage() {
  const [selectedLandlord, setSelectedLandlord] = useState<Landlord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProperty, setFilterProperty] = useState<string>('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['landlords'],
    queryFn: fetchLandlords,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load landlords. Please try again.</p>
      </div>
    )
  }

  const landlords = data?.landlords || []

  const filteredLandlords = landlords.filter(
    (landlord) => {
      const matchesSearch = landlord.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        landlord.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || landlord.status === filterStatus
      // Note: Property filter would require landlord data to include property names
      // For now, we'll keep it simple with just status filter
      return matchesSearch && matchesStatus
    }
  );

  const stats = {
    totalLandlords: landlords.length,
    activeLandlords: landlords.filter((l) => l.status === 'ACTIVE').length,
    inactiveLandlords: landlords.filter((l) => l.status === 'INACTIVE').length,
    totalProperties: landlords.reduce((sum, l) => sum + l._count.properties, 0),
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
        <div className='mb-4 grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className="md:col-span-2">
            <input
              type='text'
              placeholder='Search landlords by name or email...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
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
              {filteredLandlords.map((landlord) => (
                <tr key={landlord.id} className='hover:bg-gray-50'>
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
                        <p className='text-sm text-gray-500'>{landlord._count.payouts} payouts</p>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <p className='text-sm text-gray-900'>{landlord.email}</p>
                    <p className='text-sm text-gray-500'>{landlord.phone}</p>
                  </td>
                  <td className='px-6 py-4'>
                    <p className='text-sm font-semibold text-blue-600'>{landlord._count.properties} properties</p>
                  </td>
                  <td className='px-6 py-4'>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        landlord.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : landlord.status === 'SUSPENDED'
                          ? 'bg-red-100 text-red-800'
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
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedLandlord(landlord)
                      }}
                    >
                      View
                    </Button>
                    <Link href={`/admin/landlords/${landlord.id}`}>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
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
                  <p className='text-sm text-gray-600'>Status: <span className={`font-semibold ${
                    selectedLandlord.status === 'ACTIVE' ? 'text-green-600' :
                    selectedLandlord.status === 'SUSPENDED' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>{selectedLandlord.status}</span></p>
                </div>

                <div className='bg-gray-50 rounded-lg p-4'>
                  <h3 className='font-semibold text-gray-900 mb-2'>Portfolio Summary</h3>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <p className='text-sm text-gray-600'>Properties</p>
                      <p className='text-2xl font-bold text-blue-600'>{selectedLandlord._count.properties}</p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-600'>Payouts</p>
                      <p className='text-2xl font-bold text-green-600'>{selectedLandlord._count.payouts}</p>
                    </div>
                  </div>
                  <Link href={`/admin/landlords/${selectedLandlord.id}`} className="block mt-4">
                    <Button variant="outline" className="w-full">
                      View Full Details →
                    </Button>
                  </Link>
                </div>

                <div className='flex gap-3 pt-4'>
                  <Button
                    onClick={() => setSelectedLandlord(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Link href={`/admin/landlords/${selectedLandlord.id}`} className="flex-1">
                    <Button variant="primary" className="w-full">
                      Full Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
