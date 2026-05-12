'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function TenantRegisterPage() {
  const [formData, setFormData] = useState({
    renterCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    // TODO: Implement actual registration
    setTimeout(() => {
      setIsLoading(false)
      alert('Registration successful! Please check your email to verify your account.')
      window.location.href = '/tenant/login'
    }, 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-900">
            Register for Tenant Portal
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            Create your account to access your rental dashboard
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-danger-50 p-4">
              <div className="text-sm text-danger-800">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            {/* Renter Code */}
            <div>
              <label htmlFor="renter-code" className="block text-sm font-medium text-neutral-700">
                Renter Code <span className="text-danger-500">*</span>
              </label>
              <input
                id="renter-code"
                name="renterCode"
                type="text"
                required
                value={formData.renterCode}
                onChange={(e) => setFormData({ ...formData, renterCode: e.target.value })}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter the code provided by management"
              />
              <p className="mt-1 text-xs text-neutral-500">
                This was provided to you when you signed your lease
              </p>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first-name" className="block text-sm font-medium text-neutral-700">
                  First Name <span className="text-danger-500">*</span>
                </label>
                <input
                  id="first-name"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="last-name" className="block text-sm font-medium text-neutral-700">
                  Last Name <span className="text-danger-500">*</span>
                </label>
                <input
                  id="last-name"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                Email Address <span className="text-danger-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-neutral-700">
                Phone Number <span className="text-danger-500">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="254700000000"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                Password <span className="text-danger-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-neutral-500">
                Must be at least 8 characters with letters and numbers
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-neutral-700">
                Confirm Password <span className="text-danger-500">*</span>
              </label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-neutral-900">
              I agree to the{' '}
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                Privacy Policy
              </a>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-neutral-600">
              Already have an account?{' '}
              <Link
                href="/tenant/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
