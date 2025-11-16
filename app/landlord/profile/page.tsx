'use client'

import { Button } from '@/components/ui/button'

export default function LandlordProfilePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-3xl">👤</div>
          <div>
            <h2 className="text-xl font-semibold">John Landlord</h2>
            <p className="text-gray-600">landlord@example.com</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input type="text" defaultValue="John" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input type="text" defaultValue="Landlord" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
        </div>
        <Button variant="success" size="lg">Update Profile</Button>
      </div>
    </div>
  )
}
