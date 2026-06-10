'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TimeFilter } from '@/components/shared/TimeFilter';
import { formatDate } from '@/lib/utils';

interface Payout {
  id: string;
  amount: string;
  period: string;
  status: string;
  method: string;
  reference?: string;
  paidDate?: string;
  createdAt: string;
  landlord: { id: string; name: string; email: string; bankName?: string; bankAccount?: string };
  unit: { id: string; unitNumber: string; property: { id: string; name: string } } | null;
}

const now = new Date();
const DEFAULT_PERIOD = now.toLocaleString('default', { month: 'long', year: 'numeric' });

const EMPTY_FORM = {
  landlordId: '',
  unitId: '',
  amount: '',
  period: DEFAULT_PERIOD,
  method: 'BANK_TRANSFER' as const,
  status: 'PAID' as const,
  paidDate: now.toISOString().split('T')[0],
  reference: '',
  notes: '',
};

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [timePeriod, setTimePeriod] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('Process Payout');
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [landlordsList, setLandlordsList] = useState<{ id: string; name: string; bankName?: string; bankAccount?: string }[]>([]);
  const [unitsList, setUnitsList] = useState<{ id: string; unitNumber: string; monthlyRent: number; managementFee: number; managementFeeType: string; serviceCharge: number; property: { name: string } }[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  const refreshPayouts = () => {
    setIsLoading(true);
    fetch('/api/payouts?limit=200')
      .then(r => r.json())
      .then(data => { setPayouts(data.payouts || []); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => { refreshPayouts(); }, []);

  // Load landlords when modal opens
  useEffect(() => {
    if (!showModal) return;
    fetch('/api/landlords?limit=200')
      .then(r => r.json())
      .then(data => setLandlordsList((data.landlords || []).map((l: any) => ({
        id: l.id, name: l.name, bankName: l.bankName, bankAccount: l.bankAccount,
      }))));
  }, [showModal]);

  // Load units when landlord changes
  useEffect(() => {
    if (!form.landlordId) { setUnitsList([]); return; }
    setLoadingUnits(true);
    fetch(`/api/units?landlordId=${form.landlordId}&limit=100`)
      .then(r => r.json())
      .then(data => {
        const units = (data.units || []).map((u: any) => ({
          id: u.id,
          unitNumber: u.unitNumber,
          monthlyRent: Number(u.monthlyRent ?? 0),
          managementFee: Number(u.managementFee ?? 0),
          managementFeeType: u.managementFeeType ?? 'FIXED',
          serviceCharge: Number(u.serviceCharge ?? 0),
          property: u.property,
        }));
        setUnitsList(units);
        if (units.length === 1) setForm(f => ({ ...f, unitId: units[0].id, amount: computeNet(units[0]) }));
      })
      .finally(() => setLoadingUnits(false));
  }, [form.landlordId]);

  const computeNet = (unit: typeof unitsList[0]) => {
    const mgmtFee = unit.managementFeeType === 'PERCENTAGE'
      ? (unit.monthlyRent * unit.managementFee) / 100
      : unit.managementFee;
    return String(Math.max(0, unit.monthlyRent - mgmtFee - unit.serviceCharge));
  };

  const handleUnitChange = (unitId: string) => {
    const unit = unitsList.find(u => u.id === unitId);
    setForm(f => ({ ...f, unitId, amount: unit ? computeNet(unit) : f.amount }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.landlordId || !form.unitId || !form.amount) return;
    setSaving(true);
    try {
      const body: any = {
        landlordId: form.landlordId,
        unitId: form.unitId,
        amount: parseFloat(form.amount),
        period: form.period,
        method: form.method,
        status: form.status,
      };
      if (form.status === 'PAID' && form.paidDate) body.paidDate = form.paidDate;
      if (form.reference) body.reference = form.reference;
      if (form.notes) body.notes = form.notes;

      const res = await fetch('/api/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to process payout');
        return;
      }
      setShowModal(false);
      setForm({ ...EMPTY_FORM });
      refreshPayouts();
    } finally {
      setSaving(false);
    }
  };

  // Date range filtering
  const getDateRange = () => {
    const now = new Date();
    switch (timePeriod) {
      case 'current': {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { start, end };
      }
      case 'last30': { const start = new Date(now); start.setDate(start.getDate() - 30); return { start, end: now }; }
      case 'last90': { const start = new Date(now); start.setDate(start.getDate() - 90); return { start, end: now }; }
      case 'custom': {
        if (customStartDate && customEndDate) return { start: new Date(customStartDate), end: new Date(customEndDate) };
        return null;
      }
      default: return null;
    }
  };

  const dateRange = getDateRange();
  const filteredPayouts = payouts.filter(p => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    if (!matchesStatus) return false;
    if (dateRange) {
      const created = new Date(p.createdAt);
      return created >= dateRange.start && created <= dateRange.end;
    }
    return true;
  });

  const stats = {
    totalPending: filteredPayouts.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + Number(p.amount), 0),
    totalPaid: filteredPayouts.filter(p => p.status === 'PAID').reduce((sum, p) => sum + Number(p.amount), 0),
    pendingCount: filteredPayouts.filter(p => p.status === 'PENDING').length,
    totalCount: filteredPayouts.length,
    totalValue: filteredPayouts.reduce((sum, p) => sum + Number(p.amount), 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-primary-100 text-primary-800';
      case 'PAID': return 'bg-success-100 text-green-800';
      case 'FAILED': return 'bg-danger-100 text-red-800';
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

  const selectedLandlord = landlordsList.find(l => l.id === form.landlordId);

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
          <h1 className='text-3xl font-bold text-neutral-900'>Landlord Payouts</h1>
          <p className='text-neutral-600 mt-1'>Manage payout schedules and track commission deductions</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="lg" onClick={() => { setForm({ ...EMPTY_FORM, status: 'PAID' }); setModalTitle('Record Payout'); setShowModal(true); }}>
            + Record Payout
          </Button>
          <Button variant="primary" size="lg" onClick={() => { setForm({ ...EMPTY_FORM, status: 'PENDING' }); setModalTitle('Process Payout'); setShowModal(true); }}>
            + Process Payout
          </Button>
        </div>
      </div>

      {/* Stat Cards — clickable to filter */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        {[
          { label: 'Pending Payouts', display: `KES ${stats.totalPending.toLocaleString()}`, sub: `${stats.pendingCount} payouts`, filter: 'PENDING', color: 'text-yellow-600' },
          { label: 'Total Paid', display: `KES ${stats.totalPaid.toLocaleString()}`, sub: null, filter: 'PAID', color: 'text-success-600' },
          { label: 'All Payouts', display: String(stats.totalCount), sub: null, filter: 'all', color: 'text-primary-600' },
          { label: 'Total Value', display: `KES ${stats.totalValue.toLocaleString()}`, sub: null, filter: 'all', color: 'text-primary-600' },
        ].map((card, i) => (
          <button
            key={i}
            onClick={() => setFilterStatus(filterStatus === card.filter && card.filter !== 'all' ? 'all' : card.filter)}
            className={`bg-surface shadow rounded-lg p-6 text-left transition-all hover:shadow-md hover:border hover:border-primary-200 ${filterStatus === card.filter && card.filter !== 'all' ? 'ring-2 ring-primary-500' : ''}`}
          >
            <p className='text-sm text-neutral-600'>{card.label}</p>
            <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.display}</p>
            {card.sub && <p className='text-xs text-neutral-500 mt-1'>{card.sub}</p>}
            {filterStatus === card.filter && card.filter !== 'all' && (
              <p className='text-xs text-primary-500 mt-1'>Filtered ↑ click to clear</p>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className='bg-surface shadow rounded-lg p-4 space-y-4'>
        <div className='flex flex-wrap gap-4 items-end'>
          <TimeFilter
            timePeriod={timePeriod}
            setTimePeriod={setTimePeriod}
            customStartDate={customStartDate}
            setCustomStartDate={setCustomStartDate}
            customEndDate={customEndDate}
            setCustomEndDate={setCustomEndDate}
          />
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500'>
              <option value='all'>All Status</option>
              <option value='PENDING'>Pending</option>
              <option value='PROCESSING'>Processing</option>
              <option value='PAID'>Paid</option>
              <option value='FAILED'>Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='bg-surface shadow rounded-lg overflow-hidden'>
        {filteredPayouts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500">No payouts found</p>
          </div>
        ) : (
          <table className='min-w-full divide-y divide-neutral-200'>
            <thead className='bg-neutral-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>Landlord</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>Property / Unit</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>Period</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>Amount</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>Method</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>Paid Date</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>Status</th>
              </tr>
            </thead>
            <tbody className='bg-surface divide-y divide-neutral-200'>
              {filteredPayouts.map((payout) => (
                <tr key={payout.id} className='hover:bg-neutral-50'>
                  <td className='px-6 py-4 text-sm font-medium'>
                    <Link href={`/admin/landlords/${payout.landlord.id}`} className='text-primary-600 hover:text-primary-800 hover:underline'>
                      {payout.landlord.name}
                    </Link>
                    {payout.landlord.bankAccount && (
                      <div className='text-xs text-neutral-400'>{payout.landlord.bankName} · {payout.landlord.bankAccount}</div>
                    )}
                  </td>
                  <td className='px-6 py-4 text-sm'>
                    {payout.unit ? (
                      <>
                        <Link href={`/admin/properties/${payout.unit.property.id}`} className="text-primary-600 hover:text-primary-800 hover:underline">
                          {payout.unit.property.name}
                        </Link>
                        <div className='text-xs text-neutral-500'>Unit {payout.unit.unitNumber}</div>
                      </>
                    ) : <span className='text-neutral-400'>—</span>}
                  </td>
                  <td className='px-6 py-4 text-sm text-neutral-900'>{payout.period}</td>
                  <td className='px-6 py-4 text-sm font-semibold text-neutral-900'>KES {Number(payout.amount).toLocaleString()}</td>
                  <td className='px-6 py-4 text-sm text-neutral-900'>
                    {formatMethod(payout.method)}
                    {payout.reference && <div className='text-xs text-neutral-500'>{payout.reference}</div>}
                  </td>
                  <td className='px-6 py-4 text-sm text-neutral-900'>
                    {payout.paidDate ? formatDate(payout.paidDate) : <span className='text-neutral-400'>—</span>}
                  </td>
                  <td className='px-6 py-4'>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payout.status)}`}>
                      {payout.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Process Payout Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100">
              <h2 className="text-xl font-bold text-neutral-900">{modalTitle}</h2>
              <button onClick={() => { setShowModal(false); setForm({ ...EMPTY_FORM }); }} className="text-neutral-400 hover:text-neutral-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Landlord */}
              <div>
                <label className={labelCls}>Landlord <span className="text-danger-600">*</span></label>
                <select required value={form.landlordId}
                  onChange={e => setForm(f => ({ ...f, landlordId: e.target.value, unitId: '', amount: '' }))}
                  className={inputCls}>
                  <option value="">— Select landlord —</option>
                  {landlordsList.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
                {selectedLandlord?.bankAccount && (
                  <p className="text-xs text-neutral-500 mt-1">
                    {selectedLandlord.bankName} · {selectedLandlord.bankAccount}
                  </p>
                )}
              </div>

              {/* Unit */}
              <div>
                <label className={labelCls}>Unit <span className="text-danger-600">*</span></label>
                <select required value={form.unitId}
                  onChange={e => handleUnitChange(e.target.value)}
                  disabled={!form.landlordId || loadingUnits}
                  className={inputCls}>
                  <option value="">{loadingUnits ? 'Loading units…' : '— Select unit —'}</option>
                  {unitsList.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.property?.name} · Unit {u.unitNumber} — KES {u.monthlyRent.toLocaleString()}/mo
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Amount */}
                <div>
                  <label className={labelCls}>Net Amount (KES) <span className="text-danger-600">*</span></label>
                  <input required type="number" min="1" step="1" value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className={inputCls} placeholder="e.g. 27000" />
                </div>

                {/* Period */}
                <div>
                  <label className={labelCls}>Period <span className="text-danger-600">*</span></label>
                  <input required type="text" value={form.period}
                    onChange={e => setForm(f => ({ ...f, period: e.target.value }))}
                    className={inputCls} placeholder="e.g. June 2026" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Method */}
                <div>
                  <label className={labelCls}>Payment Method <span className="text-danger-600">*</span></label>
                  <select required value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value as any }))} className={inputCls}>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="MPESA">M-PESA</option>
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className={labelCls}>Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))} className={inputCls}>
                    <option value="PAID">Paid</option>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                  </select>
                </div>
              </div>

              {/* Paid Date */}
              {form.status === 'PAID' && (
                <div>
                  <label className={labelCls}>Paid Date</label>
                  <input type="date" value={form.paidDate}
                    onChange={e => setForm(f => ({ ...f, paidDate: e.target.value }))} className={inputCls} />
                </div>
              )}

              {/* Reference */}
              <div>
                <label className={labelCls}>Reference / Transaction ID</label>
                <input type="text" value={form.reference}
                  onChange={e => setForm(f => ({ ...f, reference: e.target.value }))}
                  className={inputCls} placeholder="e.g. bank ref, M-PESA code" />
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
                  {saving ? 'Saving…' : modalTitle}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
