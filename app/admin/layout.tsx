'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Administration': true,
    'Main': true,
    'Property Management': true,
    'Financial': false,
    'Operations': false,
    'Team & HR': true,
    'AI & Insights': true,
    'Analytics & Reports': false,
    'Documentation': false,
  })

  // In production, get this from auth context
  const currentUserRole = 'Admin' // or 'Manager', 'Sales', 'Customer Care', 'Caretaker', 'Operations', 'Finance'

  // Don't show back button on main dashboard
  const showBackButton = pathname !== '/admin'

  const menuSections = [
    {
      title: 'Administration',
      items: [
        { href: '/admin/admin-panel', label: 'Admin Panel', icon: '🔐', adminOnly: true },
      ]
    },
    {
      title: 'Main',
      items: [
        { href: '/admin', label: 'Dashboard', icon: '📊' },
        { href: '/admin/crm', label: 'CRM - All Contacts', icon: '👥' },
        { href: '/admin/crm/tasks', label: 'All Tasks', icon: '✅' },
        { href: '/admin/crm/leads', label: 'Leads', icon: '🎯' },
        { href: '/admin/crm/enquiries', label: 'Enquiries', icon: '💬' },
        { href: '/admin/communications', label: 'Communications', icon: '📧' },
      ]
    },
    {
      title: 'Property Management',
      items: [
        { href: '/admin/properties', label: 'Properties', icon: '🏠' },
        { href: '/admin/tenants', label: 'Tenants', icon: '👥' },
        { href: '/admin/landlords', label: 'Landlords', icon: '🏢' },
        { href: '/admin/vendors', label: 'Vendors', icon: '🔨' },
        { href: '/admin/leases', label: 'Leases', icon: '📋' },
        { href: '/admin/viewings', label: 'Viewings', icon: '👁️' },
        { href: '/admin/invitations', label: 'Invitations', icon: '✉️' },
      ]
    },
    {
      title: 'Financial',
      items: [
        { href: '/admin/payments', label: 'Payments', icon: '💰' },
        { href: '/admin/rent-payments', label: 'Rent Payments', icon: '📥' },
        { href: '/admin/payouts', label: 'Payouts', icon: '💸' },
        { href: '/admin/late-fees', label: 'Late Fees', icon: '⏰' },
        { href: '/admin/deposits', label: 'Deposits', icon: '🏦' },
      ]
    },
    {
      title: 'Operations',
      items: [
        { href: '/admin/maintenance', label: 'Maintenance', icon: '🔧' },
        { href: '/admin/work-orders', label: 'Work Orders', icon: '📝' },
        { href: '/admin/inspections', label: 'Inspections', icon: '🔍' },
        { href: '/admin/renewals', label: 'Renewals', icon: '🔄' },
        { href: '/admin/occupancy', label: 'Occupancy', icon: '📐' },
      ]
    },
    {
      title: 'Team & HR',
      items: [
        { href: '/admin/team', label: 'Team Overview', icon: '👥' },
        { href: '/admin/team/ai-workload', label: 'AI Workload Analysis', icon: '📊' },
        { href: '/admin/team/leaderboard', label: 'Team Leaderboard', icon: '🏆' },
      ]
    },
    {
      title: 'AI & Insights',
      items: [
        { href: '/admin/ai-insights', label: 'AI Insights Dashboard', icon: '🤖' },
        { href: '/admin/ai-forecasts', label: 'Predictive Analytics', icon: '📈' },
        { href: '/admin/ai-sentiment', label: 'Sentiment Analysis', icon: '💬' },
        { href: '/admin/ai-query', label: 'Ask AI', icon: '🔍' },
        { href: '/admin/ai-reports', label: 'AI Reports', icon: '📄' },
      ]
    },
    {
      title: 'Analytics & Reports',
      items: [
        { href: '/admin/analytics', label: 'Analytics', icon: '📊' },
        { href: '/admin/financial-reports', label: 'Financial Reports', icon: '📑' },
        { href: '/admin/compliance', label: 'Compliance', icon: '✅' },
        { href: '/admin/sustainability', label: 'Sustainability', icon: '🌱' },
      ]
    },
    {
      title: 'Documentation',
      items: [
        { href: '/admin/documents', label: 'Documents', icon: '📄' },
        { href: '/admin/templates', label: 'Templates', icon: '📑' },
      ]
    }
  ]

  // Filter menu sections based on user role
  const getVisibleSections = () => {
    // Admin sees everything
    if (currentUserRole === 'Admin') {
      return menuSections
    }

    // Non-admins don't see Administration section
    return menuSections.filter(section => {
      // Remove Administration section for non-admins
      if (section.title === 'Administration') return false
      
      // Role-specific filtering can be added here
      // For example, Finance role only sees Financial section
      if (currentUserRole === 'Finance') {
        return ['Main', 'Financial'].includes(section.title)
      }
      
      // Sales sees Main, Property Management, and CRM-related
      if (currentUserRole === 'Sales') {
        return ['Main', 'Property Management'].includes(section.title)
      }
      
      // Customer Care sees Main and Communications
      if (currentUserRole === 'Customer Care') {
        return ['Main', 'Operations'].includes(section.title)
      }
      
      // Operations/Caretaker sees Main and Operations
      if (currentUserRole === 'Operations' || currentUserRole === 'Caretaker') {
        return ['Main', 'Operations', 'Property Management'].includes(section.title)
      }
      
      // Manager sees most sections except Administration
      if (currentUserRole === 'Manager') {
        return section.title !== 'Administration'
      }
      
      return true
    })
  }

  const visibleSections = getVisibleSections()

  const isActive = (href: string) => pathname === href

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }))
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col`}>
        {/* Logo Section */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 h-20">
          {sidebarOpen && (
            <Link href="/admin" className="flex items-center space-x-3 flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-white">🏢</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-gray-900">PropManage</h1>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
            title={sidebarOpen ? 'Collapse' : 'Expand'}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>

        {/* Navigation */}
        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {visibleSections.map((section) => (
            <div key={section.title} className="mb-6">
              {sidebarOpen ? (
                <>
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition group"
                  >
                    <span>{section.title}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${expandedSections[section.title] ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7-7-7 7" />
                    </svg>
                  </button>
                  {expandedSections[section.title] && (
                    <div className="space-y-1">
                      {section.items.map((item: any) => {
                        // Hide admin-only items from non-admins
                        if (item.adminOnly && currentUserRole !== 'Admin') {
                          return null
                        }
                        
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition text-sm font-medium group ${
                              isActive(item.href)
                                ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            } ${item.adminOnly ? 'bg-gradient-to-r from-red-50 to-transparent' : ''}`}
                          >
                            <span className="text-lg flex-shrink-0">{item.icon}</span>
                            <span className="truncate group-hover:text-gray-900">
                              {item.label}
                              {item.adminOnly && (
                                <span className="ml-2 text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-semibold">
                                  ADMIN
                                </span>
                              )}
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </>
              ) : (
                // Collapsed view - show items without section headers
                <div className="space-y-1">
                  {section.items.map((item: any) => {
                    // Hide admin-only items from non-admins
                    if (item.adminOnly && currentUserRole !== 'Admin') {
                      return null
                    }
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-center p-2 rounded-lg transition text-sm relative ${
                          isActive(item.href)
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        } ${item.adminOnly ? 'ring-2 ring-red-200' : ''}`}
                        title={item.label}
                      >
                        <span className="text-lg">{item.icon}</span>
                        {item.adminOnly && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-3">
          {sidebarOpen ? (
            <div className="space-y-1">
              <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition text-sm font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <button className="w-full flex items-center justify-center p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition" title="Logout">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
          <div className="px-8 py-3 flex justify-between items-center">
            <div className="flex flex-col">
              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg mb-2 w-fit ${
                currentUserRole === 'Admin' 
                  ? 'bg-red-100' 
                  : 'bg-gray-100'
              }`}>
                <svg className={`w-4 h-4 ${currentUserRole === 'Admin' ? 'text-red-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className={`text-xs font-semibold uppercase tracking-wide ${currentUserRole === 'Admin' ? 'text-red-700' : 'text-gray-700'}`}>
                  {currentUserRole}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentUserRole === 'Admin' ? 'Admin Suite' : `${currentUserRole} Dashboard`}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-900 p-2" title="Notifications">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Profile</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-8 py-6">
            {showBackButton && (
              <button
                onClick={() => router.back()}
                className="mb-6 flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition group"
                title="Go back"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-sm font-medium">Back</span>
              </button>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
