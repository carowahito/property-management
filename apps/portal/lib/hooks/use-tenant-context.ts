'use client'

import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

/**
 * Returns the effective tenant ID and whether an admin is currently
 * assuming a tenant's identity.
 *
 * - Real TENANT session  → id comes from session.user.id
 * - ADMIN/AGENT session  → id comes from ?tenantId= query param
 */
export function useTenantContext() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()

  const isTenant = session?.user?.role === 'TENANT'
  const isAdmin = !isTenant && !!session?.user?.role

  const tenantId = isTenant
    ? (session?.user?.id ?? null)
    : (searchParams.get('tenantId') ?? null)

  return {
    tenantId,
    isAssuming: isAdmin && !!tenantId,
    isAdmin,
    isTenant,
    /** Append to any /tenant/* href to preserve context */
    assumeParam: isAdmin && tenantId ? `?tenantId=${tenantId}` : '',
  }
}
