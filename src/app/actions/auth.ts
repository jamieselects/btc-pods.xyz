"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { captureServerEvent, distinctUserId } from "@/lib/posthog";

const credentialsSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }).trim(),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters." }),
});

const signUpSchema = credentialsSchema;
const passwordResetRequestSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }).trim(),
});
const passwordResetSchema = z
  .object({
    password: z
      .string()
      .min(8, { error: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type AuthFormState = {
  errors?: {
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
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
  await captureServerEvent({
    distinctId: validated.data.email.toLowerCase(),
    event: "auth_started",
    properties: {
      method: "password",
      flow: "sign_up",
    },
  });
  const { error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback`,
    },
  });

  if (error) {
    await captureServerEvent({
      distinctId: validated.data.email.toLowerCase(),
      event: "auth_failed",
      properties: {
        method: "password",
        flow: "sign_up",
        reason: error.message,
      },
    });
    return { errors: { form: [error.message] } };
  }

  // Supabase projects with email confirmation enabled won't create a session
  // here — the user needs to click the magic link. Surface that as a message.
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    await captureServerEvent({
      distinctId: validated.data.email.toLowerCase(),
      event: "auth_succeeded",
      properties: {
        method: "password",
        flow: "sign_up_pending_email_confirmation",
      },
    });
    return {
      message:
        "Check your inbox — we sent a confirmation link to finish signing you up.",
    };
  }

  const user = sessionData.session.user;
  await captureServerEvent({
    distinctId: distinctUserId(user.id),
    event: "auth_succeeded",
    properties: {
      method: "password",
      flow: "sign_up",
    },
  });
  await captureServerEvent({
    distinctId: distinctUserId(user.id),
    event: "user_signed_up",
    properties: {
      $insert_id: `signup_complete_${user.id}`,
      signup_source: "password_immediate",
    },
  });

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
  await captureServerEvent({
    distinctId: validated.data.email.toLowerCase(),
    event: "auth_started",
    properties: {
      method: "password",
      flow: "sign_in",
    },
  });
  const { error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  });

  if (error) {
    await captureServerEvent({
      distinctId: validated.data.email.toLowerCase(),
      event: "auth_failed",
      properties: {
        method: "password",
        flow: "sign_in",
        reason: "invalid_credentials",
      },
    });
    return { errors: { form: ["Invalid email or password."] } };
  }

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (user) {
    await captureServerEvent({
      distinctId: distinctUserId(user.id),
      event: "auth_succeeded",
      properties: {
        method: "password",
        flow: "sign_in",
      },
    });
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/** Start Google OAuth flow via Supabase. */
export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = await requestOrigin();
  await captureServerEvent({
    distinctId: "oauth_google",
    event: "auth_started",
    properties: {
      method: "google",
      flow: "sign_in_or_sign_up",
    },
  });
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/api/auth/callback`,
    },
  });

  if (error || !data?.url) {
    await captureServerEvent({
      distinctId: "oauth_google",
      event: "auth_failed",
      properties: {
        method: "google",
        flow: "oauth_start",
        reason: error?.message ?? "missing_oauth_url",
      },
    });
    redirect("/sign-in?error=Could not start Google sign in. Please try again.");
  }

  redirect(data.url);
}

/** Sign the current user out. Safe to call unauthenticated. */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

/** Trigger Supabase's password recovery email flow. */
export async function requestPasswordReset(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const validated = passwordResetRequestSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const origin = await requestOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(
    validated.data.email,
    {
      redirectTo: `${origin}/api/auth/callback?next=/reset-password`,
    },
  );

  if (error) {
    return {
      errors: {
        form: ["Could not send reset link right now. Please try again."],
      },
    };
  }

  return {
    message:
      "If an account exists for that email, a password reset link is on the way.",
  };
}

/** Update the current authenticated user's password after recovery. */
export async function updatePassword(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const validated = passwordResetSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return {
      errors: {
        form: ["Reset link is invalid or expired. Request a new one."],
      },
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: validated.data.password,
  });

  if (error) {
    return {
      errors: {
        form: [error.message],
      },
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
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
