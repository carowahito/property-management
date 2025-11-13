'use client'

export default function LeasesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Leases</h1>
        <p className="text-gray-600 mt-2">Manage lease agreements and terms</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Active Leases</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">45</p>
          <p className="text-xs text-gray-500 mt-2">96% of properties</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Expiring Soon</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">3</p>
          <p className="text-xs text-orange-600 mt-2">Within 90 days</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Renewals Pending</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">2</p>
          <p className="text-xs text-blue-600 mt-2">Awaiting signatures</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Total Value</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">KSh 2.4M</p>
          <p className="text-xs text-gray-500 mt-2">Annual rental value</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Lease Management</h2>
        <p className="text-gray-600">Track and manage all lease agreements, renewal dates, and terms.</p>
      </div>
    </div>
  )
}
