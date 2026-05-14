"use client";

import { useTransition } from "react";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

type SignOutButtonProps = {
  className?: string;
};

export function SignOutButton({ className }: SignOutButtonProps) {
  const [pending, start] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      disabled={pending}
      onClick={() => start(async () => void (await signOut()))}
    >
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
