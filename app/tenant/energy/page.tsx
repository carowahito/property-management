'use client'

import { useState } from 'react'

export default function EnergyTrackingPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')

  const energyData = {
    currentMonth: {
      total: 324,
      cost: 12400,
      average: 10.8,
      comparedToLastMonth: -8,
    },
    breakdown: {
      heating: 35,
      cooling: 25,
      lighting: 15,
      appliances: 20,
      other: 5,
    },
    dailyUsage: [
      { date: '11/01', usage: 9.5 },
      { date: '11/02', usage: 10.2 },
      { date: '11/03', usage: 11.8 },
      { date: '11/04', usage: 10.5 },
      { date: '11/05', usage: 9.8 },
      { date: '11/06', usage: 10.9 },
      { date: '11/07', usage: 11.2 },
    ],
  }

  const carbonFootprint = {
    monthly: 145,
    yearly: 1740,
    comparedToAverage: -12,
    treesEquivalent: 8,
  }

  const savingsTips = [
    {
      id: 1,
      icon: '💡',
      title: 'Switch to LED Bulbs',
      description: 'Replace traditional bulbs with LED lights to save up to 75% on lighting costs',
      potentialSavings: 2500,
      difficulty: 'Easy',
    },
    {
      id: 2,
      icon: '❄️',
      title: 'Optimize AC Usage',
      description: 'Set your thermostat to 24°C when home, 26°C when away',
      potentialSavings: 3500,
      difficulty: 'Easy',
    },
    {
      id: 3,
      icon: '🔌',
      title: 'Unplug Idle Devices',
      description: 'Unplug chargers and appliances when not in use to avoid phantom power drain',
      potentialSavings: 1200,
      difficulty: 'Easy',
    },
    {
      id: 4,
      icon: '🌡️',
      title: 'Use Smart Thermostat',
      description: 'Install a programmable thermostat to optimize heating and cooling',
      potentialSavings: 5000,
      difficulty: 'Medium',
    },
  ]

  const achievements = [
    { id: 1, title: 'Energy Saver', description: 'Reduced usage by 10%', icon: '🏆', unlocked: true },
    { id: 2, title: 'Green Champion', description: '3 months of low usage', icon: '🌟', unlocked: true },
    { id: 3, title: 'Carbon Neutral', description: 'Offset 1 ton of CO2', icon: '🌱', unlocked: false },
    { id: 4, title: 'Efficiency Expert', description: '6 months of optimization', icon: '⚡', unlocked: false },
  ]

  const recyclingSchedule = [
    { day: 'Monday', type: 'General Waste', color: 'bg-gray-500' },
    { day: 'Wednesday', type: 'Recyclables', color: 'bg-blue-500' },
    { day: 'Friday', type: 'Organic Waste', color: 'bg-green-500' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Energy & Sustainability</h1>
        <p className="mt-2 text-gray-600">
          Track your energy usage, reduce your carbon footprint, and earn rewards
        </p>
      </div>

      {/* Energy Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">⚡</span>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              energyData.currentMonth.comparedToLastMonth < 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {energyData.currentMonth.comparedToLastMonth > 0 ? '+' : ''}{energyData.currentMonth.comparedToLastMonth}%
            </span>
          </div>
          <p className="text-sm text-gray-600">This Month</p>
          <p className="text-3xl font-bold text-gray-900">{energyData.currentMonth.total} kWh</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <span className="text-2xl mb-2 block">💰</span>
          <p className="text-sm text-gray-600">Estimated Cost</p>
          <p className="text-3xl font-bold text-gray-900">KES {energyData.currentMonth.cost.toLocaleString()}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <span className="text-2xl mb-2 block">📊</span>
          <p className="text-sm text-gray-600">Daily Average</p>
          <p className="text-3xl font-bold text-gray-900">{energyData.currentMonth.average} kWh</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🌍</span>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              carbonFootprint.comparedToAverage < 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {carbonFootprint.comparedToAverage}%
            </span>
          </div>
          <p className="text-sm text-gray-600">Carbon Footprint</p>
          <p className="text-3xl font-bold text-gray-900">{carbonFootprint.monthly} kg</p>
        </div>
      </div>

      {/* Energy Usage Chart */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Energy Usage Trend</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedPeriod === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedPeriod === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setSelectedPeriod('year')}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedPeriod === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Year
            </button>
          </div>
        </div>

        {/* Simple Bar Chart */}
        <div className="flex items-end justify-between h-64 space-x-2">
          {energyData.dailyUsage.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer relative group"
                   style={{ height: `${(day.usage / 12) * 100}%` }}>
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {day.usage} kWh
                </span>
              </div>
              <span className="text-xs text-gray-600 mt-2">{day.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage Breakdown</h2>
          <div className="space-y-4">
            {Object.entries(energyData.breakdown).map(([category, percentage]) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 capitalize">{category}</span>
                  <span className="text-sm font-semibold text-gray-900">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carbon Footprint */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Carbon Footprint</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Monthly CO2 Emissions</p>
                <p className="text-2xl font-bold text-gray-900">{carbonFootprint.monthly} kg</p>
              </div>
              <span className="text-4xl">🌱</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Yearly CO2 Emissions</p>
                <p className="text-2xl font-bold text-gray-900">{carbonFootprint.yearly} kg</p>
              </div>
              <span className="text-4xl">🌍</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Trees to Offset</p>
                <p className="text-2xl font-bold text-gray-900">{carbonFootprint.treesEquivalent} trees</p>
              </div>
              <span className="text-4xl">🌳</span>
            </div>
            <div className="bg-green-100 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800 text-center">
                ✓ You're {Math.abs(carbonFootprint.comparedToAverage)}% below the average tenant!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Energy Saving Tips */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Energy Saving Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savingsTips.map((tip) => (
            <div key={tip.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
              <div className="flex items-start space-x-3">
                <span className="text-3xl">{tip.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{tip.title}</h3>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      {tip.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{tip.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-600">
                      Save ~KES {tip.potentialSavings.toLocaleString()}/month
                    </span>
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Learn More →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sustainability Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border-2 text-center ${
                achievement.unlocked
                  ? 'border-yellow-400 bg-yellow-50'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div className="text-4xl mb-2">{achievement.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{achievement.title}</h3>
              <p className="text-xs text-gray-600">{achievement.description}</p>
              {achievement.unlocked && (
                <span className="inline-block mt-2 text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                  Unlocked!
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recycling Schedule */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recycling & Waste Schedule</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recyclingSchedule.map((schedule, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className={`w-12 h-12 ${schedule.color} rounded-full flex items-center justify-center mb-3`}>
                <span className="text-2xl">♻️</span>
              </div>
              <p className="font-semibold text-gray-900 mb-1">{schedule.day}</p>
              <p className="text-sm text-gray-600">{schedule.type}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Recycling Guidelines</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Rinse containers before recycling</li>
            <li>Flatten cardboard boxes to save space</li>
            <li>Remove caps and lids from bottles</li>
            <li>No plastic bags in recycling bins</li>
            <li>Glass should be placed in designated containers</li>
          </ul>
        </div>
      </div>

      {/* Green Rewards Program */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-3">Green Rewards Program</h2>
          <p className="text-green-100 mb-6 max-w-2xl mx-auto">
            Earn points for reducing energy usage, recycling, and sustainable practices. Redeem points for rent discounts, gift cards, and more!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-green-100 text-sm mb-1">Your Points</p>
              <p className="text-4xl font-bold">1,250</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-green-100 text-sm mb-1">This Month</p>
              <p className="text-4xl font-bold">+180</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-green-100 text-sm mb-1">Redeemable</p>
              <p className="text-4xl font-bold">KES 625</p>
            </div>
          </div>
          <button className="px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors">
            Redeem Rewards
          </button>
        </div>
      </div>
    </div>
  )
}
