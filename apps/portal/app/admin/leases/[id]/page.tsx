'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

export default function LeaseDetailPage({ params }: Props) {
  const router = useRouter()
  const [leaseId, setLeaseId] = useState<string | null>(null)
  const [lease, setLease] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    monthlyRent: '', securityDeposit: '', status: '', terms: '',
  })

  useEffect(() => { params.then(p => setLeaseId(p.id)) }, [params])

  useEffect(() => {
    if (!leaseId) return
    fetch(`/api/leases/${leaseId}`)
      .then(r => r.json())
      .then(data => { setLease(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [leaseId])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>
  }

  if (!lease) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-neutral-500 text-lg">Lease not found</p>
          <Button onClick={() => router.push('/admin/leases')} className="mt-4">Back to Leases</Button>
        </div>
      </div>
    )
  }

  const handleEditClick = () => {
    setEditForm({
      monthlyRent: String(lease.monthlyRent || ''),
      securityDeposit: String(lease.securityDeposit || ''),
      status: lease.status || 'ACTIVE',
      terms: lease.terms || '',
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/leases/${leaseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyRent: parseFloat(editForm.monthlyRent) || undefined,
          securityDeposit: parseFloat(editForm.securityDeposit) || undefined,
          status: editForm.status,
          terms: editForm.terms || undefined,
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        setLease(updated)
        setShowEditModal(false)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to save')
      }
    } catch { alert('Failed to save') }
    finally { setSaving(false) }
  }

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'
  const formatCurrency = (n: number) => `KES ${Number(n).toLocaleString()}`

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-success-50 text-success-700'
      case 'EXPIRED': return 'bg-neutral-100 text-neutral-700'
      case 'TERMINATED': return 'bg-danger-50 text-danger-700'
      case 'PENDING': return 'bg-yellow-50 text-yellow-700'
      default: return 'bg-neutral-100 text-neutral-700'
    }
  }

  const startDate = new Date(lease.startDate)
  const endDate = new Date(lease.endDate)
  const totalMonths = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
  const now = new Date()
  const elapsedMonths = Math.max(0, Math.round((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)))
  const progressPercent = Math.min(100, Math.round((elapsedMonths / totalMonths) * 100))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface rounded-lg border border-neutral-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-neutral-900">
                Lease — {lease.unit || lease.property?.name || 'Unknown'}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lease.status)}`}>
                {lease.status}
              </span>
            </div>
            <p className="text-neutral-500">{lease.property?.name} • {lease.property?.address}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEditClick}>✏️ Edit</Button>
            <Link href={`/admin/leases/${leaseId}/document`}>
              <Button variant="outline">📄 Document</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface rounded-lg border border-neutral-200 p-5">
          <p className="text-sm text-neutral-600">Monthly Rent</p>
          <p className="text-2xl font-bold text-primary-600 mt-1">{formatCurrency(lease.monthlyRent)}</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-5">
          <p className="text-sm text-neutral-600">Security Deposit</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{formatCurrency(lease.securityDeposit)}</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-5">
          <p className="text-sm text-neutral-600">Lease Term</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{totalMonths} months</p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-5">
          <p className="text-sm text-neutral-600">Progress</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{progressPercent}%</p>
          <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
            <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lease Details */}
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <h3 className="font-semibold text-neutral-900 mb-4">Lease Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-neutral-600">Start Date</span>
              <span className="font-medium">{formatDate(lease.startDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">End Date</span>
              <span className="font-medium">{formatDate(lease.endDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Unit</span>
              <span className="font-medium">{lease.unit || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Notice Period</span>
              <span className="font-medium">{lease.noticePeriod || 1} month{(lease.noticePeriod || 1) !== 1 ? 's' : ''}</span>
            </div>
            {lease.rentEscalation > 0 && (
              <div className="flex justify-between">
                <span className="text-neutral-600">Rent Escalation</span>
                <span className="font-medium">{lease.rentEscalation}%</span>
              </div>
            )}
            {lease.terms && (
              <div className="pt-3 border-t border-neutral-200">
                <p className="text-sm text-neutral-600 mb-1">Special Terms</p>
                <p className="text-sm text-neutral-900">{lease.terms}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tenant Details */}
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <h3 className="font-semibold text-neutral-900 mb-4">Tenant</h3>
          {lease.tenant ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-600">Name</span>
                <Link href={`/admin/tenants/${lease.tenant.id}`} className="font-medium text-primary-600 hover:underline">{lease.tenant.name}</Link>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Email</span>
                <span className="font-medium">{lease.tenant.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Phone</span>
                <span className="font-medium">{lease.tenant.phone}</span>
              </div>
              {lease.tenant.idNumber && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">ID Number</span>
                  <span className="font-medium">{lease.tenant.idNumber}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-neutral-500">No tenant assigned</p>
          )}
        </div>
      </div>

      {/* Property Details */}
      {lease.property && (
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <h3 className="font-semibold text-neutral-900 mb-4">Property</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-neutral-600">Name</p>
              <Link href={`/admin/properties/${lease.property.id}`} className="font-medium text-primary-600 hover:underline">{lease.property.name}</Link>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Address</p>
              <p className="font-medium">{lease.property.address}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Type</p>
              <p className="font-medium">{lease.property.type}</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">Edit Lease</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Monthly Rent (KES)</label>
                <input type="number" value={editForm.monthlyRent} onChange={(e) => setEditForm(prev => ({ ...prev, monthlyRent: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Security Deposit (KES)</label>
                <input type="number" value={editForm.securityDeposit} onChange={(e) => setEditForm(prev => ({ ...prev, securityDeposit: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                <select value={editForm.status} onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm">
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="TERMINATED">Terminated</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Special Terms</label>
                <textarea value={editForm.terms} onChange={(e) => setEditForm(prev => ({ ...prev, terms: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" rows={3} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">Cancel</Button>
              <Button variant="primary" onClick={handleSaveEdit} disabled={saving} className="flex-1">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
