'use client'
import { useState } from 'react'
export default function ReviewsPage() {
  const [rating, setRating] = useState(0)
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Reviews & Feedback</h1>
      <p className="text-gray-600 mb-8">Help us improve by sharing your experience</p>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Rate Your Experience</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Overall Rating</label>
            <div className="flex space-x-2">
              {[1,2,3,4,5].map(star => (
                <button key={star} type="button" onClick={() => setRating(star)} className="text-3xl">{star <= rating ? '⭐' : '☆'}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select className="w-full px-3 py-2 border rounded-md">
              <option>Property Condition</option>
              <option>Management Response</option>
              <option>Maintenance Service</option>
              <option>Amenities</option>
              <option>Value for Money</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Your Feedback</label>
            <textarea rows={4} className="w-full px-3 py-2 border rounded-md" placeholder="Share your thoughts..."></textarea>
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Submit Review</button>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="font-semibold mb-4">Your Reviews</h3>
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded">
            <div className="flex items-center mb-2"><span className="text-yellow-500">⭐⭐⭐⭐⭐</span><span className="ml-2 text-xs text-gray-500">Nov 1, 2025</span></div>
            <p className="text-sm"><strong>Maintenance Service:</strong> Quick response to my AC issue!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
