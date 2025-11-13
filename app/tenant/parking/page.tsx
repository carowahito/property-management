'use client'

import { useState } from 'react'

interface ParkingSpace {
  id: string
  spaceNumber: string
  type: 'assigned' | 'visitor' | 'reserved'
  location: string
  floor: string
  status: 'active' | 'inactive'
  vehicle?: {
    make: string
    model: string
    color: string
    licensePlate: string
  }
}

interface GuestPass {
  id: string
  guestName: string
  guestLicense: string
  spaceNumber: string
  startDate: string
  endDate: string
  status: 'active' | 'expired' | 'cancelled'
}

export default function ParkingManagementPage() {
  const [activeTab, setActiveTab] = useState<'myspaces' | 'guestpasses' | 'violations'>('myspaces')
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [showRequestPass, setShowRequestPass] = useState(false)

  const mySpaces: ParkingSpace[] = [
    {
      id: 'ps1',
      spaceNumber: 'A-142',
      type: 'assigned',
      location: 'Building A - North Side',
      floor: 'Ground Floor',
      status: 'active',
      vehicle: {
        make: 'Toyota',
        model: 'Camry',
        color: 'Silver',
        licensePlate: 'KCA 123X',
      },
    },
  ]

  const guestPasses: GuestPass[] = [
    {
      id: 'gp1',
      guestName: 'Mike Johnson',
      guestLicense: 'KCB 456Y',
      spaceNumber: 'V-12',
      startDate: '2025-11-10',
      endDate: '2025-11-12',
      status: 'active',
    },
  ]

  const violations = [
    {
      id: 'v1',
      date: '2025-10-15',
      violation: 'Parked in visitor space',
      fine: 2000,
      status: 'paid',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Parking Management</h1>
        <p className="mt-2 text-gray-600">
          Manage your parking spaces, guest passes, and violations
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('myspaces')}
            className={`${
              activeTab === 'myspaces'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            My Spaces
          </button>
          <button
            onClick={() => setActiveTab('guestpasses')}
            className={`${
              activeTab === 'guestpasses'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Guest Passes ({guestPasses.filter(p => p.status === 'active').length})
          </button>
          <button
            onClick={() => setActiveTab('violations')}
            className={`${
              activeTab === 'violations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Violations
          </button>
        </nav>
      </div>

      {/* My Spaces Tab */}
      {activeTab === 'myspaces' && (
        <div className="space-y-6">
          {/* Parking Rules Banner */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-yellow-900 mb-2">Parking Rules</h3>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Park only in your assigned space(s)</li>
              <li>Guest parking limited to 48 hours maximum</li>
              <li>Display parking permit on dashboard</li>
              <li>No parking in fire lanes or reserved spaces</li>
              <li>Violation fine: KES 2,000 per incident</li>
            </ul>
          </div>

          {/* Assigned Spaces */}
          {mySpaces.map((space) => (
            <div key={space.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Space {space.spaceNumber}</h2>
                  <p className="text-sm text-gray-600">{space.location} • {space.floor}</p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {space.type === 'assigned' ? 'Assigned' : 'Visitor'}
                </span>
              </div>

              {space.vehicle ? (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Registered Vehicle</h3>
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">🚗</div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {space.vehicle.make} {space.vehicle.model}
                        </p>
                        <p className="text-sm text-gray-600">
                          {space.vehicle.color} • {space.vehicle.licensePlate}
                        </p>
                      </div>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Update Vehicle
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4">
                  <button
                    onClick={() => setShowAddVehicle(true)}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
                  >
                    + Register Vehicle
                  </button>
                </div>
              )}

              {/* Parking Permit */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Parking Permit</p>
                    <p className="text-xs text-gray-500">Display this on your dashboard</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                    Download Permit
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Request Additional Space */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Another Space?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Request an additional parking space (subject to availability and additional fees)
            </p>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Request Additional Space
            </button>
          </div>
        </div>
      )}

      {/* Guest Passes Tab */}
      {activeTab === 'guestpasses' && (
        <div className="space-y-6">
          {/* Request Guest Pass Button */}
          <div>
            <button
              onClick={() => setShowRequestPass(!showRequestPass)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              {showRequestPass ? 'Cancel' : '+ Request Guest Pass'}
            </button>
          </div>

          {/* Request Form */}
          {showRequestPass && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Guest Parking Pass</h2>
              <form className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guest Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      License Plate *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., KCA 123X"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Guest Parking Policy:</strong> Maximum 48 hours. Guests must park in designated visitor spaces only.
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowRequestPass(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Request Pass
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Active Guest Passes */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Active Guest Passes</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {guestPasses.filter(p => p.status === 'active').length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">🚗</div>
                  <p className="text-gray-600">No active guest passes</p>
                </div>
              ) : (
                guestPasses.filter(p => p.status === 'active').map((pass) => (
                  <div key={pass.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{pass.guestName}</h3>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>License: {pass.guestLicense}</p>
                          <p>Space: {pass.spaceNumber}</p>
                          <p>Valid: {new Date(pass.startDate).toLocaleDateString()} - {new Date(pass.endDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <button className="text-sm text-red-600 hover:text-red-800 font-medium">
                        Cancel Pass
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Violations Tab */}
      {activeTab === 'violations' && (
        <div className="space-y-6">
          {violations.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Violations</h3>
              <p className="text-gray-600">You have a clean parking record!</p>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Violation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fine
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {violations.map((violation) => (
                    <tr key={violation.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(violation.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {violation.violation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        KES {violation.fine.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          violation.status === 'paid' ? 'bg-green-100 text-green-800' :
                          violation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {violation.status.charAt(0).toUpperCase() + violation.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {violation.status !== 'paid' && (
                          <button className="text-blue-600 hover:text-blue-800 font-medium">
                            Pay Fine
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Towing Information */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-red-900 mb-2">Towing Policy</h3>
            <p className="text-sm text-red-800 mb-2">
              Vehicles may be towed at owner's expense for:
            </p>
            <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
              <li>Parking in fire lanes or handicapped spaces</li>
              <li>Blocking driveways or emergency access</li>
              <li>Unpaid parking violations (3 or more)</li>
              <li>Abandoned vehicles (7+ days without movement)</li>
            </ul>
            <p className="text-sm text-red-800 mt-3">
              <strong>Towing Company:</strong> Quick Tow Services - +254 722 000 000
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
