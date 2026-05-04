"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dialog } from "radix-ui";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";

type Preset = { label: string; sats: number };
const PRESETS: Preset[] = [
  { label: "1k", sats: 1_000 },
  { label: "5k", sats: 5_000 },
  { label: "21k", sats: 21_000 },
  { label: "100k", sats: 100_000 },
  { label: "1M", sats: 1_000_000 },
];

const POLL_INTERVAL_MS = 3_000;
const SUCCESS_AUTOCLOSE_MS = 4_000;

type Phase =
  | { kind: "idle" }
  | { kind: "creating" }
  | {
      kind: "awaiting_payment";
      donationId: string;
      paymentRequest: string;
      amountSats: number;
      expiresAt: string | null;
    }
  | { kind: "paid"; amountSats: number }
  | { kind: "expired" }
  | { kind: "error"; message: string };

export function DonateButton() {
  const [open, setOpen] = useState(false);
  const [presetSats, setPresetSats] = useState<number>(PRESETS[2].sats);
  const [customSats, setCustomSats] = useState<string>("");
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });

  const amountSats = useMemo(() => {
    const trimmed = customSats.trim();
    if (trimmed) {
      const n = Number(trimmed);
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
    }
    return presetSats;
  }, [customSats, presetSats]);

  const reset = useCallback(() => {
    setPhase({ kind: "idle" });
    setCustomSats("");
    setPresetSats(PRESETS[2].sats);
  }, []);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);
      if (!next) {
        // Defer reset so the close animation doesn't flicker.
        setTimeout(reset, 200);
      }
    },
    [reset],
  );

  const createInvoice = useCallback(async () => {
    if (amountSats < 100) {
      setPhase({
        kind: "error",
        message: "Minimum donation is 100 sats.",
      });
      return;
    }
    setPhase({ kind: "creating" });
    try {
      const res = await fetch("/api/donate/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountSats }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPhase({
          kind: "error",
          message: messageFromError(data) ?? `Strike returned HTTP ${res.status}.`,
        });
        return;
      }
      setPhase({
        kind: "awaiting_payment",
        donationId: data.donationId,
        paymentRequest: data.paymentRequest,
        amountSats: data.amountSats,
        expiresAt: data.expiresAt ?? null,
      });
    } catch (err) {
      setPhase({
        kind: "error",
        message:
          err instanceof Error ? err.message : "Network error talking to Strike.",
      });
    }
  }, [amountSats]);

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <Button variant="outline" size="sm">
          Donate sats
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(440px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
          <Dialog.Title className="font-mono text-xs uppercase tracking-widest text-primary">
            Send sats over Lightning
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">
            Help cover Whisper + Claude costs. Payments settle instantly via
            Strike.
          </Dialog.Description>

          <div className="mt-5">
            {phase.kind === "idle" || phase.kind === "creating" ? (
              <AmountForm
                presets={PRESETS}
                presetSats={presetSats}
                customSats={customSats}
                onPreset={(sats) => {
                  setCustomSats("");
                  setPresetSats(sats);
                }}
                onCustom={setCustomSats}
                amountSats={amountSats}
                onSubmit={createInvoice}
                pending={phase.kind === "creating"}
              />
            ) : null}

            {phase.kind === "awaiting_payment" ? (
              <InvoiceView
                paymentRequest={phase.paymentRequest}
                amountSats={phase.amountSats}
                expiresAt={phase.expiresAt}
                donationId={phase.donationId}
                onPaid={(sats) => setPhase({ kind: "paid", amountSats: sats })}
                onExpired={() => setPhase({ kind: "expired" })}
              />
            ) : null}

            {phase.kind === "paid" ? (
              <PaidView
                amountSats={phase.amountSats}
                onClose={() => handleOpenChange(false)}
              />
            ) : null}

            {phase.kind === "expired" ? (
              <CenteredMessage
                title="Invoice expired"
                description="Lightning quotes expire after a short window. You can generate a fresh one and try again."
                actionLabel="Try again"
                onAction={reset}
              />
            ) : null}

            {phase.kind === "error" ? (
              <CenteredMessage
                title="Something went wrong"
                description={phase.message}
                actionLabel="Try again"
                onAction={reset}
              />
            ) : null}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function AmountForm({
  presets,
  presetSats,
  customSats,
  onPreset,
  onCustom,
  amountSats,
  onSubmit,
  pending,
}: {
  presets: Preset[];
  presetSats: number;
  customSats: string;
  onPreset: (sats: number) => void;
  onCustom: (val: string) => void;
  amountSats: number;
  onSubmit: () => void;
  pending: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => {
          const active = !customSats.trim() && p.sats === presetSats;
          return (
            <button
              key={p.sats}
              type="button"
              onClick={() => onPreset(p.sats)}
              aria-pressed={active}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:border-primary/40"
              }`}
            >
              {p.label} sats
            </button>
          );
        })}
      </div>

      <label className="flex flex-col gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
        Or custom amount (sats)
        <input
          type="number"
          inputMode="numeric"
          min={100}
          max={10_000_000}
          step={1}
          value={customSats}
          onChange={(e) => onCustom(e.target.value)}
          placeholder="e.g. 50000"
          className="h-9 rounded-md border border-border bg-background px-3 font-mono text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </label>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Sending</span>
        <span className="font-mono text-foreground">
          {amountSats.toLocaleString()} sats
        </span>
      </div>

      <Button type="submit" disabled={pending || amountSats < 100}>
        {pending ? "Generating invoice…" : "Generate Lightning invoice"}
      </Button>
    </form>
  );
}

function InvoiceView({
  paymentRequest,
  amountSats,
  expiresAt,
  donationId,
  onPaid,
  onExpired,
}: {
  paymentRequest: string;
  amountSats: number;
  expiresAt: string | null;
  donationId: string;
  onPaid: (sats: number) => void;
  onExpired: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(() =>
    expiresAt ? Math.max(0, Math.floor((Date.parse(expiresAt) - Date.now()) / 1000)) : null,
  );
  const [copied, setCopied] = useState(false);
  const expiredRef = useRef(false);

  // Tick the countdown.
  useEffect(() => {
    if (!expiresAt) return;
    const id = window.setInterval(() => {
      const left = Math.max(
        0,
        Math.floor((Date.parse(expiresAt) - Date.now()) / 1000),
      );
      setSecondsLeft(left);
      if (left === 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpired();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [expiresAt, onExpired]);

  // Poll for paid status.
  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(`/api/donate/status/${donationId}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const { status } = (await res.json()) as { status: string };
        if (cancelled) return;
        if (status === "paid") {
          onPaid(amountSats);
        } else if (status === "expired") {
          if (!expiredRef.current) {
            expiredRef.current = true;
            onExpired();
          }
        }
      } catch {
        // Network blip — next tick will retry.
      }
    };
    const id = window.setInterval(poll, POLL_INTERVAL_MS);
    void poll();
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [donationId, amountSats, onPaid, onExpired]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(paymentRequest);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked — surface a soft message inline.
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <a
        href={`lightning:${paymentRequest}`}
        className="rounded-lg bg-white p-3"
        aria-label="Open in Lightning wallet"
      >
        <QRCodeSVG
          value={paymentRequest}
          size={224}
          level="M"
          marginSize={2}
        />
      </a>

      <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
        <span>{amountSats.toLocaleString()} sats</span>
        {secondsLeft !== null ? (
          <span className="font-mono">
            expires in{" "}
            <span className={secondsLeft < 30 ? "text-destructive" : ""}>
              {formatCountdown(secondsLeft)}
            </span>
          </span>
        ) : null}
      </div>

      <div className="w-full">
        <div className="rounded-md border border-border bg-background/40 p-2 font-mono text-[10px] leading-snug break-all text-muted-foreground">
          {paymentRequest}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCopy}
          className="mt-2 w-full"
        >
          {copied ? "Copied!" : "Copy invoice"}
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Scan with any Lightning wallet (Strike, Wallet of Satoshi, Phoenix,
        Zeus…). This window will update automatically when payment lands.
      </p>
    </div>
  );
}

function PaidView({
  amountSats,
  onClose,
}: {
  amountSats: number;
  onClose: () => void;
}) {
  useEffect(() => {
    const id = window.setTimeout(onClose, SUCCESS_AUTOCLOSE_MS);
    return () => window.clearTimeout(id);
  }, [onClose]);

  return (
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/15 font-mono text-2xl text-primary">
        ✓
      </div>
      <h3 className="text-lg font-semibold">Thanks for stacking with us</h3>
      <p className="text-sm text-muted-foreground">
        Received {amountSats.toLocaleString()} sats. This window will close on
        its own.
      </p>
      <Button variant="ghost" size="sm" onClick={onClose}>
        Close now
      </Button>
    </div>
  );
}

function CenteredMessage({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Button variant="outline" size="sm" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function messageFromError(data: unknown): string | null {
  if (typeof data !== "object" || data === null) return null;
  const e = data as { error?: unknown; detail?: unknown };
  if (typeof e.detail === "string") return e.detail;
  if (typeof e.error === "string") {
    if (e.error === "donations_unavailable") {
      return "Donations are not configured on this server.";
    }
    if (e.error === "strike_failed") {
      return "Strike rejected the invoice. Please try a different amount.";
    }
    return e.error;
  }
  return null;
}
