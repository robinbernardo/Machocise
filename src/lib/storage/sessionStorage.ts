import type { WorkoutSession } from "@/types/session";

const STORAGE_KEY = "machocise:sessions";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getSessions(): WorkoutSession[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WorkoutSession[]) : [];
  } catch {
    return [];
  }
}

export function saveSession(session: WorkoutSession): void {
  if (!isBrowser()) return;
  const sessions = [session, ...getSessions()];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function clearSessions(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}
