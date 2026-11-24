/*
 * AI tutor endpoint for the learning phase (AI-vis condition only).
 *
 * Takes the current lesson step's state plus the student's ask, applies the
 * strict tutor system prompt, and returns a grounded reply from Gemini (Vertex).
 * The system prompt and the lesson allow-list live here, server-side, so a
 * participant cannot widen what the tutor will talk about.
 *
 * Pre-launch hardening still to add once the IRB covers interactive chat:
 *   - validate the session token against the DB (not just its shape)
 *   - persist every question + reply (needs a study_events type + migration)
 *   - DB-backed per-participant rate limit
 */

import { generateTutorReply } from "@/lib/geminiServer";
import {
  TUTOR_SYSTEM_INSTRUCTION,
  buildTutorUserPrompt,
  type TutorRequest,
} from "@/lib/tutorPrompt";
import type { TutorStepContext } from "@/lib/tutorContext";
import { STUDY_LESSON_IDS } from "@/lib/studyConfig";
import { acceptsJsonBody, isSameOriginMutation, noStoreHeaders } from "@/lib/requestSecurity";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface TutorBody {
  participant_id?: string;
  session_token?: string;
  mode?: "explain_more" | "ask";
  question?: string;
  context?: TutorStepContext;
}

function contextIsValid(ctx: unknown): ctx is TutorStepContext {
  if (!ctx || typeof ctx !== "object") return false;
  const c = ctx as TutorStepContext;
  return (
    typeof c.lessonId === "string" &&
    STUDY_LESSON_IDS.includes(c.lessonId) &&
    typeof c.code === "string" &&
    c.code.length < 8000 &&
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

  let body: TutorBody;
  try {
    body = (await request.json()) as TutorBody;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400, headers: noStoreHeaders() });
  }

  if (!UUID.test(body.participant_id ?? "") || !UUID.test(body.session_token ?? "")) {
    return Response.json({ error: "Invalid session." }, { status: 400, headers: noStoreHeaders() });
  }
  if (body.mode !== "explain_more" && body.mode !== "ask") {
    return Response.json({ error: "Invalid request." }, { status: 400, headers: noStoreHeaders() });
  }
  if (body.mode === "ask") {
    const q = body.question?.trim() ?? "";
    if (q.length < 2 || q.length > 500) {
      return Response.json({ error: "Enter a question about this lesson." }, { status: 400, headers: noStoreHeaders() });
    }
  }
  if (!contextIsValid(body.context)) {
    return Response.json({ error: "Invalid request." }, { status: 400, headers: noStoreHeaders() });
  }

  const req: TutorRequest = {
    mode: body.mode,
    question: body.question,
    context: body.context,
  };

  try {
    const answer = await generateTutorReply(TUTOR_SYSTEM_INSTRUCTION, buildTutorUserPrompt(req));
    return Response.json({ answer }, { headers: noStoreHeaders() });
  } catch (err) {
    console.error("Tutor reply failed", err);
    return Response.json(
      { error: "The assistant is unavailable right now. Please try again." },
      { status: 503, headers: noStoreHeaders() },
    );
  }
}
