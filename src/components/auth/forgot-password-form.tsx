"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, type AuthFormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    requestPasswordReset,
    null,
  );

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
        {pending ? "Sending…" : "Send reset link"}
      </Button>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Remembered it?</span>
        <Link href="/sign-in" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    </form>
  );
}
