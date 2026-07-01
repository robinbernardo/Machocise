/**
 * Longer, actionable coaching tips keyed by the short `reason` string a
 * RepEvent carries (see src/lib/pose/repEngine.ts). Shown after a couple of
 * consecutive incorrect reps so the user gets more than just "wrong".
 */
export const FORM_TIPS: Record<string, string> = {
  "Not enough range of motion":
    "Try to reach further into both the stretched and contracted positions before reversing direction.",
  "Rep was too fast to control":
    "Slow down -- control the movement in both directions instead of using momentum.",
  "Left and right sides moved unevenly":
    "Focus on moving both sides of your body together and evenly.",
  "Hips are dropping out of alignment":
    "Brace your core and squeeze your glutes to keep hips, shoulders, and ankles in a straight line.",
};
