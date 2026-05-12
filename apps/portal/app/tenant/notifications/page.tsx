'use client';

export default function TenantNotificationsPage() {
  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Notifications</h1>
      </div>
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-neutral-900">No notifications</h3>
        <p className="mt-1 text-sm text-neutral-500">You&apos;re all caught up. New notifications will appear here.</p>
      </div>
    </div>
  );
}
