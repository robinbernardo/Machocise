import type { Archetype } from "@/types/exercise";
import { angleBetween, type Point } from "./angles";
import { ARCHETYPE_CONFIG, type HoldArchetypeConfig, type JointAngleDef, type RepArchetypeConfig } from "./archetypeConfig";
import { POSE_LANDMARKS } from "./landmarks";
import { ExponentialSmoother } from "./smoothing";

export interface RepEvent {
  index: number;
  correct: boolean;
  /** Human-readable reason a rep was marked incorrect, for UI/debugging. */
  reason?: string;
}

export interface PoseRepEngine {
  update(landmarks: Point[], timestampMs: number): RepEvent | null;
}

const MIN_LANDMARK_VISIBILITY = 0.5;
const CALIBRATION_MS = 1500;

function readAngle(landmarks: Point[], def: JointAngleDef): number | null {
  const a = landmarks[POSE_LANDMARKS[def.a]];
  const b = landmarks[POSE_LANDMARKS[def.b]];
  const c = landmarks[POSE_LANDMARKS[def.c]];
  if (!a || !b || !c) return null;
  if (
    (a.visibility ?? 1) < MIN_LANDMARK_VISIBILITY ||
    (b.visibility ?? 1) < MIN_LANDMARK_VISIBILITY ||
    (c.visibility ?? 1) < MIN_LANDMARK_VISIBILITY
  ) {
    return null;
  }
  return angleBetween(a, b, c);
}

type Phase = "calibrating" | "extended" | "contracting";

/**
 * Generic rep counter shared by every "reps" archetype. Runs a calibration
 * window to establish the user's own neutral joint angle, then tracks the
 * primary angle through an extended -> contracting -> extended cycle,
 * scoring each completed cycle against range-of-motion, tempo, and (when
 * a mirror angle exists) left/right symmetry.
 */
class RepEngine implements PoseRepEngine {
  private phase: Phase = "calibrating";
  private calibrationStart: number | null = null;
  private calibrationSamples: number[] = [];
  private neutralAngle: number;
  private contractedThreshold = 0;
  private repIndex = 0;
  private contractionStartedAt = 0;
  private extremeAngle = 0;
  private maxSymmetryDeviation = 0;
  private readonly smoother = new ExponentialSmoother(0.4);
  private readonly mirrorSmoother = new ExponentialSmoother(0.4);

  constructor(private readonly config: RepArchetypeConfig) {
    this.neutralAngle = config.neutralAngleFallback;
  }

  update(landmarks: Point[], timestampMs: number): RepEvent | null {
    const rawAngle = readAngle(landmarks, this.config.primaryAngle);
    if (rawAngle === null) return null;
    const angle = this.smoother.next(rawAngle);

    const rawMirror = this.config.mirrorAngle ? readAngle(landmarks, this.config.mirrorAngle) : null;
    const mirrorAngle = rawMirror === null || rawMirror === undefined ? null : this.mirrorSmoother.next(rawMirror);

    if (this.phase === "calibrating") {
      return this.runCalibration(angle, timestampMs);
    }

    const decreasing = this.config.contraction === "decrease";
    const pastContractedThreshold = decreasing ? angle <= this.contractedThreshold : angle >= this.contractedThreshold;

    // Hysteresis so noise near the threshold doesn't trigger spurious phase flips.
    const returnBuffer = this.config.contractedOffsetDeg / 3;
    const pastReturnThreshold = decreasing
      ? angle >= this.contractedThreshold + returnBuffer
      : angle <= this.contractedThreshold - returnBuffer;

    if (this.phase === "extended" && pastContractedThreshold) {
      this.phase = "contracting";
      this.contractionStartedAt = timestampMs;
      this.extremeAngle = angle;
      this.maxSymmetryDeviation = 0;
    }

    if (this.phase === "contracting") {
      this.extremeAngle = decreasing ? Math.min(this.extremeAngle, angle) : Math.max(this.extremeAngle, angle);
      if (mirrorAngle !== null) {
        this.maxSymmetryDeviation = Math.max(this.maxSymmetryDeviation, Math.abs(angle - mirrorAngle));
      }

      if (pastReturnThreshold) {
        return this.completeRep(timestampMs, decreasing);
      }
    }

    return null;
  }

  private runCalibration(angle: number, timestampMs: number): null {
    if (this.calibrationStart === null) this.calibrationStart = timestampMs;
    this.calibrationSamples.push(angle);

    if (timestampMs - this.calibrationStart >= CALIBRATION_MS) {
      this.neutralAngle = this.calibrationSamples.reduce((sum, v) => sum + v, 0) / this.calibrationSamples.length;
      this.contractedThreshold =
        this.config.contraction === "decrease"
          ? this.neutralAngle - this.config.contractedOffsetDeg
          : this.neutralAngle + this.config.contractedOffsetDeg;
      this.phase = "extended";
    }
    return null;
  }

  private completeRep(timestampMs: number, decreasing: boolean): RepEvent {
    const romOk = decreasing ? this.extremeAngle <= this.contractedThreshold : this.extremeAngle >= this.contractedThreshold;
    const durationOk = timestampMs - this.contractionStartedAt >= this.config.minRepDurationMs;
    const symmetryOk = this.maxSymmetryDeviation <= this.config.symmetryToleranceDeg;

    this.phase = "extended";
    this.repIndex += 1;

    const correct = romOk && durationOk && symmetryOk;
    const reason = correct
      ? undefined
      : !romOk
        ? "Not enough range of motion"
        : !durationOk
          ? "Rep was too fast to control"
          : "Left and right sides moved unevenly";

    return { index: this.repIndex, correct, reason };
  }
}

/**
 * For "hold" archetypes (currently: plank) there's no discrete rep cycle --
 * instead, body alignment is sampled continuously and scored at fixed
 * checkpoints, so the same green/red feedback loop still applies.
 */
class HoldEngine implements PoseRepEngine {
  private lastCheckpoint: number | null = null;
  private deviationSamples: number[] = [];
  private repIndex = 0;
  private readonly smoother = new ExponentialSmoother(0.3);

  constructor(private readonly config: HoldArchetypeConfig) {}

  update(landmarks: Point[], timestampMs: number): RepEvent | null {
    const rawAngle = readAngle(landmarks, this.config.alignmentAngle);
    if (rawAngle === null) return null;
    const angle = this.smoother.next(rawAngle);
    this.deviationSamples.push(Math.abs(180 - angle));

    if (this.lastCheckpoint === null) {
      this.lastCheckpoint = timestampMs;
      return null;
    }

    if (timestampMs - this.lastCheckpoint < this.config.checkpointMs) {
      return null;
    }

    const avgDeviation = this.deviationSamples.reduce((sum, v) => sum + v, 0) / this.deviationSamples.length;
    this.deviationSamples = [];
    this.lastCheckpoint = timestampMs;
    this.repIndex += 1;

    const correct = avgDeviation <= this.config.alignmentToleranceDeg;
    return { index: this.repIndex, correct, reason: correct ? undefined : "Hips are dropping out of alignment" };
  }
}

export function createRepEngine(archetype: Archetype): PoseRepEngine {
  const config = ARCHETYPE_CONFIG[archetype];
  return config.mode === "hold" ? new HoldEngine(config) : new RepEngine(config);
}
