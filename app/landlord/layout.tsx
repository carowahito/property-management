import Link from 'next/link'

export default function LandlordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/landlord/dashboard" className="flex items-center">
                <span className="text-xl font-bold text-green-600">Landlord Portal</span>
              </Link>
              <div className="ml-10 flex space-x-6">
                <Link href="/landlord/dashboard" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-green-600">Dashboard</Link>
                <Link href="/landlord/properties" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">Properties</Link>
                <Link href="/landlord/tenants" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">Tenants</Link>
                <Link href="/landlord/financials" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">Financials</Link>
                <Link href="/landlord/maintenance" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">Maintenance</Link>
                <Link href="/landlord/leases" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">Leases</Link>
                <Link href="/landlord/documents" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">Documents</Link>
                <Link href="/landlord/analytics" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">Analytics</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/landlord/settings" className="text-sm font-medium text-gray-700 hover:text-gray-900">Settings</Link>
              <Link href="/landlord/profile" className="text-sm font-medium text-gray-700 hover:text-gray-900">Profile</Link>
              <Link href="/" className="text-sm font-medium text-red-600 hover:text-red-800">Logout</Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="min-h-screen bg-gray-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</main>
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">© 2025 Catalyst Suite - Landlord Portal</p>
        </div>
      </footer>
    </>
  )
}
