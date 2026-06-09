'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface WorkEvidence {
  id: string
  jobId: string
  jobDescription: string
  property: string
  uploadDate: string
  type: 'Before' | 'During' | 'After' | 'Issue' | 'Completion'
  files: {
    name: string
    url: string
    type: 'image' | 'video'
    thumbnail?: string
  }[]
  description: string
  tags: string[]
}

export default function VendorEvidence() {
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [selectedEvidence, setSelectedEvidence] = useState<WorkEvidence | null>(null)
  const [uploadForm, setUploadForm] = useState({
    jobId: '',
    type: 'Before',
    description: '',
    tags: '',
    files: [] as File[]
  })
  const [filterType, setFilterType] = useState<string>('all')

  // Mock data
  const evidences: WorkEvidence[] = [
    {
      id: 'EVD-001',
      jobId: 'JOB-047',
      jobDescription: 'Pipe Leak Repair - Skyline Apartments Unit 204',
      property: 'Skyline Apartments',
      uploadDate: '2025-11-14T09:30:00',
      type: 'Before',
      files: [
        { name: 'leak_before_1.jpg', url: '#', type: 'image', thumbnail: 'https://via.placeholder.com/200x150/FF6B6B/ffffff?text=Leak+Before' },
        { name: 'leak_before_2.jpg', url: '#', type: 'image', thumbnail: 'https://via.placeholder.com/200x150/FF6B6B/ffffff?text=Water+Damage' }
      ],
      description: 'Visible water leak under kitchen sink. Water pooling on cabinet floor.',
      tags: ['leak', 'kitchen', 'water-damage']
    },
    {
      id: 'EVD-002',
      jobId: 'JOB-047',
      jobDescription: 'Pipe Leak Repair - Skyline Apartments Unit 204',
      property: 'Skyline Apartments',
      uploadDate: '2025-11-14T14:15:00',
      type: 'During',
      files: [
        { name: 'repair_progress.jpg', url: '#', type: 'image', thumbnail: 'https://via.placeholder.com/200x150/4ECDC4/ffffff?text=Repair+Progress' },
        { name: 'repair_video.mp4', url: '#', type: 'video', thumbnail: 'https://via.placeholder.com/200x150/4ECDC4/ffffff?text=Video' }
      ],
      description: 'Repair in progress. Old pipe removed, preparing to install new PVC piping.',
      tags: ['repair', 'plumbing', 'progress']
    },
    {
      id: 'EVD-003',
      jobId: 'JOB-047',
      jobDescription: 'Pipe Leak Repair - Skyline Apartments Unit 204',
      property: 'Skyline Apartments',
      uploadDate: '2025-11-14T16:45:00',
      type: 'After',
      files: [
        { name: 'completed_1.jpg', url: '#', type: 'image', thumbnail: 'https://via.placeholder.com/200x150/95E1D3/ffffff?text=Completed' },
        { name: 'completed_2.jpg', url: '#', type: 'image', thumbnail: 'https://via.placeholder.com/200x150/95E1D3/ffffff?text=Clean+Area' }
      ],
      description: 'Repair completed. New pipes installed, tested for leaks, and area cleaned.',
      tags: ['completed', 'clean', 'tested']
    },
    {
      id: 'EVD-004',
      jobId: 'JOB-048',
      jobDescription: 'Water Heater Installation - Riverside Towers Unit 305',
      property: 'Riverside Towers',
      uploadDate: '2025-11-15T10:00:00',
      type: 'Before',
      files: [
        { name: 'old_heater.jpg', url: '#', type: 'image', thumbnail: 'https://via.placeholder.com/200x150/FF6B6B/ffffff?text=Old+Heater' }
      ],
      description: 'Old water heater - 15 years old, rusted tank, inefficient.',
      tags: ['old-equipment', 'replacement']
    },
    {
      id: 'EVD-005',
      jobId: 'JOB-049',
      jobDescription: 'Bathroom Faucet Replacement - Garden View Estate Unit 101',
      property: 'Garden View Estate',
      uploadDate: '2025-11-16T11:30:00',
      type: 'Completion',
      files: [
        { name: 'new_faucet_1.jpg', url: '#', type: 'image', thumbnail: 'https://via.placeholder.com/200x150/95E1D3/ffffff?text=New+Faucet' },
        { name: 'new_faucet_2.jpg', url: '#', type: 'image', thumbnail: 'https://via.placeholder.com/200x150/95E1D3/ffffff?text=Installation' },
        { name: 'faucet_demo.mp4', url: '#', type: 'video', thumbnail: 'https://via.placeholder.com/200x150/95E1D3/ffffff?text=Demo+Video' }
      ],
      description: 'New chrome faucet installed and tested. Water flow excellent, no leaks detected.',
      tags: ['installation', 'faucet', 'completed', 'tested']
    }
  ]

  const filteredEvidences = filterType === 'all' 
    ? evidences 
    : evidences.filter(e => e.type === filterType)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadForm({ ...uploadForm, files: Array.from(e.target.files) })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Uploading evidence:', uploadForm)
    setShowUploadForm(false)
    setUploadForm({ jobId: '', type: 'Before', description: '', tags: '', files: [] })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Before': return 'bg-danger-100 text-danger-800'
      case 'During': return 'bg-primary-100 text-primary-800'
      case 'After': return 'bg-success-100 text-success-800'
      case 'Issue': return 'bg-warning-100 text-warning-800'
      case 'Completion': return 'bg-primary-100 text-primary-800'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  const totalFiles = evidences.reduce((sum, e) => sum + e.files.length, 0)
  const totalImages = evidences.reduce((sum, e) => sum + e.files.filter(f => f.type === 'image').length, 0)
  const totalVideos = evidences.reduce((sum, e) => sum + e.files.filter(f => f.type === 'video').length, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Visual Evidence</h1>
          <p className="text-neutral-600 mt-1">Upload photos and videos of your work</p>
        </div>
        <button
          onClick={() => setShowUploadForm(true)}
          className="bg-warning-600 text-white px-6 py-2 rounded-lg hover:bg-warning-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload Evidence
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-sm text-neutral-600">Total Uploads</p>
          <p className="text-2xl font-bold text-neutral-900">{evidences.length}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-sm text-neutral-600">Total Files</p>
          <p className="text-2xl font-bold text-neutral-900">{totalFiles}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-sm text-neutral-600">Photos</p>
          <p className="text-2xl font-bold text-primary-600">{totalImages}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-sm text-neutral-600">Videos</p>
          <p className="text-2xl font-bold text-primary-600">{totalVideos}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-surface shadow rounded-lg p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-neutral-700">Filter by type:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterType === 'all'
                  ? 'bg-warning-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              All ({evidences.length})
            </button>
            <button
              onClick={() => setFilterType('Before')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterType === 'Before'
                  ? 'bg-warning-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Before ({evidences.filter(e => e.type === 'Before').length})
            </button>
            <button
              onClick={() => setFilterType('During')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterType === 'During'
                  ? 'bg-warning-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              During ({evidences.filter(e => e.type === 'During').length})
            </button>
            <button
              onClick={() => setFilterType('After')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterType === 'After'
                  ? 'bg-warning-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              After ({evidences.filter(e => e.type === 'After').length})
            </button>
            <button
              onClick={() => setFilterType('Completion')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterType === 'Completion'
                  ? 'bg-warning-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Completion ({evidences.filter(e => e.type === 'Completion').length})
            </button>
          </div>
        </div>
      </div>

      {/* Evidence Gallery */}
      <div className="space-y-6">
        {filteredEvidences.map((evidence) => (
          <div key={evidence.id} className="bg-surface shadow rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-neutral-900">{evidence.id}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${getTypeColor(evidence.type)}`}>
                    {evidence.type}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 mb-1">Job: {evidence.jobId} - {evidence.jobDescription}</p>
                <p className="text-sm text-neutral-600 mb-2">Property: {evidence.property}</p>
                <p className="text-neutral-900 mb-3">{evidence.description}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {evidence.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-neutral-500">
                  Uploaded: {new Date(evidence.uploadDate).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Media Gallery */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {evidence.files.map((file, idx) => (
                <div key={idx} className="relative group cursor-pointer" onClick={() => setSelectedEvidence(evidence)}>
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
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg transition-opacity flex items-center justify-center">
                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <p className="text-xs text-neutral-600 mt-1 truncate">{file.name}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">Upload Visual Evidence</h2>
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Job ID
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500"
                    value={uploadForm.jobId}
                    onChange={(e) => setUploadForm({ ...uploadForm, jobId: e.target.value })}
                  >
                    <option value="">Select a job</option>
                    <option value="JOB-047">JOB-047 - Pipe Leak Repair</option>
                    <option value="JOB-048">JOB-048 - Water Heater Installation</option>
                    <option value="JOB-049">JOB-049 - Bathroom Faucet Replacement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Evidence Type
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500"
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                  >
                    <option value="Before">Before Work</option>
                    <option value="During">Work in Progress</option>
                    <option value="After">After Work</option>
                    <option value="Issue">Issue/Problem</option>
                    <option value="Completion">Completion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Upload Photos/Videos
                  </label>
                  <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="evidence-upload"
                    />
                    <label htmlFor="evidence-upload" className="cursor-pointer">
                      <svg className="mx-auto h-16 w-16 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="mt-4 text-sm text-neutral-600">
                        Click to upload photos or videos
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">Support for images and videos up to 50MB each</p>
                    </label>
                    {uploadForm.files.length > 0 && (
                      <div className="mt-4 text-left">
                        <p className="text-sm font-medium text-neutral-700 mb-2">Selected files:</p>
                        {uploadForm.files.map((file, idx) => (
                          <p key={idx} className="text-sm text-neutral-600">• {file.name}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    required
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500"
                    placeholder="Describe what the photos/videos show..."
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500"
                    placeholder="leak, repair, plumbing"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-warning-600 text-white py-2 px-4 rounded-lg hover:bg-warning-700"
                  >
                    Upload Evidence
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(false)}
                    className="px-6 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
