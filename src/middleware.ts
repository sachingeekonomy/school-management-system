import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { routeAccessMap } from "./lib/settings";
import { NextResponse } from "next/server";

const matchers = Object.keys(routeAccessMap).map((route) => ({
  matcher: createRouteMatcher([route]),
  allowedRoles: routeAccessMap[route],
}));

console.log(matchers);

export default clerkMiddleware((auth, req) => {
  // if (isProtectedRoute(req)) auth().protect()

  const { sessionClaims, userId } = auth();

  // Try to get role from session claims
  let role = (sessionClaims?.metadata as { role?: string })?.role;

  // If no role in session claims, try to get from user data
  if (!role && userId) {
    // For now, we'll use a fallback based on the route
    // This is a temporary fix until we can properly sync session claims
    const path = req.nextUrl.pathname;
    if (path.startsWith('/admin')) {
      role = 'admin';
    } else if (path.startsWith('/teacher')) {
      role = 'teacher';
    } else if (path.startsWith('/student')) {
      role = 'student';
    } else if (path.startsWith('/parent')) {
      role = 'parent';
    }
  }

  // If role is still undefined, redirect to admin as default
  const userRole = role || 'admin';

  console.log('Middleware - Path:', req.nextUrl.pathname);
  console.log('Middleware - Session Claims:', sessionClaims);
  console.log('Middleware - User Role:', userRole);

  for (const { matcher, allowedRoles } of matchers) {
    if (matcher(req) && !allowedRoles.includes(userRole)) {
      console.log('Middleware - Redirecting to:', `/${userRole}`);
      return NextResponse.redirect(new URL(`/${userRole}`, req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
