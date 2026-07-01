/**
 * Movement-pattern archetype an exercise is classified into. Each archetype
 * maps to a shared, generic rep-counting/form-checking configuration in
 * src/lib/pose/archetypeConfig.ts, rather than exercise-specific rules --
 * see docs/PLAN.md #3 for why.
 */
export type Archetype =
  | "squat"
  | "hinge"
  | "push"
  | "pull"
  | "lunge"
  | "raise"
  | "plank"
  | "rotation"
  | "cardio"
  | "unclassified";

export interface Exercise {
  id: string;
  name: string;
  category: string;
  bodyPart: string;
  equipment: string;
  target: string;
  muscleGroup: string;
  secondaryMuscles: string[];
  instructions: string;
  instructionSteps: string[];
  archetype: Archetype;
}

export const ARCHETYPE_LABELS: Record<Archetype, string> = {
  squat: "Squat pattern",
  hinge: "Hip-hinge pattern",
  push: "Push pattern",
  pull: "Pull / curl pattern",
  lunge: "Lunge pattern",
  raise: "Raise pattern",
  plank: "Static hold",
  rotation: "Rotation pattern",
  cardio: "Cardio / plyometric",
  unclassified: "General motion tracking",
};

export const ARCHETYPE_DESCRIPTIONS: Record<Archetype, string> = {
  squat: "Form checks track knee and hip bend depth and left/right symmetry.",
  hinge: "Form checks track hip fold angle and spine position.",
  push: "Form checks track elbow bend depth and control.",
  pull: "Form checks track elbow curl range and upper-arm stability.",
  lunge: "Form checks track front-knee bend depth and torso lean.",
  raise: "Form checks track limb-raise height and control.",
  plank: "Form checks track body alignment over time instead of counting reps.",
  rotation: "Form checks track torso rotation range.",
  cardio: "Form checks track overall body motion and rhythm.",
  unclassified:
    "This exercise isn't mapped to a specific movement pattern yet, so only general motion is tracked -- form feedback is a best effort.",
};
