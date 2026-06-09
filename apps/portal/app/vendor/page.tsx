'use client'

import Link from 'next/link'

export default function VendorDashboard() {
  // Mock vendor data - will be replaced with actual auth context
  const vendor = {
    name: "Nairobi Plumbing Services",
    category: "Plumbing",
    rating: 4.8,
    activeJobs: 3,
    pendingQuotes: 5,
    completedJobs: 47,
    totalEarnings: 1250000,
    pendingPayments: 85000,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-neutral-900">Welcome back, {vendor.name}</h1>
        <p className="text-neutral-600 mt-1">Category: {vendor.category} • Rating: {vendor.rating} ⭐</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface shadow rounded-lg p-6 border-l-4 border-warning-500">
          <p className="text-sm text-neutral-600">Active Jobs</p>
          <p className="text-3xl font-bold text-neutral-900">{vendor.activeJobs}</p>
          <Link href="/vendor/jobs" className="text-sm text-warning-600 hover:text-warning-800 mt-2 inline-block">
            View all →
          </Link>
        </div>

        <div className="bg-surface shadow rounded-lg p-6 border-l-4 border-primary-500">
          <p className="text-sm text-neutral-600">Pending Quotes</p>
          <p className="text-3xl font-bold text-neutral-900">{vendor.pendingQuotes}</p>
          <Link href="/vendor/quotes" className="text-sm text-primary-600 hover:text-primary-800 mt-2 inline-block">
            Submit quotes →
          </Link>
        </div>

        <div className="bg-surface shadow rounded-lg p-6 border-l-4 border-success-500">
          <p className="text-sm text-neutral-600">Total Earnings</p>
          <p className="text-3xl font-bold text-neutral-900">KES {(vendor.totalEarnings / 1000).toFixed(0)}K</p>
          <p className="text-sm text-neutral-600 mt-2">{vendor.completedJobs} jobs completed</p>
        </div>

        <div className="bg-surface shadow rounded-lg p-6 border-l-4 border-purple-500">
          <p className="text-sm text-neutral-600">Pending Payments</p>
          <p className="text-3xl font-bold text-neutral-900">KES {(vendor.pendingPayments / 1000).toFixed(0)}K</p>
          <Link href="/vendor/payments" className="text-sm text-primary-600 hover:text-primary-800 mt-2 inline-block">
            View details →
          </Link>
        </div>
      </div>

      {/* Active Jobs Overview */}
      <div className="bg-surface shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-neutral-900">Active Jobs</h2>
          <Link href="/vendor/jobs" className="text-sm text-warning-600 hover:text-warning-800">
            View all
          </Link>
        </div>
        <div className="space-y-4">
          <div className="border rounded-lg p-4 hover:bg-neutral-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900">Pipe Leak Repair - Skyline Apartments Unit 204</h3>
                <p className="text-sm text-neutral-600 mt-1">Started: Nov 14, 2025 • Due: Nov 16, 2025</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm bg-warning-100 text-warning-800 px-2 py-1 rounded">In Progress</span>
                  <span className="text-sm text-neutral-600">Progress: 60%</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-neutral-900">KES 15,000</p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4 hover:bg-neutral-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900">Water Heater Installation - Riverside Towers Unit 305</h3>
                <p className="text-sm text-neutral-600 mt-1">Started: Nov 15, 2025 • Due: Nov 18, 2025</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm bg-primary-100 text-primary-800 px-2 py-1 rounded">Scheduled</span>
                  <span className="text-sm text-neutral-600">Progress: 10%</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-neutral-900">KES 35,000</p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4 hover:bg-neutral-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900">Bathroom Faucet Replacement - Garden View Estate Unit 101</h3>
                <p className="text-sm text-neutral-600 mt-1">Started: Nov 16, 2025 • Due: Nov 17, 2025</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm bg-warning-100 text-warning-800 px-2 py-1 rounded">In Progress</span>
                  <span className="text-sm text-neutral-600">Progress: 80%</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-neutral-900">KES 8,500</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-surface shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/vendor/quotes" className="block p-4 border rounded-lg hover:bg-warning-50 hover:border-warning-300">
            <div className="text-2xl mb-2">📋</div>
            <div className="font-semibold text-neutral-900">Submit Quote</div>
            <div className="text-sm text-neutral-600">Respond to quote requests</div>
          </Link>

          <Link href="/vendor/receipts" className="block p-4 border rounded-lg hover:bg-primary-50 hover:border-primary-300">
            <div className="text-2xl mb-2">🧾</div>
            <div className="font-semibold text-neutral-900">Upload Receipt</div>
            <div className="text-sm text-neutral-600">Submit payment receipts</div>
          </Link>

          <Link href="/vendor/evidence" className="block p-4 border rounded-lg hover:bg-success-50 hover:border-success-300">
            <div className="text-2xl mb-2">📸</div>
            <div className="font-semibold text-neutral-900">Add Evidence</div>
            <div className="text-sm text-neutral-600">Upload photos & videos</div>
          </Link>

          <Link href="/vendor/projects" className="block p-4 border rounded-lg hover:bg-purple-50 hover:border-purple-300">
            <div className="text-2xl mb-2">🏗️</div>
            <div className="font-semibold text-neutral-900">View Projects</div>
            <div className="text-sm text-neutral-600">Track project progress</div>
          </Link>
        </div>
      </div>
    </div>
  )
}
