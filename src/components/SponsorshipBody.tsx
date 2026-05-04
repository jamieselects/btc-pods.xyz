import { tokenizeSponsorshipLine } from "@/lib/sponsorshipText";

function lineToNodes(line: string, key: number) {
  const parts = tokenizeSponsorshipLine(line);
  return (
    <span key={key}>
      {parts.map((seg, i) =>
        seg.kind === "text" ? (
          <span key={i}>{seg.value}</span>
        ) : (
          <a
            key={i}
            href={seg.href}
            className="text-primary underline underline-offset-2 hover:text-primary/90"
            rel="noopener noreferrer"
            target="_blank"
          >
            {seg.label}
          </a>
        ),
      )}
    </span>
  );
}

/** Renders sponsorship copy with markdown links and bare URLs as anchors. */
export function SponsorshipBody({ text }: { text: string }) {
  const lines = text.trim().split("\n");
  return (
    <div className="space-y-2 whitespace-pre-line text-foreground/90">
      {lines.map((line, idx) => (
        <p key={idx} className="leading-relaxed">
          {lineToNodes(line, idx)}
        </p>
      ))}
    </div>
  );
}
