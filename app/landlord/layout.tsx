'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function LandlordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const isActive = (path: string) => pathname?.startsWith(path)

  const navItems = [
    { href: '/landlord/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/landlord/properties', label: 'Properties', icon: '🏢' },
    { 
      label: 'Financials', 
      icon: '💰',
      submenu: [
        { href: '/landlord/financials', label: 'Overview' },
        { href: '/landlord/financials/statements', label: 'Statements' },
      ]
    },
    { 
      label: 'Operations', 
      icon: '🔧',
      submenu: [
        { href: '/landlord/maintenance', label: 'Maintenance' },
        { href: '/landlord/quotes', label: 'Quotes' },
        { href: '/landlord/repairs', label: 'Work Evidence' },
      ]
    },
    { 
      label: 'Management', 
      icon: '📋',
      submenu: [
        { href: '/landlord/tenants', label: 'Tenants' },
        { href: '/landlord/leases', label: 'Leases' },
        { href: '/landlord/documents', label: 'Documents' },
      ]
    },
    { href: '/landlord/analytics', label: 'Analytics', icon: '📈' },
  ]

  return (
    <>
      <nav className="bg-surface shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/landlord/dashboard" className="flex items-center">
                <span className="text-xl font-bold text-success-600">Landlord Portal</span>
              </Link>
              <div className="ml-10 flex space-x-1">
                {navItems.map((item) => (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => item.submenu && setActiveDropdown(item.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    {item.submenu ? (
                      // Dropdown menu item
                      <>
                        <button
                          className={`inline-flex items-center px-3 py-5 text-sm font-medium transition ${
                            item.submenu.some(sub => isActive(sub.href))
                              ? 'text-success-600 border-b-2 border-success-600'
                              : 'text-neutral-500 hover:text-neutral-900'
                          }`}
                        >
                          <span className="mr-1">{item.icon}</span>
                          {item.label}
                          <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {activeDropdown === item.label && (
                          <div className="absolute left-0 mt-0 w-48 bg-surface shadow-lg rounded-md py-1 z-50 border border-neutral-200">
                            {item.submenu.map((subItem) => (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                className={`block px-4 py-2 text-sm transition ${
                                  isActive(subItem.href)
                                    ? 'bg-success-50 text-success-600 font-medium'
                                    : 'text-neutral-700 hover:bg-neutral-50'
                                }`}
                              >
                                {subItem.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      // Regular link
                      <Link
                        href={item.href!}
                        className={`inline-flex items-center px-3 py-5 text-sm font-medium transition ${
                          isActive(item.href!)
                            ? 'text-success-600 border-b-2 border-success-600'
                            : 'text-neutral-500 hover:text-neutral-900'
                        }`}
                      >
                        <span className="mr-1">{item.icon}</span>
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/landlord/settings" className="text-sm font-medium text-neutral-700 hover:text-neutral-900">⚙️ Settings</Link>
              <Link href="/landlord/profile" className="text-sm font-medium text-neutral-700 hover:text-neutral-900">👤 Profile</Link>
              <Link href="/" className="text-sm font-medium text-danger-600 hover:text-danger-800">🚪 Logout</Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="min-h-screen bg-neutral-50">{children}</main>
      <footer className="bg-surface border-t border-neutral-200 mt-12">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-neutral-500">© 2025 Catalyst Suite - Landlord Portal</p>
        </div>
      </footer>
    </>
  )
}
