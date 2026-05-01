"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const credentialsSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }).trim(),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters." }),
});

const signUpSchema = credentialsSchema;

export type AuthFormState = {
  errors?: {
    email?: string[];
    password?: string[];
    form?: string[];
  };
  message?: string;
} | null;

/** Create a new account + sign the user in. */
export async function signUp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const validated = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const origin = await requestOrigin();
  const { error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback`,
    },
  });

  if (error) {
    return { errors: { form: [error.message] } };
  }

  // Supabase projects with email confirmation enabled won't create a session
  // here — the user needs to click the magic link. Surface that as a message.
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    return {
      message:
        "Check your inbox — we sent a confirmation link to finish signing you up.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/** Sign an existing user in with email + password. */
export async function signIn(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const validated = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  });

  if (error) {
    return { errors: { form: ["Invalid email or password."] } };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/** Sign the current user out. Safe to call unauthenticated. */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Best-effort reconstruction of the request origin for building absolute
 * redirect URLs (e.g. the Supabase email confirmation link). Falls back to
 * localhost for dev so this never throws.
 */
async function requestOrigin(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) return `${proto}://${host}`;
  return "http://localhost:3000";
}
