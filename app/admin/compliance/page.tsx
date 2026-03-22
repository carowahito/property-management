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
  const [items] = useState<ComplianceItem[]>([]);

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
          <h1 className='text-3xl font-bold text-neutral-900'>Compliance Management</h1>
          <p className='text-neutral-600 mt-1'>Monitor regulatory compliance and certifications</p>
        </div>
        <Button variant="primary" size="lg">+ Add Compliance Item</Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Valid</p>
          <p className='text-3xl font-bold text-success-600'>{stats.valid}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Expiring Soon</p>
          <p className='text-3xl font-bold text-yellow-600'>{stats.expiringSoon}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Expired</p>
          <p className='text-3xl font-bold text-danger-600'>{stats.expired}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Total Items</p>
          <p className='text-3xl font-bold text-purple-600'>{stats.total}</p>
        </div>
      </div>

      <div className='bg-surface shadow rounded-lg p-4'>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className='px-4 py-2 border border-neutral-300 rounded-lg'
        >
          <option value='all'>All Categories</option>
          <option value='safety'>Safety</option>
          <option value='environmental'>Environmental</option>
          <option value='licensing'>Licensing</option>
          <option value='insurance'>Insurance</option>
          <option value='health'>Health</option>
        </select>
      </div>

      <div className='bg-surface shadow rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-neutral-200'>
          <thead className='bg-neutral-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Property
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Requirement
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Category
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Certification Body
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Issue Date
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Expiry Date
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
            {filteredItems.map((item) => (
              <tr key={item.id} className='hover:bg-neutral-50'>
                <td className='px-6 py-4 text-sm font-medium text-neutral-900'>{item.propertyName}</td>
                <td className='px-6 py-4 text-sm text-neutral-900'>{item.requirement}</td>
                <td className='px-6 py-4 text-sm text-neutral-900 capitalize'>{item.category}</td>
                <td className='px-6 py-4 text-sm text-neutral-900'>{item.certificationBody}</td>
                <td className='px-6 py-4 text-sm text-neutral-900'>{item.issueDate}</td>
                <td className='px-6 py-4 text-sm text-neutral-900'>{item.expiryDate}</td>
                <td className='px-6 py-4'>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      item.status === 'valid'
                        ? 'bg-success-100 text-green-800'
                        : item.status === 'expiring-soon'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-danger-100 text-red-800'
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
