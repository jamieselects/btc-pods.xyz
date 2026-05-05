"use client";

import { useCallback, useId, useState } from "react";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type Props = {
  transcript: string | null | undefined;
  episodeTitle: string;
};

export function TranscriptPanel({ transcript, episodeTitle }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelId = useId();
  const trimmed = transcript?.trim() ?? "";

  const copy = useCallback(async () => {
    if (!trimmed) return;
    try {
      await navigator.clipboard.writeText(trimmed);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [trimmed]);

  const printTranscript = useCallback(() => {
    if (!trimmed) return;
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) return;
    const safeTitle = escapeHtml(episodeTitle);
    const body = escapeHtml(trimmed);
    w.document.write(
      `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>${safeTitle} — Transcript</title>` +
        `<style>@page{margin:16mm}body{font-family:ui-sans-serif,system-ui,sans-serif;padding:24px;max-width:40rem;margin:0 auto;color:#111}` +
        `h1{font-size:1.1rem;margin:0 0 1rem;font-weight:600}pre{white-space:pre-wrap;word-break:break-word;font-size:10.5pt;line-height:1.5;margin:0}</style></head>` +
        `<body><h1>${safeTitle}</h1><pre>${body}</pre></body></html>`,
    );
    w.document.close();
    w.focus();
    w.print();
  }, [episodeTitle, trimmed]);

  if (!trimmed) return null;

  return (
    <section className="mt-8 border-t border-border pt-8">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg border border-border bg-card px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
      >
        {open ? "Hide transcript" : "Show transcript"}
      </button>

      {open ? (
        <div
          id={panelId}
          className="mt-4 flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
        >
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copy}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              {copied ? "Copied" : "Copy transcript"}
            </button>
            <button
              type="button"
              onClick={printTranscript}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Print / save as PDF
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Use your browser’s print dialog and choose “Save as PDF” to download
            a copy.
          </p>
          <pre className="max-h-[min(28rem,55vh)] overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-muted/30 p-3 font-sans text-sm leading-relaxed text-foreground/90">
            {trimmed}
          </pre>
        </div>
      ) : null}
    </section>
  );
}
