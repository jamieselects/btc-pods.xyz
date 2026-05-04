import { Fragment } from "react";
import { Link, Text } from "@react-email/components";
import { tokenizeSponsorshipLine } from "@/lib/sponsorshipText";

const lineStyle = {
  color: "#ededed",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 8px",
} as const;

export function SponsorshipEmailLines({ text }: { text: string }) {
  const lines = text.trim().split("\n");
  return (
    <>
      {lines.map((line, lineIdx) => (
        <Text key={lineIdx} style={lineStyle}>
          {tokenizeSponsorshipLine(line).map((seg, i) =>
            seg.kind === "text" ? (
              <Fragment key={i}>{seg.value}</Fragment>
            ) : (
              <Link
                key={i}
                href={seg.href}
                style={{ color: "#F7931A", textDecoration: "underline" }}
              >
                {seg.label}
              </Link>
            ),
          )}
        </Text>
      ))}
    </>
  );
}
