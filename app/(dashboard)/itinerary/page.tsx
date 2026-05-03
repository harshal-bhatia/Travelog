"use client";

import { useEffect, useState, useCallback } from "react";
import { getActiveTripId } from "@/lib/trips";
import {
  getActivitiesByTrip,
  createActivity,
  deleteActivity,
} from "@/lib/activities";
import {
  Activity,
  ACTIVITY_TYPES,
  ActivityType,
  CreateActivityFormValues,
} from "@/types/activities";
import styles from "./itinerary.module.css";
import layoutStyles from "../dashboardLayout.module.css";
import Modal from "@/components/ui/Modal/Modal";
import Button from "@/components/ui/Button/Button";
import { format, parseISO } from "date-fns";

function makeDefaultForm(): CreateActivityFormValues {
  return {
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    time: "",
    location: "",
    type: "sightseeing",
  };
}

function getTypeIcon(type: string) {
  return ACTIVITY_TYPES.find((t) => t.value === type)?.icon ?? "more_horiz";
}

function getTypeLabel(type: string) {
  return ACTIVITY_TYPES.find((t) => t.value === type)?.label ?? "Other";
}

export default function ItineraryPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<CreateActivityFormValues>(makeDefaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const tripId = getActiveTripId();
    if (!tripId) {
      setLoading(false);
      return;
    }
    const data = await getActivitiesByTrip(tripId);
    setActivities(data);
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

  function updateField<K extends keyof CreateActivityFormValues>(
    key: K,
    value: CreateActivityFormValues[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tripId = getActiveTripId();
    if (!tripId || !form.title.trim()) return;
    setIsSubmitting(true);
    try {
      await createActivity(tripId, { ...form, title: form.title.trim() });
      await load();
      setForm(makeDefaultForm());
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteActivity(id);
      await load();
    } finally {
      setDeletingId(null);
    }
  }

  const groupedByDate: Record<string, Activity[]> = {};
  for (const act of activities) {
    if (!groupedByDate[act.date]) groupedByDate[act.date] = [];
    groupedByDate[act.date].push(act);
  }
  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );

  return (
    <div>
      <div className={layoutStyles.pageHeader}>
        <div>
          <h1 className={layoutStyles.pageTitle}>Itinerary</h1>
          <p className={layoutStyles.pageSubtitle}>
            Plan and track your daily activities
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18 }}
            >
              add
            </span>
            Add Activity
          </span>
        </Button>
      </div>

      {loading ? null : activities.length === 0 ? (
        <div className={styles.emptyState}>
          <span className="material-symbols-outlined">calendar_month</span>
          <p>No activities planned yet</p>
          <button
            className={styles.emptyAction}
            onClick={() => setIsModalOpen(true)}
          >
            Plan your first activity
          </button>
        </div>
      ) : (
        <div className={styles.timeline}>
          {sortedDates.map((date, dateIdx) => (
            <div key={date} className={styles.dayBlock}>
              <div className={styles.dayHeader}>
                <div className={styles.dayBadge}>Day {dateIdx + 1}</div>
                <p className={styles.dayDate}>
                  {format(parseISO(date), "EEEE, MMMM d, yyyy")}
                </p>
              </div>

              <div className={styles.dayActivities}>
                {groupedByDate[date].map((activity, i) => (
                  <div key={activity.id} className={styles.activityCard}>
                    <div className={styles.timelineConnector}>
                      <div className={styles.dot} />
                      {i < groupedByDate[date].length - 1 && (
                        <div className={styles.line} />
                      )}
                    </div>
                    <div className={styles.activityContent}>
                      <div className={styles.activityHeader}>
                        <div className={styles.activityTypeIcon}>
                          <span className="material-symbols-outlined">
                            {getTypeIcon(activity.type)}
                          </span>
                        </div>
                        <div className={styles.activityMeta}>
                          <h4 className={styles.activityTitle}>
                            {activity.title}
                          </h4>
                          <div className={styles.activityTags}>
                            <span className={styles.activityType}>
                              {getTypeLabel(activity.type)}
                            </span>
                            {activity.time && (
                              <span className={styles.activityTime}>
                                <span className="material-symbols-outlined">
                                  schedule
                                </span>
                                {activity.time}
                              </span>
                            )}
                            {activity.location && (
                              <span className={styles.activityLocation}>
                                <span className="material-symbols-outlined">
                                  location_on
                                </span>
                                {activity.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(activity.id)}
                          disabled={deletingId === activity.id}
                          aria-label="Delete activity"
                        >
                          <span className="material-symbols-outlined">
                            delete
                          </span>
                        </button>
                      </div>
                      {activity.description && (
                        <p className={styles.activityDesc}>
                          {activity.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={isModalOpen}
        onClose={() => {
          if (!isSubmitting) {
            setForm(makeDefaultForm());
            setIsModalOpen(false);
          }
        }}
        title="Add Activity"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Activity Name</label>
            <input
              className={styles.input}
              placeholder="e.g. Sunrise hike to Triund"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Type</label>
            <div className={styles.typeGrid}>
              {ACTIVITY_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className={`${styles.typeBtn} ${form.type === type.value ? styles.typeBtnActive : ""}`}
                  onClick={() => updateField("type", type.value as ActivityType)}
                >
                  <span className="material-symbols-outlined">{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Date</label>
              <input
                className={styles.input}
                type="date"
                value={form.date}
                onChange={(e) => updateField("date", e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Time (optional)</label>
              <input
                className={styles.input}
                type="time"
                value={form.time}
                onChange={(e) => updateField("time", e.target.value)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Location (optional)</label>
            <input
              className={styles.input}
              placeholder="e.g. Triund Peak, Dharamsala"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description (optional)</label>
            <textarea
              className={styles.textarea}
              placeholder="Any details or notes about this activity..."
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className={styles.actions}>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add to Itinerary"}
            </Button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => {
                setForm(makeDefaultForm());
                setIsModalOpen(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
