'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

function InviteForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [inviteData, setInviteData] = useState<{ email: string; name: string; role: string; leaseStartDate?: string | null; leaseEndDate?: string | null } | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided')
      setIsLoading(false)
      return
    }

    fetch(`/api/invitations/${token}`)
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) {
          setError(data.error)
        } else {
          setInviteData(data)
        }
      })
      .catch(() => setError('Failed to validate invitation'))
      .finally(() => setIsLoading(false))
  }, [token])

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

    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/invitations/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        setIsSubmitting(false)
        return
      }

      // Auto sign-in
      const result = await signIn('credentials', {
        redirect: false,
        email: inviteData!.email,
        password,
      })

      if (result?.error) {
        setSuccess(true)
      } else {
        const dashboard = data.role === 'TENANT' ? '/tenant/dashboard' : data.role === 'LANDLORD' ? '/landlord/dashboard' : data.role === 'VENDOR' ? '/vendor/dashboard' : '/admin'
        router.push(dashboard)
        router.refresh()
      }
    } catch {
      setError('An error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800">
        <p className="text-neutral-400">Validating invitation...</p>
      </div>
    )
  }

  if (error && !inviteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800 px-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="bg-neutral-800 p-8 rounded-lg border border-neutral-700">
            <div className="w-16 h-16 bg-danger-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-danger-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Invalid Invitation</h2>
            <p className="text-neutral-400">{error}</p>
          </div>
          <Link href="/admin/login" className="text-sm text-primary-400 hover:text-primary-300 font-medium">
            Go to Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800 px-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="bg-neutral-800 p-8 rounded-lg border border-neutral-700">
            <div className="w-16 h-16 bg-success-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Account Created</h2>
            <p className="text-neutral-400 mb-4">Your account has been set up successfully.</p>
            <Link
              href="/admin/login"
              className="inline-block px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition text-sm font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Welcome, {inviteData?.name}
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-400">
            You&apos;ve been invited as a <span className="text-primary-400 font-medium">{inviteData?.role?.toLowerCase()}</span>. Set your password to get started.
          </p>
        </div>

        {inviteData?.leaseStartDate && inviteData?.leaseEndDate && (
          <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-5">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Lease Details</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-neutral-500 mb-1">Start Date</p>
                <p className="text-sm font-medium text-white">
                  {new Date(inviteData.leaseStartDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">End Date</p>
                <p className="text-sm font-medium text-white">
                  {new Date(inviteData.leaseEndDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6 bg-neutral-800 p-8 rounded-lg shadow-xl border border-neutral-700" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-danger-500/20 p-4 border border-danger-500">
              <div className="text-sm text-danger-100">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Email</label>
              <input
                type="email"
                value={inviteData?.email || ''}
                disabled
                className="w-full px-3 py-2 bg-neutral-600 border border-neutral-500 rounded-md text-neutral-300 sm:text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
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
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? 'Setting up account...' : 'Set Password & Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800"><p className="text-neutral-400">Loading...</p></div>}>
      <InviteForm />
    </Suspense>
  )
}
