"use client";

import { useTransition } from "react";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const [pending, start] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => start(async () => void (await signOut()))}
    >
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
