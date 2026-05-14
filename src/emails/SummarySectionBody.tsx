import { Fragment } from "react";
import { Text } from "@react-email/components";

const C = {
  ink: "#ededed",
  ink2: "#c8c6bf",
  accent: "#F7931A",
} as const;

const lineStyle = {
  color: C.ink2,
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 14px",
} as const;

/**
 * If a line starts with `**phrase**` (or `**phrase**:`), treat it as the lead —
 * rendered bold in ink color. The remainder is rendered in ink-2. Lines without
 * a bold lead are rendered entirely in ink-2.
 */
function parseLine(line: string): { lead: string | null; body: string } {
  const m = line.match(/^\*\*([^*]+)\*\*[:\s]*([\s\S]*)/);
  if (m) return { lead: m[1], body: m[2].trim() };
  return { lead: null, body: line };
}

/**
 * Renders each non-empty line as a list item with an em-dash marker.
 * Bold leads (via `**phrase**`) are extracted and shown in ink; body text in ink-2.
 */
export function SummarySectionBody({ text }: { text: string }) {
  const lines = text
    .replace(/\r\n/g, "\n")
    .trimEnd()
    .split("\n")
    .filter((l) => l.trim().length > 0);

  if (lines.length === 0) return null;

  return (
    <>
      {lines.map((line, idx) => {
        const { lead, body } = parseLine(line);
        return (
          <Text key={idx} style={{ ...lineStyle, marginTop: 0 }}>
            <span style={{ color: C.accent, fontWeight: 500 }}>— </span>
            {lead ? (
              <>
                <strong style={{ color: C.ink, fontWeight: 600 }}>{lead}</strong>
                {body ? (
                  <Fragment>
                    {". "}
                    <span style={{ color: C.ink2 }}>{body}</span>
                  </Fragment>
                ) : null}
              </>
            ) : (
              <span style={{ color: C.ink2 }}>{line}</span>
            )}
          </Text>
        );
      })}
    </>
  );
}
