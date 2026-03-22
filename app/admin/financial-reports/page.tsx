'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface Report {
  id: string;
  reportType: 'income-statement' | 'cash-flow' | 'balance-sheet' | 'profit-loss';
  period: string;
  propertyName?: string;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  generatedDate: string;
}

export default function FinancialReportsPage() {
  const [reports] = useState<Report[]>([]);
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [allPayouts, setAllPayouts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/payments?status=PAID&limit=500')
      .then(r => r.json())
      .then(data => setAllPayments(data.payments || []))
      .catch(() => {});
    fetch('/api/payouts?limit=500')
      .then(r => r.json())
      .then(data => setAllPayouts(data.payouts || []))
      .catch(() => {});
  }, []);

  const [filterType, setFilterType] = useState<string>('all');
  const [timePeriod, setTimePeriod] = useState<string>('current-month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Compute date range based on selected time period
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
      case 'last-quarter': {
        const s = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        return { start: s, end: now };
      }
      case 'last-year': {
        const s = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        return { start: s, end: now };
      }
      case 'custom':
        return {
          start: customStartDate ? new Date(customStartDate) : null,
          end: customEndDate ? new Date(customEndDate + 'T23:59:59') : null,
        };
      default:
        return { start: null, end: null };
    }
  };

  const { start, end } = getDateRange();

  const filterByDate = (items: any[], dateField: string) => {
    if (!start && !end) return items;
    return items.filter((item) => {
      const d = new Date(item[dateField]);
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });
  };

  const filteredPayments = filterByDate(allPayments, 'paymentDate');
  const filteredPayouts = filterByDate(allPayouts, 'paidDate');

  const totalRevenue = filteredPayments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
  const totalPayoutsAmount = filteredPayouts.reduce((sum: number, p: any) => sum + Number(p.amount), 0);

  const filteredReports = reports.filter(
    (r) => filterType === 'all' || r.reportType === filterType
  );

  const netIncome = totalRevenue - totalPayoutsAmount;
  const profitMargin = totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : '0.0';
  const stats = {
    totalRevenue,
    totalExpenses: totalPayoutsAmount,
    netIncome,
    profitMargin,
  };

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-neutral-900'>Financial Reports</h1>
          <p className='text-neutral-600 mt-1'>Generate and analyze comprehensive financial reports</p>
        </div>
        <Button variant="primary" size="lg">+ Generate Report</Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Total Revenue</p>
          <p className='text-3xl font-bold text-success-600'>
            KES {stats.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Total Payouts</p>
          <p className='text-3xl font-bold text-danger-600'>
            KES {stats.totalExpenses.toLocaleString()}
          </p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Net Income</p>
          <p className='text-3xl font-bold text-primary-600'>KES {stats.netIncome.toLocaleString()}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Profit Margin</p>
          <p className='text-3xl font-bold text-purple-600'>{stats.profitMargin}%</p>
        </div>
      </div>

      <div className='bg-surface shadow rounded-lg p-4 space-y-4'>
        <div className='flex flex-wrap gap-4 items-end'>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Time Period</label>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500'
            >
              <option value='all'>All Periods</option>
              <option value='current-month'>Current Month</option>
              <option value='last-month'>Last Month</option>
              <option value='last-quarter'>Last Quarter</option>
              <option value='last-year'>Last Year</option>
              <option value='custom'>Custom Range</option>
            </select>
          </div>

          {timePeriod === 'custom' && (
            <>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-neutral-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-neutral-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </>
          )}

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Report Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500'
            >
              <option value='all'>All Report Types</option>
              <option value='income-statement'>Income Statement</option>
              <option value='cash-flow'>Cash Flow</option>
              <option value='balance-sheet'>Balance Sheet</option>
              <option value='profit-loss'>Profit & Loss</option>
            </select>
          </div>
        </div>
      </div>

      <div className='bg-surface shadow rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-neutral-200'>
          <thead className='bg-neutral-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Report Type
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Period
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Property
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Total Revenue
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Total Expenses
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Net Income
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Generated
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-surface divide-y divide-neutral-200'>
            {filteredReports.map((report) => (
              <tr key={report.id} className='hover:bg-neutral-50'>
                <td className='px-6 py-4 text-sm font-medium text-neutral-900 capitalize'>
                  {report.reportType.replace('-', ' ')}
                </td>
                <td className='px-6 py-4 text-sm text-neutral-900'>{report.period}</td>
                <td className='px-6 py-4 text-sm text-neutral-900'>
                  {report.propertyName || 'All Properties'}
                </td>
                <td className='px-6 py-4 text-sm text-success-600 font-semibold'>
                  KES {report.totalRevenue.toLocaleString()}
                </td>
                <td className='px-6 py-4 text-sm text-danger-600 font-semibold'>
                  KES {report.totalExpenses.toLocaleString()}
                </td>
                <td className='px-6 py-4 text-sm font-semibold text-neutral-900'>
                  KES {report.netIncome.toLocaleString()}
                </td>
                <td className='px-6 py-4 text-sm text-neutral-900'>{report.generatedDate}</td>
                <td className='px-6 py-4 text-sm space-x-2'>
                  <button  >
                    View
                  </button>
                  <button  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
