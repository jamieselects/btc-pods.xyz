"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type SuggestPodcastFormProps = {
  className?: string;
};

export function SuggestPodcastForm({ className }: SuggestPodcastFormProps) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneSlug, setDoneSlug] = useState<string | null>(null);
  const [doneName, setDoneName] = useState<string | null>(null);
  const [alreadyThere, setAlreadyThere] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDoneSlug(null);
    setDoneName(null);
    setAlreadyThere(false);
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Paste a link or RSS feed URL.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/podcasts/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const body = (await res.json()) as {
        error?: unknown;
        podcast?: { slug: string; name: string };
        alreadyExisted?: boolean;
      };
      if (!res.ok) {
        const msg =
          typeof body.error === "string"
            ? body.error
            : Array.isArray(body.error)
              ? String(body.error[0])
              : "Something went wrong.";
        setError(msg);
        return;
      }
      if (body.podcast?.slug) {
        setDoneSlug(body.podcast.slug);
        setDoneName(body.podcast.name);
        setAlreadyThere(Boolean(body.alreadyExisted));
        setUrl("");
        router.refresh();
      }
    } catch {
      setError("Network error — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className={className}
      aria-labelledby="suggest-podcast-heading"
    >
      <h2
        id="suggest-podcast-heading"
        className="text-sm font-medium text-foreground"
      >
        Suggest a podcast
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Paste an{" "}
        <span className="font-medium text-foreground/90">Apple Podcasts</span>{" "}
        or{" "}
        <span className="font-medium text-foreground/90">Spotify</span> show
        link, an RSS/XML feed URL, or a webpage that links its RSS (
        <span className="font-mono text-[0.7rem]">rel=&quot;alternate&quot;</span>
        ). We resolve the feed and add the show automatically when it validates.
      </p>
      <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          name="suggest-url"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Apple, Spotify, RSS, or show website…"
          autoComplete="off"
          spellCheck={false}
          disabled={busy}
          className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        />
        <Button type="submit" disabled={busy} className="shrink-0 sm:w-auto">
          {busy ? "Adding…" : "Add to library"}
        </Button>
      </form>
      {error ? (
        <p className="mt-2 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {doneSlug ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {alreadyThere ? (
            <>
              That show is already in the library:{" "}
              <Link
                href={`/podcasts/${doneSlug}`}
                className="font-medium text-primary hover:underline"
              >
                {doneName ?? doneSlug}
              </Link>
              .
            </>
          ) : (
            <>
              Added{" "}
              <Link
                href={`/podcasts/${doneSlug}`}
                className="font-medium text-primary hover:underline"
              >
                {doneName ?? doneSlug}
              </Link>
              . It may take a moment to appear in the list.
            </>
          )}
        </p>
      ) : null}
    </section>
  );
}
