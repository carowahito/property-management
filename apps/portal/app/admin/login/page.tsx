'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'

function AdminLoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError('Invalid email or password')
        setIsLoading(false)
      } else {
        // Successful login
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-400">
            Property management system administration
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6 bg-neutral-800 p-8 rounded-lg shadow-xl border border-neutral-700" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-danger-500/20 p-4 border border-danger-500">
              <div className="text-sm text-danger-100">{error}</div>
            </div>
          )}

          <div className="space-y-4">
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
              <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
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
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 bg-neutral-700 border-neutral-600 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-400 cursor-pointer">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/admin/forgot-password"
                className="font-medium text-primary-400 hover:text-primary-300"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="text-center">
            <p className="text-sm text-neutral-400">
              Don&apos;t have an account?{' '}
              <Link
                href="/admin/signup"
                className="font-medium text-primary-400 hover:text-primary-300"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>

        {/* Back to Home */}
        <div className="text-center">
          <Link href="/" className="text-sm text-primary-400 hover:text-primary-300 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800" />}>
      <AdminLoginForm />
    </Suspense>
  )
}
