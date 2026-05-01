import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

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
