/*
 * Live per-step explanation (AI-vis condition). The client sends the exact
 * program state for the step the student just reached; this builds the grounded
 * prompt, calls Gemini once, and returns { explanation, whyItMatters }.
 *
 * Only the fixed lesson state is sent to Gemini - never the student's id,
 * responses, or anything they typed - so no participant data leaves to a third
 * party. If this errors or is slow, the client keeps the scripted fallback text,
 * so a session never breaks on a failed call.
 */

import { generateExplanation } from "@/lib/geminiServer";
import {
  EXPLANATION_SYSTEM_INSTRUCTION,
  buildExplanationUserPrompt,
} from "@/lib/explanationPrompt";
import type { TutorStepContext } from "@/lib/tutorContext";
import { STUDY_LESSON_IDS } from "@/lib/studyConfig";
import { acceptsJsonBody, isSameOriginMutation, noStoreHeaders } from "@/lib/requestSecurity";

export const dynamic = "force-dynamic";

function contextIsValid(ctx: unknown): ctx is TutorStepContext {
  if (!ctx || typeof ctx !== "object") return false;
  const c = ctx as TutorStepContext;
  return (
    typeof c.lessonId === "string" &&
    STUDY_LESSON_IDS.includes(c.lessonId) &&
    typeof c.code === "string" &&
    c.code.length < 8000 &&
    typeof c.stepNumber === "number" &&
    Array.isArray(c.stack) &&
    Array.isArray(c.heap) &&
    Array.isArray(c.arrows)
  );
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return Response.json({ error: "Request not allowed." }, { status: 403, headers: noStoreHeaders() });
  }
  if (!acceptsJsonBody(request, 16_384)) {
    return Response.json({ error: "Invalid request." }, { status: 400, headers: noStoreHeaders() });
  }

  let body: { context?: TutorStepContext };
  try {
    body = (await request.json()) as { context?: TutorStepContext };
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400, headers: noStoreHeaders() });
  }
  if (!contextIsValid(body.context)) {
    return Response.json({ error: "Invalid request." }, { status: 400, headers: noStoreHeaders() });
  }

  try {
    const result = await generateExplanation(
      EXPLANATION_SYSTEM_INSTRUCTION,
      buildExplanationUserPrompt(body.context),
    );
    return Response.json(result, { headers: noStoreHeaders() });
  } catch (err) {
    console.error("Live explanation failed", err);
    // Client falls back to its scripted text on any non-200.
    return Response.json({ error: "unavailable" }, { status: 503, headers: noStoreHeaders() });
  }
}
