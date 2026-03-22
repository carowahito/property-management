'use client'

import { useState } from 'react'

interface Referral {
  id: string
  name: string
  email: string
  status: 'pending' | 'approved' | 'rewarded' | 'declined'
  dateReferred: string
  reward?: number
  moveInDate?: string
}

export default function ReferralProgramPage() {
  const [showShareModal, setShowShareModal] = useState(false)
  const [copied, setCopied] = useState(false)

  const referralCode = 'JOHN-DOE-2025'
  const referralLink = `https://properties.example.com/join?ref=${referralCode}`

  const referrals: Referral[] = [
    {
      id: 'ref1',
      name: 'Sarah Williams',
      email: 'sarah.williams@example.com',
      status: 'rewarded',
      dateReferred: '2025-09-15',
      reward: 10000,
      moveInDate: '2025-10-01',
    },
    {
      id: 'ref2',
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      status: 'pending',
      dateReferred: '2025-11-01',
    },
  ]

  const stats = {
    totalReferrals: 3,
    successfulReferrals: 1,
    totalEarned: 10000,
    pendingRewards: 0,
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-primary-100 text-primary-800',
      rewarded: 'bg-success-100 text-success-800',
      declined: 'bg-danger-100 text-danger-800',
    }
    return badges[status] || badges.pending
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Referral Program</h1>
        <p className="mt-2 text-neutral-600">
          Refer friends and earn rewards for each successful referral
        </p>
      </div>

      {/* Program Overview */}
      <div className="bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-lg p-8 mb-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-3">Earn KES 10,000 per Referral!</h2>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Share your unique referral link with friends and family. When they sign a lease, you both get rewarded!
          </p>
          <button
            onClick={() => setShowShareModal(true)}
            className="px-6 py-3 bg-surface text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            Share Your Link
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface shadow rounded-lg p-6">
          <p className="text-sm text-neutral-600 mb-1">Total Referrals</p>
          <p className="text-3xl font-bold text-neutral-900">{stats.totalReferrals}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-6">
          <p className="text-sm text-neutral-600 mb-1">Successful</p>
          <p className="text-3xl font-bold text-success-600">{stats.successfulReferrals}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-6">
          <p className="text-sm text-neutral-600 mb-1">Total Earned</p>
          <p className="text-3xl font-bold text-primary-600">KES {stats.totalEarned.toLocaleString()}</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-6">
          <p className="text-sm text-neutral-600 mb-1">Pending Rewards</p>
          <p className="text-3xl font-bold text-yellow-600">KES {stats.pendingRewards.toLocaleString()}</p>
        </div>
      </div>

      {/* Your Referral Link */}
      <div className="bg-surface shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Your Unique Referral Link</h2>
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <div className="flex items-center border border-neutral-300 rounded-lg p-3 bg-neutral-50">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 bg-transparent border-none outline-none text-neutral-900"
              />
            </div>
          </div>
          <button
            onClick={handleCopyLink}
            className="px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
        <p className="mt-3 text-sm text-neutral-600">
          Your referral code: <span className="font-mono font-semibold text-neutral-900">{referralCode}</span>
        </p>
      </div>

      {/* How It Works */}
      <div className="bg-surface shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📤</span>
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">1. Share Your Link</h3>
            <p className="text-sm text-neutral-600">
              Send your unique referral link to friends and family via email, social media, or text
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✍️</span>
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">2. They Sign a Lease</h3>
            <p className="text-sm text-neutral-600">
              Your referral applies and signs a lease for a unit in our properties
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💰</span>
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">3. You Both Get Rewarded</h3>
            <p className="text-sm text-neutral-600">
              You receive KES 10,000, and they get KES 5,000 off their first month's rent
            </p>
          </div>
        </div>
      </div>

      {/* Referral History */}
      <div className="bg-surface shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">Referral History</h2>
        </div>

        {referrals.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-neutral-600 mb-4">No referrals yet</p>
            <button
              onClick={() => setShowShareModal(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
            >
              Share Your Link
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Date Referred
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Reward
                  </th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-neutral-200">
                {referrals.map((referral) => (
                  <tr key={referral.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-neutral-900">{referral.name}</div>
                      {referral.moveInDate && (
                        <div className="text-xs text-neutral-500">
                          Moved in: {new Date(referral.moveInDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                      {referral.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                      {new Date(referral.dateReferred).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(referral.status)}`}>
                        {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                      {referral.reward ? `KES ${referral.reward.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Terms & Conditions */}
      <div className="mt-6 bg-neutral-50 border border-neutral-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-neutral-900 mb-3">Terms & Conditions</h3>
        <ul className="text-sm text-neutral-700 space-y-2 list-disc list-inside">
          <li>Referral must sign a lease for a minimum of 12 months</li>
          <li>Reward is paid after referral completes 60 days of tenancy</li>
          <li>Referral must mention your referral code during application</li>
          <li>Maximum 10 referrals per year per tenant</li>
          <li>Referred tenant must be new to our properties (not a previous tenant)</li>
          <li>Rewards are paid via rent credit or direct deposit</li>
          <li>Program terms subject to change with 30 days notice</li>
        </ul>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Share Your Referral Link</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Your Referral Link</label>
                <div className="flex items-center border border-neutral-300 rounded-lg p-3 bg-neutral-50">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-900"
                  />
                </div>
                <button
                  onClick={handleCopyLink}
                  className="mt-2 w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>

              <div className="border-t border-neutral-200 pt-4">
                <p className="text-sm font-medium text-neutral-700 mb-3">Share via:</p>
                <div className="grid grid-cols-4 gap-3">
                  <button className="flex flex-col items-center justify-center p-3 border border-neutral-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
                    <span className="text-2xl mb-1">📧</span>
                    <span className="text-xs text-neutral-600">Email</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-3 border border-neutral-200 rounded-lg hover:border-success-500 hover:bg-success-50 transition-colors">
                    <span className="text-2xl mb-1">💬</span>
                    <span className="text-xs text-neutral-600">WhatsApp</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-3 border border-neutral-200 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors">
                    <span className="text-2xl mb-1">📱</span>
                    <span className="text-xs text-neutral-600">SMS</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-3 border border-neutral-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
                    <span className="text-2xl mb-1">🔗</span>
                    <span className="text-xs text-neutral-600">More</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
