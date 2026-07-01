import "server-only";
import type { Exercise } from "@/types/exercise";
import data from "@/data/exercises.json";

const EXERCISES = data as Exercise[];

export interface ExerciseFilters {
  query?: string;
  bodyPart?: string;
  equipment?: string;
}

export function getAllExercises(): Exercise[] {
  return EXERCISES;
}

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find((exercise) => exercise.id === id);
}

export function getFilterOptions(): { bodyParts: string[]; equipment: string[] } {
  const bodyParts = new Set<string>();
  const equipment = new Set<string>();
  for (const exercise of EXERCISES) {
    bodyParts.add(exercise.bodyPart);
    equipment.add(exercise.equipment);
  }
  return {
    bodyParts: [...bodyParts].sort(),
    equipment: [...equipment].sort(),
  };
}

export function filterExercises(filters: ExerciseFilters): Exercise[] {
  const query = filters.query?.trim().toLowerCase();
  return EXERCISES.filter((exercise) => {
    if (filters.bodyPart && exercise.bodyPart !== filters.bodyPart) return false;
    if (filters.equipment && exercise.equipment !== filters.equipment) return false;
    if (query && !exercise.name.toLowerCase().includes(query)) return false;
    return true;
  });
}
