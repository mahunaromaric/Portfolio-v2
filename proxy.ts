import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export function proxy(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin") || req.nextUrl.pathname.startsWith("/api") || req.nextUrl.pathname.startsWith("/_next")) {
    const res = NextResponse.next();
    addSecurityHeaders(res, req);
    return res;
  }

  const intlRes = intlMiddleware(req);
  addSecurityHeaders(intlRes, req);
  return intlRes;
}

function addSecurityHeaders(res: NextResponse, req: NextRequest) {
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") {
    res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  res.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://challenges.cloudflare.com https://cdn.simpleicons.org https://cdn.jsdelivr.net https://api-free.deepl.com https://api.deepl.com; frame-src https://challenges.cloudflare.com;",
  );
  if (req.nextUrl.pathname.startsWith("/admin")) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
}

export const config = {
  matcher: ["/", "/(fr|en)/:path*", "/((?!api|_next|_vercel|admin|opengraph-image|apple-icon|icon|.*\\..*).*)"],
};