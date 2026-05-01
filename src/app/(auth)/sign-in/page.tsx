import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser } from "@/lib/dal";

export const metadata = { title: "Sign in" };

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function SignInPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const { error } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 text-card-foreground">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back. Pick up where you left off.
          </p>
        </div>

        {error ? (
          <p className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        ) : null}

        <AuthForm mode="sign-in" />
      </div>
    </main>
  );
}
