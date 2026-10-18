/**
 * Next.js Edge Middleware
 *
 * AUTH STRATEGY CHOICE (per .windsurfrules Section 8.8):
 * ──────────────────────────────────────────────────────────────────────
 * CHOICE (b): middleware.ts performs NO auth-presence redirect at all and
 * relies solely on ProtectedRoute's client-side check, accepting a one-frame
 * flash of protected layout before redirect on an unauthenticated hard navigation.
 *
 * RATIONALE:
 * - This project uses memory-only token storage (no cookie, no localStorage)
 * - Next.js Edge Middleware intercepts full-page browser navigations, which
 *   never carry a custom Authorization header
 * - Therefore, middleware.ts has NO reliable way to observe "is this user
 *   authenticated" on a hard navigation or page refresh using a Bearer-header
 *   check alone
 * - Implementing a header-only check would redirect every legitimately-
 *   authenticated user on every hard refresh of a protected route
 *
 * CONSEQUENCE:
 * - Users may see a one-frame flash of protected layout before client-side
 *   ProtectedRoute redirects unauthenticated users to /login
 * - This is an acceptable trade-off for correct memory-only token storage
 * ──────────────────────────────────────────────────────────────────────
 *
 * This middleware is now limited to:
 * - Logging: Structured request logging (credentials redacted)
 * - Request ID injection for tracing
 *
 * Role/permission enforcement is handled by ProtectedRoute/useAuth client-side.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Main middleware function
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const startTime = Date.now();

  // Logging: Log request start (credentials redacted per Section 8)
  console.log('[Edge Request]', {
    method: request.method,
    pathname,
    timestamp: new Date().toISOString(),
  });

  // Create response and log completion
  const response = NextResponse.next();
  const duration = Date.now() - startTime;

  response.headers.set('X-Request-ID', crypto.randomUUID());

  console.log('[Edge Response]', {
    method: request.method,
    pathname,
    duration: `${duration}ms`,
    status: 'processing',
  });

  return response;
}

/**
 * Configure middleware matcher
 * 
 * Per Section 8.8: Scoped to the protected route prefixes: /dashboard, /scans, /tools,
 * /results, /vulnerabilities, /reports, /analytics, /alerts, /integrations, /settings, /admin
 */
export const config = {
  matcher: [
    /*
     * Match protected route prefixes only
     * - /dashboard
     * - /scans
     * - /tools
     * - /results
     * - /vulnerabilities
     * - /reports
     * - /analytics
     * - /alerts
     * - /integrations
     * - /settings
     * - /admin
     * 
     * Exclude static files and API routes
     */
    '/dashboard/:path*',
    '/scans/:path*',
    '/tools/:path*',
    '/results/:path*',
    '/vulnerabilities/:path*',
    '/reports/:path*',
    '/analytics/:path*',
    '/alerts/:path*',
    '/integrations/:path*',
    '/settings/:path*',
    '/admin/:path*',
  ],
};
