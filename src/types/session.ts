export interface RepResult {
  index: number;
  correct: boolean;
  timestamp: number;
}

export interface WorkoutSession {
  id: string;
  exerciseId: string;
  exerciseName: string;
  startedAt: number;
  endedAt: number;
  correctReps: number;
  incorrectReps: number;
  score: number;
}
