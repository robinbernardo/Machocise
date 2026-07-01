"use client";

import { useEffect, useRef } from "react";
import styles from "./SessionSummary.module.scss";

interface SessionSummaryProps {
  exerciseName: string;
  correctReps: number;
  incorrectReps: number;
  score: number;
  durationMs: number;
  onRestart: () => void;
}

export function SessionSummary({
  exerciseName,
  correctReps,
  incorrectReps,
  score,
  durationMs,
  onRestart,
}: SessionSummaryProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Ending a set is a significant view change, so move focus to the new
  // heading -- the same pattern you'd use for client-side navigation.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const total = correctReps + incorrectReps;
  const accuracy = total === 0 ? 0 : Math.round((correctReps / total) * 100);
  const durationSeconds = Math.round(durationMs / 1000);

  return (
    <section className={styles.summary} aria-labelledby="summary-heading">
      <h2 id="summary-heading" ref={headingRef} tabIndex={-1} className={styles.heading}>
        Workout complete: {exerciseName}
      </h2>
      <dl className={styles.stats}>
        <div>
          <dt>Score</dt>
          <dd>{score}</dd>
        </div>
        <div>
          <dt>Correct reps</dt>
          <dd>{correctReps}</dd>
        </div>
        <div>
          <dt>Incorrect reps</dt>
          <dd>{incorrectReps}</dd>
        </div>
        <div>
          <dt>Accuracy</dt>
          <dd>{accuracy}%</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{durationSeconds}s</dd>
        </div>
      </dl>
      <button type="button" className={styles.button} onClick={onRestart}>
        Do another set
      </button>
    </section>
  );
}
