/** Minutes between Vercel Cron hits; must stay in sync with `vercel.json` (five-minute cadence). */
export const DISPATCH_CRON_PERIOD_MINUTES = 5;

export const DISPATCH_SLOTS_PER_DAY =
  (24 * 60) / DISPATCH_CRON_PERIOD_MINUTES;

/** UTC slot index 0 .. DISPATCH_SLOTS_PER_DAY - 1 */
export function utcSlotIndexForDispatch(now: Date): number {
  const minuteOfDay =
    now.getUTCHours() * 60 + now.getUTCMinutes();
  return Math.floor(minuteOfDay / DISPATCH_CRON_PERIOD_MINUTES);
}

/**
 * Same spacing as `scripts/generate-vercel-crons.ts`: show `i` of `n` fires in
 * slot ⌊ i · S / n ⌋ where S = slots per day. Injective when n ≤ S.
 */
export function slotIndexForPodcastIndex(
  podcastIndex: number,
  podcastCount: number,
): number {
  return Math.floor(
    (podcastIndex * DISPATCH_SLOTS_PER_DAY) / podcastCount,
  );
}

export function podcastIndicesForSlot(
  slotIndex: number,
  podcastCount: number,
): number[] {
  const out: number[] = [];
  for (let i = 0; i < podcastCount; i++) {
    if (slotIndexForPodcastIndex(i, podcastCount) === slotIndex) out.push(i);
  }
  return out;
}
