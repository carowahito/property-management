'use client'

export default function DocumentsPage() {
  // Mock data
  const documents = [
    {
      id: 1,
      name: 'Lease Agreement 2024',
      type: 'Lease',
      size: '2.4 MB',
      uploadDate: '2024-01-01',
      expiryDate: '2024-12-31',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Move-In Inspection Report',
      type: 'Inspection',
      size: '1.8 MB',
      uploadDate: '2024-01-01',
      expiryDate: null,
      status: 'Archived',
    },
    {
      id: 3,
      name: 'Property Rules & Regulations',
      type: 'Policy',
      size: '856 KB',
      uploadDate: '2024-01-01',
      expiryDate: null,
      status: 'Active',
    },
    {
      id: 4,
      name: 'Rent Receipt - October 2025',
      type: 'Receipt',
      size: '124 KB',
      uploadDate: '2025-10-05',
      expiryDate: null,
      status: 'Active',
    },
    {
      id: 5,
      name: 'Rent Receipt - September 2025',
      type: 'Receipt',
      size: '124 KB',
      uploadDate: '2025-09-05',
      expiryDate: null,
      status: 'Active',
    },
    {
      id: 6,
      name: 'Maintenance Work Order - Plumbing',
      type: 'Maintenance',
      size: '456 KB',
      uploadDate: '2025-10-20',
      expiryDate: null,
      status: 'Active',
    },
  ]

  const documentTypes = ['All', 'Lease', 'Receipt', 'Inspection', 'Policy', 'Maintenance']

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'Lease':
        return '📄'
      case 'Receipt':
        return '🧾'
      case 'Inspection':
        return '📋'
      case 'Policy':
        return '📜'
      case 'Maintenance':
        return '🔧'
      default:
        return '📁'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          Upload Document
        </button>
      </div>

      {/* Document Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <p className="text-sm font-medium text-gray-500">Total Documents</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{documents.length}</p>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <p className="text-sm font-medium text-gray-500">Active Documents</p>
            <p className="mt-1 text-2xl font-semibold text-green-600">
              {documents.filter((d) => d.status === 'Active').length}
            </p>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <p className="text-sm font-medium text-gray-500">Total Size</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">6.2 MB</p>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        {documentTypes.map((type) => (
          <button
            key={type}
            className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            {type}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Upload Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getDocumentIcon(doc.type)}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                        {doc.expiryDate && (
                          <div className="text-xs text-gray-500">Expires: {doc.expiryDate}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doc.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doc.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doc.uploadDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        doc.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <button className="text-blue-600 hover:text-blue-900">View</button>
                    <button className="text-blue-600 hover:text-blue-900">Download</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Important Documents Notice */}
      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Important:</strong> Please keep copies of all lease-related documents in a
              safe place. Your lease agreement and move-in inspection report are particularly
              important for your records.
            </p>
          </div>
        </div>
      </div>

      {/* Lease Renewal Notice */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="text-4xl mr-4">📋</div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Lease Renewal Coming Soon
            </h3>
            <p className="text-sm text-blue-800 mb-3">
              Your current lease expires on <strong>December 31, 2025</strong> (60 days from now).
              Please review your lease renewal offer in your messages.
            </p>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              View Renewal Offer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
