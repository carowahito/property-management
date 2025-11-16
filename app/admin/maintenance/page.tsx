'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface MaintenanceRequest {
  id: string;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  issueType: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  description: string;
  createdDate: string;
  assignedTo?: string;
  estimatedCost?: number;
}

export default function MaintenancePage() {
  const [requests] = useState<MaintenanceRequest[]>([
    {
      id: '1',
      tenantName: 'John Mwangi',
      propertyName: 'Sunset Apartments',
      unitNumber: '5A',
      issueType: 'Plumbing',
      priority: 'high',
      status: 'open',
      description: 'Leaking kitchen sink',
      createdDate: '2024-11-10',
      estimatedCost: 5000,
    },
    {
      id: '2',
      tenantName: 'Jane Achieng',
      propertyName: 'Highland House',
      unitNumber: '12',
      issueType: 'Electrical',
      priority: 'urgent',
      status: 'in-progress',
      description: 'Power outage in bedroom',
      createdDate: '2024-11-12',
      assignedTo: "Mike's Electrical Services",
      estimatedCost: 8000,
    },
    {
      id: '3',
      tenantName: 'Peter Omondi',
      propertyName: 'Vista Plaza Office',
      unitNumber: '8B',
      issueType: 'HVAC',
      priority: 'medium',
      status: 'completed',
      description: 'Air conditioning not cooling properly',
      createdDate: '2024-11-05',
      assignedTo: 'Cool Air Solutions',
      estimatedCost: 12000,
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const filteredRequests = requests.filter((req) => {
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || req.priority === filterPriority;
    return matchesStatus && matchesPriority;
  });

  const stats = {
    totalRequests: requests.length,
    openRequests: requests.filter((r) => r.status === 'open').length,
    inProgress: requests.filter((r) => r.status === 'in-progress').length,
    urgent: requests.filter((r) => r.priority === 'urgent').length,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-yellow-100 text-yellow-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
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
            <option value='open'>Open</option>
            <option value='in-progress'>In Progress</option>
            <option value='completed'>Completed</option>
            <option value='cancelled'>Cancelled</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          >
            <option value='all'>All Priority</option>
            <option value='low'>Low</option>
            <option value='medium'>Medium</option>
            <option value='high'>High</option>
            <option value='urgent'>Urgent</option>
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
                  <div className='text-sm font-medium text-gray-900'>{request.description}</div>
                  <div className='text-sm text-gray-500'>by {request.tenantName}</div>
                  <div className='text-xs text-gray-400'>{request.createdDate}</div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-900'>{request.propertyName}</div>
                  <div className='text-sm text-gray-500'>Unit {request.unitNumber}</div>
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
                  {request.assignedTo || <span className='text-gray-400'>Unassigned</span>}
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
