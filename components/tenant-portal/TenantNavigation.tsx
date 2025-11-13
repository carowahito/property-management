'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function TenantNavigation() {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})
  const navRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const toggleMenu = (menu: string) => {
    setOpenMenus(prev => ({
      property: menu === 'property' ? !prev.property : false,
      financial: menu === 'financial' ? !prev.financial : false,
      services: menu === 'services' ? !prev.services : false,
      community: menu === 'community' ? !prev.community : false,
      account: menu === 'account' ? !prev.account : false,
    }))
  }

  // Close menus when navigating
  useEffect(() => {
    setOpenMenus({})
  }, [pathname])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenus({})
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav ref={navRef} className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-12">
          <div className="flex space-x-1 items-center flex-wrap">
            <Link href="/tenant/dashboard" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50">Dashboard</Link>
            
            {/* Property Menu */}
            <div className="relative">
              <button 
                onClick={() => toggleMenu('property')} 
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              >
                Property
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              {openMenus.property && (
                <div className="absolute left-0 mt-0 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <Link href="/tenant/lease" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Lease</Link>
                  <Link href="/tenant/utilities" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Utilities</Link>
                  <Link href="/tenant/energy" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Energy Usage</Link>
                  <Link href="/tenant/access" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Access Control</Link>
                  <Link href="/tenant/smart-home" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Smart Home</Link>
                  <Link href="/tenant/security" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Security</Link>
                  <Link href="/tenant/tours" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Virtual Tours</Link>
                </div>
              )}
            </div>

            {/* Financial Menu */}
            <div className="relative">
              <button 
                onClick={() => toggleMenu('financial')} 
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              >
                Financial
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              {openMenus.financial && (
                <div className="absolute left-0 mt-0 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <Link href="/tenant/payments" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Payments</Link>
                  <Link href="/tenant/autopay" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Auto-Pay</Link>
                  <Link href="/tenant/payment-plans" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Payment Plans</Link>
                  <Link href="/tenant/insurance" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Insurance</Link>
                  <Link href="/tenant/analytics" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Analytics</Link>
                </div>
              )}
            </div>

            {/* Services Menu */}
            <div className="relative">
              <button 
                onClick={() => toggleMenu('services')} 
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              >
                Services
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              {openMenus.services && (
                <div className="absolute left-0 mt-0 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <Link href="/tenant/maintenance" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Maintenance</Link>
                  <Link href="/tenant/amenities" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Amenities</Link>
                  <Link href="/tenant/packages" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Packages</Link>
                  <Link href="/tenant/parking" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Parking</Link>
                  <Link href="/tenant/requests" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Service Requests</Link>
                </div>
              )}
            </div>

            {/* Community Menu */}
            <div className="relative">
              <button 
                onClick={() => toggleMenu('community')} 
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              >
                Community
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              {openMenus.community && (
                <div className="absolute left-0 mt-0 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <Link href="/tenant/roommates" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Roommates</Link>
                  <Link href="/tenant/community" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Community</Link>
                  <Link href="/tenant/sublease" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Sublease</Link>
                  <Link href="/tenant/referrals" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Referrals</Link>
                  <Link href="/tenant/reviews" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Reviews</Link>
                  <Link href="/tenant/pets" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Pets</Link>
                </div>
              )}
            </div>

            <Link href="/tenant/messages" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">Messages</Link>
          </div>

          <div className="ml-auto flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-900 p-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            {/* Account Menu */}
            <div className="relative">
              <button 
                onClick={() => toggleMenu('account')} 
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Account</span>
              </button>
              {openMenus.account && (
                <div className="absolute right-0 mt-0 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <Link href="/tenant/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                  <Link href="/tenant/documents" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Documents</Link>
                  <Link href="/tenant/move/notice" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Move Out</Link>
                  <Link href="/tenant/emergency" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Emergency Contacts</Link>
                  <Link href="/tenant/support" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Support</Link>
                  <div className="border-t border-gray-200"></div>
                  <Link href="/tenant/logout" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Logout</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
