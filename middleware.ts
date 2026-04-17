import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Using a lightweight in-memory store for rate limiting in edge environments.
// Note: On Vercel, state is not shared globally across Edge nodes, but this 
// effectively stalls basic unauthenticated abuse scripts hitting the same isolate.

// Track IPs and their request counts
const ipStore = new Map<string, { count: number; expiresAt: number }>();

// 120 requests per 1-minute window
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 120;

function cleanupStore() {
  const now = Date.now();
  for (const [ip, data] of ipStore.entries()) {
    if (data.expiresAt < now) {
      ipStore.delete(ip);
    }
  }
}

export function middleware(request: NextRequest) {
  // Only apply rate limiting to the shell routes / API interactions
  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith("/dashboard") && 
      !pathname.startsWith("/timeline") && 
      !pathname.startsWith("/files") && 
      !pathname.startsWith("/diff") &&
      !pathname.startsWith("/branches") &&
      !pathname.startsWith("/stashes") &&
      !pathname.startsWith("/remotes")) {
    return NextResponse.next();
  }

  // Get the client's IP from standard headers
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";

  const now = Date.now();
  
  // Clean up occasionally to prevent memory leaks from long-running isolates
  if (Math.random() < 0.05) cleanupStore();

  const record = ipStore.get(ip);
  if (!record || record.expiresAt < now) {
    ipStore.set(ip, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    record.count++;
    if (record.count > RATE_LIMIT_MAX_REQUESTS) {
      // Ratelimit tripped
      return new NextResponse(
        JSON.stringify({ 
          error: "Too Many Requests", 
          message: "You have exceeded the rate limit. Please wait a minute before sending more queries." 
        }),
        { 
          status: 429, 
          headers: { 
            "Content-Type": "application/json",
            "Retry-After": Math.ceil((record.expiresAt - now) / 1000).toString()
          } 
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply limiting to these routes (which fetch from GitHub server-side)
    "/dashboard/:path*",
    "/timeline/:path*",
    "/files/:path*",
    "/diff/:path*",
    "/branches/:path*",
    "/stashes/:path*",
    "/remotes/:path*"
  ]
};
