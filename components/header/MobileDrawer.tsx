"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./MobileHeader.module.css";
import CreateTripModal from "../trips/CreateTripModal";

interface Trip {
  id: string;
  name: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  trips: Trip[];
  activeTripId: string | null;
  onTripSelect: (id: string) => void;
  onCreateTrip: () => void;
}

export default function MobileDrawer({
  isOpen,
  onClose,
  trips,
  activeTripId,
  onTripSelect,
  onCreateTrip,
}: Props) {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // close on route change
  useEffect(() => {
    onClose();
  }, [pathname]);

  // close on escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const navItems = [
    { icon: "dashboard", label: "Dashboard", href: "/" },
    { icon: "calendar_month", label: "Itinerary", href: "/itinerary" },
    { icon: "account_balance_wallet", label: "Expenses", href: "/expenses" },
    { icon: "menu_book", label: "Notes", href: "/notes" },
    { icon: "info", label: "Trip Details", href: "/profile" },
  ];

  return (
    <>
      {/* backdrop */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ""}`}
        onClick={onClose}
      />

      {/* drawer */}
      <div className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`}>
        <div className={styles.drawerHeader}>
          <span className={styles.drawerTitle}>Menu</span>
          <button className={styles.closeBtn} onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* navigation */}
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.active : ""}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* trip switcher */}
        {trips.length > 0 && (
          <>
            <div className={styles.divider} />
            <div className={styles.sectionHeader}>
              <p className={styles.sectionLabel}>Your Trips</p>
              <span
                className="material-symbols-outlined"
                onClick={() => setIsModalOpen(true)}
                style={{ cursor: "pointer", fontSize: "1.2rem" }}
                title="Create new trip"
              >
                add
              </span>
            </div>
            <div className={styles.trips}>
              {trips.map((trip) => (
                <button
                  key={trip.id}
                  className={`${styles.tripItem} ${activeTripId === trip.id ? styles.activeTrip : ""}`}
                  onClick={() => {
                    onTripSelect(trip.id);
                    onClose();
                  }}
                >
                  <span className={styles.tripAvatar}>
                    {trip.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                  {trip.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <CreateTripModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={onCreateTrip}
      />
    </>
  );
}
