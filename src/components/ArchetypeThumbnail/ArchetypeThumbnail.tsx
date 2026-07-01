import { ArchetypeIcon } from "@/components/ArchetypeIcon/ArchetypeIcon";
import type { Archetype } from "@/types/exercise";
import styles from "./ArchetypeThumbnail.module.scss";

interface ArchetypeThumbnailProps {
  archetype: Archetype;
  size?: "small" | "large";
}

/**
 * Colored tile + icon standing in for a missing exercise photo. Purely
 * decorative -- the accompanying ArchetypeBadge text carries the same
 * information accessibly.
 */
export function ArchetypeThumbnail({ archetype, size = "small" }: ArchetypeThumbnailProps) {
  const sizeClass = size === "large" ? styles.large : "";
  return (
    <div className={`${styles.thumbnail} ${styles[archetype]} ${sizeClass}`.trim()} aria-hidden="true">
      <ArchetypeIcon archetype={archetype} />
    </div>
  );
}
