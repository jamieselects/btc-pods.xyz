"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import posthog from "posthog-js";
import {
  signIn,
  signInWithGoogle,
  signUp,
  type AuthFormState,
} from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

type Mode = "sign-in" | "sign-up";
const GOOGLE_AUTH_FLAG_KEY = "auth_google_oauth";
const FORCE_GOOGLE_AUTH = process.env.NEXT_PUBLIC_FORCE_GOOGLE_AUTH === "true";

function GoogleLogo(props: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={props.className}
    >
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.8-6-6.2s2.7-6.2 6-6.2c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 2.8 14.7 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.7-4.1 9.7-9.8 0-.7-.1-1.3-.2-1.9H12z"
      />
      <path
        fill="#34A853"
        d="M3.2 7.3l3.2 2.4C7.3 7.7 9.4 6 12 6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 2.8 14.7 2 12 2 8.2 2 4.9 4.2 3.2 7.3z"
      />
      <path
        fill="#4A90E2"
        d="M12 22c2.6 0 4.8-.9 6.4-2.4l-3-2.5c-.8.6-1.9 1-3.4 1-3.9 0-5.3-2.6-5.5-3.9l-3.2 2.5C4.9 19.8 8.2 22 12 22z"
      />
      <path
        fill="#FBBC05"
        d="M6.5 14.2c-.1-.4-.2-.8-.2-1.2s.1-.8.2-1.2L3.2 9.3C2.4 10.9 2 11.9 2 13s.4 2.1 1.2 3.7l3.3-2.5z"
      />
    </svg>
  );
}

export function AuthForm({ mode }: { mode: Mode }) {
  const action = mode === "sign-in" ? signIn : signUp;
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    action,
    null,
  );
  const [isGoogleAuthEnabled, setIsGoogleAuthEnabled] = useState(false);
  const cta = mode === "sign-in" ? "Sign in" : "Create account";
  const altHref = mode === "sign-in" ? "/sign-up" : "/sign-in";
  const altLabel =
    mode === "sign-in"
      ? "Need an account? Sign up"
      : "Already have an account? Sign in";

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncFeatureFlag = () => {
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      if (FORCE_GOOGLE_AUTH && isLocalhost) {
        setIsGoogleAuthEnabled(true);
        return;
      }
      setIsGoogleAuthEnabled(
        Boolean(posthog.isFeatureEnabled?.(GOOGLE_AUTH_FLAG_KEY)),
      );
    };

    syncFeatureFlag();
    posthog.onFeatureFlags?.(() => syncFeatureFlag());
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {isGoogleAuthEnabled ? (
        <>
          <form action={signInWithGoogle} className="flex">
            <Button type="submit" variant="outline" size="lg" className="w-full">
              <GoogleLogo className="mr-1 size-4" />
              Continue with Google
            </Button>
          </form>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>
        </>
      ) : null}

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {state?.errors?.email ? (
            <p className="text-xs text-destructive">{state.errors.email[0]}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={
              mode === "sign-in" ? "current-password" : "new-password"
            }
            minLength={8}
            required
            className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {state?.errors?.password ? (
            <p className="text-xs text-destructive">{state.errors.password[0]}</p>
          ) : null}
        </div>

        {mode === "sign-in" ? (
          <div className="-mt-2 flex justify-end">
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
        ) : null}

        {state?.errors?.form ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {state.errors.form[0]}
          </p>
        ) : null}

        {state?.message ? (
          <p className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-primary">
            {state.message}
          </p>
        ) : null}

        <Button type="submit" disabled={pending} size="lg">
          {pending ? "Working…" : cta}
        </Button>

        <div className="flex items-center justify-end text-xs text-muted-foreground">
          <Link href={altHref} className="text-primary hover:underline">
            {altLabel}
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to the{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
