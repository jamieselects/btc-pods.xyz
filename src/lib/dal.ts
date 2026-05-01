import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Data Access Layer — the single place server-side code asks "who is the
 * current user?". Wraps the call in `cache()` so a render pass only talks
 * to Supabase once even if multiple components ask.
 */

export type SessionUser = {
  id: string;
  email: string;
};

/** Returns the session user, or null if not signed in. Never redirects. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user?.email) return null;
    return { id: data.user.id, email: data.user.email };
  } catch {
    // Thrown when Supabase env vars aren't set — treat as signed-out.
    return null;
  }
});

/**
 * Returns the session user, redirecting to /sign-in if absent.
 * Use inside protected Server Components and Route Handlers.
 */
export const requireUser = cache(async (): Promise<SessionUser> => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
});
