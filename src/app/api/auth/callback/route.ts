import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { captureServerEvent, distinctUserId } from "@/lib/posthog";

export const runtime = "nodejs";

const SIGNUP_CAPTURE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * GET /api/auth/callback — Supabase Auth redirect target for magic links
 * and OAuth providers. Exchanges the `code` query param for a session
 * and bounces the user to `next` (default: /dashboard).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        const signIn = new URL("/sign-in", url);
        signIn.searchParams.set("error", error.message);
        return NextResponse.redirect(signIn);
      }

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (user) {
        const ageMs = Date.now() - new Date(user.created_at).getTime();
        if (ageMs >= 0 && ageMs < SIGNUP_CAPTURE_WINDOW_MS) {
          await captureServerEvent({
            distinctId: distinctUserId(user.id),
            event: "user_signed_up",
            properties: {
              $insert_id: `signup_complete_${user.id}`,
              signup_source: "email_or_oauth_callback",
            },
          });
        }
      }
    } catch (err) {
      const signIn = new URL("/sign-in", url);
      signIn.searchParams.set(
        "error",
        err instanceof Error ? err.message : "Auth callback failed",
      );
      return NextResponse.redirect(signIn);
    }
  }

  return NextResponse.redirect(new URL(next, url));
}
