'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatDate } from '@/lib/utils'

type DocumentItem = {
  id: string
  name: string
  type: 'Lease' | 'Receipt' | 'Inspection'
  date: string
  status: string
  link: string
}

export default function DocumentsPage() {
  const [activeFilter, setActiveFilter] = useState('All')

  const { data: leasesData, isLoading: isLoadingLeases } = useQuery({
    queryKey: ['tenant-leases-docs'],
    queryFn: () => fetch('/api/leases?status=ACTIVE&limit=10').then(r => r.json()),
  })

  const { data: paymentsData, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['tenant-paid-payments-docs'],
    queryFn: () => fetch('/api/payments?status=PAID').then(r => r.json()),
  })

  const tenantId = leasesData?.leases?.[0]?.tenant?.id as string | undefined

  const { data: tenantDocsData, isLoading: isLoadingDocs } = useQuery({
    queryKey: ['tenant-inspection-docs', tenantId],
    enabled: !!tenantId,
    queryFn: () => fetch(`/api/tenants/${tenantId}/documents`).then(r => r.json()),
  })

  const isLoading = isLoadingLeases || isLoadingPayments || (!!tenantId && isLoadingDocs)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-neutral-600">Loading documents...</p>
        </div>
      </div>
    )
  }

  const leases = leasesData?.leases || []
  const paidPayments = paymentsData?.payments || []
  const inspectionDocs = (tenantDocsData?.documents || []).filter((d: any) => d.fileType === 'INSPECTION_REPORT')

  // Build document list from real data
  const documents: DocumentItem[] = []

  // Add lease agreements
  leases.forEach((lease: any) => {
    documents.push({
      id: `lease-${lease.id}`,
      name: `Lease Agreement - ${lease.property?.name || 'Property'}`,
      type: 'Lease',
      date: lease.startDate,
      status: lease.status === 'ACTIVE' ? 'Active' : 'Expired',
      link: `/tenant/lease/${lease.id}/view`,
    })
  })

  // Add payment receipts
  paidPayments.forEach((payment: any) => {
    const paymentDate = payment.paidDate || payment.dueDate
    const monthYear = new Date(paymentDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    documents.push({
      id: `receipt-${payment.id}`,
      name: `Rent Receipt - ${monthYear}`,
      type: 'Receipt',
      date: paymentDate,
      status: 'Active',
      link: `/tenant/payments/${payment.id}/receipt`,
    })
  })

  // Add inspection reports
  inspectionDocs.forEach((doc: any) => {
    documents.push({
      id: `inspection-${doc.id}`,
      name: doc.name,
      type: 'Inspection',
      date: doc.uploadedAt,
      status: 'Active',
      link: doc.url,
    })
  })

  // Sort by date descending
  documents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const documentTypes = ['All', 'Lease', 'Receipt', 'Inspection']

  const filteredDocuments = activeFilter === 'All'
    ? documents
    : documents.filter(d => d.type === activeFilter)

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'Lease':
        return '📄'
      case 'Receipt':
        return '🧾'
      case 'Inspection':
        return '📋'
      default:
        return '📁'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Documents</h1>
      </div>

      {/* Document Stats */}
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 mb-6">
        <div className="bg-surface overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <p className="text-sm font-medium text-neutral-500">Total Documents</p>
            <p className="mt-1 text-2xl font-semibold text-neutral-900">{documents.length}</p>
          </div>
        </div>
        <div className="bg-surface overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <p className="text-sm font-medium text-neutral-500">Lease Agreements</p>
            <p className="mt-1 text-2xl font-semibold text-primary-600">
              {documents.filter((d) => d.type === 'Lease').length}
            </p>
          </div>
        </div>
        <div className="bg-surface overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <p className="text-sm font-medium text-neutral-500">Payment Receipts</p>
            <p className="mt-1 text-2xl font-semibold text-success-600">
              {documents.filter((d) => d.type === 'Receipt').length}
            </p>
          </div>
        </div>
        <div className="bg-surface overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <p className="text-sm font-medium text-neutral-500">Inspection Reports</p>
            <p className="mt-1 text-2xl font-semibold text-amber-600">
              {documents.filter((d) => d.type === 'Inspection').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        {documentTypes.map((type) => (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            className={`px-4 py-2 text-sm font-medium rounded-md border ${
              activeFilter === type
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-neutral-300 bg-surface text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Documents Table */}
      <div className="bg-surface shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Document Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-neutral-200">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-neutral-500">
                    No documents found.
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getDocumentIcon(doc.type)}</span>
                        <div>
                          <div className="text-sm font-medium text-neutral-900">{doc.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {doc.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {formatDate(doc.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          doc.status === 'Active'
                            ? 'bg-success-100 text-success-800'
                            : 'bg-neutral-100 text-neutral-800'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={doc.link}
                        target={doc.type === 'Inspection' ? '_blank' : undefined}
                        rel={doc.type === 'Inspection' ? 'noreferrer' : undefined}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Important Documents Notice */}
      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Important:</strong> Please keep copies of all lease-related documents in a
              safe place. Your lease agreement and payment receipts are particularly
              important for your records.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
