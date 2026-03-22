'use client'
export default function ServiceRequestsPage() {
  const requests = [
    { id: 'req1', type: 'Key Replacement', date: '2025-11-05', status: 'pending' },
    { id: 'req2', type: 'Parking Pass', date: '2025-10-20', status: 'completed' },
  ]
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">Service Requests</h1>
      <p className="text-neutral-600 mb-8">Submit non-maintenance requests</p>

      <button className="mb-6 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">+ New Request</button>

      <div className="bg-surface shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-neutral-200">
            {requests.map(req => (
              <tr key={req.id}>
                <td className="px-6 py-4 text-sm">{req.type}</td>
                <td className="px-6 py-4 text-sm">{req.date}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${req.status === 'completed' ? 'bg-success-100 text-success-800' : 'bg-yellow-100 text-yellow-800'}`}>{req.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
