'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDate } from '@/lib/utils';

interface MaintenanceRequest {
  id: string
  title: string
  description: string
  issueType: string
  priority: string
  status: string
  createdAt: string
  scheduledDate?: string
  completedDate?: string
  estimatedCost?: number
  actualCost?: number
  tenant?: {
    id: string
    name: string
  }
  lease?: {
    id: string
    unit: string | null
    property: {
      id: string
      name: string
    }
  }
  assignedVendor?: {
    id: string
    name: string
  }
  workOrders?: {
    id: string
    status: string
  }[]
}

interface MaintenanceResponse {
  maintenanceRequests: MaintenanceRequest[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

async function fetchMaintenanceRequests(): Promise<MaintenanceResponse> {
  const response = await fetch('/api/maintenance-requests')
  if (!response.ok) throw new Error('Failed to fetch maintenance requests')
  return response.json()
}

export default function MaintenancePage() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['maintenance-requests', filterStatus, filterPriority],
    queryFn: fetchMaintenanceRequests,
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load maintenance requests. Please try again.</p>
      </div>
    )
  }

  const requests = data?.maintenanceRequests || []

  const filteredRequests = requests.filter((req) => {
    const matchesStatus = filterStatus === 'all' || req.status.toUpperCase() === filterStatus.toUpperCase();
    const matchesPriority = filterPriority === 'all' || req.priority.toUpperCase() === filterPriority.toUpperCase();
    return matchesStatus && matchesPriority;
  });

  const stats = {
    totalRequests: requests.length,
    openRequests: requests.filter((r) => r.status.toUpperCase() === 'PENDING').length,
    inProgress: requests.filter((r) => r.status.toUpperCase() === 'IN_PROGRESS').length,
    urgent: requests.filter((r) => r.priority.toUpperCase() === 'URGENT').length,
  };

  const getPriorityColor = (priority: string) => {
    const upperPriority = priority.toUpperCase();
    switch (upperPriority) {
      case 'LOW':
        return 'bg-gray-100 text-gray-800';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800';
      case 'HIGH':
        return 'bg-yellow-100 text-yellow-800';
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    const upperStatus = status.toUpperCase();
    switch (upperStatus) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='p-6 space-y-6'>
            <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Requests</h1>
          <p className="text-gray-600 mt-1">Manage and track maintenance requests</p>
        </div>
        <Button variant="primary" size="lg">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Total Requests</p>
          <p className='text-3xl font-bold text-gray-900'>{stats.totalRequests}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Open</p>
          <p className='text-3xl font-bold text-yellow-600'>{stats.openRequests}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>In Progress</p>
          <p className='text-3xl font-bold text-blue-600'>{stats.inProgress}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Urgent</p>
          <p className='text-3xl font-bold text-red-600'>{stats.urgent}</p>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white shadow rounded-lg p-4'>
        <div className='flex gap-4'>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          >
            <option value='all'>All Status</option>
            <option value='PENDING'>Pending</option>
            <option value='IN_PROGRESS'>In Progress</option>
            <option value='COMPLETED'>Completed</option>
            <option value='CANCELLED'>Cancelled</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          >
            <option value='all'>All Priority</option>
            <option value='LOW'>Low</option>
            <option value='MEDIUM'>Medium</option>
            <option value='HIGH'>High</option>
            <option value='URGENT'>Urgent</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className='bg-white shadow rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Request Details
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Property/Unit
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Issue Type
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Priority
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Status
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Assigned To
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {filteredRequests.map((request) => (
              <tr key={request.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4'>
                  <div className='text-sm font-medium text-gray-900'>{request.title}</div>
                  <div className='text-sm text-gray-500'>
                    by {request.tenant ? (
                      <Link href={`/admin/tenants/${request.tenant.id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                        {request.tenant.name}
                      </Link>
                    ) : 'Unknown'}
                  </div>
                  <div className='text-xs text-gray-400'>{formatDate(request.createdAt)}</div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm'>
                    {request.lease?.property ? (
                      <Link href={`/admin/properties/${request.lease.property.id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                        {request.lease.property.name}
                      </Link>
                    ) : 'N/A'}
                  </div>
                  <div className='text-sm text-gray-500'>Unit {request.lease?.unit || 'N/A'}</div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {request.issueType}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}
                  >
                    {request.priority}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}
                  >
                    {request.status}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {request.assignedVendor ? (
                    <Link href={`/admin/vendors/${request.assignedVendor.id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                      {request.assignedVendor.name}
                    </Link>
                  ) : <span className='text-gray-400'>Unassigned</span>}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2'>
                  <button  >
                    View
                  </button>
                  <button  >
                    Assign
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
