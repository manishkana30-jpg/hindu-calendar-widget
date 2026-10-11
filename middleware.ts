import { NextRequest, NextResponse, NextFetchEvent } from 'next/server';

/**
 * Next.js Edge Middleware for High-Speed Visitor Logging & Session Deduplication
 * 
 * Performance & Security Guarantees:
 * 1. Zero latency impact: uses event.waitUntil() to trigger asynchronous background logging.
 * 2. Deduplication: sets an HTTP-only 24-hour visitor_session cookie; returning requests within
 *    24 hours are not re-logged.
 * 3. Bot filtering: drops crawler and automated spider requests before database touch.
 * 4. Header extraction: prioritizes Cloudflare cf-* headers with Vercel fallbacks.
 * 5. Internal security: authenticates log calls with x-internal-log-secret.
 */

const BOT_USER_AGENT_REGEX =
  /bot|spider|crawl|slurp|bing|google|baidu|yandex|duckduckgo|facebookexternalhit|whatsapp|telegram|discord|twitter|pinterest|linkedin/i;

export function middleware(req: NextRequest, event: NextFetchEvent) {
  const userAgent = req.headers.get('user-agent') || '';

  // 1. Bot & Spider Exclusion Filter
  if (BOT_USER_AGENT_REGEX.test(userAgent)) {
    return NextResponse.next();
  }

  // 2. Session Deduplication Check (24h cookie window)
  const existingSession = req.cookies.get('visitor_session')?.value;
  if (existingSession) {
    // Session already logged today; proceed without database ping
    return NextResponse.next();
  }

  // 3. Generate fresh 24-hour session identifier
  const sessionId = crypto.randomUUID();
  const res = NextResponse.next();

  res.cookies.set('visitor_session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400, // 24 hours
    path: '/',
  });

  // 4. Extract IP, Geo-Country & Client Device Agent
  const ipAddress =
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    '0.0.0.0';

  const country =
    req.headers.get('cf-ipcountry') ||
    req.headers.get('x-vercel-ip-country') ||
    'UNKNOWN';

  const path = req.nextUrl.pathname;
  const internalSecret = process.env.INTERNAL_LOG_SECRET || '';
  const logUrl = new URL('/api/log-visitor', req.nextUrl.origin);

  // 5. Asynchronous Logging via event.waitUntil (Zero user-perceived delay)
  event.waitUntil(
    fetch(logUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-log-secret': internalSecret,
      },
      body: JSON.stringify({
        session_id: sessionId,
        ip_address: ipAddress,
        country,
        device_agent: userAgent || 'UNKNOWN',
        path,
      }),
    }).catch((err: unknown) => {
      console.warn('[Edge Log Notice] Async visitor logging non-blocking error:', err);
    })
  );

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (/api/*)
     * - Next.js internal static assets (_next/static, _next/image)
     * - Metadata and public icons/manifests
     * - Static media extensions
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest|xml|txt)).*)',
  ],
};
