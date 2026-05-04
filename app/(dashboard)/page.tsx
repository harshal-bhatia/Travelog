"use client";

import { useEffect, useState, useCallback } from "react";
import { getTrips, getTripById, getActiveTripId } from "@/lib/trips";
import { getExpensesByTrip, getTotalSpentByTrip } from "@/lib/expenses";
import { getNotesByTrip } from "@/lib/notes";
import { getActivitiesByTrip } from "@/lib/activities";
import CreateTripOnboarding from "@/components/onboarding/CreateTripOnboarding";
import styles from "./dashboardLayout.module.css";
import pageStyles from "./dashboard.module.css";
import Card from "@/components/dashboard/Card/Card";
import { Trip } from "@/types/trips";
import { Expense } from "@/types/expenses";
import { EXPENSE_CATEGORIES } from "@/types/expenses";
import { differenceInDays, format, parseISO, isPast } from "date-fns";
import Link from "next/link";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getCategoryIcon(cat: string) {
  return EXPENSE_CATEGORIES.find((c) => c.value === cat)?.icon ?? "more_horiz";
}

function getCategoryLabel(cat: string) {
  return EXPENSE_CATEGORIES.find((c) => c.value === cat)?.label ?? "Other";
}

console.log("Auto deploy works!");

export default function DashboardPage() {
  const [hasTrips, setHasTrips] = useState<boolean | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [notesCount, setNotesCount] = useState(0);
  const [activitiesCount, setActivitiesCount] = useState(0);

  const load = useCallback(async () => {
    const trips = await getTrips();
    setHasTrips(trips.length > 0);

    const activeTripId = getActiveTripId();
    if (!activeTripId) return;

    const [currentTrip, tripExpenses, spent, notes, activities] =
      await Promise.all([
        getTripById(activeTripId),
        getExpensesByTrip(activeTripId),
        getTotalSpentByTrip(activeTripId),
        getNotesByTrip(activeTripId),
        getActivitiesByTrip(activeTripId),
      ]);

    setTrip(currentTrip ?? null);
    setExpenses(tripExpenses.slice(0, 5));
    setTotalSpent(spent);
    setNotesCount(notes.length);
    setActivitiesCount(activities.length);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const refresh = () => load();
    window.addEventListener("activeTripChanged", refresh);
    window.addEventListener("expenseChanged", refresh);
    window.addEventListener("tripUpdated", refresh);
    return () => {
      window.removeEventListener("activeTripChanged", refresh);
      window.removeEventListener("expenseChanged", refresh);
      window.removeEventListener("tripUpdated", refresh);
    };
  }, [load]);

  const handleCreateTrip = () => load();

  if (hasTrips === null) return null;
  if (!hasTrips) return <CreateTripOnboarding onCreate={handleCreateTrip} />;

  const budget = trip?.budget ?? 0;
  const percentage =
    budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;
  const remaining = budget - totalSpent;
  const remainingPct = budget > 0 ? Math.max(100 - percentage, 0) : 100;

  let countdownValue = "—";
  let countdownUnit = "";
  let countdownSub = "";
  if (trip?.startDate) {
    const start = parseISO(trip.startDate);
    const today = new Date();
    const diff = differenceInDays(start, today);
    if (diff > 0) {
      countdownValue = String(diff);
      countdownUnit = "days";
      countdownSub = "Until departure";
    } else if (diff === 0) {
      countdownValue = "Today";
      countdownSub = "Trip starts today!";
    } else {
      const endDate = trip.endDate ? parseISO(trip.endDate) : null;
      if (endDate && !isPast(endDate)) {
        const elapsed = Math.abs(diff);
        countdownValue = String(elapsed);
        countdownUnit = "days";
        countdownSub = "Into the trip";
      } else {
        countdownValue = "Done";
        countdownSub = "Trip completed";
      }
    }
  }

  const isOverBudget = totalSpent > budget && budget > 0;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{trip ? trip.name : "Dashboard"}</h1>
          <p className={styles.pageSubtitle}>
            {trip
              ? `${trip.destination}${trip.startDate ? ` · ${format(parseISO(trip.startDate), "MMM d, yyyy")}` : ""}`
              : "Select or create a trip to get started."}
          </p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <Card
          label="Total Budget"
          value={formatCurrency(budget)}
          subtext={`${formatCurrency(remaining)} remaining`}
          icon="payments"
        />
        <Card
          label="Amount Spent"
          value={formatCurrency(totalSpent)}
          subtext={`${Math.round(percentage)}% of budget used`}
          icon="receipt_long"
          variant={isOverBudget ? "danger" : undefined}
        />
        <Card
          label="Countdown"
          value={countdownValue}
          unit={countdownUnit}
          subtext={countdownSub || "Set a start date"}
          icon="timer"
        />
      </div>

      <div className={pageStyles.dashboardGrid}>
        <div className={pageStyles.leftCol}>
          <div className={styles.budgetCard}>
            <div className={styles.budgetHead}>
              <div>
                <h3 className={styles.budgetTitle}>Budget Overview</h3>
                <p className={styles.budgetSubtitle}>
                  Tracking your trip expenses
                </p>
              </div>
              <div className={styles.summary}>
                <p className={styles.spent}>
                  {formatCurrency(totalSpent)} <span>spent</span>
                </p>
                <p
                  className={styles.remaining}
                  style={{
                    color: isOverBudget ? "var(--color-danger)" : undefined,
                  }}
                >
                  {Math.round(remainingPct)}% available
                </p>
              </div>
            </div>
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
            <div className={styles.budgetTotal}>
              <p className={styles.meta}>
                {formatCurrency(totalSpent)} of {formatCurrency(budget)}
              </p>
              <Link href="/expenses" className={styles.action}>
                <span className="material-symbols-outlined">add_circle</span>
                <span className={styles.text}>Log an expense</span>
              </Link>
            </div>
          </div>

          <div className={pageStyles.recentExpenses}>
            <div className={pageStyles.sectionHead}>
              <h3 className={pageStyles.sectionTitle}>Recent Expenses</h3>
              <Link href="/expenses" className={pageStyles.seeAll}>
                See all
              </Link>
            </div>

            {expenses.length === 0 ? (
              <div className={pageStyles.emptyState}>
                <span className="material-symbols-outlined">receipt_long</span>
                <p>No expenses logged yet</p>
                <Link href="/expenses" className={pageStyles.emptyAction}>
                  Add your first expense
                </Link>
              </div>
            ) : (
              <div className={pageStyles.expenseList}>
                {expenses.map((expense) => (
                  <div key={expense.id} className={pageStyles.expenseRow}>
                    <div className={pageStyles.expenseCatIcon}>
                      <span className="material-symbols-outlined">
                        {getCategoryIcon(expense.category)}
                      </span>
                    </div>
                    <div className={pageStyles.expenseInfo}>
                      <p className={pageStyles.expenseTitle}>{expense.title}</p>
                      <p className={pageStyles.expenseMeta}>
                        {getCategoryLabel(expense.category)} ·{" "}
                        {format(parseISO(expense.date), "MMM d")}
                      </p>
                    </div>
                    <p className={pageStyles.expenseAmount}>
                      {formatCurrency(expense.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={pageStyles.rightCol}>
          <div className={pageStyles.quickLinks}>
            <h3
              className={pageStyles.sectionTitle}
              style={{ marginBottom: 16 }}
            >
              Quick Access
            </h3>
            <Link href="/itinerary" className={pageStyles.quickCard}>
              <div className={pageStyles.quickIcon}>
                <span className="material-symbols-outlined">
                  calendar_month
                </span>
              </div>
              <div>
                <p className={pageStyles.quickLabel}>Itinerary</p>
                <p className={pageStyles.quickSub}>
                  {activitiesCount} activit{activitiesCount === 1 ? "y" : "ies"}
                </p>
              </div>
              <span
                className={`material-symbols-outlined ${pageStyles.quickArrow}`}
              >
                chevron_right
              </span>
            </Link>
            <Link href="/notes" className={pageStyles.quickCard}>
              <div className={pageStyles.quickIcon}>
                <span className="material-symbols-outlined">menu_book</span>
              </div>
              <div>
                <p className={pageStyles.quickLabel}>Notes</p>
                <p className={pageStyles.quickSub}>
                  {notesCount} note{notesCount === 1 ? "" : "s"}
                </p>
              </div>
              <span
                className={`material-symbols-outlined ${pageStyles.quickArrow}`}
              >
                chevron_right
              </span>
            </Link>
            <Link href="/expenses" className={pageStyles.quickCard}>
              <div className={pageStyles.quickIcon}>
                <span className="material-symbols-outlined">
                  account_balance_wallet
                </span>
              </div>
              <div>
                <p className={pageStyles.quickLabel}>Expenses</p>
                <p className={pageStyles.quickSub}>
                  {formatCurrency(totalSpent)} logged
                </p>
              </div>
              <span
                className={`material-symbols-outlined ${pageStyles.quickArrow}`}
              >
                chevron_right
              </span>
            </Link>
            <Link href="/profile" className={pageStyles.quickCard}>
              <div className={pageStyles.quickIcon}>
                <span className="material-symbols-outlined">info</span>
              </div>
              <div>
                <p className={pageStyles.quickLabel}>Trip Details</p>
                <p className={pageStyles.quickSub}>View & edit trip info</p>
              </div>
              <span
                className={`material-symbols-outlined ${pageStyles.quickArrow}`}
              >
                chevron_right
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
