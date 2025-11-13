'use client'

import { useState } from 'react'

interface SmartDevice {
  id: string
  name: string
  type: 'thermostat' | 'lock' | 'camera' | 'lights' | 'blinds'
  location: string
  status: 'online' | 'offline'
  battery?: number
  lastActive: string
}

export default function SmartHomePage() {
  const [selectedDevice, setSelectedDevice] = useState<SmartDevice | null>(null)

  const devices: SmartDevice[] = [
    { id: '1', name: 'Living Room Thermostat', type: 'thermostat', location: 'Living Room', status: 'online', lastActive: '2 min ago' },
    { id: '2', name: 'Front Door Lock', type: 'lock', location: 'Entrance', status: 'online', battery: 85, lastActive: '5 min ago' },
    { id: '3', name: 'Security Camera', type: 'camera', location: 'Entrance', status: 'online', lastActive: '1 min ago' },
    { id: '4', name: 'Bedroom Lights', type: 'lights', location: 'Bedroom', status: 'online', lastActive: '10 min ago' },
  ]

  const getDeviceIcon = (type: string) => {
    const icons: Record<string, string> = {
      thermostat: '🌡️',
      lock: '🔐',
      camera: '📹',
      lights: '💡',
      blinds: '🪟',
    }
    return icons[type] || '📱'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Smart Home Control</h1>
        <p className="mt-2 text-gray-600">
          Control your smart devices from one place
        </p>
      </div>

      {/* Quick Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-4xl mb-3">🌡️</div>
          <p className="text-sm text-gray-600 mb-2">Temperature</p>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">22°C</span>
            <div className="flex flex-col space-y-1">
              <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs">+</button>
              <button className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs">-</button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-4xl mb-3">🔐</div>
          <p className="text-sm text-gray-600 mb-2">Door Lock</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-green-600">Locked</span>
            <button className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">
              Unlock
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-4xl mb-3">💡</div>
          <p className="text-sm text-gray-600 mb-2">Lights</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">3 Active</span>
            <button className="px-3 py-1 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700">
              All Off
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-4xl mb-3">⚡</div>
          <p className="text-sm text-gray-600 mb-2">Energy Usage</p>
          <p className="text-3xl font-bold">12.4 kWh</p>
          <p className="text-xs text-gray-500">Today</p>
        </div>
      </div>

      {/* All Devices */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Devices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => (
            <div
              key={device.id}
              onClick={() => setSelectedDevice(device)}
              className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{getDeviceIcon(device.type)}</div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  device.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {device.status}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{device.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{device.location}</p>
              {device.battery && (
                <div className="flex items-center text-sm text-gray-500">
                  <span>🔋 {device.battery}%</span>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">Active {device.lastActive}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scenes & Automation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Scenes</h2>
          <div className="space-y-3">
            <button className="w-full p-4 border-2 border-gray-200 rounded-lg text-left hover:border-blue-500 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">🌙 Good Night</p>
                  <p className="text-sm text-gray-600">Lock doors, turn off lights, set temp to 20°C</p>
                </div>
                <span className="text-blue-600">▶</span>
              </div>
            </button>

            <button className="w-full p-4 border-2 border-gray-200 rounded-lg text-left hover:border-blue-500 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">☀️ Good Morning</p>
                  <p className="text-sm text-gray-600">Open blinds, turn on lights, set temp to 22°C</p>
                </div>
                <span className="text-blue-600">▶</span>
              </div>
            </button>

            <button className="w-full p-4 border-2 border-gray-200 rounded-lg text-left hover:border-blue-500 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">🏃 Leaving Home</p>
                  <p className="text-sm text-gray-600">Lock doors, turn off all lights and devices</p>
                </div>
                <span className="text-blue-600">▶</span>
              </div>
            </button>
          </div>
          <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
            + Create Scene
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Automation Rules</h2>
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm">Auto Lock at 10 PM</p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <p className="text-xs text-gray-600">Automatically lock all doors at 10:00 PM</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm">Energy Saving Mode</p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <p className="text-xs text-gray-600">Reduce thermostat when no motion for 2 hours</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm">Security Alert</p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <p className="text-xs text-gray-600">Notify when door opens while away</p>
            </div>
          </div>
          <button className="mt-4 w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50">
            + Add Rule
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Smart Home Features</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Control devices remotely from anywhere</li>
          <li>Set up automation rules and schedules</li>
          <li>Monitor energy usage in real-time</li>
          <li>Receive security alerts and notifications</li>
          <li>Works with Alexa, Google Home, and Apple HomeKit</li>
        </ul>
      </div>
    </div>
  )
}
