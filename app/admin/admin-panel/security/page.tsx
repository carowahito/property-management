'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function SecurityPage() {
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const activeSessions = [
    { id: '1', device: 'Chrome on MacOS', location: 'Nairobi, Kenya', ip: '197.232.45.123', lastActive: '2024-11-19T10:30:00', current: true },
    { id: '2', device: 'Safari on iPhone', location: 'Nairobi, Kenya', ip: '197.232.45.124', lastActive: '2024-11-19T09:15:00', current: false },
    { id: '3', device: 'Chrome on Windows', location: 'Mombasa, Kenya', ip: '41.90.123.45', lastActive: '2024-11-18T16:45:00', current: false },
  ]

  const loginHistory = [
    { id: '1', date: '2024-11-19T10:30:00', device: 'Chrome on MacOS', location: 'Nairobi, Kenya', ip: '197.232.45.123', status: 'Success' },
    { id: '2', date: '2024-11-19T09:15:00', device: 'Safari on iPhone', location: 'Nairobi, Kenya', ip: '197.232.45.124', status: 'Success' },
    { id: '3', date: '2024-11-18T16:45:00', device: 'Chrome on Windows', location: 'Mombasa, Kenya', ip: '41.90.123.45', status: 'Success' },
    { id: '4', date: '2024-11-18T14:20:00', device: 'Unknown', location: 'Lagos, Nigeria', ip: '105.112.34.56', status: 'Failed' },
    { id: '5', date: '2024-11-17T08:00:00', device: 'Chrome on MacOS', location: 'Nairobi, Kenya', ip: '197.232.45.123', status: 'Success' },
  ]

  const securityAlerts = [
    { id: '1', type: 'warning', message: 'Failed login attempt from unknown location', date: '2024-11-18T14:20:00', severity: 'medium' },
    { id: '2', type: 'info', message: 'Password changed successfully', date: '2024-11-15T10:00:00', severity: 'low' },
  ]

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
      case 'Success': return 'text-green-600 bg-green-100'
      case 'Failed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-500 bg-red-50'
      case 'medium': return 'border-yellow-500 bg-yellow-50'
      case 'low': return 'border-blue-500 bg-blue-50'
      default: return 'border-gray-500 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Security & Access</h1>
        <p className="text-gray-600 mt-1">Manage security settings, sessions, and access control</p>
      </div>

      {/* Security Alerts */}
      {securityAlerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Security Alerts</h2>
          {securityAlerts.map(alert => (
            <div key={alert.id} className={`border-l-4 rounded-lg p-4 ${getSeverityColor(alert.severity)}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{alert.message}</p>
                  <p className="text-sm text-gray-600 mt-1">{formatDateTime(alert.date)}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Security Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
        
        <div className="space-y-4">
          {/* Password */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Password</h3>
              <p className="text-sm text-gray-600">Last changed 30 days ago</p>
            </div>
            <Button variant="outline" onClick={() => setShowChangePasswordModal(true)}>
              Change Password
            </Button>
          </div>

          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600">
                {twoFactorEnabled ? 'Enabled - Your account is protected' : 'Add an extra layer of security'}
              </p>
            </div>
            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                twoFactorEnabled ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Session Timeout */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Session Timeout</h3>
              <p className="text-sm text-gray-600">Automatically log out after inactivity</p>
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="480">8 hours</option>
              <option value="0">Never</option>
            </select>
          </div>

          {/* IP Whitelist */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">IP Whitelist</h3>
              <p className="text-sm text-gray-600">Restrict access to specific IP addresses</p>
            </div>
            <Button variant="outline">Configure</Button>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Active Sessions</h2>
            <p className="text-sm text-gray-600">Manage your active sessions across devices</p>
          </div>
          <Button variant="outline">Revoke All</Button>
        </div>
        <div className="divide-y divide-gray-200">
          {activeSessions.map(session => (
            <div key={session.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{session.device}</h3>
                      {session.current && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">📍 {session.location}</p>
                    <p className="text-sm text-gray-600">🌐 {session.ip}</p>
                    <p className="text-sm text-gray-500 mt-1">Last active: {formatDateTime(session.lastActive)}</p>
                  </div>
                </div>
                {!session.current && (
                  <Button variant="outline" className="text-red-600 hover:bg-red-50">
                    Revoke
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Login History */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Login History</h2>
          <p className="text-sm text-gray-600">Recent login attempts to your account</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loginHistory.map(login => (
                <tr key={login.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDateTime(login.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {login.device}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {login.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                    {login.ip}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(login.status)}`}>
                      {login.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Change Password</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
              <Button variant="outline" onClick={() => setShowChangePasswordModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" className="flex-1">
                Update Password
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
