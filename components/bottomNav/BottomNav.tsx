"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./BottomNav.module.css";

export default function BottomNav() {
  const pathname = usePathname();

  const items = [
    { icon: "dashboard", label: "Dashboard", href: "/" },
    { icon: "calendar_month", label: "Itinerary", href: "/itinerary" },
    { icon: "account_balance_wallet", label: "Expenses", href: "/expenses" },
    { icon: "menu_book", label: "Notes", href: "/notes" },
    { icon: "info", label: "Details", href: "/profile" },
  ];

  return (
    <nav className={styles.bottomNav}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`${styles.navItem} ${pathname === item.href ? styles.active : ""}`}
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
