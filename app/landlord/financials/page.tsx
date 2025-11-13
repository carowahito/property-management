'use client'

import { useState } from 'react'

export default function LandlordFinancials() {
  const [selectedPeriod, setSelectedPeriod] = useState('this-month')

  const financialSummary = {
    totalRevenue: 189000,
    collectedRent: 175000,
    pendingRent: 14000,
    expenses: 42000,
    netIncome: 147000,
    profitMargin: 77.8
  }

  const transactions = [
    { id: 1, date: '2025-11-05', tenant: 'John Smith', unit: '4B', amount: 1500, type: 'rent', status: 'completed' },
    { id: 2, date: '2025-11-04', vendor: 'Quick Fix Plumbing', amount: -250, type: 'maintenance', status: 'completed' },
    { id: 3, date: '2025-11-03', tenant: 'Sarah Johnson', unit: '7A', amount: 1800, type: 'rent', status: 'completed' },
    { id: 4, date: '2025-11-02', vendor: 'Cleaning Services Inc', amount: -150, type: 'service', status: 'completed' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Financial Overview</h1>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="this-month">This Month</option>
          <option value="last-month">Last Month</option>
          <option value="this-quarter">This Quarter</option>
          <option value="this-year">This Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <span className="text-3xl mb-2 block">💰</span>
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600">${financialSummary.totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">${financialSummary.collectedRent.toLocaleString()} collected</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <span className="text-3xl mb-2 block">📤</span>
          <p className="text-sm text-gray-600">Total Expenses</p>
          <p className="text-3xl font-bold text-red-600">${financialSummary.expenses.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">22% of revenue</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <span className="text-3xl mb-2 block">📊</span>
          <p className="text-sm text-gray-600">Net Income</p>
          <p className="text-3xl font-bold text-blue-600">${financialSummary.netIncome.toLocaleString()}</p>
          <p className="text-xs text-green-500 mt-1">+{financialSummary.profitMargin}% margin</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map(tx => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.date}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {tx.tenant || tx.vendor} {tx.unit ? `- Unit ${tx.unit}` : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {tx.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span className={tx.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                    ${Math.abs(tx.amount)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
