'use client'

export default function LandlordAnalytics() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics & Reports</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
          <div className="h-64 flex items-end justify-between space-x-2">
            {[65, 70, 80, 75, 85, 90, 95, 88, 92, 98, 100, 105].map((height, i) => (
              <div key={i} className="flex-1 bg-green-500 rounded-t hover:bg-green-600 transition-colors cursor-pointer" style={{height: `${height}%`}}></div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Jan</span><span>Dec</span>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Occupancy Rate</h2>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-6xl font-bold text-green-600">87.5%</div>
              <p className="text-gray-600 mt-2">Current Occupancy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
