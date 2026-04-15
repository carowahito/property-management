import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Routes that require authentication
const protectedRoutes = ['/admin', '/tenant', '/landlord', '/vendor']

// Public routes that should redirect to dashboard if already authenticated
const publicRoutes = ['/admin/login', '/admin/forgot-password', '/tenant/login', '/landlord/login', '/vendor/login']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))
  const isPublicRoute = publicRoutes.some((route) => path === route)

  // Get session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !token && !path.includes('/login') && !path.includes('/register') && !path.includes('/forgot-password')) {
    // Redirect to the portal-specific login page
    let loginPath = '/admin/login'
    if (path.startsWith('/tenant')) loginPath = '/tenant/login'
    else if (path.startsWith('/landlord')) loginPath = '/landlord/login'
    else if (path.startsWith('/vendor')) loginPath = '/vendor/login'

    const loginUrl = new URL(loginPath, request.url)
    loginUrl.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if accessing public route while authenticated
  if (isPublicRoute && token) {
    let dashboard = '/admin'
    if (path.startsWith('/tenant')) dashboard = '/tenant/dashboard'
    else if (path.startsWith('/landlord')) dashboard = '/landlord/dashboard'

    return NextResponse.redirect(new URL(dashboard, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
