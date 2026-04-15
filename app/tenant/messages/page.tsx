'use client'

import { useQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function MessagesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['tenant-messages'],
    queryFn: () => fetch('/api/messages').then(r => r.json()),
  })

  const messages = data?.messages || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Messages</h1>
        <p className="mt-2 text-neutral-600">Your communications with property management</p>
      </div>

      {messages.length === 0 ? (
        <div className="bg-surface shadow rounded-lg p-12 text-center">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-neutral-900">No messages yet</h3>
          <p className="text-neutral-500 mt-2">Messages from your property manager will appear here.</p>
        </div>
      ) : (
        <div className="bg-surface shadow rounded-lg divide-y divide-neutral-200">
          {messages.map((msg: any) => (
            <div key={msg.id} className="p-4 hover:bg-neutral-50 cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-neutral-900">{msg.subject}</p>
                  <p className="text-sm text-neutral-600 mt-1">{msg.content?.slice(0, 100)}...</p>
                </div>
                <span className="text-xs text-neutral-500">{msg.sentAt?.split('T')[0]}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
