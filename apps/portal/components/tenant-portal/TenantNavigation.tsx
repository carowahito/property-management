'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'

function usePaymentPlansEligible() {
  const { data: session } = useSession()
  const tenantId = session?.user?.id
  const { data } = useQuery({
    queryKey: ['nav-tenant-movein', tenantId],
    queryFn: () => fetch(`/api/tenants/${tenantId}`).then(r => r.json()),
    enabled: !!tenantId,
    staleTime: 10 * 60 * 1000,
  })
  const moveInDate = data?.moveInDate
  if (!moveInDate) return false
  const twoYearsAgo = new Date()
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
  return new Date(moveInDate) <= twoYearsAgo
}

export default function TenantNavigation() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const pathname = usePathname()
  const showPaymentPlans = usePaymentPlansEligible()

  const isActive = (path: string) => pathname?.startsWith(path)

  const navItems = [
    { href: '/tenant/dashboard', label: 'Dashboard', icon: '📊' },
    {
      label: 'Property',
      icon: '🏠',
      submenu: [
        { href: '/tenant/lease', label: 'My Lease' },
        { href: '/tenant/security', label: 'Security' },
        { href: '/tenant/analytics', label: 'Analytics' },
      ]
    },
    {
      label: 'Financial',
      icon: '💰',
      submenu: [
        { href: '/tenant/payments', label: 'Payments' },
        { href: '/tenant/autopay', label: 'Auto-Pay' },
        ...(showPaymentPlans ? [{ href: '/tenant/payment-plans', label: 'Payment Plans' }] : []),
        { href: '/tenant/insurance', label: 'Insurance' },
      ]
    },
    { 
      label: 'Services', 
      icon: '🔧',
      submenu: [
        { href: '/tenant/maintenance', label: 'Maintenance' },
        { href: '/tenant/quotes', label: 'Repair Quotes' },
        { href: '/tenant/amenities', label: 'Amenities' },
        { href: '/tenant/packages', label: 'Packages' },
        { href: '/tenant/parking', label: 'Parking' },
        { href: '/tenant/requests', label: 'Service Requests' },
      ]
    },
    { 
      label: 'Community', 
      icon: '👥',
      submenu: [
        { href: '/tenant/roommates', label: 'Roommates' },
        { href: '/tenant/community', label: 'Community' },
        { href: '/tenant/sublease', label: 'Sublease' },
        { href: '/tenant/referrals', label: 'Referrals' },
        { href: '/tenant/reviews', label: 'Reviews' },
        { href: '/tenant/pets', label: 'Pets' },
      ]
    },
    { href: '/tenant/messages', label: 'Messages', icon: '💬' },
  ]

  return (
    <nav className="bg-white shadow-sm border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/tenant/dashboard" className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/tochi-logo.svg" alt="Tochi Property" className="h-9 w-auto" />
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
                    <>
                      <button
                        className={`inline-flex items-center px-3 py-5 text-sm font-medium transition ${
                          item.submenu.some(sub => isActive(sub.href))
                            ? 'text-primary-600 border-b-2 border-primary-600'
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
                        <div className="absolute left-0 mt-0 w-48 bg-white shadow-lg rounded-md py-1 z-50 border border-neutral-200">
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={`block px-4 py-2 text-sm transition ${
                                isActive(subItem.href)
                                  ? 'bg-primary-50 text-primary-600 font-medium'
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
                    <Link
                      href={item.href!}
                      className={`inline-flex items-center px-3 py-5 text-sm font-medium transition ${
                        isActive(item.href!)
                          ? 'text-primary-600 border-b-2 border-primary-600'
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
            <button className="text-neutral-500 hover:text-neutral-900 p-2" title="Notifications">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <Link href="/tenant/profile" className="text-sm font-medium text-neutral-700 hover:text-neutral-900">👤 Profile</Link>
            <Link href="/tenant/support" className="text-sm font-medium text-neutral-700 hover:text-neutral-900">❓ Support</Link>
            <Link href="/" className="text-sm font-medium text-danger-600 hover:text-danger-800">🚪 Logout</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
