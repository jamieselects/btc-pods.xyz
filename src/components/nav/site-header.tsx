import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/nav/sign-out-button";
import { getCurrentUser } from "@/lib/dal";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-border/60 bg-background/60 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-mono text-sm uppercase tracking-widest text-primary"
        >
          ₿ BTC Pod Summaries
        </Link>

        <nav className="flex items-center gap-1">
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
