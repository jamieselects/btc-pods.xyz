import Link from "next/link";
import { DonateButton } from "@/components/DonateButton";
import { getCurrentUser } from "@/lib/dal";
import { hasEnv } from "@/lib/env";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const user = await getCurrentUser();
  const donationsEnabled = hasEnv("STRIKE_API_KEY");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="flex max-w-2xl flex-col items-center gap-8 text-center">
        <span className="font-mono text-sm uppercase tracking-widest text-primary">
          BTC Pod Summaries
        </span>
        <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
          Bitcoin podcasts, summarised.
        </h1>
        <p className="text-balance text-lg text-muted-foreground">
          Subscribe to your favourite Bitcoin shows. Get a concise email
          summary after every new episode. Free, fast, and Bitcoin-native.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/podcasts">Browse podcasts</Link>
          </Button>
          {user ? (
            donationsEnabled ? (
              <DonateButton
                triggerLabel="Pay what you can"
                size="lg"
                variant="outline"
              />
            ) : (
              <Button asChild size="lg" variant="outline">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            )
          ) : (
            <Button asChild size="lg" variant="outline">
              <Link href="/sign-up">Create a free account</Link>
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
