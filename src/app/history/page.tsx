"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSessions } from "@/lib/storage/sessionStorage";
import type { WorkoutSession } from "@/types/session";
import styles from "./page.module.scss";

export default function HistoryPage() {
  const [sessions, setSessions] = useState<WorkoutSession[] | null>(null);

  useEffect(() => {
    setSessions(getSessions());
  }, []);

  return (
    <div className={styles.page}>
      <h1>Workout history</h1>
      {sessions === null ? (
        <p>Loading history…</p>
      ) : sessions.length === 0 ? (
        <p>
          No sessions yet. <Link href="/">Browse the library</Link> to start one.
        </p>
      ) : (
        <table className={styles.table}>
          <caption className="visually-hidden">Your past workout sessions, most recent first</caption>
          <thead>
            <tr>
              <th scope="col">Exercise</th>
              <th scope="col">Date</th>
              <th scope="col">Score</th>
              <th scope="col">Correct</th>
              <th scope="col">Incorrect</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id}>
                <td>{session.exerciseName}</td>
                <td>{new Date(session.startedAt).toLocaleString()}</td>
                <td>{session.score}</td>
                <td>{session.correctReps}</td>
                <td>{session.incorrectReps}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
