import { db } from "@/db";
import { nanoid } from "nanoid";
import { Trip, CreateTripFormValues } from "@/types/trips";

export async function createTrip(data: CreateTripFormValues): Promise<Trip> {
  const trip: Trip = {
    id: nanoid(),
    name: data.name,
    destination: data.destination,
    budget: data.budget,
    startDate: data.startDate,
    endDate: data.endDate,
    createdAt: new Date().toISOString(),
  };

  await db.trips.add(trip);
  localStorage.setItem("activeTripId", trip.id);
  window.dispatchEvent(new Event("tripCreated"));

  return trip;
}

export async function getTrips(): Promise<Trip[]> {
  const trips = await db.trips.toArray();
  return trips.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export async function getTripById(id: string): Promise<Trip | undefined> {
  return db.trips.get(id);
}

export async function updateTrip(
  id: string,
  data: Partial<CreateTripFormValues>,
): Promise<void> {
  await db.trips.update(id, data);
  window.dispatchEvent(new Event("tripUpdated"));
}

export async function deleteTrip(id: string): Promise<void> {
  await db.trips.delete(id);
  await db.expenses.where("tripId").equals(id).delete();
  await db.notes.where("tripId").equals(id).delete();
  await db.activities.where("tripId").equals(id).delete();
  window.dispatchEvent(new Event("tripDeleted"));
}

export function getActiveTripId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("activeTripId");
}

export function setActiveTripId(tripId: string): void {
  localStorage.setItem("activeTripId", tripId);
  window.dispatchEvent(new Event("activeTripChanged"));
}
