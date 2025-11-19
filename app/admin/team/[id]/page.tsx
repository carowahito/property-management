'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface Props {
  params: Promise<{ id: string }>
}

export default function TeamMemberDetailPage({ params }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'permissions' | 'activity' | 'performance'>('overview')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [memberId, setMemberId] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => setMemberId(p.id))
  }, [params])

  if (!memberId) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  }

  // Mock member data
  const member = {
    id: memberId,
    name: 'Bob Smith',
    email: 'bob.smith@company.com',
    phone: '+254 722 333 444',
    role: 'Sales',
    department: 'Sales',
    status: 'Active',
    joinedDate: '2023-03-20',
    lastActive: '2024-11-19T09:15:00',
    assignedProperties: 15,
    permissions: ['leads.view', 'leads.edit', 'properties.view', 'viewings.manage'],
    address: '123 Westlands Road, Nairobi',
    emergencyContact: '+254 711 222 333',
    employeeId: 'EMP-002',
    manager: 'Grace Wilson',
  }

  const activityLog = [
    { id: '1', date: '2024-11-19T09:15:00', type: 'lead', description: 'Updated lead L006 status to Qualified', user: member.name },
    { id: '2', date: '2024-11-19T08:30:00', type: 'viewing', description: 'Scheduled viewing for Sunset Apartments Unit 203', user: member.name },
    { id: '3', date: '2024-11-18T16:45:00', type: 'communication', description: 'Sent follow-up email to 3 prospects', user: member.name },
    { id: '4', date: '2024-11-18T14:20:00', type: 'lead', description: 'Created new lead from website inquiry', user: member.name },
    { id: '5', date: '2024-11-18T11:00:00', type: 'viewing', description: 'Completed property viewing with Sarah Mitchell', user: member.name },
    { id: '6', date: '2024-11-17T15:30:00', type: 'lead', description: 'Updated lead L002 with budget information', user: member.name },
  ]

  const assignedProperties = [
    { id: 'P001', name: 'Sunset Apartments', units: 12, location: 'Westlands' },
    { id: 'P003', name: 'Green Valley Residences', units: 8, location: 'Karen' },
    { id: 'P005', name: 'City Heights', units: 20, location: 'Kilimani' },
  ]

  const performance = {
    leadsGenerated: 24,
    leadsConverted: 8,
    conversionRate: 33.3,
    viewingsScheduled: 15,
    viewingsCompleted: 12,
    responseTime: '2.5 hours',
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lead': return '🎯'
      case 'viewing': return '👁️'
      case 'communication': return '💬'
      case 'property': return '🏠'
      default: return '📌'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800'
      case 'Manager': return 'bg-purple-100 text-purple-800'
      case 'Sales': return 'bg-blue-100 text-blue-800'
      case 'Customer Care': return 'bg-green-100 text-green-800'
      case 'Caretaker': return 'bg-orange-100 text-orange-800'
      case 'Operations': return 'bg-indigo-100 text-indigo-800'
      case 'Finance': return 'bg-emerald-100 text-emerald-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'On Leave': return 'bg-yellow-100 text-yellow-800'
      case 'Inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {member.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{member.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(member.role)}`}>
                  {member.role}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(member.status)}`}>
                  {member.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-gray-600">📧 Email</p>
                  <p className="font-medium text-gray-900">{member.email}</p>
                </div>
                <div>
                  <p className="text-gray-600">📱 Phone</p>
                  <p className="font-medium text-gray-900">{member.phone}</p>
                </div>
                <div>
                  <p className="text-gray-600">🏢 Department</p>
                  <p className="font-medium text-gray-900">{member.department}</p>
                </div>
                <div>
                  <p className="text-gray-600">🆔 Employee ID</p>
                  <p className="font-medium text-gray-900">{member.employeeId}</p>
                </div>
                <div>
                  <p className="text-gray-600">👤 Manager</p>
                  <p className="font-medium text-gray-900">{member.manager}</p>
                </div>
                <div>
                  <p className="text-gray-600">📅 Joined</p>
                  <p className="font-medium text-gray-900">{formatDate(member.joinedDate)}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPermissionsModal(true)}>🔒 Permissions</Button>
            <Button variant="primary" onClick={() => setShowEditModal(true)}>✏️ Edit</Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Assigned Properties</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">{member.assignedProperties}</p>
          <p className="text-xs text-gray-500 mt-1">Active assignments</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Leads Generated</p>
          <p className="text-2xl font-bold text-green-600 mt-2">{performance.leadsGenerated}</p>
          <p className="text-xs text-gray-500 mt-1">This month</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Conversion Rate</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">{performance.conversionRate}%</p>
          <p className="text-xs text-gray-500 mt-1">Lead to tenant</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Last Active</p>
          <p className="text-2xl font-bold text-orange-600 mt-2">2h ago</p>
          <p className="text-xs text-gray-500 mt-1">{formatDateTime(member.lastActive)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-1 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'permissions', label: 'Permissions', icon: '🔒' },
              { id: 'activity', label: 'Activity Log', icon: '📋' },
              { id: 'performance', label: 'Performance', icon: '📈' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Personal Information */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Full Name</span>
                      <span className="text-sm font-medium text-gray-900">{member.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Email</span>
                      <span className="text-sm font-medium text-gray-900">{member.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Phone</span>
                      <span className="text-sm font-medium text-gray-900">{member.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Emergency Contact</span>
                      <span className="text-sm font-medium text-gray-900">{member.emergencyContact}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Address</span>
                      <span className="text-sm font-medium text-gray-900 text-right">{member.address}</span>
                    </div>
                  </div>
                </div>

                {/* Employment Details */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Employment Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Employee ID</span>
                      <span className="text-sm font-medium text-gray-900">{member.employeeId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Role</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                        {member.role}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Department</span>
                      <span className="text-sm font-medium text-gray-900">{member.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Joined Date</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(member.joinedDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Manager</span>
                      <span className="text-sm font-medium text-gray-900">{member.manager}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned Properties */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Assigned Properties ({assignedProperties.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {assignedProperties.map(property => (
                    <div key={property.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{property.name}</h4>
                        <span className="text-xs text-gray-500">{property.id}</span>
                      </div>
                      <p className="text-sm text-gray-600">📍 {property.location}</p>
                      <p className="text-sm text-gray-600">🏠 {property.units} units</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-2">
                  {activityLog.slice(0, 5).map(activity => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-xl">{getActivityIcon(activity.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{formatDateTime(activity.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Access Permissions</h3>
                <Button variant="primary" onClick={() => setShowPermissionsModal(true)}>Edit Permissions</Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {member.permissions.map((permission, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-green-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        ✓ {permission.split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' - ')}
                      </span>
                      <span className="text-xs text-green-600">Granted</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This team member has {member.permissions.length} active permissions. 
                  Changing permissions will take effect immediately and may affect their access to certain features.
                </p>
              </div>
            </div>
          )}

          {/* Activity Log Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 mb-4">Activity Timeline</h3>
              {activityLog.map(activity => (
                <div key={activity.id} className="flex items-start space-x-4 pb-4 border-b border-gray-200 last:border-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">{getActivityIcon(activity.type)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.description}</p>
                    <p className="text-sm text-gray-500">{formatDateTime(activity.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-900">Performance Metrics</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="text-sm text-gray-600 mb-2">Lead Generation</h4>
                  <p className="text-3xl font-bold text-blue-600">{performance.leadsGenerated}</p>
                  <p className="text-sm text-gray-500 mt-1">Leads this month</p>
                  <div className="mt-4 flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">80% of target</span>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="text-sm text-gray-600 mb-2">Conversion Rate</h4>
                  <p className="text-3xl font-bold text-green-600">{performance.conversionRate}%</p>
                  <p className="text-sm text-gray-500 mt-1">{performance.leadsConverted} converted</p>
                  <div className="mt-4 flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '33%' }}></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">Above average</span>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="text-sm text-gray-600 mb-2">Viewings</h4>
                  <p className="text-3xl font-bold text-purple-600">{performance.viewingsCompleted}/{performance.viewingsScheduled}</p>
                  <p className="text-sm text-gray-500 mt-1">Completed this month</p>
                  <div className="mt-4 flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">80% completion</span>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="text-sm text-gray-600 mb-2">Response Time</h4>
                  <p className="text-3xl font-bold text-orange-600">{performance.responseTime}</p>
                  <p className="text-sm text-gray-500 mt-1">Average response</p>
                  <div className="mt-4">
                    <span className="text-sm text-green-600">✓ Excellent performance</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Edit Team Member</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue={member.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue={member.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    defaultValue={member.phone}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    defaultValue={member.role}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Sales">Sales</option>
                    <option value="Customer Care">Customer Care</option>
                    <option value="Caretaker">Caretaker</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    defaultValue={member.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
              <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" className="flex-1">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Manage Permissions</h3>
            
            <div className="space-y-3 mb-6">
              <h4 className="font-semibold text-gray-900">Current Permissions:</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {member.permissions.map((permission, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      ✓ {permission.split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' - ')}
                    </span>
                    <button className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                  </div>
                ))}
              </div>

              <h4 className="font-semibold text-gray-900 pt-4">Add Permissions:</h4>
              <div className="border border-gray-300 rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-700">Properties - Manage</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-700">Tenants - Manage</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-700">Payments - View</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-700">Reports - Financial</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => setShowPermissionsModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" className="flex-1">
                Save Permissions
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
