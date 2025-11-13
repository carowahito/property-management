'use client'

export default function TenantUtilitiesPage() {
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
        <h1 className="text-3xl font-bold text-gray-900">Utilities</h1>
        <p className="mt-2 text-gray-600">
          Manage and pay your utility bills in one place
        </p>
      </div>
      <TenantUtilities tenantData={tenantData} />
    </div>
  )
}
