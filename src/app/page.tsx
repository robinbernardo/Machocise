import type { Metadata } from "next";
import { ExerciseCard } from "@/components/ExerciseCard/ExerciseCard";
import { ExerciseFilters } from "@/components/ExerciseFilters/ExerciseFilters";
import { Pagination } from "@/components/Pagination/Pagination";
import { filterExercises, getFilterOptions } from "@/lib/exercises/loadExercises";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Exercise Library | Machocise",
};

const PAGE_SIZE = 24;

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const query = firstValue(params.q);
  const bodyPart = firstValue(params.bodyPart);
  const equipment = firstValue(params.equipment);
  const requestedPage = Math.max(1, Number(firstValue(params.page)) || 1);

  const filtered = filterExercises({ query, bodyPart, equipment });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const { bodyParts, equipment: equipmentOptions } = getFilterOptions();

  function buildHref(targetPage: number) {
    const nextParams = new URLSearchParams();
    if (query) nextParams.set("q", query);
    if (bodyPart) nextParams.set("bodyPart", bodyPart);
    if (equipment) nextParams.set("equipment", equipment);
    if (targetPage > 1) nextParams.set("page", String(targetPage));
    const qs = nextParams.toString();
    return qs ? `/?${qs}` : "/";
  }

  return (
    <div className={styles.page}>
      <h1>Exercise library</h1>
      <p className={styles.intro}>
        {filtered.length} exercises. Pick one to see instructions, or jump straight into a
        camera-tracked workout.
      </p>
      <ExerciseFilters bodyParts={bodyParts} equipmentOptions={equipmentOptions} />
      {pageItems.length === 0 ? (
        <p>No exercises match those filters.</p>
      ) : (
        <ul className={styles.grid} role="list">
          {pageItems.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </ul>
      )}
      <Pagination currentPage={currentPage} totalPages={totalPages} buildHref={buildHref} />
    </div>
  );
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
