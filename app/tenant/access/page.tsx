'use client'
import { useState } from 'react'
export default function AccessManagementPage() {
  const [activeTab, setActiveTab] = useState<'codes' | 'visitors'>('codes')
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">Visitor & Access Management</h1>
      <p className="text-neutral-600 mb-8">Manage temporary access codes and visitor registration</p>
      
      <div className="border-b border-neutral-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button onClick={() => setActiveTab('codes')} className={`${activeTab === 'codes' ? 'border-primary-500 text-primary-600' : 'border-transparent text-neutral-500'} py-4 px-1 border-b-2 font-medium text-sm`}>Access Codes</button>
          <button onClick={() => setActiveTab('visitors')} className={`${activeTab === 'visitors' ? 'border-primary-500 text-primary-600' : 'border-transparent text-neutral-500'} py-4 px-1 border-b-2 font-medium text-sm`}>Visitor Log</button>
        </nav>
      </div>

      {activeTab === 'codes' && (
        <div className="space-y-6">
          <div className="bg-surface shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Generate Temporary Access Code</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Visitor Name" className="px-3 py-2 border rounded-md" />
                <input type="date" className="px-3 py-2 border rounded-md" />
                <input type="time" className="px-3 py-2 border rounded-md" />
                <select className="px-3 py-2 border rounded-md">
                  <option>1 hour</option>
                  <option>4 hours</option>
                  <option>8 hours</option>
                  <option>24 hours</option>
                </select>
              </div>
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Generate Code</button>
            </form>
          </div>
          
          <div className="bg-surface shadow rounded-lg p-6">
            <h3 className="font-semibold mb-3">Active Codes</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-neutral-50 rounded">
                <div><p className="font-medium">Guest: Mike Johnson</p><p className="text-sm text-neutral-600">Valid until: Nov 10, 6:00 PM</p></div>
                <div><p className="text-2xl font-bold font-mono">8452</p></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'visitors' && (
        <div className="bg-surface shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Purpose</th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-neutral-200">
              <tr><td className="px-6 py-4 text-sm">Mike Johnson</td><td className="px-6 py-4 text-sm">Nov 10, 2025</td><td className="px-6 py-4 text-sm">2:00 PM</td><td className="px-6 py-4 text-sm">Guest</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
