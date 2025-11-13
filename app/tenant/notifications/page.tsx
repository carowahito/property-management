'use client';

export default function TenantNotificationsPage() {
  // Mock notifications - will be replaced with actual API calls
  const mockNotifications = [
    {
      id: '1',
      title: 'Rent Payment Due',
      message: 'Your rent payment of $1,500 is due in 3 days.',
      type: 'payment' as const,
      date: new Date(Date.now() - 86400000).toISOString(),
      read: false,
    },
    {
      id: '2',
      title: 'Maintenance Request Update',
      message: 'Your maintenance request #123 has been scheduled for tomorrow.',
      type: 'maintenance' as const,
      date: new Date(Date.now() - 172800000).toISOString(),
      read: false,
    },
    {
      id: '3',
      title: 'Lease Renewal Notice',
      message: 'Your lease is up for renewal in 60 days. Please review the renewal terms.',
      type: 'lease' as const,
      date: new Date(Date.now() - 259200000).toISOString(),
      read: true,
    },
  ];

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
      </div>
      <div className="space-y-4">
        {mockNotifications.map((notification) => (
          <div key={notification.id} className={`p-4 rounded-lg border-l-4 ${notification.type === 'payment' ? 'border-red-400 bg-red-50' : notification.type === 'maintenance' ? 'border-yellow-400 bg-yellow-50' : 'border-blue-400 bg-blue-50'}`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{notification.title}</h3>
                <p className="mt-1 text-gray-600">{notification.message}</p>
                <p className="mt-1 text-sm text-gray-500">{new Date(notification.date).toLocaleDateString()}</p>
              </div>
              {!notification.read && <span className="inline-block h-3 w-3 rounded-full bg-blue-600"></span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
