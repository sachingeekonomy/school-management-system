import { NextRequest, NextResponse } from 'next/server';
import { routeAccessMap } from './lib/settings';
import { getSessionFromRequest } from './lib/auth';

export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow access to login page and API routes
  if (path === '/sign-in' || path.startsWith('/api/') || path.startsWith('/_next/') || path.includes('.')) {
    return NextResponse.next();
  }

  // Get user session from cookies
  const session = getSessionFromRequest(request);
  
  // If no session, redirect to login
  if (!session) {
    console.log(`No session found, redirecting to login`);
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  const userRole = session.role;
  console.log(`Middleware: User ${session.username} (${userRole}) accessing ${path}`);

  // Check route access based on user role
  for (const [routePattern, allowedRoles] of Object.entries(routeAccessMap)) {
    const regex = new RegExp(routePattern);
    const isMatch = regex.test(path);
    console.log(`Route check: ${path} matches ${routePattern} = ${isMatch}, allowed roles: ${allowedRoles.join(', ')}, user role: ${userRole}`);
    
    if (isMatch && !allowedRoles.includes(userRole)) {
      console.log(`Access denied: ${userRole} cannot access ${path}`);
      return NextResponse.redirect(new URL(`/${userRole}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
