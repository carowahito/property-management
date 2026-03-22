'use client'

import { useState } from 'react'
import Link from 'next/link'

interface VirtualTour {
  id: string
  title: string
  type: 'unit' | 'amenity' | 'property' | 'neighborhood'
  thumbnail: string
  duration: string
  views: number
  featured: boolean
  spaces: string[]
}

interface TourStop {
  id: string
  name: string
  description: string
  hotspots: { x: number; y: number; info: string }[]
}

export default function VirtualToursPage() {
  const [selectedTour, setSelectedTour] = useState<VirtualTour | null>(null)
  const [currentStop, setCurrentStop] = useState(0)
  const [showScheduleForm, setShowScheduleForm] = useState(false)

  const tours: VirtualTour[] = [
    {
      id: 'tour1',
      title: 'Your Unit - Apt 4B',
      type: 'unit',
      thumbnail: '🏠',
      duration: '5 min',
      views: 0,
      featured: true,
      spaces: ['Living Room', 'Kitchen', 'Bedroom', 'Bathroom', 'Balcony'],
    },
    {
      id: 'tour2',
      title: 'Fitness Center & Gym',
      type: 'amenity',
      thumbnail: '💪',
      duration: '3 min',
      views: 156,
      featured: true,
      spaces: ['Cardio Area', 'Weight Room', 'Yoga Studio'],
    },
    {
      id: 'tour3',
      title: 'Swimming Pool & Deck',
      type: 'amenity',
      thumbnail: '🏊',
      duration: '4 min',
      views: 234,
      featured: true,
      spaces: ['Pool', 'Hot Tub', 'Sundeck', 'Cabanas'],
    },
    {
      id: 'tour4',
      title: 'Community Lounge',
      type: 'amenity',
      thumbnail: '🛋️',
      duration: '3 min',
      views: 89,
      featured: false,
      spaces: ['Lounge', 'Co-working Space', 'Kitchen'],
    },
    {
      id: 'tour5',
      title: 'Rooftop Terrace',
      type: 'amenity',
      thumbnail: '🌆',
      duration: '2 min',
      views: 178,
      featured: false,
      spaces: ['BBQ Area', 'Fire Pit', 'Seating Area'],
    },
    {
      id: 'tour6',
      title: 'Property Grounds',
      type: 'property',
      thumbnail: '🌳',
      duration: '6 min',
      views: 145,
      featured: false,
      spaces: ['Entrance', 'Gardens', 'Parking', 'Pet Area'],
    },
  ]

  const tourStops: TourStop[] = [
    {
      id: 'stop1',
      name: 'Living Room',
      description: 'Spacious living area with large windows providing natural light and city views.',
      hotspots: [
        { x: 30, y: 40, info: 'Floor-to-ceiling windows' },
        { x: 60, y: 50, info: 'Smart lighting system' },
        { x: 45, y: 70, info: 'Hardwood flooring' },
      ],
    },
    {
      id: 'stop2',
      name: 'Kitchen',
      description: 'Modern kitchen with stainless steel appliances and granite countertops.',
      hotspots: [
        { x: 25, y: 45, info: 'Stainless steel appliances' },
        { x: 70, y: 40, info: 'Granite countertops' },
        { x: 50, y: 65, info: 'Island with seating' },
      ],
    },
    {
      id: 'stop3',
      name: 'Bedroom',
      description: 'Comfortable bedroom with built-in closets and en-suite bathroom.',
      hotspots: [
        { x: 35, y: 45, info: 'Walk-in closet' },
        { x: 65, y: 35, info: 'En-suite bathroom' },
        { x: 50, y: 60, info: 'Climate control' },
      ],
    },
    {
      id: 'stop4',
      name: 'Balcony',
      description: 'Private balcony with stunning city views.',
      hotspots: [
        { x: 50, y: 30, info: 'City skyline view' },
        { x: 40, y: 60, info: 'Outdoor seating' },
      ],
    },
  ]

  const handleScheduleTour = (e: React.FormEvent) => {
    e.preventDefault()
    alert('In-person tour scheduled! You will receive a confirmation email shortly.')
    setShowScheduleForm(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Virtual Tours</h1>
        <p className="mt-2 text-neutral-600">
          Explore your unit and property amenities with immersive 360° tours
        </p>
      </div>

      {/* Active Tour Viewer */}
      {selectedTour ? (
        <div className="bg-surface shadow rounded-lg overflow-hidden mb-8">
          {/* Tour Header */}
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{selectedTour.title}</h2>
                <p className="text-sm text-primary-100">
                  Stop {currentStop + 1} of {tourStops.length}: {tourStops[currentStop].name}
                </p>
              </div>
              <button
                onClick={() => setSelectedTour(null)}
                className="text-white hover:bg-surface hover:bg-opacity-20 rounded p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 360° Viewer (Simulated) */}
          <div className="relative bg-neutral-900 aspect-video">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-8xl mb-4">🏠</div>
                <h3 className="text-2xl font-bold mb-2">{tourStops[currentStop].name}</h3>
                <p className="text-neutral-300 max-w-md mx-auto px-4 mb-6">
                  {tourStops[currentStop].description}
                </p>
                <div className="bg-surface bg-opacity-10 backdrop-blur-sm rounded-lg p-4 inline-block">
                  <p className="text-sm text-neutral-300 mb-2">🎮 Interactive Tour Controls</p>
                  <div className="flex space-x-4 text-xs">
                    <span>← → Pan</span>
                    <span>↑ ↓ Tilt</span>
                    <span>+ - Zoom</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hotspots */}
            {tourStops[currentStop].hotspots.map((hotspot, index) => (
              <button
                key={index}
                className="absolute w-8 h-8 bg-primary-500 bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all hover:scale-110 animate-pulse"
                style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                title={hotspot.info}
              >
                <span className="text-white text-xl">ℹ️</span>
              </button>
            ))}

            {/* Navigation Arrows */}
            {currentStop > 0 && (
              <button
                onClick={() => setCurrentStop(currentStop - 1)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-surface bg-opacity-80 hover:bg-opacity-100 rounded-full p-3 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            {currentStop < tourStops.length - 1 && (
              <button
                onClick={() => setCurrentStop(currentStop + 1)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-surface bg-opacity-80 hover:bg-opacity-100 rounded-full p-3 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Tour Controls */}
          <div className="p-4 bg-neutral-50 border-t border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <button className="p-2 bg-surface border border-neutral-300 rounded-md hover:bg-neutral-100 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </button>
                <button className="p-2 bg-surface border border-neutral-300 rounded-md hover:bg-neutral-100 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                  </svg>
                </button>
                <button className="p-2 bg-surface border border-neutral-300 rounded-md hover:bg-neutral-100 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => setShowScheduleForm(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
              >
                📅 Schedule In-Person Tour
              </button>
            </div>

            {/* Tour Stops Navigation */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {tourStops.map((stop, index) => (
                <button
                  key={stop.id}
                  onClick={() => setCurrentStop(index)}
                  className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentStop === index
                      ? 'bg-primary-600 text-white'
                      : 'bg-surface border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {stop.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Featured Tours */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Featured Tours</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.filter(tour => tour.featured).map((tour) => (
                <div
                  key={tour.id}
                  className="bg-surface shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedTour(tour)}
                >
                  <div className="aspect-video bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                    <span className="text-8xl">{tour.thumbnail}</span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-neutral-900">{tour.title}</h3>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {tour.duration}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 mb-3">
                      {tour.spaces.length} spaces • {tour.views} views
                    </p>
                    <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors">
                      Start Virtual Tour →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Tours */}
          <div className="bg-surface shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">All Virtual Tours</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tours.map((tour) => (
                <div
                  key={tour.id}
                  className="border border-neutral-200 rounded-lg p-4 hover:border-primary-500 transition-colors cursor-pointer"
                  onClick={() => setSelectedTour(tour)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center text-4xl flex-shrink-0">
                      {tour.thumbnail}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-900 mb-1">{tour.title}</h3>
                      <p className="text-sm text-neutral-600 mb-2">
                        {tour.spaces.join(' • ')}
                      </p>
                      <div className="flex items-center text-xs text-neutral-500 space-x-3">
                        <span>⏱️ {tour.duration}</span>
                        <span>👁️ {tour.views} views</span>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 transition-colors">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Schedule In-Person Tour Modal */}
      {showScheduleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Schedule In-Person Tour</h3>
              <button
                onClick={() => setShowScheduleForm(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleScheduleTour} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Preferred Time *
                </label>
                <select
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select time</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Areas to Tour
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-neutral-300 text-primary-600" defaultChecked />
                    <span className="ml-2 text-sm text-neutral-700">Your Unit</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-neutral-300 text-primary-600" />
                    <span className="ml-2 text-sm text-neutral-700">Fitness Center</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-neutral-300 text-primary-600" />
                    <span className="ml-2 text-sm text-neutral-700">Pool & Amenities</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-neutral-300 text-primary-600" />
                    <span className="ml-2 text-sm text-neutral-700">Property Grounds</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Any specific areas or questions you'd like to discuss..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowScheduleForm(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
                >
                  Schedule Tour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-8 bg-primary-50 border border-primary-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-primary-900 mb-3">Virtual Tour Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-primary-800">
          <div className="flex items-start">
            <span className="text-xl mr-2">🎮</span>
            <div>
              <strong>Interactive Controls:</strong> Pan, tilt, and zoom to explore every detail
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-xl mr-2">ℹ️</span>
            <div>
              <strong>Information Hotspots:</strong> Click markers to learn about features
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-xl mr-2">📱</span>
            <div>
              <strong>Mobile Friendly:</strong> Works on all devices including phones and tablets
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-xl mr-2">🕶️</span>
            <div>
              <strong>VR Compatible:</strong> Use VR headset for immersive experience
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
