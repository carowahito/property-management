'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import AddLandlordForm from '@/components/forms/AddLandlordForm'

interface Landlord {
  id: string
  name: string
  email: string
  phone: string
  status: string
  type: string
  members: Array<{ name: string; isPrimary: boolean; ownershipPercent: number | null }>
  _count: {
    properties: number
    units: number
    payouts: number
  }
}

interface LandlordsResponse {
  landlords: Landlord[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

async function fetchLandlords(): Promise<LandlordsResponse> {
  const response = await fetch('/api/landlords')
  if (!response.ok) {
    throw new Error('Failed to fetch landlords')
  }
  return response.json()
}

export default function AdminLandlordsPage() {
  const [selectedLandlord, setSelectedLandlord] = useState<Landlord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddLandlordModal, setShowAddLandlordModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const archiveMutation = useMutation({
    mutationFn: async ({ id, isArchived }: { id: string; isArchived: boolean }) => {
      const res = await fetch(`/api/landlords/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: isArchived ? 'INACTIVE' : 'ARCHIVED' }),
      })
      if (!res.ok) throw new Error('Action failed')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['landlords'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/landlords/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['landlords'] }),
  })

  const createLandlordMutation = useMutation({
    mutationFn: async (formData: any) => {
      // Validate required fields
      const isCompany = formData.ownershipType === 'company'
      if (!isCompany && (!formData.firstName || !formData.lastName)) {
        throw new Error('First name and last name are required');
      }
      if (isCompany && !formData.companyName) {
        throw new Error('Company name is required');
      }
      if (!formData.email) {
        throw new Error('Email is required');
      }
      if (!formData.phoneNumber) {
        throw new Error('Phone number is required');
      }

      // Map ownershipType → API type
      const typeMap: Record<string, string> = { individual: 'INDIVIDUAL', company: 'COMPANY', joint: 'JOINT_OWNERSHIP' }
      const landlordType = typeMap[formData.ownershipType] ?? 'INDIVIDUAL'

      // For company, use company name as the landlord name
      const landlordName = formData.ownershipType === 'company'
        ? (formData.companyName?.trim() || `${formData.firstName.trim()} ${formData.lastName.trim()}`)
        : `${formData.firstName.trim()} ${formData.lastName.trim()}`

      // Build members for joint ownership
      const members: Array<Record<string, unknown>> = []
      if (formData.ownershipType === 'joint' && formData.additionalOwners?.length > 0) {
        // The primary person in Section A is also a member
        members.push({
          name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          idNumber: formData.idNumber?.trim() || undefined,
          phone: formData.phoneNumber?.trim() || undefined,
          email: formData.email?.trim() || undefined,
          isPrimary: true,
        })
        for (const owner of formData.additionalOwners) {
          if (owner.firstName || owner.lastName) {
            members.push({
              name: `${owner.firstName} ${owner.lastName}`.trim(),
              idNumber: owner.idNumber || undefined,
              nationality: owner.nationality || undefined,
              countryOfResidence: owner.countryOfResidence || undefined,
              isPrimary: false,
            })
          }
        }
      }

      // For company, store the contact person as a member
      if (formData.ownershipType === 'company' && formData.contactPersonName?.trim()) {
        members.push({
          name: formData.contactPersonName.trim(),
          phone: formData.contactPersonPhone?.trim() || undefined,
          email: formData.contactPersonEmail?.trim() || undefined,
          isPrimary: true,
        })
      }

      // Extract only the fields that the API accepts
      const landlordData: Record<string, unknown> = {
        name: landlordName,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phoneNumber.trim(),
        idNumber: formData.ownershipType === 'company'
          ? (formData.companyRegNumber?.trim() || undefined)
          : (formData.idNumber?.trim() || undefined),
        address: (formData.postalAddress || formData.physicalAddress)?.trim() || undefined,
        bankName: formData.bankName?.trim() || undefined,
        bankAccount: formData.bankAccountNumber?.trim() || undefined,
        taxId: formData.kraPin?.trim() || undefined,
        status: 'ACTIVE',
        type: landlordType,
        managementFeePercent: formData.monthlyManagementFeePercent ? parseFloat(formData.monthlyManagementFeePercent) : undefined,
        managementFeeType: formData.monthlyManagementFeeType || 'PERCENTAGE',
        tenantPlacementFee: formData.tenantPlacementFeeMonths ? parseFloat(formData.tenantPlacementFeeMonths) : undefined,
        members: members.length > 0 ? members : undefined,
      };

      // Remove undefined values
      Object.keys(landlordData).forEach(key => {
        if (landlordData[key] === undefined) delete landlordData[key];
      });

      console.log('Sending landlord data:', landlordData);

      const response = await fetch('/api/landlords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(landlordData),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('API Error:', error);
        
        // Provide more user-friendly error messages
        if (error.error?.includes('Email or ID number already exists')) {
          throw new Error('This email or ID number is already registered. Please use different values or check your existing landlords.');
        }
        
        throw new Error(error.error || JSON.stringify(error.details) || 'Failed to create landlord');
      }

      const landlord = await response.json();

      // Assign units to the new landlord
      const landlordUnits = formData.landlordUnits ?? [];
      for (const unit of landlordUnits) {
        if (!unit.unitNumber) continue;

        if (String(unit.unitId).startsWith('new_')) {
          // Try to create; if it already exists (409) reassign it instead
          const unitRes = await fetch('/api/units', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              propertyId: formData.selectedPropertyId,
              landlordId: landlord.id,
              unitNumber: unit.unitNumber,
              monthlyRent: unit.monthlyRent ? parseFloat(unit.monthlyRent) : undefined,
              floor: unit.floor ? parseInt(unit.floor) : undefined,
              bedrooms: unit.bedrooms ? parseInt(unit.bedrooms) : undefined,
              bathrooms: unit.bathrooms ? parseInt(unit.bathrooms) : undefined,
              status: (unit.status || 'vacant').toUpperCase(),
            }),
          });
          if (!unitRes.ok) {
            if (unitRes.status === 409) {
              // Unit exists — reassign it to this landlord
              const patchRes = await fetch(`/api/units/${unit.unitNumber}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ landlordId: landlord.id }),
              });
              if (!patchRes.ok) {
                const err = await patchRes.json();
                throw new Error(err.error || `Failed to reassign unit ${unit.unitNumber}`);
              }
            } else {
              const err = await unitRes.json();
              throw new Error(err.error || `Failed to create unit ${unit.unitNumber}`);
            }
          }
        } else {
          // Existing unit — assign it to this landlord
          await fetch(`/api/units/${unit.unitNumber}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ landlordId: landlord.id }),
          });
        }
      }

      return landlord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlords'] });
      setShowAddLandlordModal(false);
      alert('Landlord created successfully!');
    },
    onError: (error: any) => {
      alert(`Error creating landlord: ${error.message}`);
    },
  });

  const handleLandlordSubmit = (data: unknown) => {
    const formData = data as any;
    
    // Check for duplicates in current list
    const emailLower = formData.email?.trim().toLowerCase();
    const existingByEmail = landlords.find(l => l.email.toLowerCase() === emailLower);
    
    if (existingByEmail) {
      alert(`A landlord with email "${formData.email}" already exists. To make changes, please use the edit function or delete and recreate with new information.`);
      return;
    }

    console.log('Submitting landlord:', formData);
    createLandlordMutation.mutate(formData);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['landlords'],
    queryFn: fetchLandlords,
  })

  const { data: invitesData } = useQuery({
    queryKey: ['pending-landlord-invites'],
    queryFn: async () => {
      const res = await fetch('/api/invitations?role=LANDLORD&status=PENDING')
      if (!res.ok) return { pendingTenantCount: 0 }
      return res.json()
    },
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
        <p className="text-red-800">Failed to load landlords. Please try again.</p>
      </div>
    )
  }

  const landlords = data?.landlords || []

  const filteredLandlords = landlords.filter(
    (landlord) => {
      const matchesSearch = landlord.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        landlord.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || landlord.status === filterStatus
      // Note: Property filter would require landlord data to include property names
      // For now, we'll keep it simple with just status filter
      return matchesSearch && matchesStatus
    }
  );

  const stats = {
    totalLandlords: landlords.length,
    activeLandlords: landlords.filter((l) => l.status === 'ACTIVE').length,
    inactiveLandlords: landlords.filter((l) => l.status === 'INACTIVE').length,
    totalUnits: landlords.reduce((sum, l) => sum + l._count.units, 0),
  };

  const pendingInviteCount = invitesData?.pendingTenantCount ?? 0

  return (
    <div className='p-4 md:p-6 space-y-4 md:space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-xl md:text-2xl font-bold text-neutral-900'>Landlords CRM</h1>
          <p className='text-neutral-600 mt-1'>Manage landlord relationships and portfolios</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowAddLandlordModal(true)}>+ Add Landlord</Button>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6'>
        <div className='bg-surface shadow rounded-lg p-4 md:p-6'>
          <p className='text-sm text-neutral-600'>Total Landlords</p>
          <p className='text-3xl font-bold text-primary-600'>{stats.totalLandlords}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-4 md:p-6'>
          <p className='text-sm text-neutral-600'>Active</p>
          <p className='text-3xl font-bold text-success-600'>{stats.activeLandlords}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-4 md:p-6'>
          <p className='text-sm text-neutral-600'>Inactive</p>
          <p className='text-3xl font-bold text-neutral-600'>{stats.inactiveLandlords}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-4 md:p-6'>
          <p className='text-sm text-neutral-600'>Total Units</p>
          <p className='text-3xl font-bold text-primary-600'>{stats.totalUnits}</p>
        </div>
        <Link href='/admin/invitations?role=landlord&status=pending' className='block bg-surface shadow rounded-lg p-4 md:p-6 hover:border hover:border-primary-300 hover:shadow-md transition-all group'>
          <div className='flex items-start justify-between'>
            <p className='text-sm text-neutral-600 group-hover:text-primary-600 transition-colors'>Pending Invites</p>
            <svg className='w-4 h-4 text-neutral-400 group-hover:text-primary-500 transition-colors' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
            </svg>
          </div>
          <p className='text-3xl font-bold text-neutral-900 mt-2'>{pendingInviteCount}</p>
          <p className='text-xs text-primary-500 mt-2 group-hover:text-primary-600'>View invite schedule →</p>
        </Link>
      </div>

      <div className='bg-surface shadow rounded-lg p-4 md:p-6'>
        <div className='mb-4 grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className="md:col-span-2">
            <input
              type='text'
              placeholder='Search landlords by name or email...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-neutral-200'>
            <thead className='bg-neutral-50'>
              <tr>
                <th className='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                  Landlord
                </th>
                <th className='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell'>
                  Contact
                </th>
                <th className='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                  Units
                </th>
                <th className='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                  Status
                </th>
                <th className='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-surface divide-y divide-neutral-200'>
              {filteredLandlords.map((landlord) => (
                <tr key={landlord.id} className='hover:bg-neutral-50'>
                  <td className='px-3 md:px-6 py-2 md:py-4'>
                    <div className='flex items-center'>
                      <div className='h-10 w-10 rounded-full bg-success-100 flex-shrink-0 flex items-center justify-center'>
                        <span className='text-success-600 font-semibold text-lg'>
                          {landlord.name.charAt(0)}
                        </span>
                      </div>
                      <div className='ml-4 min-w-0'>
                        <Link href={`/admin/landlords/${landlord.id}`} className='text-sm font-medium text-primary-600 hover:text-primary-800'>
                          {landlord.type === 'JOINT_OWNERSHIP' && landlord.members?.length > 0
                            ? [landlord.name, ...landlord.members.map(m => m.name)].join(' & ')
                            : landlord.name}
                        </Link>
                        {landlord.type === 'COMPANY' && landlord.members?.length > 0 && (
                          <p className='text-xs text-neutral-400 mt-0.5'>
                            Contact: {landlord.members.find(m => m.isPrimary)?.name || landlord.members[0].name}
                          </p>
                        )}
                        <p className='text-sm text-neutral-500'>{landlord._count.payouts} payouts</p>
                      </div>
                    </div>
                  </td>
                  <td className='px-3 md:px-6 py-2 md:py-4 hidden md:table-cell'>
                    <p className='text-sm text-neutral-900'>{landlord.email}</p>
                    <p className='text-sm text-neutral-500'>{landlord.phone}</p>
                  </td>
                  <td className='px-3 md:px-6 py-2 md:py-4'>
                    <Link href={`/admin/landlords/${landlord.id}?tab=properties`} className='text-sm font-semibold text-primary-600 hover:underline'>{landlord._count.units} units</Link>
                  </td>
                  <td className='px-3 md:px-6 py-2 md:py-4'>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        landlord.status === 'ACTIVE'
                          ? 'bg-success-100 text-green-800'
                          : landlord.status === 'SUSPENDED'
                          ? 'bg-danger-100 text-red-800'
                          : 'bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      {landlord.status}
                    </span>
                  </td>
                  <td className='px-3 md:px-6 py-2 md:py-4'>
                    <div className='relative inline-block'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenDropdown(openDropdown === landlord.id ? null : landlord.id)
                        }}
                        className='p-1.5 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                        title='Actions'
                      >
                        <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                          <path d='M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z' />
                        </svg>
                      </button>

                      {openDropdown === landlord.id && (
                        <>
                          <div
                            className='fixed inset-0 z-10'
                            onClick={() => setOpenDropdown(null)}
                          />
                          <div className='absolute right-0 z-20 mt-1 w-40 bg-white rounded-lg shadow-lg border border-neutral-200 py-1'>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedLandlord(landlord)
                                setOpenDropdown(null)
                              }}
                              className='flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50'
                            >
                              <svg className='w-4 h-4 mr-2 text-neutral-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                              </svg>
                              View
                            </button>
                            <Link
                              href={`/admin/landlords/${landlord.id}`}
                              onClick={() => setOpenDropdown(null)}
                              className='flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50'
                            >
                              <svg className='w-4 h-4 mr-2 text-neutral-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                              </svg>
                              Edit
                            </Link>
                            <div className='border-t border-neutral-100 mt-1 pt-1'>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  archiveMutation.mutate({ id: landlord.id, isArchived: landlord.status === 'ARCHIVED' })
                                  setOpenDropdown(null)
                                }}
                                className='flex items-center w-full px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50'
                              >
                                <svg className='w-4 h-4 mr-2 text-neutral-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' />
                                </svg>
                                {landlord.status === 'ARCHIVED' ? 'Restore' : 'Archive'}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (window.confirm(`Permanently delete ${landlord.name}? This cannot be undone.`)) {
                                    deleteMutation.mutate(landlord.id)
                                  }
                                  setOpenDropdown(null)
                                }}
                                className='flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50'
                              >
                                <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Landlord Details Modal */}
      {selectedLandlord && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-4 md:p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl md:text-2xl font-bold text-neutral-900'>Landlord Details</h2>
                <button
                  onClick={() => setSelectedLandlord(null)}
                  className='text-neutral-400 hover:text-neutral-600'
                >
                  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>

              <div className='space-y-4'>
                <div className='bg-neutral-50 rounded-lg p-4'>
                  <h3 className='font-semibold text-neutral-900 mb-2'>Contact Information</h3>
                  <p className='text-sm text-neutral-600'>Name: {selectedLandlord.name}</p>
                  <p className='text-sm text-neutral-600'>Email: {selectedLandlord.email}</p>
                  <p className='text-sm text-neutral-600'>Phone: {selectedLandlord.phone}</p>
                  <p className='text-sm text-neutral-600'>Status: <span className={`font-semibold ${
                    selectedLandlord.status === 'ACTIVE' ? 'text-success-600' :
                    selectedLandlord.status === 'SUSPENDED' ? 'text-danger-600' :
                    'text-neutral-600'
                  }`}>{selectedLandlord.status}</span></p>
                </div>

                <div className='bg-neutral-50 rounded-lg p-4'>
                  <h3 className='font-semibold text-neutral-900 mb-2'>Portfolio Summary</h3>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <p className='text-sm text-neutral-600'>Units</p>
                      <p className='text-2xl font-bold text-primary-600'>{selectedLandlord._count.units}</p>
                    </div>
                    <div>
                      <p className='text-sm text-neutral-600'>Payouts</p>
                      <p className='text-2xl font-bold text-success-600'>{selectedLandlord._count.payouts}</p>
                    </div>
                  </div>
                  <Link href={`/admin/landlords/${selectedLandlord.id}`} className="block mt-4">
                    <Button variant="outline" className="w-full">
                      View Full Details →
                    </Button>
                  </Link>
                </div>

                <div className='flex gap-3 pt-4'>
                  <Button
                    onClick={() => setSelectedLandlord(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Link href={`/admin/landlords/${selectedLandlord.id}`} className="flex-1">
                    <Button variant="primary" className="w-full">
                      Full Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Landlord Modal */}
      {showAddLandlordModal && (
        <AddLandlordForm
          onClose={() => setShowAddLandlordModal(false)}
          onSubmit={handleLandlordSubmit}
        />
      )}
    </div>
  );
}
