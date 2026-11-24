"use client";

/*
 * Fixed notice shown on every screen while demo mode is on, so a local
 * walkthrough can never be mistaken for a real participant session. Renders
 * nothing when the flag is off, and the flag is ignored in production.
 */

import { DEMO_MODE } from "@/lib/demoMode";

export default function DemoModeBanner() {
  if (!DEMO_MODE) return null;

  return (
    <div
      role="status"
      className="fixed top-0 left-0 right-0 text-center font-medium"
      style={{
        zIndex: 2147483100,
        background: "#1e3a8a",
        color: "#ffffff",
        fontSize: "12px",
        padding: "4px 12px",
        letterSpacing: "0.01em",
      }}
    >
      Demo mode: nothing you do here is saved, and no participant ID is used.
    </div>
  );
}
