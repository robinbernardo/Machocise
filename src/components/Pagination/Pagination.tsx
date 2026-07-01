import Link from "next/link";
import styles from "./Pagination.module.scss";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

export function Pagination({ currentPage, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav aria-label="Exercise library pages" className={styles.pagination}>
      {hasPrevious ? (
        <Link href={buildHref(currentPage - 1)} className={styles.link}>
          Previous
        </Link>
      ) : (
        <span className={styles.linkDisabled} aria-disabled="true">
          Previous
        </span>
      )}
      <span className={styles.status}>
        Page {currentPage} of {totalPages}
      </span>
      {hasNext ? (
        <Link href={buildHref(currentPage + 1)} className={styles.link}>
          Next
        </Link>
      ) : (
        <span className={styles.linkDisabled} aria-disabled="true">
          Next
        </span>
      )}
    </nav>
  );
}
