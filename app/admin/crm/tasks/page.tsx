'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

interface Task {
  id: string
  title: string
  description: string
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled'
  dueDate: string
  reminderDate?: string
  assignedTo: string
  assignedBy: string
  createdDate: string
  completedDate?: string
  stakeholder: {
    id: string
    name: string
    type: 'Tenant' | 'Landlord' | 'Vendor' | 'Lead' | 'Enquiry'
  }
  notes: string
}

export default function AllTasksPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterAssignee, setFilterAssignee] = useState<string>('all')
  const [filterStakeholderType, setFilterStakeholderType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showCreateTask, setShowCreateTask] = useState(false)
  
  // Create task form state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Urgent',
    dueDate: '',
    reminderDate: '',
    assignedTo: '',
    stakeholderType: 'Tenant' as 'Tenant' | 'Landlord' | 'Vendor' | 'Lead' | 'Enquiry',
    stakeholderId: '',
    notes: '',
  })

  // Mock team members
  const teamMembers = [
    { id: '1', name: 'Alice Johnson', role: 'Property Manager' },
    { id: '2', name: 'Bob Smith', role: 'Maintenance Coordinator' },
    { id: '3', name: 'Carol White', role: 'Finance Manager' },
    { id: '4', name: 'David Brown', role: 'Leasing Agent' },
    { id: '5', name: 'Eva Martinez', role: 'Customer Success' },
  ]

  // Mock all tasks across all stakeholders
  const allTasks: Task[] = [
    {
      id: 'T001',
      title: 'Schedule follow-up call with Sarah Mitchell',
      description: 'Call to discuss property options and schedule viewing',
      priority: 'High',
      status: 'Pending',
      dueDate: '2024-11-18T10:00:00',
      reminderDate: '2024-11-17T09:00:00',
      assignedTo: 'Alice Johnson',
      assignedBy: 'Alice Johnson',
      createdDate: '2024-11-16T14:30:00',
      stakeholder: {
        id: 'L001',
        name: 'Sarah Mitchell',
        type: 'Lead',
      },
      notes: 'Lead is very interested. Has budget ready.',
    },
    {
      id: 'T002',
      title: 'Send lease renewal terms to John Smith',
      description: 'Prepare and send lease renewal offer with updated terms',
      priority: 'Medium',
      status: 'In Progress',
      dueDate: '2024-11-20T15:00:00',
      reminderDate: '2024-11-19T10:00:00',
      assignedTo: 'David Brown',
      assignedBy: 'Alice Johnson',
      createdDate: '2024-11-15T11:00:00',
      stakeholder: {
        id: '1',
        name: 'John Smith',
        type: 'Tenant',
      },
      notes: 'Tenant requested early renewal. Offer 2% increase.',
    },
    {
      id: 'T003',
      title: 'Process monthly payout for Robert Johnson',
      description: 'Calculate and process landlord payout for November',
      priority: 'High',
      status: 'Pending',
      dueDate: '2024-11-25T12:00:00',
      assignedTo: 'Carol White',
      assignedBy: 'Carol White',
      createdDate: '2024-11-14T09:00:00',
      stakeholder: {
        id: '1',
        name: 'Robert Johnson',
        type: 'Landlord',
      },
      notes: 'All rent collected. Ready for payout.',
    },
    {
      id: 'T004',
      title: 'Follow up on HVAC repair quote',
      description: 'Get final quote from Mike HVAC for Unit 405 repair',
      priority: 'Urgent',
      status: 'Pending',
      dueDate: '2024-11-17T14:00:00',
      reminderDate: '2024-11-17T09:00:00',
      assignedTo: 'Bob Smith',
      assignedBy: 'Alice Johnson',
      createdDate: '2024-11-16T08:00:00',
      stakeholder: {
        id: '5',
        name: 'Mike HVAC Repairs',
        type: 'Vendor',
      },
      notes: 'Emergency repair needed. Tenant complaining.',
    },
    {
      id: 'T005',
      title: 'Respond to Grace Wanjiru enquiry',
      description: 'Send detailed response about lease terms',
      priority: 'Medium',
      status: 'Completed',
      dueDate: '2024-11-14T12:00:00',
      assignedTo: 'Carol White',
      assignedBy: 'System',
      createdDate: '2024-11-14T09:30:00',
      completedDate: '2024-11-14T11:45:00',
      stakeholder: {
        id: 'E001',
        name: 'Grace Wanjiru',
        type: 'Enquiry',
      },
      notes: 'Enquiry resolved successfully.',
    },
    {
      id: 'T006',
      title: 'Prepare property report for Sarah Davis',
      description: 'Monthly property performance and occupancy report',
      priority: 'Low',
      status: 'In Progress',
      dueDate: '2024-11-22T17:00:00',
      assignedTo: 'Alice Johnson',
      assignedBy: 'Alice Johnson',
      createdDate: '2024-11-16T10:00:00',
      stakeholder: {
        id: '2',
        name: 'Sarah Davis',
        type: 'Landlord',
      },
      notes: 'Monthly report for 3 properties.',
    },
    {
      id: 'T007',
      title: 'Send payment reminder to Jane Doe',
      description: 'Rent payment overdue by 2 days',
      priority: 'High',
      status: 'Pending',
      dueDate: '2024-11-17T09:00:00',
      reminderDate: '2024-11-17T08:00:00',
      assignedTo: 'Carol White',
      assignedBy: 'System',
      createdDate: '2024-11-16T12:00:00',
      stakeholder: {
        id: '2',
        name: 'Jane Doe',
        type: 'Tenant',
      },
      notes: 'First reminder. Usually pays on time.',
    },
    {
      id: 'T008',
      title: 'Convert James Kamau to tenant',
      description: 'Process lead conversion and prepare lease documents',
      priority: 'Medium',
      status: 'Pending',
      dueDate: '2024-11-19T14:00:00',
      assignedTo: 'David Brown',
      assignedBy: 'Alice Johnson',
      createdDate: '2024-11-15T16:00:00',
      stakeholder: {
        id: 'L002',
        name: 'James Kamau',
        type: 'Lead',
      },
      notes: 'Lead approved. Ready to sign lease.',
    },
    {
      id: 'T009',
      title: 'Schedule property inspection',
      description: 'Quarterly inspection for Sunset Apartments',
      priority: 'Low',
      status: 'Pending',
      dueDate: '2024-11-28T10:00:00',
      reminderDate: '2024-11-27T09:00:00',
      assignedTo: 'Bob Smith',
      assignedBy: 'Alice Johnson',
      createdDate: '2024-11-16T15:00:00',
      stakeholder: {
        id: '1',
        name: 'Robert Johnson',
        type: 'Landlord',
      },
      notes: 'Schedule with all tenants in advance.',
    },
    {
      id: 'T010',
      title: 'Review vendor performance',
      description: 'Quarterly performance review for John Plumbing Services',
      priority: 'Low',
      status: 'Pending',
      dueDate: '2024-11-30T16:00:00',
      assignedTo: 'Bob Smith',
      assignedBy: 'Alice Johnson',
      createdDate: '2024-11-16T11:00:00',
      stakeholder: {
        id: '1',
        name: 'John Plumbing Services',
        type: 'Vendor',
      },
      notes: 'Check ratings and completion rate.',
    },
  ]

  // Filter tasks
  const filteredTasks = allTasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
    const matchesAssignee = filterAssignee === 'all' || task.assignedTo === filterAssignee
    const matchesType = filterStakeholderType === 'all' || task.stakeholder.type === filterStakeholderType
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.stakeholder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesPriority && matchesAssignee && matchesType && matchesSearch
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-800 border-red-300'
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800'
      case 'In Progress': return 'bg-blue-100 text-blue-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStakeholderColor = (type: string) => {
    switch (type) {
      case 'Tenant': return 'bg-green-100 text-green-800'
      case 'Landlord': return 'bg-purple-100 text-purple-800'
      case 'Vendor': return 'bg-orange-100 text-orange-800'
      case 'Lead': return 'bg-indigo-100 text-indigo-800'
      case 'Enquiry': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'Completed' || status === 'Cancelled') return false
    return new Date(dueDate) < new Date()
  }

  // Calculate stats
  const stats = {
    total: allTasks.length,
    pending: allTasks.filter(t => t.status === 'Pending').length,
    inProgress: allTasks.filter(t => t.status === 'In Progress').length,
    completed: allTasks.filter(t => t.status === 'Completed').length,
    overdue: allTasks.filter(t => isOverdue(t.dueDate, t.status)).length,
    urgent: allTasks.filter(t => t.priority === 'Urgent' && t.status !== 'Completed').length,
    dueToday: allTasks.filter(t => {
      const today = new Date().toDateString()
      const taskDate = new Date(t.dueDate).toDateString()
      return today === taskDate && t.status !== 'Completed'
    }).length,
    myTasks: allTasks.filter(t => t.assignedTo === 'Alice Johnson' && t.status !== 'Completed').length,
  }

  const getStakeholderLink = (task: Task) => {
    switch (task.stakeholder.type) {
      case 'Tenant': return `/admin/tenants/${task.stakeholder.id}`
      case 'Landlord': return `/admin/landlords/${task.stakeholder.id}`
      case 'Vendor': return `/admin/vendors/${task.stakeholder.id}`
      case 'Lead': return `/admin/leads/${task.stakeholder.id}`
      case 'Enquiry': return `/admin/enquiries/${task.stakeholder.id}`
      default: return '#'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Tasks</h1>
          <p className="text-gray-600 mt-1">Manage all tasks across stakeholders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="lg">📊 Task Reports</Button>
          <Button variant="primary" size="lg" onClick={() => setShowCreateTask(true)}>+ Create Task</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-xs text-gray-600">Total Tasks</p>
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-xs text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-xs text-gray-600">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-xs text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-xs text-gray-600">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-xs text-gray-600">Urgent</p>
          <p className="text-2xl font-bold text-orange-600">{stats.urgent}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-xs text-gray-600">Due Today</p>
          <p className="text-2xl font-bold text-purple-600">{stats.dueToday}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-xs text-gray-600">My Tasks</p>
          <p className="text-2xl font-bold text-indigo-600">{stats.myTasks}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            value={filterStakeholderType}
            onChange={(e) => setFilterStakeholderType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Stakeholders</option>
            <option value="Tenant">Tenants</option>
            <option value="Landlord">Landlords</option>
            <option value="Vendor">Vendors</option>
            <option value="Lead">Leads</option>
            <option value="Enquiry">Enquiries</option>
          </select>
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Assignees</option>
            {teamMembers.map(member => (
              <option key={member.id} value={member.name}>{member.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Tasks ({filteredTasks.length})
          </h3>
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No tasks found</p>
              </div>
            ) : (
              filteredTasks.map(task => (
                <div
                  key={task.id}
                  className={`border rounded-lg p-4 hover:shadow-md transition cursor-pointer ${
                    isOverdue(task.dueDate, task.status) ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                  }`}
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className="font-semibold text-gray-900">{task.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        {isOverdue(task.dueDate, task.status) && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-600 text-white">
                            ⚠️ Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span>📅 Due: <strong>{formatDate(task.dueDate)}</strong></span>
                        {task.reminderDate && <span>🔔 Reminder: {formatDate(task.reminderDate)}</span>}
                        <span>👤 Assigned to: <strong>{task.assignedTo}</strong></span>
                        <Link 
                          href={getStakeholderLink(task)}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:underline"
                        >
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStakeholderColor(task.stakeholder.type)}`}>
                            {task.stakeholder.type}: {task.stakeholder.name}
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Task Details</h3>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Title and Status */}
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">{selectedTask.title}</h4>
                  <div className="flex gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(selectedTask.priority)}`}>
                      {selectedTask.priority} Priority
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTask.status)}`}>
                      {selectedTask.status}
                    </span>
                    {isOverdue(selectedTask.dueDate, selectedTask.status) && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-600 text-white">
                        ⚠️ Overdue
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-2">Description</h5>
                  <p className="text-gray-700">{selectedTask.description}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-medium mb-1">DUE DATE</p>
                    <p className="text-sm font-semibold text-gray-900">{formatDate(selectedTask.dueDate)}</p>
                  </div>
                  {selectedTask.reminderDate && (
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <p className="text-xs text-yellow-600 font-medium mb-1">REMINDER</p>
                      <p className="text-sm font-semibold text-gray-900">{formatDate(selectedTask.reminderDate)}</p>
                    </div>
                  )}
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-purple-600 font-medium mb-1">ASSIGNED TO</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedTask.assignedTo}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-600 font-medium mb-1">CREATED BY</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedTask.assignedBy}</p>
                  </div>
                </div>

                {/* Notes */}
                {selectedTask.notes && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-2">Notes</h5>
                    <p className="text-gray-700 text-sm">{selectedTask.notes}</p>
                  </div>
                )}

                {/* Stakeholder */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-900">
                    <strong>Related to:</strong>{' '}
                    <Link 
                      href={getStakeholderLink(selectedTask)}
                      className="hover:underline font-medium"
                    >
                      {selectedTask.stakeholder.name}
                    </Link>
                    {' '}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStakeholderColor(selectedTask.stakeholder.type)}`}>
                      {selectedTask.stakeholder.type}
                    </span>
                  </p>
                </div>

                {/* Timestamps */}
                <div className="border-t pt-4 text-xs text-gray-500 space-y-1">
                  <p>Created: {formatDate(selectedTask.createdDate)}</p>
                  {selectedTask.completedDate && (
                    <p>Completed: {formatDate(selectedTask.completedDate)}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setSelectedTask(null)} className="flex-1">
                    Close
                  </Button>
                  {selectedTask.status !== 'Completed' && (
                    <>
                      <Button variant="outline" className="flex-1">
                        Edit Task
                      </Button>
                      <Button variant="primary" className="flex-1">
                        Mark as Completed
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Create New Task</h3>
                <button
                  onClick={() => {
                    setShowCreateTask(false)
                    setNewTask({
                      title: '',
                      description: '',
                      priority: 'Medium',
                      dueDate: '',
                      reminderDate: '',
                      assignedTo: '',
                      stakeholderType: 'Tenant',
                      stakeholderId: '',
                      notes: '',
                    })
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault()
                // Handle task creation here
                console.log('Creating task:', newTask)
                setShowCreateTask(false)
                setNewTask({
                  title: '',
                  description: '',
                  priority: 'Medium',
                  dueDate: '',
                  reminderDate: '',
                  assignedTo: '',
                  stakeholderType: 'Tenant',
                  stakeholderId: '',
                  notes: '',
                })
              }} className="space-y-4">
                {/* Task Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Task Title *</label>
                  <input
                    type="text"
                    required
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter task title..."
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the task..."
                  />
                </div>

                {/* Priority and Assigned To */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
                    <select
                      required
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assign To *</label>
                    <select
                      required
                      value={newTask.assignedTo}
                      onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select team member...</option>
                      {teamMembers.map(member => (
                        <option key={member.id} value={member.name}>{member.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Due Date and Reminder */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                    <input
                      type="datetime-local"
                      required
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Date</label>
                    <input
                      type="datetime-local"
                      value={newTask.reminderDate}
                      onChange={(e) => setNewTask({ ...newTask, reminderDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Stakeholder Type and Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Related To (Type) *</label>
                    <select
                      required
                      value={newTask.stakeholderType}
                      onChange={(e) => setNewTask({ ...newTask, stakeholderType: e.target.value as any, stakeholderId: '' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Tenant">Tenant</option>
                      <option value="Landlord">Landlord</option>
                      <option value="Vendor">Vendor</option>
                      <option value="Lead">Lead</option>
                      <option value="Enquiry">Enquiry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select {newTask.stakeholderType} *</label>
                    <select
                      required
                      value={newTask.stakeholderId}
                      onChange={(e) => setNewTask({ ...newTask, stakeholderId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select {newTask.stakeholderType.toLowerCase()}...</option>
                      {newTask.stakeholderType === 'Tenant' && (
                        <>
                          <option value="1">John Smith</option>
                          <option value="2">Sarah Johnson</option>
                          <option value="3">Jane Doe</option>
                        </>
                      )}
                      {newTask.stakeholderType === 'Landlord' && (
                        <>
                          <option value="1">Robert Johnson</option>
                          <option value="2">Sarah Davis</option>
                        </>
                      )}
                      {newTask.stakeholderType === 'Vendor' && (
                        <>
                          <option value="1">John Plumbing Services</option>
                          <option value="5">Mike HVAC Repairs</option>
                        </>
                      )}
                      {newTask.stakeholderType === 'Lead' && (
                        <>
                          <option value="L001">Sarah Mitchell</option>
                          <option value="L002">James Kamau</option>
                        </>
                      )}
                      {newTask.stakeholderType === 'Enquiry' && (
                        <>
                          <option value="E001">Grace Wanjiru</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    rows={3}
                    value={newTask.notes}
                    onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional notes or context..."
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateTask(false)
                      setNewTask({
                        title: '',
                        description: '',
                        priority: 'Medium',
                        dueDate: '',
                        reminderDate: '',
                        assignedTo: '',
                        stakeholderType: 'Tenant',
                        stakeholderId: '',
                        notes: '',
                      })
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1">
                    Create Task
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
