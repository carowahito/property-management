'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function TenantProfilePage() {
  const [isEditing, setIsEditing] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['tenant-profile'],
    queryFn: () => fetch('/api/tenants?limit=1').then(r => r.json()),
  })

  const tenant = data?.tenants?.[0]

  const [formData, setFormData] = useState<Record<string, string>>({})

  // Sync form when tenant loads
  if (tenant && !formData.name) {
    setFormData({
      name: tenant.name || '',
      email: tenant.email || '',
      phone: tenant.phone || '',
      emergencyContact: tenant.emergencyContact || '',
      emergencyPhone: tenant.emergencyPhone || '',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-neutral-600">Profile not found.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Profile Settings</h1>
        <p className="mt-2 text-neutral-600">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-surface shadow rounded-lg p-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                {tenant.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
              </div>
              <h2 className="text-xl font-semibold text-neutral-900">{tenant.name}</h2>
              <p className="text-neutral-600 text-sm">{tenant.email}</p>
              <p className="text-neutral-500 text-sm mt-1">{tenant.phone}</p>
              <div className="mt-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  tenant.status === 'ACTIVE' ? 'bg-success-100 text-success-800' : 'bg-neutral-100 text-neutral-800'
                }`}>
                  {tenant.status}
                </span>
              </div>
            </div>

            <div className="mt-6 border-t border-neutral-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Property</span>
                <span className="font-medium">{tenant.property?.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Unit</span>
                <span className="font-medium">{tenant.unit || tenant.unitRef?.unitNumber || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">ID Number</span>
                <span className="font-medium">{tenant.idNumber || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Form */}
        <div className="lg:col-span-2">
          <div className="bg-surface shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Personal Information</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-sm text-primary-600 hover:text-primary-800 font-medium"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', key: 'name' },
                { label: 'Email', key: 'email' },
                { label: 'Phone', key: 'phone' },
                { label: 'Emergency Contact', key: 'emergencyContact' },
                { label: 'Emergency Phone', key: 'emergencyPhone' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">{field.label}</label>
                  <input
                    type="text"
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      isEditing ? 'border-neutral-300 bg-white' : 'border-transparent bg-neutral-50 text-neutral-700'
                    }`}
                  />
                </div>
              ))}
            </div>

            {isEditing && (
              <div className="mt-4 flex justify-end">
                <button className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700">
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
