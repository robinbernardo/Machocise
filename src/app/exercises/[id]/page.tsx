import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArchetypeBadge } from "@/components/ArchetypeBadge/ArchetypeBadge";
import { getExerciseById } from "@/lib/exercises/loadExercises";
import { toTitleCase } from "@/lib/format";
import { ARCHETYPE_DESCRIPTIONS } from "@/types/exercise";
import styles from "./page.module.scss";

interface ExerciseDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ExerciseDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const exercise = getExerciseById(id);
  return { title: exercise ? `${toTitleCase(exercise.name)} | Machocise` : "Exercise not found" };
}

export default async function ExerciseDetailPage({ params }: ExerciseDetailPageProps) {
  const { id } = await params;
  const exercise = getExerciseById(id);
  if (!exercise) notFound();

  return (
    <div className={styles.page}>
      <Link href="/" className={styles.back}>
        ← Back to library
      </Link>
      <h1>{toTitleCase(exercise.name)}</h1>
      <ArchetypeBadge archetype={exercise.archetype} />

      <dl className={styles.meta}>
        <div>
          <dt>Body part</dt>
          <dd>{exercise.bodyPart}</dd>
        </div>
        <div>
          <dt>Equipment</dt>
          <dd>{exercise.equipment}</dd>
        </div>
        <div>
          <dt>Target muscle</dt>
          <dd>{exercise.target}</dd>
        </div>
        {exercise.secondaryMuscles.length > 0 && (
          <div>
            <dt>Secondary muscles</dt>
            <dd>{exercise.secondaryMuscles.join(", ")}</dd>
          </div>
        )}
      </dl>

      <section aria-labelledby="instructions-heading">
        <h2 id="instructions-heading">Instructions</h2>
        {exercise.instructionSteps.length > 0 ? (
          <ol className={styles.steps}>
            {exercise.instructionSteps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        ) : (
          <p>{exercise.instructions}</p>
        )}
      </section>

      <p className={styles.formNote}>{ARCHETYPE_DESCRIPTIONS[exercise.archetype]}</p>

      <Link href={`/workout/${exercise.id}`} className={styles.startButton}>
        Start workout
      </Link>
    </div>
  );
}
