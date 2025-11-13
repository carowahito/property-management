'use client'

export default function LandlordSettings() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
          <input type="text" defaultValue="Green Properties LLC" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Notifications</label>
          <label className="flex items-center">
            <input type="checkbox" defaultChecked className="rounded border-gray-300" />
            <span className="ml-2 text-sm text-gray-700">Receive email notifications for new requests</span>
          </label>
        </div>
        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Save Changes</button>
      </div>
    </div>
  )
}
