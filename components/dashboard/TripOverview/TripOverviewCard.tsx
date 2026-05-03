"use client";

import { useEffect, useState } from "react";
import { db } from "@/db";
import { differenceInDays } from "date-fns";

export default function TripOverviewCard() {
  const [trip, setTrip] = useState<any>(null);

  useEffect(() => {
    async function loadTrip() {
      const activeTripId = localStorage.getItem("activeTripId");

      if (!activeTripId) return;

      const trip = await db.trips.get(activeTripId);

      setTrip(trip);
    }

    loadTrip();
  }, []);

  if (!trip) return null;

  const daysLeft = trip.endDate
    ? differenceInDays(new Date(trip.endDate), new Date())
    : null;

  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <h2>{trip.name}</h2>

      <p>
        {trip.startDate} — {trip.endDate || "Ongoing"}
      </p>

      <p>Budget: ₹{trip.budget}</p>

      {daysLeft !== null && <p>{daysLeft} days left</p>}
    </div>
  );
}
