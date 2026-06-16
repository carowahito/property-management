'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { StatementPeriodSelect } from '@/components/ui/statement-period-select';
import { StatementPeriod, getStatementDateRange } from '@/lib/statement-period';
import { formatDate } from '@/lib/utils';

interface LedgerEntry {
  date: string;
  type: string;
  description: string;
  reference: string | null;
  debit: number;
  credit: number;
  balance: number;
}

interface StatementData {
  tenantName: string;
  unitNumber: string;
  propertyName: string;
  monthlyRent: number;
  totalCharged: number;
  totalPaid: number;
  closingBalance: number;
  entries: LedgerEntry[];
}

export default function TenantStatementsPage() {
  const [period, setPeriod] = useState<StatementPeriod>('12');
  const { data: session } = useSession();

  // session.user.id is the tenant's DB id when role === 'TENANT'
  const tenantId = session?.user?.id;

  const { startDate, endDate } = getStatementDateRange(period);

  const { data, isLoading, error } = useQuery({
    queryKey: ['tenant-statement', tenantId, period],
    queryFn: () =>
      fetch(
        `/api/tenants/${tenantId}/statement?startDate=${startDate}&endDate=${endDate}`
      ).then((r) => r.json()),
    enabled: !!tenantId,
  });

  const statement: StatementData | null = data?.statement ?? null;

  const handleDownload = () => {
    if (!tenantId) return;
    window.open(
      `/api/tenants/${tenantId}/statement?format=html&startDate=${startDate}&endDate=${endDate}`,
      '_blank'
    );
  };

  if (isLoading || !tenantId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-neutral-600">Loading statement...</p>
        </div>
      </div>
    );
  }

  if (error || !statement) {
    return (
      <div className="p-6 text-center text-neutral-600">
        <p>Unable to load your statement. Please try again later.</p>
      </div>
    );
  }

  const fmtMoney = (n: number) =>
    `KES ${Math.abs(n).toLocaleString('en-KE')}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Statement of Account
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            {statement.propertyName} · Unit {statement.unitNumber}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatementPeriodSelect value={period} onChange={setPeriod} />
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-neutral-800 text-white text-sm font-medium rounded-md hover:bg-neutral-700 transition-colors"
          >
            Download / Print
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-5">
          <p className="text-xs text-neutral-500 uppercase tracking-wide">
            Total Charged
          </p>
          <p className="text-xl font-bold text-neutral-900 mt-1">
            {fmtMoney(statement.totalCharged)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-5">
          <p className="text-xs text-neutral-500 uppercase tracking-wide">
            Total Paid
          </p>
          <p className="text-xl font-bold text-green-700 mt-1">
            {fmtMoney(statement.totalPaid)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-5">
          <p className="text-xs text-neutral-500 uppercase tracking-wide">
            {statement.closingBalance > 0 ? 'Balance Due' : statement.closingBalance < 0 ? 'Credit Balance' : 'Balance'}
          </p>
          <p
            className={`text-xl font-bold mt-1 ${
              statement.closingBalance > 0
                ? 'text-red-700'
                : statement.closingBalance < 0
                ? 'text-green-700'
                : 'text-neutral-500'
            }`}
          >
            {statement.closingBalance === 0
              ? '—'
              : statement.closingBalance < 0
              ? `(${fmtMoney(statement.closingBalance)})`
              : fmtMoney(statement.closingBalance)}
          </p>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  Reference
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">
                  Debit
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">
                  Credit
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {statement.entries.map((entry, idx) => (
                <tr
                  key={idx}
                  className={
                    entry.type === 'PAYMENT'
                      ? 'bg-green-50/40'
                      : idx % 2 === 0
                      ? 'bg-white'
                      : 'bg-neutral-50/50'
                  }
                >
                  <td className="px-4 py-2.5 text-sm text-neutral-700">
                    {formatDate(entry.date)}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-neutral-900 font-medium">
                    {entry.description}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-neutral-500 font-mono">
                    {entry.reference || ''}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-right font-mono text-neutral-700">
                    {entry.debit > 0
                      ? entry.debit.toLocaleString('en-KE')
                      : ''}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-right font-mono text-green-700">
                    {entry.credit > 0
                      ? entry.credit.toLocaleString('en-KE')
                      : ''}
                  </td>
                  <td
                    className={`px-4 py-2.5 text-sm text-right font-mono font-semibold ${
                      entry.balance > 0
                        ? 'text-red-700'
                        : entry.balance < 0
                        ? 'text-green-700'
                        : 'text-neutral-400'
                    }`}
                  >
                    {entry.balance === 0
                      ? '—'
                      : entry.balance < 0
                      ? `(${Math.abs(entry.balance).toLocaleString('en-KE')})`
                      : entry.balance.toLocaleString('en-KE')}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-neutral-100 font-bold">
                <td colSpan={3} className="px-4 py-3 text-sm text-neutral-900">
                  TOTALS
                </td>
                <td className="px-4 py-3 text-sm text-right font-mono text-neutral-900">
                  {statement.totalCharged.toLocaleString('en-KE')}
                </td>
                <td className="px-4 py-3 text-sm text-right font-mono text-green-700">
                  {statement.totalPaid.toLocaleString('en-KE')}
                </td>
                <td
                  className={`px-4 py-3 text-sm text-right font-mono font-bold ${
                    statement.closingBalance > 0
                      ? 'text-red-700'
                      : statement.closingBalance < 0
                      ? 'text-green-700'
                      : ''
                  }`}
                >
                  {statement.closingBalance === 0
                    ? '—'
                    : statement.closingBalance < 0
                    ? `(${Math.abs(statement.closingBalance).toLocaleString('en-KE')})`
                    : statement.closingBalance.toLocaleString('en-KE')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Arrears Notice */}
      {statement.closingBalance > 0 && (
        <div className="bg-neutral-800 text-white rounded-lg p-5 flex justify-between items-center">
          <span className="font-medium">Total Arrears</span>
          <span className="text-2xl font-bold">
            {fmtMoney(statement.closingBalance)}
          </span>
        </div>
      )}
    </div>
  );
}
