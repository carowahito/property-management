'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Property {
  id: string
  totalUnits: number
  status: string
}

interface Lease {
  id: string
  status: string
  monthlyRent: number
}

interface MaintenanceRequest {
  id: string
  status: string
  priority: string
}

interface PropertiesResponse {
  properties: Property[]
}

interface LeasesResponse {
  leases: Lease[]
}

interface MaintenanceResponse {
  maintenanceRequests: MaintenanceRequest[]
}

async function fetchProperties(): Promise<PropertiesResponse> {
  const response = await fetch('/api/properties')
  if (!response.ok) throw new Error('Failed to fetch properties')
  return response.json()
}

async function fetchLeases(): Promise<LeasesResponse> {
  const response = await fetch('/api/leases')
  if (!response.ok) throw new Error('Failed to fetch leases')
  return response.json()
}

async function fetchMaintenanceRequests(): Promise<MaintenanceResponse> {
  const response = await fetch('/api/maintenance-requests')
  if (!response.ok) throw new Error('Failed to fetch maintenance requests')
  return response.json()
}

export default function AdminDashboard() {
  const { data: propertiesData, isLoading: isLoadingProperties, error: propertiesError } = useQuery({
    queryKey: ['properties'],
    queryFn: fetchProperties,
  })

  const { data: leasesData, isLoading: isLoadingLeases, error: leasesError } = useQuery({
    queryKey: ['leases'],
    queryFn: fetchLeases,
  })

  const { data: maintenanceData, isLoading: isLoadingMaintenance, error: maintenanceError } = useQuery({
    queryKey: ['maintenance-requests'],
    queryFn: fetchMaintenanceRequests,
  })

  const isLoading = isLoadingProperties || isLoadingLeases || isLoadingMaintenance
  const hasError = propertiesError || leasesError || maintenanceError

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
        <p className="text-danger-800">Failed to load dashboard data. Please try again.</p>
      </div>
    )
  }

  const properties = propertiesData?.properties || []
  const leases = leasesData?.leases || []
  const maintenanceRequests = maintenanceData?.maintenanceRequests || []

  // Calculate statistics
  const activeProperties = properties.filter(p => p.status === 'ACTIVE')
  const totalUnits = properties.reduce((sum, p) => sum + (p.totalUnits || 0), 0)
  const activeLeases = leases.filter(l => l.status === 'ACTIVE')
  const pendingLeases = leases.filter(l => l.status === 'PENDING')
  const vacantUnits = totalUnits - activeLeases.length
  const occupancyRate = totalUnits > 0 ? (activeLeases.length / totalUnits) * 100 : 0
  const monthlyRevenue = activeLeases.reduce((sum, l) => sum + Number(l.monthlyRent), 0)
  const pendingMaintenance = maintenanceRequests.filter(m => m.status === 'PENDING' || m.status === 'IN_PROGRESS')
  const urgentMaintenance = maintenanceRequests.filter(m => m.priority === 'URGENT' && (m.status === 'PENDING' || m.status === 'IN_PROGRESS'))

  const stats = {
    totalProperties: activeProperties.length,
    totalUnits,
    vacantUnits,
    occupancyRate: occupancyRate.toFixed(1),
    monthlyRevenue,
    activeLeases: activeLeases.length,
    pendingLeases: pendingLeases.length,
    maintenanceRequests: pendingMaintenance.length,
    urgentMaintenance: urgentMaintenance.length,
  };

  const cardClass = 'bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer block'

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-neutral-900'>Dashboard</h1>
          <p className='text-neutral-600 mt-1'>Property management overview</p>
        </div>
        <Link href="/admin/properties">
          <Button variant="primary" size="lg">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Property
          </Button>
        </Link>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <Link href="/admin/properties" className={cardClass}>
          <p className='text-sm text-neutral-600'>Total Properties</p>
          <p className='text-3xl font-bold text-neutral-900'>{stats.totalProperties}</p>
          <p className='text-sm text-success-600 mt-2'>Active & managed</p>
        </Link>

        <Link href="/admin/properties" className={cardClass}>
          <p className='text-sm text-neutral-600'>Total Units</p>
          <p className='text-3xl font-bold text-neutral-900'>{stats.totalUnits}</p>
          <p className='text-sm text-primary-600 mt-2'>{stats.vacantUnits} vacant</p>
        </Link>

        <Link href="/admin/leases" className={cardClass}>
          <p className='text-sm text-neutral-600'>Occupancy Rate</p>
          <p className='text-3xl font-bold text-success-600'>{stats.occupancyRate}%</p>
          <p className='text-sm text-neutral-600 mt-2'>Industry avg: 85%</p>
        </Link>

        <Link href="/admin/payments" className={cardClass}>
          <p className='text-sm text-neutral-600'>Monthly Revenue</p>
          <p className='text-3xl font-bold text-neutral-900'>
            KSh {stats.monthlyRevenue.toLocaleString()}
          </p>
          <p className='text-sm text-neutral-600 mt-2'>From {stats.activeLeases} active leases</p>
        </Link>

        <Link href="/admin/leases" className={cardClass}>
          <p className='text-sm text-neutral-600'>Active Leases</p>
          <p className='text-3xl font-bold text-neutral-900'>{stats.activeLeases}</p>
          <p className='text-sm text-warning-600 mt-2'>{stats.pendingLeases} pending signatures</p>
        </Link>

        <Link href="/admin/maintenance" className={cardClass}>
          <p className='text-sm text-neutral-600'>Maintenance Requests</p>
          <p className='text-3xl font-bold text-warning-600'>{stats.maintenanceRequests}</p>
          <p className='text-sm text-neutral-600 mt-2'>{stats.urgentMaintenance} urgent</p>
        </Link>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white shadow rounded-lg p-6'>
          <h2 className='text-xl font-semibold text-neutral-900 mb-4'>Quick Actions</h2>
          <div className='space-y-3'>
            <a href='/admin/properties' className='block p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition'>
              <div className='font-medium text-primary-900'>Manage Properties</div>
              <div className='text-sm text-primary-700'>View and update property portfolio</div>
            </a>
            <a href='/admin/tenants' className='block p-3 bg-success-50 rounded-lg hover:bg-success-100 transition'>
              <div className='font-medium text-success-900'>Tenant Management</div>
              <div className='text-sm text-success-700'>Add or manage tenant information</div>
            </a>
            <a href='/admin/payments' className='block p-3 bg-purple-50 rounded-lg hover:bg-primary-100 transition'>
              <div className='font-medium text-purple-900'>Collect Payments</div>
              <div className='text-sm text-primary-700'>Track rent and payment collection</div>
            </a>
            <a href='/admin/maintenance' className='block p-3 bg-warning-50 rounded-lg hover:bg-warning-100 transition'>
              <div className='font-medium text-warning-900'>Maintenance Requests</div>
              <div className='text-sm text-warning-700'>Review and assign work orders</div>
            </a>
          </div>
        </div>

        <div className='bg-white shadow rounded-lg p-6'>
          <h2 className='text-xl font-semibold text-neutral-900 mb-4'>Recent Activity</h2>
          <div className='text-sm text-neutral-500'>No recent activity to display.</div>
        </div>
      </div>
    </div>
  );
}
