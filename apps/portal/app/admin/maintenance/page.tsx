'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDate, formatRefNumber } from '@/lib/utils';

interface MaintenanceRequest {
  id: string
  title: string
  description: string
  category: string | null
  priority: string
  status: string
  createdAt: string
  resolvedAt: string | null
  // Triage fields
  triageCategory: string | null
  slaDeadline: string | null
  slaBreached: boolean
  // Approval fields
  estimatedCost: number | null
  approvalRequired: boolean
  approvedBy: string | null
  approvedAt: string | null
  landlordNotified: boolean
  landlordNotifiedAt: string | null
  tenant?: {
    id: string
    name: string
    email: string
  }
  property?: {
    id: string
    name: string
    address: string
    landlord?: {
      id: string
      name: string
    }
  }
  _count?: {
    workOrders: number
  }
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

interface Contractor {
  id: string
  name: string
  trade: string
  phone: string
  isVetted: boolean
  rating: number | null
}

async function fetchMaintenanceRequests(): Promise<MaintenanceResponse> {
  const response = await fetch('/api/maintenance-requests')
  if (!response.ok) throw new Error('Failed to fetch maintenance requests')
  return response.json()
}

async function fetchContractors(): Promise<{ contractors: Contractor[] }> {
  const response = await fetch('/api/contractors?isVetted=true&isActive=true')
  if (!response.ok) throw new Error('Failed to fetch contractors')
  return response.json()
}

function getSlaStatus(slaDeadline: string | null, slaBreached: boolean): { label: string; color: string } {
  if (!slaDeadline) return { label: 'No SLA', color: 'text-neutral-400' };
  if (slaBreached) return { label: 'SLA BREACHED', color: 'text-red-600 font-bold' };

  const deadline = new Date(slaDeadline);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();

  if (diffMs < 0) return { label: 'SLA BREACHED', color: 'text-red-600 font-bold' };

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;

  if (diffDays > 0) {
    return { label: `${diffDays}d ${remainingHours}h remaining`, color: diffDays <= 1 ? 'text-yellow-600' : 'text-green-600' };
  }
  if (diffHours > 0) {
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return { label: `${diffHours}h ${mins}m remaining`, color: diffHours <= 2 ? 'text-yellow-600' : 'text-green-600' };
  }
  return { label: 'Due soon', color: 'text-yellow-600' };
}

function getTriageCategoryColor(category: string | null): string {
  switch (category) {
    case 'EMERGENCY': return 'bg-red-600 text-white';
    case 'URGENT': return 'bg-orange-500 text-white';
    case 'ROUTINE': return 'bg-blue-100 text-blue-800';
    case 'PREVENTIVE': return 'bg-green-100 text-green-800';
    default: return 'bg-neutral-100 text-neutral-600';
  }
}

type ActivePanel = { type: 'triage' | 'assign'; id: string } | null

export default function MaintenancePage() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [triageForm, setTriageForm] = useState<{ category: string; estimatedCost: string }>({
    category: 'ROUTINE',
    estimatedCost: '',
  });
  const [assignForm, setAssignForm] = useState<{
    responsibleParty: string;
    responsibilityReason: string;
    assignedContractorId: string;
  }>({ responsibleParty: 'LANDLORD', responsibilityReason: '', assignedContractorId: '' });

  // Keep selectedRequest alias for triage panel compatibility
  const selectedRequest = activePanel?.type === 'triage' ? activePanel.id : null;
  const setSelectedRequest = (id: string | null) =>
    setActivePanel(id ? { type: 'triage', id } : null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['maintenance-requests'],
    queryFn: fetchMaintenanceRequests,
  });

  const { data: contractorsData } = useQuery({
    queryKey: ['contractors-vetted'],
    queryFn: fetchContractors,
  });

  const triageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/maintenance-requests/${id}/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to triage');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      setActivePanel(null);
    },
  });

  const assignMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/maintenance-requests/${id}/assign-responsibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to assign');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      setActivePanel(null);
      setAssignForm({ responsibleParty: 'LANDLORD', responsibilityReason: '', assignedContractorId: '' });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/maintenance-requests/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: 'Admin' }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to approve');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load maintenance requests. Please try again.</p>
      </div>
    );
  }

  const requests = data?.maintenanceRequests || [];
  const contractors = contractorsData?.contractors || [];

  const filteredRequests = requests.filter((req) => {
    const matchesStatus = filterStatus === 'all' || req.status.toUpperCase() === filterStatus.toUpperCase();
    const matchesPriority = filterPriority === 'all' || req.priority.toUpperCase() === filterPriority.toUpperCase();
    return matchesStatus && matchesPriority;
  });

  const stats = {
    totalRequests: requests.length,
    openRequests: requests.filter((r) => ['NEW', 'PENDING', 'UNDER_REVIEW', 'RESPONSIBILITY_ASSIGNED'].includes(r.status)).length,
    inProgress: requests.filter((r) => r.status.toUpperCase() === 'IN_PROGRESS').length,
    urgent: requests.filter((r) => r.priority.toUpperCase() === 'URGENT').length,
    slaBreached: requests.filter((r) => r.slaBreached || (r.slaDeadline && new Date(r.slaDeadline) < new Date())).length,
    awaitingApproval: requests.filter((r) => r.approvalRequired && !r.approvedAt).length,
  };

  const getPriorityColor = (priority: string) => {
    const upperPriority = priority.toUpperCase();
    switch (upperPriority) {
      case 'LOW': return 'bg-neutral-100 text-neutral-800';
      case 'MEDIUM': return 'bg-primary-100 text-primary-800';
      case 'HIGH': return 'bg-yellow-100 text-yellow-800';
      case 'URGENT': return 'bg-danger-100 text-red-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
      case 'PENDING':                       return 'bg-yellow-100 text-yellow-800';
      case 'UNDER_REVIEW':                  return 'bg-blue-100 text-blue-800';
      case 'RESPONSIBILITY_ASSIGNED':       return 'bg-indigo-100 text-indigo-800';
      case 'QUOTING':                       return 'bg-purple-100 text-purple-800';
      case 'AWAITING_APPROVAL':             return 'bg-orange-100 text-orange-800';
      case 'AWAITING_FUNDS':                return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':                   return 'bg-primary-100 text-primary-800';
      case 'COMPLETED_PENDING_CONFIRMATION':return 'bg-teal-100 text-teal-800';
      case 'COMPLETED':
      case 'CLOSED':                        return 'bg-success-100 text-green-800';
      case 'DISPUTED':                      return 'bg-red-100 text-red-800';
      case 'CANCELLED':                     return 'bg-neutral-100 text-neutral-800';
      default:                              return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <div className='p-4 md:p-6 space-y-4 md:space-y-6'>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-neutral-900">Maintenance Requests</h1>
          <p className="text-neutral-600 mt-1">Manage, triage, and track maintenance requests</p>
        </div>
        <Button variant="primary" size="lg">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4'>
        <div className='bg-surface shadow rounded-lg p-4'>
          <p className='text-xs text-neutral-600'>Total</p>
          <p className='text-2xl font-bold text-neutral-900'>{stats.totalRequests}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-4'>
          <p className='text-xs text-neutral-600'>Open</p>
          <p className='text-2xl font-bold text-yellow-600'>{stats.openRequests}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-4'>
          <p className='text-xs text-neutral-600'>In Progress</p>
          <p className='text-2xl font-bold text-primary-600'>{stats.inProgress}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-4'>
          <p className='text-xs text-neutral-600'>Urgent</p>
          <p className='text-2xl font-bold text-danger-600'>{stats.urgent}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-4 border-l-4 border-red-500'>
          <p className='text-xs text-neutral-600'>SLA Breached</p>
          <p className='text-2xl font-bold text-red-600'>{stats.slaBreached}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-4 border-l-4 border-orange-500'>
          <p className='text-xs text-neutral-600'>Awaiting Approval</p>
          <p className='text-2xl font-bold text-orange-600'>{stats.awaitingApproval}</p>
        </div>
      </div>

      {/* Triage Panel */}
      {selectedRequest && (
        <div className="bg-surface shadow-lg rounded-lg p-4 md:p-6 border-2 border-primary-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">Triage Request</h2>
            <button onClick={() => setSelectedRequest(null)} className="text-neutral-400 hover:text-neutral-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Triage Category</label>
              <div className="flex gap-2 flex-wrap">
                {['EMERGENCY', 'URGENT', 'ROUTINE', 'PREVENTIVE'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTriageForm({ ...triageForm, category: cat })}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full transition ${
                      triageForm.category === cat
                        ? getTriageCategoryColor(cat)
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Estimated Cost (KSh)</label>
              <input
                type="number"
                value={triageForm.estimatedCost}
                onChange={(e) => setTriageForm({ ...triageForm, estimatedCost: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {Number(triageForm.estimatedCost) > 5000 && (
                <p className="text-xs text-orange-600 mt-1">Approval required (over KSh 5,000)</p>
              )}
              {Number(triageForm.estimatedCost) > 15000 && (
                <p className="text-xs text-red-600 mt-1">3 quotes required (over KSh 15,000)</p>
              )}
            </div>
            <div className="flex items-end">
              <Button
                variant="primary"
                onClick={() => {
                  triageMutation.mutate({
                    id: selectedRequest,
                    data: {
                      triageCategory: triageForm.category,
                      estimatedCost: triageForm.estimatedCost ? Number(triageForm.estimatedCost) : undefined,
                    },
                  });
                }}
                disabled={triageMutation.isPending}
              >
                {triageMutation.isPending ? 'Saving...' : 'Save Triage'}
              </Button>
              {triageMutation.isError && (
                <p className="text-sm text-red-600 ml-3">
                  {(triageMutation.error as Error).message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Vendor Panel */}
      {activePanel?.type === 'assign' && (
        <div className="bg-surface shadow-lg rounded-lg p-4 md:p-6 border-2 border-indigo-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">Assign Vendor for Inspection</h2>
            <button onClick={() => setActivePanel(null)} className="text-neutral-400 hover:text-neutral-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Who is responsible?</label>
              <div className="flex gap-2">
                {(['LANDLORD', 'TENANT', 'SHARED'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAssignForm({ ...assignForm, responsibleParty: p })}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full transition ${
                      assignForm.responsibleParty === p
                        ? 'bg-indigo-600 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Assign Vendor</label>
              <select
                value={assignForm.assignedContractorId}
                onChange={(e) => setAssignForm({ ...assignForm, assignedContractorId: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="">— Select vendor —</option>
                {(contractorsData?.contractors ?? []).map((c: Contractor) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.trade}{c.isVetted ? ' ✓' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Reason / Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                value={assignForm.responsibilityReason}
                onChange={(e) => setAssignForm({ ...assignForm, responsibilityReason: e.target.value })}
                placeholder="e.g. Wear and tear — landlord's responsibility. Sending plumber to inspect and quote."
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <Button
                variant="primary"
                onClick={() => {
                  if (!assignForm.responsibilityReason.trim()) return;
                  assignMutation.mutate({
                    id: activePanel.id,
                    data: {
                      responsibleParty: assignForm.responsibleParty,
                      responsibilityReason: assignForm.responsibilityReason,
                      assignedContractorId: assignForm.assignedContractorId || undefined,
                    },
                  });
                }}
                disabled={assignMutation.isPending || !assignForm.responsibilityReason.trim()}
              >
                {assignMutation.isPending ? 'Saving...' : 'Assign Vendor'}
              </Button>
              {assignMutation.isError && (
                <p className="text-sm text-red-600">{(assignMutation.error as Error).message}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className='bg-surface shadow rounded-lg p-4'>
        <div className='flex flex-col sm:flex-row flex-wrap gap-2 md:gap-4'>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className='px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
          >
            <option value='all'>All Status</option>
            <option value='NEW'>New</option>
            <option value='UNDER_REVIEW'>Under Review</option>
            <option value='RESPONSIBILITY_ASSIGNED'>Vendor Assigned</option>
            <option value='QUOTING'>Quoting</option>
            <option value='AWAITING_APPROVAL'>Awaiting Approval</option>
            <option value='AWAITING_FUNDS'>Awaiting Funds</option>
            <option value='IN_PROGRESS'>In Progress</option>
            <option value='COMPLETED_PENDING_CONFIRMATION'>Pending Confirmation</option>
            <option value='COMPLETED'>Completed</option>
            <option value='CLOSED'>Closed</option>
            <option value='CANCELLED'>Cancelled</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className='px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
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
      <div className='bg-surface shadow rounded-lg overflow-hidden overflow-x-auto'>
        <table className='min-w-full divide-y divide-neutral-200'>
          <thead className='bg-neutral-50'>
            <tr>
              <th className='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                Request Details
              </th>
              <th className='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell'>
                Property
              </th>
              <th className='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell'>
                Triage
              </th>
              <th className='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell'>
                SLA
              </th>
              <th className='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                Priority
              </th>
              <th className='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                Status
              </th>
              <th className='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell'>
                Cost / Approval
              </th>
              <th className='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-surface divide-y divide-neutral-200'>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-neutral-500">
                  No maintenance requests found.
                </td>
              </tr>
            ) : (
              filteredRequests.map((request) => {
                const slaStatus = getSlaStatus(request.slaDeadline, request.slaBreached);
                const needsApproval = request.approvalRequired && !request.approvedAt;

                return (
                  <tr key={request.id} className='hover:bg-neutral-50'>
                    <td className='px-3 md:px-6 py-2 md:py-4'>
                      {request.refNumber && (
                        <div className='text-xs font-mono text-neutral-400 mb-0.5'>{formatRefNumber(request.refNumber)}</div>
                      )}
                      <div className='text-sm font-medium text-neutral-900'>{request.title}</div>
                      <div className='text-sm text-neutral-500'>
                        by {request.tenant ? (
                          <Link href={`/admin/tenants/${request.tenant.id}`} className="text-primary-600 hover:text-primary-800 hover:underline">
                            {request.tenant.name}
                          </Link>
                        ) : 'Unknown'}
                      </div>
                      <div className='text-xs text-neutral-400'>{formatDate(request.createdAt)}</div>
                    </td>
                    <td className='px-3 md:px-6 py-2 md:py-4 whitespace-nowrap hidden md:table-cell'>
                      <div className='text-sm'>
                        {request.property ? (
                          <Link href={`/admin/properties/${request.property.id}`} className="text-primary-600 hover:text-primary-800 hover:underline">
                            {request.property.name}
                          </Link>
                        ) : 'N/A'}
                      </div>
                    </td>
                    <td className='px-3 md:px-6 py-2 md:py-4 whitespace-nowrap hidden md:table-cell'>
                      {request.triageCategory ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTriageCategoryColor(request.triageCategory)}`}>
                          {request.triageCategory}
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-400">Not triaged</span>
                      )}
                    </td>
                    <td className='px-3 md:px-6 py-2 md:py-4 whitespace-nowrap hidden md:table-cell'>
                      <span className={`text-xs ${slaStatus.color}`}>
                        {slaStatus.label}
                      </span>
                    </td>
                    <td className='px-3 md:px-6 py-2 md:py-4 whitespace-nowrap'>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}
                      >
                        {request.priority}
                      </span>
                    </td>
                    <td className='px-3 md:px-6 py-2 md:py-4 whitespace-nowrap'>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className='px-3 md:px-6 py-2 md:py-4 whitespace-nowrap hidden md:table-cell'>
                      {request.estimatedCost !== null && (
                        <div className="text-sm text-neutral-900">
                          KSh {Number(request.estimatedCost).toLocaleString()}
                        </div>
                      )}
                      {needsApproval && (
                        <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 mt-1">
                          Requires Approval
                        </span>
                      )}
                      {request.approvedAt && (
                        <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 mt-1">
                          Approved
                        </span>
                      )}
                    </td>
                    <td className='px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm'>
                      <div className="flex flex-col gap-1">
                        {(request.status === 'NEW' || request.status === 'PENDING') && (
                          <button
                            onClick={() => setActivePanel(
                              activePanel?.type === 'triage' && activePanel.id === request.id
                                ? null
                                : { type: 'triage', id: request.id }
                            )}
                            className="text-primary-600 hover:text-primary-800 text-left"
                          >
                            Triage
                          </button>
                        )}
                        {request.status === 'UNDER_REVIEW' && (
                          <button
                            onClick={() => setActivePanel(
                              activePanel?.type === 'assign' && activePanel.id === request.id
                                ? null
                                : { type: 'assign', id: request.id }
                            )}
                            className="text-indigo-600 hover:text-indigo-800 font-medium text-left"
                          >
                            Assign Vendor
                          </button>
                        )}
                        {needsApproval && (
                          <button
                            onClick={() => approveMutation.mutate(request.id)}
                            disabled={approveMutation.isPending}
                            className="text-green-600 hover:text-green-800 text-left"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
