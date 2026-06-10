'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface Payment {
  id: string;
  amount: string;
  type: string;
  method: string;
  status: string;
  dueDate: string;
  paidDate?: string;
  reference?: string;
  tenant: { id: string; name: string; email: string };
  lease: {
    id: string;
    property: { id: string; name: string };
    unitRef?: { id: string; unitNumber: string } | null;
  };
}

const EMPTY_FORM = {
  tenantId: '',
  leaseId: '',
  amount: '',
  type: 'RENT' as const,
  method: 'MPESA' as const,
  status: 'PAID' as const,
  dueDate: new Date().toISOString().split('T')[0],
  paidDate: new Date().toISOString().split('T')[0],
  reference: '',
  notes: '',
};

export default function RentPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [timePeriod, setTimePeriod] = useState<string>('current');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Receipt actions
  const [sendingReceipt, setSendingReceipt] = useState<string | null>(null);
  const [sentReceipts, setSentReceipts] = useState<Set<string>>(new Set());

  const handleSendReceipt = async (paymentId: string) => {
    setSendingReceipt(paymentId);
    try {
      const res = await fetch(`/api/payments/${paymentId}/receipt`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to send receipt');
      } else {
        setSentReceipts(prev => new Set(prev).add(paymentId));
        setTimeout(() => setSentReceipts(prev => { const s = new Set(prev); s.delete(paymentId); return s; }), 3000);
      }
    } finally {
      setSendingReceipt(null);
    }
  };

  // Record Payment modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [tenantsList, setTenantsList] = useState<{ id: string; name: string; email: string }[]>([]);
  const [leasesList, setLeasesList] = useState<{ id: string; startDate: string; endDate: string; monthlyRent: number; property: { name: string }; unit: string | null }[]>([]);
  const [loadingLeases, setLoadingLeases] = useState(false);

  const refreshPayments = () => {
    setIsLoading(true);
    fetch('/api/payments?type=RENT&limit=200')
      .then(r => r.json())
      .then(data => { setPayments(data.payments || []); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => { refreshPayments(); }, []);

  // Load tenants when modal opens
  useEffect(() => {
    if (!showModal) return;
    fetch('/api/tenants?status=ACTIVE&limit=200')
      .then(r => r.json())
      .then(data => setTenantsList(data.tenants || []));
  }, [showModal]);

  // Load leases when tenant is selected
  useEffect(() => {
    if (!form.tenantId) { setLeasesList([]); return; }
    setLoadingLeases(true);
    fetch(`/api/leases?tenantId=${form.tenantId}&limit=20`)
      .then(r => r.json())
      .then(data => {
        const leases = (data.leases || []).map((l: any) => ({
          id: l.id,
          startDate: l.startDate,
          endDate: l.endDate,
          monthlyRent: Number(l.monthlyRent),
          property: l.property,
          unit: l.unit ?? l.unitRef?.unitNumber ?? null,
        }));
        setLeasesList(leases);
        // Auto-select first lease and pre-fill amount
        if (leases.length === 1) {
          setForm(f => ({ ...f, leaseId: leases[0].id, amount: String(leases[0].monthlyRent || '') }));
        }
      })
      .finally(() => setLoadingLeases(false));
  }, [form.tenantId]);

  const handleLeaseChange = (leaseId: string) => {
    const lease = leasesList.find(l => l.id === leaseId);
    setForm(f => ({ ...f, leaseId, amount: lease ? String(lease.monthlyRent) : f.amount }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tenantId || !form.leaseId || !form.amount) return;
    setSaving(true);
    try {
      const body: any = {
        tenantId: form.tenantId,
        leaseId: form.leaseId,
        amount: parseFloat(form.amount),
        type: form.type,
        method: form.method,
        status: form.status,
        dueDate: form.dueDate,
      };
      if (form.status === 'PAID' && form.paidDate) body.paidDate = form.paidDate;
      if (form.reference) body.reference = form.reference;
      if (form.notes) body.notes = form.notes;

      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to record payment');
        return;
      }
      setShowModal(false);
      setForm({ ...EMPTY_FORM });
      refreshPayments();
    } finally {
      setSaving(false);
    }
  };

  // Filter by time period
  const getDateRange = () => {
    const now = new Date();
    switch (timePeriod) {
      case 'current': {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { start, end };
      }
      case 'last30': {
        const start = new Date(now);
        start.setDate(start.getDate() - 30);
        return { start, end: now };
      }
      case 'last90': {
        const start = new Date(now);
        start.setDate(start.getDate() - 90);
        return { start, end: now };
      }
      case 'custom': {
        if (customStartDate && customEndDate) {
          return { start: new Date(customStartDate), end: new Date(customEndDate) };
        }
        return null;
      }
      default: return null;
    }
  };

  const dateRange = getDateRange();
  const filteredPayments = payments.filter(p => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    if (!matchesStatus) return false;
    if (dateRange) {
      const due = new Date(p.dueDate);
      return due >= dateRange.start && due <= dateRange.end;
    }
    return true;
  });

  const stats = {
    totalPayments: filteredPayments.length,
    paidAmount: filteredPayments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + Number(p.amount), 0),
    pendingAmount: filteredPayments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + Number(p.amount), 0),
    overdueAmount: filteredPayments.filter(p => p.status === 'OVERDUE').reduce((sum, p) => sum + Number(p.amount), 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-success-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE': return 'bg-danger-100 text-red-800';
      case 'PARTIAL': return 'bg-primary-100 text-primary-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const formatMethod = (method: string) => {
    switch (method) {
      case 'MPESA': return 'M-PESA';
      case 'BANK_TRANSFER': return 'Bank Transfer';
      case 'CASH': return 'Cash';
      case 'CHEQUE': return 'Cheque';
      default: return method;
    }
  };

  const inputCls = 'w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent';
  const labelCls = 'block text-sm font-medium text-neutral-700 mb-1';

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>;
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-neutral-900'>Rent Payments</h1>
          <p className='text-neutral-600 mt-1'>Track and manage rent payment transactions</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowModal(true)}>+ Record Payment</Button>
      </div>

      {/* Stats Cards — clickable to filter */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        {[
          { label: 'Total Payments', value: stats.totalPayments, display: stats.totalPayments.toString(), filter: 'all', color: 'text-neutral-900' },
          { label: 'Collected', value: stats.paidAmount, display: `KES ${stats.paidAmount.toLocaleString()}`, filter: 'PAID', color: 'text-success-600' },
          { label: 'Pending', value: stats.pendingAmount, display: `KES ${stats.pendingAmount.toLocaleString()}`, filter: 'PENDING', color: 'text-yellow-600' },
          { label: 'Overdue', value: stats.overdueAmount, display: `KES ${stats.overdueAmount.toLocaleString()}`, filter: 'OVERDUE', color: 'text-danger-600' },
        ].map(card => (
          <button
            key={card.filter}
            onClick={() => setFilterStatus(filterStatus === card.filter ? 'all' : card.filter)}
            className={`bg-surface shadow rounded-lg p-6 text-left transition-all hover:shadow-md hover:border hover:border-primary-200 ${filterStatus === card.filter ? 'ring-2 ring-primary-500' : ''}`}
          >
            <p className='text-sm text-neutral-600'>{card.label}</p>
            <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.display}</p>
            {filterStatus === card.filter && (
              <p className='text-xs text-primary-500 mt-1'>Filtered ↑ click to clear</p>
            )}
          </button>
        ))}
      </div>

      {/* Filter */}
      <div className='bg-surface shadow rounded-lg p-4 space-y-4'>
        <div className='flex flex-wrap gap-4 items-end'>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Time Period</label>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500'
            >
              <option value='current'>Current Month</option>
              <option value='last30'>Last 30 Days</option>
              <option value='last90'>Last 90 Days</option>
              <option value='all'>All Time</option>
              <option value='custom'>Custom Range</option>
            </select>
          </div>

          {timePeriod === 'custom' && (
            <>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-neutral-700 mb-2">Start Date</label>
                <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-neutral-700 mb-2">End Date</label>
                <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
            </>
          )}

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Payment Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500'>
              <option value='all'>All Payments</option>
              <option value='PAID'>Paid</option>
              <option value='PENDING'>Pending</option>
              <option value='OVERDUE'>Overdue</option>
              <option value='PARTIAL'>Partial</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className='bg-surface shadow rounded-lg overflow-hidden'>
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500">No rent payments found for this period</p>
          </div>
        ) : (
          <table className='min-w-full divide-y divide-neutral-200'>
            <thead className='bg-neutral-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>Tenant</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>Property/Unit</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>Amount</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>Due Date</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>Paid Date</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>Method</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>Status</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>Receipt</th>
              </tr>
            </thead>
            <tbody className='bg-surface divide-y divide-neutral-200'>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className='hover:bg-neutral-50'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <Link href={`/admin/tenants/${payment.tenant.id}`} className='text-sm font-medium text-primary-600 hover:text-primary-800 hover:underline'>
                      {payment.tenant.name}
                    </Link>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm'>
                      <Link href={`/admin/properties/${payment.lease.property.id}`} className="text-primary-600 hover:text-primary-800 hover:underline">
                        {payment.lease.property.name}
                      </Link>
                    </div>
                    {payment.lease.unitRef && (
                      <div className='text-sm text-neutral-500'>Unit {payment.lease.unitRef.unitNumber}</div>
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-semibold text-neutral-900'>
                    KES {Number(payment.amount).toLocaleString()}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-neutral-900'>{formatDate(payment.dueDate)}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-neutral-900'>
                    {payment.paidDate ? formatDate(payment.paidDate) : <span className='text-neutral-400'>—</span>}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-neutral-900'>
                    {formatMethod(payment.method)}
                    {payment.reference && <div className='text-xs text-neutral-500'>{payment.reference}</div>}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center gap-2'>
                      <a
                        href={`/api/payments/${payment.id}/receipt`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-xs px-2 py-1 rounded border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-colors'
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleSendReceipt(payment.id)}
                        disabled={sendingReceipt === payment.id}
                        className={`text-xs px-2 py-1 rounded border transition-colors ${
                          sentReceipts.has(payment.id)
                            ? 'border-success-400 text-green-700 bg-success-50'
                            : 'border-primary-300 text-primary-700 hover:bg-primary-50'
                        }`}
                      >
                        {sendingReceipt === payment.id ? 'Sending…' : sentReceipts.has(payment.id) ? 'Sent ✓' : 'Send'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Record Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100">
              <h2 className="text-xl font-bold text-neutral-900">Record Payment</h2>
              <button onClick={() => { setShowModal(false); setForm({ ...EMPTY_FORM }); }} className="text-neutral-400 hover:text-neutral-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Tenant */}
              <div>
                <label className={labelCls}>Tenant <span className="text-danger-600">*</span></label>
                <select required value={form.tenantId}
                  onChange={e => setForm(f => ({ ...f, tenantId: e.target.value, leaseId: '', amount: '' }))}
                  className={inputCls}>
                  <option value="">— Select tenant —</option>
                  {tenantsList.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                  ))}
                </select>
              </div>

              {/* Lease */}
              <div>
                <label className={labelCls}>Lease <span className="text-danger-600">*</span></label>
                <select required value={form.leaseId}
                  onChange={e => handleLeaseChange(e.target.value)}
                  disabled={!form.tenantId || loadingLeases}
                  className={inputCls}>
                  <option value="">{loadingLeases ? 'Loading leases…' : '— Select lease —'}</option>
                  {leasesList.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.property?.name}{l.unit ? ` · Unit ${l.unit}` : ''} — KES {l.monthlyRent.toLocaleString()}/mo
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Amount */}
                <div>
                  <label className={labelCls}>Amount (KES) <span className="text-danger-600">*</span></label>
                  <input required type="number" min="1" step="1" value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className={inputCls} placeholder="e.g. 30000" />
                </div>

                {/* Type */}
                <div>
                  <label className={labelCls}>Payment Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))} className={inputCls}>
                    <option value="RENT">Rent</option>
                    <option value="DEPOSIT">Deposit</option>
                    <option value="LATE_FEE">Late Fee</option>
                    <option value="UTILITY">Utility</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Method */}
                <div>
                  <label className={labelCls}>Payment Method <span className="text-danger-600">*</span></label>
                  <select required value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value as any }))} className={inputCls}>
                    <option value="MPESA">M-PESA</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CARD">Card</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className={labelCls}>Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))} className={inputCls}>
                    <option value="PAID">Paid</option>
                    <option value="PENDING">Pending</option>
                    <option value="OVERDUE">Overdue</option>
                    <option value="PARTIAL">Partial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Due Date */}
                <div>
                  <label className={labelCls}>Due Date <span className="text-danger-600">*</span></label>
                  <input required type="date" value={form.dueDate}
                    onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className={inputCls} />
                </div>

                {/* Paid Date */}
                {form.status === 'PAID' && (
                  <div>
                    <label className={labelCls}>Paid Date</label>
                    <input type="date" value={form.paidDate}
                      onChange={e => setForm(f => ({ ...f, paidDate: e.target.value }))} className={inputCls} />
                  </div>
                )}
              </div>

              {/* Reference */}
              <div>
                <label className={labelCls}>Reference / Transaction ID</label>
                <input type="text" value={form.reference}
                  onChange={e => setForm(f => ({ ...f, reference: e.target.value }))}
                  className={inputCls} placeholder="e.g. MPESA code, bank ref" />
              </div>

              {/* Notes */}
              <div>
                <label className={labelCls}>Notes</label>
                <textarea rows={2} value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className={inputCls} placeholder="Any additional notes…" />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1"
                  onClick={() => { setShowModal(false); setForm({ ...EMPTY_FORM }); }}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1" disabled={saving}>
                  {saving ? 'Saving…' : 'Record Payment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
