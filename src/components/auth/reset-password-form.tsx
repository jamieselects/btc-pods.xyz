"use client";

import { useActionState } from "react";
import { updatePassword, type AuthFormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    updatePassword,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {state?.errors?.password ? (
          <p className="text-xs text-destructive">{state.errors.password[0]}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {state?.errors?.confirmPassword ? (
          <p className="text-xs text-destructive">
            {state.errors.confirmPassword[0]}
          </p>
        ) : null}
      </div>

      {state?.errors?.form ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {state.errors.form[0]}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} size="lg">
        {pending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
