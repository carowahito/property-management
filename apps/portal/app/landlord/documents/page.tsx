'use client'

import { useQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatDate } from '@/lib/utils'

interface Lease {
  id: string
  tenantId: string
  propertyId: string
  unit: string | null
  startDate: string
  endDate: string
  status: string
  tenant: {
    id: string
    name: string
  }
  property: {
    id: string
    name: string
    address: string
  }
  unitRef?: { id: string; unitNumber: string } | null
}

interface OwnerStatement {
  id: string
  month: number
  year: number
  status: string
  netDisbursement: number
  generatedAt: string
  property: {
    id: string
    name: string
  } | null
  landlord: {
    id: string
    name: string
  }
}

async function fetchLeases(): Promise<{ leases: Lease[] }> {
  const res = await fetch('/api/leases')
  if (!res.ok) throw new Error('Failed to fetch leases')
  return res.json()
}

async function fetchStatements(): Promise<{ statements: OwnerStatement[] }> {
  const res = await fetch('/api/owner-statements')
  if (!res.ok) throw new Error('Failed to fetch statements')
  return res.json()
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function LandlordDocumentsPage() {
  const { data: leasesData, isLoading: loadingLeases } = useQuery({
    queryKey: ['landlord-doc-leases'],
    queryFn: fetchLeases,
  })

  const { data: statementsData, isLoading: loadingStatements } = useQuery({
    queryKey: ['landlord-doc-statements'],
    queryFn: fetchStatements,
  })

  if (loadingLeases || loadingStatements) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const leases = leasesData?.leases || []
  const statements = statementsData?.statements || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Documents</h1>
      </div>

      {/* Lease Agreements */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Lease Agreements</h2>
        <div className="bg-surface shadow rounded-lg p-6">
          <div className="space-y-4">
            {leases.length === 0 && (
              <p className="text-sm text-neutral-500">No lease agreements found</p>
            )}
            {leases.map(lease => (
              <div key={lease.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-success-500 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">📄</div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      Lease Agreement - {lease.tenant.name}
                    </p>
                    <p className="text-xs text-neutral-600">
                      {lease.property.name}
                      {lease.unitRef?.unitNumber ? ` - ${lease.unitRef.unitNumber}` : lease.unit ? ` - ${lease.unit}` : ''}
                      {' '}&bull; {formatDate(lease.startDate)} to {formatDate(lease.endDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    lease.status === 'ACTIVE' ? 'bg-success-100 text-success-800' :
                    lease.status === 'EXPIRED' ? 'bg-neutral-100 text-neutral-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {lease.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Owner Statements */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Owner Statements</h2>
        <div className="bg-surface shadow rounded-lg p-6">
          <div className="space-y-4">
            {statements.length === 0 && (
              <p className="text-sm text-neutral-500">No owner statements found</p>
            )}
            {statements.map(stmt => (
              <div key={stmt.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-primary-500 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">📊</div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      Statement - {months[stmt.month - 1]} {stmt.year}
                    </p>
                    <p className="text-xs text-neutral-600">
                      {stmt.property?.name || 'All Properties'}
                      {' '}&bull; Net: KES {Number(stmt.netDisbursement).toLocaleString()}
                      {' '}&bull; Generated: {formatDate(stmt.generatedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    stmt.status === 'FINALIZED' ? 'bg-success-100 text-success-800' :
                    stmt.status === 'SENT' ? 'bg-primary-100 text-primary-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {stmt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
