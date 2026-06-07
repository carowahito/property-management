'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

type AccountType = 'admin' | 'tenant' | 'landlord'

const ACCOUNT_TYPES: { value: AccountType; label: string; description: string }[] = [
  { value: 'admin', label: 'Property Manager', description: 'Manage properties, tenants, and finances' },
  { value: 'tenant', label: 'Tenant', description: 'View your lease, pay rent, and submit requests' },
  { value: 'landlord', label: 'Landlord', description: 'Track your properties and rental income' },
]

function getDashboardForRole(role: string): string {
  switch (role) {
    case 'TENANT': return '/tenant/dashboard'
    case 'LANDLORD': return '/landlord/dashboard'
    default: return '/admin'
  }
}

export default function AdminSignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accountType, setAccountType] = useState<AccountType>('admin')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, accountType }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create account')
        setIsLoading(false)
        return
      }

      // Auto sign-in after successful registration
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        router.push('/admin/login')
      } else {
        router.push(getDashboardForRole(data.role))
        router.refresh()
      }
    } catch {
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-400">
            Sign up for the property management portal
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-neutral-800 p-8 rounded-lg shadow-xl border border-neutral-700" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-danger-500/20 p-4 border border-danger-500">
              <div className="text-sm text-danger-100">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            {/* Account Type Selector */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                I am a...
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ACCOUNT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setAccountType(type.value)}
                    className={`p-3 rounded-lg border text-center transition ${
                      accountType === type.value
                        ? 'border-primary-500 bg-primary-500/20 text-primary-300'
                        : 'border-neutral-600 bg-neutral-700 text-neutral-400 hover:border-neutral-500'
                    }`}
                  >
                    <p className="text-sm font-medium">{type.label}</p>
                    <p className="text-xs mt-1 opacity-75">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md placeholder-neutral-500 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-neutral-300 mb-1">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md placeholder-neutral-500 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-neutral-300 mb-1">
                Phone Number {accountType !== 'admin' && <span className="text-danger-400">*</span>}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required={accountType !== 'admin'}
                className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md placeholder-neutral-500 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="+254 7XX XXX XXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="w-full px-3 py-2 pr-10 bg-neutral-700 border border-neutral-600 rounded-md placeholder-neutral-500 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-200"
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
              <p className="mt-1 text-xs text-neutral-500">Minimum 6 characters</p>
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-neutral-300 mb-1">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md placeholder-neutral-500 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>

          <div className="text-center">
            <p className="text-sm text-neutral-400">
              Already have an account?{' '}
              <Link
                href="/admin/login"
                className="font-medium text-primary-400 hover:text-primary-300"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>

        <div className="text-center">
          <Link href="/" className="text-sm text-primary-400 hover:text-primary-300 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
