'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface TenantRisk {
  tenantId: string;
  tenantName: string;
  unit: string;
  property: string;
  monthlyRent: number;
  currentBalance: number;
  daysSinceLastPayment: number | null;
  lastPaymentDate: string | null;
  lastPaymentAmount: number | null;
  totalCharged: number;
  totalPaid: number;
  monthsCharged: number;
  monthsPaidOnTime: number;
  monthsPaidLate: number;
  monthsMissed: number;
  averageDaysLate: number;
  riskScore: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  riskFactors: string[];
  recommendedAction: string;
}

interface Summary {
  totalTenants: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  totalArrears: number;
  totalCollected: number;
  averageCollectionRate: number;
}

const riskColors = {
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', dot: 'bg-red-500' },
  HIGH: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', dot: 'bg-orange-500' },
  MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', dot: 'bg-yellow-500' },
  LOW: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', dot: 'bg-green-500' },
};

export default function ArrearsAnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<{ summary: Summary; tenants: TenantRisk[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState<string>('ALL');

  useEffect(() => {
    fetch('/api/analytics/tenant-risk')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="mt-4 text-neutral-600">Analysing tenant payment data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-6 text-neutral-600">Failed to load analytics data.</div>;
  }

  const { summary, tenants } = data;
  const filtered = filterLevel === 'ALL' ? tenants : tenants.filter((t) => t.riskLevel === filterLevel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Arrears &amp; Risk Analytics</h1>
          <p className="text-sm text-neutral-600 mt-1">
            Payment behaviour analysis across {summary.totalTenants} active tenants
          </p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-surface rounded-lg border border-neutral-200 p-5">
          <p className="text-xs text-neutral-500 uppercase tracking-wide">Total Arrears</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            KES {summary.totalArrears.toLocaleString()}
          </p>
        </div>
        <div className="bg-surface rounded-lg border border-neutral-200 p-5">
          <p className="text-xs text-neutral-500 uppercase tracking-wide">Collection Rate</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{summary.averageCollectionRate}%</p>
        </div>
        {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((level) => {
          const count = summary[level.toLowerCase() as keyof Summary] as number;
          const colors = riskColors[level];
          return (
            <div
              key={level}
              className={`rounded-lg border p-5 cursor-pointer transition-all ${
                filterLevel === level ? `${colors.bg} ${colors.border} ring-2 ring-offset-1` : 'bg-surface border-neutral-200'
              }`}
              onClick={() => setFilterLevel(filterLevel === level ? 'ALL' : level)}
            >
              <p className="text-xs text-neutral-500 uppercase tracking-wide">{level}</p>
              <p className={`text-2xl font-bold mt-1 ${colors.text}`}>{count}</p>
            </div>
          );
        })}
      </div>

      {/* Risk Table */}
      <div className="bg-surface rounded-lg border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
          <h2 className="font-semibold text-neutral-900">
            Tenant Risk Assessment
            {filterLevel !== 'ALL' && (
              <span className={`ml-2 text-sm font-normal ${riskColors[filterLevel as keyof typeof riskColors]?.text}`}>
                — showing {filterLevel} only
              </span>
            )}
          </h2>
          {filterLevel !== 'ALL' && (
            <button className="text-sm text-primary-600 hover:underline" onClick={() => setFilterLevel('ALL')}>
              Show all
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Risk</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Tenant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Unit</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Arrears</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Last Payment</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase">On Time</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase">Late</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase">Missed</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Risk Factors</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-neutral-500">
                    No tenants match the selected filter.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const colors = riskColors[t.riskLevel];
                  return (
                    <tr key={t.tenantId} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
                          <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                          {t.riskLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="font-medium text-primary-700 hover:underline"
                          onClick={() => router.push(`/admin/tenants/${t.tenantId}`)}
                        >
                          {t.tenantName}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-600">{t.unit}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm">
                        {t.currentBalance > 0 ? (
                          <span className="text-red-600 font-semibold">
                            KES {t.currentBalance.toLocaleString()}
                          </span>
                        ) : t.currentBalance < 0 ? (
                          <span className="text-green-600">(KES {Math.abs(t.currentBalance).toLocaleString()})</span>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-neutral-600">
                        {t.daysSinceLastPayment !== null ? (
                          <span>
                            {t.daysSinceLastPayment}d ago
                            <br />
                            <span className="text-xs text-neutral-400">
                              KES {t.lastPaymentAmount?.toLocaleString()}
                            </span>
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-green-600 font-medium">
                        {t.monthsPaidOnTime}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-yellow-600 font-medium">
                        {t.monthsPaidLate}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-red-600 font-medium">
                        {t.monthsMissed}
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-600 max-w-[200px]">
                        {t.riskFactors.length > 0 ? (
                          <ul className="space-y-0.5">
                            {t.riskFactors.map((f, i) => (
                              <li key={i}>• {f}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-neutral-400">None</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-700 max-w-[180px]">
                        {t.recommendedAction}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
