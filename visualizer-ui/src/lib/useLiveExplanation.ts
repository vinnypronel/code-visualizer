"use client";

/*
 * Fetches a live Gemini explanation for the current step from /api/explain.
 * Grounded in the exact step state (never student data). Caches per step within
 * the session so stepping back does not re-call. On loading or any failure it
 * returns null, and the caller shows its scripted fallback text, so the lesson
 * never breaks on a slow or failed call.
 */

import { useEffect, useRef, useState } from "react";
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
): { live: LiveExplanation | null; loading: boolean } {
  const cacheRef = useRef<Map<string, LiveExplanation>>(new Map());
  const [live, setLive] = useState<LiveExplanation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !STUDY_LESSON_IDS.includes(preset.id)) {
      setLive(null);
      return;
    }

    const key = `${preset.id}:${stepIndex}`;
    const cached = cacheRef.current.get(key);
    if (cached) {
      setLive(cached);
      return;
    }

    const context = extractStepContext(preset, stepIndex);
    if (!context) {
      setLive(null);
      return;
    }

    let cancelled = false;
    setLive(null);
    setLoading(true);
    fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: LiveExplanation) => {
        if (cancelled) return;
        if (typeof data?.explanation === "string" && typeof data?.whyItMatters === "string") {
          cacheRef.current.set(key, data);
          setLive(data);
        }
      })
      .catch(() => {
        /* keep scripted fallback */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [preset, stepIndex, enabled]);

  return { live, loading };
}
