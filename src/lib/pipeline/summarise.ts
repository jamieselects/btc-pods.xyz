import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";
import { cleanSectionBody } from "@/lib/summarySectionFormat";

export const SUMMARISE_MODEL = "claude-haiku-4-5";

export const SYSTEM_PROMPT =
  "You are a Bitcoin-focused analyst. You write concise, accurate summaries for members of the Bitcoin community. Avoid hype and speculation. Stick to what was actually said. Faithfully capture sponsor or advertiser segments in the dedicated EPISODE SPONSORSHIPS section so audiences can find the products and URLs mentioned on the show.";

/** Build the user message per spec §4.3. */
export function buildUserPrompt(transcript: string): string {
  return [
    "Summarise the following podcast transcript in four clearly labelled sections:",
    "",
    "1. KEY TOPICS — 4–6 bullet points on the main subjects discussed.",
    "2. MARKET & PRICE SIGNALS — Any price discussion, on-chain data, or macro context mentioned. If none, write 'None discussed'.",
    "3. ACTIONABLE INSIGHTS — 2–3 concrete takeaways for a Bitcoin holder or investor.",
    "4. EPISODE SPONSORSHIPS — Every distinct sponsor or advertiser read in the episode (mid-roll, pre-roll, host-read ad spots, 'brought to you by', discount codes, etc.). For each: sponsor or product name, one short line on what they offer, and include a markdown link to the specific landing page or offer URL if the host gives one (format: [Product or offer](https://example.com/path)). If a URL is spoken but incomplete, omit the link and note 'URL not given in full'. If there were no sponsor segments, write exactly: No sponsorships in this episode. Start this section with the exact heading line: 4. EPISODE SPONSORSHIPS (so it can be parsed reliably).",
    "",
    "Formatting for sections 1–3 only: plain text suitable for email. Do not use markdown headings (no # or ##), horizontal rules, or numbered section titles in the body — the email template already provides section titles. Do not repeat labels like KEY TOPICS inside the body. Use a hyphen and space at the start of each bullet, one bullet per line. You may emphasise short phrases with **double asterisks** if needed.",
    "",
    "Keep sections 1–3 together under 400 words; section 4 may add up to ~150 words so sponsors are represented accurately. Be direct.",
    "",
    "TRANSCRIPT:",
    transcript,
  ].join("\n");
}

export type Summary = {
  keyTopics: string;
  marketSignals: string;
  actionableInsights: string;
  sponsorships: string;
  fullSummaryMd: string;
  inputTokens: number;
  outputTokens: number;
  modelUsed: string;
};

/**
 * Call Claude Haiku, parse the four structured sections out of the response.
 * Phase 2 wires this into the cron flow.
 */
export async function summarise(transcript: string): Promise<Summary> {
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: SUMMARISE_MODEL,
    max_tokens: 1536,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(transcript) }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  const sections = parseSections(text);

  return {
    keyTopics: sections.keyTopics,
    marketSignals: sections.marketSignals,
    actionableInsights: sections.actionableInsights,
    sponsorships: sections.sponsorships,
    fullSummaryMd: text,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    modelUsed: SUMMARISE_MODEL,
  };
}

export { cleanSectionBody, type SectionKind } from "@/lib/summarySectionFormat";

/** First line-start match so words like “market” inside bullets don’t split sections. */
function sectionLineIndex(raw: string, re: RegExp): number {
  const m = re.exec(raw);
  return m ? m.index : -1;
}

const RE_KEY = /(?:^|\n)(\s*(?:#{1,6}\s*)?(?:\d+\.\s*)?key topics\b)/i;
const RE_MARKET =
  /(?:^|\n)(\s*(?:#{1,6}\s*)?(?:\d+\.\s*)?market\s*(?:&|and)?\s*price\s*signals?\b)/i;
const RE_ACTION =
  /(?:^|\n)(\s*(?:#{1,6}\s*)?(?:\d+\.\s*)?actionable insights?\b)/i;
/** Match prompt label plus shortenings (e.g. "Sponsors", "Sponsor", "Sponsorships"). */
const RE_SPONSOR =
  /(?:^|\n)(\s*(?:#{1,6}\s*)?(?:\d+\.\s*)?(?:episode\s+)?sponsor(?:s|ships)?\b)/i;

/** Split the model output into the 4 labelled sections. Tolerates minor format drift. */
export function parseSections(raw: string) {
  const keyIdx = sectionLineIndex(raw, RE_KEY);
  const marketIdx = sectionLineIndex(raw, RE_MARKET);
  const actionIdx = sectionLineIndex(raw, RE_ACTION);
  const sponsorIdx = sectionLineIndex(raw, RE_SPONSOR);

  const slice = (start: number, end: number) =>
    start === -1 ? "" : raw.slice(start, end === -1 ? undefined : end).trim();

  const sponsorOk =
    sponsorIdx !== -1 &&
    actionIdx !== -1 &&
    sponsorIdx > actionIdx;

  return {
    keyTopics: cleanSectionBody(slice(keyIdx, marketIdx), "key"),
    marketSignals: cleanSectionBody(slice(marketIdx, actionIdx), "market"),
    actionableInsights: cleanSectionBody(
      sponsorOk ? slice(actionIdx, sponsorIdx) : slice(actionIdx, -1),
      "action",
    ),
    sponsorships: sponsorOk
      ? cleanSectionBody(slice(sponsorIdx, -1), "sponsor")
      : "",
  };
}
