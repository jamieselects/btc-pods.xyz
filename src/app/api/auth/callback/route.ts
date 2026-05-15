import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { captureServerEvent, distinctUserId } from "@/lib/posthog";

export const runtime = "nodejs";

const SIGNUP_CAPTURE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const USER_FACING_CALLBACK_ERROR = "Sign in failed. Please try again.";

/**
 * GET /api/auth/callback — Supabase Auth redirect target for magic links
 * and OAuth providers. Exchanges the `code` query param for a session
 * and bounces the user to `next` (default: /dashboard).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";
  const oauthError = url.searchParams.get("error");
  const oauthErrorDescription = url.searchParams.get("error_description");

  if (oauthError) {
    await captureServerEvent({
      distinctId: "oauth_google",
      event: "auth_failed",
      properties: {
        method: "google",
        flow: "oauth_callback",
        reason: oauthErrorDescription ?? oauthError,
      },
    });
    const signIn = new URL("/sign-in", url);
    signIn.searchParams.set(
      "error",
      formatCallbackError(oauthErrorDescription ?? oauthError),
    );
    return NextResponse.redirect(signIn);
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        await captureServerEvent({
          distinctId: "oauth_google",
          event: "auth_failed",
          properties: {
            method: "google",
            flow: "oauth_callback",
            reason: error.message,
          },
        });
        const signIn = new URL("/sign-in", url);
        signIn.searchParams.set("error", formatCallbackError(error.message));
        return NextResponse.redirect(signIn);
      }

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (user) {
        const providers =
          user.identities
            ?.map((identity) => identity.provider)
            .filter((provider): provider is string => Boolean(provider)) ?? [];
        const providerList = [...new Set(providers)];
        const method = providerList.includes("google") ? "google" : "password_or_magic_link";

        await captureServerEvent({
          distinctId: distinctUserId(user.id),
          event: "auth_succeeded",
          properties: {
            method,
            flow: "auth_callback",
            providers: providerList,
          },
        });

        if (providerList.length > 1) {
          await captureServerEvent({
            distinctId: distinctUserId(user.id),
            event: "auth_account_linked",
            properties: {
              link_type: "automatic_same_email",
              providers: providerList,
            },
          });
        }

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
      await captureServerEvent({
        distinctId: "oauth_google",
        event: "auth_failed",
        properties: {
          method: "google",
          flow: "oauth_callback",
          reason: err instanceof Error ? err.message : "unknown_error",
        },
      });
      const signIn = new URL("/sign-in", url);
      signIn.searchParams.set(
        "error",
        err instanceof Error ? formatCallbackError(err.message) : USER_FACING_CALLBACK_ERROR,
      );
      return NextResponse.redirect(signIn);
    }
  }

  return NextResponse.redirect(new URL(next, url));
}

function formatCallbackError(raw: string): string {
  const value = raw.toLowerCase();
  if (value.includes("access_denied") || value.includes("cancel")) {
    return "Google sign in was cancelled.";
  }
  if (value.includes("expired") || value.includes("invalid grant")) {
    return "Sign in link expired. Please try again.";
  }
  if (value.includes("provider") && value.includes("disabled")) {
    return "Google sign in is not enabled yet. Try email sign in.";
  }
  if (value.includes("redirect")) {
    return "OAuth redirect is misconfigured. Contact support if this persists.";
  }
  return USER_FACING_CALLBACK_ERROR;
}
