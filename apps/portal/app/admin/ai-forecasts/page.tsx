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

interface RevenueForecast {
  month: string;
  predicted: number;
  confidence: { lower: number; upper: number };
  growthRate: number;
}

interface ChurnRisk {
  tenantId: string;
  tenantName: string;
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
  riskFactors: string[];
  retentionActions: string[];
  leaseEndDate: string;
}

export default function AIForecastsPage() {
  const [revenueForecast, setRevenueForecast] = useState<any>(null);
  const [churnRisks, setChurnRisks] = useState<ChurnRisk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForecasts();
  }, []);

  const fetchForecasts = async () => {
    setLoading(true);
    try {
      const [revenueRes, churnRes] = await Promise.all([
        fetch('/api/ai/forecast?type=revenue'),
        fetch('/api/ai/forecast?type=churn'),
      ]);

      const revenueData = await revenueRes.json();
      const churnData = await churnRes.json();

      setRevenueForecast(revenueData);
      setChurnRisks(churnData.risks || []);
    } catch (error) {
      console.error('Error fetching forecasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH':
        return 'bg-danger-100 text-red-800 border-danger-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-success-100 text-green-800 border-green-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Generating forecasts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-2">
            <span className="text-3xl">📈</span> AI Predictive Analytics
          </h1>
          <p className="text-neutral-600 mt-1">
            Revenue forecasts, occupancy predictions, and churn risk analysis
          </p>
        </div>
        <button
          onClick={fetchForecasts}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          Refresh Forecasts
        </button>
      </div>

      {/* Revenue Forecast */}
      {revenueForecast && revenueForecast.forecasts && (
        <div className="bg-surface rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-neutral-900 mb-2">Revenue Forecast (Next 6 Months)</h2>
            <p className="text-sm text-neutral-600">
              Confidence Level: {revenueForecast.confidence}%
            </p>
          </div>

          {/* Chart */}
          <div className="h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueForecast.forecasts}>
                <defs>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis
                  tickFormatter={(value) => `KES ${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  formatter={(value: any) => `KES ${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: '8px' }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorPredicted)"
                  name="Predicted Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="confidence.upper"
                  stroke="#94a3b8"
                  strokeDasharray="3 3"
                  dot={false}
                  name="Upper Confidence"
                />
                <Line
                  type="monotone"
                  dataKey="confidence.lower"
                  stroke="#94a3b8"
                  strokeDasharray="3 3"
                  dot={false}
                  name="Lower Confidence"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Forecast Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Month
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Predicted Revenue
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Confidence Range
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Growth Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-neutral-200">
                {revenueForecast.forecasts.map((forecast: RevenueForecast, idx: number) => (
                  <tr key={idx} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                      {forecast.month}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-900">
                      KES {forecast.predicted.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600">
                      KES {forecast.confidence.lower.toLocaleString()} -{' '}
                      {forecast.confidence.upper.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          forecast.growthRate > 0
                            ? 'bg-success-100 text-green-800'
                            : 'bg-danger-100 text-red-800'
                        }`}
                      >
                        {forecast.growthRate > 0 ? '↑' : '↓'} {Math.abs(forecast.growthRate)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AI Summary */}
          <div className="mt-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
            <h3 className="font-semibold text-neutral-900 mb-2">AI Analysis</h3>
            <p className="text-sm text-neutral-700 whitespace-pre-line">
              {revenueForecast.summary}
            </p>
          </div>
        </div>
      )}

      {/* Tenant Churn Risk */}
      {churnRisks.length > 0 && (
        <div className="bg-surface rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Tenant Retention Risk Analysis</h2>
          <p className="text-sm text-neutral-600 mb-6">
            Tenants identified as requiring proactive retention efforts
          </p>

          {/* Risk Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-danger-600">
                {churnRisks.filter((r) => r.riskScore === 'HIGH').length}
              </div>
              <div className="text-sm text-neutral-600">High Risk</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {churnRisks.filter((r) => r.riskScore === 'MEDIUM').length}
              </div>
              <div className="text-sm text-neutral-600">Medium Risk</div>
            </div>
            <div className="bg-success-50 border border-green-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-success-600">
                {churnRisks.filter((r) => r.riskScore === 'LOW').length}
              </div>
              <div className="text-sm text-neutral-600">Low Risk</div>
            </div>
          </div>

          {/* Risk Details */}
          <div className="space-y-4">
            {churnRisks.map((risk, idx) => (
              <div
                key={idx}
                className={`border rounded-lg p-4 ${getRiskColor(risk.riskScore)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{risk.tenantName}</h3>
                    <p className="text-sm mt-1">
                      Lease Ends: {new Date(risk.leaseEndDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-current/20">
                    {risk.riskScore} RISK
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Risk Factors:</h4>
                    <ul className="space-y-1">
                      {risk.riskFactors.map((factor, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span>•</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Retention Actions:</h4>
                    <ul className="space-y-1">
                      {risk.retentionActions.map((action, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span>→</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
