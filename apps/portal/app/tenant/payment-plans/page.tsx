'use client'

import { useState } from 'react'

export default function PaymentPlansPage() {
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [planType, setPlanType] = useState<'installment' | 'hardship' | 'grace'>('installment')
  const [formData, setFormData] = useState({
    totalAmount: '',
    installments: '3',
    reason: '',
    documentUpload: null as File | null,
  })

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Payment plan request submitted! Property management will review within 1-2 business days.')
    setShowRequestForm(false)
    setFormData({ totalAmount: '', installments: '3', reason: '', documentUpload: null })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Payment Plans</h1>
        <p className="mt-2 text-neutral-600">
          Flexible payment options and financial assistance programs
        </p>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-primary-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-primary-800">
              We understand that financial situations can change. Our payment plans are designed to help you stay current on your rent while managing temporary financial challenges.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowRequestForm(!showRequestForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
        >
          {showRequestForm ? 'Cancel' : '+ Request Payment Plan'}
        </button>
      </div>

      {showRequestForm && (
        <div className="bg-surface shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Request Payment Plan</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-3">Plan Type *</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['installment', 'hardship', 'grace'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPlanType(type)}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    planType === type ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <h3 className="font-semibold text-neutral-900 mb-1">
                    {type === 'installment' ? 'Installment Plan' : type === 'hardship' ? 'Hardship Assistance' : 'Grace Period'}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {type === 'installment' ? 'Break up rent into smaller payments over 2-6 months' :
                     type === 'hardship' ? 'Apply for rent reduction or payment deferral due to hardship' :
                     'Request extension on due date (7-30 days)'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmitRequest} className="space-y-4">
            {planType === 'installment' && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Total Amount *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-neutral-500">KES</span>
                    <input
                      type="number"
                      value={formData.totalAmount}
                      onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                      placeholder="45000"
                      className="w-full pl-12 pr-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Number of Installments *</label>
                  <select
                    value={formData.installments}
                    onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="2">2 months</option>
                    <option value="3">3 months</option>
                    <option value="4">4 months</option>
                    <option value="6">6 months</option>
                  </select>
                </div>
              </div>
            )}

            {planType === 'grace' && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Requested Extension *</label>
                <select className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" required>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Reason for Request *</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={4}
                placeholder="Please explain your financial situation..."
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            {planType === 'hardship' && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Supporting Documentation *</label>
                <input
                  type="file"
                  onChange={(e) => setFormData({ ...formData, documentUpload: e.target.files?.[0] || null })}
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                  required
                />
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={() => setShowRequestForm(false)} className="px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700">
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* No active plans — empty state */}
      <div className="bg-surface shadow rounded-lg p-12 text-center mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">No active payment plans</h3>
        <p className="text-neutral-500">You don&apos;t have any payment plans. Use the button above to request one if needed.</p>
      </div>

      {/* Payment Plan Options */}
      <div className="bg-surface shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Payment Plan Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-neutral-200 rounded-lg p-4">
            <h3 className="font-semibold text-neutral-900 mb-2">Installment Plans</h3>
            <p className="text-sm text-neutral-600 mb-3">Break your rent into 2-6 monthly installments with no interest.</p>
            <ul className="text-sm text-neutral-700 space-y-1">
              <li>No credit check required</li>
              <li>No interest charges</li>
              <li>Flexible terms (2-6 months)</li>
            </ul>
          </div>
          <div className="border border-neutral-200 rounded-lg p-4">
            <h3 className="font-semibold text-neutral-900 mb-2">Hardship Assistance</h3>
            <p className="text-sm text-neutral-600 mb-3">Apply for rent reduction during financial hardship.</p>
            <ul className="text-sm text-neutral-700 space-y-1">
              <li>Case-by-case evaluation</li>
              <li>Requires documentation</li>
              <li>Temporary relief (1-3 months)</li>
            </ul>
          </div>
          <div className="border border-neutral-200 rounded-lg p-4">
            <h3 className="font-semibold text-neutral-900 mb-2">Grace Period</h3>
            <p className="text-sm text-neutral-600 mb-3">Request a short extension on your payment due date.</p>
            <ul className="text-sm text-neutral-700 space-y-1">
              <li>7-30 day extensions</li>
              <li>Fast approval (24 hours)</li>
              <li>Available 2x per year</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
