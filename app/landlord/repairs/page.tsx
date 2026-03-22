'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface WorkEvidence {
  id: string
  quoteId: string
  jobId: string
  property: string
  unit: string
  workDescription: string
  vendor: string
  vendorCategory: string
  startDate: string
  completedDate?: string
  status: 'in-progress' | 'completed' | 'verified'
  totalCost: number
  type: 'Before' | 'During' | 'After' | 'Completion'
  files: {
    name: string
    url: string
    type: 'image' | 'video'
    thumbnail?: string
    uploadDate: string
  }[]
  description: string
  tags: string[]
}

export default function LandlordRepairs() {
  const [selectedWork, setSelectedWork] = useState<WorkEvidence | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Mock data - in production, filter by landlord's properties
  const workEvidences: WorkEvidence[] = [
    {
      id: 'EVD-001',
      quoteId: 'QR-004',
      jobId: 'JOB-044',
      property: 'Skyline Apartments',
      unit: 'Common Area - Basement',
      workDescription: 'Main water line leak repair',
      vendor: 'Nairobi Plumbing Services',
      vendorCategory: 'Plumbing',
      startDate: '2025-11-10',
      completedDate: '2025-11-11',
      status: 'verified',
      totalCost: 85000,
      type: 'Before',
      files: [
        { 
          name: 'basement_leak_before_1.jpg', 
          url: '#', 
          type: 'image', 
          thumbnail: 'https://via.placeholder.com/300x200/FF6B6B/ffffff?text=Main+Line+Leak',
          uploadDate: '2025-11-10T09:00:00'
        },
        { 
          name: 'basement_leak_before_2.jpg', 
          url: '#', 
          type: 'image', 
          thumbnail: 'https://via.placeholder.com/300x200/FF6B6B/ffffff?text=Water+Damage',
          uploadDate: '2025-11-10T09:05:00'
        }
      ],
      description: 'Major water line leak in basement causing flooding. Immediate repair required.',
      tags: ['emergency', 'water-damage', 'main-line']
    },
    {
      id: 'EVD-002',
      quoteId: 'QR-004',
      jobId: 'JOB-044',
      property: 'Skyline Apartments',
      unit: 'Common Area - Basement',
      workDescription: 'Main water line leak repair',
      vendor: 'Nairobi Plumbing Services',
      vendorCategory: 'Plumbing',
      startDate: '2025-11-10',
      completedDate: '2025-11-11',
      status: 'verified',
      totalCost: 85000,
      type: 'During',
      files: [
        { 
          name: 'repair_in_progress.jpg', 
          url: '#', 
          type: 'image', 
          thumbnail: 'https://via.placeholder.com/300x200/4ECDC4/ffffff?text=Repair+Work',
          uploadDate: '2025-11-10T14:30:00'
        },
        { 
          name: 'pipe_replacement.mp4', 
          url: '#', 
          type: 'video', 
          thumbnail: 'https://via.placeholder.com/300x200/4ECDC4/ffffff?text=Video',
          uploadDate: '2025-11-10T15:00:00'
        }
      ],
      description: 'Repair work in progress. Old pipe section removed, new pipes being installed.',
      tags: ['repair', 'progress', 'plumbing']
    },
    {
      id: 'EVD-003',
      quoteId: 'QR-004',
      jobId: 'JOB-044',
      property: 'Skyline Apartments',
      unit: 'Common Area - Basement',
      workDescription: 'Main water line leak repair',
      vendor: 'Nairobi Plumbing Services',
      vendorCategory: 'Plumbing',
      startDate: '2025-11-10',
      completedDate: '2025-11-11',
      status: 'verified',
      totalCost: 85000,
      type: 'Completion',
      files: [
        { 
          name: 'completed_repair_1.jpg', 
          url: '#', 
          type: 'image', 
          thumbnail: 'https://via.placeholder.com/300x200/95E1D3/ffffff?text=Completed+Repair',
          uploadDate: '2025-11-11T16:00:00'
        },
        { 
          name: 'completed_repair_2.jpg', 
          url: '#', 
          type: 'image', 
          thumbnail: 'https://via.placeholder.com/300x200/95E1D3/ffffff?text=Clean+Area',
          uploadDate: '2025-11-11T16:10:00'
        },
        { 
          name: 'pressure_test.mp4', 
          url: '#', 
          type: 'video', 
          thumbnail: 'https://via.placeholder.com/300x200/95E1D3/ffffff?text=Test+Video',
          uploadDate: '2025-11-11T16:30:00'
        }
      ],
      description: 'Repair completed successfully. New pipes installed, tested, and area cleaned. No leaks detected.',
      tags: ['completed', 'tested', 'verified']
    },
    {
      id: 'EVD-004',
      quoteId: 'QR-003',
      jobId: 'JOB-048',
      property: 'Riverside Towers',
      unit: 'Unit 204',
      workDescription: 'Water heater installation',
      vendor: 'Nairobi Plumbing Services',
      vendorCategory: 'Plumbing',
      startDate: '2025-11-13',
      status: 'in-progress',
      totalCost: 45000,
      type: 'Before',
      files: [
        { 
          name: 'old_water_heater.jpg', 
          url: '#', 
          type: 'image', 
          thumbnail: 'https://via.placeholder.com/300x200/FF6B6B/ffffff?text=Old+Heater',
          uploadDate: '2025-11-13T10:00:00'
        }
      ],
      description: 'Old water heater - 15 years old, rusted, inefficient. Ready for replacement.',
      tags: ['water-heater', 'replacement', 'before']
    },
    {
      id: 'EVD-005',
      quoteId: 'QR-003',
      jobId: 'JOB-048',
      property: 'Riverside Towers',
      unit: 'Unit 204',
      workDescription: 'Water heater installation',
      vendor: 'Nairobi Plumbing Services',
      vendorCategory: 'Plumbing',
      startDate: '2025-11-13',
      status: 'in-progress',
      totalCost: 45000,
      type: 'During',
      files: [
        { 
          name: 'installation_progress.jpg', 
          url: '#', 
          type: 'image', 
          thumbnail: 'https://via.placeholder.com/300x200/4ECDC4/ffffff?text=Installation',
          uploadDate: '2025-11-13T14:00:00'
        }
      ],
      description: 'New energy-efficient water heater being installed. Connections in progress.',
      tags: ['installation', 'in-progress', 'water-heater']
    },
    {
      id: 'EVD-006',
      quoteId: 'QR-006',
      jobId: 'JOB-051',
      property: 'Riverside Towers',
      unit: 'Unit 506',
      workDescription: 'Electrical outlet repair',
      vendor: 'Bright Electric Ltd',
      vendorCategory: 'Electrical',
      startDate: '2025-11-05',
      completedDate: '2025-11-06',
      status: 'verified',
      totalCost: 8000,
      type: 'Completion',
      files: [
        { 
          name: 'outlet_replaced.jpg', 
          url: '#', 
          type: 'image', 
          thumbnail: 'https://via.placeholder.com/300x200/95E1D3/ffffff?text=New+Outlet',
          uploadDate: '2025-11-06T15:00:00'
        },
        { 
          name: 'circuit_test.jpg', 
          url: '#', 
          type: 'image', 
          thumbnail: 'https://via.placeholder.com/300x200/95E1D3/ffffff?text=Circuit+Test',
          uploadDate: '2025-11-06T15:15:00'
        }
      ],
      description: 'Faulty outlet replaced. Circuit tested and verified safe.',
      tags: ['electrical', 'safety', 'completed']
    }
  ]

  // Group evidence by job
  const groupedByJob = workEvidences.reduce((acc, evidence) => {
    if (!acc[evidence.jobId]) {
      acc[evidence.jobId] = []
    }
    acc[evidence.jobId].push(evidence)
    return acc
  }, {} as Record<string, WorkEvidence[]>)

  const filteredEvidences = Object.entries(groupedByJob).filter(([jobId, evidences]) => {
    const jobStatus = evidences[0].status
    if (filterStatus !== 'all' && jobStatus !== filterStatus) return false
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress': return 'bg-warning-100 text-warning-800'
      case 'completed': return 'bg-success-100 text-success-800'
      case 'verified': return 'bg-purple-100 text-purple-800'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Before': return 'bg-danger-100 text-danger-800'
      case 'During': return 'bg-primary-100 text-primary-800'
      case 'After': return 'bg-success-100 text-success-800'
      case 'Completion': return 'bg-purple-100 text-purple-800'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  const totalJobs = Object.keys(groupedByJob).length
  const completedJobs = filteredEvidences.filter(([_, evidences]) => evidences[0].status === 'verified').length
  const inProgressJobs = filteredEvidences.filter(([_, evidences]) => evidences[0].status === 'in-progress').length
  const totalFiles = workEvidences.reduce((sum, e) => sum + e.files.length, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Work Evidence & Documentation</h1>
          <p className="text-neutral-600 mt-1">Review before/after photos and videos of repairs on your properties</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-sm text-neutral-600">Total Jobs</p>
          <p className="text-2xl font-bold text-neutral-900">{totalJobs}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-sm text-neutral-600">In Progress</p>
          <p className="text-2xl font-bold text-warning-600">{inProgressJobs}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-sm text-neutral-600">Completed & Verified</p>
          <p className="text-2xl font-bold text-success-600">{completedJobs}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-sm text-neutral-600">Total Files</p>
          <p className="text-2xl font-bold text-primary-600">{totalFiles}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-surface shadow rounded-lg p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-neutral-700">Filter by status:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'all'
                  ? 'bg-success-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              All ({totalJobs})
            </button>
            <button
              onClick={() => setFilterStatus('in-progress')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'in-progress'
                  ? 'bg-success-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              In Progress ({inProgressJobs})
            </button>
            <button
              onClick={() => setFilterStatus('verified')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'verified'
                  ? 'bg-success-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Verified ({completedJobs})
            </button>
          </div>
        </div>
      </div>

      {/* Work Evidence by Job */}
      <div className="space-y-6">
        {filteredEvidences.map(([jobId, evidences]) => {
          const job = evidences[0]
          const beforePhotos = evidences.filter(e => e.type === 'Before')
          const duringPhotos = evidences.filter(e => e.type === 'During')
          const afterPhotos = evidences.filter(e => e.type === 'After' || e.type === 'Completion')
          
          return (
            <div key={jobId} className="bg-surface shadow rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-neutral-900">{job.workDescription}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(job.status)}`}>
                      {job.status === 'in-progress' ? 'In Progress' : 
                       job.status === 'completed' ? 'Completed' : 'Verified'}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 mb-2">
                    {job.property} - {job.unit} • Quote: {job.quoteId} • Job: {job.jobId}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-neutral-600 mb-3">
                    <span>Vendor: <strong>{job.vendor}</strong> ({job.vendorCategory})</span>
                    <span>Cost: <strong>KES {job.totalCost.toLocaleString()}</strong></span>
                    <span>Started: {new Date(job.startDate).toLocaleDateString()}</span>
                    {job.completedDate && (
                      <span className="text-success-600">Completed: {new Date(job.completedDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Before Photos */}
              {beforePhotos.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-danger-100 text-danger-800">Before Work</span>
                    <span className="text-sm text-neutral-600">({beforePhotos[0].files.length} files)</span>
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {beforePhotos.flatMap(e => e.files).map((file, idx) => (
                      <div key={idx} className="relative group cursor-pointer" onClick={() => setSelectedWork(beforePhotos[0])}>
                        <div className="aspect-video bg-neutral-200 rounded-lg overflow-hidden">
                          {file.type === 'image' ? (
                            <img
                              src={file.thumbnail}
                              alt={file.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-neutral-600 mt-1 truncate">{file.name}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-neutral-700 mt-2">{beforePhotos[0].description}</p>
                </div>
              )}

              {/* During Photos */}
              {duringPhotos.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-primary-100 text-primary-800">Work in Progress</span>
                    <span className="text-sm text-neutral-600">({duringPhotos[0].files.length} files)</span>
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {duringPhotos.flatMap(e => e.files).map((file, idx) => (
                      <div key={idx} className="relative group cursor-pointer" onClick={() => setSelectedWork(duringPhotos[0])}>
                        <div className="aspect-video bg-neutral-200 rounded-lg overflow-hidden">
                          {file.type === 'image' ? (
                            <img
                              src={file.thumbnail}
                              alt={file.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-neutral-600 mt-1 truncate">{file.name}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-neutral-700 mt-2">{duringPhotos[0].description}</p>
                </div>
              )}

              {/* After/Completion Photos */}
              {afterPhotos.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-success-100 text-success-800">Completed Work</span>
                    <span className="text-sm text-neutral-600">({afterPhotos[0].files.length} files)</span>
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {afterPhotos.flatMap(e => e.files).map((file, idx) => (
                      <div key={idx} className="relative group cursor-pointer" onClick={() => setSelectedWork(afterPhotos[0])}>
                        <div className="aspect-video bg-neutral-200 rounded-lg overflow-hidden">
                          {file.type === 'image' ? (
                            <img
                              src={file.thumbnail}
                              alt={file.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-neutral-600 mt-1 truncate">{file.name}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-neutral-700 mt-2">{afterPhotos[0].description}</p>
                </div>
              )}

              {job.status === 'completed' && (
                <div className="mt-4 pt-4 border-t">
                  <Button variant="success" size="lg">
                    Verify & Approve Work
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
