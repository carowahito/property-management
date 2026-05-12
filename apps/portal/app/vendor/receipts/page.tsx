'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface Receipt {
  id: string
  jobId: string
  jobDescription: string
  property: string
  amount: number
  date: string
  category: 'Materials' | 'Labor' | 'Equipment' | 'Transport' | 'Other'
  status: 'pending' | 'approved' | 'rejected'
  files: {
    name: string
    url: string
    type: string
  }[]
  notes?: string
}

export default function VendorReceipts() {
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    jobId: '',
    category: 'Materials',
    amount: '',
    date: '',
    notes: '',
    files: [] as File[]
  })

  // Mock data
  const receipts: Receipt[] = [
    {
      id: 'RCP-001',
      jobId: 'JOB-047',
      jobDescription: 'Pipe Leak Repair - Skyline Apartments Unit 204',
      property: 'Skyline Apartments',
      amount: 12500,
      date: '2025-11-15',
      category: 'Materials',
      status: 'approved',
      files: [
        { name: 'receipt_plumbing_supplies.pdf', url: '#', type: 'application/pdf' }
      ],
      notes: 'PVC pipes, fittings, and sealants from Hardware Store'
    },
    {
      id: 'RCP-002',
      jobId: 'JOB-048',
      jobDescription: 'Water Heater Installation - Riverside Towers Unit 305',
      property: 'Riverside Towers',
      amount: 28000,
      date: '2025-11-16',
      category: 'Materials',
      status: 'pending',
      files: [
        { name: 'water_heater_invoice.pdf', url: '#', type: 'application/pdf' },
        { name: 'installation_kit_receipt.jpg', url: '#', type: 'image/jpeg' }
      ],
      notes: '50-gallon energy-efficient water heater'
    },
    {
      id: 'RCP-003',
      jobId: 'JOB-048',
      jobDescription: 'Water Heater Installation - Riverside Towers Unit 305',
      property: 'Riverside Towers',
      amount: 15000,
      date: '2025-11-16',
      category: 'Labor',
      status: 'pending',
      files: [
        { name: 'labor_invoice.pdf', url: '#', type: 'application/pdf' }
      ],
      notes: 'Installation labor - 2 technicians, 6 hours'
    },
    {
      id: 'RCP-004',
      jobId: 'JOB-046',
      jobDescription: 'Bathroom Faucet Replacement - Garden View Estate Unit 101',
      property: 'Garden View Estate',
      amount: 6500,
      date: '2025-11-14',
      category: 'Materials',
      status: 'approved',
      files: [
        { name: 'faucet_receipt.pdf', url: '#', type: 'application/pdf' }
      ],
      notes: 'Chrome-finish bathroom faucet with warranty'
    }
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadForm({ ...uploadForm, files: Array.from(e.target.files) })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Uploading receipt:', uploadForm)
    setShowUploadForm(false)
    setUploadForm({ jobId: '', category: 'Materials', amount: '', date: '', notes: '', files: [] })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-success-100 text-success-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-danger-100 text-danger-800'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  const totalAmount = receipts.reduce((sum, r) => sum + r.amount, 0)
  const approvedAmount = receipts.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.amount, 0)
  const pendingAmount = receipts.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Receipts & Invoices</h1>
          <p className="text-neutral-600 mt-1">Upload and track your expense receipts</p>
        </div>
        <button
          onClick={() => setShowUploadForm(true)}
          className="bg-warning-600 text-white px-6 py-2 rounded-lg hover:bg-warning-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload Receipt
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-sm text-neutral-600">Total Receipts</p>
          <p className="text-2xl font-bold text-neutral-900">{receipts.length}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-sm text-neutral-600">Total Amount</p>
          <p className="text-2xl font-bold text-neutral-900">KES {(totalAmount / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-sm text-neutral-600">Approved</p>
          <p className="text-2xl font-bold text-success-600">KES {(approvedAmount / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-4">
          <p className="text-sm text-neutral-600">Pending Review</p>
          <p className="text-2xl font-bold text-yellow-600">KES {(pendingAmount / 1000).toFixed(0)}K</p>
        </div>
      </div>

      {/* Receipts List */}
      <div className="bg-surface shadow rounded-lg">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">All Receipts</h2>
        </div>
        <div className="divide-y divide-neutral-200">
          {receipts.map((receipt) => (
            <div key={receipt.id} className="p-6 hover:bg-neutral-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-neutral-900">{receipt.id}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(receipt.status)}`}>
                      {receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}
                    </span>
                    <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                      {receipt.category}
                    </span>
                  </div>
                  
                  <p className="text-sm text-neutral-600 mb-1">Job: {receipt.jobId} - {receipt.jobDescription}</p>
                  <p className="text-sm text-neutral-600 mb-2">Property: {receipt.property}</p>
                  
                  {receipt.notes && (
                    <p className="text-sm text-neutral-700 mb-3">{receipt.notes}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    {receipt.files.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-neutral-100 px-3 py-1 rounded">
                        <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-neutral-700">{file.name}</span>
                        <a href={file.url} className="text-warning-600 hover:text-warning-800 text-xs">View</a>
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-sm text-neutral-500">Submitted: {new Date(receipt.date).toLocaleDateString()}</p>
                </div>
                
                <div className="text-right ml-4">
                  <p className="text-2xl font-bold text-neutral-900">KES {receipt.amount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">Upload Receipt</h2>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Category
                    </label>
                    <select
                      required
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500"
                      value={uploadForm.category}
                      onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    >
                      <option value="Materials">Materials</option>
                      <option value="Labor">Labor</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Transport">Transport</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Amount (KES)
                    </label>
                    <input
                      type="number"
                      required
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500"
                      placeholder="15000"
                      value={uploadForm.amount}
                      onChange={(e) => setUploadForm({ ...uploadForm, amount: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500"
                    value={uploadForm.date}
                    onChange={(e) => setUploadForm({ ...uploadForm, date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Upload Files
                  </label>
                  <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mt-2 text-sm text-neutral-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-neutral-500">PNG, JPG, PDF up to 10MB</p>
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
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500"
                    placeholder="Add any additional details about this receipt..."
                    value={uploadForm.notes}
                    onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-warning-600 text-white py-2 px-4 rounded-lg hover:bg-warning-700"
                  >
                    Upload Receipt
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
