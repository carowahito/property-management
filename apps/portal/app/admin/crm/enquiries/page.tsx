'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatDate } from '@/lib/utils'

interface Enquiry {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  status: string
  priority: string
  assignedTo: string | null
  createdAt: string
  resolvedAt: string | null
  propertyId: string | null
}

interface EnquiriesResponse {
  enquiries: Enquiry[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

async function fetchEnquiries(): Promise<EnquiriesResponse> {
  const response = await fetch('/api/enquiries')
  if (!response.ok) {
    throw new Error('Failed to fetch enquiries')
  }
  return response.json()
}

export default function EnquiriesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  const { data, isLoading, error } = useQuery({
    queryKey: ['enquiries'],
    queryFn: fetchEnquiries,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load enquiries. Please try again.</p>
      </div>
    )
  }

  const enquiries = data?.enquiries || []

  const filteredEnquiries = enquiries.filter(enquiry => {
    const matchesSearch =
      enquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || enquiry.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || enquiry.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const stats = {
    total: enquiries.length,
    open: enquiries.filter(e => e.status === 'OPEN').length,
    inProgress: enquiries.filter(e => e.status === 'IN_PROGRESS').length,
    resolved: enquiries.filter(e => e.status === 'RESOLVED').length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-primary-100 text-primary-800'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800'
      case 'RESOLVED': return 'bg-success-100 text-green-800'
      case 'CLOSED': return 'bg-neutral-100 text-neutral-800'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-danger-100 text-red-800'
      case 'HIGH': return 'bg-warning-100 text-orange-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-neutral-100 text-neutral-800'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Enquiries</h1>
          <p className="text-neutral-600 mt-1">Manage customer questions and support requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Enquiries</p>
              <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Open</p>
              <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.open}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">In Progress</p>
              <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.inProgress}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Resolved</p>
              <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.resolved}</p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-lg border border-neutral-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or subject..."
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="bg-surface rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Enquiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-neutral-200">
              {filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                    No enquiries found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-neutral-900">{enquiry.name}</div>
                        <div className="text-sm text-neutral-500">{enquiry.subject}</div>
                        <div className="text-xs text-neutral-500">{enquiry.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(enquiry.status)}`}>
                        {enquiry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(enquiry.priority)}`}>
                        {enquiry.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {enquiry.assignedTo || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">{formatDate(enquiry.createdAt)}</div>
                      {enquiry.resolvedAt && (
                        <div className="text-xs text-neutral-500">
                          Resolved: {formatDate(enquiry.resolvedAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/enquiries/${enquiry.id}`}
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
    </div>
  )
}
