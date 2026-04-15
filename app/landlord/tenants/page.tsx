'use client'

import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatDate } from '@/lib/utils'

export default function LandlordTenantsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['landlord-tenants'],
    queryFn: () => fetch('/api/tenants').then(r => r.json()),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const tenants = data?.tenants || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tenants</h1>
      </div>

      {tenants.length === 0 ? (
        <div className="bg-surface shadow rounded-lg p-8 text-center text-neutral-500">
          No tenants found.
        </div>
      ) : (
        <div className="bg-surface shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Tenant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Move-in</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-neutral-200">
              {tenants.map((tenant: any) => (
                <tr key={tenant.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-neutral-900">{tenant.name}</div>
                    <div className="text-xs text-neutral-500">{tenant.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                    {tenant.unit || tenant.unitRef?.unitNumber || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                    {tenant.property?.name || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                    {tenant.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                    {tenant.moveInDate ? formatDate(tenant.moveInDate) : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      tenant.status === 'ACTIVE'
                        ? 'bg-success-100 text-success-800'
                        : 'bg-neutral-100 text-neutral-800'
                    }`}>
                      {tenant.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
