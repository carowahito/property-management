'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

interface Task {
  id: string
  title: string
  description: string
  priority: string
  status: string
  dueDate: string
  reminderDate?: string
  notes?: string
  createdAt: string
  completedAt?: string
  stakeholderType?: string
  stakeholderId?: string
  assignedTo: { id: string; name: string; email: string }
  assignedBy: { id: string; name: string }
  lead?: { id: string; name: string } | null
  enquiry?: { id: string; name: string } | null
}

export default function AllTasksPage() {
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterAssignee, setFilterAssignee] = useState<string>('all')
  const [filterStakeholderType, setFilterStakeholderType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  useEffect(() => {
    fetch('/api/tasks?limit=200')
      .then(r => r.json())
      .then(data => { setAllTasks(data.tasks || []); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, [])

  // Get unique assignees from tasks
  const assignees = Array.from(new Set(allTasks.map(t => t.assignedTo?.name).filter(Boolean)))

  // Filter tasks
  const filteredTasks = allTasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
    const matchesAssignee = filterAssignee === 'all' || task.assignedTo?.name === filterAssignee
    const matchesType = filterStakeholderType === 'all' || task.stakeholderType === filterStakeholderType
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.lead?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.enquiry?.name || '').toLowerCase().includes(searchTerm.toLowerCase())

    return matchesStatus && matchesPriority && matchesAssignee && matchesType && matchesSearch
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-danger-100 text-red-800 border-red-300'
      case 'HIGH': return 'bg-warning-100 text-orange-800 border-orange-300'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'LOW': return 'bg-primary-100 text-primary-800 border-primary-300'
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-success-100 text-green-800'
      case 'IN_PROGRESS': return 'bg-primary-100 text-primary-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED': return 'bg-neutral-100 text-neutral-800'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'COMPLETED' || status === 'CANCELLED') return false
    return new Date(dueDate) < new Date()
  }

  const getStakeholderName = (task: Task) => {
    if (task.lead) return task.lead.name
    if (task.enquiry) return task.enquiry.name
    return null
  }

  const getStakeholderLink = (task: Task) => {
    if (task.lead) return `/admin/leads/${task.lead.id}`
    if (task.enquiry) return `/admin/enquiries/${task.enquiry.id}`
    return '#'
  }

  // Calculate stats
  const stats = {
    total: allTasks.length,
    pending: allTasks.filter(t => t.status === 'PENDING').length,
    inProgress: allTasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed: allTasks.filter(t => t.status === 'COMPLETED').length,
    overdue: allTasks.filter(t => isOverdue(t.dueDate, t.status)).length,
    urgent: allTasks.filter(t => t.priority === 'URGENT' && t.status !== 'COMPLETED').length,
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">All Tasks</h1>
          <p className="text-neutral-600 mt-1">Manage all tasks across stakeholders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" size="lg">+ Create Task</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-xs text-neutral-600">Total Tasks</p>
          <p className="text-2xl font-bold text-primary-600">{stats.total}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-xs text-neutral-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-xs text-neutral-600">In Progress</p>
          <p className="text-2xl font-bold text-primary-600">{stats.inProgress}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-xs text-neutral-600">Completed</p>
          <p className="text-2xl font-bold text-success-600">{stats.completed}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-xs text-neutral-600">Overdue</p>
          <p className="text-2xl font-bold text-danger-600">{stats.overdue}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-xs text-neutral-600">Urgent</p>
          <p className="text-2xl font-bold text-warning-600">{stats.urgent}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <select
            value={filterStakeholderType}
            onChange={(e) => setFilterStakeholderType(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Stakeholders</option>
            <option value="TENANT">Tenants</option>
            <option value="LANDLORD">Landlords</option>
            <option value="VENDOR">Vendors</option>
            <option value="LEAD">Leads</option>
            <option value="ENQUIRY">Enquiries</option>
          </select>
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Assignees</option>
            {assignees.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-surface shadow rounded-lg">
        <div className="p-6">
          <h3 className="font-semibold text-neutral-900 mb-4">
            Tasks ({filteredTasks.length})
          </h3>
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 bg-neutral-50 rounded-lg">
                <p className="text-neutral-500">No tasks found</p>
              </div>
            ) : (
              filteredTasks.map(task => (
                <div
                  key={task.id}
                  className={`border rounded-lg p-4 hover:shadow-md transition cursor-pointer ${
                    isOverdue(task.dueDate, task.status) ? 'border-red-300 bg-danger-50' : 'border-neutral-200 bg-surface'
                  }`}
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className="font-semibold text-neutral-900">{task.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        {isOverdue(task.dueDate, task.status) && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-danger-600 text-white">
                            Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600 mb-3">{task.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-neutral-500">
                        <span>Due: <strong>{formatDate(task.dueDate)}</strong></span>
                        <span>Assigned to: <strong>{task.assignedTo?.name}</strong></span>
                        {getStakeholderName(task) && (
                          <Link
                            href={getStakeholderLink(task)}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:underline"
                          >
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {task.stakeholderType}: {getStakeholderName(task)}
                            </span>
                          </Link>
                        )}
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
          <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-neutral-900">Task Details</h3>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-2xl font-bold text-neutral-900 mb-2">{selectedTask.title}</h4>
                  <div className="flex gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(selectedTask.priority)}`}>
                      {selectedTask.priority} Priority
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTask.status)}`}>
                      {selectedTask.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="bg-neutral-50 rounded-lg p-4">
                  <h5 className="font-semibold text-neutral-900 mb-2">Description</h5>
                  <p className="text-neutral-700">{selectedTask.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary-50 rounded-lg p-3">
                    <p className="text-xs text-primary-600 font-medium mb-1">DUE DATE</p>
                    <p className="text-sm font-semibold text-neutral-900">{formatDate(selectedTask.dueDate)}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-purple-600 font-medium mb-1">ASSIGNED TO</p>
                    <p className="text-sm font-semibold text-neutral-900">{selectedTask.assignedTo?.name}</p>
                  </div>
                </div>

                {selectedTask.notes && (
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h5 className="font-semibold text-neutral-900 mb-2">Notes</h5>
                    <p className="text-neutral-700 text-sm">{selectedTask.notes}</p>
                  </div>
                )}

                <div className="border-t pt-4 text-xs text-neutral-500 space-y-1">
                  <p>Created: {formatDate(selectedTask.createdAt)}</p>
                  {selectedTask.completedAt && <p>Completed: {formatDate(selectedTask.completedAt)}</p>}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setSelectedTask(null)} className="flex-1">Close</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
