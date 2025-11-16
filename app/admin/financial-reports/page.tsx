'use client';

import { useState } from 'react';
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
  const [reports] = useState<Report[]>([
    {
      id: '1',
      reportType: 'income-statement',
      period: 'Feb 2024',
      totalRevenue: 5770000,
      totalExpenses: 1850000,
      netIncome: 3920000,
      generatedDate: '2024-03-01',
    },
    {
      id: '2',
      reportType: 'cash-flow',
      period: 'Feb 2024',
      totalRevenue: 5770000,
      totalExpenses: 2100000,
      netIncome: 3670000,
      generatedDate: '2024-03-01',
    },
    {
      id: '3',
      reportType: 'profit-loss',
      period: 'Jan 2024',
      totalRevenue: 5450000,
      totalExpenses: 1750000,
      netIncome: 3700000,
      generatedDate: '2024-02-01',
    },
    {
      id: '4',
      reportType: 'income-statement',
      period: 'Jan 2024',
      propertyName: 'Vista Plaza',
      totalRevenue: 2160000,
      totalExpenses: 580000,
      netIncome: 1580000,
      generatedDate: '2024-02-01',
    },
  ]);

  const [filterType, setFilterType] = useState<string>('all');
  const filteredReports = reports.filter(
    (r) => filterType === 'all' || r.reportType === filterType
  );

  const stats = {
    totalRevenue:
      reports.filter((r) => r.period === 'Feb 2024').reduce((sum, r) => sum + r.totalRevenue, 0) /
      2,
    totalExpenses:
      reports.filter((r) => r.period === 'Feb 2024').reduce((sum, r) => sum + r.totalExpenses, 0) /
      2,
    netIncome:
      reports.filter((r) => r.period === 'Feb 2024').reduce((sum, r) => sum + r.netIncome, 0) / 2,
    profitMargin: (
      (reports.filter((r) => r.period === 'Feb 2024').reduce((sum, r) => sum + r.netIncome, 0) /
        2 /
        (reports
          .filter((r) => r.period === 'Feb 2024')
          .reduce((sum, r) => sum + r.totalRevenue, 0) /
          2)) *
      100
    ).toFixed(1),
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
          <p className='text-sm text-gray-600'>Total Revenue (Feb)</p>
          <p className='text-3xl font-bold text-green-600'>
            KES {stats.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Total Expenses (Feb)</p>
          <p className='text-3xl font-bold text-red-600'>
            KES {stats.totalExpenses.toLocaleString()}
          </p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Net Income (Feb)</p>
          <p className='text-3xl font-bold text-blue-600'>KES {stats.netIncome.toLocaleString()}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Profit Margin</p>
          <p className='text-3xl font-bold text-purple-600'>{stats.profitMargin}%</p>
        </div>
      </div>

      <div className='bg-white shadow rounded-lg p-4'>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className='px-4 py-2 border border-gray-300 rounded-lg'
        >
          <option value='all'>All Report Types</option>
          <option value='income-statement'>Income Statement</option>
          <option value='cash-flow'>Cash Flow</option>
          <option value='balance-sheet'>Balance Sheet</option>
          <option value='profit-loss'>Profit & Loss</option>
        </select>
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
