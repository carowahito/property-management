'use client'

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600 mt-2">Track and manage all payment transactions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Total Collected</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">KSh 1.2M</p>
          <p className="text-xs text-green-600 mt-2">This month</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Pending Payments</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">KSh 180K</p>
          <p className="text-xs text-orange-600 mt-2">5 overdue</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Collection Rate</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">97.2%</p>
          <p className="text-xs text-green-600 mt-2">↑ 2% from last month</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Avg. Processing</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">1.5 days</p>
          <p className="text-xs text-gray-500 mt-2">Time to clear</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
        <p className="text-gray-600">View all payment history and reconciliation</p>
      </div>
    </div>
  )
}
