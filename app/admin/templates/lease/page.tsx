'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AVAILABLE_PLACEHOLDERS } from '@/lib/default-lease-template'

interface LeaseTemplate {
  id: string
  name: string
  type: string
  content: string
  clauses: any[]
  isDefault: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: { leases: number }
}

const TEMPLATE_TYPES = [
  { value: 'RESIDENTIAL_STANDARD', label: 'Residential Standard' },
  { value: 'RESIDENTIAL_SHORT_TERM', label: 'Short-Term Residential' },
  { value: 'COMMERCIAL', label: 'Commercial' },
]

export default function LeaseTemplatesPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<LeaseTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<LeaseTemplate | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'RESIDENTIAL_STANDARD',
    content: '',
    isDefault: false,
    isActive: true,
  })
  const [showPlaceholders, setShowPlaceholders] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['lease-templates'],
    queryFn: async () => {
      const res = await fetch('/api/lease-templates?activeOnly=false')
      if (!res.ok) throw new Error('Failed to fetch templates')
      return res.json()
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/lease-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create template')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lease-templates'] })
      setShowForm(false)
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/lease-templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update template')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lease-templates'] })
      setEditingTemplate(null)
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/lease-templates/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete template')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lease-templates'] })
    },
  })

  function resetForm() {
    setFormData({ name: '', type: 'RESIDENTIAL_STANDARD', content: '', isDefault: false, isActive: true })
  }

  function handleEdit(template: LeaseTemplate) {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      type: template.type,
      content: template.content,
      isDefault: template.isDefault,
      isActive: template.isActive,
    })
    setShowForm(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  function insertPlaceholder(key: string) {
    setFormData(prev => ({
      ...prev,
      content: prev.content + `{{${key}}}`,
    }))
  }

  const templates: LeaseTemplate[] = data?.templates || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Lease Templates</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage tenancy agreement templates with dynamic field insertion</p>
        </div>
        <Button
          onClick={() => { setEditingTemplate(null); resetForm(); setShowForm(!showForm) }}
          variant={showForm ? 'outline' : 'default'}
        >
          {showForm ? 'Cancel' : '+ New Template'}
        </Button>
      </div>

      {/* Template Form */}
      {showForm && (
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingTemplate ? 'Edit Template' : 'Create New Template'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Template Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  placeholder="e.g., Standard Residential Agreement"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Template Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                >
                  {TEMPLATE_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                    className="rounded border-neutral-300"
                  />
                  Default template
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-neutral-300"
                  />
                  Active
                </label>
              </div>
            </div>

            {/* Placeholder Reference */}
            <div>
              <button
                type="button"
                onClick={() => setShowPlaceholders(!showPlaceholders)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {showPlaceholders ? 'Hide' : 'Show'} Available Placeholders ({AVAILABLE_PLACEHOLDERS.length})
              </button>
              {showPlaceholders && (
                <div className="mt-2 bg-neutral-50 border border-neutral-200 rounded-md p-4 max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {AVAILABLE_PLACEHOLDERS.map(p => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => insertPlaceholder(p.key)}
                        className="text-left text-xs px-2 py-1.5 bg-surface border border-neutral-200 rounded hover:bg-primary-50 hover:border-primary-300 transition-colors"
                        title={`Insert {{${p.key}}}`}
                      >
                        <span className="font-mono text-primary-600">{`{{${p.key}}}`}</span>
                        <span className="block text-neutral-500 truncate">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* HTML Content Editor */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Template Content (HTML)</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 min-h-[400px]"
                placeholder="Enter HTML template content with {{placeholders}}..."
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingTemplate ? 'Update Template' : 'Create Template'}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingTemplate(null); resetForm() }}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-neutral-900/50" onClick={() => setPreviewTemplate(null)} />
          <div className="relative z-50 w-full max-w-4xl bg-surface rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-surface border-b border-border p-4 flex items-center justify-between">
              <h3 className="font-semibold">Preview: {previewTemplate.name}</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => window.print()}>Print / Save PDF</Button>
                <Button variant="ghost" size="sm" onClick={() => setPreviewTemplate(null)}>Close</Button>
              </div>
            </div>
            <div
              className="p-6 print:p-0"
              dangerouslySetInnerHTML={{ __html: previewTemplate.content }}
            />
          </div>
        </div>
      )}

      {/* Templates List */}
      {isLoading ? (
        <div className="text-center py-12 text-neutral-500">Loading templates...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500">No lease templates yet.</p>
          <p className="text-sm text-neutral-400 mt-1">Create your first template to start generating lease agreements.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-surface border border-border rounded-lg p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-neutral-900">{template.name}</h3>
                    {template.isDefault && <Badge variant="primary" size="sm">Default</Badge>}
                    <Badge variant={template.isActive ? 'success' : 'neutral'} size="sm">
                      {template.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-neutral-500 mt-1">
                    <span>{TEMPLATE_TYPES.find(t => t.value === template.type)?.label || template.type}</span>
                    <span>{template._count.leases} lease(s) generated</span>
                    <span>Updated {new Date(template.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setPreviewTemplate(template)}>
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                    Edit
                  </Button>
                  {!template.isDefault && template._count.leases === 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                      onClick={() => {
                        if (confirm('Delete this template?')) {
                          deleteMutation.mutate(template.id)
                        }
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
