/*
 * Demo mode: lets someone run the study app locally to look at it (a mentor, a
 * reviewer, a new team member) without touching real study data.
 *
 * When on:
 *   - consent needs no Turnstile challenge, so it works on localhost with no
 *     Cloudflare keys at all;
 *   - agreeing to the consent form does NOT call /api/session/assign, so no
 *     participant ID is minted, nothing counts against the enrollment cap, and
 *     no row is written to Supabase;
 *   - no session token is issued, so every lifecycle log is a no-op (see
 *     logEvent in StudyProvider);
 *   - a banner says so on every screen, so a demo run can never be mistaken
 *     for a real session.
 *
 * It is ignored in production builds, so setting the flag on Vercel cannot
 * turn the deployed study into a demo.
 */

export const DEMO_MODE =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_DEMO_MODE === "1";

/* Stand-in participant ID shown on screen during a demo run. */
export const DEMO_PARTICIPANT_ID = "DEMO";
