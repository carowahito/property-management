'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface TeamMemberWorkload {
  userId: string;
  userName: string;
  department: string;
  position: string;
  tasksAssigned: number;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksPending: number;
  tasksOverdue: number;
  completionRate: number;
  avgCompletionTime: number;
  workloadScore: number;
  efficiencyScore: number;
  trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
}

interface WorkloadInsights {
  summary: string;
  overloadedMembers: TeamMemberWorkload[];
  underutilizedMembers: TeamMemberWorkload[];
  topPerformers: TeamMemberWorkload[];
  needsAttention: TeamMemberWorkload[];
  recommendations: string[];
  teamHealth: number;
  generated: string;
}

export default function AIWorkloadPage() {
  const [insights, setInsights] = useState<WorkloadInsights | null>(null);
  const [workloads, setWorkloads] = useState<TeamMemberWorkload[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [insightsRes, workloadsRes] = await Promise.all([
        fetch('/api/ai/team-workload?type=insights'),
        fetch('/api/ai/team-workload?type=workloads'),
      ]);

      const insightsData = await insightsRes.json();
      const workloadsData = await workloadsRes.json();

      setInsights(insightsData);
      setWorkloads(workloadsData.workloads || []);
    } catch (error) {
      console.error('Error fetching workload data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'IMPROVING') return '📈';
    if (trend === 'DECLINING') return '📉';
    return '➡️';
  };

  const getWorkloadColor = (score: number) => {
    if (score > 70) return 'text-red-600';
    if (score > 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Analyzing team workload...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-3xl">👥</span> AI Workload Analysis
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered insights into team productivity and workload distribution
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/team"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Team Overview
          </Link>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Refresh Analysis
          </button>
        </div>
      </div>

      {insights && (
        <>
          {/* Team Health Score */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Team Health Score</h2>
              <div className={`text-6xl font-bold mb-2 ${getHealthColor(insights.teamHealth)}`}>
                {insights.teamHealth}%
              </div>
              <p className="text-gray-700">{insights.summary}</p>
              <p className="text-xs text-gray-500 mt-3">
                Last updated: {new Date(insights.generated).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📊 Overview
                </button>
                <button
                  onClick={() => setActiveTab('workloads')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                    activeTab === 'workloads'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📋 Team Workloads
                </button>
                <button
                  onClick={() => setActiveTab('insights')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                    activeTab === 'insights'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  💡 AI Insights
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">{workloads.length}</div>
                      <div className="text-sm text-gray-600">Active Members</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {insights.topPerformers.length}
                      </div>
                      <div className="text-sm text-gray-600">Top Performers</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-red-600">
                        {insights.overloadedMembers.length}
                      </div>
                      <div className="text-sm text-gray-600">Overloaded</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-yellow-600">
                        {insights.needsAttention.length}
                      </div>
                      <div className="text-sm text-gray-600">Needs Attention</div>
                    </div>
                  </div>

                  {/* Workload Distribution Chart */}
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Workload Distribution
                    </h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={workloads.slice(0, 10)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="userName" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="tasksAssigned" fill="#3b82f6" name="Assigned" />
                          <Bar dataKey="tasksCompleted" fill="#10b981" name="Completed" />
                          <Bar dataKey="tasksOverdue" fill="#ef4444" name="Overdue" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Top Performers */}
                  {insights.topPerformers.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                        <span>⭐</span> Top Performers
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {insights.topPerformers.map((member, idx) => (
                          <div
                            key={member.userId}
                            className="bg-white border border-green-200 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">{member.userName}</h4>
                              <span className="text-2xl">
                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '⭐'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{member.department}</p>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Efficiency:</span>
                                <span className="font-medium text-green-600">
                                  {member.efficiencyScore}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Completion:</span>
                                <span className="font-medium">{member.completionRate}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Tasks Done:</span>
                                <span className="font-medium">{member.tasksCompleted}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Workloads Tab */}
              {activeTab === 'workloads' && (
                <div className="space-y-4">
                  {workloads.map((member) => (
                    <div
                      key={member.userId}
                      className="bg-white border rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {member.userName}
                            </h3>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              {member.department}
                            </span>
                            <span className="text-lg">{getTrendIcon(member.trend)}</span>
                          </div>

                          <div className="grid grid-cols-5 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-gray-500">Assigned</p>
                              <p className="text-lg font-semibold">{member.tasksAssigned}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Completed</p>
                              <p className="text-lg font-semibold text-green-600">
                                {member.tasksCompleted}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">In Progress</p>
                              <p className="text-lg font-semibold text-blue-600">
                                {member.tasksInProgress}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Overdue</p>
                              <p className="text-lg font-semibold text-red-600">
                                {member.tasksOverdue}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Completion</p>
                              <p className="text-lg font-semibold">{member.completionRate}%</p>
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <div className="flex-1">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-600">Workload</span>
                                <span className={`font-medium ${getWorkloadColor(member.workloadScore)}`}>
                                  {member.workloadScore}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    member.workloadScore > 70
                                      ? 'bg-red-500'
                                      : member.workloadScore > 50
                                        ? 'bg-yellow-500'
                                        : 'bg-green-500'
                                  }`}
                                  style={{ width: `${member.workloadScore}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-600">Efficiency</span>
                                <span className="font-medium">{member.efficiencyScore}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${member.efficiencyScore}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <Link
                          href={`/admin/team/${member.userId}`}
                          className="ml-4 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Insights Tab */}
              {activeTab === 'insights' && (
                <div className="space-y-6">
                  {/* AI Recommendations */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                      <span>🤖</span> AI Recommendations
                    </h3>
                    <div className="space-y-3">
                      {insights.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-white rounded-lg p-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                            {idx + 1}
                          </span>
                          <p className="text-gray-700">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Overloaded Members */}
                  {insights.overloadedMembers.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                        <span>⚠️</span> Overloaded Team Members
                      </h3>
                      <div className="space-y-2">
                        {insights.overloadedMembers.map((member) => (
                          <div key={member.userId} className="bg-white rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{member.userName}</p>
                                <p className="text-sm text-gray-600">
                                  {member.tasksAssigned} tasks • {member.tasksOverdue} overdue
                                </p>
                              </div>
                              <span className="text-red-600 font-semibold">
                                {member.workloadScore}% workload
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Underutilized Members */}
                  {insights.underutilizedMembers.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                        <span>📊</span> Underutilized Team Members
                      </h3>
                      <div className="space-y-2">
                        {insights.underutilizedMembers.map((member) => (
                          <div key={member.userId} className="bg-white rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{member.userName}</p>
                                <p className="text-sm text-gray-600">
                                  {member.tasksAssigned} tasks assigned
                                </p>
                              </div>
                              <span className="text-yellow-600 font-semibold">
                                {member.workloadScore}% capacity
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Needs Attention */}
                  {insights.needsAttention.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
                        <span>👀</span> Needs Attention
                      </h3>
                      <div className="space-y-2">
                        {insights.needsAttention.map((member) => (
                          <div key={member.userId} className="bg-white rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{member.userName}</p>
                                <p className="text-sm text-gray-600">
                                  Trend: {member.trend} • {member.tasksOverdue} overdue tasks
                                </p>
                              </div>
                              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                                Review Required
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
