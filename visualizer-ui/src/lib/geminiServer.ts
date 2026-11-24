/*
 * Server-only Gemini access. Two auth paths, whichever is configured:
 *   GEMINI_API_KEY   - Gemini API key (simplest; works once the project's
 *                      billing is active). Preferred when set.
 *   GEMINI_PROJECT   - else Vertex AI via the service account:
 *   GEMINI_LOCATION    region (default us-central1)
 *   GEMINI_SERVICE_ACCOUNT_JSON (string) or GOOGLE_APPLICATION_CREDENTIALS (path)
 *   GEMINI_MODEL     - e.g. gemini-3.8-flash
 * This module is imported only by route handlers and never reaches the browser.
 */

import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (typeof window !== "undefined") {
    throw new Error("geminiServer must never be imported on the client");
  }
  if (client) return client;

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "your-gemini-api-key") {
    client = new GoogleGenAI({ apiKey });
    return client;
  }

  const project = process.env.GEMINI_PROJECT;
  const location = process.env.GEMINI_LOCATION || "us-central1";
  if (!project) {
    throw new Error("Set GEMINI_API_KEY, or GEMINI_PROJECT plus credentials, in the environment (see .env.example).");
  }
  const raw = process.env.GEMINI_SERVICE_ACCOUNT_JSON;
  const googleAuthOptions = raw ? { credentials: JSON.parse(raw) } : undefined;
  client = new GoogleGenAI({ vertexai: true, project, location, googleAuthOptions });
  return client;
}

/* A live per-step explanation as { explanation, whyItMatters }. */
export async function generateExplanation(
  systemInstruction: string,
  userPrompt: string,
): Promise<{ explanation: string; whyItMatters: string }> {
  const ai = getClient();
  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const response = await ai.models.generateContent({
    model,
    contents: userPrompt,
    config: {
      systemInstruction,
      temperature: 0.3,
      maxOutputTokens: 512,
      responseMimeType: "application/json",
      // gemini-3.x flash spends output tokens on an internal reasoning pass by
      // default, which truncated the JSON at a low cap. These explanations are
      // short and grounded, so turn thinking off: faster, cheaper, consistent.
      thinkingConfig: { thinkingBudget: 0 },
    },
  });
  const text = response.text?.trim();
  if (!text) throw new Error("Empty explanation from Gemini");
  const parsed = JSON.parse(text) as { explanation?: unknown; whyItMatters?: unknown };
  if (typeof parsed.explanation !== "string" || typeof parsed.whyItMatters !== "string") {
    throw new Error("Unexpected explanation shape from Gemini");
  }
  return { explanation: parsed.explanation.trim(), whyItMatters: parsed.whyItMatters.trim() };
}

/* Kept for the (parked) tutor route; returns plain text. */
export async function generateTutorReply(
  systemInstruction: string,
  userPrompt: string,
): Promise<string> {
  const ai = getClient();
  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const response = await ai.models.generateContent({
    model,
    contents: userPrompt,
    config: { systemInstruction, temperature: 0.3, maxOutputTokens: 400 },
  });
  const text = response.text?.trim();
  if (!text) throw new Error("Empty tutor response from Gemini");
  return text;
}
