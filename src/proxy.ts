import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Next.js 16 renamed the middleware file convention to `proxy.ts`. This one
 * runs on every matched request to refresh the Supabase auth cookies so
 * Server Components always see the latest session.
 *
 * Follows the recommended @supabase/ssr pattern: read cookies from the
 * incoming request, forward them to Supabase, mirror any cookies Supabase
 * sets back onto the outgoing response.
 *
 * If Supabase env vars aren't configured yet (phase 1 dev mode), we just
 * pass the request through — nothing to refresh.
 */
export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Touch getUser() so @supabase/ssr rotates expiring tokens and emits the
  // Set-Cookie headers we mirrored above. Intentionally ignore the result —
  // page code re-reads the user via its own server client.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Skip static assets, the Next.js image optimiser, and the cron endpoint
  // (it auths via Bearer and never carries user cookies).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/cron|.*\\.(?:png|jpg|jpeg|svg|gif|webp)$).*)",
  ],
};
