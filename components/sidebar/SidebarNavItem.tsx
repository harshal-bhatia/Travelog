"use client";

import styles from "./SidebarNavItem.module.css";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function SidebarNavItem({
  icon,
  label,
  href,
}: {
  icon: string;
  label: string;
  href: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`${styles.item} ${isActive ? styles.active : ""}`}
    >
      <span className={`material-symbols-outlined ${styles.icon}`}>{icon}</span>
      <p className={styles.label}>{label}</p>
    </Link>
  );
}
