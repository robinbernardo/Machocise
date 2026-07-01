import styles from "./ScoreBoard.module.scss";

interface ScoreBoardProps {
  score: number;
  correctReps: number;
  incorrectReps: number;
}

export function ScoreBoard({ score, correctReps, incorrectReps }: ScoreBoardProps) {
  const total = correctReps + incorrectReps;
  const accuracy = total === 0 ? 0 : Math.round((correctReps / total) * 100);

  return (
    <dl className={styles.board}>
      <div className={styles.stat}>
        <dt>Score</dt>
        <dd>{score}</dd>
      </div>
      <div className={styles.stat}>
        <dt>Correct</dt>
        <dd>{correctReps}</dd>
      </div>
      <div className={styles.stat}>
        <dt>Incorrect</dt>
        <dd>{incorrectReps}</dd>
      </div>
      <div className={styles.stat}>
        <dt>Accuracy</dt>
        <dd>{accuracy}%</dd>
      </div>
    </dl>
  );
}
