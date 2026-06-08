'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';

// ── Types ────────────────────────────────────────────────────────

interface ContactAttempt {
  date: string;
  method: string;
  outcome: string;
  notes?: string;
}

interface ArrearsRecord {
  id: string;
  leaseId: string;
  tenantId: string;
  propertyId: string;
  rentAmount: number;
  amountOwed: number;
  daysOverdue: number;
  penaltyPerDay: number | null;
  penaltyAccrued: number;
  currentStep: string;
  reminderSentAt: string | null;
  notice1SentAt: string | null;
  landlordNotifiedDay6At: string | null;
  phoneCallAt: string | null;
  phoneCallNotes: string | null;
  notice2SentAt: string | null;
  landlordNotifiedAt: string | null;
  formalNoticeAt: string | null;
  legalReferralAt: string | null;
  contactAttempts: ContactAttempt[] | null;
  lastContactAt: string | null;
  paymentPromisedDate: string | null;
  paymentPromisedAmount: number | null;
  unreachable: boolean;
  unreachableSince: string | null;
  suspectedAbandonment: boolean;
  abandonmentFlaggedAt: string | null;
  resolvedAt: string | null;
  resolution: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tenant: { id: string; name: string; email: string; phone: string };
  property: { id: string; name: string; address: string };
  lease: {
    id: string;
    monthlyRent: number;
    unitRef?: { id: string; unitNumber: string } | null;
  };
}

interface Summary {
  totalOverdue: number;
  amountAtRisk: number;
  avgDaysOverdue: number;
  legalCases: number;
}

interface Pipeline {
  REMINDER_SENT: number;
  OVERDUE_NOTICE_1: number;
  PHONE_CALL: number;
  OVERDUE_NOTICE_2: number;
  FORMAL_NOTICE: number;
  LEGAL_REFERRAL: number;
}

// ── Step helpers ─────────────────────────────────────────────────

const STEP_LABELS: Record<string, string> = {
  REMINDER_SENT: 'Reminder Sent',
  OVERDUE_NOTICE_1: 'Notice #1',
  PHONE_CALL: 'Phone Call',
  OVERDUE_NOTICE_2: 'Notice #2',
  FORMAL_NOTICE: 'Formal Notice',
  LEGAL_REFERRAL: 'Legal Referral',
  RESOLVED: 'Resolved',
};

const STEP_BADGE_VARIANT: Record<string, 'warning' | 'danger' | 'neutral' | 'success'> = {
  REMINDER_SENT: 'warning',
  OVERDUE_NOTICE_1: 'warning',
  PHONE_CALL: 'danger',
  OVERDUE_NOTICE_2: 'danger',
  FORMAL_NOTICE: 'danger',
  LEGAL_REFERRAL: 'danger',
  RESOLVED: 'success',
};

const PIPELINE_STEPS = [
  { key: 'REMINDER_SENT', label: 'Reminder Sent', dayRange: 'Day 1-5', color: 'bg-yellow-500' },
  { key: 'OVERDUE_NOTICE_1', label: 'Notice #1', dayRange: 'Day 6-9', color: 'bg-orange-500' },
  { key: 'PHONE_CALL', label: 'Phone Call', dayRange: 'Day 10-13', color: 'bg-orange-600' },
  { key: 'OVERDUE_NOTICE_2', label: 'Notice #2 + Landlord', dayRange: 'Day 14-20', color: 'bg-red-500' },
  { key: 'FORMAL_NOTICE', label: 'Formal Notice', dayRange: 'Day 21-34', color: 'bg-red-700' },
  { key: 'LEGAL_REFERRAL', label: 'Legal Referral', dayRange: 'Day 35+', color: 'bg-neutral-900' },
] as const;

const RESOLUTION_OPTIONS = [
  { value: 'PAID', label: 'Paid in Full' },
  { value: 'PAYMENT_PLAN', label: 'Payment Plan Agreed' },
  { value: 'EVICTION', label: 'Eviction' },
  { value: 'VACATED', label: 'Tenant Vacated' },
];

function getLastAction(record: ArrearsRecord): string {
  const actions: { label: string; date: string | null }[] = [
    { label: 'Legal referral', date: record.legalReferralAt },
    { label: 'Formal notice', date: record.formalNoticeAt },
    { label: 'Landlord notified', date: record.landlordNotifiedAt },
    { label: 'Notice #2 sent', date: record.notice2SentAt },
    { label: 'Phone call', date: record.phoneCallAt },
    { label: 'Notice #1 sent', date: record.notice1SentAt },
    { label: 'Reminder sent', date: record.reminderSentAt },
  ];

  for (const action of actions) {
    if (action.date) {
      return `${action.label} - ${new Date(action.date).toLocaleDateString()}`;
    }
  }
  return 'Created';
}

// ── Component ────────────────────────────────────────────────────

export default function ArrearsManagementPage() {
  const [arrears, setArrears] = useState<ArrearsRecord[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalOverdue: 0,
    amountAtRisk: 0,
    avgDaysOverdue: 0,
    legalCases: 0,
  });
  const [pipeline, setPipeline] = useState<Pipeline>({
    REMINDER_SENT: 0,
    OVERDUE_NOTICE_1: 0,
    PHONE_CALL: 0,
    OVERDUE_NOTICE_2: 0,
    FORMAL_NOTICE: 0,
    LEGAL_REFERRAL: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterStep, setFilterStep] = useState<string>('all');
  const [sortBy, setSortBy] = useState('daysOverdue');

  // Scan state
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  // Modal state
  const [phoneCallModalOpen, setPhoneCallModalOpen] = useState(false);
  const [phoneCallNotes, setPhoneCallNotes] = useState('');
  const [paymentPromisedDate, setPaymentPromisedDate] = useState('');
  const [paymentPromisedAmount, setPaymentPromisedAmount] = useState('');
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolution, setResolution] = useState('PAID');
  const [resolveNotes, setResolveNotes] = useState('');
  const [selectedArrears, setSelectedArrears] = useState<ArrearsRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchArrears = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStep !== 'all') params.set('currentStep', filterStep);
    params.set('sortBy', sortBy);
    params.set('sortOrder', 'desc');
    params.set('limit', '200');

    fetch(`/api/arrears?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setArrears(data.arrears || []);
        if (data.summary) setSummary(data.summary);
        if (data.pipeline) setPipeline(data.pipeline);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterStep, sortBy]);

  useEffect(() => {
    fetchArrears();
  }, [fetchArrears]);

  // ── Actions ────────────────────────────────────────────────────

  async function handleScan() {
    setScanning(true);
    setScanResult(null);
    try {
      const res = await fetch('/api/arrears/scan', { method: 'POST' });
      const data = await res.json();
      setScanResult(data.message || 'Scan complete');
      fetchArrears();
    } catch {
      setScanResult('Scan failed');
    } finally {
      setScanning(false);
    }
  }

  async function handleFlagUnreachable(record: ArrearsRecord) {
    setActionLoading(true);
    try {
      await fetch(`/api/arrears/${record.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unreachable: !record.unreachable }),
      });
      fetchArrears();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleFlagAbandonment(record: ArrearsRecord) {
    setActionLoading(true);
    try {
      await fetch(`/api/arrears/${record.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspectedAbandonment: !record.suspectedAbandonment }),
      });
      fetchArrears();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleEscalate(record: ArrearsRecord) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/arrears/${record.id}/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        fetchArrears();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  }

  function openPhoneCallModal(record: ArrearsRecord) {
    setSelectedArrears(record);
    setPhoneCallNotes('');
    setPaymentPromisedDate('');
    setPaymentPromisedAmount('');
    setPhoneCallModalOpen(true);
  }

  async function handleRecordPhoneCall() {
    if (!selectedArrears || !phoneCallNotes.trim()) return;
    setActionLoading(true);
    try {
      const payload: any = {
        phoneCallNotes,
        lastContactAt: new Date().toISOString(),
      };
      if (paymentPromisedDate) payload.paymentPromisedDate = paymentPromisedDate;
      if (paymentPromisedAmount) payload.paymentPromisedAmount = Number(paymentPromisedAmount);

      // Also append to contact attempts log
      const existing = selectedArrears.contactAttempts || [];
      payload.contactAttempts = [
        ...existing,
        {
          date: new Date().toISOString(),
          method: 'Phone call',
          outcome: phoneCallNotes,
          notes: paymentPromisedDate ? `Payment promised by ${paymentPromisedDate}` : undefined,
        },
      ];

      const res = await fetch(`/api/arrears/${selectedArrears.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setPhoneCallModalOpen(false);
        fetchArrears();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  }

  function openResolveModal(record: ArrearsRecord) {
    setSelectedArrears(record);
    setResolution('PAID');
    setResolveNotes('');
    setResolveModalOpen(true);
  }

  async function handleResolve() {
    if (!selectedArrears) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/arrears/${selectedArrears.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution, notes: resolveNotes }),
      });
      if (res.ok) {
        setResolveModalOpen(false);
        fetchArrears();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">
            Arrears Escalation &amp; Management
          </h1>
          <p className="text-neutral-600 mt-1">
            Track overdue rent and manage the escalation pipeline (SOP 004)
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={handleScan} disabled={scanning}>
          {scanning ? 'Scanning...' : 'Scan for Arrears'}
        </Button>
      </div>

      {scanResult && (
        <div className="bg-success-50 border border-success-200 text-success-800 px-4 py-3 rounded-lg text-sm">
          {scanResult}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface shadow rounded-lg p-6">
          <p className="text-sm text-neutral-600">Total Overdue</p>
          <p className="text-3xl font-bold text-danger-600">
            {summary.totalOverdue}
          </p>
          <p className="text-xs text-neutral-500 mt-1">active cases</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-6">
          <p className="text-sm text-neutral-600">Amount at Risk</p>
          <p className="text-3xl font-bold text-warning-600">
            KES {summary.amountAtRisk.toLocaleString()}
          </p>
        </div>
        <div className="bg-surface shadow rounded-lg p-6">
          <p className="text-sm text-neutral-600">Avg. Days Overdue</p>
          <p className="text-3xl font-bold text-primary-600">
            {summary.avgDaysOverdue}
          </p>
          <p className="text-xs text-neutral-500 mt-1">days</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-6">
          <p className="text-sm text-neutral-600">Legal Stage</p>
          <p className="text-3xl font-bold text-neutral-900">
            {summary.legalCases}
          </p>
          <p className="text-xs text-neutral-500 mt-1">cases at legal referral</p>
        </div>
      </div>

      {/* Escalation Pipeline */}
      <div className="bg-surface shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Escalation Pipeline
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {PIPELINE_STEPS.map((step) => {
            const count = pipeline[step.key as keyof Pipeline] || 0;
            return (
              <button
                key={step.key}
                onClick={() =>
                  setFilterStep(filterStep === step.key ? 'all' : step.key)
                }
                className={`rounded-lg p-4 text-center transition-all border-2 ${
                  filterStep === step.key
                    ? 'border-primary-500 ring-2 ring-primary-200'
                    : 'border-transparent hover:border-neutral-200'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full ${step.color} text-white flex items-center justify-center text-lg font-bold mx-auto mb-2`}
                >
                  {count}
                </div>
                <p className="text-xs font-medium text-neutral-900">
                  {step.label}
                </p>
                <p className="text-xs text-neutral-500">{step.dayRange}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface shadow rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Escalation Step
            </label>
            <select
              value={filterStep}
              onChange={(e) => setFilterStep(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Steps</option>
              {PIPELINE_STEPS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="daysOverdue">Days Overdue</option>
              <option value="amountOwed">Amount Owed</option>
              <option value="createdAt">Date Created</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : arrears.length === 0 ? (
          <EmptyState
            title="No arrears cases"
            description={
              filterStep !== 'all'
                ? 'No cases at this escalation step. Try a different filter.'
                : 'There are no active arrears escalation cases.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
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
                    Rent Owed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Penalty Accrued
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Days Overdue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Current Step
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Last Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-neutral-200">
                {arrears.map((record) => (
                  <tr key={record.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/admin/tenants/${record.tenantId}`}
                        className="font-medium text-primary-600 hover:text-primary-800 hover:underline"
                      >
                        {record.tenant.name}
                      </Link>
                      <div className="text-xs text-neutral-500">{record.tenant.phone}</div>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {record.unreachable && (
                          <Badge variant="danger" size="sm">Unreachable</Badge>
                        )}
                        {record.suspectedAbandonment && (
                          <Badge variant="danger" size="sm">Abandonment</Badge>
                        )}
                        {record.paymentPromisedDate && (
                          <Badge variant="warning" size="sm">
                            Promise: {new Date(record.paymentPromisedDate).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/admin/properties/${record.propertyId}`}
                        className="text-primary-600 hover:text-primary-800 hover:underline"
                      >
                        {record.property.name}
                      </Link>
                      {record.lease.unitRef && (
                        <div className="text-xs text-neutral-500">
                          Unit {record.lease.unitRef.unitNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-neutral-900">
                      KES {Number(record.amountOwed).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {record.penaltyAccrued > 0 ? (
                        <span className="text-danger-600 font-semibold">
                          KES {Number(record.penaltyAccrued).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                      {record.penaltyPerDay && (
                        <div className="text-xs text-neutral-400">
                          KES {Number(record.penaltyPerDay).toLocaleString()}/day
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm font-semibold ${
                          record.daysOverdue >= 35
                            ? 'text-neutral-900'
                            : record.daysOverdue >= 21
                              ? 'text-red-700'
                              : record.daysOverdue >= 14
                                ? 'text-danger-600'
                                : record.daysOverdue >= 6
                                  ? 'text-warning-600'
                                  : 'text-yellow-600'
                        }`}
                      >
                        {record.daysOverdue} days
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={STEP_BADGE_VARIANT[record.currentStep] || 'neutral'}
                        size="md"
                      >
                        {STEP_LABELS[record.currentStep] || record.currentStep}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-neutral-600 max-w-[180px] truncate">
                      {getLastAction(record)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        {record.currentStep !== 'LEGAL_REFERRAL' &&
                          record.currentStep !== 'RESOLVED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEscalate(record)}
                              disabled={actionLoading}
                            >
                              Escalate
                            </Button>
                          )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPhoneCallModal(record)}
                        >
                          Log Call
                        </Button>
                        <Button
                          variant={record.unreachable ? 'danger' : 'ghost'}
                          size="sm"
                          onClick={() => handleFlagUnreachable(record)}
                          disabled={actionLoading}
                          title={record.unreachable ? 'Clear unreachable flag' : 'Flag as unreachable (14 days no contact)'}
                        >
                          {record.unreachable ? 'Unreachable ✓' : 'Unreachable'}
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => openResolveModal(record)}
                        >
                          Resolve
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Phone Call Modal */}
      <Modal open={phoneCallModalOpen} onClose={() => setPhoneCallModalOpen(false)}>
        <ModalHeader>
          <h3 className="text-lg font-semibold text-neutral-900">
            Record Phone Call
          </h3>
          <button
            onClick={() => setPhoneCallModalOpen(false)}
            className="text-neutral-400 hover:text-neutral-600"
          >
            &times;
          </button>
        </ModalHeader>
        <ModalBody>
          {selectedArrears && (
            <div className="space-y-4">
              <div className="bg-neutral-50 rounded-lg p-3 text-sm">
                <p><span className="font-medium">Tenant:</span> {selectedArrears.tenant.name}</p>
                <p><span className="font-medium">Phone:</span> {selectedArrears.tenant.phone}</p>
                <p>
                  <span className="font-medium">Rent Owed:</span> KES {Number(selectedArrears.amountOwed).toLocaleString()}
                  {selectedArrears.penaltyAccrued > 0 && (
                    <> + KES {Number(selectedArrears.penaltyAccrued).toLocaleString()} penalty (agent income)</>
                  )}
                </p>
              </div>

              {/* Previous contact attempts */}
              {selectedArrears.contactAttempts && selectedArrears.contactAttempts.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-neutral-600 mb-1">Previous Contact Attempts</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {selectedArrears.contactAttempts.map((a, i) => (
                      <div key={i} className="text-xs bg-neutral-50 rounded p-2 flex gap-2">
                        <span className="text-neutral-400">{new Date(a.date).toLocaleDateString()}</span>
                        <span className="font-medium">{a.method}</span>
                        <span className="text-neutral-600">{a.outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Call Notes / Outcome <span className="text-danger-500">*</span>
                </label>
                <textarea
                  value={phoneCallNotes}
                  onChange={(e) => setPhoneCallNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="Summarize the phone call outcome..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Payment Promised By
                  </label>
                  <input
                    type="date"
                    value={paymentPromisedDate}
                    onChange={(e) => setPaymentPromisedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Promised Amount (KES)
                  </label>
                  <input
                    type="number"
                    value={paymentPromisedAmount}
                    onChange={(e) => setPaymentPromisedAmount(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPhoneCallModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleRecordPhoneCall}
            disabled={actionLoading || !phoneCallNotes.trim()}
          >
            {actionLoading ? 'Saving...' : 'Save Notes'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Resolve Modal */}
      <Modal open={resolveModalOpen} onClose={() => setResolveModalOpen(false)}>
        <ModalHeader>
          <h3 className="text-lg font-semibold text-neutral-900">
            Resolve Arrears Case
          </h3>
          <button
            onClick={() => setResolveModalOpen(false)}
            className="text-neutral-400 hover:text-neutral-600"
          >
            &times;
          </button>
        </ModalHeader>
        <ModalBody>
          {selectedArrears && (
            <div className="space-y-4">
              <div className="bg-neutral-50 rounded-lg p-3 text-sm">
                <p>
                  <span className="font-medium">Tenant:</span>{' '}
                  {selectedArrears.tenant.name}
                </p>
                <p>
                  <span className="font-medium">Amount Owed:</span> KES{' '}
                  {Number(selectedArrears.amountOwed).toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Days Overdue:</span>{' '}
                  {selectedArrears.daysOverdue}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Resolution Type
                </label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  {RESOLUTION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="Additional notes about the resolution..."
                />
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setResolveModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={handleResolve}
            disabled={actionLoading}
          >
            {actionLoading ? 'Resolving...' : 'Mark Resolved'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
