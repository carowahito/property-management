'use client';

import { TenantNotifications } from '@/components/tenant-portal/tenant-notifications';

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
      <TenantNotifications notifications={mockNotifications} />
    </div>
  );
}
