import Link from "next/link";
import styles from "./Header.module.scss";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          Machocise
        </Link>
        <nav aria-label="Primary" className={styles.nav}>
          <ul className={styles.navList} role="list">
            <li>
              <Link href="/" className={styles.navLink}>
                Library
              </Link>
            </li>
            <li>
              <Link href="/history" className={styles.navLink}>
                History
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
