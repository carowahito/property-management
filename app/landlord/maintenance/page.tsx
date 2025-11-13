'use client'

export default function LandlordMaintenance() {
  const requests = [
    { id: 1, unit: '4B', issue: 'Leaking faucet', priority: 'high', status: 'in-progress', tenant: 'John Smith', date: '2025-11-05' },
    { id: 2, unit: '7A', issue: 'AC not cooling', priority: 'urgent', status: 'assigned', tenant: 'Sarah Johnson', date: '2025-11-04' },
    { id: 3, unit: '2C', issue: 'Door lock stuck', priority: 'medium', status: 'pending', tenant: 'Mike Davis', date: '2025-11-03' },
  ]

  const getPriorityColor = (priority: string) => {
    return priority === 'urgent' ? 'bg-red-100 text-red-800' :
           priority === 'high' ? 'bg-orange-100 text-orange-800' :
           'bg-yellow-100 text-yellow-800'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Maintenance Requests</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <span className="text-3xl mb-2 block">📋</span>
          <p className="text-sm text-gray-600">Total Requests</p>
          <p className="text-3xl font-bold text-gray-900">23</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <span className="text-3xl mb-2 block">⏳</span>
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">8</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <span className="text-3xl mb-2 block">🔧</span>
          <p className="text-sm text-gray-600">In Progress</p>
          <p className="text-3xl font-bold text-blue-600">12</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <span className="text-3xl mb-2 block">✅</span>
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-3xl font-bold text-green-600">3</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map(req => (
              <tr key={req.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.unit}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{req.issue}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{req.tenant}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(req.priority)}`}>
                    {req.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{req.date}</td>
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
