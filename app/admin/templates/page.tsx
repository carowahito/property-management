'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Template {
  id: string;
  name: string;
  category: 'lease-agreement' | 'notice' | 'form' | 'report' | 'letter';
  propertyType: 'residential' | 'commercial' | 'all';
  lastModified: string;
  usageCount: number;
  status: 'active' | 'draft' | 'archived';
}

export default function TemplatesPage() {
  const [templates] = useState<Template[]>([
    {
      id: '1',
      name: 'Standard Residential Lease Agreement',
      category: 'lease-agreement',
      propertyType: 'residential',
      lastModified: '2024-02-15',
      usageCount: 48,
      status: 'active',
    },
    {
      id: '2',
      name: 'Commercial Lease Agreement',
      category: 'lease-agreement',
      propertyType: 'commercial',
      lastModified: '2024-01-20',
      usageCount: 12,
      status: 'active',
    },
    {
      id: '3',
      name: 'Rent Increase Notice',
      category: 'notice',
      propertyType: 'all',
      lastModified: '2024-03-01',
      usageCount: 8,
      status: 'active',
    },
    {
      id: '4',
      name: 'Lease Termination Notice',
      category: 'notice',
      propertyType: 'all',
      lastModified: '2024-02-10',
      usageCount: 15,
      status: 'active',
    },
    {
      id: '5',
      name: 'Maintenance Request Form',
      category: 'form',
      propertyType: 'all',
      lastModified: '2024-01-05',
      usageCount: 67,
      status: 'active',
    },
    {
      id: '6',
      name: 'Move-In Inspection Report',
      category: 'report',
      propertyType: 'residential',
      lastModified: '2024-02-28',
      usageCount: 22,
      status: 'active',
    },
    {
      id: '7',
      name: 'Late Payment Warning Letter',
      category: 'letter',
      propertyType: 'all',
      lastModified: '2024-03-05',
      usageCount: 5,
      status: 'draft',
    },
  ]);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const filteredTemplates = templates.filter(
    (t) => filterCategory === 'all' || t.category === filterCategory
  );

  const stats = {
    totalActive: templates.filter((t) => t.status === 'active').length,
    totalDraft: templates.filter((t) => t.status === 'draft').length,
    totalUsage: templates.reduce((sum, t) => sum + t.usageCount, 0),
    totalTemplates: templates.length,
  };

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-neutral-900'>Document Templates</h1>
          <p className='text-neutral-600 mt-1'>
            Create and manage lease agreement and document templates
          </p>
        </div>
        <Button variant="primary" size="lg">+ Create Template</Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Active Templates</p>
          <p className='text-3xl font-bold text-success-600'>{stats.totalActive}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Draft Templates</p>
          <p className='text-3xl font-bold text-yellow-600'>{stats.totalDraft}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Total Usage</p>
          <p className='text-3xl font-bold text-primary-600'>{stats.totalUsage}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>All Templates</p>
          <p className='text-3xl font-bold text-purple-600'>{stats.totalTemplates}</p>
        </div>
      </div>

      <div className='bg-surface shadow rounded-lg p-4'>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className='px-4 py-2 border border-neutral-300 rounded-lg'
        >
          <option value='all'>All Categories</option>
          <option value='lease-agreement'>Lease Agreements</option>
          <option value='notice'>Notices</option>
          <option value='form'>Forms</option>
          <option value='report'>Reports</option>
          <option value='letter'>Letters</option>
        </select>
      </div>

      <div className='bg-surface shadow rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-neutral-200'>
          <thead className='bg-neutral-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Template Name
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Category
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Property Type
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Last Modified
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Usage Count
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
            {filteredTemplates.map((template) => (
              <tr key={template.id} className='hover:bg-neutral-50'>
                <td className='px-6 py-4 text-sm font-medium text-neutral-900'>{template.name}</td>
                <td className='px-6 py-4 text-sm text-neutral-900 capitalize'>
                  {template.category.replace('-', ' ')}
                </td>
                <td className='px-6 py-4 text-sm text-neutral-900 capitalize'>
                  {template.propertyType}
                </td>
                <td className='px-6 py-4 text-sm text-neutral-900'>{template.lastModified}</td>
                <td className='px-6 py-4 text-sm text-neutral-900'>{template.usageCount} times</td>
                <td className='px-6 py-4'>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      template.status === 'active'
                        ? 'bg-success-100 text-green-800'
                        : template.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-neutral-100 text-neutral-800'
                    }`}
                  >
                    {template.status}
                  </span>
                </td>
                <td className='px-6 py-4 text-sm space-x-2'>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="primary" size="sm">
                    Use
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
