import { z } from "zod";

/**
 * Runtime-validated env vars. Server-only secrets must NEVER be referenced
 * from client components — use only the NEXT_PUBLIC_* values there.
 *
 * In phase 1 most of these are optional so the project can build without
 * real keys. Phase 2/3 features will fail closed at call sites that need them.
 */
const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  OPENAI_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),

  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_NAME: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),

  STRIKE_API_KEY: z.string().min(1).optional(),
  STRIKE_WEBHOOK_SECRET: z.string().min(1).optional(),

  NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_FORCE_GOOGLE_AUTH: z
    .enum(["true", "false"])
    .optional(),

  APP_BASE_URL: z.string().url().optional(),

  CRON_SECRET: z.string().min(8).default("dev-cron-secret-change-me"),
});

/**
 * Dotenv leaves `KEY=` as an empty string. Zod's `.optional()` only treats
 * `undefined` as absent — `""` still runs `.min(1)` / `.email()` / `.url()`
 * and fails. Strip empty/whitespace-only values so optional secrets can be
 * declared as placeholders in `.env.local`.
 */
function stripEmptyEnvVars(
  input: NodeJS.ProcessEnv,
): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = { ...input };
  for (const key of Object.keys(out)) {
    const v = out[key];
    if (typeof v === "string" && v.trim() === "") delete out[key];
  }
  return out;
}

const parsed = serverSchema.safeParse(stripEmptyEnvVars(process.env));

if (!parsed.success) {
  console.error(
    "[env] invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("Invalid environment variables — see logs above.");
}

export const env = parsed.data;

/** Narrow helper: true if the given key is present and non-empty. */
export function hasEnv<K extends keyof typeof env>(key: K) {
  const v = env[key];
  return typeof v === "string" && v.length > 0;
}
