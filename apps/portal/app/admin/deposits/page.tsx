'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatDate } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DeductionItem {
  description: string
  amount: number
  evidenceUrl?: string
}

interface Deposit {
  id: string
  tenantId: string
  leaseId: string
  propertyId: string
  amount: number
  paymentDate: string
  paymentMethod: string
  paymentReference: string | null
  status: string
  deductions: DeductionItem[] | null
  refundAmount: number | null
  refundDate: string | null
  refundReference: string | null
  settlementNotes: string | null
  createdAt: string
  tenant: {
    id: string
    name: string
    email: string
    phone: string
    unit: string | null
  }
  property: {
    id: string
    name: string
    address: string
  }
  lease: {
    id: string
    unit: string | null
    monthlyRent: number
    startDate: string
    endDate: string
    status: string
  }
}

interface DepositsResponse {
  deposits: Deposit[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface TenantOption {
  id: string
  name: string
  email: string
  leases: {
    id: string
    propertyId: string
    unit: string | null
    status: string
    securityDeposit: number
    property: { id: string; name: string }
  }[]
}

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function fetchDeposits(status: string): Promise<DepositsResponse> {
  const params = new URLSearchParams()
  if (status !== 'all') params.set('status', status)
  const res = await fetch(`/api/deposits?${params}`)
  if (!res.ok) throw new Error('Failed to fetch deposits')
  return res.json()
}

async function fetchTenants(): Promise<TenantOption[]> {
  const res = await fetch('/api/tenants?limit=200')
  if (!res.ok) throw new Error('Failed to fetch tenants')
  const data = await res.json()
  // Fetch leases for each tenant that has active leases
  const tenants = data.tenants || []
  // We'll fetch leases separately
  const leasesRes = await fetch('/api/leases?status=ACTIVE&limit=200')
  const leasesData = await leasesRes.json()
  const leases = leasesData.leases || []

  return tenants.map((t: any) => ({
    id: t.id,
    name: t.name,
    email: t.email,
    leases: leases
      .filter((l: any) => l.tenantId === t.id)
      .map((l: any) => ({
        id: l.id,
        propertyId: l.propertyId,
        unit: l.unit || l.unitId,
        status: l.status,
        securityDeposit: Number(l.securityDeposit),
        property: l.property || { id: l.propertyId, name: '' },
      })),
  }))
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusBadgeVariant(status: string) {
  switch (status) {
    case 'HELD':
      return 'primary' as const
    case 'UNDER_REVIEW':
      return 'warning' as const
    case 'REFUNDED':
      return 'success' as const
    case 'PARTIALLY_REFUNDED':
      return 'warning' as const
    case 'FORFEITED':
      return 'danger' as const
    default:
      return 'neutral' as const
  }
}

function formatStatus(status: string) {
  return status.replace(/_/g, ' ')
}

function formatCurrency(amount: number) {
  return `KES ${Number(amount).toLocaleString()}`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DepositsPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('all')
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [showSettleModal, setShowSettleModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null)

  // Fetch deposits
  const { data, isLoading, error } = useQuery({
    queryKey: ['deposits', statusFilter],
    queryFn: () => fetchDeposits(statusFilter),
  })

  const deposits = data?.deposits || []

  // Stats
  const allDepositsQuery = useQuery({
    queryKey: ['deposits', 'all'],
    queryFn: () => fetchDeposits('all'),
  })
  const allDeposits = allDepositsQuery.data?.deposits || []

  const stats = {
    totalHeld: allDeposits
      .filter((d) => d.status === 'HELD')
      .reduce((sum, d) => sum + Number(d.amount), 0),
    heldCount: allDeposits.filter((d) => d.status === 'HELD').length,
    underReview: allDeposits.filter((d) => d.status === 'UNDER_REVIEW').length,
    refunded: allDeposits.filter(
      (d) => d.status === 'REFUNDED' || d.status === 'PARTIALLY_REFUNDED'
    ).length,
    totalValue: allDeposits.reduce((sum, d) => sum + Number(d.amount), 0),
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load deposits. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Security Deposits</h1>
          <p className="text-neutral-600 mt-1">Track and manage tenant security deposits</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowRecordModal(true)}>
          + Record Deposit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface shadow rounded-lg p-6 border border-border">
          <p className="text-sm text-neutral-600">Total Deposits Held</p>
          <p className="text-3xl font-bold text-primary-600">{stats.heldCount}</p>
          <p className="text-sm text-neutral-500 mt-1">{formatCurrency(stats.totalHeld)}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-6 border border-border">
          <p className="text-sm text-neutral-600">Under Review</p>
          <p className="text-3xl font-bold text-warning-600">{stats.underReview}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-6 border border-border">
          <p className="text-sm text-neutral-600">Refunded</p>
          <p className="text-3xl font-bold text-success-600">{stats.refunded}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-6 border border-border">
          <p className="text-sm text-neutral-600">Total Value</p>
          <p className="text-3xl font-bold text-neutral-900">{formatCurrency(stats.totalValue)}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-surface shadow rounded-lg p-4 border border-border">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="min-w-[200px]">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="HELD">Held</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="REFUNDED">Refunded</option>
              <option value="PARTIALLY_REFUNDED">Partially Refunded</option>
              <option value="FORFEITED">Forfeited</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface shadow rounded-lg overflow-hidden border border-border">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                Tenant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                Property / Unit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                Date Received
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-neutral-200">
            {deposits.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                  No deposits found. Click &quot;Record Deposit&quot; to add one.
                </td>
              </tr>
            ) : (
              deposits.map((deposit) => (
                <tr key={deposit.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 text-sm font-medium">
                    <Link
                      href={`/admin/tenants/${deposit.tenant.id}`}
                      className="text-primary-600 hover:text-primary-800 hover:underline"
                    >
                      {deposit.tenant.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link
                      href={`/admin/properties/${deposit.property.id}`}
                      className="text-primary-600 hover:text-primary-800 hover:underline"
                    >
                      {deposit.property.name}
                    </Link>
                    {deposit.lease.unit && (
                      <>
                        <br />
                        <span className="text-neutral-500">Unit {deposit.lease.unit}</span>
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-neutral-900">
                    {formatCurrency(Number(deposit.amount))}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-900">
                    {formatDate(deposit.paymentDate)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={statusBadgeVariant(deposit.status)}>
                      {formatStatus(deposit.status)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      className="text-primary-600 hover:text-primary-800 hover:underline"
                      onClick={() => {
                        setSelectedDeposit(deposit)
                        setShowViewModal(true)
                      }}
                    >
                      View
                    </button>
                    {(deposit.status === 'HELD' || deposit.status === 'UNDER_REVIEW') && (
                      <button
                        className="text-warning-600 hover:text-warning-800 hover:underline"
                        onClick={() => {
                          setSelectedDeposit(deposit)
                          setShowSettleModal(true)
                        }}
                      >
                        Settle
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Record Deposit Modal */}
      <RecordDepositModal
        open={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        onSuccess={() => {
          setShowRecordModal(false)
          queryClient.invalidateQueries({ queryKey: ['deposits'] })
        }}
      />

      {/* Settle Deposit Modal */}
      {selectedDeposit && (
        <SettleDepositModal
          open={showSettleModal}
          onClose={() => {
            setShowSettleModal(false)
            setSelectedDeposit(null)
          }}
          deposit={selectedDeposit}
          onSuccess={() => {
            setShowSettleModal(false)
            setSelectedDeposit(null)
            queryClient.invalidateQueries({ queryKey: ['deposits'] })
          }}
        />
      )}

      {/* View Deposit Modal */}
      {selectedDeposit && (
        <ViewDepositModal
          open={showViewModal}
          onClose={() => {
            setShowViewModal(false)
            setSelectedDeposit(null)
          }}
          deposit={selectedDeposit}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Record Deposit Modal
// ---------------------------------------------------------------------------

function RecordDepositModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [selectedTenantId, setSelectedTenantId] = useState('')
  const [selectedLeaseId, setSelectedLeaseId] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentMethod, setPaymentMethod] = useState('MPESA')
  const [paymentReference, setPaymentReference] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const { data: tenants } = useQuery({
    queryKey: ['tenants-for-deposit'],
    queryFn: fetchTenants,
    enabled: open,
  })

  const selectedTenant = tenants?.find((t) => t.id === selectedTenantId)
  const selectedLease = selectedTenant?.leases.find((l) => l.id === selectedLeaseId)

  // Auto-select first active lease when tenant changes
  const handleTenantChange = (tenantId: string) => {
    setSelectedTenantId(tenantId)
    setSelectedLeaseId('')
    setAmount('')
    const tenant = tenants?.find((t) => t.id === tenantId)
    if (tenant && tenant.leases.length === 1) {
      setSelectedLeaseId(tenant.leases[0].id)
      setAmount(String(tenant.leases[0].securityDeposit || ''))
    }
  }

  const handleLeaseChange = (leaseId: string) => {
    setSelectedLeaseId(leaseId)
    const lease = selectedTenant?.leases.find((l) => l.id === leaseId)
    if (lease) {
      setAmount(String(lease.securityDeposit || ''))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)

    try {
      const lease = selectedTenant?.leases.find((l) => l.id === selectedLeaseId)
      if (!lease) {
        setFormError('Please select a lease')
        setSubmitting(false)
        return
      }

      const res = await fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: selectedTenantId,
          leaseId: selectedLeaseId,
          propertyId: lease.propertyId,
          amount: parseFloat(amount),
          paymentDate,
          paymentMethod,
          paymentReference: paymentReference || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setFormError(data.error || 'Failed to create deposit')
        setSubmitting(false)
        return
      }

      // Reset form
      setSelectedTenantId('')
      setSelectedLeaseId('')
      setAmount('')
      setPaymentDate(new Date().toISOString().split('T')[0])
      setPaymentMethod('MPESA')
      setPaymentReference('')
      onSuccess()
    } catch {
      setFormError('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} className="max-w-xl">
      <ModalHeader>
        <h2 className="text-xl font-semibold text-neutral-900">Record Deposit</h2>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
          &#x2715;
        </button>
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          {formError && (
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-3 text-sm text-danger-700">
              {formError}
            </div>
          )}

          {/* Tenant Select */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Tenant</label>
            <select
              value={selectedTenantId}
              onChange={(e) => handleTenantChange(e.target.value)}
              required
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select tenant...</option>
              {tenants
                ?.filter((t) => t.leases.length > 0)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.email})
                  </option>
                ))}
            </select>
          </div>

          {/* Lease Select */}
          {selectedTenant && selectedTenant.leases.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Lease</label>
              <select
                value={selectedLeaseId}
                onChange={(e) => handleLeaseChange(e.target.value)}
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select lease...</option>
                {selectedTenant.leases.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.property.name} {l.unit ? `- Unit ${l.unit}` : ''} (Deposit:{' '}
                    {formatCurrency(l.securityDeposit)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Amount (KES)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Payment Date</label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="MPESA">M-Pesa</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CASH">Cash</option>
              <option value="CHEQUE">Cheque</option>
              <option value="CARD">Card</option>
            </select>
          </div>

          {/* Payment Reference */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Payment Reference (optional)
            </label>
            <input
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="e.g. M-Pesa transaction code"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Record Deposit'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

// ---------------------------------------------------------------------------
// Settle Deposit Modal
// ---------------------------------------------------------------------------

function SettleDepositModal({
  open,
  onClose,
  deposit,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  deposit: Deposit
  onSuccess: () => void
}) {
  const [deductions, setDeductions] = useState<DeductionItem[]>([])
  const [refundReference, setRefundReference] = useState('')
  const [settlementNotes, setSettlementNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const depositAmount = Number(deposit.amount)
  const totalDeductions = deductions.reduce((sum, d) => sum + (d.amount || 0), 0)
  const refundAmount = Math.max(0, depositAmount - totalDeductions)

  const addDeduction = () => {
    setDeductions([...deductions, { description: '', amount: 0 }])
  }

  const removeDeduction = (index: number) => {
    setDeductions(deductions.filter((_, i) => i !== index))
  }

  const updateDeduction = (index: number, field: keyof DeductionItem, value: string | number) => {
    const updated = [...deductions]
    updated[index] = { ...updated[index], [field]: value }
    setDeductions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    // Validate deductions
    const validDeductions = deductions.filter((d) => d.description && d.amount > 0)
    if (totalDeductions > depositAmount) {
      setFormError('Total deductions cannot exceed deposit amount')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/deposits/${deposit.id}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deductions: validDeductions,
          refundReference: refundReference || undefined,
          settlementNotes: settlementNotes || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setFormError(data.error || 'Failed to settle deposit')
        setSubmitting(false)
        return
      }

      onSuccess()
    } catch {
      setFormError('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} className="max-w-2xl">
      <ModalHeader>
        <h2 className="text-xl font-semibold text-neutral-900">Settle Deposit</h2>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
          &#x2715;
        </button>
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          {formError && (
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-3 text-sm text-danger-700">
              {formError}
            </div>
          )}

          {/* Deposit Info */}
          <div className="bg-neutral-50 rounded-lg p-4 space-y-1">
            <p className="text-sm text-neutral-600">
              Tenant: <span className="font-medium text-neutral-900">{deposit.tenant.name}</span>
            </p>
            <p className="text-sm text-neutral-600">
              Property:{' '}
              <span className="font-medium text-neutral-900">
                {deposit.property.name}
                {deposit.lease.unit && ` - Unit ${deposit.lease.unit}`}
              </span>
            </p>
            <p className="text-sm text-neutral-600">
              Deposit Amount:{' '}
              <span className="font-bold text-neutral-900">{formatCurrency(depositAmount)}</span>
            </p>
          </div>

          {/* Deductions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-neutral-700">Deductions</label>
              <button
                type="button"
                onClick={addDeduction}
                className="text-sm text-primary-600 hover:text-primary-800 hover:underline"
              >
                + Add Deduction
              </button>
            </div>

            {deductions.length === 0 && (
              <p className="text-sm text-neutral-500 italic">
                No deductions. Full deposit will be refunded.
              </p>
            )}

            {deductions.map((deduction, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={deduction.description}
                  onChange={(e) => updateDeduction(index, 'description', e.target.value)}
                  placeholder="Description (e.g. Wall repairs)"
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                />
                <input
                  type="number"
                  value={deduction.amount || ''}
                  onChange={(e) =>
                    updateDeduction(index, 'amount', parseFloat(e.target.value) || 0)
                  }
                  placeholder="Amount"
                  min="0"
                  step="0.01"
                  className="w-32 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeDeduction(index)}
                  className="text-danger-600 hover:text-danger-800 px-2"
                >
                  &#x2715;
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Deposit Amount</span>
              <span className="font-medium">{formatCurrency(depositAmount)}</span>
            </div>
            {totalDeductions > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Total Deductions</span>
                <span className="font-medium text-danger-600">
                  - {formatCurrency(totalDeductions)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold border-t border-border pt-2">
              <span className="text-neutral-900">Refund Amount</span>
              <span className={refundAmount > 0 ? 'text-success-600' : 'text-neutral-900'}>
                {formatCurrency(refundAmount)}
              </span>
            </div>
          </div>

          {/* Refund Reference */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Refund Reference (optional)
            </label>
            <input
              type="text"
              value={refundReference}
              onChange={(e) => setRefundReference(e.target.value)}
              placeholder="e.g. Bank transfer reference"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Settlement Notes */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Settlement Notes (optional)
            </label>
            <textarea
              value={settlementNotes}
              onChange={(e) => setSettlementNotes(e.target.value)}
              rows={3}
              placeholder="Any notes about this settlement..."
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting || totalDeductions > depositAmount}>
            {submitting ? 'Processing...' : 'Settle Deposit'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

// ---------------------------------------------------------------------------
// View Deposit Modal (Receipt / Statement)
// ---------------------------------------------------------------------------

function ViewDepositModal({
  open,
  onClose,
  deposit,
}: {
  open: boolean
  onClose: () => void
  deposit: Deposit
}) {
  const depositAmount = Number(deposit.amount)
  const deductions = (deposit.deductions as DeductionItem[]) || []
  const totalDeductions = deductions.reduce((sum, d) => sum + Number(d.amount), 0)
  const refundAmount = deposit.refundAmount != null ? Number(deposit.refundAmount) : null

  return (
    <Modal open={open} onClose={onClose} className="max-w-xl">
      <ModalHeader>
        <h2 className="text-xl font-semibold text-neutral-900">Deposit Details</h2>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
          &#x2715;
        </button>
      </ModalHeader>
      <ModalBody className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">Status</span>
          <Badge variant={statusBadgeVariant(deposit.status)} size="lg">
            {formatStatus(deposit.status)}
          </Badge>
        </div>

        {/* Deposit Info */}
        <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Tenant</span>
            <span className="font-medium text-neutral-900">{deposit.tenant.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Property</span>
            <span className="font-medium text-neutral-900">{deposit.property.name}</span>
          </div>
          {deposit.lease.unit && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Unit</span>
              <span className="font-medium text-neutral-900">{deposit.lease.unit}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Deposit Amount</span>
            <span className="font-bold text-neutral-900">{formatCurrency(depositAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Date Received</span>
            <span className="font-medium text-neutral-900">{formatDate(deposit.paymentDate)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Payment Method</span>
            <span className="font-medium text-neutral-900">
              {deposit.paymentMethod.replace(/_/g, ' ')}
            </span>
          </div>
          {deposit.paymentReference && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Reference</span>
              <span className="font-medium text-neutral-900">{deposit.paymentReference}</span>
            </div>
          )}
        </div>

        {/* Deductions (if settled) */}
        {deductions.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-neutral-700 mb-2">Deductions</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">
                      Description
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-neutral-500">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {deductions.map((d, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2 text-sm text-neutral-900">{d.description}</td>
                      <td className="px-4 py-2 text-sm text-right text-danger-600">
                        - {formatCurrency(Number(d.amount))}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-neutral-50 font-bold">
                    <td className="px-4 py-2 text-sm text-neutral-900">Total Deductions</td>
                    <td className="px-4 py-2 text-sm text-right text-danger-600">
                      - {formatCurrency(totalDeductions)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Refund Info */}
        {refundAmount !== null && (
          <div className="bg-success-50 border border-success-200 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Refund Amount</span>
              <span className="font-bold text-success-700">{formatCurrency(refundAmount)}</span>
            </div>
            {deposit.refundDate && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Refund Date</span>
                <span className="font-medium text-neutral-900">
                  {formatDate(deposit.refundDate)}
                </span>
              </div>
            )}
            {deposit.refundReference && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Refund Reference</span>
                <span className="font-medium text-neutral-900">{deposit.refundReference}</span>
              </div>
            )}
          </div>
        )}

        {/* Settlement Notes */}
        {deposit.settlementNotes && (
          <div>
            <h3 className="text-sm font-medium text-neutral-700 mb-1">Settlement Notes</h3>
            <p className="text-sm text-neutral-600 bg-neutral-50 rounded-lg p-3">
              {deposit.settlementNotes}
            </p>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  )
}
