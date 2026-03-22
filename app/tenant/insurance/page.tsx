'use client'
import { useState } from 'react'
export default function InsurancePage() {
  const [hasInsurance, setHasInsurance] = useState(true)
  const insurance = { provider: 'SafeGuard Insurance', policyNumber: 'POL-2024-12345', coverage: 500000, startDate: '2024-01-01', endDate: '2024-12-31', status: 'active' }
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">Renter's Insurance</h1>
      <p className="text-neutral-600 mb-8">Manage your renter's insurance policy</p>

      {!hasInsurance ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">Insurance Required</h3>
          <p className="text-sm text-yellow-800 mb-4">Your lease requires active renter's insurance. Please upload your policy information.</p>
          <button className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">Upload Policy</button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-surface shadow rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold">Current Policy</h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success-100 text-success-800">Active</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-neutral-600">Provider:</span> <span className="font-medium">{insurance.provider}</span></div>
              <div><span className="text-neutral-600">Policy Number:</span> <span className="font-medium font-mono">{insurance.policyNumber}</span></div>
              <div><span className="text-neutral-600">Coverage:</span> <span className="font-medium">KES {insurance.coverage.toLocaleString()}</span></div>
              <div><span className="text-neutral-600">Valid:</span> <span className="font-medium">{insurance.startDate} to {insurance.endDate}</span></div>
            </div>
            <div className="mt-4 pt-4 border-t flex space-x-3">
              <button className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700">Download Policy</button>
              <button className="px-4 py-2 border border-neutral-300 rounded-md text-sm hover:bg-neutral-50">Update Policy</button>
            </div>
          </div>

          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-sm text-primary-800"><strong>Reminder:</strong> Your policy expires on {insurance.endDate}. Renew at least 30 days before expiration to avoid compliance issues.</p>
          </div>

          <div className="bg-surface shadow rounded-lg p-6">
            <h3 className="font-semibold mb-3">File a Claim</h3>
            <p className="text-sm text-neutral-600 mb-4">Report damage or loss covered by your insurance</p>
            <button className="px-4 py-2 bg-surface border border-neutral-300 rounded-md text-sm hover:bg-neutral-50">Start Claim Process</button>
          </div>
        </div>
      )}
    </div>
  )
}
