"use client";
import styles from "./MobileHeader.module.css";

interface Props {
  onMenuOpen: () => void;
}

export default function MobileHeader({ onMenuOpen }: Props) {
  return (
    <header className={styles.header}>
      <button
        className={styles.menuBtn}
        onClick={onMenuOpen}
        aria-label="Open menu"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>
      <h1 className={styles.logo}>Travelog</h1>
      <div className={styles.spacer} /> {/* keeps logo centered */}
    </header>
  );
}
