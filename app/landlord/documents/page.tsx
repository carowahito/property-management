'use client'

import { Button } from '@/components/ui/button'

export default function LandlordDocumentsPage() {
  const documents = [
    { id: 1, name: 'Lease Agreement - Unit 4B', type: 'lease', date: '2024-01-15', size: '245 KB' },
    { id: 2, name: 'Property Insurance Policy', type: 'insurance', date: '2024-01-01', size: '1.2 MB' },
    { id: 3, name: 'Maintenance Invoice #1234', type: 'invoice', date: '2025-11-01', size: '156 KB' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Documents</h1>
        <Button variant="success" size="lg">+ Upload Document</Button>
      </div>

      <div className="bg-surface shadow rounded-lg p-6">
        <div className="space-y-4">
          {documents.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-success-500 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">📄</div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{doc.name}</p>
                  <p className="text-xs text-neutral-600">{doc.type} • {doc.date} • {doc.size}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button variant="primary" size="sm">Download</Button>
                <Button variant="outline" size="sm">Share</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
