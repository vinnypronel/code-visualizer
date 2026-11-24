"use client";

/*
 * Fetches a live Gemini explanation for the current step from /api/explain.
 * Grounded in the exact step state (never student data). Caches per step within
 * the session so stepping back does not re-call. Returns null while the call is
 * in flight and on any failure, and the caller shows its scripted fallback
 * text, so the lesson never breaks on a slow or failed call.
 *
 * The per-step cache is React state, and the current explanation is read from
 * it during render rather than pushed in from inside the effect. That keeps one
 * step change to a single render pass instead of a cascade.
 */

import { useEffect, useState } from "react";
import { extractStepContext } from "@/lib/tutorContext";
import { STUDY_LESSON_IDS } from "@/lib/studyConfig";
import type { Preset } from "@/types/visualizer";

export interface LiveExplanation {
  explanation: string;
  whyItMatters: string;
}

export function useLiveExplanation(
  preset: Preset,
  stepIndex: number,
  enabled: boolean,
): { live: LiveExplanation | null } {
  const [cache, setCache] = useState<Map<string, LiveExplanation>>(() => new Map());

  const active = enabled && STUDY_LESSON_IDS.includes(preset.id);
  const key = active ? `${preset.id}:${stepIndex}` : null;

  useEffect(() => {
    if (!key || cache.has(key)) return;

    const context = extractStepContext(preset, stepIndex);
    if (!context) return;

    let cancelled = false;
    fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: LiveExplanation) => {
        if (cancelled) return;
        if (typeof data?.explanation === "string" && typeof data?.whyItMatters === "string") {
          setCache((prev) => new Map(prev).set(key, data));
        }
      })
      .catch(() => {
        /* keep scripted fallback */
      });

    return () => {
      cancelled = true;
    };
  }, [key, preset, stepIndex, cache]);

  const live = key ? cache.get(key) ?? null : null;

  return { live };
}
