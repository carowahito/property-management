import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Routes that require authentication
const protectedRoutes = ['/admin', '/tenant', '/landlord', '/vendor']

// Public routes that should redirect to dashboard if already authenticated
const publicRoutes = ['/admin/login', '/admin/forgot-password', '/tenant/login', '/landlord/login', '/vendor/login']

function getDashboardForRole(role?: string): string {
  switch (role) {
    case 'TENANT':
      return '/tenant/dashboard'
    case 'LANDLORD':
      return '/landlord/dashboard'
    case 'VENDOR':
      return '/vendor/dashboard'
    default:
      return '/admin'
  }
}

function getLoginForRole(role?: string): string {
  switch (role) {
    case 'TENANT':
      return '/tenant/login'
    case 'LANDLORD':
      return '/landlord/login'
    case 'VENDOR':
      return '/vendor/login'
    default:
      return '/admin/login'
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Get session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Root path: redirect based on auth state
  if (path === '/') {
    if (token) {
      return NextResponse.redirect(new URL(getDashboardForRole(token.role as string), request.url))
    }
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))
  const isPublicRoute = publicRoutes.some((route) => path === route)

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !token && !path.includes('/login') && !path.includes('/register') && !path.includes('/forgot-password')) {
    let loginPath = '/admin/login'
    if (path.startsWith('/tenant')) loginPath = '/tenant/login'
    else if (path.startsWith('/landlord')) loginPath = '/landlord/login'
    else if (path.startsWith('/vendor')) loginPath = '/vendor/login'

    const loginUrl = new URL(loginPath, request.url)
    loginUrl.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if accessing login route while authenticated
  if (isPublicRoute && token) {
    const dashboard = getDashboardForRole(token.role as string)
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
