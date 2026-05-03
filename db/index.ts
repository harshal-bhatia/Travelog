import Dexie, { Table } from "dexie";
import { Trip } from "@/types/trips";
import { Expense } from "@/types/expenses";
import { Note } from "@/types/notes";
import { Activity } from "@/types/activities";

class TravelogDB extends Dexie {
  trips!: Table<Trip>;
  expenses!: Table<Expense>;
  notes!: Table<Note>;
  activities!: Table<Activity>;

  constructor() {
    super("TravelogDB");

    this.version(1).stores({
      trips: "id, name, destination, startDate, createdAt",
    });

    this.version(2).stores({
      trips: "id, name, destination, startDate, createdAt",
      expenses: "id, tripId, category, date, createdAt",
      notes: "id, tripId, createdAt, updatedAt",
      activities: "id, tripId, date, type, createdAt",
    });
  }
}

export const db = new TravelogDB();
