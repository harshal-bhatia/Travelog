"use client";
import { useState, useEffect } from "react";
import MobileHeader from "./MobileHeader";
import MobileDrawer from "./MobileDrawer";
import { db } from "@/db";
import { getActiveTripId, setActiveTripId } from "@/lib/trips";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [trips, setTrips] = useState<{ id: string; name: string }[]>([]);
  const [activeTripId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const allTrips = await db.trips.toArray();
      setTrips(allTrips);
      setActiveId(getActiveTripId());
    };
    load();

    window.addEventListener("tripCreated", load);
    window.addEventListener("activeTripChanged", load);
    return () => {
      window.removeEventListener("tripCreated", load);
      window.removeEventListener("activeTripChanged", load);
    };
  }, []);

  const handleTripSelect = (id: string) => {
    setActiveTripId(id);
    setActiveId(id);
    window.dispatchEvent(new Event("activeTripChanged"));
  };

  return (
    <>
      <MobileHeader onMenuOpen={() => setIsOpen(true)} />
      <MobileDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        trips={trips}
        activeTripId={activeTripId}
        onTripSelect={handleTripSelect}
        onCreateTrip={() => {
          window.dispatchEvent(new Event("openCreateTripModal"));
          window.dispatchEvent(new Event("activeTripChanged"));
          setIsOpen(false);
        }}
      />
    </>
  );
}
