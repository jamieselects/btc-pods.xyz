import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DonateButton } from "@/components/DonateButton";
import { SignOutButton } from "@/components/nav/sign-out-button";
import { getCurrentUser } from "@/lib/dal";
import { hasEnv } from "@/lib/env";

// Toggle this to false to instantly restore the previous mobile header layout.
const USE_COMPACT_MOBILE_HEADER = true;

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

        {USE_COMPACT_MOBILE_HEADER ? (
          <>
            <nav className="flex w-full items-center gap-1 sm:hidden">
              {donationsEnabled ? (
                <DonateButton
                  triggerLabel="Donate"
                  variant="outline"
                  size="sm"
                  className="h-6 flex-1 justify-center px-1 text-[0.68rem]"
                />
              ) : null}
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-6 flex-1 justify-center px-1 text-[0.68rem]"
              >
                <Link href="/podcasts">Podcasts</Link>
              </Button>
              {user ? (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-6 flex-1 justify-center px-1 text-[0.68rem]"
                >
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-6 flex-1 justify-center px-1 text-[0.68rem]"
                >
                  <Link href="/sign-in">Sign in</Link>
                </Button>
              )}
              {user ? (
                <SignOutButton className="h-6 flex-1 justify-center px-1 text-[0.68rem] text-muted-foreground" />
              ) : (
                <Button
                  asChild
                  size="sm"
                  className="h-6 flex-1 justify-center px-1 text-[0.68rem]"
                >
                  <Link href="/sign-up">Sign up</Link>
                </Button>
              )}
            </nav>

            <nav className="hidden w-full items-center gap-1 sm:flex sm:w-auto sm:flex-nowrap">
              {donationsEnabled ? <DonateButton triggerLabel="Donate" /> : null}
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
          </>
        ) : (
          <nav className="grid w-full grid-cols-2 gap-1 sm:flex sm:w-auto sm:flex-nowrap sm:items-center">
            {donationsEnabled ? (
              <DonateButton
                triggerLabel="Donate"
                className="w-full justify-center sm:w-auto"
              />
            ) : null}
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="w-full justify-center sm:w-auto"
            >
              <Link href="/podcasts">Podcasts</Link>
            </Button>

            {user ? (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center sm:w-auto"
                >
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <span
                  className="ml-2 hidden font-mono text-xs text-muted-foreground sm:inline"
                  title={user.email}
                >
                  {user.email}
                </span>
                <SignOutButton className="w-full justify-center sm:w-auto" />
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center sm:w-auto"
                >
                  <Link href="/sign-in">Sign in</Link>
                </Button>
                <Button asChild size="sm" className="w-full justify-center sm:w-auto">
                  <Link href="/sign-up">Sign up</Link>
                </Button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
