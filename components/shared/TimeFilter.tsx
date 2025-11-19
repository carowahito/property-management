'use client'

interface TimeFilterProps {
  timePeriod: string
  setTimePeriod: (period: string) => void
  customStartDate: string
  setCustomStartDate: (date: string) => void
  customEndDate: string
  setCustomEndDate: (date: string) => void
  label?: string
}

export function TimeFilter({
  timePeriod,
  setTimePeriod,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  label = 'Time Period'
}: TimeFilterProps) {
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className='flex flex-wrap gap-4 items-end'>
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <select
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
        >
          <option value='current'>Current Month ({currentMonth})</option>
          <option value='last30'>Last 30 Days</option>
          <option value='last90'>Last 90 Days</option>
          <option value='all'>All Time</option>
          <option value='custom'>Custom Range</option>
        </select>
      </div>

      {timePeriod === 'custom' && (
        <>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </>
      )}
    </div>
  )
}
