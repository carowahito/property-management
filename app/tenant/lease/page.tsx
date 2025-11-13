'use client'

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Lease Agreement</h1>
        <p className="mt-2 text-gray-600">View your lease agreement and details</p>
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Lease Information</h2>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-600">Lease ID:</dt>
                <dd className="font-medium">{tenantData.leaseId}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Move-in Date:</dt>
                <dd className="font-medium">{tenantData.moveInDate}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Property:</dt>
                <dd className="font-medium">{tenantData.propertyAddress}</dd>
              </div>
            </dl>
          </div>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Download Lease PDF
          </button>
        </div>
      </div>
    </div>
  )
}
