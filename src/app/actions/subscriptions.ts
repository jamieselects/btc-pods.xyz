"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { captureServerEvent, distinctUserId } from "@/lib/posthog";

export type ToggleResult = {
  ok: boolean;
  subscribed: boolean;
  error?: string;
};

/**
 * Toggle subscription state for the current user × podcast. Runs through
 * the user-bound Supabase client so RLS enforces auth for us.
 */
export async function toggleSubscription(
  podcastId: string,
  subscribe: boolean,
): Promise<ToggleResult> {
  if (typeof podcastId !== "string" || podcastId.length < 10) {
    return { ok: false, subscribed: !subscribe, error: "Invalid podcast id." };
  }

  const supabase = await createClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return {
      ok: false,
      subscribed: !subscribe,
      error: "You need to sign in to subscribe.",
    };
  }

  if (subscribe) {
    const { error } = await supabase
      .from("subscriptions")
      .upsert(
        { user_id: userData.user.id, podcast_id: podcastId },
        { onConflict: "user_id,podcast_id", ignoreDuplicates: true },
      );
    if (error) {
      return { ok: false, subscribed: false, error: error.message };
    }
    await captureServerEvent({
      distinctId: distinctUserId(userData.user.id),
      event: "podcast_subscribed",
      properties: { podcast_id: podcastId },
    });
  } else {
    const { error } = await supabase
      .from("subscriptions")
      .delete()
      .eq("user_id", userData.user.id)
      .eq("podcast_id", podcastId);
    if (error) {
      return { ok: false, subscribed: true, error: error.message };
    }
    await captureServerEvent({
      distinctId: distinctUserId(userData.user.id),
      event: "podcast_unsubscribed",
      properties: { podcast_id: podcastId },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/podcasts");
  return { ok: true, subscribed: subscribe };
}
