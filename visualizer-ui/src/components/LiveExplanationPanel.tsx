"use client";

/*
 * Wraps AiExplanationPanel with a live Gemini explanation for the current step.
 * Shows the scripted text instantly, swaps in the live explanation when it
 * arrives, and keeps the scripted text if the call is slow or fails. The Gemini
 * label only lights up once real live text is showing.
 */

import AiExplanationPanel from "@/components/AiExplanationPanel";
import { useLiveExplanation } from "@/lib/useLiveExplanation";
import type { BananaDiagram, Preset } from "@/types/visualizer";

interface LiveExplanationPanelProps {
  preset: Preset;
  stepIndex: number;
  enabled: boolean;
  explanation: string;
  whyItMatters: string;
  diagram: BananaDiagram;
  currentStep: number;
  totalSteps: number;
  showResult: boolean;
  readyPrompt: string;
}

export default function LiveExplanationPanel({
  preset,
  stepIndex,
  enabled,
  explanation,
  whyItMatters,
  diagram,
  currentStep,
  totalSteps,
  showResult,
  readyPrompt,
}: LiveExplanationPanelProps) {
  const { live } = useLiveExplanation(preset, stepIndex, enabled);

  return (
    <AiExplanationPanel
      explanation={live?.explanation ?? explanation}
      whyItMatters={live?.whyItMatters ?? whyItMatters}
      isAiGenerated={Boolean(live)}
      diagram={diagram}
      currentStep={currentStep}
      totalSteps={totalSteps}
      showResult={showResult}
      readyPrompt={readyPrompt}
    />
  );
}
