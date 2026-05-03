export type ActivityType =
  | "sightseeing"
  | "food"
  | "transport"
  | "accommodation"
  | "adventure"
  | "other";

export interface Activity {
  id: string;
  tripId: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  type: ActivityType;
  createdAt: string;
}

export interface CreateActivityFormValues {
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  type: ActivityType;
}

export const ACTIVITY_TYPES: {
  value: ActivityType;
  label: string;
  icon: string;
}[] = [
  { value: "sightseeing", label: "Sightseeing", icon: "photo_camera" },
  { value: "food", label: "Food & Drink", icon: "restaurant" },
  { value: "transport", label: "Transport", icon: "directions_bus" },
  { value: "accommodation", label: "Check-in / Stay", icon: "hotel" },
  { value: "adventure", label: "Adventure", icon: "hiking" },
  { value: "other", label: "Other", icon: "more_horiz" },
];
