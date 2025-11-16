'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ComplianceItem {
  id: string;
  propertyName: string;
  requirement: string;
  category: 'safety' | 'environmental' | 'licensing' | 'insurance' | 'health';
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring-soon' | 'expired';
  certificationBody: string;
}

export default function CompliancePage() {
  const [items] = useState<ComplianceItem[]>([
    {
      id: '1',
      propertyName: 'Sunset Apartments',
      requirement: 'Fire Safety Certificate',
      category: 'safety',
      issueDate: '2023-06-01',
      expiryDate: '2024-06-01',
      status: 'expiring-soon',
      certificationBody: 'Nairobi County Fire Department',
    },
    {
      id: '2',
      propertyName: 'Highland House',
      requirement: 'Building Permit',
      category: 'licensing',
      issueDate: '2022-01-15',
      expiryDate: '2025-01-15',
      status: 'valid',
      certificationBody: 'County Government',
    },
    {
      id: '3',
      propertyName: 'Vista Plaza',
      requirement: 'Environmental Compliance',
      category: 'environmental',
      issueDate: '2023-03-10',
      expiryDate: '2024-03-10',
      status: 'expiring-soon',
      certificationBody: 'NEMA',
    },
    {
      id: '4',
      propertyName: 'Garden Estate',
      requirement: 'Property Insurance',
      category: 'insurance',
      issueDate: '2024-01-01',
      expiryDate: '2025-01-01',
      status: 'valid',
      certificationBody: 'Britam Insurance',
    },
    {
      id: '5',
      propertyName: 'Riverside Towers',
      requirement: 'Health & Safety Inspection',
      category: 'health',
      issueDate: '2023-09-01',
      expiryDate: '2024-02-01',
      status: 'expired',
      certificationBody: 'Ministry of Health',
    },
  ]);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const filteredItems = items.filter(
    (i) => filterCategory === 'all' || i.category === filterCategory
  );

  const stats = {
    valid: items.filter((i) => i.status === 'valid').length,
    expiringSoon: items.filter((i) => i.status === 'expiring-soon').length,
    expired: items.filter((i) => i.status === 'expired').length,
    total: items.length,
  };

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Compliance Management</h1>
          <p className='text-gray-600 mt-1'>Monitor regulatory compliance and certifications</p>
        </div>
        <Button variant="primary" size="lg">+ Add Compliance Item</Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Valid</p>
          <p className='text-3xl font-bold text-green-600'>{stats.valid}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Expiring Soon</p>
          <p className='text-3xl font-bold text-yellow-600'>{stats.expiringSoon}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Expired</p>
          <p className='text-3xl font-bold text-red-600'>{stats.expired}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Total Items</p>
          <p className='text-3xl font-bold text-purple-600'>{stats.total}</p>
        </div>
      </div>

      <div className='bg-white shadow rounded-lg p-4'>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className='px-4 py-2 border border-gray-300 rounded-lg'
        >
          <option value='all'>All Categories</option>
          <option value='safety'>Safety</option>
          <option value='environmental'>Environmental</option>
          <option value='licensing'>Licensing</option>
          <option value='insurance'>Insurance</option>
          <option value='health'>Health</option>
        </select>
      </div>

      <div className='bg-white shadow rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Property
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Requirement
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Category
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Certification Body
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Issue Date
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Expiry Date
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
            {filteredItems.map((item) => (
              <tr key={item.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 text-sm font-medium text-gray-900'>{item.propertyName}</td>
                <td className='px-6 py-4 text-sm text-gray-900'>{item.requirement}</td>
                <td className='px-6 py-4 text-sm text-gray-900 capitalize'>{item.category}</td>
                <td className='px-6 py-4 text-sm text-gray-900'>{item.certificationBody}</td>
                <td className='px-6 py-4 text-sm text-gray-900'>{item.issueDate}</td>
                <td className='px-6 py-4 text-sm text-gray-900'>{item.expiryDate}</td>
                <td className='px-6 py-4'>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      item.status === 'valid'
                        ? 'bg-green-100 text-green-800'
                        : item.status === 'expiring-soon'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.status.replace('-', ' ')}
                  </span>
                </td>
                <td className='px-6 py-4 text-sm space-x-2'>
                  <Button variant="primary" size="sm">
                    View
                  </Button>
                  <Button variant="success" size="sm">
                    Renew
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
