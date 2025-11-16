'use client';

import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const stats = {
    totalProperties: 5,
    totalUnits: 106,
    occupancyRate: 93.4,
    monthlyRevenue: 5770000,
    activeLeases: 99,
    maintenanceRequests: 12,
  };

  return (
    <div className='space-y-6'>
            <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Dashboard</h1>
          <p className='text-gray-600 mt-1'>Property management overview</p>
        </div>
        <Button variant="primary" size="lg">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Property
        </Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Total Properties</p>
          <p className='text-3xl font-bold text-gray-900'>{stats.totalProperties}</p>
          <p className='text-sm text-green-600 mt-2'>↑ Active & Managed</p>
        </div>

        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Total Units</p>
          <p className='text-3xl font-bold text-gray-900'>{stats.totalUnits}</p>
          <p className='text-sm text-blue-600 mt-2'>{stats.activeLeases} occupied</p>
        </div>

        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Occupancy Rate</p>
          <p className='text-3xl font-bold text-green-600'>{stats.occupancyRate}%</p>
          <p className='text-sm text-gray-600 mt-2'>Industry avg: 85%</p>
        </div>

        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Monthly Revenue</p>
          <p className='text-3xl font-bold text-gray-900'>
            KSh {stats.monthlyRevenue.toLocaleString()}
          </p>
          <p className='text-sm text-green-600 mt-2'>↑ 12% from last month</p>
        </div>

        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Active Leases</p>
          <p className='text-3xl font-bold text-gray-900'>{stats.activeLeases}</p>
          <p className='text-sm text-gray-600 mt-2'>7 renewals pending</p>
        </div>

        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Maintenance Requests</p>
          <p className='text-3xl font-bold text-orange-600'>{stats.maintenanceRequests}</p>
          <p className='text-sm text-gray-600 mt-2'>3 urgent</p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white shadow rounded-lg p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>Quick Actions</h2>
          <div className='space-y-3'>
            <a href='/admin/properties' className='block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition'>
              <div className='font-medium text-blue-900'>Manage Properties</div>
              <div className='text-sm text-blue-700'>View and update property portfolio</div>
            </a>
            <a href='/admin/tenants' className='block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition'>
              <div className='font-medium text-green-900'>Tenant Management</div>
              <div className='text-sm text-green-700'>Add or manage tenant information</div>
            </a>
            <a href='/admin/payments' className='block p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition'>
              <div className='font-medium text-purple-900'>Collect Payments</div>
              <div className='text-sm text-purple-700'>Track rent and payment collection</div>
            </a>
            <a href='/admin/maintenance' className='block p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition'>
              <div className='font-medium text-orange-900'>Maintenance Requests</div>
              <div className='text-sm text-orange-700'>Review and assign work orders</div>
            </a>
          </div>
        </div>

        <div className='bg-white shadow rounded-lg p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>Recent Activity</h2>
          <div className='space-y-4'>
            <div className='border-l-4 border-blue-500 pl-3'>
              <div className='text-sm font-medium text-gray-900'>New lease signed</div>
              <div className='text-xs text-gray-600'>Vista Plaza, Unit 8B - 2 hours ago</div>
            </div>
            <div className='border-l-4 border-green-500 pl-3'>
              <div className='text-sm font-medium text-gray-900'>Payment received</div>
              <div className='text-xs text-gray-600'>Sunset Apartments, Unit 5A - 3 hours ago</div>
            </div>
            <div className='border-l-4 border-orange-500 pl-3'>
              <div className='text-sm font-medium text-gray-900'>Maintenance request</div>
              <div className='text-xs text-gray-600'>Highland House, Unit 12 - 5 hours ago</div>
            </div>
            <div className='border-l-4 border-purple-500 pl-3'>
              <div className='text-sm font-medium text-gray-900'>Viewing scheduled</div>
              <div className='text-xs text-gray-600'>Garden Estate, Unit 3C - 1 day ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
