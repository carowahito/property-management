'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface Lease {
  id: string;
  monthlyRent: string;
  startDate: string;
  endDate: string;
  status: string;
  tenant: { id: string; name: string; email?: string };
  property: { id: string; name: string; address?: string };
}

export default function RenewalsPage() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetch('/api/leases?limit=200')
      .then(r => r.json())
      .then(data => { setLeases(data.leases || []); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  // Compute renewal candidates: active leases expiring within 6 months
  const now = new Date();
  const sixMonthsOut = new Date(now);
  sixMonthsOut.setMonth(sixMonthsOut.getMonth() + 6);

  const renewalCandidates = leases
    .filter(l => l.status === 'ACTIVE')
    .map(l => {
      const endDate = new Date(l.endDate);
      const diffMs = endDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const monthsRemaining = Math.ceil(daysRemaining / 30);
      return { ...l, endDateObj: endDate, daysRemaining, monthsRemaining };
    })
    .filter(l => l.daysRemaining <= 180) // within 6 months
    .sort((a, b) => a.daysRemaining - b.daysRemaining); // soonest first

  const getUrgency = (days: number) => {
    if (days <= 0) return 'expired';
    if (days <= 30) return 'critical';
    if (days <= 60) return 'soon';
    return 'upcoming';
  };

  const filteredRenewals = renewalCandidates.filter(r => {
    if (filterStatus === 'all') return true;
    return getUrgency(r.daysRemaining) === filterStatus;
  });

  const stats = {
    total: renewalCandidates.length,
    critical: renewalCandidates.filter(r => r.daysRemaining <= 30 && r.daysRemaining > 0).length,
    soon: renewalCandidates.filter(r => r.daysRemaining > 30 && r.daysRemaining <= 60).length,
    expired: renewalCandidates.filter(r => r.daysRemaining <= 0).length,
  };

  const getUrgencyColor = (days: number) => {
    if (days <= 0) return 'bg-danger-100 text-red-800';
    if (days <= 30) return 'bg-danger-100 text-red-800';
    if (days <= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-primary-100 text-primary-800';
  };

  const getUrgencyLabel = (days: number) => {
    if (days <= 0) return 'Expired';
    if (days <= 30) return 'Critical';
    if (days <= 60) return 'Expiring Soon';
    return 'Upcoming';
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>;
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-neutral-900'>Lease Renewals</h1>
          <p className='text-neutral-600 mt-1'>Active leases expiring within 6 months</p>
        </div>
        <Button variant="primary" size="lg">+ Send Renewal Notice</Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Total Upcoming</p>
          <p className='text-3xl font-bold text-neutral-900'>{stats.total}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Critical (30 days)</p>
          <p className='text-3xl font-bold text-danger-600'>{stats.critical}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Expiring Soon (60 days)</p>
          <p className='text-3xl font-bold text-yellow-600'>{stats.soon}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Already Expired</p>
          <p className='text-3xl font-bold text-danger-600'>{stats.expired}</p>
        </div>
      </div>

      <div className='bg-surface shadow rounded-lg p-4'>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className='px-4 py-2 border border-neutral-300 rounded-lg'
        >
          <option value='all'>All</option>
          <option value='expired'>Expired</option>
          <option value='critical'>Critical (≤30 days)</option>
          <option value='soon'>Expiring Soon (≤60 days)</option>
          <option value='upcoming'>Upcoming (61-180 days)</option>
        </select>
      </div>

      <div className='bg-surface shadow rounded-lg overflow-hidden'>
        {filteredRenewals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500">No lease renewals due in this category</p>
          </div>
        ) : (
          <table className='min-w-full divide-y divide-neutral-200'>
            <thead className='bg-neutral-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>Tenant</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>Property</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>Lease End</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>Time Remaining</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>Current Rent</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>Urgency</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>Actions</th>
              </tr>
            </thead>
            <tbody className='bg-surface divide-y divide-neutral-200'>
              {filteredRenewals.map((lease) => (
                <tr key={lease.id} className='hover:bg-neutral-50'>
                  <td className='px-6 py-4 text-sm font-medium'>
                    <Link href={`/admin/tenants/${lease.tenant.id}`} className='text-primary-600 hover:text-primary-800 hover:underline'>
                      {lease.tenant.name}
                    </Link>
                  </td>
                  <td className='px-6 py-4'>
                    <Link href={`/admin/properties/${lease.property.id}`} className='text-sm text-primary-600 hover:text-primary-800 hover:underline'>
                      {lease.property.name}
                    </Link>
                  </td>
                  <td className='px-6 py-4 text-sm text-neutral-900'>{formatDate(lease.endDate)}</td>
                  <td className='px-6 py-4'>
                    <span className={`text-sm font-semibold ${lease.daysRemaining <= 30 ? 'text-danger-600' : lease.daysRemaining <= 60 ? 'text-yellow-600' : 'text-neutral-900'}`}>
                      {lease.daysRemaining <= 0
                        ? `${Math.abs(lease.daysRemaining)} days overdue`
                        : `${lease.daysRemaining} days (${lease.monthsRemaining} mo)`}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-sm font-semibold text-neutral-900'>
                    KES {Number(lease.monthlyRent).toLocaleString()}
                  </td>
                  <td className='px-6 py-4'>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(lease.daysRemaining)}`}>
                      {getUrgencyLabel(lease.daysRemaining)}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-sm space-x-2'>
                    <Link href={`/admin/leases/${lease.id}`} className='text-primary-600 hover:text-primary-800'>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
