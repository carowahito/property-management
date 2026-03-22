'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface OwnerStatement {
  id: string;
  landlordId: string;
  propertyId: string | null;
  month: number;
  year: number;
  rentDue: string;
  rentReceived: string;
  managementFee: string;
  managementFeeRate: string;
  maintenanceCosts: string;
  otherDeductions: string;
  netDisbursement: string;
  depositsHeld: string;
  lineItems: LineItem[] | null;
  status: 'DRAFT' | 'FINALIZED' | 'SENT';
  generatedAt: string;
  sentAt: string | null;
  landlord: { id: string; name: string; email: string; phone: string };
  property: { id: string; name: string; address: string } | null;
}

interface LineItem {
  description: string;
  amount: number;
  type: 'income' | 'deduction';
  category: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function StatementsPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [statements, setStatements] = useState<OwnerStatement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedStatement, setSelectedStatement] = useState<OwnerStatement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchStatements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/owner-statements?month=${selectedMonth}&year=${selectedYear}&limit=200`
      );
      const data = await res.json();
      setStatements(data.statements || []);
    } catch {
      setError('Failed to fetch statements');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchStatements();
  }, [fetchStatements]);

  const handleGenerateAll = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await fetch('/api/owner-statements/generate-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
          managementFeeRate: 10,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to generate statements');
      } else {
        setSuccessMessage(data.message);
        fetchStatements();
      }
    } catch {
      setError('Failed to generate statements');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'FINALIZED' | 'SENT') => {
    try {
      const res = await fetch(`/api/owner-statements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchStatements();
        if (selectedStatement?.id === id) {
          const updated = await res.json();
          setSelectedStatement(updated);
        }
      }
    } catch {
      setError('Failed to update statement status');
    }
  };

  const filteredStatements = filterStatus === 'all'
    ? statements
    : statements.filter((s) => s.status === filterStatus);

  // Summary stats
  const totalRentDue = filteredStatements.reduce((sum, s) => sum + Number(s.rentDue), 0);
  const totalCollected = filteredStatements.reduce((sum, s) => sum + Number(s.rentReceived), 0);
  const totalMgmtFees = filteredStatements.reduce((sum, s) => sum + Number(s.managementFee), 0);
  const totalDisbursements = filteredStatements.reduce((sum, s) => sum + Number(s.netDisbursement), 0);

  const fmt = (n: number) => `KES ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'FINALIZED': return 'bg-primary-100 text-primary-800';
      case 'SENT': return 'bg-success-100 text-green-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Owner Statements</h1>
          <p className="text-neutral-500 mt-1">Monthly landlord disbursement statements</p>
        </div>
      </div>

      {/* Month/Year Selector + Generate Button */}
      <div className="flex items-end gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={i} value={i + 1}>{name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {Array.from({ length: 7 }, (_, i) => now.getFullYear() - 3 + i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="FINALIZED">Finalized</option>
            <option value="SENT">Sent</option>
          </select>
        </div>
        <Button
          onClick={handleGenerateAll}
          disabled={isGenerating}
          className="bg-primary-600 hover:bg-primary-700 text-white"
        >
          {isGenerating ? 'Generating...' : 'Generate All Statements'}
        </Button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-success-50 border border-success-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <p className="text-sm text-neutral-500">Total Rent Due</p>
          <p className="text-xl font-bold text-neutral-900 mt-1">{fmt(totalRentDue)}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <p className="text-sm text-neutral-500">Total Collected</p>
          <p className="text-xl font-bold text-success-600 mt-1">{fmt(totalCollected)}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <p className="text-sm text-neutral-500">Total Management Fees</p>
          <p className="text-xl font-bold text-primary-600 mt-1">{fmt(totalMgmtFees)}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <p className="text-sm text-neutral-500">Total Disbursements</p>
          <p className="text-xl font-bold text-neutral-900 mt-1">{fmt(totalDisbursements)}</p>
        </div>
      </div>

      {/* Statements Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Landlord</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Property</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-600">Rent Due</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-600">Rent Received</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-600">Mgmt Fee</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-600">Maintenance</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-600">Net Disbursement</th>
                <th className="text-center px-4 py-3 font-medium text-neutral-600">Status</th>
                <th className="text-center px-4 py-3 font-medium text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-neutral-500">Loading statements...</td>
                </tr>
              ) : filteredStatements.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-neutral-500">
                    No statements for {MONTH_NAMES[selectedMonth - 1]} {selectedYear}.
                    Click &quot;Generate All Statements&quot; to create them.
                  </td>
                </tr>
              ) : (
                filteredStatements.map((s) => (
                  <tr key={s.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-neutral-900">{s.landlord.name}</div>
                      <div className="text-xs text-neutral-500">{s.landlord.email}</div>
                    </td>
                    <td className="px-4 py-3 text-neutral-700">
                      {s.property?.name || 'Portfolio'}
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-700">{fmt(Number(s.rentDue))}</td>
                    <td className="px-4 py-3 text-right text-neutral-700">{fmt(Number(s.rentReceived))}</td>
                    <td className="px-4 py-3 text-right text-neutral-700">{fmt(Number(s.managementFee))}</td>
                    <td className="px-4 py-3 text-right text-neutral-700">{fmt(Number(s.maintenanceCosts))}</td>
                    <td className="px-4 py-3 text-right font-medium text-neutral-900">
                      {fmt(Number(s.netDisbursement))}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedStatement(s)}
                          className="text-primary-600 hover:text-primary-800 text-xs font-medium px-2 py-1 hover:bg-primary-50 rounded"
                        >
                          View
                        </button>
                        <Link
                          href={`/admin/statements/${s.id}`}
                          className="text-neutral-600 hover:text-neutral-800 text-xs font-medium px-2 py-1 hover:bg-neutral-100 rounded"
                        >
                          Print
                        </Link>
                        {s.status === 'DRAFT' && (
                          <button
                            onClick={() => handleUpdateStatus(s.id, 'FINALIZED')}
                            className="text-primary-600 hover:text-primary-800 text-xs font-medium px-2 py-1 hover:bg-primary-50 rounded"
                          >
                            Finalize
                          </button>
                        )}
                        {s.status === 'FINALIZED' && (
                          <button
                            onClick={() => handleUpdateStatus(s.id, 'SENT')}
                            className="text-success-600 hover:text-green-800 text-xs font-medium px-2 py-1 hover:bg-success-50 rounded"
                          >
                            Mark Sent
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statement Detail Modal */}
      {selectedStatement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Owner Statement</h2>
                <p className="text-sm text-neutral-500">
                  {MONTH_NAMES[selectedStatement.month - 1]} {selectedStatement.year}
                </p>
              </div>
              <button
                onClick={() => setSelectedStatement(null)}
                className="text-neutral-400 hover:text-neutral-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Landlord & Property */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide">Landlord</p>
                  <p className="font-medium text-neutral-900">{selectedStatement.landlord.name}</p>
                  <p className="text-sm text-neutral-500">{selectedStatement.landlord.email}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide">Property</p>
                  <p className="font-medium text-neutral-900">
                    {selectedStatement.property?.name || 'All Properties'}
                  </p>
                  {selectedStatement.property?.address && (
                    <p className="text-sm text-neutral-500">{selectedStatement.property.address}</p>
                  )}
                </div>
              </div>

              {/* Income Lines */}
              {selectedStatement.lineItems && (
                <>
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">Income</h3>
                    <div className="border border-neutral-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <tbody className="divide-y divide-neutral-100">
                          {(selectedStatement.lineItems as LineItem[])
                            .filter((li) => li.type === 'income')
                            .map((li, i) => (
                              <tr key={i}>
                                <td className="px-3 py-2 text-neutral-700">{li.description}</td>
                                <td className="px-3 py-2 text-right text-neutral-900 font-medium">
                                  {fmt(li.amount)}
                                </td>
                              </tr>
                            ))}
                          <tr className="bg-neutral-50 font-semibold">
                            <td className="px-3 py-2 text-neutral-900">Total Rent Due</td>
                            <td className="px-3 py-2 text-right text-neutral-900">
                              {fmt(Number(selectedStatement.rentDue))}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Deduction Lines */}
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">Deductions</h3>
                    <div className="border border-neutral-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <tbody className="divide-y divide-neutral-100">
                          {(selectedStatement.lineItems as LineItem[])
                            .filter((li) => li.type === 'deduction')
                            .map((li, i) => (
                              <tr key={i}>
                                <td className="px-3 py-2 text-neutral-700">{li.description}</td>
                                <td className="px-3 py-2 text-right text-danger-600 font-medium">
                                  ({fmt(li.amount)})
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* Summary */}
              <div className="border-t border-neutral-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Rent Received</span>
                  <span className="font-medium">{fmt(Number(selectedStatement.rentReceived))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Management Fee ({selectedStatement.managementFeeRate}%)</span>
                  <span className="font-medium text-danger-600">({fmt(Number(selectedStatement.managementFee))})</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Maintenance Costs</span>
                  <span className="font-medium text-danger-600">({fmt(Number(selectedStatement.maintenanceCosts))})</span>
                </div>
                {Number(selectedStatement.otherDeductions) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Other Deductions</span>
                    <span className="font-medium text-danger-600">({fmt(Number(selectedStatement.otherDeductions))})</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold border-t border-neutral-200 pt-2">
                  <span className="text-neutral-900">Net Disbursement</span>
                  <span className="text-neutral-900">{fmt(Number(selectedStatement.netDisbursement))}</span>
                </div>
                {Number(selectedStatement.depositsHeld) > 0 && (
                  <p className="text-xs text-neutral-500 italic mt-2">
                    Deposits held: {fmt(Number(selectedStatement.depositsHeld))} (not included in disbursable amounts)
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {selectedStatement.status === 'DRAFT' && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedStatement.id, 'FINALIZED')}
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    Finalize Statement
                  </Button>
                )}
                {selectedStatement.status === 'FINALIZED' && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedStatement.id, 'SENT')}
                    className="bg-success-600 hover:bg-green-700 text-white"
                  >
                    Mark as Sent
                  </Button>
                )}
                <Link href={`/admin/statements/${selectedStatement.id}`}>
                  <Button variant="outline">Print View</Button>
                </Link>
                <Button variant="outline" onClick={() => setSelectedStatement(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
