const { NextResponse } = require('next/server')
const { verifyToken } = require('./src/lib/auth')

/**
 * Middleware to protect routes
 * @param {import('next/server').NextRequest} request
 */
function middleware(request) {
  const token = request.cookies.get('auth-token')?.value
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  if (pathname === '/' || pathname === '/login') {
    return NextResponse.next()
  }

  // Check if user is authenticated
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const user = verifyToken(token)
  if (!user) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth-token')
    return response
  }

  // Admin routes protection
  if (pathname.startsWith('/admin') && user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/user', request.url))
  }

  // User routes protection
  if (pathname.startsWith('/user') && user.role !== 'USER') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

const config = {
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

module.exports = { middleware, config }
