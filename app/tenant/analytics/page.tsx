'use client'
export default function FinancialAnalyticsPage() {
  const data = { totalPaid: 540000, avgMonthly: 45000, ytdUtilities: 48000, onTimeRate: 100 }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Analytics</h1>
      <p className="text-gray-600 mb-8">Track your rental expenses and payment history</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6"><div className="text-3xl mb-2">💰</div><p className="text-sm text-gray-600">Total Paid (12 months)</p><p className="text-2xl font-bold">KES {data.totalPaid.toLocaleString()}</p></div>
        <div className="bg-white shadow rounded-lg p-6"><div className="text-3xl mb-2">📊</div><p className="text-sm text-gray-600">Avg Monthly</p><p className="text-2xl font-bold">KES {data.avgMonthly.toLocaleString()}</p></div>
        <div className="bg-white shadow rounded-lg p-6"><div className="text-3xl mb-2">⚡</div><p className="text-sm text-gray-600">YTD Utilities</p><p className="text-2xl font-bold">KES {data.ytdUtilities.toLocaleString()}</p></div>
        <div className="bg-white shadow rounded-lg p-6"><div className="text-3xl mb-2">✅</div><p className="text-sm text-gray-600">On-Time Rate</p><p className="text-2xl font-bold">{data.onTimeRate}%</p></div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Payment History (12 Months)</h2>
        <div className="h-64 flex items-end justify-between space-x-2">
          {[45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45].map((amount, i) => (
            <div key={i} className="flex-1 bg-blue-500 rounded-t" style={{height: `${(amount/50)*100}%`}} title={`KES ${amount}k`}></div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="font-semibold mb-3">Expense Breakdown</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span>Rent</span><span className="font-semibold">KES 45,000 (90%)</span></div>
            <div className="flex justify-between text-sm"><span>Utilities</span><span className="font-semibold">KES 4,000 (8%)</span></div>
            <div className="flex justify-between text-sm"><span>Pet Rent</span><span className="font-semibold">KES 1,000 (2%)</span></div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="font-semibold mb-3">Tax Summary</h3>
          <p className="text-sm text-gray-600 mb-3">Annual rent paid for tax purposes</p>
          <p className="text-3xl font-bold text-gray-900">KES 540,000</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">Download Annual Statement</button>
        </div>
      </div>
    </div>
  )
}
