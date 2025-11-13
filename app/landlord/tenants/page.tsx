'use client'

export default function LandlordTenants() {
  const tenants = [
    { id: 1, name: 'John Smith', unit: '4B', property: 'Sunset Apartments', rent: 1500, status: 'current', moveIn: '2023-01-15' },
    { id: 2, name: 'Sarah Johnson', unit: '7A', property: 'Green Valley', rent: 1800, status: 'current', moveIn: '2023-03-01' },
    { id: 3, name: 'Mike Davis', unit: '2C', property: 'Riverside', rent: 1600, status: 'current', moveIn: '2023-06-15' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tenants</h1>
        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">+ Add Tenant</button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Move-in Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tenants.map(tenant => (
              <tr key={tenant.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tenant.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{tenant.unit}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{tenant.property}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${tenant.rent}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{tenant.moveIn}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    {tenant.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="text-blue-600 hover:text-blue-800">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
