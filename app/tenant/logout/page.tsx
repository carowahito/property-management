'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TenantLogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // TODO: Implement actual logout logic (clear session, tokens, etc.)
    // For now, just redirect to login after a short delay
    const timer = setTimeout(() => {
      router.push('/tenant/login')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-12 w-12 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Logging out...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You are being logged out of your account
          </p>
        </div>

        <div className="mt-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs text-gray-500">
            Redirecting you to the login page...
          </p>
        </div>
      </div>
    </div>
  )
}
