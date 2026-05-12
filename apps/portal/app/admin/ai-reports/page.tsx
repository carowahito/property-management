'use client';

import { useState } from 'react';

export default function AIReportsPage() {
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [reportType, setReportType] = useState('executive');

  const generateReport = async (type: string) => {
    setGenerating(true);
    setReportType(type);
    try {
      const response = await fetch(`/api/ai/report?type=${type}`);
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;

    const blob = new Blob([report.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.type}-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-2">
            <span className="text-3xl">📄</span> AI Report Generation
          </h1>
          <p className="text-neutral-600 mt-1">
            Generate comprehensive AI-powered reports for stakeholders
          </p>
        </div>

        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface rounded-lg shadow p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-2xl">
                📊
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Executive Report
                </h3>
                <p className="text-sm text-neutral-600 mb-4">
                  Comprehensive portfolio overview with financial performance, operational
                  highlights, property analysis, trends, and strategic recommendations.
                </p>
                <button
                  onClick={() => generateReport('executive')}
                  disabled={generating}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                >
                  {generating && reportType === 'executive' ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-lg shadow p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center text-2xl">
                📅
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Monthly Summary</h3>
                <p className="text-sm text-neutral-600 mb-4">
                  Concise monthly digest with key metrics, highlights, areas of focus, and
                  quick action items. Perfect for email distribution.
                </p>
                <button
                  onClick={() => generateReport('monthly')}
                  disabled={generating}
                  className="px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition disabled:opacity-50"
                >
                  {generating && reportType === 'monthly' ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Report */}
        {report && (
          <div className="bg-surface rounded-lg shadow overflow-hidden">
            {/* Report Header */}
            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    {report.type === 'executive' ? 'Executive Report' : 'Monthly Summary'}
                  </h2>
                  <p className="text-primary-100">
                    {report.period || report.month} • Generated on{' '}
                    {new Date(report.generated).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={downloadReport}
                  className="px-4 py-2 bg-surface text-primary-600 rounded-lg hover:bg-primary-50 transition font-medium"
                >
                  Download
                </button>
              </div>
            </div>

            {/* Report Content */}
            <div className="p-8">
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-line text-neutral-700 leading-relaxed">
                  {report.content}
                </div>
              </div>

              {/* Report Data Summary (if available) */}
              {report.data && (
                <div className="mt-8 pt-8 border-t border-neutral-200">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Data Summary</h3>

                  {report.data.financial && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-primary-50 rounded-lg p-4">
                        <p className="text-sm text-neutral-600">Revenue</p>
                        <p className="text-xl font-bold text-primary-600">
                          KES {report.data.financial.revenue?.toLocaleString()}
                        </p>
                        {report.data.financial.revenueChange && (
                          <p className="text-xs text-neutral-600 mt-1">
                            {report.data.financial.revenueChange > 0 ? '↑' : '↓'}{' '}
                            {Math.abs(report.data.financial.revenueChange)}%
                          </p>
                        )}
                      </div>
                      <div className="bg-success-50 rounded-lg p-4">
                        <p className="text-sm text-neutral-600">Net Income</p>
                        <p className="text-xl font-bold text-success-600">
                          KES {report.data.financial.netIncome?.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <p className="text-sm text-neutral-600">Maintenance</p>
                        <p className="text-xl font-bold text-yellow-600">
                          KES {report.data.financial.maintenanceCost?.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <p className="text-sm text-neutral-600">Occupancy</p>
                        <p className="text-xl font-bold text-purple-600">
                          {report.data.operational?.occupancyRate}%
                        </p>
                      </div>
                    </div>
                  )}

                  {report.data.properties && report.data.properties.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-3">Property Performance</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-200">
                          <thead className="bg-neutral-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                                Property
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                                Units
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                                Occupancy
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                                Revenue
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-surface divide-y divide-neutral-200">
                            {report.data.properties.map((prop: any, idx: number) => (
                              <tr key={idx}>
                                <td className="px-4 py-2 text-sm text-neutral-900">{prop.name}</td>
                                <td className="px-4 py-2 text-sm text-neutral-600">{prop.units}</td>
                                <td className="px-4 py-2 text-sm text-neutral-600">
                                  {prop.occupancy}%
                                </td>
                                <td className="px-4 py-2 text-sm text-neutral-900">
                                  KES {prop.revenue?.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Box */}
        {!report && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h3 className="font-semibold text-primary-900 mb-2">About AI Reports</h3>
                <p className="text-sm text-primary-800 mb-3">
                  Our AI analyzes your property data and generates professional reports with:
                </p>
                <ul className="text-sm text-primary-800 space-y-1">
                  <li>• Executive summaries and key insights</li>
                  <li>• Financial and operational analysis</li>
                  <li>• Property-by-property performance breakdown</li>
                  <li>• Trend identification and forecasting</li>
                  <li>• Strategic recommendations and action items</li>
                </ul>
                <p className="text-sm text-primary-800 mt-3">
                  Reports can be downloaded and shared with stakeholders.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
