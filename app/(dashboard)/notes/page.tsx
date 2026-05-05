"use client";

import { useEffect, useState, useCallback } from "react";
import { getActiveTripId } from "@/lib/trips";
import {
  getNotesByTrip,
  createNote,
  updateNote,
  deleteNote,
} from "@/lib/notes";
import { Note, CreateNoteFormValues } from "@/types/notes";
import styles from "./notes.module.css";
import layoutStyles from "../dashboardLayout.module.css";
import Modal from "@/components/ui/Modal/Modal";
import Button from "@/components/ui/Button/Button";
import { format, parseISO } from "date-fns";

const DEFAULT_FORM: CreateNoteFormValues = { title: "", content: "" };

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [form, setForm] = useState<CreateNoteFormValues>(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const tripId = getActiveTripId();
    if (!tripId) {
      setLoading(false);
      return;
    }
    setActiveTripId(tripId);
    const data = await getNotesByTrip(tripId);
    setNotes(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const refresh = () => load();
    window.addEventListener("activeTripChanged", refresh);
    return () => window.removeEventListener("activeTripChanged", refresh);
  }, [load]);

  function openCreate() {
    setEditingNote(null);
    setForm(DEFAULT_FORM);
    setIsModalOpen(true);
  }

  function openEdit(note: Note) {
    setViewingNote(null);
    setEditingNote(note);
    setForm({ title: note.title, content: note.content });
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setEditingNote(null);
    setForm(DEFAULT_FORM);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tripId = getActiveTripId();
    if (!tripId || !form.title.trim()) return;
    setIsSubmitting(true);
    try {
      if (editingNote) {
        await updateNote(editingNote.id, {
          title: form.title.trim(),
          content: form.content,
        });
      } else {
        await createNote(tripId, {
          title: form.title.trim(),
          content: form.content,
        });
      }
      await load();
      closeModal();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteNote(id);
    setViewingNote(null);
    await load();
  }

  function getPreview(content: string, maxLen = 120) {
    if (!content) return "No content";
    return content.length > maxLen ? content.slice(0, maxLen) + "…" : content;
  }

  return (
    <div>
      <div className={layoutStyles.pageHeader}>
        <div>
          <h1 className={layoutStyles.pageTitle}>Notes</h1>
          <p className={layoutStyles.pageSubtitle}>
            Capture thoughts, memories, and ideas from your trip
          </p>
        </div>
        {activeTripId && (
          <Button onClick={openCreate}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
              >
                add
              </span>
              New Note
            </span>
          </Button>
        )}
      </div>

      {activeTripId &&
        (loading ? null : notes.length === 0 ? (
          <div className={styles.emptyState}>
            <span className="material-symbols-outlined">menu_book</span>
            <p>No notes yet</p>
            <button className={styles.emptyAction} onClick={openCreate}>
              Write your first note
            </button>
          </div>
        ) : (
          <div className={styles.notesGrid}>
            {notes.map((note) => (
              <div
                key={note.id}
                className={styles.noteCard}
                onClick={() => setViewingNote(note)}
              >
                <div className={styles.noteCardTop}>
                  <h3 className={styles.noteTitle}>{note.title}</h3>
                  <button
                    className={styles.editBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(note);
                    }}
                    aria-label="Edit note"
                  >
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                </div>
                <p className={styles.notePreview}>{getPreview(note.content)}</p>
                <p className={styles.noteMeta}>
                  {format(parseISO(note.updatedAt), "MMM d, yyyy")}
                </p>
              </div>
            ))}

            <button className={styles.addCard} onClick={openCreate}>
              <span className="material-symbols-outlined">add</span>
              <span>New note</span>
            </button>
          </div>
        ))}

      <Modal
        open={isModalOpen}
        onClose={closeModal}
        title={editingNote ? "Edit Note" : "New Note"}
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Title</label>
            <input
              className={styles.input}
              placeholder="e.g. First morning in the mountains"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Content</label>
            <textarea
              className={styles.textarea}
              placeholder="Write your thoughts, memories, plans..."
              value={form.content}
              onChange={(e) =>
                setForm((f) => ({ ...f, content: e.target.value }))
              }
              rows={8}
            />
          </div>
          <div className={styles.actions}>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : editingNote
                  ? "Save Changes"
                  : "Save Note"}
            </Button>
            {editingNote && (
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => handleDelete(editingNote.id)}
              >
                <span className="material-symbols-outlined">delete</span>
                Delete
              </button>
            )}
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={closeModal}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {viewingNote && (
        <Modal
          open={!!viewingNote}
          onClose={() => setViewingNote(null)}
          title={viewingNote.title}
        >
          <div className={styles.viewContent}>
            <p className={styles.viewMeta}>
              Last updated{" "}
              {format(
                parseISO(viewingNote.updatedAt),
                "MMMM d, yyyy 'at' h:mm a",
              )}
            </p>
            <div className={styles.viewBody}>
              {viewingNote.content || (
                <span className={styles.empty}>No content</span>
              )}
            </div>
            <div className={styles.viewActions}>
              <Button onClick={() => openEdit(viewingNote)}>Edit Note</Button>
              <button
                className={styles.deleteBtn}
                onClick={() => handleDelete(viewingNote.id)}
              >
                <span className="material-symbols-outlined">delete</span>
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
