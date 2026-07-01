import styles from "./FeedbackOverlay.module.scss";

export type FeedbackStatus = "correct" | "incorrect" | null;

interface FeedbackOverlayProps {
  status: FeedbackStatus;
}

/**
 * Purely visual flash -- decorative, so it's aria-hidden. The equivalent
 * information for screen-reader users is announced by RepCounter's live
 * region, which fires on the same rep event.
 */
export function FeedbackOverlay({ status }: FeedbackOverlayProps) {
  const statusClass = status ? styles[status] : "";
  return (
    <div
      className={`${styles.overlay} ${statusClass} ${status ? styles.visible : ""}`.trim()}
      aria-hidden="true"
    >
      {status === "correct" && "Correct form!"}
      {status === "incorrect" && "Try again"}
    </div>
  );
}
