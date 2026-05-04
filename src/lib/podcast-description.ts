/**
 * Migration 007 stored a FeedSpot directory blurb in `description` for many
 * shows. Migration 008 replaces those with RSS summaries. This helper hides
 * any remaining placeholder copy if a database has not applied 008 yet.
 */
export function isFeedSpotPlaceholderDescription(
  text: string | null | undefined,
): boolean {
  if (text == null || text.trim() === "") return false;
  const t = text.toLowerCase();
  if (!t.includes("feedspot")) return false;
  return (
    t.includes("best bitcoin podcasts") ||
    t.includes("podcast.feedspot.com/bitcoin_podcasts")
  );
}

export function displayPodcastDescription(
  description: string | null | undefined,
): string | null {
  if (description == null || description === "") return null;
  if (isFeedSpotPlaceholderDescription(description)) return null;
  return description;
}
