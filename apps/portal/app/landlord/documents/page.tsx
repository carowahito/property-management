'use client'

import Link from 'next/link'
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
    landlord?: { id: string; name: string } | null
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

  const landlordId = leasesData?.leases?.[0]?.property?.landlord?.id as string | undefined

  const { data: landlordDocsData, isLoading: loadingDocs } = useQuery({
    queryKey: ['landlord-inspection-docs', landlordId],
    enabled: !!landlordId,
    queryFn: () => fetch(`/api/landlords/${landlordId}/documents`).then(r => r.json()),
  })

  const { data: myInspectionsData } = useQuery({
    queryKey: ['landlord-me-inspections'],
    queryFn: () => fetch('/api/landlords/me/inspections').then(r => r.json()),
  })

  const pendingSignatureInspections = (myInspectionsData?.inspections || []).filter(
    (i: any) => !i.landlordSignedAt
  )

  if (loadingLeases || loadingStatements || (!!landlordId && loadingDocs)) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const leases = leasesData?.leases || []
  const statements = statementsData?.statements || []
  const inspectionReports = (landlordDocsData?.documents || []).filter((d: any) => d.fileType === 'INSPECTION_REPORT')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Documents</h1>
      </div>

      {/* Pending Inspection Signatures */}
      {pendingSignatureInspections.length > 0 && (
        <div className="mb-8 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4">
          <p className="text-sm font-medium text-amber-800 mb-2">
            {pendingSignatureInspections.length} inspection report{pendingSignatureInspections.length > 1 ? 's' : ''} awaiting your signature
          </p>
          <ul className="space-y-2">
            {pendingSignatureInspections.map((insp: any) => (
              <li key={insp.id} className="flex items-center justify-between bg-surface rounded px-3 py-2">
                <span className="text-sm text-neutral-700">
                  {insp.property?.name}{insp.unit ? ` — Unit ${insp.unit.unitNumber}` : ''} — {insp.completedDate ? formatDate(insp.completedDate) : ''}
                </span>
                <Link
                  href={`/landlord/inspections/${insp.id}/sign`}
                  className="text-sm font-medium text-primary-600 hover:text-primary-900"
                >
                  Sign Now
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

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

      {/* Inspection Reports */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Inspection Reports</h2>
        <div className="bg-surface shadow rounded-lg p-6">
          <div className="space-y-4">
            {inspectionReports.length === 0 && (
              <p className="text-sm text-neutral-500">No inspection reports yet</p>
            )}
            {inspectionReports.map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-amber-500 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">📋</div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{doc.name}</p>
                    <p className="text-xs text-neutral-600">
                      Completed: {formatDate(doc.uploadedAt)}
                    </p>
                  </div>
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 text-sm text-primary-600 hover:text-primary-900 border border-primary-300 rounded hover:bg-primary-50 transition-colors"
                >
                  View Report
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
