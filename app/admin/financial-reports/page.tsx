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
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalPayouts, setTotalPayouts] = useState(0);

  useEffect(() => {
    fetch('/api/payments?status=PAID&limit=500')
      .then(r => r.json())
      .then(data => {
        const rev = (data.payments || []).reduce((sum: number, p: any) => sum + Number(p.amount), 0);
        setTotalRevenue(rev);
      })
      .catch(() => {});
    fetch('/api/payouts?limit=500')
      .then(r => r.json())
      .then(data => {
        const paid = (data.payouts || []).reduce((sum: number, p: any) => sum + Number(p.amount), 0);
        setTotalPayouts(paid);
      })
      .catch(() => {});
  }, []);

  const [filterType, setFilterType] = useState<string>('all');
  const [timePeriod, setTimePeriod] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  const filteredReports = reports.filter(
    (r) => filterType === 'all' || r.reportType === filterType
  );

  const netIncome = totalRevenue - totalPayouts;
  const profitMargin = totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : '0.0';
  const stats = {
    totalRevenue,
    totalExpenses: totalPayouts,
    netIncome,
    profitMargin,
  };

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Financial Reports</h1>
          <p className='text-gray-600 mt-1'>Generate and analyze comprehensive financial reports</p>
        </div>
        <Button variant="primary" size="lg">+ Generate Report</Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Total Revenue</p>
          <p className='text-3xl font-bold text-green-600'>
            KES {stats.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Total Payouts</p>
          <p className='text-3xl font-bold text-red-600'>
            KES {stats.totalExpenses.toLocaleString()}
          </p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Net Income</p>
          <p className='text-3xl font-bold text-blue-600'>KES {stats.netIncome.toLocaleString()}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Profit Margin</p>
          <p className='text-3xl font-bold text-purple-600'>{stats.profitMargin}%</p>
        </div>
      </div>

      <div className='bg-white shadow rounded-lg p-4 space-y-4'>
        <div className='flex flex-wrap gap-4 items-end'>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
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

      <div className='bg-white shadow rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Report Type
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Period
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Property
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Total Revenue
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Total Expenses
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Net Income
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Generated
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {filteredReports.map((report) => (
              <tr key={report.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 text-sm font-medium text-gray-900 capitalize'>
                  {report.reportType.replace('-', ' ')}
                </td>
                <td className='px-6 py-4 text-sm text-gray-900'>{report.period}</td>
                <td className='px-6 py-4 text-sm text-gray-900'>
                  {report.propertyName || 'All Properties'}
                </td>
                <td className='px-6 py-4 text-sm text-green-600 font-semibold'>
                  KES {report.totalRevenue.toLocaleString()}
                </td>
                <td className='px-6 py-4 text-sm text-red-600 font-semibold'>
                  KES {report.totalExpenses.toLocaleString()}
                </td>
                <td className='px-6 py-4 text-sm font-semibold text-gray-900'>
                  KES {report.netIncome.toLocaleString()}
                </td>
                <td className='px-6 py-4 text-sm text-gray-900'>{report.generatedDate}</td>
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
