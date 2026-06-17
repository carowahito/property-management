const COOKIE = 'assumed-tenant'

export interface AssumedTenant {
  id: string
  name: string
  unitNumber: string
}

export function getAssumedTenant(): AssumedTenant | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]+)`))
  if (!match) return null
  try {
    return JSON.parse(decodeURIComponent(match[1]))
  } catch {
    return null
  }
}

export function setAssumedTenant(tenant: AssumedTenant): void {
  const value = encodeURIComponent(JSON.stringify(tenant))
  document.cookie = `${COOKIE}=${value}; path=/; max-age=86400; SameSite=Lax`
}

export function clearAssumedTenant(): void {
  document.cookie = `${COOKIE}=; path=/; max-age=0; SameSite=Lax`
}
