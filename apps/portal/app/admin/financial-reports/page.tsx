'use client';

import { useState, useEffect, useMemo } from 'react';

interface RentTransaction {
  id: string;
  grossRent: string;
  serviceCharge: string;
  managementFee: string;
  maintenanceFees: string;
  otherDeductions: string;
  totalDeductions: string;
  netAmount: string;
  lateFees: string;
  rentPeriod: string;
  dueDate: string;
  paidDate: string;
  payoutStatus: string;
  processed: boolean;
  tenant: { id: string; name: string };
  unit: { unitNumber: string };
  landlord: { id: string; name: string };
  property: { id: string; name: string };
}

export default function FinancialReportsPage() {
  const [transactions, setTransactions] = useState<RentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    fetch('/api/rent/transactions?limit=1000')
      .then(r => r.json())
      .then(data => { setTransactions(data.transactions || []); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  const getDateRange = (): { start: Date | null; end: Date | null } => {
    const now = new Date();
    switch (timePeriod) {
      case 'current-month':
        return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now };
      case 'last-month': {
        const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const e = new Date(now.getFullYear(), now.getMonth(), 0);
        return { start: s, end: e };
      }
      case 'last-quarter':
        return { start: new Date(now.getFullYear(), now.getMonth() - 3, 1), end: now };
      case 'ytd':
        return { start: new Date(now.getFullYear(), 0, 1), end: now };
      case 'last-year':
        return { start: new Date(now.getFullYear() - 1, 0, 1), end: new Date(now.getFullYear() - 1, 11, 31) };
      case 'custom':
        return {
          start: customStartDate ? new Date(customStartDate) : null,
          end: customEndDate ? new Date(customEndDate + 'T23:59:59') : null,
        };
      default:
        return { start: null, end: null };
    }
  };

  const filtered = useMemo(() => {
    const { start, end } = getDateRange();
    if (!start && !end) return transactions;
    return transactions.filter(t => {
      const d = new Date(t.paidDate);
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, timePeriod, customStartDate, customEndDate]);

  // ── Compute financials ──────────────────────────────────────────────
  const financials = useMemo(() => {
    const n = (v: string) => Number(v) || 0;

    const totalGrossRent = filtered.reduce((s, t) => s + n(t.grossRent), 0);
    const totalServiceCharges = filtered.reduce((s, t) => s + n(t.serviceCharge), 0);
    const totalManagementFees = filtered.reduce((s, t) => s + n(t.managementFee), 0);
    const totalMaintenanceFees = filtered.reduce((s, t) => s + n(t.maintenanceFees), 0);
    const totalOtherDeductions = filtered.reduce((s, t) => s + n(t.otherDeductions), 0);
    const totalLateFees = filtered.reduce((s, t) => s + n(t.lateFees), 0);
    const totalNetToLandlords = filtered.reduce((s, t) => s + n(t.netAmount), 0);
    const totalDeductions = filtered.reduce((s, t) => s + n(t.totalDeductions), 0);

    // Management company revenue = fees retained from rent
    const mgmtRevenue = totalServiceCharges + totalManagementFees + totalLateFees;
    const mgmtMargin = totalGrossRent > 0 ? (mgmtRevenue / totalGrossRent) * 100 : 0;

    // Per-landlord breakdown
    const byLandlord = new Map<string, { name: string; gross: number; net: number; fees: number; txnCount: number }>();
    for (const t of filtered) {
      const key = t.landlord?.id || 'unknown';
      const existing = byLandlord.get(key) || { name: t.landlord?.name || 'Unknown', gross: 0, net: 0, fees: 0, txnCount: 0 };
      existing.gross += n(t.grossRent);
      existing.net += n(t.netAmount);
      existing.fees += n(t.serviceCharge) + n(t.managementFee);
      existing.txnCount += 1;
      byLandlord.set(key, existing);
    }

    // Per-property breakdown
    const byProperty = new Map<string, { name: string; gross: number; net: number; fees: number; txnCount: number }>();
    for (const t of filtered) {
      const key = t.property?.id || 'unknown';
      const existing = byProperty.get(key) || { name: t.property?.name || 'Unknown', gross: 0, net: 0, fees: 0, txnCount: 0 };
      existing.gross += n(t.grossRent);
      existing.net += n(t.netAmount);
      existing.fees += n(t.serviceCharge) + n(t.managementFee);
      existing.txnCount += 1;
      byProperty.set(key, existing);
    }

    // Monthly trend
    const byMonth = new Map<string, { gross: number; fees: number; net: number; count: number }>();
    for (const t of filtered) {
      const period = t.rentPeriod || 'Unknown';
      const existing = byMonth.get(period) || { gross: 0, fees: 0, net: 0, count: 0 };
      existing.gross += n(t.grossRent);
      existing.fees += n(t.serviceCharge) + n(t.managementFee);
      existing.net += n(t.netAmount);
      existing.count += 1;
      byMonth.set(period, existing);
    }

    return {
      totalGrossRent,
      totalServiceCharges,
      totalManagementFees,
      totalMaintenanceFees,
      totalOtherDeductions,
      totalLateFees,
      totalNetToLandlords,
      totalDeductions,
      mgmtRevenue,
      mgmtMargin,
      transactionCount: filtered.length,
      byLandlord: Array.from(byLandlord.entries()).map(([id, v]) => ({ id, ...v })),
      byProperty: Array.from(byProperty.entries()).map(([id, v]) => ({ id, ...v })),
      byMonth: Array.from(byMonth.entries())
        .map(([period, v]) => ({ period, ...v }))
        .sort((a, b) => a.period.localeCompare(b.period)),
    };
  }, [filtered]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>;
  }

  return (
    <div className='p-6 space-y-6'>
      <div>
        <h1 className='text-3xl font-bold text-neutral-900'>Financial Reports</h1>
        <p className='text-neutral-600 mt-1'>Management company profitability and revenue analysis</p>
      </div>

      {/* Time Period Filter */}
      <div className='bg-surface shadow rounded-lg p-4'>
        <div className='flex flex-wrap gap-4 items-end'>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Time Period</label>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500'
            >
              <option value='all'>All Time</option>
              <option value='current-month'>Current Month</option>
              <option value='last-month'>Last Month</option>
              <option value='last-quarter'>Last 3 Months</option>
              <option value='ytd'>Year to Date</option>
              <option value='last-year'>Last Year</option>
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
          <div className="text-sm text-neutral-500 self-center">
            {financials.transactionCount} transaction{financials.transactionCount !== 1 ? 's' : ''} in period
          </div>
        </div>
      </div>

      {/* Top-Level KPIs */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <StatCard label="Total Rent Collected" value={financials.totalGrossRent} color="text-neutral-900" />
        <StatCard label="Paid to Landlords" value={financials.totalNetToLandlords} color="text-danger-600" />
        <StatCard label="Management Revenue" value={financials.mgmtRevenue} color="text-success-600" subtitle="Fees retained by company" />
        <StatCard label="Profit Margin" value={null} color="text-primary-600"
          display={`${financials.mgmtMargin.toFixed(1)}%`}
          subtitle={`${financials.transactionCount} transactions`} />
      </div>

      {/* Revenue Breakdown */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-surface shadow rounded-lg p-6'>
          <h2 className='text-lg font-semibold text-neutral-900 mb-4'>Revenue Breakdown</h2>
          <p className="text-sm text-neutral-500 mb-4">How management company earns from rent collected</p>

          <div className="space-y-3">
            <LineItem label="Gross Rent Collected" amount={financials.totalGrossRent} bold />
            <div className="border-t border-neutral-200 pt-3 space-y-2">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Deductions from Rent</p>
              <LineItem label="Service Charges (retained)" amount={financials.totalServiceCharges} color="text-success-600" prefix="+" />
              <LineItem label="Management Fees (retained)" amount={financials.totalManagementFees} color="text-success-600" prefix="+" />
              {financials.totalLateFees > 0 && (
                <LineItem label="Late Fees (retained)" amount={financials.totalLateFees} color="text-success-600" prefix="+" />
              )}
              {financials.totalMaintenanceFees > 0 && (
                <LineItem label="Maintenance Deductions" amount={financials.totalMaintenanceFees} color="text-yellow-600" prefix="-" />
              )}
              {financials.totalOtherDeductions > 0 && (
                <LineItem label="Other Deductions" amount={financials.totalOtherDeductions} color="text-yellow-600" prefix="-" />
              )}
            </div>
            <div className="border-t-2 border-neutral-300 pt-3 space-y-2">
              <LineItem label="Total Deductions" amount={financials.totalDeductions} bold />
              <LineItem label="Net Paid to Landlords" amount={financials.totalNetToLandlords} color="text-danger-600" bold />
            </div>
            <div className="border-t-2 border-primary-300 pt-3 bg-primary-50 -mx-6 px-6 py-3 rounded-b-lg">
              <LineItem label="Management Company Revenue" amount={financials.mgmtRevenue} color="text-primary-700" bold />
            </div>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className='bg-surface shadow rounded-lg p-6'>
          <h2 className='text-lg font-semibold text-neutral-900 mb-4'>Monthly Trend</h2>
          <p className="text-sm text-neutral-500 mb-4">Collections and management earnings by month</p>

          {financials.byMonth.length === 0 ? (
            <p className="text-neutral-400 text-center py-8">No data for selected period</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-2 font-medium text-neutral-600">Month</th>
                    <th className="text-right py-2 font-medium text-neutral-600">Collected</th>
                    <th className="text-right py-2 font-medium text-neutral-600">Fees Earned</th>
                    <th className="text-right py-2 font-medium text-neutral-600">To Landlords</th>
                    <th className="text-right py-2 font-medium text-neutral-600">Units</th>
                  </tr>
                </thead>
                <tbody>
                  {financials.byMonth.map(m => (
                    <tr key={m.period} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-2 font-medium text-neutral-900">{m.period}</td>
                      <td className="py-2 text-right text-neutral-900">KES {m.gross.toLocaleString()}</td>
                      <td className="py-2 text-right text-success-600 font-semibold">KES {m.fees.toLocaleString()}</td>
                      <td className="py-2 text-right text-neutral-600">KES {m.net.toLocaleString()}</td>
                      <td className="py-2 text-right text-neutral-500">{m.count}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-neutral-300 font-bold">
                    <td className="py-2">Total</td>
                    <td className="py-2 text-right">KES {financials.totalGrossRent.toLocaleString()}</td>
                    <td className="py-2 text-right text-success-600">KES {financials.mgmtRevenue.toLocaleString()}</td>
                    <td className="py-2 text-right">KES {financials.totalNetToLandlords.toLocaleString()}</td>
                    <td className="py-2 text-right">{financials.transactionCount}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Per-Landlord Profitability */}
      <div className='bg-surface shadow rounded-lg p-6'>
        <h2 className='text-lg font-semibold text-neutral-900 mb-4'>Profitability by Landlord</h2>
        <p className="text-sm text-neutral-500 mb-4">Revenue earned from each landlord relationship</p>
        {financials.byLandlord.length === 0 ? (
          <p className="text-neutral-400 text-center py-8">No data for selected period</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-2 font-medium text-neutral-600">Landlord</th>
                  <th className="text-right py-2 font-medium text-neutral-600">Gross Collected</th>
                  <th className="text-right py-2 font-medium text-neutral-600">Fees Earned</th>
                  <th className="text-right py-2 font-medium text-neutral-600">Paid Out</th>
                  <th className="text-right py-2 font-medium text-neutral-600">Margin</th>
                  <th className="text-right py-2 font-medium text-neutral-600">Transactions</th>
                </tr>
              </thead>
              <tbody>
                {financials.byLandlord.map(l => {
                  const margin = l.gross > 0 ? ((l.fees / l.gross) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={l.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-2 font-medium text-neutral-900">{l.name}</td>
                      <td className="py-2 text-right text-neutral-900">KES {l.gross.toLocaleString()}</td>
                      <td className="py-2 text-right text-success-600 font-semibold">KES {l.fees.toLocaleString()}</td>
                      <td className="py-2 text-right text-neutral-600">KES {l.net.toLocaleString()}</td>
                      <td className="py-2 text-right text-primary-600 font-semibold">{margin}%</td>
                      <td className="py-2 text-right text-neutral-500">{l.txnCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Per-Property Profitability */}
      <div className='bg-surface shadow rounded-lg p-6'>
        <h2 className='text-lg font-semibold text-neutral-900 mb-4'>Profitability by Property</h2>
        <p className="text-sm text-neutral-500 mb-4">Revenue earned from each managed property</p>
        {financials.byProperty.length === 0 ? (
          <p className="text-neutral-400 text-center py-8">No data for selected period</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-2 font-medium text-neutral-600">Property</th>
                  <th className="text-right py-2 font-medium text-neutral-600">Gross Collected</th>
                  <th className="text-right py-2 font-medium text-neutral-600">Fees Earned</th>
                  <th className="text-right py-2 font-medium text-neutral-600">Paid Out</th>
                  <th className="text-right py-2 font-medium text-neutral-600">Margin</th>
                  <th className="text-right py-2 font-medium text-neutral-600">Transactions</th>
                </tr>
              </thead>
              <tbody>
                {financials.byProperty.map(p => {
                  const margin = p.gross > 0 ? ((p.fees / p.gross) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={p.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-2 font-medium text-neutral-900">{p.name}</td>
                      <td className="py-2 text-right text-neutral-900">KES {p.gross.toLocaleString()}</td>
                      <td className="py-2 text-right text-success-600 font-semibold">KES {p.fees.toLocaleString()}</td>
                      <td className="py-2 text-right text-neutral-600">KES {p.net.toLocaleString()}</td>
                      <td className="py-2 text-right text-primary-600 font-semibold">{margin}%</td>
                      <td className="py-2 text-right text-neutral-500">{p.txnCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Detail */}
      <div className='bg-surface shadow rounded-lg p-6'>
        <h2 className='text-lg font-semibold text-neutral-900 mb-4'>Transaction Detail</h2>
        {filtered.length === 0 ? (
          <p className="text-neutral-400 text-center py-8">No transactions for selected period</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-2 font-medium text-neutral-600">Period</th>
                  <th className="text-left py-2 font-medium text-neutral-600">Tenant</th>
                  <th className="text-left py-2 font-medium text-neutral-600">Unit</th>
                  <th className="text-right py-2 font-medium text-neutral-600">Gross</th>
                  <th className="text-right py-2 font-medium text-neutral-600">Service</th>
                  <th className="text-right py-2 font-medium text-neutral-600">Mgmt Fee</th>
                  <th className="text-right py-2 font-medium text-neutral-600">Net</th>
                  <th className="text-left py-2 font-medium text-neutral-600">Payout</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-2 text-neutral-900">{t.rentPeriod}</td>
                    <td className="py-2 text-neutral-700">{t.tenant?.name}</td>
                    <td className="py-2 text-neutral-700">{t.unit?.unitNumber}</td>
                    <td className="py-2 text-right font-medium">KES {Number(t.grossRent).toLocaleString()}</td>
                    <td className="py-2 text-right text-success-600">KES {Number(t.serviceCharge).toLocaleString()}</td>
                    <td className="py-2 text-right text-success-600">KES {Number(t.managementFee).toLocaleString()}</td>
                    <td className="py-2 text-right font-medium">KES {Number(t.netAmount).toLocaleString()}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        t.payoutStatus === 'PAID' ? 'bg-success-100 text-success-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {t.payoutStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, display, subtitle }: {
  label: string; value: number | null; color: string; display?: string; subtitle?: string;
}) {
  return (
    <div className='bg-surface shadow rounded-lg p-6'>
      <p className='text-sm text-neutral-600'>{label}</p>
      <p className={`text-2xl font-bold ${color} mt-1`}>
        {display ?? `KES ${(value ?? 0).toLocaleString()}`}
      </p>
      {subtitle && <p className='text-xs text-neutral-500 mt-1'>{subtitle}</p>}
    </div>
  );
}

function LineItem({ label, amount, color, bold, prefix }: {
  label: string; amount: number; color?: string; bold?: boolean; prefix?: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className={`text-sm ${bold ? 'font-semibold text-neutral-900' : 'text-neutral-700'}`}>{label}</span>
      <span className={`text-sm ${bold ? 'font-bold' : 'font-medium'} ${color || 'text-neutral-900'}`}>
        {prefix && <span className="mr-0.5">{prefix}</span>}
        KES {amount.toLocaleString()}
      </span>
    </div>
  );
}
