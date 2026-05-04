"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleSubscription } from "@/app/actions/subscriptions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  podcastId: string;
  initialSubscribed: boolean;
  isAuthenticated: boolean;
  /** Stretch button full width (e.g. podcast grid tiles). */
  fullWidth?: boolean;
};

export function SubscribeButton({
  podcastId,
  initialSubscribed,
  isAuthenticated,
  fullWidth,
}: Props) {
  const router = useRouter();
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <Button asChild size="sm" className={cn(fullWidth && "w-full")}>
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
        return;
      }
      router.refresh();
    });
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        fullWidth ? "items-stretch" : "items-end",
      )}
    >
      <Button
        size="sm"
        variant={subscribed ? "outline" : "default"}
        disabled={pending}
        onClick={onClick}
        className={cn(fullWidth && "w-full")}
      >
        {pending
          ? "Saving…"
          : subscribed
            ? "Unsubscribe"
            : "Subscribe"}
      </Button>
      {error ? (
        <span
          className={cn(
            "text-xs text-destructive",
            fullWidth && "text-left",
          )}
        >
          {error}
        </span>
      ) : null}
    </div>
  );
}
