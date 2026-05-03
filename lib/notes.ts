import { db } from "@/db";
import { nanoid } from "nanoid";
import { Note, CreateNoteFormValues } from "@/types/notes";

export async function createNote(
  tripId: string,
  data: CreateNoteFormValues,
): Promise<Note> {
  const now = new Date().toISOString();
  const note: Note = {
    id: nanoid(),
    tripId,
    title: data.title,
    content: data.content,
    createdAt: now,
    updatedAt: now,
  };

  await db.notes.add(note);
  return note;
}

export async function getNotesByTrip(tripId: string): Promise<Note[]> {
  const notes = await db.notes.where("tripId").equals(tripId).toArray();
  return notes.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function updateNote(
  id: string,
  data: Partial<CreateNoteFormValues>,
): Promise<void> {
  await db.notes.update(id, { ...data, updatedAt: new Date().toISOString() });
}

export async function deleteNote(id: string): Promise<void> {
  await db.notes.delete(id);
}
