"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { createClient } from "@/lib/supabase/client";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!POSTHOG_KEY || typeof window === "undefined") return;

    if (!posthog.__loaded) {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        capture_pageview: true,
        capture_pageleave: true,
      });
    }

    let supabase;
    try {
      supabase = createClient();
    } catch {
      return;
    }

    const sync = (userId: string | undefined, email: string | undefined) => {
      if (userId) {
        posthog.identify(userId, email ? { email } : undefined);
      } else {
        posthog.reset();
      }
    };

    void supabase.auth.getSession().then(({ data: { session } }) => {
      sync(session?.user.id, session?.user.email ?? undefined);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      sync(session?.user.id, session?.user.email ?? undefined);
    });

    return () => subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}
