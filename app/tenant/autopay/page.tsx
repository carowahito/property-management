'use client'

import { useState } from 'react'

interface PaymentMethod {
  id: string
  type: 'mpesa' | 'card' | 'bank'
  name: string
  details: string
  isDefault: boolean
}

export default function AutoPayPage() {
  const [autoPayEnabled, setAutoPayEnabled] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [paymentDay, setPaymentDay] = useState('1')
  const [addingMethod, setAddingMethod] = useState(false)

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'pm1',
      type: 'mpesa',
      name: 'M-Pesa',
      details: '+254 700 000 000',
      isDefault: true,
    },
    {
      id: 'pm2',
      type: 'card',
      name: 'Visa',
      details: '**** **** **** 1234',
      isDefault: false,
    },
  ]

  const handleSaveSettings = () => {
    alert('Auto-pay settings saved successfully!')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Auto-Pay Settings</h1>
        <p className="mt-2 text-gray-600">
          Set up automatic rent payments and never miss a due date
        </p>
      </div>

      {/* Auto-Pay Status Card */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Auto-Pay Status</h2>
            <p className="text-sm text-gray-600 mt-1">
              {autoPayEnabled
                ? 'Automatic payments are enabled'
                : 'Automatic payments are currently disabled'}
            </p>
          </div>
          <button
            onClick={() => setAutoPayEnabled(!autoPayEnabled)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              autoPayEnabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                autoPayEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {autoPayEnabled && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">Auto-Pay is Active</p>
                <p className="text-sm text-green-700 mt-1">
                  Your rent will be automatically charged on the {paymentDay}
                  {paymentDay === '1' ? 'st' : paymentDay === '2' ? 'nd' : paymentDay === '3' ? 'rd' : 'th'} of each month
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auto-Pay Configuration */}
      {autoPayEnabled && (
        <>
          {/* Payment Method Selection */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
            <p className="text-sm text-gray-600 mb-4">
              Select the payment method to use for automatic payments
            </p>

            <div className="space-y-3 mb-4">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPaymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={selectedPaymentMethod === method.id}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {method.name}
                          {method.isDefault && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Default
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-600">{method.details}</p>
                      </div>
                      <div className="text-2xl">
                        {method.type === 'mpesa' && '📱'}
                        {method.type === 'card' && '💳'}
                        {method.type === 'bank' && '🏦'}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <button
              onClick={() => setAddingMethod(true)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              + Add New Payment Method
            </button>
          </div>

          {/* Payment Schedule */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Schedule</h2>
            <p className="text-sm text-gray-600 mb-4">
              Choose when automatic payments should be processed each month
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="paymentDay" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Day of Month
                </label>
                <select
                  id="paymentDay"
                  value={paymentDay}
                  onChange={(e) => setPaymentDay(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}
                      {day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of the month
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Recommended: 1st (rent due date)
                </p>
              </div>

              <div>
                <label htmlFor="retryAttempts" className="block text-sm font-medium text-gray-700 mb-1">
                  Retry Attempts
                </label>
                <select
                  id="retryAttempts"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">1 attempt</option>
                  <option value="2">2 attempts</option>
                  <option value="3" selected>
                    3 attempts (recommended)
                  </option>
                  <option value="5">5 attempts</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Number of retry attempts if payment fails
                </p>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
            <p className="text-sm text-gray-600 mb-4">
              Choose how you'd like to be notified about automatic payments
            </p>

            <div className="space-y-3">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="notifyBefore"
                  defaultChecked
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="notifyBefore" className="ml-3">
                  <span className="block text-sm font-medium text-gray-700">
                    Payment Reminder
                  </span>
                  <span className="block text-sm text-gray-500">
                    Send reminder 3 days before automatic payment
                  </span>
                </label>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="notifySuccess"
                  defaultChecked
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="notifySuccess" className="ml-3">
                  <span className="block text-sm font-medium text-gray-700">
                    Payment Success
                  </span>
                  <span className="block text-sm text-gray-500">
                    Notify when payment is successfully processed
                  </span>
                </label>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="notifyFailure"
                  defaultChecked
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="notifyFailure" className="ml-3">
                  <span className="block text-sm font-medium text-gray-700">
                    Payment Failure
                  </span>
                  <span className="block text-sm text-gray-500">
                    Alert immediately if payment fails
                  </span>
                </label>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="notifyReceipt"
                  defaultChecked
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="notifyReceipt" className="ml-3">
                  <span className="block text-sm font-medium text-gray-700">
                    Email Receipt
                  </span>
                  <span className="block text-sm text-gray-500">
                    Receive payment receipt via email
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Auto-Payments</h2>
            <div className="space-y-3">
              {[
                { month: 'November 2025', date: '2025-11-01', amount: 45000, status: 'scheduled' },
                { month: 'December 2025', date: '2025-12-01', amount: 45000, status: 'scheduled' },
                { month: 'January 2026', date: '2026-01-01', amount: 45000, status: 'scheduled' },
              ].map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{payment.month}</p>
                    <p className="text-xs text-gray-500">Scheduled for {payment.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      KES {payment.amount.toLocaleString()}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Scheduled
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="px-6 py-3 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Save Auto-Pay Settings
            </button>
          </div>
        </>
      )}

      {/* Benefits Section (when auto-pay is disabled) */}
      {!autoPayEnabled && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Benefits of Auto-Pay</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="text-2xl">✅</div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Never Miss a Payment</h3>
                <p className="text-sm text-gray-600">
                  Payments are automatically processed on time every month
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="text-2xl">💰</div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Avoid Late Fees</h3>
                <p className="text-sm text-gray-600">
                  No more worrying about late payment penalties
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="text-2xl">⏰</div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Save Time</h3>
                <p className="text-sm text-gray-600">
                  Set it once and forget about manual payments
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="text-2xl">🔒</div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Secure</h3>
                <p className="text-sm text-gray-600">
                  Bank-level encryption protects your payment information
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => setAutoPayEnabled(true)}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Enable Auto-Pay
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
