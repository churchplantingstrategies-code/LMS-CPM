import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = [
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.FLUTTER_WEB_ORIGIN,
  "http://localhost:3000",
  "http://localhost:7364",
].filter((origin): origin is string => Boolean(origin));

function applyCorsHeaders(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get("origin");

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Vary", "Origin");
  }

  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");

  return response;
}

export function middleware(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return applyCorsHeaders(request, new NextResponse(null, { status: 204 }));
  }

  return applyCorsHeaders(request, NextResponse.next());
}

export const config = {
  matcher: ["/api/:path*"],
};
