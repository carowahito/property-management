'use client'

import { useState } from 'react'

export default function AuditLogsPage() {
  const [filterType, setFilterType] = useState('all')
  const [filterUser, setFilterUser] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const auditLogs = [
    { id: '1', date: '2024-11-19T10:30:00', user: 'Bob Smith', action: 'Updated lead status', module: 'Leads', details: 'Changed L006 status from Prospect to Qualified', ip: '197.232.45.123' },
    { id: '2', date: '2024-11-19T09:45:00', user: 'Carol White', action: 'Resolved enquiry', module: 'Enquiries', details: 'Marked E003 as resolved', ip: '197.232.45.124' },
    { id: '3', date: '2024-11-19T09:15:00', user: 'Alice Johnson', action: 'Added team member', module: 'Team', details: 'Created new user: Isabel Martinez (Caretaker)', ip: '197.232.45.123' },
    { id: '4', date: '2024-11-19T08:50:00', user: 'Emma Davis', action: 'Updated property', module: 'Properties', details: 'Modified P005 details and pricing', ip: '197.232.45.125' },
    { id: '5', date: '2024-11-18T16:30:00', user: 'Alice Johnson', action: 'Modified settings', module: 'Settings', details: 'Updated WhatsApp API configuration', ip: '197.232.45.123' },
    { id: '6', date: '2024-11-18T15:20:00', user: 'Frank Miller', action: 'Generated report', module: 'Reports', details: 'Created financial report for October 2024', ip: '197.232.45.126' },
    { id: '7', date: '2024-11-18T14:45:00', user: 'Bob Smith', action: 'Created lead', module: 'Leads', details: 'Added new lead from website inquiry', ip: '197.232.45.123' },
    { id: '8', date: '2024-11-18T14:00:00', user: 'Carol White', action: 'Sent communication', module: 'Communications', details: 'Email sent to 5 tenants regarding maintenance', ip: '197.232.45.124' },
    { id: '9', date: '2024-11-18T13:30:00', user: 'David Brown', action: 'Updated work order', module: 'Work Orders', details: 'Changed WO-123 status to Completed', ip: '197.232.45.127' },
    { id: '10', date: '2024-11-18T12:15:00', user: 'Grace Wilson', action: 'Approved payment', module: 'Payments', details: 'Approved payout PAY-456 for KES 50,000', ip: '197.232.45.128' },
  ]

  const stats = {
    today: 247,
    week: 1893,
    month: 8456,
    users: 10,
  }

  const filteredLogs = auditLogs.filter(log => {
    const matchesType = filterType === 'all' || log.module === filterType
    const matchesUser = filterUser === 'all' || log.user === filterUser
    const matchesSearch = searchQuery === '' || 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesType && matchesUser && matchesSearch
  })

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getModuleColor = (module: string) => {
    const colors: Record<string, string> = {
      'Leads': 'bg-blue-100 text-blue-800',
      'Enquiries': 'bg-purple-100 text-purple-800',
      'Team': 'bg-green-100 text-green-800',
      'Properties': 'bg-orange-100 text-orange-800',
      'Settings': 'bg-red-100 text-red-800',
      'Reports': 'bg-indigo-100 text-indigo-800',
      'Communications': 'bg-cyan-100 text-cyan-800',
      'Work Orders': 'bg-yellow-100 text-yellow-800',
      'Payments': 'bg-emerald-100 text-emerald-800',
    }
    return colors[module] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-600 mt-1">Track all system activity and user actions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Today</p>
          <p className="text-3xl font-bold text-gray-900">{stats.today}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">This Week</p>
          <p className="text-3xl font-bold text-gray-900">{stats.week.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">This Month</p>
          <p className="text-3xl font-bold text-gray-900">{stats.month.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Active Users</p>
          <p className="text-3xl font-bold text-gray-900">{stats.users}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search actions or details..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Module</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Modules</option>
              <option value="Leads">Leads</option>
              <option value="Enquiries">Enquiries</option>
              <option value="Team">Team</option>
              <option value="Properties">Properties</option>
              <option value="Settings">Settings</option>
              <option value="Reports">Reports</option>
              <option value="Communications">Communications</option>
              <option value="Work Orders">Work Orders</option>
              <option value="Payments">Payments</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Users</option>
              <option value="Alice Johnson">Alice Johnson</option>
              <option value="Bob Smith">Bob Smith</option>
              <option value="Carol White">Carol White</option>
              <option value="David Brown">David Brown</option>
              <option value="Emma Davis">Emma Davis</option>
              <option value="Frank Miller">Frank Miller</option>
              <option value="Grace Wilson">Grace Wilson</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Module
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDateTime(log.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 mr-3">
                        {log.user.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getModuleColor(log.module)}`}>
                      {log.module}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-md">
                    {log.details}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                    {log.ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No audit logs found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Export Options */}
      <div className="flex gap-3">
        <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
          📥 Export to CSV
        </button>
        <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
          📄 Export to PDF
        </button>
        <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
          📊 Generate Report
        </button>
      </div>
    </div>
  )
}
