'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  department: string;
  score: number;
  tasksCompleted: number;
  completionRate: number;
  efficiencyScore: number;
  badge?: string;
  achievement?: string;
}

export default function TeamLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ai/team-workload?type=leaderboard&period=${period}`);
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  const getRankClass = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 border-yellow-300';
    if (rank === 2) return 'bg-gray-100 border-gray-300';
    if (rank === 3) return 'bg-orange-100 border-orange-300';
    return 'bg-white border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leaderboard...</p>
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
            <span className="text-3xl">🏆</span> Team Leaderboard
          </h1>
          <p className="text-gray-600 mt-1">
            Performance rankings based on task completion and efficiency
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/team/ai-workload"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Workload Analysis
          </Link>
          <button
            onClick={fetchLeaderboard}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('week')}
            className={`px-4 py-2 rounded-lg transition ${
              period === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-lg transition ${
              period === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setPeriod('quarter')}
            className={`px-4 py-2 rounded-lg transition ${
              period === 'quarter'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Quarter
          </button>
        </div>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
          {/* 2nd Place */}
          <div className="flex flex-col items-center pt-12">
            <div className="text-6xl mb-3">🥈</div>
            <div className="w-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-6 text-center border-2 border-gray-300 shadow-lg">
              <div className="text-4xl font-bold text-gray-700 mb-2">#2</div>
              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                {leaderboard[1].userName}
              </h3>
              <p className="text-sm text-gray-600 mb-3">{leaderboard[1].department}</p>
              <div className="bg-white rounded-lg p-3 mb-2">
                <div className="text-2xl font-bold text-blue-600">{leaderboard[1].score}</div>
                <div className="text-xs text-gray-600">points</div>
              </div>
              {leaderboard[1].achievement && (
                <div className="flex items-center justify-center gap-1 text-sm">
                  <span>{leaderboard[1].badge}</span>
                  <span className="text-gray-700">{leaderboard[1].achievement}</span>
                </div>
              )}
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center">
            <div className="text-8xl mb-3">🥇</div>
            <div className="w-full bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg p-6 text-center border-2 border-yellow-400 shadow-xl transform scale-105">
              <div className="text-5xl font-bold text-yellow-600 mb-2">#1</div>
              <h3 className="font-semibold text-xl text-gray-900 mb-1">
                {leaderboard[0].userName}
              </h3>
              <p className="text-sm text-gray-600 mb-3">{leaderboard[0].department}</p>
              <div className="bg-white rounded-lg p-4 mb-2">
                <div className="text-3xl font-bold text-yellow-600">{leaderboard[0].score}</div>
                <div className="text-xs text-gray-600">points</div>
              </div>
              {leaderboard[0].achievement && (
                <div className="flex items-center justify-center gap-1 text-sm">
                  <span>{leaderboard[0].badge}</span>
                  <span className="text-gray-700">{leaderboard[0].achievement}</span>
                </div>
              )}
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center pt-12">
            <div className="text-6xl mb-3">🥉</div>
            <div className="w-full bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg p-6 text-center border-2 border-orange-300 shadow-lg">
              <div className="text-4xl font-bold text-orange-700 mb-2">#3</div>
              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                {leaderboard[2].userName}
              </h3>
              <p className="text-sm text-gray-600 mb-3">{leaderboard[2].department}</p>
              <div className="bg-white rounded-lg p-3 mb-2">
                <div className="text-2xl font-bold text-blue-600">{leaderboard[2].score}</div>
                <div className="text-xs text-gray-600">points</div>
              </div>
              {leaderboard[2].achievement && (
                <div className="flex items-center justify-center gap-1 text-sm">
                  <span>{leaderboard[2].badge}</span>
                  <span className="text-gray-700">{leaderboard[2].achievement}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Full Rankings</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {leaderboard.map((entry) => (
            <div
              key={entry.userId}
              className={`px-6 py-4 hover:bg-gray-50 transition ${
                entry.rank <= 3 ? getRankClass(entry.rank) + ' border-l-4' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Rank */}
                  <div className="w-16 text-center">
                    <div className="text-2xl font-bold text-gray-700">
                      {getMedalIcon(entry.rank) || `#${entry.rank}`}
                    </div>
                  </div>

                  {/* Member Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{entry.userName}</h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {entry.department}
                      </span>
                      {entry.badge && (
                        <span className="flex items-center gap-1 text-sm">
                          <span className="text-lg">{entry.badge}</span>
                          <span className="text-gray-600">{entry.achievement}</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Score:</span>
                        <span className="ml-1 font-semibold text-blue-600">{entry.score}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Completed:</span>
                        <span className="ml-1 font-semibold">{entry.tasksCompleted}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Completion:</span>
                        <span className="ml-1 font-semibold">{entry.completionRate}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Efficiency:</span>
                        <span className="ml-1 font-semibold">{entry.efficiencyScore}%</span>
                      </div>
                    </div>
                  </div>

                  {/* View Details */}
                  <Link
                    href={`/admin/team/${entry.userId}`}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scoring Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How Scoring Works</h3>
        <div className="grid grid-cols-3 gap-4 text-sm text-blue-800">
          <div>
            <div className="font-semibold mb-1">40% Completion Rate</div>
            <p>Percentage of tasks completed vs. assigned</p>
          </div>
          <div>
            <div className="font-semibold mb-1">40% Efficiency</div>
            <p>Speed and quality of task completion</p>
          </div>
          <div>
            <div className="font-semibold mb-1">20% Volume</div>
            <p>Total number of tasks completed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
