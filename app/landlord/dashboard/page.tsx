'use client';

export default function LandlordDashboard() {
  const stats = {
    totalProperties: 12,
    totalUnits: 48,
    occupiedUnits: 42,
    vacantUnits: 6,
    totalTenants: 42,
    monthlyRevenue: 1890000,
    pendingPayments: 135000,
    maintenanceRequests: 8,
    expiringLeases: 3,
    occupancyRate: 87.5,
  };

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <h1 className='text-3xl font-bold text-gray-900 mb-8'>Landlord Dashboard</h1>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
        <div className='bg-white shadow rounded-lg p-6'>
          <span className='text-3xl mb-2 block'>🏢</span>
          <p className='text-sm text-gray-600'>Total Properties</p>
          <p className='text-3xl font-bold text-gray-900'>{stats.totalProperties}</p>
          <p className='text-xs text-gray-500 mt-1'>{stats.totalUnits} units</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <span className='text-3xl mb-2 block'>👥</span>
          <p className='text-sm text-gray-600'>Active Tenants</p>
          <p className='text-3xl font-bold text-green-600'>{stats.totalTenants}</p>
          <p className='text-xs text-gray-500 mt-1'>{stats.occupancyRate}% occupancy</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <span className='text-3xl mb-2 block'>💰</span>
          <p className='text-sm text-gray-600'>Monthly Revenue</p>
          <p className='text-3xl font-bold text-blue-600'>
            ${stats.monthlyRevenue.toLocaleString()}
          </p>
          <p className='text-xs text-green-500 mt-1'>+12% from last month</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <span className='text-3xl mb-2 block'>⚠️</span>
          <p className='text-sm text-gray-600'>Pending Payments</p>
          <p className='text-3xl font-bold text-red-600'>
            ${stats.pendingPayments.toLocaleString()}
          </p>
          <p className='text-xs text-gray-500 mt-1'>From 5 tenants</p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <div className='bg-white shadow rounded-lg p-6'>
          <h2 className='text-lg font-semibold mb-4'>Recent Activity</h2>
          <div className='space-y-3'>
            <div className='flex items-start p-3 bg-gray-50 rounded'>
              <span className='text-2xl mr-3'>💵</span>
              <div>
                <p className='text-sm font-medium'>Payment Received</p>
                <p className='text-xs text-gray-600'>Unit 4B - $1,500 • 2 hours ago</p>
              </div>
            </div>
            <div className='flex items-start p-3 bg-gray-50 rounded'>
              <span className='text-2xl mr-3'>🔧</span>
              <div>
                <p className='text-sm font-medium'>New Maintenance Request</p>
                <p className='text-xs text-gray-600'>Unit 7A - Plumbing issue • 5 hours ago</p>
              </div>
            </div>
            <div className='flex items-start p-3 bg-gray-50 rounded'>
              <span className='text-2xl mr-3'>📄</span>
              <div>
                <p className='text-sm font-medium'>Lease Renewed</p>
                <p className='text-xs text-gray-600'>Unit 2C - 12 months • Yesterday</p>
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white shadow rounded-lg p-6'>
          <h2 className='text-lg font-semibold mb-4'>Quick Actions</h2>
          <div className='grid grid-cols-2 gap-3'>
            <button className='p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium'>
              + Add Property
            </button>
            <button className='p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium'>
              + Add Tenant
            </button>
            <button className='p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium'>
              📊 Generate Report
            </button>
            <button className='p-4 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-medium'>
              💵 Record Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
