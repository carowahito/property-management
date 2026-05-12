'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function NewMaintenanceRequestPage() {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    priority: 'Medium',
    description: '',
    preferredDate: '',
    preferredTime: '',
  })
  const [photos, setPhotos] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // TODO: Implement actual form submission
    setTimeout(() => {
      alert('Maintenance request submitted successfully!')
      window.location.href = '/tenant/maintenance'
    }, 1000)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files).slice(0, 5 - photos.length)
      setPhotos([...photos, ...newPhotos])
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/tenant/maintenance" className="text-sm text-primary-600 hover:text-primary-800">
          ← Back to Maintenance Requests
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">Submit Maintenance Request</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Please provide detailed information about the issue you're experiencing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface shadow rounded-lg p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-neutral-700">
              Issue Title <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Leaking faucet in kitchen"
              className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-neutral-700">
                Category <span className="text-danger-500">*</span>
              </label>
              <select
                id="category"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Select a category</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="HVAC">HVAC (Heating/Cooling)</option>
                <option value="Appliance">Appliance</option>
                <option value="Structural">Structural</option>
                <option value="Pest Control">Pest Control</option>
                <option value="General">General Maintenance</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-neutral-700">
                Priority <span className="text-danger-500">*</span>
              </label>
              <select
                id="priority"
                required
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="Low">Low - Can wait a week</option>
                <option value="Medium">Medium - Within a few days</option>
                <option value="High">High - Within 24 hours</option>
                <option value="Urgent">Urgent - Immediate attention needed</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-neutral-700">
              Detailed Description <span className="text-danger-500">*</span>
            </label>
            <textarea
              id="description"
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please describe the issue in detail. Include when it started, what you've observed, and any relevant information..."
              className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Photos (Optional, max 5)
            </label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="photos"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-neutral-300 border-dashed rounded-lg cursor-pointer bg-neutral-50 hover:bg-neutral-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-10 h-10 mb-3 text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-neutral-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-neutral-500">PNG, JPG or JPEG (MAX. 10MB per file)</p>
                </div>
                <input
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="hidden"
                  disabled={photos.length >= 5}
                />
              </label>
            </div>

            {/* Photo Preview */}
            {photos.length > 0 && (
              <div className="mt-4 grid grid-cols-5 gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Preview ${index + 1}`}
                      className="h-20 w-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-danger-500 text-white rounded-full p-1 text-xs hover:bg-danger-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preferred Date/Time */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="preferredDate" className="block text-sm font-medium text-neutral-700">
                Preferred Date (Optional)
              </label>
              <input
                type="date"
                id="preferredDate"
                value={formData.preferredDate}
                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="preferredTime" className="block text-sm font-medium text-neutral-700">
                Preferred Time (Optional)
              </label>
              <select
                id="preferredTime"
                value={formData.preferredTime}
                onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Select a time</option>
                <option value="Morning (8AM-12PM)">Morning (8AM-12PM)</option>
                <option value="Afternoon (12PM-5PM)">Afternoon (12PM-5PM)</option>
                <option value="Evening (5PM-8PM)">Evening (5PM-8PM)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Emergency?</strong> For urgent issues requiring immediate attention (flooding,
                gas leak, no power), please call{' '}
                <a href="tel:+254700000000" className="font-medium underline">
                  +254 700 000 000
                </a>{' '}
                instead of submitting a request online.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Link
            href="/tenant/maintenance"
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-surface hover:bg-neutral-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  )
}
