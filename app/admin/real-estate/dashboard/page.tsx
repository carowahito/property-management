'use client'

export default function RealEstateDashboardPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Real Estate Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Property management overview</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-sm text-gray-600">Total Properties</p>
          <p className="text-3xl font-bold text-gray-900">24</p>
          <p className="text-sm text-green-600 mt-2">↑ 12% from last month</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-sm text-gray-600">Total Units</p>
          <p className="text-3xl font-bold text-gray-900">342</p>
          <p className="text-sm text-blue-600 mt-2">289 occupied</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-sm text-gray-600">Occupancy Rate</p>
          <p className="text-3xl font-bold text-green-600">84.5%</p>
          <p className="text-sm text-gray-600 mt-2">Industry avg: 85%</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-sm text-gray-600">Monthly Revenue</p>
          <p className="text-3xl font-bold text-gray-900">KES 12.5M</p>
          <p className="text-sm text-green-600 mt-2">↑ 8% from last month</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="/admin/real-estate/properties" className="block p-4 border rounded-lg hover:bg-blue-50">
            <div className="font-semibold text-blue-900">Manage Properties</div>
            <div className="text-sm text-gray-600">View and manage all properties</div>
          </a>
          <a href="/admin/real-estate/renters" className="block p-4 border rounded-lg hover:bg-green-50">
            <div className="font-semibold text-green-900">Tenant Management</div>
            <div className="text-sm text-gray-600">Manage tenant information</div>
          </a>
          <a href="/admin/real-estate/leases" className="block p-4 border rounded-lg hover:bg-purple-50">
            <div className="font-semibold text-purple-900">Lease Management</div>
            <div className="text-sm text-gray-600">View and manage leases</div>
          </a>
          <a href="/admin/real-estate/vendors" className="block p-4 border rounded-lg hover:bg-orange-50">
            <div className="font-semibold text-orange-900">Vendor Management</div>
            <div className="text-sm text-gray-600">Manage vendors and contractors</div>
          </a>
        </div>
      </div>
    </div>
  )
}
