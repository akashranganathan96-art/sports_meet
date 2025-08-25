const { NextResponse } = require("next/server");
const { verifyToken } = require("./src/lib/auth");

/**
 * Middleware to protect routes and handle authentication
 * @param {import('next/server').NextRequest} request
 */
function middleware(request) {
  const token = request.cookies.get("auth-token")?.value;
  
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, API routes, and favicon
  if (
    pathname.startsWith("/_next/") || // Next.js assets
    pathname.startsWith("/static/") || // Public static assets folder
    pathname.startsWith("/api/") || // API routes
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sw.js"
  ) {
    return NextResponse.next();
  }

  // Public routes that don't require authentication
  if (pathname === "/" || pathname === "/login") {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify the token
  const user = verifyToken(token);
  if (!user) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("auth-token");
    return response;
  }

  // Admin routes protection
  if (pathname.startsWith("/admin") && user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/user", request.url));
  }

  // User routes protection
  if (pathname.startsWith("/user") && user.role !== "USER") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Allow request to proceed
  return NextResponse.next();
}

const config = {
  matcher: [
    /*
     * Apply middleware to all paths except:
     * - API routes
     * - Next.js internal assets
     * - Public static files, favicon, robots.txt, service worker
     */
    "/((?!api|_next/|static/|favicon.ico|robots.txt|sw.js).*)",
  ],
};

module.exports = { middleware, config };
