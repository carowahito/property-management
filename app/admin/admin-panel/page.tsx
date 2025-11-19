'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminPanelPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<'overview' | 'team' | 'settings'>('overview')

  // In production, check user role from auth context
  const currentUser = {
    name: 'Alice Johnson',
    email: 'alice.johnson@company.com',
    role: 'Admin',
  }

  // Redirect non-admins
  if (currentUser.role !== 'Admin') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          <button
            onClick={() => router.push('/admin')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const adminModules = [
    {
      id: 'team',
      title: 'Team Management',
      description: 'Manage team members, roles, and permissions',
      icon: '👨‍💼',
      href: '/admin/team',
      stats: { total: 10, active: 8, onLeave: 1 },
      color: 'blue',
    },
    {
      id: 'settings',
      title: 'System Settings',
      description: 'Configure API keys, integrations, and system preferences',
      icon: '⚙️',
      href: '/admin/settings',
      stats: { integrations: 5, configured: 3 },
      color: 'purple',
    },
    {
      id: 'security',
      title: 'Security & Access',
      description: 'Manage security settings, audit logs, and access control',
      icon: '🔒',
      href: '/admin/admin-panel/security',
      stats: { sessions: 15, alerts: 0 },
      color: 'red',
    },
    {
      id: 'billing',
      title: 'Billing & Subscription',
      description: 'Manage subscription, billing, and payment methods',
      icon: '💳',
      href: '/admin/admin-panel/billing',
      stats: { plan: 'Professional', users: 10 },
      color: 'green',
    },
    {
      id: 'audit',
      title: 'Audit Logs',
      description: 'View system activity and audit trails',
      icon: '📋',
      href: '/admin/admin-panel/audit',
      stats: { today: 247, week: 1893 },
      color: 'orange',
    },
    {
      id: 'backups',
      title: 'Backups & Recovery',
      description: 'Manage data backups and disaster recovery',
      icon: '💾',
      href: '/admin/admin-panel/backups',
      stats: { lastBackup: '2 hours ago', size: '2.4 GB' },
      color: 'indigo',
    },
  ]

  const recentActivity = [
    { id: '1', date: '2024-11-19T10:30:00', user: 'Bob Smith', action: 'Updated lead L006 status', type: 'lead' },
    { id: '2', date: '2024-11-19T09:45:00', user: 'Carol White', action: 'Resolved enquiry E003', type: 'enquiry' },
    { id: '3', date: '2024-11-19T09:15:00', user: 'Admin', action: 'Added new team member: Isabel Martinez', type: 'team' },
    { id: '4', date: '2024-11-19T08:50:00', user: 'Emma Davis', action: 'Updated property P005 details', type: 'property' },
    { id: '5', date: '2024-11-18T16:30:00', user: 'Admin', action: 'Modified system settings: WhatsApp API', type: 'settings' },
  ]

  const systemStats = {
    totalUsers: 10,
    activeUsers: 8,
    storageUsed: '2.4 GB',
    storageLimit: '10 GB',
    apiCalls: 12543,
    uptime: '99.9%',
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      case 'purple': return 'bg-purple-100 text-purple-800 hover:bg-purple-200'
      case 'red': return 'bg-red-100 text-red-800 hover:bg-red-200'
      case 'green': return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'orange': return 'bg-orange-100 text-orange-800 hover:bg-orange-200'
      case 'indigo': return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleString('en-GB', { month: 'short' })
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day} ${month} at ${hours}:${minutes}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">🔐</span>
              <h1 className="text-3xl font-bold">Admin Control Panel</h1>
            </div>
            <p className="text-red-100">System administration and configuration</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-red-100">Logged in as</p>
            <p className="font-semibold">{currentUser.name}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-red-500 rounded-full text-xs font-medium">
              Administrator
            </span>
          </div>
        </div>
      </div>

      {/* System Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Team Members</p>
              <p className="text-3xl font-bold text-gray-900">{systemStats.totalUsers}</p>
              <p className="text-xs text-green-600 mt-1">{systemStats.activeUsers} active</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-xl">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Storage Used</p>
              <p className="text-3xl font-bold text-gray-900">{systemStats.storageUsed}</p>
              <p className="text-xs text-gray-600 mt-1">of {systemStats.storageLimit}</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-xl">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">API Calls</p>
              <p className="text-3xl font-bold text-gray-900">{systemStats.apiCalls.toLocaleString()}</p>
              <p className="text-xs text-gray-600 mt-1">This month</p>
            </div>
            <div className="bg-green-100 p-4 rounded-xl">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">System Uptime</p>
              <p className="text-3xl font-bold text-gray-900">{systemStats.uptime}</p>
              <p className="text-xs text-green-600 mt-1">Operational</p>
            </div>
            <div className="bg-emerald-100 p-4 rounded-xl">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Modules Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Administration Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((module) => (
            <Link
              key={module.id}
              href={module.href}
              className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-gray-300 hover:shadow-lg transition group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`text-4xl p-3 rounded-xl ${getColorClasses(module.color)}`}>
                  {module.icon}
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{module.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{module.description}</p>
              <div className="flex gap-4 text-xs text-gray-500">
                {Object.entries(module.stats).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium">{key}:</span> {value}
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Admin Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent System Activity</h2>
          <Link href="/admin/admin-panel/audit" className="text-sm text-blue-600 hover:text-blue-800">
            View All →
          </Link>
        </div>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">by {activity.user}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">{formatDateTime(activity.date)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center group">
          <span className="text-3xl mb-2 block">➕</span>
          <p className="font-medium text-gray-900 group-hover:text-blue-600">Add Team Member</p>
        </button>
        
        <button className="p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-center group">
          <span className="text-3xl mb-2 block">⚙️</span>
          <p className="font-medium text-gray-900 group-hover:text-purple-600">Configure Integration</p>
        </button>
        
        <button className="p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-center group">
          <span className="text-3xl mb-2 block">💾</span>
          <p className="font-medium text-gray-900 group-hover:text-green-600">Backup System</p>
        </button>
      </div>
    </div>
  )
}
