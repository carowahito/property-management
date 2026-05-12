'use client'

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

  const emergencyContacts = [
    { name: 'Police', number: '911', icon: '🚔' },
    { name: 'Fire Department', number: '911', icon: '🚒' },
    { name: 'Medical Emergency', number: '911', icon: '🚑' },
    { name: 'Property Management', number: '+254700000001', icon: '🏢' },
    { name: 'Landlord', number: '+254700000002', icon: '👤' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Emergency Contacts</h1>
        <p className="mt-2 text-neutral-600">
          Quick access to emergency services and contacts
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {emergencyContacts.map((contact, index) => (
          <div key={index} className="bg-surface shadow rounded-lg p-6">
            <div className="text-4xl mb-2">{contact.icon}</div>
            <h3 className="text-lg font-semibold text-neutral-900">{contact.name}</h3>
            <p className="text-2xl font-bold text-danger-600 mt-2">{contact.number}</p>
            <button className="mt-4 w-full bg-danger-600 text-white py-2 rounded-md hover:bg-danger-700">
              Call
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
