import styles from "./Card.module.css";

export default function Card({
  label,
  value,
  unit,
  subtext,
  icon,
  variant,
}: {
  label: string;
  value: string;
  unit?: string;
  subtext?: string;
  icon?: string;
  variant?: "danger" | "warning" | "success";
}) {
  return (
    <div className={`${styles.card} ${variant ? styles[variant] : ""}`}>
      <div className={styles.header}>
        {icon && (
          <span className={`material-symbols-outlined ${styles.icon}`}>
            {icon}
          </span>
        )}
        <p className={styles.label}>{label}</p>
      </div>

      <p className={styles.value}>
        {value} {unit && <span className={styles.unit}>{unit}</span>}
      </p>

      {subtext && <p className={styles.subtext}>{subtext}</p>}
    </div>
  );
}
