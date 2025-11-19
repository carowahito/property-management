'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const stats = {
    totalRevenue: 1800000,
    revenueChange: 12.5,
    occupancyRate: 87.5,
    occupancyChange: 3.2,
    avgRentPrice: 62000,
    priceChange: -2.1,
    maintenanceCost: 145000,
    costChange: 8.4,
  };

  const monthlyData = [
    { month: 'Jun', revenue: 1600000, expenses: 120000 },
    { month: 'Jul', revenue: 1650000, expenses: 135000 },
    { month: 'Aug', revenue: 1700000, expenses: 142000 },
    { month: 'Sep', revenue: 1750000, expenses: 138000 },
    { month: 'Oct', revenue: 1780000, expenses: 145000 },
    { month: 'Nov', revenue: 1800000, expenses: 145000 },
  ];

  const propertyPerformance = [
    { name: 'Sunset Apartments', revenue: 540000, occupancy: 92, units: 12 },
    { name: 'Highland House', revenue: 600000, occupancy: 88, units: 8 },
    { name: 'Vista Plaza', revenue: 480000, occupancy: 80, units: 4 },
    { name: 'Garden Estate', revenue: 180000, occupancy: 75, units: 3 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenue Analytics</h1>
          <p className="text-gray-600 mt-1">Track performance and insights across your portfolio</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {/* Custom Date Range */}
      {timeRange === 'custom' && (
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Apply
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <span
              className={`text-xs font-semibold ${stats.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {stats.revenueChange >= 0 ? '↑' : '↓'} {Math.abs(stats.revenueChange)}%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            KES {stats.totalRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">from last period</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Occupancy Rate</p>
            <span
              className={`text-xs font-semibold ${stats.occupancyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {stats.occupancyChange >= 0 ? '↑' : '↓'} {Math.abs(stats.occupancyChange)}%
            </span>
          </div>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.occupancyRate}%</p>
          <p className="text-xs text-gray-500 mt-1">across all properties</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Avg Rent Price</p>
            <span
              className={`text-xs font-semibold ${stats.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {stats.priceChange >= 0 ? '↑' : '↓'} {Math.abs(stats.priceChange)}%
            </span>
          </div>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            KES {stats.avgRentPrice.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">per unit</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Maintenance Cost</p>
            <span
              className={`text-xs font-semibold ${stats.costChange <= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {stats.costChange >= 0 ? '↑' : '↓'} {Math.abs(stats.costChange)}%
            </span>
          </div>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            KES {stats.maintenanceCost.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">this period</p>
        </div>
      </div>

      {/* Revenue Trend Chart with Recharts */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue & Expense Trend</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `KES ${(value / 1000).toFixed(0)}K`} />
              <Tooltip
                formatter={(value: any) => `KES ${value.toLocaleString()}`}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Revenue"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#f87171"
                fillOpacity={1}
                fill="url(#colorExpenses)"
                name="Expenses"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Property Performance with Recharts */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Performance</h2>

        {/* Bar Chart */}
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={propertyPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" tickFormatter={(value) => `KES ${(value / 1000).toFixed(0)}K`} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
              <Tooltip
                formatter={(value: any, name: string) => {
                  if (name === 'Occupancy') return `${value}%`;
                  return `KES ${value.toLocaleString()}`;
                }}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Revenue" />
              <Bar yAxisId="right" dataKey="occupancy" fill="#10b981" name="Occupancy" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Units
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Occupancy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {propertyPerformance.map((property, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {property.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {property.units}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">
                        {property.occupancy}%
                      </span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            property.occupancy >= 90
                              ? 'bg-green-500'
                              : property.occupancy >= 75
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                          }`}
                          style={{ width: `${property.occupancy}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    KES {property.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        property.occupancy >= 90
                          ? 'bg-green-100 text-green-800'
                          : property.occupancy >= 75
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {property.occupancy >= 90
                        ? 'Excellent'
                        : property.occupancy >= 75
                          ? 'Good'
                          : 'Needs Attention'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
