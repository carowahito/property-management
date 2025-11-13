import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { TenantProvider } from '@/contexts/tenant-context';
import TenantNavigation from '@/components/tenant-portal/TenantNavigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tenant Portal - Catalyst Suite',
  description: 'Manage your rental property, payments, and maintenance requests',
};

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <AuthProvider>
          <TenantProvider>
            <div className='min-h-screen bg-gray-50'>
              {/* Tenant Portal Navigation */}
              <TenantNavigation />

              {/* Page Content */}
              <main>{children}</main>

              {/* Footer */}
              <footer className='bg-white border-t border-gray-200 mt-12'>
                <div className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
                  <p className='text-center text-sm text-gray-500'>
                    © 2025 Catalyst Suite. All rights reserved. | Need help?{' '}
                    <Link href='/tenant/support' className='text-blue-600 hover:text-blue-800'>
                      Contact Support
                    </Link>
                  </p>
                </div>
              </footer>
            </div>
          </TenantProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
