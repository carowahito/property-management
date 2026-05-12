'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function VendorLogin() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    setTimeout(() => {
      setError('Vendor portal login is not yet available.')
      setIsLoading(false)
    }, 500)
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-warning-50 to-warning-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-surface shadow-lg rounded-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-warning-100 rounded-full mb-4">
            <svg className="w-12 h-12 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900">Vendor Portal</h1>
          <p className="text-neutral-600 mt-2">Sign in to manage your jobs and quotes</p>
        </div>

        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500 focus:border-transparent"
              placeholder="vendor@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full px-4 py-2 pr-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500 focus:border-transparent"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-neutral-300 text-warning-600 focus:ring-warning-500" />
              <span className="ml-2 text-sm text-neutral-600">Remember me</span>
            </label>
            <Link href="/vendor/forgot-password" className="text-sm text-warning-600 hover:text-warning-800">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-warning-600 text-white py-2 px-4 rounded-lg hover:bg-warning-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-neutral-600">
          Need help? <Link href="/support" className="text-warning-600 hover:text-warning-800">Contact Support</Link>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-warning-600 hover:text-warning-800 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
