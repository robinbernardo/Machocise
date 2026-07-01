import type { Archetype } from "@/types/exercise";
import type { LandmarkName } from "./landmarks";

export interface JointAngleDef {
  a: LandmarkName;
  b: LandmarkName;
  c: LandmarkName;
}

export interface RepArchetypeConfig {
  mode: "reps";
  /** The angle whose oscillation drives rep counting. */
  primaryAngle: JointAngleDef;
  /** Same angle on the opposite side of the body, for a symmetry check. Null for unilateral movements. */
  mirrorAngle: JointAngleDef | null;
  /** Whether the "working" part of the rep decreases or increases the primary angle. */
  contraction: "decrease" | "increase";
  /** Used only if live calibration fails to produce a stable neutral angle. */
  neutralAngleFallback: number;
  /** How far from neutral (in degrees) counts as a full, valid contraction. */
  contractedOffsetDeg: number;
  /** Reps faster than this are treated as uncontrolled/momentum-driven. */
  minRepDurationMs: number;
  /** Max allowed left/right angle difference during the rep. */
  symmetryToleranceDeg: number;
}

export interface HoldArchetypeConfig {
  mode: "hold";
  /** Angle that should stay close to a straight line (~180deg) for good alignment. */
  alignmentAngle: JointAngleDef;
  alignmentToleranceDeg: number;
  /** How often a hold is scored as a "rep" (a checkpoint), in ms. */
  checkpointMs: number;
}

export type ArchetypeConfig = RepArchetypeConfig | HoldArchetypeConfig;

/**
 * One config per movement-pattern archetype (docs/PLAN.md #3), shared by
 * every exercise tagged with that archetype. These thresholds are
 * reasonable starting points, not clinically validated biomechanics --
 * expect to tune them against real recordings.
 *
 * Implemented generic checks: range-of-motion sufficiency, left/right
 * symmetry, rep tempo, and (for holds) body-alignment over time. Torso/
 * spine-lean stability during standing lifts is a documented follow-up,
 * not yet implemented, to avoid a half-finished check.
 */
export const ARCHETYPE_CONFIG: Record<Archetype, ArchetypeConfig> = {
  squat: {
    mode: "reps",
    primaryAngle: { a: "LEFT_HIP", b: "LEFT_KNEE", c: "LEFT_ANKLE" },
    mirrorAngle: { a: "RIGHT_HIP", b: "RIGHT_KNEE", c: "RIGHT_ANKLE" },
    contraction: "decrease",
    neutralAngleFallback: 170,
    contractedOffsetDeg: 60,
    minRepDurationMs: 600,
    symmetryToleranceDeg: 18,
  },
  lunge: {
    mode: "reps",
    primaryAngle: { a: "LEFT_HIP", b: "LEFT_KNEE", c: "LEFT_ANKLE" },
    mirrorAngle: null,
    contraction: "decrease",
    neutralAngleFallback: 170,
    contractedOffsetDeg: 70,
    minRepDurationMs: 600,
    symmetryToleranceDeg: 999,
  },
  hinge: {
    mode: "reps",
    primaryAngle: { a: "LEFT_SHOULDER", b: "LEFT_HIP", c: "LEFT_KNEE" },
    mirrorAngle: { a: "RIGHT_SHOULDER", b: "RIGHT_HIP", c: "RIGHT_KNEE" },
    contraction: "decrease",
    neutralAngleFallback: 175,
    contractedOffsetDeg: 55,
    minRepDurationMs: 600,
    symmetryToleranceDeg: 18,
  },
  push: {
    mode: "reps",
    primaryAngle: { a: "LEFT_SHOULDER", b: "LEFT_ELBOW", c: "LEFT_WRIST" },
    mirrorAngle: { a: "RIGHT_SHOULDER", b: "RIGHT_ELBOW", c: "RIGHT_WRIST" },
    contraction: "decrease",
    neutralAngleFallback: 165,
    contractedOffsetDeg: 70,
    minRepDurationMs: 500,
    symmetryToleranceDeg: 20,
  },
  pull: {
    mode: "reps",
    primaryAngle: { a: "LEFT_SHOULDER", b: "LEFT_ELBOW", c: "LEFT_WRIST" },
    mirrorAngle: { a: "RIGHT_SHOULDER", b: "RIGHT_ELBOW", c: "RIGHT_WRIST" },
    contraction: "decrease",
    neutralAngleFallback: 160,
    contractedOffsetDeg: 90,
    minRepDurationMs: 500,
    symmetryToleranceDeg: 20,
  },
  raise: {
    mode: "reps",
    primaryAngle: { a: "LEFT_HIP", b: "LEFT_SHOULDER", c: "LEFT_ELBOW" },
    mirrorAngle: { a: "RIGHT_HIP", b: "RIGHT_SHOULDER", c: "RIGHT_ELBOW" },
    contraction: "increase",
    neutralAngleFallback: 20,
    contractedOffsetDeg: 55,
    minRepDurationMs: 500,
    symmetryToleranceDeg: 20,
  },
  rotation: {
    // Simplified proxy: shoulder-line-to-hip angle as a stand-in for torso
    // twist, since MediaPipe's 2D landmarks make true axial rotation hard
    // to measure reliably. Flagged as a known coarse approximation.
    mode: "reps",
    primaryAngle: { a: "RIGHT_HIP", b: "LEFT_SHOULDER", c: "RIGHT_SHOULDER" },
    mirrorAngle: null,
    contraction: "decrease",
    neutralAngleFallback: 90,
    contractedOffsetDeg: 35,
    minRepDurationMs: 500,
    symmetryToleranceDeg: 999,
  },
  cardio: {
    mode: "reps",
    primaryAngle: { a: "LEFT_SHOULDER", b: "LEFT_HIP", c: "LEFT_KNEE" },
    mirrorAngle: null,
    contraction: "decrease",
    neutralAngleFallback: 170,
    contractedOffsetDeg: 25,
    minRepDurationMs: 300,
    symmetryToleranceDeg: 999,
  },
  plank: {
    mode: "hold",
    alignmentAngle: { a: "LEFT_SHOULDER", b: "LEFT_HIP", c: "LEFT_ANKLE" },
    alignmentToleranceDeg: 15,
    checkpointMs: 4000,
  },
  unclassified: {
    // Fallback: generic elbow-driven motion tracking so every exercise
    // still gets *some* rep count, with weak form confidence (docs/PLAN.md #5).
    mode: "reps",
    primaryAngle: { a: "LEFT_SHOULDER", b: "LEFT_ELBOW", c: "LEFT_WRIST" },
    mirrorAngle: { a: "RIGHT_SHOULDER", b: "RIGHT_ELBOW", c: "RIGHT_WRIST" },
    contraction: "decrease",
    neutralAngleFallback: 160,
    contractedOffsetDeg: 40,
    minRepDurationMs: 400,
    symmetryToleranceDeg: 999,
  },
};
