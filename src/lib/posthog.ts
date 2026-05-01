import { PostHog } from "posthog-node";
import { env } from "@/lib/env";

/**
 * Server-side PostHog client for cron and API routes.
 * `flushAt: 1` so events ship immediately — important for short-lived cron jobs.
 *
 * Returns null if PostHog isn't configured so callers can no-op gracefully.
 */
let cached: PostHog | null = null;

export function getPostHogServer(): PostHog | null {
  if (!env.NEXT_PUBLIC_POSTHOG_KEY) return null;

  if (!cached) {
    cached = new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    });
  }

  return cached;
}

/** Haiku pricing (per 1M tokens) — keep in sync with spec §9.2. */
export const HAIKU_INPUT_USD_PER_M = 0.25;
export const HAIKU_OUTPUT_USD_PER_M = 1.25;
/** Whisper pricing — $0.006 per minute. */
export const WHISPER_USD_PER_MINUTE = 0.006;

export function estimateHaikuCostUsd(inputTokens: number, outputTokens: number) {
  return (
    (inputTokens / 1_000_000) * HAIKU_INPUT_USD_PER_M +
    (outputTokens / 1_000_000) * HAIKU_OUTPUT_USD_PER_M
  );
}

export function estimateWhisperCostUsd(durationSeconds: number) {
  return (durationSeconds / 60) * WHISPER_USD_PER_MINUTE;
}
