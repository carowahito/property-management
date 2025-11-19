'use client'

import { Button } from '@/components/ui/button'

export default function BackupsPage() {
  const backups = [
    { id: '1', date: '2024-11-19T02:00:00', type: 'Automatic', size: '2.4 GB', status: 'Completed', duration: '12 minutes' },
    { id: '2', date: '2024-11-18T02:00:00', type: 'Automatic', size: '2.3 GB', status: 'Completed', duration: '11 minutes' },
    { id: '3', date: '2024-11-17T14:30:00', type: 'Manual', size: '2.3 GB', status: 'Completed', duration: '10 minutes' },
    { id: '4', date: '2024-11-17T02:00:00', type: 'Automatic', size: '2.3 GB', status: 'Completed', duration: '11 minutes' },
    { id: '5', date: '2024-11-16T02:00:00', type: 'Automatic', size: '2.2 GB', status: 'Completed', duration: '10 minutes' },
  ]

  const backupSettings = {
    frequency: 'Daily',
    time: '02:00 AM',
    retention: 30,
    location: 'Cloud Storage (AWS S3)',
    encryption: true,
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800'
      case 'In Progress': return 'bg-blue-100 text-blue-800'
      case 'Failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Backups & Recovery</h1>
        <p className="text-gray-600 mt-1">Manage data backups and disaster recovery</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Last Backup</p>
              <p className="text-2xl font-bold text-gray-900">2 hours ago</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Backups</p>
              <p className="text-2xl font-bold text-gray-900">{backups.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Storage Used</p>
              <p className="text-2xl font-bold text-gray-900">2.4 GB</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Next Backup</p>
              <p className="text-2xl font-bold text-gray-900">22 hours</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-xl">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Backup Settings</h2>
          <Button variant="outline">Edit Settings</Button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Backup Frequency</p>
            <p className="text-lg font-semibold text-gray-900">{backupSettings.frequency}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Backup Time</p>
            <p className="text-lg font-semibold text-gray-900">{backupSettings.time}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Retention Period</p>
            <p className="text-lg font-semibold text-gray-900">{backupSettings.retention} days</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Storage Location</p>
            <p className="text-lg font-semibold text-gray-900">{backupSettings.location}</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-green-900">Encryption Enabled</p>
            <p className="text-xs text-green-700">All backups are encrypted with AES-256</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="primary">
          💾 Create Backup Now
        </Button>
        <Button variant="outline">
          🔄 Restore from Backup
        </Button>
        <Button variant="outline">
          ⚙️ Configure Schedule
        </Button>
      </div>

      {/* Backup History */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Backup History</h2>
          <p className="text-sm text-gray-600">View and manage your backup history</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
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
              {backups.map(backup => (
                <tr key={backup.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDateTime(backup.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {backup.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {backup.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {backup.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(backup.status)}`}>
                      {backup.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        Restore
                      </button>
                      <button className="text-green-600 hover:text-green-800 font-medium">
                        Download
                      </button>
                      <button className="text-red-600 hover:text-red-800 font-medium">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disaster Recovery Plan */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Disaster Recovery Plan</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-bold text-blue-600">1</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Automated Daily Backups</h3>
              <p className="text-sm text-gray-600">System automatically creates backups every day at 2:00 AM</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-bold text-blue-600">2</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">30-Day Retention</h3>
              <p className="text-sm text-gray-600">Backups are retained for 30 days before automatic deletion</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-bold text-blue-600">3</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Quick Recovery</h3>
              <p className="text-sm text-gray-600">Restore from any backup point with one click</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-bold text-blue-600">4</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Encrypted Storage</h3>
              <p className="text-sm text-gray-600">All backups are encrypted with industry-standard AES-256</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
