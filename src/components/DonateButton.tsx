"use client";

import { Button } from "@/components/ui/button";

/**
 * Donation entry point. Phase 3 will open a modal with sat amount presets,
 * call POST /api/donate/create-invoice, and render a Lightning QR code.
 */
export function DonateButton() {
  return (
    <Button
      variant="outline"
      onClick={() => {
        alert("Donations ship in phase 3 — Strike business approval pending.");
      }}
    >
      Donate sats
    </Button>
  );
}
