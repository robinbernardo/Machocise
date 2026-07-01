import Link from "next/link";
import { ArchetypeBadge } from "@/components/ArchetypeBadge/ArchetypeBadge";
import { toTitleCase } from "@/lib/format";
import type { Exercise } from "@/types/exercise";
import styles from "./ExerciseCard.module.scss";

export function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const headingId = `exercise-${exercise.id}-name`;

  return (
    <li className={styles.card}>
      <article aria-labelledby={headingId} className={styles.article}>
        <h3 id={headingId} className={styles.name}>
          <Link href={`/exercises/${exercise.id}`} className={styles.nameLink}>
            {toTitleCase(exercise.name)}
          </Link>
        </h3>
        <ArchetypeBadge archetype={exercise.archetype} />
        <dl className={styles.meta}>
          <div className={styles.metaRow}>
            <dt>Body part</dt>
            <dd>{exercise.bodyPart}</dd>
          </div>
          <div className={styles.metaRow}>
            <dt>Equipment</dt>
            <dd>{exercise.equipment}</dd>
          </div>
          <div className={styles.metaRow}>
            <dt>Target</dt>
            <dd>{exercise.target}</dd>
          </div>
        </dl>
      </article>
    </li>
  );
}
