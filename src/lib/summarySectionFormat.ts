/**
 * Normalise model-produced summary section text: strip duplicate headings
 * that mirror the UI/email section titles, and stray markdown section markers.
 * Used when parsing API output and when rendering stored summaries.
 */

/** Lines that are only a section title (no body on that line). */
function isStandaloneSectionHeaderLine(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  if (/^\s*#{1,6}\s*\d*\.?\s*$/.test(t)) return true;
  if (
    /^(?:\d+\.\s*)?(?:#{1,6}\s*)?(key topics|market\s*(?:&|and)?\s*price\s*signals?|actionable insights?|(?:(?:episode\s+)?sponsor(?:s|ships)?))\b\s*$/i.test(
      t,
    )
  ) {
    return true;
  }
  if (
    /^(?:\d+\.\s*)?(?:#{1,6}\s*)?(key topics|market\s*(?:&|and)?\s*price\s*signals?|actionable insights?|(?:(?:episode\s+)?sponsor(?:s|ships)?))\b\s*[-—–:.]\s*$/i.test(
      t,
    )
  ) {
    return true;
  }
  return false;
}

export type SectionKind = "key" | "market" | "action" | "sponsor";

const SECTION_PREFIX: Record<SectionKind, RegExp> = {
  key: /^(?:\d+\.\s*)?(?:#{1,6}\s*)?key topics\b[ \t]*[—–:\-]?[ \t]*/i,
  market:
    /^(?:\d+\.\s*)?(?:#{1,6}\s*)?market\s*(?:&|and)?\s*price\s*signals?\b[ \t]*[—–:\-]?[ \t]*/i,
  action:
    /^(?:\d+\.\s*)?(?:#{1,6}\s*)?actionable insights?\b[ \t]*[—–:\-]?[ \t]*/i,
  sponsor:
    /^(?:\d+\.\s*)?(?:#{1,6}\s*)?(?:episode\s+)?sponsor(?:s|ships)?\b[ \t]*[—–:\-]?[ \t]*/i,
};

/** Remove repeated headings and stray markdown section markers from a parsed slice. */
export function cleanSectionBody(raw: string, kind: SectionKind): string {
  let s = raw.trim().replace(/\r\n/g, "\n");
  for (let i = 0; i < 10; i++) {
    const next = s.replace(SECTION_PREFIX[kind], "").trimStart();
    if (next === s) break;
    s = next;
  }
  s = s
    .split("\n")
    .filter((line) => !isStandaloneSectionHeaderLine(line))
    .join("\n")
    .trim();
  s = s.replace(/\s+#{1,6}\s*\d+\.?\s*$/m, "").trim();
  s = s.replace(/^\s*#{1,6}\s*\d+\.?\s*$/gm, "").trim();
  s = s.replace(/\n{3,}/g, "\n\n");
  return s;
}
