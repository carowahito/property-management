'use client'
export default function CommunityPage() {
  const posts = [
    { id: 1, author: 'Property Management', date: '2025-11-05', title: 'Pool Maintenance - Nov 15', content: 'Pool will be closed for maintenance.', category: 'announcement' },
    { id: 2, author: 'Apt 301', date: '2025-11-03', title: 'Found: Black Cat', content: 'Found near building A. Contact if yours.', category: 'lost-found' },
  ]
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Board</h1>
      <p className="text-gray-600 mb-8">Stay connected with your community</p>
      <button className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">+ New Post</button>
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">{post.category}</span>
              <span className="text-xs text-gray-500">{post.date}</span>
            </div>
            <h3 className="font-semibold text-lg mb-1">{post.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{post.content}</p>
            <p className="text-xs text-gray-500">Posted by {post.author}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
