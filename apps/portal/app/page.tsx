import Link from 'next/link'

const ROLES = [
  {
    key: 'admin',
    title: 'Admin',
    description: 'Manage properties, tenants, finances, and maintenance.',
    href: '/admin/login',
    accent: 'from-primary-600 to-primary-700',
  },
  {
    key: 'landlord',
    title: 'Landlord',
    description: 'Track your portfolio, rent collection, and reports.',
    href: '/landlord/login',
    accent: 'from-purple-600 to-purple-700',
  },
  {
    key: 'tenant',
    title: 'Tenant',
    description: 'Pay rent, view your lease, and raise maintenance.',
    href: '/tenant/login',
    accent: 'from-success-600 to-success-700',
  },
  {
    key: 'vendor',
    title: 'Vendor',
    description: 'Pick up jobs, log evidence, and submit invoices.',
    href: '/vendor/login',
    accent: 'from-orange-600 to-orange-700',
  },
] as const

export default function PortalLanding() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-3">
            Tochi Property Portal
          </h1>
          <p className="text-lg text-neutral-600">Sign in to continue. Choose your role.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {ROLES.map((role) => (
            <Link
              key={role.key}
              href={role.href}
              className="group bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${role.accent} p-6 text-white`}>
                <h2 className="text-2xl font-bold">{role.title}</h2>
              </div>
              <div className="p-6">
                <p className="text-neutral-600 mb-4">{role.description}</p>
                <span className="inline-flex items-center text-sm font-semibold text-primary-700 group-hover:text-primary-900">
                  Sign in as {role.title.toLowerCase()}
                  <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
