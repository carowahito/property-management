'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface Template {
  id: string;
  name: string;
  type: string;
  category: 'lease-agreement' | 'notice' | 'form' | 'report' | 'letter';
  propertyType: 'residential' | 'commercial' | 'all';
  lastModified: string;
  usageCount: number;
  status: 'active' | 'draft' | 'archived';
  isActive?: boolean;
  updatedAt?: string;
  _count?: { leases: number };
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/lease-templates')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch templates');
        return res.json();
      })
      .then((data) => {
        setTemplates(data.templates || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const filteredTemplates = templates.filter(
    (t) => filterCategory === 'all' || t.type === filterCategory
  );

  const stats = {
    totalActive: templates.filter((t) => t.isActive).length,
    totalDraft: 0, // Not tracked in schema
    totalUsage: templates.reduce((sum, t) => sum + (t._count?.leases || 0), 0),
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
        {loading ? (
          <div className='p-8 text-center text-neutral-500'>Loading templates...</div>
        ) : error ? (
          <div className='p-8 text-center text-danger-600'>Error: {error}</div>
        ) : (
          <table className='min-w-full divide-y divide-neutral-200'>
            <thead className='bg-neutral-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                  Template Name
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                  Type
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                  Last Updated
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                  Usage Count
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                  Active
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
                  <td className='px-6 py-4 text-sm text-neutral-900 capitalize'>{template.type}</td>
                  <td className='px-6 py-4 text-sm text-neutral-900'>{template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : '-'}</td>
                  <td className='px-6 py-4 text-sm text-neutral-900'>{template._count?.leases || 0} times</td>
                  <td className='px-6 py-4'>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${template.isActive ? 'bg-success-100 text-green-800' : 'bg-neutral-100 text-neutral-800'}`}>
                      {template.isActive ? 'Active' : 'Inactive'}
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
        )}
      </div>
    </div>
  );
}
