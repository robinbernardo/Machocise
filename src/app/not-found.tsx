import Link from "next/link";
import styles from "./not-found.module.scss";

export default function NotFound() {
  return (
    <div className={styles.page}>
      <h1>Page not found</h1>
      <p>
        <Link href="/">Back to the exercise library</Link>
      </p>
    </div>
  );
}
