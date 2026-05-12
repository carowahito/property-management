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

  const utilities = [
    { id: 1, name: 'Electricity', usage: '245 kWh', dueDate: '2025-11-20', amount: 2450, status: 'pending' },
    { id: 2, name: 'Water', usage: '35 m³', dueDate: '2025-11-20', amount: 850, status: 'paid' },
    { id: 3, name: 'Internet', usage: 'Unlimited', dueDate: '2025-11-15', amount: 1500, status: 'paid' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Utilities</h1>
        <p className="mt-2 text-neutral-600">
          Manage and pay your utility bills in one place
        </p>
      </div>
      <div className="bg-surface shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Utility</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Usage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-neutral-200">
            {utilities.map((utility) => (
              <tr key={utility.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{utility.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{utility.usage}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">KES {utility.amount.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{utility.dueDate}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${utility.status === 'paid' ? 'bg-success-100 text-success-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {utility.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {utility.status === 'pending' && <button className="text-primary-600 hover:text-primary-800">Pay Now</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
