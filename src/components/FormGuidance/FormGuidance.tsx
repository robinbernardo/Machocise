import { FORM_TIPS } from "@/lib/pose/formTips";
import styles from "./FormGuidance.module.scss";

interface FormGuidanceProps {
  reason?: string;
}

/**
 * Shown after a couple of consecutive incorrect reps (see WorkoutClient's
 * consecutiveIncorrect tracking) -- a persistent, visible coaching callout,
 * not just the momentary red flash.
 */
export function FormGuidance({ reason }: FormGuidanceProps) {
  const tip = reason ? FORM_TIPS[reason] : undefined;

  return (
    <div className={styles.guidance} role="status" aria-live="polite">
      <h2 className={styles.heading}>Let&apos;s fix your form</h2>
      <p className={styles.reason}>{reason ?? "A couple of reps in a row weren't quite right."}</p>
      {tip && <p className={styles.tip}>{tip}</p>}
    </div>
  );
}
