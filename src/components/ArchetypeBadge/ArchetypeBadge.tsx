import { ARCHETYPE_DESCRIPTIONS, ARCHETYPE_LABELS, type Archetype } from "@/types/exercise";
import styles from "./ArchetypeBadge.module.scss";

export function ArchetypeBadge({ archetype }: { archetype: Archetype }) {
  return (
    <span className={`${styles.badge} ${styles[archetype]}`}>
      {ARCHETYPE_LABELS[archetype]}
      <span className="visually-hidden">. {ARCHETYPE_DESCRIPTIONS[archetype]}</span>
    </span>
  );
}
