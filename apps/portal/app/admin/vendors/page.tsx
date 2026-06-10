'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button'
import ArchiveDeleteButtons from '@/components/ui/ArchiveDeleteButtons';

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

const SPECIALIZATIONS = ['plumbing', 'electrical', 'carpentry', 'painting', 'cleaning', 'landscaping', 'security', 'pest_control', 'hvac', 'general']

export default function AdminVendorsPage() {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', phone: '', specialization: 'general' });

  const refreshVendors = () => {
    fetch('/api/vendors?limit=100')
      .then(r => r.json())
      .then(data => {
        const mapped = (data.vendors || []).map((v: any) => ({
          id: v.id,
          name: v.name,
          category: v.specialization,
          email: v.email,
          phone: v.phone,
          rating: v.rating || 0,
          completedJobs: v._count?.workOrders || 0,
          activeJobs: 0,
          status: (v.status || 'ACTIVE').toLowerCase() as 'active' | 'inactive' | 'suspended',
          vendorType: 'individual' as const,
        }));
        setVendors(mapped);
      });
  };

  const handleAddVendor = async () => {
    if (!addForm.name || !addForm.email || !addForm.phone) return;
    setSaving(true);
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      if (res.ok) {
        setShowAddModal(false);
        setAddForm({ name: '', email: '', phone: '', specialization: 'general' });
        refreshVendors();
      } else {
        const data = await res.json();
        alert(data.error || data.details?.[0]?.message || 'Failed to add vendor');
      }
    } catch { alert('Failed to add vendor'); }
    finally { setSaving(false); }
  };

  useEffect(() => { refreshVendors() }, []);

  const filteredVendors = vendors.filter(
    (vendor) =>
      (vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterCategory === 'all' || vendor.category === filterCategory)
  );

  const [pendingInviteCount, setPendingInviteCount] = useState(0)
  useEffect(() => {
    fetch('/api/invitations?role=VENDOR&status=PENDING')
      .then(r => r.ok ? r.json() : { pendingTenantCount: 0 })
      .then(d => setPendingInviteCount(d.pendingTenantCount ?? 0))
  }, [])

  const stats = {
    totalVendors: vendors.length,
    activeVendors: vendors.filter((v) => v.status === 'active').length,
    totalCompletedJobs: vendors.reduce((sum, v) => sum + v.completedJobs, 0),
    avgRating: vendors.length > 0 ? (vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length).toFixed(1) : '0.0',
  };

  return (
    <div className='p-4 md:p-6 space-y-4 md:space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-xl md:text-2xl font-bold text-neutral-900'>Vendors CRM</h1>
          <p className='text-neutral-600 mt-1'>Manage vendor relationships and performance</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowAddModal(true)}>+ Add Vendor</Button>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6'>
        <div className='bg-surface shadow rounded-lg p-4 md:p-6'>
          <p className='text-sm text-neutral-600'>Total Vendors</p>
          <p className='text-3xl font-bold text-primary-600'>{stats.totalVendors}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-4 md:p-6'>
          <p className='text-sm text-neutral-600'>Active Vendors</p>
          <p className='text-3xl font-bold text-success-600'>{stats.activeVendors}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-4 md:p-6'>
          <p className='text-sm text-neutral-600'>Completed Jobs</p>
          <p className='text-3xl font-bold text-primary-600'>{stats.totalCompletedJobs}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-4 md:p-6'>
          <p className='text-sm text-neutral-600'>Average Rating</p>
          <p className='text-3xl font-bold text-yellow-600'>{stats.avgRating} ⭐</p>
        </div>
        <Link href='/admin/invitations?role=vendor&status=pending' className='block bg-surface shadow rounded-lg p-4 md:p-6 hover:border hover:border-primary-300 hover:shadow-md transition-all group'>
          <div className='flex items-start justify-between'>
            <p className='text-sm text-neutral-600 group-hover:text-primary-600 transition-colors'>Pending Invites</p>
            <svg className='w-4 h-4 text-neutral-400 group-hover:text-primary-500 transition-colors' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
            </svg>
          </div>
          <p className='text-3xl font-bold text-neutral-900 mt-2'>{pendingInviteCount}</p>
          <p className='text-xs text-primary-500 mt-2 group-hover:text-primary-600'>View invite schedule →</p>
        </Link>
      </div>

      <div className='bg-surface shadow rounded-lg p-4 md:p-6'>
        <div className='mb-4 flex flex-col sm:flex-row gap-2 md:gap-4'>
          <input
            type='text'
            placeholder='Search vendors by name or category...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className='px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500'
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
          <table className='min-w-full divide-y divide-neutral-200'>
            <thead className='bg-neutral-50'>
              <tr>
                <th className='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                  Vendor
                </th>
                <th className='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell'>
                  Category
                </th>
                <th className='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell'>
                  Contact
                </th>
                <th className='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell'>
                  Type
                </th>
                <th className='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell'>
                  Rating
                </th>
                <th className='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell'>
                  Jobs
                </th>
                <th className='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                  Status
                </th>
                <th className='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-surface divide-y divide-neutral-200'>
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id} className='hover:bg-neutral-50 cursor-pointer' onClick={() => window.location.href = `/admin/vendors/${vendor.id}`}>
                  <td className='px-3 md:px-6 py-2 md:py-4'>
                    <div className='flex items-center'>
                      <div className='h-10 w-10 rounded-full bg-warning-100 flex items-center justify-center'>
                        <span className='text-warning-600 font-semibold text-lg'>
                          {vendor.name.charAt(0)}
                        </span>
                      </div>
                      <div className='ml-4'>
                        <Link href={`/admin/vendors/${vendor.id}`} className='text-sm font-medium text-primary-600 hover:text-primary-800'>
                          {vendor.name}
                        </Link>
                        <p className='text-sm text-neutral-500'>ID: {vendor.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className='px-3 md:px-6 py-2 md:py-4 hidden md:table-cell'>
                    <span className='px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800'>
                      {vendor.category}
                    </span>
                  </td>
                  <td className='px-3 md:px-6 py-2 md:py-4 hidden md:table-cell'>
                    <p className='text-sm text-neutral-900'>{vendor.email}</p>
                    <p className='text-sm text-neutral-500'>{vendor.phone}</p>
                  </td>
                  <td className='px-3 md:px-6 py-2 md:py-4 hidden md:table-cell'>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        vendor.vendorType === 'company'
                          ? 'bg-primary-100 text-primary-800'
                          : 'bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      {vendor.vendorType}
                    </span>
                  </td>
                  <td className='px-3 md:px-6 py-2 md:py-4 hidden md:table-cell'>
                    <div className='flex items-center'>
                      <span className='text-yellow-500 mr-1'>⭐</span>
                      <span className='text-sm font-semibold text-neutral-900'>{vendor.rating}</span>
                    </div>
                  </td>
                  <td className='px-3 md:px-6 py-2 md:py-4 hidden md:table-cell'>
                    <p className='text-sm text-neutral-900'>
                      <span className='font-semibold text-success-600'>{vendor.completedJobs}</span> completed
                    </p>
                    <p className='text-sm text-neutral-500'>
                      <span className='font-semibold text-primary-600'>{vendor.activeJobs}</span> active
                    </p>
                  </td>
                  <td className='px-3 md:px-6 py-2 md:py-4'>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        vendor.status === 'active'
                          ? 'bg-success-100 text-green-800'
                          : vendor.status === 'suspended'
                            ? 'bg-danger-100 text-red-800'
                            : 'bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      {vendor.status}
                    </span>
                  </td>
                  <td className='px-3 md:px-6 py-2 md:py-4 text-sm space-x-2' onClick={(e) => e.stopPropagation()}>
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
                    <ArchiveDeleteButtons
                      entityName="vendor"
                      entityLabel={vendor.name}
                      archiveUrl={`/api/vendors/${vendor.id}`}
                      deleteUrl={`/api/vendors/${vendor.id}`}
                      isArchived={vendor.status === 'suspended'}
                      onSuccess={() => refreshVendors()}
                      size="sm"
                    />
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
          <div className='bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-4 md:p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold text-neutral-900'>Vendor Details</h2>
                <button
                  onClick={() => setSelectedVendor(null)}
                  className='text-neutral-400 hover:text-neutral-600'
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
                <div className='bg-neutral-50 rounded-lg p-4'>
                  <h3 className='font-semibold text-neutral-900 mb-2'>Contact Information</h3>
                  <p className='text-sm text-neutral-600'>Name: {selectedVendor.name}</p>
                  <p className='text-sm text-neutral-600'>Category: {selectedVendor.category}</p>
                  <p className='text-sm text-neutral-600'>Type: {selectedVendor.vendorType}</p>
                  <p className='text-sm text-neutral-600'>Email: {selectedVendor.email}</p>
                  <p className='text-sm text-neutral-600'>Phone: {selectedVendor.phone}</p>
                </div>

                <div className='bg-neutral-50 rounded-lg p-4'>
                  <h3 className='font-semibold text-neutral-900 mb-2'>Performance</h3>
                  <p className='text-sm text-neutral-600'>Rating: {selectedVendor.rating} ⭐</p>
                  <p className='text-sm text-neutral-600'>
                    Completed Jobs: {selectedVendor.completedJobs}
                  </p>
                  <p className='text-sm text-neutral-600'>Active Jobs: {selectedVendor.activeJobs}</p>
                  <p className='text-sm text-neutral-600'>Status: {selectedVendor.status}</p>
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

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-lg w-full p-4 md:p-6">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">Add Vendor</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Name *</label>
                <input value={addForm.name} onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" placeholder="Vendor name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email *</label>
                <input type="email" value={addForm.email} onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" placeholder="vendor@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Phone *</label>
                <input type="tel" value={addForm.phone} onChange={(e) => setAddForm(prev => ({ ...prev, phone: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" placeholder="+254 7XX XXX XXX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Specialization</label>
                <select value={addForm.specialization} onChange={(e) => setAddForm(prev => ({ ...prev, specialization: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
                  {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
              <Button variant="primary" onClick={handleAddVendor} disabled={saving || !addForm.name || !addForm.email || !addForm.phone} className="flex-1">
                {saving ? 'Adding...' : 'Add Vendor'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
