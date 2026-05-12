'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ExecutiveInsight {
  summary: string;
  highlights: string[];
  concerns: string[];
  recommendations: string[];
  generated: string;
}

interface AnomalyReport {
  critical: any[];
  high: any[];
  medium: any[];
  low: any[];
  summary: string;
}

export default function AIInsightsPage() {
  const [insights, setInsights] = useState<ExecutiveInsight | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('insights');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [insightsRes, anomaliesRes] = await Promise.all([
        fetch('/api/ai/insights?type=executive'),
        fetch('/api/ai/anomalies'),
      ]);

      const insightsData = await insightsRes.json();
      const anomaliesData = await anomaliesRes.json();

      setInsights(insightsData);
      setAnomalies(anomaliesData);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-danger-100 text-red-800 border-danger-200';
      case 'HIGH':
        return 'bg-warning-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-primary-100 text-primary-800 border-primary-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Generating AI insights...</p>
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
            <span className="text-3xl">🤖</span> AI Insights Dashboard
          </h1>
          <p className="text-neutral-600 mt-1">
            Intelligent analysis and recommendations powered by AI
          </p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          Refresh Insights
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-surface rounded-lg shadow">
        <div className="border-b border-neutral-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'insights'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              💡 Executive Insights
            </button>
            <button
              onClick={() => setActiveTab('anomalies')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'anomalies'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              ⚠️ Anomaly Alerts
              {anomalies &&
                (anomalies.critical.length > 0 || anomalies.high.length > 0) && (
                  <span className="ml-2 px-2 py-1 text-xs bg-danger-500 text-white rounded-full">
                    {anomalies.critical.length + anomalies.high.length}
                  </span>
                )}
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'insights' && insights && (
            <div className="space-y-6">
              {/* AI Summary */}
              <div className="bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🎯</div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-neutral-900 mb-2">
                      Executive Summary
                    </h2>
                    <p className="text-neutral-700 leading-relaxed">{insights.summary}</p>
                    <p className="text-xs text-neutral-500 mt-3">
                      Generated: {new Date(insights.generated).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Highlights */}
              <div className="bg-success-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">✨</span>
                  <h3 className="text-lg font-semibold text-neutral-900">Key Highlights</h3>
                </div>
                <ul className="space-y-2">
                  {insights.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-success-600 mt-1">✓</span>
                      <span className="text-neutral-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Concerns */}
              {insights.concerns.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">⚠️</span>
                    <h3 className="text-lg font-semibold text-neutral-900">
                      Areas Needing Attention
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {insights.concerns.map((concern, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">!</span>
                        <span className="text-neutral-700">{concern}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🎯</span>
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Strategic Recommendations
                  </h3>
                </div>
                <div className="space-y-3">
                  {insights.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 bg-surface rounded-lg p-3 border border-purple-100"
                    >
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {idx + 1}
                      </span>
                      <span className="text-neutral-700">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'anomalies' && anomalies && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <p className="text-neutral-700">{anomalies.summary}</p>
              </div>

              {/* Critical Anomalies */}
              {anomalies.critical.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-danger-600 mb-3 flex items-center gap-2">
                    🚨 Critical Alerts ({anomalies.critical.length})
                  </h3>
                  <div className="space-y-3">
                    {anomalies.critical.map((anomaly, idx) => (
                      <div
                        key={idx}
                        className={`border rounded-lg p-4 ${getSeverityColor(anomaly.severity)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{anomaly.metric}</h4>
                            {anomaly.propertyName && (
                              <p className="text-sm mt-1">Property: {anomaly.propertyName}</p>
                            )}
                            <p className="mt-2">{anomaly.description}</p>
                            <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                              <div>
                                <span className="font-medium">Current:</span>{' '}
                                {anomaly.currentValue.toLocaleString()}
                              </div>
                              <div>
                                <span className="font-medium">Expected:</span>{' '}
                                {anomaly.expectedValue.toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-danger-600 text-white text-xs font-semibold rounded-full">
                            {anomaly.severity}
                          </span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-current/20">
                          <p className="font-medium mb-2">Recommended Actions:</p>
                          <ul className="space-y-1">
                            {anomaly.recommendedActions.map((action: string, i: number) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <span>→</span>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* High Priority Anomalies */}
              {anomalies.high.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-warning-600 mb-3 flex items-center gap-2">
                    ⚡ High Priority Alerts ({anomalies.high.length})
                  </h3>
                  <div className="space-y-3">
                    {anomalies.high.map((anomaly, idx) => (
                      <div
                        key={idx}
                        className={`border rounded-lg p-4 ${getSeverityColor(anomaly.severity)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{anomaly.metric}</h4>
                            {anomaly.propertyName && (
                              <p className="text-sm mt-1">Property: {anomaly.propertyName}</p>
                            )}
                            <p className="mt-2 text-sm">{anomaly.description}</p>
                          </div>
                          <span className="px-2 py-1 bg-warning-600 text-white text-xs font-semibold rounded-full">
                            {anomaly.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medium Priority Anomalies */}
              {anomalies.medium.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-yellow-600 mb-3 flex items-center gap-2">
                    ⚠️ Medium Priority Alerts ({anomalies.medium.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {anomalies.medium.map((anomaly, idx) => (
                      <div
                        key={idx}
                        className={`border rounded-lg p-3 ${getSeverityColor(anomaly.severity)}`}
                      >
                        <h4 className="font-semibold text-sm">{anomaly.metric}</h4>
                        {anomaly.propertyName && (
                          <p className="text-xs mt-1">{anomaly.propertyName}</p>
                        )}
                        <p className="mt-1 text-xs">{anomaly.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Anomalies */}
              {anomalies.critical.length === 0 &&
                anomalies.high.length === 0 &&
                anomalies.medium.length === 0 && (
                  <div className="bg-success-50 border border-green-200 rounded-lg p-8 text-center">
                    <div className="text-4xl mb-3">✅</div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      All Systems Normal
                    </h3>
                    <p className="text-neutral-600">
                      No significant anomalies detected. All metrics are within expected ranges.
                    </p>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
