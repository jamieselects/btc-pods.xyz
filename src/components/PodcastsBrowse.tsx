"use client";

import { useMemo, useState } from "react";
import { PodcastCard } from "@/components/PodcastCard";
import { SuggestPodcastForm } from "@/components/SuggestPodcastForm";
import type { CuratedPodcastWithHosts } from "@/lib/podcasts";

type PodcastsBrowseProps = {
  podcasts: CuratedPodcastWithHosts[];
  isAuthenticated: boolean;
  subscribedPodcastIds: readonly string[];
};

function matchesQuery(podcast: CuratedPodcastWithHosts, q: string): boolean {
  if (!q) return true;
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  if (podcast.name.toLowerCase().includes(needle)) return true;
  return podcast.hostNames.some((h) => h.toLowerCase().includes(needle));
}

export function PodcastsBrowse({
  podcasts,
  isAuthenticated,
  subscribedPodcastIds,
}: PodcastsBrowseProps) {
  const [query, setQuery] = useState("");

  const subscribed = useMemo(
    () => new Set(subscribedPodcastIds),
    [subscribedPodcastIds],
  );

  const filtered = useMemo(
    () => podcasts.filter((p) => matchesQuery(p, query)),
    [podcasts, query],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card/40 p-4">
        <SuggestPodcastForm />
      </div>

      <search className="flex flex-col gap-1.5 sm:max-w-md" aria-label="Search podcasts">
        <label htmlFor="podcast-search" className="text-sm font-medium">
          Search
        </label>
        <input
          id="podcast-search"
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by show or host…"
          autoComplete="off"
          spellCheck={false}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </search>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
          No podcasts match &ldquo;{query.trim()}&rdquo;.{" "}
          <button
            type="button"
            onClick={() => setQuery("")}
            className="text-primary underline-offset-4 hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PodcastCard
              key={p.id}
              slug={p.slug}
              name={p.name}
              tagline={p.tagline ?? ""}
              coverImageUrl={p.cover_image_url}
              hostNames={p.hostNames}
              subscribe={{
                podcastId: p.id,
                initialSubscribed: subscribed.has(p.id),
                isAuthenticated,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
