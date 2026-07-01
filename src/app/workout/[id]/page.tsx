import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getExerciseById } from "@/lib/exercises/loadExercises";
import { toTitleCase } from "@/lib/format";
import { WorkoutClient } from "./WorkoutClient";

interface WorkoutPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: WorkoutPageProps): Promise<Metadata> {
  const { id } = await params;
  const exercise = getExerciseById(id);
  return { title: exercise ? `Workout: ${toTitleCase(exercise.name)} | Machocise` : "Workout" };
}

export default async function WorkoutPage({ params }: WorkoutPageProps) {
  const { id } = await params;
  const exercise = getExerciseById(id);
  if (!exercise) notFound();

  return <WorkoutClient exercise={exercise} />;
}
