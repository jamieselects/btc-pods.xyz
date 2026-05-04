export type SponsorshipSegment =
  | { kind: "text"; value: string }
  | { kind: "link"; href: string; label: string };

/**
 * Turn a line of sponsorship copy into text + markdown links + bare URLs.
 * Used by the episode page and the digest email so offers stay clickable.
 */
export function tokenizeSponsorshipLine(line: string): SponsorshipSegment[] {
  const re =
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|(https?:\/\/[^\s)\]<]+)/g;
  const out: SponsorshipSegment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) {
      out.push({ kind: "text", value: line.slice(last, m.index) });
    }
    if (m[1] !== undefined && m[2] !== undefined) {
      out.push({ kind: "link", href: m[2], label: m[1] });
    } else if (m[3]) {
      out.push({ kind: "link", href: m[3], label: m[3] });
    }
    last = re.lastIndex;
  }
  if (last < line.length) {
    out.push({ kind: "text", value: line.slice(last) });
  }
  if (out.length === 0) {
    out.push({ kind: "text", value: line });
  }
  return out;
}
