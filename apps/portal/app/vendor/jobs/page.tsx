'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Job {
  id: string
  title: string
  property: string
  unit: string
  category: string
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled'
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  assignedDate: string
  dueDate: string
  completedDate?: string
  amount: number
  description: string
  notes?: string
  progress: number
}

export default function VendorJobs() {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  // Mock data
  const jobs: Job[] = [
    {
      id: 'JOB-047',
      title: 'Pipe Leak Repair',
      property: 'Skyline Apartments',
      unit: 'Unit 204',
      category: 'Plumbing',
      status: 'In Progress',
      priority: 'High',
      assignedDate: '2025-11-14',
      dueDate: '2025-11-16',
      amount: 15000,
      description: 'Kitchen sink pipe leak causing water damage to cabinet.',
      notes: 'Tenant reports leak has been ongoing for 2 days',
      progress: 60
    },
    {
      id: 'JOB-048',
      title: 'Water Heater Installation',
      property: 'Riverside Towers',
      unit: 'Unit 305',
      category: 'Plumbing',
      status: 'Scheduled',
      priority: 'Medium',
      assignedDate: '2025-11-15',
      dueDate: '2025-11-18',
      amount: 35000,
      description: 'Install new 50-gallon energy-efficient water heater.',
      notes: 'Old unit is 15 years old and inefficient',
      progress: 10
    },
    {
      id: 'JOB-049',
      title: 'Bathroom Faucet Replacement',
      property: 'Garden View Estate',
      unit: 'Unit 101',
      category: 'Plumbing',
      status: 'In Progress',
      priority: 'Medium',
      assignedDate: '2025-11-16',
      dueDate: '2025-11-17',
      amount: 8500,
      description: 'Replace old bathroom faucet with chrome-finish modern fixture.',
      progress: 80
    },
    {
      id: 'JOB-044',
      title: 'Main Line Leak Repair',
      property: 'Skyline Apartments',
      unit: 'Common Area - Basement',
      category: 'Plumbing',
      status: 'Completed',
      priority: 'Urgent',
      assignedDate: '2025-11-10',
      dueDate: '2025-11-11',
      completedDate: '2025-11-11',
      amount: 85000,
      description: 'Emergency repair of main water line leak in basement.',
      notes: 'Completed within 24 hours as per emergency protocol',
      progress: 100
    },
    {
      id: 'JOB-045',
      title: 'Toilet Flush Mechanism Repair',
      property: 'Riverside Towers',
      unit: 'Unit 208',
      category: 'Plumbing',
      status: 'Completed',
      priority: 'Low',
      assignedDate: '2025-11-12',
      dueDate: '2025-11-13',
      completedDate: '2025-11-13',
      amount: 4500,
      description: 'Repair faulty toilet flush mechanism.',
      progress: 100
    },
    {
      id: 'JOB-046',
      title: 'Shower Drain Unclogging',
      property: 'Garden View Estate',
      unit: 'Unit 302',
      category: 'Plumbing',
      status: 'Completed',
      priority: 'Medium',
      assignedDate: '2025-11-13',
      dueDate: '2025-11-14',
      completedDate: '2025-11-14',
      amount: 6000,
      description: 'Unclog severely blocked shower drain.',
      progress: 100
    }
  ]

  const activeJobs = jobs.filter(j => j.status === 'Scheduled' || j.status === 'In Progress')
  const completedJobs = jobs.filter(j => j.status === 'Completed')

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-danger-100 text-danger-800'
      case 'High': return 'bg-warning-100 text-warning-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-success-100 text-success-800'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-primary-100 text-primary-800'
      case 'In Progress': return 'bg-warning-100 text-warning-800'
      case 'Completed': return 'bg-success-100 text-success-800'
      case 'Cancelled': return 'bg-danger-100 text-danger-800'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  const filteredJobs = activeTab === 'active' ? activeJobs : completedJobs

  const totalEarnings = completedJobs.reduce((sum, j) => sum + j.amount, 0)
  const activeEarnings = activeJobs.reduce((sum, j) => sum + j.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">My Jobs</h1>
          <p className="text-neutral-600 mt-1">Manage and track your assigned jobs</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-sm text-neutral-600">Active Jobs</p>
          <p className="text-2xl font-bold text-neutral-900">{activeJobs.length}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-sm text-neutral-600">Completed Jobs</p>
          <p className="text-2xl font-bold text-success-600">{completedJobs.length}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-sm text-neutral-600">Active Value</p>
          <p className="text-2xl font-bold text-warning-600">KES {(activeEarnings / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-sm text-neutral-600">Total Earnings</p>
          <p className="text-2xl font-bold text-neutral-900">KES {(totalEarnings / 1000).toFixed(0)}K</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-surface shadow rounded-lg">
        <div className="border-b border-neutral-200">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('active')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'active'
                  ? 'border-warning-500 text-warning-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              Active Jobs ({activeJobs.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'completed'
                  ? 'border-warning-500 text-warning-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              Completed ({completedJobs.length})
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-neutral-400 text-5xl mb-4">📋</div>
              <p className="text-neutral-500">No {activeTab} jobs</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-4 hover:bg-neutral-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-neutral-900">{job.id} - {job.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(job.priority)}`}>
                        {job.priority}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-neutral-600 mb-2">
                      {job.property} - {job.unit}
                    </p>
                    
                    <p className="text-neutral-900 mb-3">{job.description}</p>
                    
                    {job.notes && (
                      <p className="text-sm text-neutral-600 mb-3 italic">Note: {job.notes}</p>
                    )}

                    {job.status !== 'Completed' && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-neutral-600">Progress</span>
                          <span className="text-sm font-medium text-neutral-900">{job.progress}%</span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div
                            className="bg-warning-600 h-2 rounded-full"
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-neutral-600">
                      <span>Assigned: {new Date(job.assignedDate).toLocaleDateString()}</span>
                      <span>Due: {new Date(job.dueDate).toLocaleDateString()}</span>
                      {job.completedDate && (
                        <span className="text-success-600">Completed: {new Date(job.completedDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 text-right">
                    <p className="text-2xl font-bold text-neutral-900">KES {job.amount.toLocaleString()}</p>
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="mt-3 bg-warning-600 text-white px-4 py-2 rounded hover:bg-warning-700 text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">{selectedJob.id} - {selectedJob.title}</h2>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-neutral-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-neutral-600">Property</p>
                      <p className="font-medium">{selectedJob.property}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Unit</p>
                      <p className="font-medium">{selectedJob.unit}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Category</p>
                      <p className="font-medium">{selectedJob.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Amount</p>
                      <p className="font-medium text-lg">KES {selectedJob.amount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Description</h3>
                  <p className="text-neutral-700">{selectedJob.description}</p>
                </div>

                {selectedJob.notes && (
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-2">Notes</h3>
                    <p className="text-neutral-700 italic">{selectedJob.notes}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-neutral-600">Assigned Date</p>
                    <p className="font-medium">{new Date(selectedJob.assignedDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Due Date</p>
                    <p className="font-medium">{new Date(selectedJob.dueDate).toLocaleDateString()}</p>
                  </div>
                  {selectedJob.completedDate && (
                    <div>
                      <p className="text-sm text-neutral-600">Completed</p>
                      <p className="font-medium text-success-600">{new Date(selectedJob.completedDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Link
                    href={`/vendor/evidence?job=${selectedJob.id}`}
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 text-center"
                  >
                    View Evidence
                  </Link>
                  <Link
                    href={`/vendor/receipts?job=${selectedJob.id}`}
                    className="flex-1 bg-success-600 text-white py-2 px-4 rounded-lg hover:bg-success-700 text-center"
                  >
                    View Receipts
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
