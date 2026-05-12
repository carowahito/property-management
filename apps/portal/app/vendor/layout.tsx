import Link from 'next/link'

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <nav className="bg-surface shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/vendor" className="flex items-center">
                <span className="text-xl font-bold text-warning-600">Vendor Portal</span>
              </Link>
              <div className="ml-10 flex space-x-6">
                <Link href="/vendor" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-neutral-900 hover:text-warning-600">Dashboard</Link>
                <Link href="/vendor/quotes" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-neutral-500 hover:text-neutral-900">Quotes</Link>
                <Link href="/vendor/jobs" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-neutral-500 hover:text-neutral-900">Active Jobs</Link>
                <Link href="/vendor/projects" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-neutral-500 hover:text-neutral-900">Projects</Link>
                <Link href="/vendor/receipts" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-neutral-500 hover:text-neutral-900">Receipts</Link>
                <Link href="/vendor/evidence" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-neutral-500 hover:text-neutral-900">Evidence</Link>
                <Link href="/vendor/payments" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-neutral-500 hover:text-neutral-900">Payments</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/vendor/profile" className="text-sm font-medium text-neutral-700 hover:text-neutral-900">Profile</Link>
              <Link href="/" className="text-sm font-medium text-danger-600 hover:text-danger-800">Logout</Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="min-h-screen bg-neutral-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      <footer className="bg-surface border-t border-neutral-200 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-neutral-500">© 2025 Catalyst Suite - Vendor Portal</p>
        </div>
      </footer>
    </>
  )
}
