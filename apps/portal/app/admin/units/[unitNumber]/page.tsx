'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'

async function fetchLandlords() {
  const res = await fetch('/api/landlords?limit=200')
  if (!res.ok) throw new Error('Failed to load landlords')
  const data = await res.json()
  return (data.landlords ?? data) as { id: string; name: string; email: string }[]
}

const inputCls = 'w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent'
const labelCls = 'block text-sm font-medium text-neutral-700 mb-1'

export default function UnitDetailPage() {
  const { unitNumber } = useParams<{ unitNumber: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showEdit, setShowEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['unit-statement', unitNumber],
    queryFn: async () => {
      const res = await fetch(`/api/units/${unitNumber}/statement`)
      if (!res.ok) throw new Error('Failed to load unit')
      return res.json()
    },
  })

  const { data: landlords = [] } = useQuery({
    queryKey: ['landlords-list'],
    queryFn: fetchLandlords,
    staleTime: 60_000,
  })

  if (isLoading) return <div className="flex justify-center h-64"><LoadingSpinner size="lg" /></div>
  if (error) return <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 text-red-800">Failed to load unit.</div>

  const { unit, summary, transactions, statement, payouts } = data ?? {}
  const rows = transactions ?? statement ?? []

  const openEdit = () => {
    setForm({
      monthlyRent: unit?.monthlyRent ?? unit?.agreedMonthlyRent ?? '',
      serviceCharge: unit?.serviceCharge ?? '',
      serviceChargeType: unit?.serviceChargeType ?? 'FIXED',
      managementFee: unit?.managementFee ?? '',
      managementFeeType: unit?.managementFeeType ?? 'FIXED',
      status: unit?.status ?? 'VACANT',
      bedrooms: unit?.bedrooms ?? '',
      bathrooms: unit?.bathrooms ?? '',
      floor: unit?.floor ?? '',
      sizeSqm: unit?.sizeSqm ?? '',
      description: unit?.description ?? '',
      landlordId: unit?.landlord?.id ?? '',
    })
    setShowEdit(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload: any = {}
      if (form.monthlyRent !== '') payload.monthlyRent = parseFloat(form.monthlyRent)
      if (form.serviceCharge !== '') payload.serviceCharge = parseFloat(form.serviceCharge)
      if (form.serviceChargeType) payload.serviceChargeType = form.serviceChargeType
      if (form.managementFee !== '') payload.managementFee = parseFloat(form.managementFee)
      if (form.managementFeeType) payload.managementFeeType = form.managementFeeType
      if (form.status) payload.status = form.status
      if (form.bedrooms !== '') payload.bedrooms = parseInt(form.bedrooms)
      if (form.bathrooms !== '') payload.bathrooms = parseInt(form.bathrooms)
      if (form.floor !== '') payload.floor = parseInt(form.floor)
      if (form.sizeSqm !== '') payload.sizeSqm = parseFloat(form.sizeSqm)
      if (form.description !== '') payload.description = form.description
      if (form.landlordId) payload.landlordId = form.landlordId

      const res = await fetch(`/api/units/${unitNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to update unit')
        return
      }
      await queryClient.invalidateQueries({ queryKey: ['unit-statement', unitNumber] })
      setShowEdit(false)
    } catch {
      alert('Failed to update unit')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Unit {unit?.unitNumber}</h1>
          <p className="text-neutral-500 mt-1">{unit?.property?.name} · {unit?.property?.address}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            unit?.status === 'OCCUPIED' ? 'bg-success-100 text-success-700' :
            unit?.status === 'MAINTENANCE' ? 'bg-warning-100 text-yellow-700' :
            unit?.status === 'RESERVED' ? 'bg-blue-100 text-blue-700' :
            'bg-neutral-100 text-neutral-600'
          }`}>
            {unit?.status ?? 'VACANT'}
          </span>
          <Button variant="outline" onClick={openEdit}>✏️ Edit</Button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface rounded-lg shadow p-5">
          <p className="text-xs text-neutral-500 uppercase tracking-wide">Monthly Rent</p>
          <p className="text-2xl font-bold text-primary-600 mt-1">
            KES {Number(unit?.agreedMonthlyRent ?? 0).toLocaleString()}
          </p>
          <p className="text-xs text-neutral-400 mt-1">{unit?.bedrooms}bd · {unit?.bathrooms}ba{unit?.floor != null ? ` · Floor ${unit.floor}` : ''}</p>
        </div>
        <div className="bg-surface rounded-lg shadow p-5">
          <p className="text-xs text-neutral-500 uppercase tracking-wide mb-2">Landlord</p>
          {unit?.landlord ? (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <Link href={`/admin/landlords/${unit.landlord.id}`} className="text-base font-semibold text-primary-600 hover:underline">
                    {unit.landlord.name}
                  </Link>
                  <p className="text-xs text-neutral-400">{unit.landlord.email}</p>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                  unit.landlord.type === 'JOINT_OWNERSHIP' ? 'bg-purple-100 text-purple-700' :
                  unit.landlord.type === 'COMPANY' ? 'bg-blue-100 text-blue-700' :
                  'bg-neutral-100 text-neutral-600'
                }`}>
                  {unit.landlord.type === 'JOINT_OWNERSHIP' ? 'Joint' :
                   unit.landlord.type === 'COMPANY' ? 'Company' : 'Individual'}
                </span>
              </div>
              {unit.landlord.members?.length > 0 && (
                <div className="mt-2 pt-2 border-t border-neutral-100">
                  <p className="text-xs text-neutral-500 mb-1">Members</p>
                  {unit.landlord.members.map((m: any) => (
                    <p key={m.id} className="text-xs text-neutral-600">{m.name}{m.ownershipPercent ? ` · ${m.ownershipPercent}%` : ''}</p>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-neutral-400 italic">No landlord assigned</p>
          )}
        </div>
        <div className="bg-surface rounded-lg shadow p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Tenant</p>
            <p className="text-lg font-semibold text-neutral-900 mt-1">{unit?.activeTenant?.name ?? '—'}</p>
            <p className="text-xs text-neutral-400">
              {unit?.activeTenant
                ? `Moved in ${new Date(unit.activeTenant.moveInDate).toLocaleDateString()}`
                : 'No active tenant'}
            </p>
          </div>
          {!unit?.activeTenant && (
            <Button
              variant="primary"
              size="sm"
              className="mt-3 w-full"
              onClick={() => {
                const params = new URLSearchParams()
                if (unit?.property?.id) params.set('propertyId', unit.property.id)
                params.set('unitNumber', unitNumber)
                router.push(`/admin/tenants?${params.toString()}`)
              }}
            >
              + Add Tenant
            </Button>
          )}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="bg-surface rounded-lg shadow p-5">
          <h2 className="font-semibold text-neutral-900 mb-4">Financial Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {summary.totalRentDue !== undefined && (
              <div><p className="text-neutral-500">Rent Due</p><p className="font-bold">KES {Number(summary.totalRentDue).toLocaleString()}</p></div>
            )}
            {summary.totalNetToLandlord !== undefined && (
              <div><p className="text-neutral-500">Net to Landlord</p><p className="font-bold text-success-600">KES {Number(summary.totalNetToLandlord).toLocaleString()}</p></div>
            )}
            {summary.totalPaidToLandlord !== undefined && (
              <div><p className="text-neutral-500">Paid to Landlord</p><p className="font-bold">KES {Number(summary.totalPaidToLandlord).toLocaleString()}</p></div>
            )}
            {summary.outstanding !== undefined && (
              <div><p className="text-neutral-500">Outstanding</p>
                <p className={`font-bold ${summary.outstanding > 0 ? 'text-danger-600' : 'text-success-600'}`}>
                  KES {Number(summary.outstanding).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transactions */}
      {rows.length > 0 && (
        <div className="bg-surface rounded-lg shadow overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100">
            <h2 className="font-semibold text-neutral-900">Transaction History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-100 text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Period</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Rent Due</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Deductions</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Net Payout</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {rows.map((t: any, i: number) => (
                  <tr key={i} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-neutral-900">{t.rentPeriod}</td>
                    <td className="px-4 py-3 text-neutral-700">KES {Number(t.rentDue ?? t.grossRent ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-danger-600">-KES {Number(t.totalDeductions ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-success-600 font-semibold">KES {Number(t.netToLandlord ?? t.netPayout ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        t.payoutStatus === 'PAID' ? 'bg-success-100 text-success-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{t.payoutStatus ?? '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payouts */}
      {payouts?.length > 0 && (
        <div className="bg-surface rounded-lg shadow overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100">
            <h2 className="font-semibold text-neutral-900">Payouts to Landlord</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-100 text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Reference</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Period</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {payouts.map((p: any, i: number) => (
                  <tr key={i} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-mono text-xs text-neutral-600">{p.reference}</td>
                    <td className="px-4 py-3 text-neutral-700">{p.period}</td>
                    <td className="px-4 py-3 font-semibold text-success-600">KES {Number(p.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-neutral-500">{p.method}</td>
                    <td className="px-4 py-3 text-neutral-500">{p.paidDate ? new Date(p.paidDate).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.status === 'PAID' ? 'bg-success-100 text-success-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && form && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-neutral-900">Edit Unit {unitNumber}</h3>
              <button onClick={() => setShowEdit(false)} className="text-neutral-400 hover:text-neutral-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Landlord */}
              <div className="md:col-span-2">
                <label className={labelCls}>Landlord</label>
                <select
                  value={form.landlordId}
                  onChange={e => setForm({ ...form, landlordId: e.target.value })}
                  className={inputCls}
                >
                  <option value="">— No landlord assigned —</option>
                  {landlords.map((l: any) => (
                    <option key={l.id} value={l.id}>
                      {l.name}{l.email ? ` (${l.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Monthly Rent */}
              <div className="md:col-span-2">
                <label className={labelCls}>Monthly Rent (KES)</label>
                <input type="number" min="0" step="1" value={form.monthlyRent}
                  onChange={e => setForm({ ...form, monthlyRent: e.target.value })}
                  className={inputCls} placeholder="e.g. 30000" />
              </div>

              {/* Service Charge */}
              <div>
                <label className={labelCls}>Service Charge</label>
                <div className="flex gap-2">
                  <select value={form.serviceChargeType}
                    onChange={e => setForm({ ...form, serviceChargeType: e.target.value })}
                    className="w-32 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
                    <option value="FIXED">Fixed (KES)</option>
                    <option value="PERCENTAGE">% of Rent</option>
                  </select>
                  <input type="number" min="0" step="1" value={form.serviceCharge}
                    onChange={e => setForm({ ...form, serviceCharge: e.target.value })}
                    className={inputCls} placeholder={form.serviceChargeType === 'FIXED' ? 'e.g. 3000' : 'e.g. 5'} />
                </div>
              </div>

              {/* Management Fee */}
              <div>
                <label className={labelCls}>Management Fee</label>
                <div className="flex gap-2">
                  <select value={form.managementFeeType}
                    onChange={e => setForm({ ...form, managementFeeType: e.target.value })}
                    className="w-32 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
                    <option value="FIXED">Fixed (KES)</option>
                    <option value="PERCENTAGE">% of Rent</option>
                  </select>
                  <input type="number" min="0" step="1" value={form.managementFee}
                    onChange={e => setForm({ ...form, managementFee: e.target.value })}
                    className={inputCls} placeholder={form.managementFeeType === 'FIXED' ? 'e.g. 1500' : 'e.g. 10'} />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className={labelCls}>Status</label>
                <select value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className={inputCls}>
                  <option value="VACANT">Vacant</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="RESERVED">Reserved</option>
                </select>
              </div>

              {/* Floor */}
              <div>
                <label className={labelCls}>Floor</label>
                <input type="number" min="0" value={form.floor}
                  onChange={e => setForm({ ...form, floor: e.target.value })}
                  className={inputCls} placeholder="e.g. 1" />
              </div>

              {/* Bedrooms */}
              <div>
                <label className={labelCls}>Bedrooms</label>
                <input type="number" min="0" value={form.bedrooms}
                  onChange={e => setForm({ ...form, bedrooms: e.target.value })}
                  className={inputCls} placeholder="e.g. 3" />
              </div>

              {/* Bathrooms */}
              <div>
                <label className={labelCls}>Bathrooms</label>
                <input type="number" min="0" value={form.bathrooms}
                  onChange={e => setForm({ ...form, bathrooms: e.target.value })}
                  className={inputCls} placeholder="e.g. 2" />
              </div>

              {/* Size */}
              <div>
                <label className={labelCls}>Size (sqm)</label>
                <input type="number" min="0" step="0.1" value={form.sizeSqm}
                  onChange={e => setForm({ ...form, sizeSqm: e.target.value })}
                  className={inputCls} placeholder="e.g. 85" />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className={labelCls}>Description / Notes</label>
                <textarea rows={3} value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className={inputCls} placeholder="Any additional notes about the unit..." />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowEdit(false)} className="flex-1">Cancel</Button>
              <Button variant="primary" onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
