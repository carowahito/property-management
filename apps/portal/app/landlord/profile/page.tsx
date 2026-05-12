'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function LandlordProfilePage() {
  const [isEditing, setIsEditing] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['landlord-profile'],
    queryFn: () => fetch('/api/landlords').then(r => r.json()),
  })

  const landlord = data?.landlords?.[0]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!landlord) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-neutral-600">Profile not found.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-neutral-900 mb-8">My Profile</h1>

      <div className="bg-surface shadow rounded-lg p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {landlord.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{landlord.name}</h2>
            <p className="text-neutral-600">{landlord.email}</p>
            <p className="text-neutral-500 text-sm">{landlord.phone}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', value: landlord.name },
            { label: 'Email', value: landlord.email },
            { label: 'Phone', value: landlord.phone },
            { label: 'ID Number', value: landlord.idNumber || '—' },
            { label: 'Address', value: landlord.address || '—' },
            { label: 'Bank Name', value: landlord.bankName || '—' },
            { label: 'Bank Account', value: landlord.bankAccount || '—' },
            { label: 'KRA PIN', value: landlord.taxId || '—' },
          ].map((field) => (
            <div key={field.label}>
              <label className="block text-sm font-medium text-neutral-700 mb-1">{field.label}</label>
              <div className="px-3 py-2 bg-neutral-50 border border-transparent rounded-md text-sm text-neutral-700">
                {field.value}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-200 pt-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            landlord.status === 'ACTIVE' ? 'bg-success-100 text-success-800' : 'bg-neutral-100 text-neutral-800'
          }`}>
            {landlord.status}
          </span>
        </div>
      </div>
    </div>
  )
}
