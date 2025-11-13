'use client'

import Link from 'next/link'

export default function TenantDashboardPage() {
  // Mock data - will be replaced with actual API calls
  const tenant = {
    name: 'John Doe',
    propertyAddress: '123 Main Street, Apt 4B, Nairobi',
    leaseStart: '2024-01-01',
    leaseEnd: '2024-12-31',
    monthlyRent: 45000,
    outstandingBalance: 45000,
    nextPaymentDue: '2025-11-05',
  }

  const recentPayments = [
    { id: 1, date: '2025-10-05', amount: 45000, status: 'Paid', method: 'M-Pesa' },
    { id: 2, date: '2025-09-05', amount: 45000, status: 'Paid', method: 'M-Pesa' },
    { id: 3, date: '2025-08-05', amount: 45000, status: 'Paid', method: 'Bank Transfer' },
  ]

  const maintenanceRequests = [
    { id: 1, title: 'Leaking Faucet', status: 'In Progress', date: '2025-10-20' },
    { id: 2, title: 'AC Not Cooling', status: 'Completed', date: '2025-09-15' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {tenant.name}!
        </h1>
        <p className="mt-2 text-gray-600">{tenant.propertyAddress}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl">🏠</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Monthly Rent
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    KES {tenant.monthlyRent.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl">💰</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Outstanding Balance
                  </dt>
                  <dd className="text-lg font-semibold text-red-600">
                    KES {tenant.outstandingBalance.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl">📅</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Next Payment Due
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {tenant.nextPaymentDue}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl">🔧</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Open Requests
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {maintenanceRequests.filter(r => r.status !== 'Completed').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            href="/tenant/payments/new"
            className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Pay Rent
          </Link>
          <Link
            href="/tenant/maintenance/new"
            className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Submit Maintenance Request
          </Link>
          <Link
            href="/tenant/messages"
            className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Contact Management
          </Link>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Payments */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
              <Link
                href="/tenant/payments"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      KES {payment.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {payment.date} · {payment.method}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {payment.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Maintenance Requests */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Maintenance Requests</h2>
              <Link
                href="/tenant/maintenance"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {maintenanceRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {request.title}
                    </p>
                    <p className="text-xs text-gray-500">Submitted {request.date}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      request.status === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {request.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lease Information */}
      <div className="bg-white shadow rounded-lg p-6 mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Lease Information</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-gray-500">Lease Start</p>
            <p className="mt-1 text-sm text-gray-900">{tenant.leaseStart}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Lease End</p>
            <p className="mt-1 text-sm text-gray-900">{tenant.leaseEnd}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Property</p>
            <p className="mt-1 text-sm text-gray-900">{tenant.propertyAddress}</p>
          </div>
        </div>
        <div className="mt-4">
          <Link
            href="/tenant/documents"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View Lease Agreement →
          </Link>
        </div>
      </div>
    </div>
  )
}
