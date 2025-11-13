'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function MoveOutNoticePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    moveOutDate: '',
    reason: '',
    forwardingAddress: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'Kenya',
    },
    forwardingPhone: '',
    forwardingEmail: '',
    cleaningService: false,
    earlyTermination: false,
    comments: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // TODO: Submit to API
    setTimeout(() => {
      setIsSubmitting(false)
      alert('Move-out notice submitted successfully!')
      router.push('/tenant/move')
    }, 2000)
  }

  const minMoveOutDate = new Date()
  minMoveOutDate.setDate(minMoveOutDate.getDate() + 30)
  const minDateString = minMoveOutDate.toISOString().split('T')[0]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href="/tenant/move" className="text-blue-600 hover:text-blue-800">
              Move Management
            </Link>
          </li>
          <li>
            <span className="mx-2 text-gray-400">/</span>
          </li>
          <li className="text-gray-500">Submit Move-Out Notice</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Submit Move-Out Notice</h1>
        <p className="mt-2 text-gray-600">
          Provide at least 30 days notice before your intended move-out date
        </p>
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Important Information</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li>This notice is legally binding and cannot be withdrawn once submitted</li>
                <li>You must provide at least 30 days notice (per your lease agreement)</li>
                <li>Your lease end date is December 31, 2024</li>
                <li>Final rent payment is due even if you move out early</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        {/* Move-Out Date */}
        <div>
          <label htmlFor="moveOutDate" className="block text-sm font-medium text-gray-700 mb-1">
            Intended Move-Out Date *
          </label>
          <input
            type="date"
            id="moveOutDate"
            value={formData.moveOutDate}
            onChange={(e) => setFormData({ ...formData, moveOutDate: e.target.value })}
            min={minDateString}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Must be at least 30 days from today
          </p>
        </div>

        {/* Reason for Moving */}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Moving (Optional)
          </label>
          <select
            id="reason"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a reason</option>
            <option value="relocation">Job Relocation</option>
            <option value="family">Family Reasons</option>
            <option value="purchase">Purchasing a Home</option>
            <option value="downsizing">Downsizing</option>
            <option value="upsizing">Need Larger Space</option>
            <option value="financial">Financial Reasons</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Forwarding Address */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Forwarding Address *</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                id="street"
                value={formData.forwardingAddress.street}
                onChange={(e) => setFormData({
                  ...formData,
                  forwardingAddress: { ...formData.forwardingAddress, street: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                id="city"
                value={formData.forwardingAddress.city}
                onChange={(e) => setFormData({
                  ...formData,
                  forwardingAddress: { ...formData.forwardingAddress, city: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State/County
              </label>
              <input
                type="text"
                id="state"
                value={formData.forwardingAddress.state}
                onChange={(e) => setFormData({
                  ...formData,
                  forwardingAddress: { ...formData.forwardingAddress, state: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                id="zip"
                value={formData.forwardingAddress.zip}
                onChange={(e) => setFormData({
                  ...formData,
                  forwardingAddress: { ...formData.forwardingAddress, zip: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                id="country"
                value={formData.forwardingAddress.country}
                onChange={(e) => setFormData({
                  ...formData,
                  forwardingAddress: { ...formData.forwardingAddress, country: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="forwardingPhone" className="block text-sm font-medium text-gray-700 mb-1">
              Forwarding Phone *
            </label>
            <input
              type="tel"
              id="forwardingPhone"
              value={formData.forwardingPhone}
              onChange={(e) => setFormData({ ...formData, forwardingPhone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="forwardingEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Forwarding Email *
            </label>
            <input
              type="email"
              id="forwardingEmail"
              value={formData.forwardingEmail}
              onChange={(e) => setFormData({ ...formData, forwardingEmail: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Optional Services */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Optional Services</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="cleaningService"
                checked={formData.cleaningService}
                onChange={(e) => setFormData({ ...formData, cleaningService: e.target.checked })}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="cleaningService" className="ml-3">
                <span className="block text-sm font-medium text-gray-700">
                  Request Professional Cleaning Service
                </span>
                <span className="block text-sm text-gray-500">
                  We can arrange professional cleaning at competitive rates (cost will be deducted from deposit)
                </span>
              </label>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="earlyTermination"
                checked={formData.earlyTermination}
                onChange={(e) => setFormData({ ...formData, earlyTermination: e.target.checked })}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="earlyTermination" className="ml-3">
                <span className="block text-sm font-medium text-gray-700">
                  Early Lease Termination
                </span>
                <span className="block text-sm text-gray-500">
                  Moving out before lease end date (may incur penalties per lease agreement)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Additional Comments */}
        <div>
          <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Comments or Special Requests
          </label>
          <textarea
            id="comments"
            value={formData.comments}
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any additional information you'd like to provide..."
          ></textarea>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Link
            href="/tenant/move"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </span>
            ) : (
              'Submit Move-Out Notice'
            )}
          </button>
        </div>
      </form>

      {/* Next Steps */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">What Happens Next?</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
          <li>We'll review your notice and confirm receipt within 24 hours</li>
          <li>A property manager will contact you to schedule the final inspection</li>
          <li>You'll receive a move-out checklist and instructions</li>
          <li>Complete the move-out process and return keys</li>
          <li>Your security deposit will be processed within 30 days</li>
        </ol>
      </div>
    </div>
  )
}
