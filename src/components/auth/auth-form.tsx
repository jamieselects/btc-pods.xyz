"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp, type AuthFormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

type Mode = "sign-in" | "sign-up";

export function AuthForm({ mode }: { mode: Mode }) {
  const action = mode === "sign-in" ? signIn : signUp;
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    action,
    null,
  );

  const title = mode === "sign-in" ? "Sign in" : "Create account";
  const cta = mode === "sign-in" ? "Sign in" : "Create account";
  const altHref = mode === "sign-in" ? "/sign-up" : "/sign-in";
  const altLabel =
    mode === "sign-in"
      ? "Need an account? Sign up"
      : "Already have an account? Sign in";

  return (
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

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{title === "Sign in" ? "New here?" : "Returning?"}</span>
        <Link href={altHref} className="text-primary hover:underline">
          {altLabel}
        </Link>
      </div>
    </form>
  );
}
