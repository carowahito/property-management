'use client'

import { useState } from 'react'

interface Package {
  id: string
  trackingNumber: string
  carrier: 'UPS' | 'FedEx' | 'DHL' | 'USPS' | 'Local Courier' | 'Other'
  description: string
  arrivalDate: string
  pickupCode?: string
  lockerNumber?: string
  status: 'arrived' | 'picked_up' | 'returned'
  notificationSent: boolean
  pickupBy?: string
}

export default function PackageManagementPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'settings'>('pending')
  const [showDeliveryInstructions, setShowDeliveryInstructions] = useState(false)

  const packages: Package[] = [
    {
      id: 'pkg1',
      trackingNumber: '1Z999AA10123456784',
      carrier: 'UPS',
      description: 'Amazon Package',
      arrivalDate: '2025-11-07',
      pickupCode: '4852',
      lockerNumber: 'A-12',
      status: 'arrived',
      notificationSent: true,
    },
    {
      id: 'pkg2',
      trackingNumber: 'FX394857382910',
      carrier: 'FedEx',
      description: 'Office Supplies',
      arrivalDate: '2025-11-06',
      status: 'picked_up',
      notificationSent: true,
      pickupBy: '2025-11-06 14:30',
    },
    {
      id: 'pkg3',
      trackingNumber: 'LH238492834',
      carrier: 'Local Courier',
      description: 'Food Delivery',
      arrivalDate: '2025-11-05',
      status: 'picked_up',
      notificationSent: true,
      pickupBy: '2025-11-05 18:00',
    },
  ]

  const deliveryInstructions = {
    defaultLocation: 'Leave at front desk',
    specialInstructions: 'Please call upon arrival for fragile items',
    alternateRecipient: 'Jane Doe (Roommate)',
    preferredCarriers: ['UPS', 'FedEx'],
  }

  const getCarrierIcon = (carrier: string) => {
    const icons: Record<string, string> = {
      UPS: '📦',
      FedEx: '✈️',
      DHL: '🚚',
      USPS: '📬',
      'Local Courier': '🏃',
      Other: '📮',
    }
    return icons[carrier] || '📦'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Package Management</h1>
        <p className="mt-2 text-neutral-600">
          Track deliveries and manage package pickups
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
        <div className="bg-surface overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl">📦</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-neutral-500 truncate">
                    Awaiting Pickup
                  </dt>
                  <dd className="text-lg font-semibold text-neutral-900">
                    {packages.filter(p => p.status === 'arrived').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl">✅</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-neutral-500 truncate">
                    Picked Up (This Month)
                  </dt>
                  <dd className="text-lg font-semibold text-neutral-900">
                    {packages.filter(p => p.status === 'picked_up').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl">🔔</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-neutral-500 truncate">
                    Notifications
                  </dt>
                  <dd className="text-lg font-semibold text-neutral-900">
                    Enabled
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-neutral-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`${
              activeTab === 'pending'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Pending Pickup ({packages.filter(p => p.status === 'arrived').length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`${
              activeTab === 'history'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`${
              activeTab === 'settings'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Delivery Settings
          </button>
        </nav>
      </div>

      {/* Pending Pickup Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {packages.filter(p => p.status === 'arrived').length === 0 ? (
            <div className="bg-surface shadow rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No Packages Waiting</h3>
              <p className="text-neutral-600">
                You'll be notified when packages arrive
              </p>
            </div>
          ) : (
            packages
              .filter(p => p.status === 'arrived')
              .map((pkg) => (
                <div key={pkg.id} className="bg-surface shadow rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="text-4xl">{getCarrierIcon(pkg.carrier)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-neutral-900">
                            {pkg.description}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                            Ready for Pickup
                          </span>
                        </div>

                        <div className="space-y-2 text-sm text-neutral-600">
                          <div className="flex items-center">
                            <span className="font-medium w-32">Carrier:</span>
                            <span>{pkg.carrier}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium w-32">Tracking:</span>
                            <span className="font-mono">{pkg.trackingNumber}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium w-32">Arrived:</span>
                            <span>{new Date(pkg.arrivalDate).toLocaleString()}</span>
                          </div>
                          {pkg.lockerNumber && (
                            <div className="flex items-center">
                              <span className="font-medium w-32">Locker:</span>
                              <span className="font-mono font-semibold">{pkg.lockerNumber}</span>
                            </div>
                          )}
                          {pkg.pickupCode && (
                            <div className="flex items-center">
                              <span className="font-medium w-32">Pickup Code:</span>
                              <span className="font-mono text-lg font-bold text-primary-600">
                                {pkg.pickupCode}
                              </span>
                            </div>
                          )}
                        </div>

                        {pkg.pickupCode && (
                          <div className="mt-4 bg-primary-50 border border-primary-200 rounded-lg p-3">
                            <p className="text-sm text-primary-800">
                              <strong>How to pickup:</strong> Use code <strong>{pkg.pickupCode}</strong> at the package locker or show this screen to the front desk.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <button className="ml-4 px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700">
                      Mark as Picked Up
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-surface shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Carrier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Tracking Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-neutral-200">
              {packages
                .filter(p => p.status !== 'arrived')
                .map((pkg) => (
                  <tr key={pkg.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {new Date(pkg.arrivalDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">
                      {pkg.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {getCarrierIcon(pkg.carrier)} {pkg.carrier}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-neutral-900">
                      {pkg.trackingNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                        Picked Up
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Delivery Instructions */}
          <div className="bg-surface shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Delivery Instructions</h2>
              <button
                onClick={() => setShowDeliveryInstructions(!showDeliveryInstructions)}
                className="text-sm text-primary-600 hover:text-primary-800 font-medium"
              >
                {showDeliveryInstructions ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {showDeliveryInstructions ? (
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Default Delivery Location
                  </label>
                  <select className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option>Leave at front desk</option>
                    <option>Leave at unit door</option>
                    <option>Package locker only</option>
                    <option>Signature required</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Special Instructions
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Any special handling or delivery instructions..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Alternate Recipient
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Name of person authorized to receive packages"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowDeliveryInstructions(false)}
                    className="px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
                  >
                    Save Instructions
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-neutral-100">
                  <span className="text-neutral-600">Default Location</span>
                  <span className="font-medium text-neutral-900">{deliveryInstructions.defaultLocation}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-100">
                  <span className="text-neutral-600">Special Instructions</span>
                  <span className="font-medium text-neutral-900">{deliveryInstructions.specialInstructions}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-neutral-600">Alternate Recipient</span>
                  <span className="font-medium text-neutral-900">{deliveryInstructions.alternateRecipient}</span>
                </div>
              </div>
            )}
          </div>

          {/* Notification Settings */}
          <div className="bg-surface shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Notification Preferences</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="emailNotif"
                  defaultChecked
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <label htmlFor="emailNotif" className="ml-3">
                  <span className="block text-sm font-medium text-neutral-700">
                    Email Notifications
                  </span>
                  <span className="block text-sm text-neutral-500">
                    Receive email when packages arrive
                  </span>
                </label>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="smsNotif"
                  defaultChecked
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <label htmlFor="smsNotif" className="ml-3">
                  <span className="block text-sm font-medium text-neutral-700">
                    SMS Notifications
                  </span>
                  <span className="block text-sm text-neutral-500">
                    Get text messages for package arrivals
                  </span>
                </label>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="pushNotif"
                  defaultChecked
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <label htmlFor="pushNotif" className="ml-3">
                  <span className="block text-sm font-medium text-neutral-700">
                    Push Notifications
                  </span>
                  <span className="block text-sm text-neutral-500">
                    Get app notifications for real-time updates
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Package Locker Info */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-primary-900 mb-2">Package Locker System</h3>
            <p className="text-sm text-primary-800 mb-2">
              Our smart package lockers provide 24/7 secure access to your deliveries.
            </p>
            <ul className="text-sm text-primary-800 space-y-1 list-disc list-inside">
              <li>Receive a unique pickup code via SMS and email</li>
              <li>Packages held for up to 5 days</li>
              <li>After 5 days, packages are returned to the front desk</li>
              <li>Unclaimed packages after 14 days may be donated or discarded</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
