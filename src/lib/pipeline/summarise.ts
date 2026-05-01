import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";

export const SUMMARISE_MODEL = "claude-haiku-4-5";

export const SYSTEM_PROMPT =
  "You are a Bitcoin-focused analyst. You write concise, accurate summaries for members of the Bitcoin community. Avoid hype and speculation. Stick to what was actually said.";

/** Build the user message per spec §4.3. */
export function buildUserPrompt(transcript: string): string {
  return [
    "Summarise the following podcast transcript in three clearly labelled sections:",
    "",
    "1. KEY TOPICS — 4–6 bullet points on the main subjects discussed.",
    "2. MARKET & PRICE SIGNALS — Any price discussion, on-chain data, or macro context mentioned. If none, write 'None discussed'.",
    "3. ACTIONABLE INSIGHTS — 2–3 concrete takeaways for a Bitcoin holder or investor.",
    "",
    "Keep the total response under 400 words. Be direct.",
    "",
    "TRANSCRIPT:",
    transcript,
  ].join("\n");
}

export type Summary = {
  keyTopics: string;
  marketSignals: string;
  actionableInsights: string;
  fullSummaryMd: string;
  inputTokens: number;
  outputTokens: number;
  modelUsed: string;
};

/**
 * Call Claude Haiku, parse the three structured sections out of the response.
 * Phase 2 wires this into the cron flow.
 */
export async function summarise(transcript: string): Promise<Summary> {
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: SUMMARISE_MODEL,
    max_tokens: 1024,
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
    fullSummaryMd: text,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    modelUsed: SUMMARISE_MODEL,
  };
}

/** Split the model output into the 3 labelled sections. Tolerates minor format drift. */
export function parseSections(raw: string) {
  const lower = raw.toLowerCase();
  const keyIdx = lower.search(/key topics/);
  const marketIdx = lower.search(/market.*signals?/);
  const actionIdx = lower.search(/actionable insights?/);

  const slice = (start: number, end: number) =>
    start === -1 ? "" : raw.slice(start, end === -1 ? undefined : end).trim();

  return {
    keyTopics: slice(keyIdx, marketIdx),
    marketSignals: slice(marketIdx, actionIdx),
    actionableInsights: slice(actionIdx, -1),
  };
}
