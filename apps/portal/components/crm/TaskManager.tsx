'use client'

import { useState } from 'react'
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
    type: 'Tenant' | 'Landlord' | 'Vendor'
  }
  notes: string
}

interface TaskManagerProps {
  stakeholderId: string
  stakeholderName: string
  stakeholderType: 'Tenant' | 'Landlord' | 'Vendor'
  tasks?: Task[]
}

export default function TaskManager({ stakeholderId, stakeholderName, stakeholderType, tasks = [] }: TaskManagerProps) {
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  
  // Form state
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskPriority, setTaskPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium')
  const [taskDueDate, setTaskDueDate] = useState('')
  const [taskReminderDate, setTaskReminderDate] = useState('')
  const [taskAssignedTo, setTaskAssignedTo] = useState('')
  const [taskNotes, setTaskNotes] = useState('')

  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'all') return true
    return task.status === filterStatus
  })

  const handleAddTask = () => {
    // In production, this would make an API call to save the task
    console.log('Adding task:', {
      title: taskTitle,
      description: taskDescription,
      priority: taskPriority,
      dueDate: taskDueDate,
      reminderDate: taskReminderDate,
      assignedTo: taskAssignedTo,
      notes: taskNotes,
      stakeholderId,
      stakeholderName,
      stakeholderType,
    })
    
    // Reset form
    setTaskTitle('')
    setTaskDescription('')
    setTaskPriority('Medium')
    setTaskDueDate('')
    setTaskReminderDate('')
    setTaskAssignedTo('')
    setTaskNotes('')
    setShowAddTaskModal(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-danger-100 text-danger-800 border-danger-300'
      case 'High': return 'bg-warning-100 text-warning-800 border-warning-300'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'Low': return 'bg-primary-100 text-primary-800 border-primary-300'
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-success-100 text-success-800'
      case 'In Progress': return 'bg-primary-100 text-primary-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Cancelled': return 'bg-neutral-100 text-neutral-800'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'Completed' || status === 'Cancelled') return false
    return new Date(dueDate) < new Date()
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-neutral-900 text-lg">Tasks & Reminders</h3>
          <p className="text-sm text-neutral-600">Manage tasks and follow-ups for {stakeholderName}</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddTaskModal(true)}>
          + Add Task
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filterStatus === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          All ({tasks.length})
        </button>
        <button
          onClick={() => setFilterStatus('Pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filterStatus === 'Pending'
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          Pending ({tasks.filter(t => t.status === 'Pending').length})
        </button>
        <button
          onClick={() => setFilterStatus('In Progress')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filterStatus === 'In Progress'
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          In Progress ({tasks.filter(t => t.status === 'In Progress').length})
        </button>
        <button
          onClick={() => setFilterStatus('Completed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filterStatus === 'Completed'
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          Completed ({tasks.filter(t => t.status === 'Completed').length})
        </button>
      </div>

      {/* Tasks List */}
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
                isOverdue(task.dueDate, task.status) ? 'border-danger-300 bg-danger-50' : 'border-neutral-200 bg-surface'
              }`}
              onClick={() => setSelectedTask(task)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-neutral-900">{task.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    {isOverdue(task.dueDate, task.status) && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-danger-600 text-white">
                        ⚠️ Overdue
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-600 mb-2">{task.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-neutral-500">
                    <span>📅 Due: {formatDate(task.dueDate)}</span>
                    {task.reminderDate && <span>🔔 Reminder: {formatDate(task.reminderDate)}</span>}
                    <span>👤 Assigned to: {task.assignedTo}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-neutral-900">Add New Task</h3>
                <button
                  onClick={() => setShowAddTaskModal(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Stakeholder Info */}
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                  <p className="text-sm text-primary-900">
                    <strong>Stakeholder:</strong> {stakeholderName} ({stakeholderType})
                  </p>
                </div>

                {/* Task Title */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Task Title <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g., Schedule follow-up call"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Task Description */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Description <span className="text-danger-500">*</span>
                  </label>
                  <textarea
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Describe the task..."
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Task Priority <span className="text-danger-500">*</span>
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="Low">Low - Can wait</option>
                    <option value="Medium">Medium - Normal priority</option>
                    <option value="High">High - Important</option>
                    <option value="Urgent">Urgent - Needs immediate attention</option>
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Due Date <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Reminder Date */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Set Reminder (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={taskReminderDate}
                    onChange={(e) => setTaskReminderDate(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    You'll receive a notification at this time
                  </p>
                </div>

                {/* Assign To */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Assign To <span className="text-danger-500">*</span>
                  </label>
                  <select
                    value={taskAssignedTo}
                    onChange={(e) => setTaskAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select team member...</option>
                    {/* TODO: Fetch team members from API */}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    value={taskNotes}
                    onChange={(e) => setTaskNotes(e.target.value)}
                    placeholder="Add any additional context or notes..."
                    rows={4}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddTaskModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleAddTask}
                    className="flex-1"
                    disabled={!taskTitle || !taskDescription || !taskDueDate || !taskAssignedTo}
                  >
                    Create Task
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                {/* Title and Status */}
                <div>
                  <h4 className="text-2xl font-bold text-neutral-900 mb-2">{selectedTask.title}</h4>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(selectedTask.priority)}`}>
                      {selectedTask.priority} Priority
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTask.status)}`}>
                      {selectedTask.status}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-neutral-50 rounded-lg p-4">
                  <h5 className="font-semibold text-neutral-900 mb-2">Description</h5>
                  <p className="text-neutral-700">{selectedTask.description}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary-50 rounded-lg p-3">
                    <p className="text-xs text-primary-600 font-medium mb-1">DUE DATE</p>
                    <p className="text-sm font-semibold text-neutral-900">{formatDate(selectedTask.dueDate)}</p>
                  </div>
                  {selectedTask.reminderDate && (
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <p className="text-xs text-yellow-600 font-medium mb-1">REMINDER</p>
                      <p className="text-sm font-semibold text-neutral-900">{formatDate(selectedTask.reminderDate)}</p>
                    </div>
                  )}
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-purple-600 font-medium mb-1">ASSIGNED TO</p>
                    <p className="text-sm font-semibold text-neutral-900">{selectedTask.assignedTo}</p>
                  </div>
                  <div className="bg-success-50 rounded-lg p-3">
                    <p className="text-xs text-success-600 font-medium mb-1">CREATED BY</p>
                    <p className="text-sm font-semibold text-neutral-900">{selectedTask.assignedBy}</p>
                  </div>
                </div>

                {/* Notes */}
                {selectedTask.notes && (
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h5 className="font-semibold text-neutral-900 mb-2">Notes</h5>
                    <p className="text-neutral-700 text-sm">{selectedTask.notes}</p>
                  </div>
                )}

                {/* Stakeholder */}
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                  <p className="text-sm text-primary-900">
                    <strong>Related to:</strong> {selectedTask.stakeholder.name} ({selectedTask.stakeholder.type})
                  </p>
                </div>

                {/* Timestamps */}
                <div className="border-t pt-4 text-xs text-neutral-500 space-y-1">
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
                    <Button variant="primary" className="flex-1">
                      Mark as Completed
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
