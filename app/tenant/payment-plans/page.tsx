'use client'

import { useState } from 'react'

interface PaymentPlan {
  id: string
  type: 'installment' | 'hardship' | 'grace'
  totalAmount: number
  installmentAmount: number
  installments: number
  remainingInstallments: number
  nextPaymentDate: string
  status: 'active' | 'completed' | 'defaulted'
  startDate: string
  reason?: string
}

export default function PaymentPlansPage() {
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [planType, setPlanType] = useState<'installment' | 'hardship' | 'grace'>('installment')
  const [formData, setFormData] = useState({
    totalAmount: '',
    installments: '3',
    reason: '',
    documentUpload: null as File | null,
  })

  const activePlans: PaymentPlan[] = [
    {
      id: 'plan1',
      type: 'installment',
      totalAmount: 135000,
      installmentAmount: 45000,
      installments: 3,
      remainingInstallments: 2,
      nextPaymentDate: '2025-12-01',
      status: 'active',
      startDate: '2025-10-01',
    },
  ]

  const completedPlans: PaymentPlan[] = [
    {
      id: 'plan2',
      type: 'grace',
      totalAmount: 45000,
      installmentAmount: 45000,
      installments: 1,
      remainingInstallments: 0,
      nextPaymentDate: '2025-09-15',
      status: 'completed',
      startDate: '2025-08-15',
      reason: 'Medical emergency',
    },
  ]

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Payment plan request submitted! Property management will review within 1-2 business days.')
    setShowRequestForm(false)
    setFormData({
      totalAmount: '',
      installments: '3',
      reason: '',
      documentUpload: null,
    })
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      defaulted: 'bg-red-100 text-red-800',
    }
    return badges[status] || badges.active
  }

  const getPlanTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      installment: 'Installment Plan',
      hardship: 'Hardship Assistance',
      grace: 'Grace Period',
    }
    return labels[type] || type
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payment Plans</h1>
        <p className="mt-2 text-gray-600">
          Flexible payment options and financial assistance programs
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              We understand that financial situations can change. Our payment plans are designed to help you stay current on your rent while managing temporary financial challenges.
            </p>
          </div>
        </div>
      </div>

      {/* Request Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowRequestForm(!showRequestForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          {showRequestForm ? 'Cancel' : '+ Request Payment Plan'}
        </button>
      </div>

      {/* Request Form */}
      {showRequestForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Payment Plan</h2>

          {/* Plan Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Plan Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setPlanType('installment')}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  planType === 'installment'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900 mb-1">Installment Plan</h3>
                <p className="text-sm text-gray-600">Break up rent into smaller payments over 2-6 months</p>
              </button>
              <button
                type="button"
                onClick={() => setPlanType('hardship')}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  planType === 'hardship'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900 mb-1">Hardship Assistance</h3>
                <p className="text-sm text-gray-600">Apply for rent reduction or payment deferral due to hardship</p>
              </button>
              <button
                type="button"
                onClick={() => setPlanType('grace')}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  planType === 'grace'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900 mb-1">Grace Period</h3>
                <p className="text-sm text-gray-600">Request extension on due date (7-30 days)</p>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmitRequest} className="space-y-4">
            {/* Installment Plan Fields */}
            {planType === 'installment' && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Amount *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">KES</span>
                      <input
                        type="number"
                        value={formData.totalAmount}
                        onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                        placeholder="45000"
                        className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Installments *
                    </label>
                    <select
                      value={formData.installments}
                      onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="2">2 months</option>
                      <option value="3">3 months</option>
                      <option value="4">4 months</option>
                      <option value="6">6 months</option>
                    </select>
                  </div>
                </div>

                {formData.totalAmount && formData.installments && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Payment Breakdown</p>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        Monthly Payment: <span className="font-semibold text-gray-900">
                          KES {(parseFloat(formData.totalAmount) / parseInt(formData.installments)).toLocaleString()}
                        </span>
                      </p>
                      <p>
                        Total Amount: <span className="font-semibold text-gray-900">
                          KES {parseFloat(formData.totalAmount).toLocaleString()}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-2">No additional fees or interest charged</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Grace Period Fields */}
            {planType === 'grace' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requested Extension (days) *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  Grace period requests are subject to approval. Late fees may apply after the grace period.
                </p>
              </div>
            )}

            {/* Reason (Required for all types) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Request *
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={4}
                placeholder="Please explain your financial situation and why you need a payment plan..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Document Upload (Required for hardship) */}
            {planType === 'hardship' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supporting Documentation *
                </label>
                <input
                  type="file"
                  onChange={(e) => setFormData({ ...formData, documentUpload: e.target.files?.[0] || null })}
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="mt-2 text-xs text-gray-500">
                  Please upload proof of hardship (e.g., medical bills, job loss letter, etc.)
                </p>
              </div>
            )}

            {/* Terms Agreement */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required
                />
                <label htmlFor="terms" className="ml-3 text-sm text-yellow-800">
                  I understand that late fees may apply if I fail to make payments according to the approved plan. I remain responsible for the full amount owed.
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowRequestForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Plans */}
      {activePlans.length > 0 && (
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Active Payment Plans</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {activePlans.map((plan) => (
              <div key={plan.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{getPlanTypeLabel(plan.type)}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(plan.status)}`}>
                        {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Started: {new Date(plan.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Total Amount</p>
                    <p className="text-lg font-semibold text-gray-900">KES {plan.totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Monthly Payment</p>
                    <p className="text-lg font-semibold text-gray-900">KES {plan.installmentAmount.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Remaining</p>
                    <p className="text-lg font-semibold text-blue-600">{plan.remainingInstallments} of {plan.installments}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Next Payment</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(plan.nextPaymentDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{Math.round(((plan.installments - plan.remainingInstallments) / plan.installments) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${((plan.installments - plan.remainingInstallments) / plan.installments) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    View Details
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                    Make Payment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Plan Options Overview */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Plan Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-3xl mb-3">📅</div>
            <h3 className="font-semibold text-gray-900 mb-2">Installment Plans</h3>
            <p className="text-sm text-gray-600 mb-3">
              Break your rent into 2-6 monthly installments with no interest or fees.
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ No credit check required</li>
              <li>✓ No interest charges</li>
              <li>✓ Flexible terms (2-6 months)</li>
              <li>✓ Automatic payments available</li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="font-semibold text-gray-900 mb-2">Hardship Assistance</h3>
            <p className="text-sm text-gray-600 mb-3">
              Apply for rent reduction or payment deferral during financial hardship.
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ Case-by-case evaluation</li>
              <li>✓ Requires documentation</li>
              <li>✓ Up to 50% rent reduction</li>
              <li>✓ Temporary relief (1-3 months)</li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-3xl mb-3">⏰</div>
            <h3 className="font-semibold text-gray-900 mb-2">Grace Period</h3>
            <p className="text-sm text-gray-600 mb-3">
              Request a short extension on your payment due date.
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ 7-30 day extensions</li>
              <li>✓ Fast approval (24 hours)</li>
              <li>✓ Available 2x per year</li>
              <li>✓ Reduced late fees</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Completed Plans */}
      {completedPlans.length > 0 && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {completedPlans.map((plan) => (
                  <tr key={plan.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getPlanTypeLabel(plan.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(plan.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      KES {plan.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(plan.status)}`}>
                        {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Need Help?</h3>
        <p className="text-sm text-gray-700 mb-4">
          Our financial assistance team is here to help you find the right payment solution for your situation.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            📞 Call Financial Team
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            📧 Email Support
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            💬 Live Chat
          </button>
        </div>
      </div>
    </div>
  )
}
