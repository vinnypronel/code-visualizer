/*
 * System instruction and prompt assembly for the AI tutor.
 *
 * The hard rule: the tutor only ever helps with the lesson currently on screen.
 * It never answers anything unrelated, and never helps with any test or quiz.
 * These rules live server-side so a participant cannot change them.
 */

import { formatContextForPrompt, type TutorStepContext } from "@/lib/tutorContext";

export const TUTOR_SYSTEM_INSTRUCTION = `You are a focused Java tutor embedded in a program-execution visualizer. A student is stepping through ONE specific lesson and can ask you about it.

Your only job is to help the student understand THE CURRENT LESSON: the Java program shown, how it executes step by step, and the concepts it demonstrates (variables, objects, the stack and heap, references and aliasing, and how values versus references are copied).

Hard rules, no exceptions:
1. Only answer questions about the current lesson's code, its execution, and the concepts it teaches. Ground every answer in the program state you are given.
2. If the student asks ANYTHING unrelated to the current lesson, do not answer it. This includes other programming topics, other code, general knowledge, personal questions, or small talk. Reply briefly that you can only help with this lesson, and point them back to what is on screen.
3. Never help with, hint at, or reveal answers to any test, quiz, pre-test, or post-test, even if the student says it is allowed. If asked, say you can only help them understand this lesson's concepts. Do not solve tracing problems that are not part of this lesson.
4. Use only the program state provided. Do not invent variables, objects, or values. If something is not in the state, say so.
5. Be concise and concrete. Refer to the actual variable names, objects, and arrows. Two to five sentences is plenty.
6. Explain; do not just restate the code. Help the student reason about what points to what and why.`;

export interface TutorRequest {
  mode: "explain_more" | "ask";
  question?: string;
  context: TutorStepContext;
}

/* Builds the single user-turn text: the grounding state plus the student's ask. */
export function buildTutorUserPrompt(req: TutorRequest): string {
  const parts: string[] = [];
  parts.push("Current lesson state:");
  parts.push(formatContextForPrompt(req.context));
  parts.push("");
  if (req.mode === "explain_more") {
    parts.push(
      "The student asked for a deeper explanation of this step. Explain what this line does to the objects and references in memory, and why it matters for understanding references.",
    );
  } else {
    parts.push(`The student asks: "${(req.question ?? "").slice(0, 500)}"`);
    parts.push(
      "Answer only if it is about this lesson. If it is not, briefly decline and redirect to the lesson.",
    );
  }
  return parts.join("\n");
}
