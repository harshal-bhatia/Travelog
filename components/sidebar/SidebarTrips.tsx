"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./SidebarNavItem.module.css";
import { getTrips, getActiveTripId, setActiveTripId } from "@/lib/trips";
import { getTripInitials } from "@/lib/utils";
import CreateTripModal from "@/components/trips/CreateTripModal";
import { Trip } from "@/types/trips";

export default function SidebarTrip() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTripId, setActiveId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const load = useCallback(async () => {
    const allTrips = await getTrips();
    const activeId = getActiveTripId();
    setTrips(allTrips);
    setActiveId(activeId);
  }, []);

  useEffect(() => {
    load();

    const events = ["tripCreated", "activeTripChanged", "tripUpdated", "tripDeleted"];
    events.forEach((e) => window.addEventListener(e, load));
    return () => events.forEach((e) => window.removeEventListener(e, load));
  }, [load]);

  function handleSelectTrip(id: string) {
    setActiveTripId(id);
    setActiveId(id);
  }

  function handleCreateTrip() {
    load();
    setIsModalOpen(false);
  }

  return (
    <>
      <aside className={styles.tripSidebar}>
        <div className={styles.tripTop}>
          <div className={styles.logoIcon}>
            <span className="material-symbols-outlined">explore</span>
          </div>
        </div>

        <div className={styles.tripList}>
          {trips.map((trip) => {
            const isActive = trip.id === activeTripId;
            return (
              <div
                key={trip.id}
                onClick={() => handleSelectTrip(trip.id)}
                className={`${styles.tripItem} ${isActive ? styles.activeTrip : ""}`}
                title={trip.name}
              >
                {isActive && <div className={styles.activeIndicator} />}
                <div className={styles.tripAvatar}>
                  {getTripInitials(trip.destination)}
                </div>
              </div>
            );
          })}

          <button
            className={styles.addTrip}
            onClick={() => setIsModalOpen(true)}
            title="Create new trip"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </aside>

      <CreateTripModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTrip}
      />
    </>
  );
}
