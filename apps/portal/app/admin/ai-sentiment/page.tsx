'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PortfolioSentiment {
  overallScore: number;
  trend: string;
  breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topConcerns: string[];
  propertiesNeedingAttention: string[];
}

export default function AISentimentPage() {
  const [sentiment, setSentiment] = useState<PortfolioSentiment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSentiment();
  }, []);

  const fetchSentiment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/sentiment?type=portfolio');
      const data = await response.json();
      setSentiment(data);
    } catch (error) {
      console.error('Error fetching sentiment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (score: number) => {
    if (score >= 80) return 'text-success-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-danger-600';
  };

  const getSentimentEmoji = (score: number) => {
    if (score >= 80) return '😊';
    if (score >= 60) return '😐';
    return '😟';
  };

  const pieData = sentiment
    ? [
        { name: 'Positive', value: sentiment.breakdown.positive, color: '#10b981' },
        { name: 'Neutral', value: sentiment.breakdown.neutral, color: '#f59e0b' },
        { name: 'Negative', value: sentiment.breakdown.negative, color: '#ef4444' },
      ]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Analyzing sentiment...</p>
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
            <span className="text-3xl">💬</span> Tenant Sentiment Analysis
          </h1>
          <p className="text-neutral-600 mt-1">
            AI-powered analysis of tenant communications and satisfaction
          </p>
        </div>
        <button
          onClick={fetchSentiment}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          Refresh Analysis
        </button>
      </div>

      {sentiment && (
        <>
          {/* Overall Sentiment Score */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-8">
            <div className="text-center">
              <div className="text-6xl mb-3">{getSentimentEmoji(sentiment.overallScore)}</div>
              <h2 className="text-4xl font-bold mb-2">
                <span className={getSentimentColor(sentiment.overallScore)}>
                  {sentiment.overallScore}%
                </span>
              </h2>
              <p className="text-lg text-neutral-700">Overall Tenant Satisfaction</p>
              <p className="text-sm text-neutral-600 mt-2">{sentiment.trend}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sentiment Breakdown */}
            <div className="bg-surface rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Sentiment Breakdown
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between p-2 bg-success-50 rounded">
                  <span className="text-sm font-medium text-neutral-700">😊 Positive</span>
                  <span className="text-sm font-bold text-success-600">
                    {sentiment.breakdown.positive}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                  <span className="text-sm font-medium text-neutral-700">😐 Neutral</span>
                  <span className="text-sm font-bold text-yellow-600">
                    {sentiment.breakdown.neutral}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-danger-50 rounded">
                  <span className="text-sm font-medium text-neutral-700">😟 Negative</span>
                  <span className="text-sm font-bold text-danger-600">
                    {sentiment.breakdown.negative}%
                  </span>
                </div>
              </div>
            </div>

            {/* Top Concerns */}
            <div className="bg-surface rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Top Areas of Concern
              </h3>
              {sentiment.topConcerns.length > 0 ? (
                <div className="space-y-3">
                  {sentiment.topConcerns.map((concern, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-danger-50 border border-danger-200 rounded-lg"
                    >
                      <span className="flex-shrink-0 w-6 h-6 bg-danger-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {idx + 1}
                      </span>
                      <span className="text-neutral-700 capitalize">{concern}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-neutral-600">No major concerns identified</p>
                </div>
              )}
            </div>
          </div>

          {/* Properties Needing Attention */}
          {sentiment.propertiesNeedingAttention.length > 0 && (
            <div className="bg-surface rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <span>⚠️</span> Properties Requiring Attention
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sentiment.propertiesNeedingAttention.map((property, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <h4 className="font-semibold text-neutral-900">{property}</h4>
                    <p className="text-sm text-neutral-600 mt-1">
                      Declining tenant sentiment detected
                    </p>
                    <button className="mt-3 text-sm text-primary-600 hover:text-primary-800 font-medium">
                      View Details →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-surface rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              💡 AI Recommendations
            </h3>
            <div className="space-y-3">
              {sentiment.overallScore < 70 && (
                <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-2">Urgent Action Required</h4>
                  <ul className="space-y-1 text-sm text-red-800">
                    <li>• Schedule immediate tenant satisfaction survey</li>
                    <li>• Review and address top concerns systematically</li>
                    <li>• Increase communication frequency with affected tenants</li>
                  </ul>
                </div>
              )}

              {sentiment.breakdown.negative > 15 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">
                    Moderate Concerns Detected
                  </h4>
                  <ul className="space-y-1 text-sm text-yellow-800">
                    <li>• Proactively reach out to tenants with negative sentiment</li>
                    <li>• Improve response times for maintenance requests</li>
                    <li>• Consider tenant appreciation initiatives</li>
                  </ul>
                </div>
              )}

              {sentiment.overallScore >= 80 && (
                <div className="p-4 bg-success-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-success-900 mb-2">Excellent Performance</h4>
                  <ul className="space-y-1 text-sm text-green-800">
                    <li>• Continue current tenant engagement strategies</li>
                    <li>• Document best practices for replication</li>
                    <li>• Consider tenant referral incentive program</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
