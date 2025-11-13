'use client'

import { usePathname } from 'next/navigation'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Determine user type based on current route
  const isTenantPortal = pathname.startsWith('/tenant')
  const isLandlordPortal = pathname.startsWith('/landlord')

  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-blue-600">🏢 PropManage</h1>
                </div>
                <nav className="flex space-x-2 text-sm">
                  {/* Show navigation based on current portal */}
                  {isTenantPortal ? (
                    <>
                      <a href="/tenant" className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md font-medium">
                        My Portal
                      </a>
                      <button className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md font-medium">
                        Logout
                      </button>
                    </>
                  ) : isLandlordPortal ? (
                    <>
                      <a href="/landlord" className="text-white bg-green-600 hover:bg-green-700 px-3 py-2 rounded-md font-medium">
                        My Portal
                      </a>
                      <button className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md font-medium">
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <a href="/" className="text-gray-700 hover:text-blue-600 px-2 py-2 rounded-md font-medium">
                        Dashboard
                      </a>
                      <a href="/properties" className="text-gray-700 hover:text-blue-600 px-2 py-2 rounded-md font-medium">
                        Properties
                      </a>
                      <a href="/renters" className="text-gray-700 hover:text-blue-600 px-2 py-2 rounded-md font-medium">
                        Tenants
                      </a>
                      <a href="/leases" className="text-gray-700 hover:text-blue-600 px-2 py-2 rounded-md font-medium">
                        Leases
                      </a>
                      <a href="/rent-payments" className="text-gray-700 hover:text-blue-600 px-2 py-2 rounded-md font-medium">
                        Payments
                      </a>
                      <a href="/tenant" className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md font-medium ml-2">
                        Tenant Login
                      </a>
                      <a href="/landlord" className="text-white bg-green-600 hover:bg-green-700 px-3 py-2 rounded-md font-medium">
                        Landlord Login
                      </a>
                    </>
                  )}
                </nav>
              </div>
            </div>
          </header>
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
