import { Fragment, type ReactNode } from "react";
import { Text } from "@react-email/components";

const lineStyle = {
  color: "#ededed",
  fontSize: "14px",
  lineHeight: "1.65",
  margin: "0 0 6px",
} as const;

/** Turn `**phrase**` into `<strong>` for HTML email; plain-text render drops the asterisks. */
function inlineWithBold(line: string): ReactNode[] {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const m = part.match(/^\*\*([^*]+)\*\*$/);
    if (m) {
      return (
        <strong key={i} style={{ color: "#ededed", fontWeight: 600 }}>
          {m[1]}
        </strong>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

/**
 * One `<Text>` per line so clients that ignore `white-space: pre-line` still show breaks
 * (e.g. Spark when preferring a text/heuristic layout).
 */
export function SummarySectionBody({ text }: { text: string }) {
  const normalized = text.replace(/\r\n/g, "\n").trimEnd();
  const lines = normalized.length > 0 ? normalized.split("\n") : [""];

  return (
    <>
      {lines.map((line, idx) => (
        <Text key={idx} style={{ ...lineStyle, marginTop: idx === 0 ? 0 : 0 }}>
          {inlineWithBold(line)}
        </Text>
      ))}
    </>
  );
}
