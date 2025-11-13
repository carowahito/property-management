'use client'

import { EmergencyContacts } from '@/components/tenant-portal/emergency-contacts'

export default function EmergencyContactsPage() {
  // Mock tenant data - will be replaced with actual API calls
  const tenantData = {
    id: 'tenant_123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+254700000000',
    propertyId: 'prop_456',
    propertyAddress: '123 Main Street, Apt 4B, Nairobi',
    leaseId: 'lease_789',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Emergency Contacts</h1>
        <p className="mt-2 text-gray-600">
          Quick access to emergency services and contacts
        </p>
      </div>
      <EmergencyContacts tenantData={tenantData} />
    </div>
  )
}
