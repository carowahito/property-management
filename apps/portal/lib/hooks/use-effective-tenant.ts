'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { getAssumedTenant, AssumedTenant } from '@/lib/assumed-tenant'

export interface EffectiveTenant {
  tenantId: string | null
  sessionStatus: 'loading' | 'authenticated' | 'unauthenticated'
  isTenant: boolean
  isAdmin: boolean
  assumedTenant: AssumedTenant | null
}

export function useEffectiveTenant(): EffectiveTenant {
  const { data: session, status } = useSession()
  const isTenant = session?.user?.role === 'TENANT'
  const isAdmin = !isTenant && !!session?.user?.role

  // Read assumed-tenant cookie synchronously (no flash, no useEffect)
  const [assumedTenant] = useState<AssumedTenant | null>(() => getAssumedTenant())

  const tenantId = isTenant
    ? (session?.user?.id ?? null)
    : (assumedTenant?.id ?? null)

  return { tenantId, sessionStatus: status, isTenant, isAdmin, assumedTenant }
}
