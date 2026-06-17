'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { getAssumedTenant, AssumedTenant } from '@/lib/assumed-tenant'

/**
 * Returns the effective tenant ID for the current session.
 *
 * - TENANT session  → id comes from session.user.id
 * - ADMIN/AGENT session  → id comes from the assumed-tenant cookie
 *   (set when an admin clicks "Assume Tenant" on the admin portal)
 */
export function useTenantContext() {
  const { data: session, status } = useSession()

  const isTenant = session?.user?.role === 'TENANT'
  const isAdmin = !isTenant && !!session?.user?.role

  // Read cookie synchronously on first render to avoid flash
  const [assumedTenant] = useState<AssumedTenant | null>(() => getAssumedTenant())

  const tenantId = isTenant
    ? (session?.user?.id ?? null)
    : (assumedTenant?.id ?? null)

  return {
    tenantId,
    sessionStatus: status,
    isAssuming: isAdmin && !!tenantId,
    isAdmin,
    isTenant,
    assumedTenant,
  }
}
