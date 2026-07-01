"use client";

import { useEffect, useState } from "react";
import styles from "./RepCounter.module.scss";

interface RepCounterProps {
  count: number;
  lastResult: { correct: boolean; reason?: string } | null;
}

export function RepCounter({ count, lastResult }: RepCounterProps) {
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!lastResult || lastResult.correct) return;
    setShake(true);
    const timeout = setTimeout(() => setShake(false), 500);
    return () => clearTimeout(timeout);
  }, [lastResult]);

  const announcement = !lastResult
    ? ""
    : lastResult.correct
      ? `Rep ${count}: good form.`
      : `Form issue, rep not counted. ${lastResult.reason ?? ""}`;

  return (
    <div className={styles.wrapper}>
      <span className={`${styles.count} ${shake ? styles.shake : ""}`.trim()}>{count}</span>
      <span className={styles.label}>correct reps</span>
      <p role="status" aria-live="polite" className="visually-hidden">
        {announcement}
      </p>
    </div>
  );
}
