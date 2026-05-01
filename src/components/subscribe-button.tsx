"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toggleSubscription } from "@/app/actions/subscriptions";
import { Button } from "@/components/ui/button";

type Props = {
  podcastId: string;
  initialSubscribed: boolean;
  isAuthenticated: boolean;
};

export function SubscribeButton({
  podcastId,
  initialSubscribed,
  isAuthenticated,
}: Props) {
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <Button asChild size="sm">
        <Link href="/sign-in">Sign in to subscribe</Link>
      </Button>
    );
  }

  const onClick = () => {
    setError(null);
    const next = !subscribed;
    setSubscribed(next);
    start(async () => {
      const result = await toggleSubscription(podcastId, next);
      if (!result.ok) {
        setSubscribed(!next);
        setError(result.error ?? "Something went wrong.");
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="sm"
        variant={subscribed ? "outline" : "default"}
        disabled={pending}
        onClick={onClick}
      >
        {pending
          ? "Saving…"
          : subscribed
            ? "✓ Subscribed"
            : "Subscribe"}
      </Button>
      {error ? (
        <span className="text-xs text-destructive">{error}</span>
      ) : null}
    </div>
  );
}
