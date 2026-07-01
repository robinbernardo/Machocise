export type FeedbackSoundType = "correct" | "incorrect";

/**
 * Placeholder tones live at these paths (see scripts/generate-placeholder-sounds.mjs).
 * Swap in your own clips later by replacing these two files -- no code
 * changes needed elsewhere.
 */
const SOUND_SOURCES: Record<FeedbackSoundType, string> = {
  correct: "/sounds/correct.wav",
  incorrect: "/sounds/incorrect.wav",
};

const audioCache = new Map<FeedbackSoundType, HTMLAudioElement>();

export function playFeedbackSound(type: FeedbackSoundType): void {
  if (typeof window === "undefined") return;

  let audio = audioCache.get(type);
  if (!audio) {
    audio = new Audio(SOUND_SOURCES[type]);
    audioCache.set(type, audio);
  }

  audio.currentTime = 0;
  // Autoplay restrictions only block audio before a user gesture; by the
  // time reps are being scored the user has already granted camera access,
  // which counts as one. Swallow rejections defensively regardless.
  void audio.play().catch(() => {});
}
