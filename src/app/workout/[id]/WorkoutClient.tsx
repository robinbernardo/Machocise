"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { CameraPermissionGate } from "@/components/CameraPermissionGate/CameraPermissionGate";
import { FeedbackOverlay, type FeedbackStatus } from "@/components/FeedbackOverlay/FeedbackOverlay";
import { PoseCanvas } from "@/components/PoseCanvas/PoseCanvas";
import { RepCounter } from "@/components/RepCounter/RepCounter";
import { ScoreBoard } from "@/components/ScoreBoard/ScoreBoard";
import { SessionSummary } from "@/components/SessionSummary/SessionSummary";
import { toTitleCase } from "@/lib/format";
import type { Point } from "@/lib/pose/angles";
import { createRepEngine, type RepEvent } from "@/lib/pose/repEngine";
import { playFeedbackSound } from "@/lib/sound/playFeedbackSound";
import { saveSession } from "@/lib/storage/sessionStorage";
import type { Exercise } from "@/types/exercise";
import styles from "./WorkoutClient.module.scss";

const FEEDBACK_FLASH_MS = 600;

interface WorkoutClientProps {
  exercise: Exercise;
}

export function WorkoutClient({ exercise }: WorkoutClientProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [correctReps, setCorrectReps] = useState(0);
  const [incorrectReps, setIncorrectReps] = useState(0);
  const [lastResult, setLastResult] = useState<{ correct: boolean; reason?: string } | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackStatus>(null);
  const [finished, setFinished] = useState(false);

  const engineRef = useRef(createRepEngine(exercise.archetype));
  const startTimeRef = useRef(Date.now());
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedRef = useRef(false);

  const totalReps = correctReps + incorrectReps;
  const score = correctReps * 10 - incorrectReps * 2;

  const handleGranted = useCallback((mediaStream: MediaStream) => {
    startTimeRef.current = Date.now();
    setStream(mediaStream);
  }, []);

  const handleFrame = useCallback((landmarks: Point[], timestampMs: number) => {
    const event: RepEvent | null = engineRef.current.update(landmarks, timestampMs);
    if (!event) return;

    setLastResult({ correct: event.correct, reason: event.reason });
    setFeedbackStatus(event.correct ? "correct" : "incorrect");
    playFeedbackSound(event.correct ? "correct" : "incorrect");
    event.correct ? setCorrectReps((count) => count + 1) : setIncorrectReps((count) => count + 1);

    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => setFeedbackStatus(null), FEEDBACK_FLASH_MS);
  }, []);

  const endSession = useCallback(() => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setFinished(true);

    if (!savedRef.current) {
      savedRef.current = true;
      saveSession({
        id: `${exercise.id}-${Date.now()}`,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        startedAt: startTimeRef.current,
        endedAt: Date.now(),
        correctReps,
        incorrectReps,
        score,
      });
    }
  }, [stream, exercise, correctReps, incorrectReps, score]);

  const restart = useCallback(() => {
    engineRef.current = createRepEngine(exercise.archetype);
    startTimeRef.current = Date.now();
    savedRef.current = false;
    setCorrectReps(0);
    setIncorrectReps(0);
    setLastResult(null);
    setFeedbackStatus(null);
    setFinished(false);
  }, [exercise.archetype]);

  if (finished) {
    return (
      <div className={styles.page}>
        <SessionSummary
          exerciseName={toTitleCase(exercise.name)}
          correctReps={correctReps}
          incorrectReps={incorrectReps}
          score={score}
          durationMs={Date.now() - startTimeRef.current}
          onRestart={restart}
        />
        <Link href="/" className={styles.backLink}>
          Back to library
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Link href={`/exercises/${exercise.id}`} className={styles.backLink}>
        ← {toTitleCase(exercise.name)}
      </Link>
      <h1>{toTitleCase(exercise.name)}</h1>

      <CameraPermissionGate onGranted={handleGranted}>
        {stream && (
          <div className={styles.workoutArea}>
            <div className={styles.cameraColumn}>
              <PoseCanvas stream={stream} onFrame={handleFrame} />
              <FeedbackOverlay status={feedbackStatus} />
            </div>
            <div className={styles.statsColumn}>
              <RepCounter count={totalReps} lastResult={lastResult} />
              <ScoreBoard score={score} correctReps={correctReps} incorrectReps={incorrectReps} />
              <button type="button" className={styles.endButton} onClick={endSession}>
                End set
              </button>
            </div>
          </div>
        )}
      </CameraPermissionGate>
    </div>
  );
}
