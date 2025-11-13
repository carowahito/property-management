'use client'

import { TenantLease } from '@/components/tenant-portal/tenant-lease'

export default function TenantLeasePage() {
  // Mock tenant data - will be replaced with actual API calls
  const tenantData = {
    id: 'tenant_123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+254700000000',
    propertyId: 'prop_456',
    propertyAddress: '123 Main Street, Apt 4B, Nairobi',
    moveInDate: '2024-01-01',
    leaseId: 'lease_789',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <TenantLease tenantData={tenantData} />
    </div>
  )
}
