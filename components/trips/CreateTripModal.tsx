"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal/Modal";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import styles from "./CreateTripModal.module.css";
import { createTrip, getTrips } from "@/lib/trips";
import { CreateTripFormValues } from "@/types/trips";

export default function CreateTripModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [form, setForm] = useState<CreateTripFormValues>({
    name: "",
    destination: "",
    budget: 0,
    startDate: "",
    endDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  function updateField<K extends keyof CreateTripFormValues>(
    key: K,
    value: CreateTripFormValues[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function resetForm() {
    setForm({
      name: "",
      destination: "",
      budget: 0,
      startDate: "",
      endDate: "",
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = form.name.trim();
    const trimmedDestination = form.destination.trim();
    const parsedBudget = Number(form.budget);

    if (!trimmedName || !trimmedDestination || !form.startDate) {
      return;
    }

    if (Number.isNaN(parsedBudget) || parsedBudget < 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      // await createTrip(values);
      await createTrip({
        name: trimmedName,
        destination: trimmedDestination,
        budget: parsedBudget,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
      });
      await getTrips();
      onSubmit();
      resetForm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    if (isSubmitting) return;
    resetForm();
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Create New Trip">
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>Trip Name</label>
          <Input
            placeholder="e.g. Swiss Alps Trek"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Destination / Location</label>
          <Input
            placeholder="e.g. Manali, Bali, Jaipur"
            value={form.destination}
            onChange={(event) => updateField("destination", event.target.value)}
          />
        </div>

        <div className={styles.grid}>
          <div className={styles.field}>
            <label className={styles.label}>Trip Budget</label>
            <div className={styles.inputWrap}>
              <span className={styles.prefix}>₹</span>
              <input
                className={styles.nativeInput}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.budget}
                onChange={(event) =>
                  updateField("budget", Number(event.target.value))
                }
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Start Date</label>
            <input
              className={styles.nativeInput}
              type="date"
              min={today}
              value={form.startDate}
              onChange={(event) => {
                const startDate = event.target.value;
                updateField("startDate", startDate);
                if (form.endDate && form.endDate < startDate) {
                  updateField("endDate", "");
                }
              }}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>End Date</label>
          <input
            className={styles.nativeInput}
            type="date"
            value={form.endDate}
            min={form.startDate || today}
            onChange={(event) => updateField("endDate", event.target.value)}
          />
        </div>

        <div className={styles.actions}>
          <Button type="submit">
            {isSubmitting ? "Creating..." : "Start Journey"}
          </Button>

          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
