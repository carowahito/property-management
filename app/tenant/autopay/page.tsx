'use client'

import { useState } from 'react'

export default function AutoPayPage() {
  const [autoPayEnabled, setAutoPayEnabled] = useState(false)
  const [paymentDay, setPaymentDay] = useState('1')

  const handleSaveSettings = () => {
    alert('Auto-pay settings saved successfully!')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Auto-Pay Settings</h1>
        <p className="mt-2 text-neutral-600">
          Set up automatic rent payments and never miss a due date
        </p>
      </div>

      {/* Auto-Pay Status Card */}
      <div className="bg-surface shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Auto-Pay Status</h2>
            <p className="text-sm text-neutral-600 mt-1">
              {autoPayEnabled ? 'Automatic payments are enabled' : 'Automatic payments are currently disabled'}
            </p>
          </div>
          <button
            onClick={() => setAutoPayEnabled(!autoPayEnabled)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              autoPayEnabled ? 'bg-primary-600' : 'bg-neutral-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface shadow ring-0 transition duration-200 ease-in-out ${
                autoPayEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {autoPayEnabled && (
          <div className="bg-success-50 border border-success-200 rounded-lg p-4">
            <p className="text-sm font-medium text-success-800">Auto-Pay is Active</p>
            <p className="text-sm text-success-700 mt-1">
              Your rent will be automatically charged on the {paymentDay}
              {paymentDay === '1' ? 'st' : paymentDay === '2' ? 'nd' : paymentDay === '3' ? 'rd' : 'th'} of each month
            </p>
          </div>
        )}
      </div>

      {autoPayEnabled && (
        <>
          {/* Payment Method Selection */}
          <div className="bg-surface shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Payment Method</h2>
            <div className="text-center py-8">
              <p className="text-neutral-500 mb-4">No payment methods configured yet.</p>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700">
                + Add Payment Method
              </button>
            </div>
          </div>

          {/* Payment Schedule */}
          <div className="bg-surface shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Payment Schedule</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="paymentDay" className="block text-sm font-medium text-neutral-700 mb-1">
                  Payment Day of Month
                </label>
                <select
                  id="paymentDay"
                  value={paymentDay}
                  onChange={(e) => setPaymentDay(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of the month
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-neutral-500">Recommended: 1st (rent due date)</p>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-surface shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Notifications</h2>
            <div className="space-y-3">
              {[
                { id: 'notifyBefore', label: 'Payment Reminder', desc: 'Send reminder 3 days before automatic payment' },
                { id: 'notifySuccess', label: 'Payment Success', desc: 'Notify when payment is successfully processed' },
                { id: 'notifyFailure', label: 'Payment Failure', desc: 'Alert immediately if payment fails' },
                { id: 'notifyReceipt', label: 'Email Receipt', desc: 'Receive payment receipt via email' },
              ].map(opt => (
                <div key={opt.id} className="flex items-start">
                  <input type="checkbox" id={opt.id} defaultChecked className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded" />
                  <label htmlFor={opt.id} className="ml-3">
                    <span className="block text-sm font-medium text-neutral-700">{opt.label}</span>
                    <span className="block text-sm text-neutral-500">{opt.desc}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={handleSaveSettings} className="px-6 py-3 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700">
              Save Auto-Pay Settings
            </button>
          </div>
        </>
      )}

      {!autoPayEnabled && (
        <div className="bg-surface shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Benefits of Auto-Pay</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Never Miss a Payment', desc: 'Payments are automatically processed on time every month' },
              { title: 'Avoid Late Fees', desc: 'No more worrying about late payment penalties' },
              { title: 'Save Time', desc: 'Set it once and forget about manual payments' },
              { title: 'Secure', desc: 'Bank-level encryption protects your payment information' },
            ].map(benefit => (
              <div key={benefit.title} className="flex items-start">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-neutral-900">{benefit.title}</h3>
                  <p className="text-sm text-neutral-600">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <button onClick={() => setAutoPayEnabled(true)} className="w-full px-6 py-3 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700">
              Enable Auto-Pay
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
