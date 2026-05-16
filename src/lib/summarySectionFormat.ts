/**
 * Normalise model-produced summary section text: strip duplicate headings
 * that mirror the UI/email section titles, and stray markdown section markers.
 * Used when parsing API output and when rendering stored summaries.
 */

/** `## 4. SECTION` and `4. ## SECTION` both appear from models; allow either order. */
const MD_NUM_HEAD =
  "(?:(?:#{1,6}\\s*)?(?:\\d+\\.\\s*)?|(?:\\d+\\.\\s*)?(?:#{1,6}\\s*)?)";

function stripMarkdownBold(s: string): string {
  let prev: string;
  let out = s;
  do {
    prev = out;
    out = out.replace(/\*\*([^*]+)\*\*/g, "$1");
  } while (out !== prev);
  return out.replace(/\*\*/g, "");
}

/**
 * Remove unmatched `**` markers while preserving valid bold pairs.
 * Models occasionally emit an orphan trailing marker (e.g. `topic**:`).
 */
function stripOrphanBoldMarkers(s: string): string {
  return s
    .split("\n")
    .map((line) => {
      let out = line;
      while (true) {
        const markers = [...out.matchAll(/\*\*/g)];
        if (markers.length % 2 === 0) break;
        const lastIdx = markers.at(-1)?.index;
        if (lastIdx === undefined) break;
        out = `${out.slice(0, lastIdx)}${out.slice(lastIdx + 2)}`;
      }
      return out;
    })
    .join("\n");
}

/**
 * Models sometimes emit mixed bullet prefixes like `— - ` or `• * `.
 * Canonicalize any bullet-prefixed line to `- ` so web/email renderers can
 * parse it consistently.
 */
function normalizeBulletPrefix(line: string): string {
  const trimmed = line.trimStart();
  if (!trimmed) return line;
  const hasBulletPrefix = /^(?:[—–•]|[-*])\s+/.test(trimmed);
  if (!hasBulletPrefix) return line;
  const body = trimmed.replace(/^(?:(?:[—–•]|[-*])\s*)+/, "").trimStart();
  return body ? `- ${body}` : "";
}

/** Lines that are only a section title (no body on that line). */
function isStandaloneSectionHeaderLine(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  if (/^\s*#{1,6}\s*\d*\.?\s*$/.test(t)) return true;
  const headOnly = new RegExp(
    `^${MD_NUM_HEAD}(key topics|market\\s*(?:&|and)?\\s*price\\s*signals?|actionable insights?|(?:(?:episode\\s+)?sponsor(?:s|ships)?))\\b\\s*$`,
    "i",
  );
  if (headOnly.test(t)) return true;
  const headDash = new RegExp(
    `^${MD_NUM_HEAD}(key topics|market\\s*(?:&|and)?\\s*price\\s*signals?|actionable insights?|(?:(?:episode\\s+)?sponsor(?:s|ships)?))\\b\\s*[-—–:.]\\s*$`,
    "i",
  );
  if (headDash.test(t)) return true;
  return false;
}

export type SectionKind = "key" | "market" | "action" | "sponsor";

const SECTION_PREFIX: Record<SectionKind, RegExp> = {
  key: new RegExp(`^${MD_NUM_HEAD}key topics\\b[ \\t]*[—–:\\-]?[ \\t]*`, "i"),
  market: new RegExp(
    `^${MD_NUM_HEAD}market\\s*(?:&|and)?\\s*price\\s*signals?\\b[ \\t]*[—–:\\-]?[ \\t]*`,
    "i",
  ),
  action: new RegExp(
    `^${MD_NUM_HEAD}actionable insights?\\b[ \\t]*[—–:\\-]?[ \\t]*`,
    "i",
  ),
  sponsor: new RegExp(
    `^${MD_NUM_HEAD}(?:episode\\s+)?sponsor(?:s|ships)?\\b[ \\t]*[—–:\\-]?[ \\t]*`,
    "i",
  ),
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
  s = s
    .split("\n")
    .map((line) => normalizeBulletPrefix(line))
    .join("\n")
    .trim();
  s = stripOrphanBoldMarkers(s);
  s = s.replace(/\n{3,}/g, "\n\n");
  if (kind === "sponsor") {
    s = stripMarkdownBold(s);
  }
  return s;
}
