import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DonateButton } from "@/components/DonateButton";
import { SignOutButton } from "@/components/nav/sign-out-button";
import { getCurrentUser } from "@/lib/dal";
import { hasEnv } from "@/lib/env";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const donationsEnabled = hasEnv("STRIKE_API_KEY");

  return (
    <header className="border-b border-border/60 bg-background/60 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-3 sm:h-14 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-0">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-widest text-primary sm:text-sm"
        >
          <span className="sm:hidden">₿ BTC Pods</span>
          <span className="hidden sm:inline">₿ BTC Pod Summaries</span>
        </Link>

        <nav className="flex w-full flex-wrap items-center gap-1 sm:w-auto sm:flex-nowrap">
          {donationsEnabled ? (
            <DonateButton triggerLabel="Pay what you can" />
          ) : null}
          <Button asChild variant="ghost" size="sm">
            <Link href="/podcasts">Podcasts</Link>
          </Button>

          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <span
                className="ml-2 hidden font-mono text-xs text-muted-foreground sm:inline"
                title={user.email}
              >
                {user.email}
              </span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
