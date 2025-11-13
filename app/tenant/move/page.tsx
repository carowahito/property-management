'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MoveManagementPage() {
  const [activeTab, setActiveTab] = useState<'move-in' | 'move-out'>('move-in')

  const moveInStatus = {
    completed: true,
    date: '2024-01-01',
    checklist: {
      inspection: true,
      photos: true,
      keyCollection: true,
      utilitiesSetup: true,
      insuranceVerified: true,
    },
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Move Management</h1>
        <p className="mt-2 text-gray-600">
          Manage your move-in and move-out processes
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('move-in')}
            className={`${
              activeTab === 'move-in'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Move-In
          </button>
          <button
            onClick={() => setActiveTab('move-out')}
            className={`${
              activeTab === 'move-out'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Move-Out
          </button>
        </nav>
      </div>

      {/* Move-In Tab */}
      {activeTab === 'move-in' && (
        <div className="space-y-6">
          {/* Move-In Status Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Move-In Status</h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✓ Completed
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Move-In Date</span>
                <span className="text-sm font-medium text-gray-900">{moveInStatus.date}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Initial Inspection</span>
                <span className="text-sm font-medium text-green-600">✓ Complete</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Photos Uploaded</span>
                <span className="text-sm font-medium text-green-600">✓ Complete</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Keys Collected</span>
                <span className="text-sm font-medium text-green-600">✓ Complete</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Utilities Setup</span>
                <span className="text-sm font-medium text-green-600">✓ Complete</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Insurance Verified</span>
                <span className="text-sm font-medium text-green-600">✓ Complete</span>
              </div>
            </div>
          </div>

          {/* Move-In Photos */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Move-In Photos</h2>
            <p className="text-sm text-gray-600 mb-4">
              Photos taken during your move-in inspection for reference
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={`https://via.placeholder.com/300?text=Room+${i}`}
                    alt={`Move-in photo ${i}`}
                    className="w-full h-full object-cover"
                  />
                  <button className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm hover:bg-gray-50">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Move-In Documents */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Move-In Documents</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">📄</div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Move-In Inspection Report</p>
                    <p className="text-xs text-gray-500">Signed on {moveInStatus.date}</p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Download
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">🔑</div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Key Receipt</p>
                    <p className="text-xs text-gray-500">2 keys received</p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Move-Out Tab */}
      {activeTab === 'move-out' && (
        <div className="space-y-6">
          {/* Move-Out Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Planning to Move Out?
            </h3>
            <p className="text-sm text-blue-800 mb-4">
              You must provide at least 30 days notice before moving out. Your current lease ends on December 31, 2024.
            </p>
            <Link
              href="/tenant/move/notice"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Submit Move-Out Notice
            </Link>
          </div>

          {/* Move-Out Checklist */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Move-Out Checklist</h2>
            <p className="text-sm text-gray-600 mb-4">
              Complete these steps for a smooth move-out process
            </p>
            <div className="space-y-3">
              {[
                { task: 'Submit 30-day notice', done: false },
                { task: 'Schedule final inspection', done: false },
                { task: 'Clean the property thoroughly', done: false },
                { task: 'Remove all personal belongings', done: false },
                { task: 'Return all keys', done: false },
                { task: 'Pay final utilities', done: false },
                { task: 'Provide forwarding address', done: false },
                { task: 'Take move-out photos', done: false },
              ].map((item, index) => (
                <div key={index} className="flex items-center py-2 border-b border-gray-100">
                  <input
                    type="checkbox"
                    checked={item.done}
                    readOnly
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className={`ml-3 text-sm ${item.done ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    {item.task}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Move-Out Timeline */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Move-Out Timeline</h2>
            <div className="space-y-4">
              <div className="flex">
                <div className="flex-shrink-0 w-24 text-sm text-gray-600">30 days before</div>
                <div className="flex-1 border-l-2 border-gray-200 pl-4 pb-4">
                  <p className="text-sm font-medium text-gray-900">Submit Move-Out Notice</p>
                  <p className="text-xs text-gray-500 mt-1">Give written notice to property management</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 w-24 text-sm text-gray-600">14 days before</div>
                <div className="flex-1 border-l-2 border-gray-200 pl-4 pb-4">
                  <p className="text-sm font-medium text-gray-900">Schedule Final Inspection</p>
                  <p className="text-xs text-gray-500 mt-1">Coordinate with property manager for walkthrough</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 w-24 text-sm text-gray-600">7 days before</div>
                <div className="flex-1 border-l-2 border-gray-200 pl-4 pb-4">
                  <p className="text-sm font-medium text-gray-900">Complete Cleaning</p>
                  <p className="text-xs text-gray-500 mt-1">Deep clean property to avoid deductions</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 w-24 text-sm text-gray-600">Move-out day</div>
                <div className="flex-1 border-l-2 border-gray-200 pl-4 pb-4">
                  <p className="text-sm font-medium text-gray-900">Final Inspection & Key Return</p>
                  <p className="text-xs text-gray-500 mt-1">Walk through property and return all keys</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 w-24 text-sm text-gray-600">After move-out</div>
                <div className="flex-1 pl-4">
                  <p className="text-sm font-medium text-gray-900">Security Deposit Return</p>
                  <p className="text-xs text-gray-500 mt-1">Receive refund within 30 days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Deposit Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Deposit</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Original Deposit</span>
                <span className="text-sm font-medium text-gray-900">KES 45,000</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Expected Deductions</span>
                <span className="text-sm font-medium text-gray-900">KES 0</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-semibold text-gray-900">Estimated Return</span>
                <span className="text-sm font-bold text-green-600">KES 45,000</span>
              </div>
            </div>
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-xs text-yellow-800">
                💡 <strong>Tip:</strong> Complete all cleaning and repairs to maximize your security deposit return. Deductions may be made for damages beyond normal wear and tear.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
