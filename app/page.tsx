'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center py-20">
          <h1 className="text-5xl font-bold text-neutral-900 mb-4">🏢 PropManage</h1>
          <p className="text-xl text-neutral-600 mb-8">Complete Property Management Solution</p>
        </div>

        {/* Portal Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
          {/* Admin Portal */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
              <div className="text-4xl mb-2">👨‍💼</div>
              <h2 className="text-2xl font-bold">Admin Portal</h2>
            </div>
            <div className="p-6">
              <p className="text-neutral-600 mb-6">Manage properties, tenants, finances, and maintenance.</p>
              <ul className="space-y-2 mb-8 text-sm text-neutral-700">
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Property Management
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Tenant & Lease Management
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Payment Tracking
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Maintenance Requests
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Analytics & Reports
                </li>
              </ul>
              <Link
                href="/admin"
                className="w-full block text-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Go to Admin
              </Link>
            </div>
          </div>

          {/* Tenant Portal */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
            <div className="bg-gradient-to-r from-success-600 to-success-700 p-6 text-white">
              <div className="text-4xl mb-2">👤</div>
              <h2 className="text-2xl font-bold">Tenant Portal</h2>
            </div>
            <div className="p-6">
              <p className="text-neutral-600 mb-6">Manage your lease, payments, and maintenance requests.</p>
              <ul className="space-y-2 mb-8 text-sm text-neutral-700">
                <li className="flex items-center">
                  <span className="mr-2">✓</span> View Lease Info
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Pay Rent Online
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Request Maintenance
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Community Access
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Support & Messages
                </li>
              </ul>
              <Link
                href="/tenant/login"
                className="w-full block text-center bg-success-600 hover:bg-success-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Tenant Login
              </Link>
            </div>
          </div>

          {/* Landlord Portal */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
              <div className="text-4xl mb-2">🏠</div>
              <h2 className="text-2xl font-bold">Landlord Portal</h2>
            </div>
            <div className="p-6">
              <p className="text-neutral-600 mb-6">Manage your properties and track rental income.</p>
              <ul className="space-y-2 mb-8 text-sm text-neutral-700">
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Property Listings
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Tenant Management
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Income Tracking
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Maintenance Oversight
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Financial Reports
                </li>
              </ul>
              <Link
                href="/landlord/login"
                className="w-full block text-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Landlord Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
