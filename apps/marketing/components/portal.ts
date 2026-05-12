// Cross-app links resolve against the portal. Configure via NEXT_PUBLIC_PORTAL_URL;
// defaults to localhost:3001 for dev. In production this points at the portal's
// domain (e.g. https://app.tochiproperty.com).
export const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL ?? 'http://localhost:3001'

export const portal = (path: string) => `${PORTAL_URL}${path}`
