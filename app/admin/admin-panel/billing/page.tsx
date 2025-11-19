'use client'

import { Button } from '@/components/ui/button'

export default function BillingPage() {
  const currentPlan = {
    name: 'Professional',
    price: 'KES 15,000',
    period: 'per month',
    users: 10,
    storage: '10 GB',
    features: [
      'Up to 10 team members',
      '10 GB storage',
      'Unlimited properties',
      'Advanced analytics',
      'Priority support',
      'WhatsApp integration',
      'SMS notifications',
      'Custom branding',
    ]
  }

  const billingHistory = [
    { id: '1', date: '2024-11-01', amount: 'KES 15,000', status: 'Paid', invoice: 'INV-2024-11' },
    { id: '2', date: '2024-10-01', amount: 'KES 15,000', status: 'Paid', invoice: 'INV-2024-10' },
    { id: '3', date: '2024-09-01', amount: 'KES 15,000', status: 'Paid', invoice: 'INV-2024-09' },
    { id: '4', date: '2024-08-01', amount: 'KES 15,000', status: 'Paid', invoice: 'INV-2024-08' },
  ]

  const paymentMethod = {
    type: 'M-Pesa',
    number: '+254 7XX XXX 456',
    default: true,
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-gray-600 mt-1">Manage your subscription and billing information</p>
      </div>

      {/* Current Plan */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{currentPlan.name} Plan</h2>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold">{currentPlan.price}</span>
              <span className="text-blue-200">{currentPlan.period}</span>
            </div>
            <div className="flex gap-6 text-sm">
              <div>
                <p className="text-blue-200">Team Members</p>
                <p className="font-semibold">{currentPlan.users} / {currentPlan.users}</p>
              </div>
              <div>
                <p className="text-blue-200">Storage</p>
                <p className="font-semibold">2.4 GB / {currentPlan.storage}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-white text-blue-600 hover:bg-blue-50">
              Upgrade Plan
            </Button>
            <Button variant="outline" className="bg-transparent text-white border-white hover:bg-blue-600">
              Cancel Subscription
            </Button>
          </div>
        </div>
      </div>

      {/* Plan Features */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan Features</h2>
        <div className="grid grid-cols-2 gap-4">
          {currentPlan.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
          <Button variant="outline">Update</Button>
        </div>
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📱</span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{paymentMethod.type}</p>
            <p className="text-sm text-gray-600">{paymentMethod.number}</p>
          </div>
          {paymentMethod.default && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              Default
            </span>
          )}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Billing History</h2>
            <p className="text-sm text-gray-600">Download invoices and view payment history</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {billingHistory.map(bill => (
                <tr key={bill.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(bill.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                    {bill.invoice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {bill.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      Download Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">API Calls This Month</h3>
          <p className="text-3xl font-bold text-gray-900">12,543</p>
          <div className="mt-4 flex items-center">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '62%' }}></div>
            </div>
            <span className="ml-2 text-sm text-gray-600">62% of limit</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Active Users</h3>
          <p className="text-3xl font-bold text-gray-900">8 / 10</p>
          <div className="mt-4 flex items-center">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }}></div>
            </div>
            <span className="ml-2 text-sm text-gray-600">80% used</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Storage Used</h3>
          <p className="text-3xl font-bold text-gray-900">2.4 GB</p>
          <div className="mt-4 flex items-center">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '24%' }}></div>
            </div>
            <span className="ml-2 text-sm text-gray-600">24% used</span>
          </div>
        </div>
      </div>
    </div>
  )
}
