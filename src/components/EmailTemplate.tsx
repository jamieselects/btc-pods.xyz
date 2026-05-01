/**
 * Server-side helper around the React Email template. Used by sendDigest
 * to render `EpisodeSummary` to HTML/text before passing to Resend.
 *
 * This is a thin re-export so callers don't have to know where the template
 * lives. Phase 2 implements `renderEpisodeSummaryEmail`.
 */
export { EpisodeSummary } from "@/emails/EpisodeSummary";
