import { Fragment } from "react";
import { Link, Text } from "@react-email/components";
import { tokenizeSponsorshipLine } from "@/lib/sponsorshipText";

const C = {
  ink: "#ededed",
  ink2: "#c8c6bf",
  ink4: "#6e6e68",
  accent: "#F7931A",
} as const;

const lineStyle = {
  color: C.ink2,
  fontSize: "14.5px",
  lineHeight: "1.65",
  margin: "0 0 10px",
} as const;

export function SponsorshipEmailLines({ text }: { text: string }) {
  const lines = text.trim().split("\n").filter((l) => l.trim().length > 0);
  return (
    <>
      {lines.map((line, lineIdx) => (
        <Text key={lineIdx} style={lineStyle}>
          <span style={{ color: C.accent, fontWeight: 500 }}>— </span>
          {tokenizeSponsorshipLine(line).map((seg, i) =>
            seg.kind === "text" ? (
              <Fragment key={i}>{seg.value}</Fragment>
            ) : (
              <Link
                key={i}
                href={seg.href}
                style={{
                  color: C.ink,
                  textDecoration: "underline",
                  textDecorationColor: C.accent,
                  fontWeight: 500,
                }}
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
