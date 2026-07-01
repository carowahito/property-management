'use client'

import { useRouter } from 'next/navigation'
import { clearAssumedTenant } from '@/lib/assumed-tenant'
import { useTenantContext } from '@/lib/hooks/use-tenant-context'

export function AssumedTenantBanner() {
  const { isAssuming, assumedTenant } = useTenantContext()
  const router = useRouter()

  if (!isAssuming || !assumedTenant) return null

  const handleExit = () => {
    clearAssumedTenant()
    router.push('/admin/tenants')
    router.refresh()
  }

  return (
    <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between text-sm font-medium">
      <span>
        Viewing as <strong>{assumedTenant.name}</strong>
        {assumedTenant.unitNumber ? ` · Unit ${assumedTenant.unitNumber}` : ''}
      </span>
      <button
        onClick={handleExit}
        className="ml-4 px-3 py-1 text-xs bg-white text-amber-700 font-semibold rounded hover:bg-amber-50 transition-colors"
      >
        Exit to Admin
      </button>
    </div>
  )
}
