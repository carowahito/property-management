'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState<number | null>(1)

  // Mock data
  const messages = [
    {
      id: 1,
      from: 'Property Management',
      subject: 'Lease Renewal Reminder',
      preview: 'Your lease is expiring in 60 days. Please let us know if you wish to renew...',
      date: '2025-10-25',
      read: false,
      body: 'Dear John,\n\nYour current lease is set to expire on December 31, 2025. We would like to offer you the opportunity to renew your lease for another year.\n\nYour new monthly rent would be KES 47,000 (a 4.4% increase from your current rent).\n\nPlease respond by November 15th if you wish to renew.\n\nBest regards,\nProperty Management Team',
    },
    {
      id: 2,
      from: 'Property Management',
      subject: 'Maintenance Update - Kitchen Faucet',
      preview: 'Your maintenance request #1234 has been assigned to Quick Fix Plumbing...',
      date: '2025-10-22',
      read: true,
      body: 'Hello,\n\nYour maintenance request #1234 (Leaking Kitchen Faucet) has been assigned to Quick Fix Plumbing.\n\nScheduled Date: October 25, 2025\nTime: 2:00 PM - 4:00 PM\n\nPlease ensure someone is available to provide access to the property during this time.\n\nThank you,\nMaintenance Team',
    },
    {
      id: 3,
      from: 'Property Management',
      subject: 'Rent Payment Confirmation',
      preview: 'We have received your rent payment for October 2025...',
      date: '2025-10-05',
      read: true,
      body: 'Dear John,\n\nThis is to confirm that we have received your rent payment for October 2025.\n\nAmount: KES 45,000\nPayment Method: M-Pesa\nDate: October 4, 2025\nReceipt: #OCT-2025-001\n\nThank you for your timely payment!\n\nBest regards,\nAccounts Team',
    },
    {
      id: 4,
      from: 'Property Management',
      subject: 'Community Announcement - Building Maintenance',
      preview: 'The building common areas will undergo maintenance next week...',
      date: '2025-09-28',
      read: true,
      body: 'Dear Residents,\n\nWe will be conducting routine maintenance on the building common areas including hallways and stairwells next week from October 1-3.\n\nPlease excuse any inconvenience during this time. The work will be done between 9 AM - 5 PM.\n\nThank you for your cooperation,\nProperty Management',
    },
  ]

  const currentMessage = messages.find((m) => m.id === selectedMessage)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                + New Message
              </button>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedMessage === message.id
                      ? 'bg-blue-50 border-l-4 border-blue-600'
                      : 'hover:bg-gray-50'
                  } ${!message.read ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <p
                      className={`text-sm ${
                        !message.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'
                      }`}
                    >
                      {message.from}
                    </p>
                    {!message.read && (
                      <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                  <p
                    className={`text-sm mb-1 ${
                      !message.read ? 'font-semibold text-gray-900' : 'text-gray-700'
                    }`}
                  >
                    {message.subject}
                  </p>
                  <p className="text-xs text-gray-500 truncate mb-1">{message.preview}</p>
                  <p className="text-xs text-gray-400">{message.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="lg:col-span-2">
          {currentMessage ? (
            <div className="bg-white shadow rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {currentMessage.subject}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      From: {currentMessage.from}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">{currentMessage.date}</span>
                </div>
              </div>
              <div className="p-6">
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700">{currentMessage.body}</p>
                </div>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  Reply
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">💌</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No message selected</h3>
              <p className="text-gray-500">Select a message from the list to read it</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Need to reach us?</h3>
        <div className="flex gap-4">
          <a
            href="mailto:management@catalyst-properties.com"
            className="text-sm text-blue-700 hover:text-blue-900 font-medium"
          >
            📧 management@catalyst-properties.com
          </a>
          <a
            href="tel:+254700000000"
            className="text-sm text-blue-700 hover:text-blue-900 font-medium"
          >
            📞 +254 700 000 000
          </a>
        </div>
      </div>
    </div>
  )
}
