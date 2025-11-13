'use client'

import { mockNotifications, mockPayments, mockMaintenanceRequests } from '@/lib/mock-data'

export default function NotificationsPage() {
  const unreadCount = mockNotifications.filter(n => !n.read).length
  const recentNotifications = mockNotifications.slice(0, 10)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600">Manage system notifications and reminders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Notifications</div>
          <div className="text-3xl font-bold text-gray-900">{mockNotifications.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Unread</div>
          <div className="text-3xl font-bold text-blue-600">{unreadCount}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">This Week</div>
          <div className="text-3xl font-bold text-gray-900">{recentNotifications.length}</div>
        </div>
      </div>

      {/* Notification Channels */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Channels</h2>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-gray-700">Email Notifications</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-gray-700">SMS Notifications</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-gray-700">Push Notifications</span>
          </label>
        </div>
      </div>

      {/* Notification Types */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Notification Types</h2>
        <div className="space-y-3">
          {[
            { type: 'Payment Reminders', count: mockPayments.filter(p => p.status === 'Pending').length },
            { type: 'Maintenance Updates', count: mockMaintenanceRequests.length },
            { type: 'Lease Renewals', count: mockNotifications.filter(n => n.type === 'lease').length },
            { type: 'Vendor Services', count: mockNotifications.filter(n => n.type === 'vendor').length },
          ].map(item => (
            <div key={item.type} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-700">{item.type}</span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Notifications</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`p-4 flex gap-4 ${notification.read ? 'bg-gray-50' : 'bg-blue-50'}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{notification.title}</span>
                  {!notification.read && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.date).toLocaleDateString()} at {new Date(notification.date).toLocaleTimeString()}
                </p>
              </div>
              <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full capitalize">
                {notification.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Settings</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Send payment reminders 7 days before due</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Send lease renewal reminders 30 days before expiry</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Send maintenance completion notifications</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Send daily digest summaries</span>
            <input type="checkbox" className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition">
        Save Settings
      </button>
    </div>
  )
}
