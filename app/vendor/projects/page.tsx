'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  property: string
  type: 'Upgrade' | 'Renovation' | 'Installation' | 'Maintenance'
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold'
  budget: number
  spent: number
  startDate: string
  endDate: string
  progress: number
  milestones: {
    id: string
    name: string
    status: 'pending' | 'in-progress' | 'completed'
    dueDate: string
  }[]
  description: string
}

export default function VendorProjects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // Mock data
  const projects: Project[] = [
    {
      id: 'PRJ-001',
      name: 'Complete Plumbing System Upgrade',
      property: 'Skyline Apartments - Building A',
      type: 'Upgrade',
      status: 'In Progress',
      budget: 850000,
      spent: 425000,
      startDate: '2025-11-01',
      endDate: '2025-12-15',
      progress: 50,
      description: 'Full replacement of aging plumbing infrastructure in Building A. Includes all units, common areas, and main lines.',
      milestones: [
        { id: 'M1', name: 'Site assessment and planning', status: 'completed', dueDate: '2025-11-05' },
        { id: 'M2', name: 'Main line replacement', status: 'completed', dueDate: '2025-11-15' },
        { id: 'M3', name: 'Floor 1-3 unit upgrades', status: 'in-progress', dueDate: '2025-11-30' },
        { id: 'M4', name: 'Floor 4-6 unit upgrades', status: 'pending', dueDate: '2025-12-10' },
        { id: 'M5', name: 'Final inspection and testing', status: 'pending', dueDate: '2025-12-15' }
      ]
    },
    {
      id: 'PRJ-002',
      name: 'Water Heater Installation - All Units',
      property: 'Riverside Towers',
      type: 'Installation',
      status: 'Planning',
      budget: 1200000,
      spent: 0,
      startDate: '2025-12-01',
      endDate: '2026-01-31',
      progress: 10,
      description: 'Install energy-efficient water heaters in all 45 units. Includes removal of old units and disposal.',
      milestones: [
        { id: 'M1', name: 'Equipment procurement', status: 'in-progress', dueDate: '2025-11-25' },
        { id: 'M2', name: 'Phase 1: Units 1-15', status: 'pending', dueDate: '2025-12-15' },
        { id: 'M3', name: 'Phase 2: Units 16-30', status: 'pending', dueDate: '2026-01-10' },
        { id: 'M4', name: 'Phase 3: Units 31-45', status: 'pending', dueDate: '2026-01-25' },
        { id: 'M5', name: 'Final testing and warranty setup', status: 'pending', dueDate: '2026-01-31' }
      ]
    },
    {
      id: 'PRJ-003',
      name: 'Emergency Backup System Installation',
      property: 'Garden View Estate',
      type: 'Installation',
      status: 'Completed',
      budget: 350000,
      spent: 340000,
      startDate: '2025-10-01',
      endDate: '2025-10-31',
      progress: 100,
      description: 'Install backup water pump system and emergency shut-off valves for the entire property.',
      milestones: [
        { id: 'M1', name: 'System design approval', status: 'completed', dueDate: '2025-10-05' },
        { id: 'M2', name: 'Equipment installation', status: 'completed', dueDate: '2025-10-20' },
        { id: 'M3', name: 'Testing and commissioning', status: 'completed', dueDate: '2025-10-28' },
        { id: 'M4', name: 'Staff training', status: 'completed', dueDate: '2025-10-31' }
      ]
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning': return 'bg-primary-100 text-primary-800'
      case 'In Progress': return 'bg-warning-100 text-warning-800'
      case 'Completed': return 'bg-success-100 text-success-800'
      case 'On Hold': return 'bg-neutral-100 text-neutral-800'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Upgrade': return 'bg-purple-100 text-purple-800'
      case 'Renovation': return 'bg-yellow-100 text-yellow-800'
      case 'Installation': return 'bg-primary-100 text-primary-800'
      case 'Maintenance': return 'bg-neutral-100 text-neutral-800'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✓'
      case 'in-progress': return '⏳'
      case 'pending': return '○'
      default: return '○'
    }
  }

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0)
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0)
  const activeProjects = projects.filter(p => p.status === 'In Progress').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Projects & Upgrades</h1>
          <p className="text-neutral-600 mt-1">Track major projects and property upgrades</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-sm text-neutral-600">Total Projects</p>
          <p className="text-2xl font-bold text-neutral-900">{projects.length}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-sm text-neutral-600">Active Projects</p>
          <p className="text-2xl font-bold text-warning-600">{activeProjects}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-sm text-neutral-600">Total Budget</p>
          <p className="text-2xl font-bold text-neutral-900">KES {(totalBudget / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-sm text-neutral-600">Total Spent</p>
          <p className="text-2xl font-bold text-primary-600">KES {(totalSpent / 1000).toFixed(0)}K</p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-surface shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-neutral-900 text-lg">{project.name}</h3>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${getTypeColor(project.type)}`}>
                    {project.type}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 mb-2">{project.property}</p>
                <p className="text-sm text-neutral-700 mb-4">{project.description}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-neutral-700">Progress</span>
                <span className="text-sm font-medium text-neutral-900">{project.progress}%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div
                  className="bg-warning-600 h-2 rounded-full transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Budget Info */}
            <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-neutral-50 rounded">
              <div>
                <p className="text-xs text-neutral-600">Budget</p>
                <p className="font-semibold text-neutral-900">KES {project.budget.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-600">Spent</p>
                <p className="font-semibold text-primary-600">KES {project.spent.toLocaleString()}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="flex items-center gap-4 mb-4 text-sm text-neutral-600">
              <div>
                <span className="font-medium">Start:</span> {new Date(project.startDate).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">End:</span> {new Date(project.endDate).toLocaleDateString()}
              </div>
            </div>

            {/* Milestones Preview */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-neutral-700 mb-2">Milestones ({project.milestones.filter(m => m.status === 'completed').length}/{project.milestones.length})</p>
              <div className="space-y-1">
                {project.milestones.slice(0, 3).map((milestone) => (
                  <div key={milestone.id} className="flex items-center gap-2 text-sm">
                    <span className={`${
                      milestone.status === 'completed' ? 'text-success-600' :
                      milestone.status === 'in-progress' ? 'text-warning-600' :
                      'text-neutral-400'
                    }`}>
                      {getMilestoneIcon(milestone.status)}
                    </span>
                    <span className={`${
                      milestone.status === 'completed' ? 'text-neutral-500 line-through' : 'text-neutral-700'
                    }`}>
                      {milestone.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedProject(project)}
              className="mt-4 w-full bg-neutral-100 text-neutral-700 py-2 rounded hover:bg-neutral-200 text-sm font-medium"
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">{selectedProject.name}</h2>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Project Information</h3>
                  <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Property:</span>
                      <span className="font-medium">{selectedProject.property}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Type:</span>
                      <span className={`px-2 py-1 rounded text-xs ${getTypeColor(selectedProject.type)}`}>
                        {selectedProject.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedProject.status)}`}>
                        {selectedProject.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Duration:</span>
                      <span className="font-medium">
                        {new Date(selectedProject.startDate).toLocaleDateString()} - {new Date(selectedProject.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Description</h3>
                  <p className="text-neutral-700">{selectedProject.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Budget & Spending</h3>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-neutral-600">Total Budget</p>
                        <p className="text-lg font-bold">KES {selectedProject.budget.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600">Spent</p>
                        <p className="text-lg font-bold text-primary-600">KES {selectedProject.spent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600">Remaining</p>
                        <p className="text-lg font-bold text-success-600">KES {(selectedProject.budget - selectedProject.spent).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-3">
                      <div
                        className="bg-primary-600 h-3 rounded-full"
                        style={{ width: `${(selectedProject.spent / selectedProject.budget * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-neutral-900 mb-3">Milestones</h3>
                  <div className="space-y-3">
                    {selectedProject.milestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
                        <span className={`text-xl ${
                          milestone.status === 'completed' ? 'text-success-600' :
                          milestone.status === 'in-progress' ? 'text-warning-600' :
                          'text-neutral-400'
                        }`}>
                          {getMilestoneIcon(milestone.status)}
                        </span>
                        <div className="flex-1">
                          <p className={`font-medium ${
                            milestone.status === 'completed' ? 'text-neutral-500 line-through' : 'text-neutral-900'
                          }`}>
                            {milestone.name}
                          </p>
                          <p className="text-sm text-neutral-600">Due: {new Date(milestone.dueDate).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          milestone.status === 'completed' ? 'bg-success-100 text-success-800' :
                          milestone.status === 'in-progress' ? 'bg-warning-100 text-warning-800' :
                          'bg-neutral-100 text-neutral-800'
                        }`}>
                          {milestone.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Link
                    href={`/vendor/evidence?project=${selectedProject.id}`}
                    className="flex-1 bg-warning-600 text-white py-2 px-4 rounded-lg hover:bg-warning-700 text-center"
                  >
                    View Evidence
                  </Link>
                  <Link
                    href={`/vendor/receipts?project=${selectedProject.id}`}
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 text-center"
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
