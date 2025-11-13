'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Booking {
  id: string
  amenity: string
  date: string
  timeSlot: string
  status: 'confirmed' | 'pending' | 'cancelled'
}

interface Amenity {
  id: string
  name: string
  icon: string
  description: string
  available: boolean
  rules: string[]
  bookingWindow: number // days in advance
}

export default function AmenitiesPage() {
  const [activeTab, setActiveTab] = useState<'book' | 'mybookings'>('book')
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null)

  const amenities: Amenity[] = [
    {
      id: 'gym',
      name: 'Fitness Center',
      icon: '💪',
      description: 'Fully equipped gym with cardio and weight training equipment',
      available: true,
      rules: ['Maximum 2 hours per session', 'Clean equipment after use', 'No outside guests'],
      bookingWindow: 7,
    },
    {
      id: 'pool',
      name: 'Swimming Pool',
      icon: '🏊',
      description: 'Olympic-size swimming pool with lounging area',
      available: true,
      rules: ['Swimwear required', 'No diving in shallow end', 'Children must be supervised', 'Maximum 3 hours per session'],
      bookingWindow: 14,
    },
    {
      id: 'clubhouse',
      name: 'Clubhouse',
      icon: '🏛️',
      description: 'Community hall perfect for parties and events (capacity: 50 people)',
      available: true,
      rules: ['Requires deposit', 'Must clean after use', 'No loud music after 10 PM', 'Book at least 7 days in advance'],
      bookingWindow: 30,
    },
    {
      id: 'bbq',
      name: 'BBQ Area',
      icon: '🔥',
      description: 'Outdoor grilling stations with seating area',
      available: true,
      rules: ['Bring your own charcoal', 'Clean grill after use', 'Maximum 4 hours per booking'],
      bookingWindow: 7,
    },
    {
      id: 'tennis',
      name: 'Tennis Court',
      icon: '🎾',
      description: 'Professional tennis court with lighting',
      available: true,
      rules: ['Proper tennis shoes required', 'Maximum 2 hours per session', 'Bring your own equipment'],
      bookingWindow: 14,
    },
    {
      id: 'playground',
      name: 'Children\'s Playground',
      icon: '🎪',
      description: 'Safe play area for children ages 2-12',
      available: true,
      rules: ['Children must be supervised', 'No bikes or scooters', 'Age limit: 2-12 years'],
      bookingWindow: 0, // No booking required
    },
  ]

  const myBookings: Booking[] = [
    {
      id: 'b1',
      amenity: 'Fitness Center',
      date: '2025-11-10',
      timeSlot: '06:00 AM - 08:00 AM',
      status: 'confirmed',
    },
    {
      id: 'b2',
      amenity: 'Swimming Pool',
      date: '2025-11-12',
      timeSlot: '02:00 PM - 05:00 PM',
      status: 'confirmed',
    },
    {
      id: 'b3',
      amenity: 'Clubhouse',
      date: '2025-11-20',
      timeSlot: '06:00 PM - 10:00 PM',
      status: 'pending',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Amenities & Bookings</h1>
        <p className="mt-2 text-gray-600">
          Book and manage community amenities
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('book')}
            className={`${
              activeTab === 'book'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Book Amenities
          </button>
          <button
            onClick={() => setActiveTab('mybookings')}
            className={`${
              activeTab === 'mybookings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            My Bookings ({myBookings.length})
          </button>
        </nav>
      </div>

      {/* Book Amenities Tab */}
      {activeTab === 'book' && (
        <div>
          {!selectedAmenity ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {amenities.map((amenity) => (
                <div
                  key={amenity.id}
                  className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="text-5xl text-center mb-4">{amenity.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                      {amenity.name}
                    </h3>
                    <p className="text-sm text-gray-600 text-center mb-4">
                      {amenity.description}
                    </p>

                    {amenity.bookingWindow === 0 ? (
                      <div className="text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          No Booking Required
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedAmenity(amenity)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                      >
                        Book Now
                      </button>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-2">Rules:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {amenity.rules.slice(0, 2).map((rule, index) => (
                          <li key={index}>• {rule}</li>
                        ))}
                        {amenity.rules.length > 2 && (
                          <li className="text-blue-600">
                            +{amenity.rules.length - 2} more rules
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Booking Form
            <div className="max-w-3xl mx-auto">
              <button
                onClick={() => setSelectedAmenity(null)}
                className="mb-6 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                ← Back to Amenities
              </button>

              <div className="bg-white shadow rounded-lg p-6">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{selectedAmenity.icon}</div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedAmenity.name}</h2>
                  <p className="text-gray-600">{selectedAmenity.description}</p>
                </div>

                <form className="space-y-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Select Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Can book up to {selectedAmenity.bookingWindow} days in advance
                    </p>
                  </div>

                  <div>
                    <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700 mb-1">
                      Time Slot
                    </label>
                    <select
                      id="timeSlot"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a time slot</option>
                      <option value="06:00-08:00">06:00 AM - 08:00 AM</option>
                      <option value="08:00-10:00">08:00 AM - 10:00 AM</option>
                      <option value="10:00-12:00">10:00 AM - 12:00 PM</option>
                      <option value="12:00-14:00">12:00 PM - 02:00 PM</option>
                      <option value="14:00-16:00">02:00 PM - 04:00 PM</option>
                      <option value="16:00-18:00">04:00 PM - 06:00 PM</option>
                      <option value="18:00-20:00">06:00 PM - 08:00 PM</option>
                      <option value="20:00-22:00">08:00 PM - 10:00 PM</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Guests
                    </label>
                    <input
                      type="number"
                      id="guests"
                      min="1"
                      max="10"
                      defaultValue="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
                      Purpose (Optional)
                    </label>
                    <textarea
                      id="purpose"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="E.g., Birthday party, workout session, etc."
                    ></textarea>
                  </div>

                  {/* Rules */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-yellow-900 mb-2">
                      Rules & Guidelines
                    </h3>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      {selectedAmenity.rules.map((rule, index) => (
                        <li key={index}>• {rule}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Agreement */}
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="agreeRules"
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      required
                    />
                    <label htmlFor="agreeRules" className="ml-3 text-sm text-gray-700">
                      I agree to follow all rules and guidelines for this amenity
                    </label>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setSelectedAmenity(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      Confirm Booking
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* My Bookings Tab */}
      {activeTab === 'mybookings' && (
        <div>
          {myBookings.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't booked any amenities. Start by booking one!
              </p>
              <button
                onClick={() => setActiveTab('book')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Browse Amenities
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myBookings.map((booking) => (
                <div key={booking.id} className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{booking.amenity}</h3>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(booking.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {booking.timeSlot}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      {booking.status !== 'cancelled' && (
                        <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
