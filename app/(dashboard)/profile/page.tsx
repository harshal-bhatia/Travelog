"use client";

import { useEffect, useState, useCallback } from "react";
import { getActiveTripId, getTripById, updateTrip, deleteTrip, getTrips, setActiveTripId } from "@/lib/trips";
import { getTotalSpentByTrip } from "@/lib/expenses";
import { Trip, CreateTripFormValues } from "@/types/trips";
import styles from "./profile.module.css";
import layoutStyles from "../dashboardLayout.module.css";
import Modal from "@/components/ui/Modal/Modal";
import Button from "@/components/ui/Button/Button";
import { format, parseISO, differenceInDays } from "date-fns";
import { useRouter } from "next/navigation";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ProfilePage() {
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [totalSpent, setTotalSpent] = useState(0);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [form, setForm] = useState<CreateTripFormValues>({
    name: "",
    destination: "",
    budget: 0,
    startDate: "",
    endDate: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    const tripId = getActiveTripId();
    if (!tripId) return;
    const [currentTrip, spent] = await Promise.all([
      getTripById(tripId),
      getTotalSpentByTrip(tripId),
    ]);
    if (currentTrip) {
      setTrip(currentTrip);
      setTotalSpent(spent);
      setForm({
        name: currentTrip.name,
        destination: currentTrip.destination,
        budget: currentTrip.budget,
        startDate: currentTrip.startDate,
        endDate: currentTrip.endDate ?? "",
      });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const refresh = () => load();
    window.addEventListener("activeTripChanged", refresh);
    window.addEventListener("tripUpdated", refresh);
    return () => {
      window.removeEventListener("activeTripChanged", refresh);
      window.removeEventListener("tripUpdated", refresh);
    };
  }, [load]);

  function updateField<K extends keyof CreateTripFormValues>(
    key: K,
    value: CreateTripFormValues[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!trip) return;
    setIsSaving(true);
    try {
      await updateTrip(trip.id, {
        name: form.name.trim(),
        destination: form.destination.trim(),
        budget: Number(form.budget),
        startDate: form.startDate,
        endDate: form.endDate || undefined,
      });
      await load();
      setIsEditOpen(false);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!trip) return;
    setIsDeleting(true);
    try {
      await deleteTrip(trip.id);
      const remaining = await getTrips();
      if (remaining.length > 0) {
        setActiveTripId(remaining[remaining.length - 1].id);
      } else {
        localStorage.removeItem("activeTripId");
      }
      window.dispatchEvent(new Event("tripDeleted"));
      window.dispatchEvent(new Event("tripCreated"));
      router.push("/");
    } finally {
      setIsDeleting(false);
    }
  }

  if (!trip) {
    return (
      <div className={styles.noTrip}>
        <span className="material-symbols-outlined">info</span>
        <p>No trip selected. Create or select a trip first.</p>
      </div>
    );
  }

  const budget = trip.budget;
  const remaining = budget - totalSpent;
  const percentage = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;
  const isOverBudget = totalSpent > budget && budget > 0;

  let tripDuration: string | null = null;
  let tripStatus = "Upcoming";
  if (trip.startDate) {
    const start = parseISO(trip.startDate);
    const today = new Date();
    const daysToStart = differenceInDays(start, today);
    if (daysToStart > 0) {
      tripStatus = `Starts in ${daysToStart} day${daysToStart === 1 ? "" : "s"}`;
    } else if (daysToStart === 0) {
      tripStatus = "Starts today";
    } else if (trip.endDate) {
      const end = parseISO(trip.endDate);
      const daysToEnd = differenceInDays(end, today);
      tripStatus = daysToEnd >= 0 ? "In progress" : "Completed";
    } else {
      tripStatus = "In progress";
    }

    if (trip.endDate) {
      const end = parseISO(trip.endDate);
      const dur = differenceInDays(end, start) + 1;
      tripDuration = `${dur} day${dur === 1 ? "" : "s"}`;
    }
  }

  return (
    <div>
      <div className={layoutStyles.pageHeader}>
        <div>
          <h1 className={layoutStyles.pageTitle}>Trip Details</h1>
          <p className={layoutStyles.pageSubtitle}>
            Manage your trip information
          </p>
        </div>
        <Button onClick={() => setIsEditOpen(true)}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
            Edit Trip
          </span>
        </Button>
      </div>

      <div className={styles.content}>
        <div className={styles.heroCard}>
          <div className={styles.heroTop}>
            <div className={styles.heroAvatar}>
              {trip.destination.slice(0, 2).toUpperCase()}
            </div>
            <div className={styles.heroInfo}>
              <h2 className={styles.tripName}>{trip.name}</h2>
              <p className={styles.tripDest}>
                <span className="material-symbols-outlined">location_on</span>
                {trip.destination}
              </p>
            </div>
            <span className={`${styles.statusBadge} ${tripStatus === "In progress" ? styles.statusActive : tripStatus === "Completed" ? styles.statusDone : ""}`}>
              {tripStatus}
            </span>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className="material-symbols-outlined">calendar_today</span>
              <div>
                <p className={styles.detailLabel}>Start Date</p>
                <p className={styles.detailValue}>
                  {trip.startDate
                    ? format(parseISO(trip.startDate), "MMMM d, yyyy")
                    : "—"}
                </p>
              </div>
            </div>
            <div className={styles.detailItem}>
              <span className="material-symbols-outlined">event</span>
              <div>
                <p className={styles.detailLabel}>End Date</p>
                <p className={styles.detailValue}>
                  {trip.endDate
                    ? format(parseISO(trip.endDate), "MMMM d, yyyy")
                    : "Not set"}
                </p>
              </div>
            </div>
            {tripDuration && (
              <div className={styles.detailItem}>
                <span className="material-symbols-outlined">timelapse</span>
                <div>
                  <p className={styles.detailLabel}>Duration</p>
                  <p className={styles.detailValue}>{tripDuration}</p>
                </div>
              </div>
            )}
            <div className={styles.detailItem}>
              <span className="material-symbols-outlined">schedule</span>
              <div>
                <p className={styles.detailLabel}>Created</p>
                <p className={styles.detailValue}>
                  {format(parseISO(trip.createdAt), "MMMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.budgetCard}>
          <h3 className={styles.cardTitle}>Budget Summary</h3>

          <div className={styles.budgetStats}>
            <div className={styles.budgetStat}>
              <p className={styles.budgetStatLabel}>Total Budget</p>
              <p className={styles.budgetStatValue}>{formatCurrency(budget)}</p>
            </div>
            <div className={styles.budgetStat}>
              <p className={styles.budgetStatLabel}>Spent</p>
              <p className={`${styles.budgetStatValue} ${isOverBudget ? styles.danger : ""}`}>
                {formatCurrency(totalSpent)}
              </p>
            </div>
            <div className={styles.budgetStat}>
              <p className={styles.budgetStatLabel}>Remaining</p>
              <p className={`${styles.budgetStatValue} ${isOverBudget ? styles.danger : styles.safe}`}>
                {formatCurrency(remaining)}
              </p>
            </div>
          </div>

          <div className={styles.progressBarWrap}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${percentage}%`,
                  background: isOverBudget
                    ? "var(--color-danger)"
                    : "var(--color-primary)",
                }}
              />
            </div>
            <p className={styles.progressLabel}>
              {Math.round(percentage)}% used
            </p>
          </div>
        </div>

        <div className={styles.dangerZone}>
          <h3 className={styles.cardTitle}>Danger Zone</h3>
          <p className={styles.dangerDesc}>
            Deleting this trip will permanently remove all its expenses, notes,
            and activities. This cannot be undone.
          </p>
          <button
            className={styles.deleteBtn}
            onClick={() => setIsDeleteOpen(true)}
          >
            <span className="material-symbols-outlined">delete_forever</span>
            Delete this trip
          </button>
        </div>
      </div>

      <Modal
        open={isEditOpen}
        onClose={() => { if (!isSaving) setIsEditOpen(false); }}
        title="Edit Trip"
      >
        <form onSubmit={handleSave} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Trip Name</label>
            <input
              className={styles.input}
              placeholder="e.g. Swiss Alps Trek"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Destination</label>
            <input
              className={styles.input}
              placeholder="e.g. Manali, Bali, Jaipur"
              value={form.destination}
              onChange={(e) => updateField("destination", e.target.value)}
              required
            />
          </div>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Budget (₹)</label>
              <div style={{ position: "relative" }}>
                <span className={styles.prefix}>₹</span>
                <input
                  className={styles.input}
                  style={{ paddingLeft: 28 }}
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.budget || ""}
                  onChange={(e) => updateField("budget", Number(e.target.value))}
                />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Start Date</label>
              <input
                className={styles.input}
                type="date"
                value={form.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
                required
              />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>End Date (optional)</label>
            <input
              className={styles.input}
              type="date"
              value={form.endDate ?? ""}
              onChange={(e) => updateField("endDate", e.target.value)}
            />
          </div>
          <div className={styles.formActions}>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => setIsEditOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={isDeleteOpen}
        onClose={() => { if (!isDeleting) setIsDeleteOpen(false); }}
        title="Delete Trip"
      >
        <div className={styles.confirmDelete}>
          <div className={styles.confirmIcon}>
            <span className="material-symbols-outlined">warning</span>
          </div>
          <p className={styles.confirmText}>
            Are you sure you want to delete <strong>{trip.name}</strong>? All
            expenses, notes, and activities for this trip will be permanently
            removed.
          </p>
          <div className={styles.confirmActions}>
            <button
              className={styles.confirmDeleteBtn}
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Yes, delete trip"}
            </button>
            <button
              className={styles.cancelBtn}
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
