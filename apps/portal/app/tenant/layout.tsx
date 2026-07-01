import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { TenantProvider } from '@/contexts/tenant-context';
import TenantNavigation from '@/components/tenant-portal/TenantNavigation';
import { AssumedTenantBanner } from '@/components/tenant-portal/AssumedTenantBanner';
import '@/lib/amplify-config';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tenant Portal - Catalyst Suite',
  description: 'Manage your rental property, payments, and maintenance requests',
};

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TenantProvider>
        <AssumedTenantBanner />
        <TenantNavigation />
        <div className='min-h-screen bg-neutral-50'>
          {/* Page Content */}
          <main>{children}</main>

          {/* Footer */}
          <footer className='bg-surface border-t border-neutral-200 mt-12'>
            <div className='py-6 px-4 sm:px-6 lg:px-8'>
              <p className='text-center text-sm text-neutral-500'>
                © 2025 Tochi Property. All rights reserved. | Need help?{' '}
                <Link href='/tenant/support' className='text-primary-600 hover:text-primary-800'>
                  Contact Support
                </Link>
              </p>
            </div>
          </footer>
        </div>
      </TenantProvider>
    </AuthProvider>
  );
}
