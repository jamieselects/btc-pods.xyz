import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser } from "@/lib/dal";

export const metadata = { title: "Create account" };

export default async function SignUpPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 text-card-foreground">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Free forever. Summaries delivered straight to your inbox.
          </p>
        </div>
        <AuthForm mode="sign-up" />
      </div>
    </main>
  );
}
