'use client'

import { useState } from 'react'

interface LoginHistory {
  id: string
  timestamp: string
  device: string
  browser: string
  location: string
  ipAddress: string
  status: 'success' | 'failed'
}

interface SecurityAlert {
  id: string
  type: 'login' | 'password_change' | 'device_added' | 'suspicious_activity'
  message: string
  timestamp: string
  severity: 'low' | 'medium' | 'high'
}

export default function SecuritySettingsPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [loginNotifications, setLoginNotifications] = useState(true)
  const [securityAlerts, setSecurityAlerts] = useState(true)

  const loginHistory: LoginHistory[] = [
    {
      id: 'log1',
      timestamp: '2025-11-07 14:30:00',
      device: 'iPhone 13',
      browser: 'Safari',
      location: 'Nairobi, Kenya',
      ipAddress: '197.248.xxx.xxx',
      status: 'success',
    },
    {
      id: 'log2',
      timestamp: '2025-11-06 09:15:00',
      device: 'MacBook Pro',
      browser: 'Chrome',
      location: 'Nairobi, Kenya',
      ipAddress: '197.248.xxx.xxx',
      status: 'success',
    },
    {
      id: 'log3',
      timestamp: '2025-11-05 18:45:00',
      device: 'Windows PC',
      browser: 'Firefox',
      location: 'Unknown',
      ipAddress: '41.89.xxx.xxx',
      status: 'failed',
    },
  ]

  const alerts: SecurityAlert[] = [
    {
      id: 'alert1',
      type: 'login',
      message: 'Successful login from new device (iPhone 13)',
      timestamp: '2025-11-07 14:30:00',
      severity: 'low',
    },
    {
      id: 'alert2',
      type: 'suspicious_activity',
      message: 'Failed login attempt from unknown location',
      timestamp: '2025-11-05 18:45:00',
      severity: 'high',
    },
  ]

  const handleEnable2FA = () => {
    setShowQRCode(true)
  }

  const handleVerify2FA = () => {
    if (verificationCode.length === 6) {
      alert('Two-factor authentication enabled successfully!')
      setTwoFactorEnabled(true)
      setShowQRCode(false)
      setVerificationCode('')
    }
  }

  const handleDisable2FA = () => {
    if (confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      setTwoFactorEnabled(false)
      alert('Two-factor authentication disabled')
    }
  }

  const handleChangePassword = () => {
    alert('Password change form would open here')
  }

  const handleExportData = () => {
    alert('Your data export has been initiated. You will receive a download link via email within 24 hours.')
  }

  const getAlertIcon = (type: string) => {
    const icons: Record<string, string> = {
      login: '🔐',
      password_change: '🔑',
      device_added: '📱',
      suspicious_activity: '⚠️',
    }
    return icons[type] || '📋'
  }

  const getSeverityBadge = (severity: string) => {
    const badges: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    }
    return badges[severity] || badges.low
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account security and privacy settings
        </p>
      </div>

      {/* Security Overview */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 border-2 rounded-lg ${twoFactorEnabled ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{twoFactorEnabled ? '✅' : '⚠️'}</span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <p className="font-medium text-gray-900">Two-Factor Authentication</p>
            <p className="text-sm text-gray-600 mt-1">
              {twoFactorEnabled ? 'Your account is protected' : 'Enable for better security'}
            </p>
          </div>

          <div className="p-4 border-2 border-green-500 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">✅</span>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800">
                Active
              </span>
            </div>
            <p className="font-medium text-gray-900">Strong Password</p>
            <p className="text-sm text-gray-600 mt-1">
              Last changed 45 days ago
            </p>
          </div>

          <div className={`p-4 border-2 rounded-lg ${loginNotifications ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{loginNotifications ? '✅' : '🔕'}</span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${loginNotifications ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {loginNotifications ? 'On' : 'Off'}
              </span>
            </div>
            <p className="font-medium text-gray-900">Login Alerts</p>
            <p className="text-sm text-gray-600 mt-1">
              Get notified of new logins
            </p>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Two-Factor Authentication (2FA)</h2>
            <p className="text-sm text-gray-600 mt-1">
              Add an extra layer of security to your account
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={twoFactorEnabled}
              onChange={(e) => {
                if (e.target.checked) {
                  handleEnable2FA()
                } else {
                  handleDisable2FA()
                }
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {twoFactorEnabled ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              ✓ Two-factor authentication is active. You'll need to enter a verification code from your authenticator app when logging in.
            </p>
            <div className="mt-3 flex space-x-3">
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View Backup Codes
              </button>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Regenerate Codes
              </button>
            </div>
          </div>
        ) : showQRCode ? (
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-4">Set Up Two-Factor Authentication</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-700 mb-3">
                  1. Install an authenticator app on your phone (Google Authenticator, Authy, or Microsoft Authenticator)
                </p>
                <p className="text-sm text-gray-700 mb-3">
                  2. Scan this QR code with your authenticator app:
                </p>
                <div className="flex justify-center my-4">
                  <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">QR Code Here</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 text-center mb-4">
                  Or enter this code manually: <code className="bg-gray-100 px-2 py-1 rounded">ABCD EFGH IJKL MNOP</code>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-700 mb-2">
                  3. Enter the 6-digit verification code from your app:
                </p>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowQRCode(false)
                    setVerificationCode('')
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerify2FA}
                  disabled={verificationCode.length !== 6}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Verify & Enable
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ Two-factor authentication is not enabled. Your account is vulnerable to unauthorized access.
            </p>
          </div>
        )}
      </div>

      {/* Password Management */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Password</h2>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-2">Last changed: November 1, 2025</p>
            <p className="text-sm text-gray-600">
              We recommend changing your password every 90 days
            </p>
          </div>
          <button
            onClick={handleChangePassword}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Change Password
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Login Notifications</p>
              <p className="text-sm text-gray-600">Get notified when someone logs into your account</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={loginNotifications}
                onChange={(e) => setLoginNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Security Alerts</p>
              <p className="text-sm text-gray-600">Receive alerts about suspicious activity</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securityAlerts}
                onChange={(e) => setSecurityAlerts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Login History */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Login Activity</h2>
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
              {loginHistory.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{log.device}</div>
                    <div className="text-xs text-gray-500">{log.browser}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {log.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {log.ipAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {log.status === 'success' ? 'Success' : 'Failed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Alerts */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Alerts</h2>
        {alerts.length === 0 ? (
          <p className="text-sm text-gray-600">No security alerts</p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg border ${
                alert.severity === 'high' ? 'bg-red-50 border-red-200' :
                alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{getAlertIcon(alert.type)}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityBadge(alert.severity)}`}>
                    {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Privacy & Data */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy & Data</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Download Your Data</p>
              <p className="text-sm text-gray-600">Get a copy of all your account data (GDPR compliant)</p>
            </div>
            <button
              onClick={handleExportData}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Export Data
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Active Sessions</p>
              <p className="text-sm text-gray-600">You're currently logged in on 3 devices</p>
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Manage Sessions
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">Delete Account</p>
              <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
