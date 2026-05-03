import { db } from "@/db";
import { nanoid } from "nanoid";
import { Activity, CreateActivityFormValues } from "@/types/activities";

export async function createActivity(
  tripId: string,
  data: CreateActivityFormValues,
): Promise<Activity> {
  const activity: Activity = {
    id: nanoid(),
    tripId,
    title: data.title,
    description: data.description,
    date: data.date,
    time: data.time,
    location: data.location,
    type: data.type,
    createdAt: new Date().toISOString(),
  };

  await db.activities.add(activity);
  return activity;
}

export async function getActivitiesByTrip(
  tripId: string,
): Promise<Activity[]> {
  const activities = await db.activities
    .where("tripId")
    .equals(tripId)
    .toArray();
  return activities.sort((a, b) => {
    const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return (a.time || "").localeCompare(b.time || "");
  });
}

export async function deleteActivity(id: string): Promise<void> {
  await db.activities.delete(id);
}

export async function updateActivity(
  id: string,
  data: Partial<CreateActivityFormValues>,
): Promise<void> {
  await db.activities.update(id, data);
}
