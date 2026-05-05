import { Fragment, type ReactNode } from "react";
import { cleanSectionBody } from "@/lib/summarySectionFormat";

export type SummarySectionKind = "key" | "market" | "action";

function inlineBold(line: string): ReactNode[] {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const m = part.match(/^\*\*([^*]+)\*\*$/);
    if (m) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {m[1]}
        </strong>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

function isDashBulletLine(line: string): boolean {
  return /^[-*]\s+/.test(line.trim());
}

function stripDashBullet(line: string): string {
  return line.trim().replace(/^[-*]\s+/, "");
}

function isNumberedLine(line: string): boolean {
  return /^\d+\.\s+/.test(line.trim());
}

function stripNumberPrefix(line: string): string {
  return line.trim().replace(/^\d+\.\s+/, "");
}

function renderFormattedBody(cleaned: string) {
  const lines = cleaned.split("\n");
  const nodes: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    if (!lines[i].trim()) {
      i++;
      continue;
    }

    if (isDashBulletLine(lines[i])) {
      const items: string[] = [];
      while (i < lines.length && isDashBulletLine(lines[i])) {
        items.push(stripDashBullet(lines[i]));
        i++;
      }
      nodes.push(
        <ul
          key={key++}
          className="list-disc space-y-2 pl-5 text-foreground/90 marker:text-muted-foreground"
        >
          {items.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {inlineBold(item)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (isNumberedLine(lines[i])) {
      const items: string[] = [];
      while (i < lines.length && isNumberedLine(lines[i])) {
        items.push(stripNumberPrefix(lines[i]));
        i++;
      }
      nodes.push(
        <ol
          key={key++}
          className="list-decimal space-y-2 pl-5 text-foreground/90 marker:text-muted-foreground"
        >
          {items.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {inlineBold(item)}
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !isDashBulletLine(lines[i]) &&
      !isNumberedLine(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    const text = para.join("\n");
    nodes.push(
      <p key={key++} className="leading-relaxed text-foreground/90">
        {inlineBold(text)}
      </p>,
    );
  }

  return <div className="flex flex-col gap-3">{nodes}</div>;
}

export function SummarySectionWeb({
  title,
  text,
  kind,
}: {
  title: string;
  text: string | null;
  kind: SummarySectionKind;
}) {
  if (!text?.trim()) return null;
  const cleaned = cleanSectionBody(text, kind);
  if (!cleaned.trim()) return null;
  return (
    <section>
      <h2 className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">
        {title}
      </h2>
      {renderFormattedBody(cleaned)}
    </section>
  );
}
