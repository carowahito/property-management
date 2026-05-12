'use client';

import { Button } from '@/components/ui/button';

export default function DocumentsPage() {
  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-neutral-900'>Property Documents</h1>
          <p className='text-neutral-600 mt-1'>
            Manage all property-related documents and certificates
          </p>
        </div>
        <Button variant="primary" size="lg">+ Upload Document</Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Total Documents</p>
          <p className='text-3xl font-bold text-neutral-900'>0</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Active</p>
          <p className='text-3xl font-bold text-success-600'>0</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Expiring Soon</p>
          <p className='text-3xl font-bold text-yellow-600'>0</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Expired</p>
          <p className='text-3xl font-bold text-danger-600'>0</p>
        </div>
      </div>

      <div className='bg-surface shadow rounded-lg p-12 text-center'>
        <div className='text-5xl mb-4'>📄</div>
        <h3 className='text-lg font-semibold text-neutral-900 mb-2'>No documents yet</h3>
        <p className='text-neutral-500 max-w-md mx-auto'>
          Document management is coming soon. You&apos;ll be able to upload and manage property deeds, insurance policies, permits, and certificates.
        </p>
      </div>
    </div>
  );
}
