/*
 * Grounding context for the AI tutor.
 *
 * The visualizer already holds the exact program state for every step as data,
 * so we never screenshot anything: we hand Gemini the ground truth as text.
 * extractStepContext runs on the client to pull the current step's state into a
 * small serializable object; formatContextForPrompt runs on the server so the
 * prompt wording stays controlled and the same for everyone (and is logged).
 */

import type { Preset } from "@/types/visualizer";

export interface TutorStepContext {
  lessonId: string;
  lessonName: string;
  code: string;
  stepNumber: number;
  totalSteps: number;
  currentLine: number | null;
  currentLineText: string | null;
  stack: Array<{
    method: string;
    vars: Array<{ name: string; type: string; value: string; isReference: boolean }>;
  }>;
  heap: Array<{
    id: string;
    className: string;
    arrayValues?: string[];
    fields?: Array<{ name: string; value: string; isReference: boolean }>;
  }>;
  arrows: Array<{ from: string; to: string; label: string }>;
  scriptedExplanation: string;
}

export function extractStepContext(preset: Preset, stepIndex: number): TutorStepContext | null {
  const step = preset.steps[stepIndex];
  if (!step) return null;

  const lines = preset.code.split("\n");
  const currentLineText =
    step.lineHighlight != null ? lines[step.lineHighlight - 1]?.trim() ?? null : null;

  return {
    lessonId: preset.id,
    lessonName: preset.name,
    code: preset.code,
    stepNumber: stepIndex + 1,
    totalSteps: preset.steps.length,
    currentLine: step.lineHighlight,
    currentLineText,
    stack: step.stack.map((frame) => ({
      method: frame.methodName,
      vars: frame.variables.map((v) => ({
        name: v.name,
        type: v.type,
        value: v.value,
        isReference: v.isReference,
      })),
    })),
    heap: Object.values(step.heap).map((obj) => ({
      id: obj.id,
      className: obj.className,
      arrayValues: obj.arrayValues,
      fields: obj.fields?.map((f) => ({
        name: f.name,
        value: f.value,
        isReference: f.isReference,
      })),
    })),
    arrows: step.arrows.map((a) => ({ from: a.source, to: a.target, label: a.label })),
    scriptedExplanation: step.explanation,
  };
}

/* Render the state as the compact text block Gemini is grounded on. */
export function formatContextForPrompt(ctx: TutorStepContext): string {
  const lines: string[] = [];
  lines.push(`Lesson: ${ctx.lessonName} (id: ${ctx.lessonId})`);
  lines.push(`Step ${ctx.stepNumber} of ${ctx.totalSteps}.`);
  lines.push("");
  lines.push("Full program:");
  lines.push(ctx.code);
  lines.push("");
  if (ctx.currentLineText) {
    lines.push(`Current line (line ${ctx.currentLine}): ${ctx.currentLineText}`);
  } else {
    lines.push("Current line: none highlighted yet.");
  }
  lines.push("");

  if (ctx.stack.length) {
    lines.push("Stack (variables in scope):");
    for (const frame of ctx.stack) {
      lines.push(`  ${frame.method}:`);
      for (const v of frame.vars) {
        const kind = v.isReference ? "reference" : "value";
        lines.push(`    ${v.type} ${v.name} = ${v.value} (${kind})`);
      }
    }
  } else {
    lines.push("Stack: empty.");
  }
  lines.push("");

  if (ctx.heap.length) {
    lines.push("Heap (objects):");
    for (const obj of ctx.heap) {
      if (obj.arrayValues) {
        lines.push(`  ${obj.className}@${obj.id} = [${obj.arrayValues.join(", ")}]`);
      } else {
        const fields = (obj.fields ?? [])
          .map((f) => `${f.name}=${f.value}${f.isReference ? " (ref)" : ""}`)
          .join(", ");
        lines.push(`  ${obj.className}@${obj.id} { ${fields} }`);
      }
    }
  } else {
    lines.push("Heap: no objects yet.");
  }
  lines.push("");

  if (ctx.arrows.length) {
    lines.push("Reference arrows (what points to what):");
    for (const a of ctx.arrows) {
      lines.push(`  ${a.label}: ${a.from} -> ${a.to}`);
    }
    lines.push("");
  }

  lines.push(`Scripted note for this step: ${ctx.scriptedExplanation}`);
  return lines.join("\n");
}
