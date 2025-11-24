// admin/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// allow only your user frontend domain(s)
const allowedOrigins = [
  "http://localhost:3000",   // local user frontend
   "http://localhost:3001",   // local user frontend
   "https://www.aigevent.tech", // production user frontend
   "aigevent.tech", // production user frontend
   "www.aigevent.tech", // production user frontend
  "https://aigevent.tech", // production user frontend
  "https://aig-user-side.vercel.app", // production user frontend
  "https://manage.aigevent.tech",  // production event manager frontend
  "www.manage.aigevent.tech",   // production event manager frontend
];

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "";
  const res = NextResponse.next();

  // Handle CORS
  if (allowedOrigins.includes(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
  }
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests (OPTIONS)
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: res.headers,
    });
  }

  return res;
}

// Apply only to API routes
export const config = {
  matcher: ["/api/:path*"],
};
