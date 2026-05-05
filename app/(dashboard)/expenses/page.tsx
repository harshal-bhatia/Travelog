"use client";

import { useEffect, useState, useCallback } from "react";
import { getActiveTripId } from "@/lib/trips";
import {
  getExpensesByTrip,
  createExpense,
  deleteExpense,
} from "@/lib/expenses";
import {
  Expense,
  EXPENSE_CATEGORIES,
  ExpenseCategory,
  CreateExpenseFormValues,
} from "@/types/expenses";
import styles from "./expenses.module.css";
import layoutStyles from "../dashboardLayout.module.css";
import Modal from "@/components/ui/Modal/Modal";
import Button from "@/components/ui/Button/Button";
import { format, parseISO } from "date-fns";

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

function makeDefaultForm(): CreateExpenseFormValues {
  return {
    title: "",
    amount: 0,
    category: "other",
    date: new Date().toISOString().split("T")[0],
    note: "",
  };
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<CreateExpenseFormValues>(makeDefaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<ExpenseCategory | "all">(
    "all",
  );
  const [activeTripId, setActiveTripId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const tripId = getActiveTripId();
    if (!tripId) {
      setLoading(false);
      return;
    }
    setActiveTripId(tripId);
    const data = await getExpensesByTrip(tripId);
    setExpenses(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const refresh = () => load();
    window.addEventListener("activeTripChanged", refresh);
    window.addEventListener("expenseChanged", refresh);
    return () => {
      window.removeEventListener("activeTripChanged", refresh);
      window.removeEventListener("expenseChanged", refresh);
    };
  }, [load]);

  function updateField<K extends keyof CreateExpenseFormValues>(
    key: K,
    value: CreateExpenseFormValues[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tripId = getActiveTripId();
    if (!tripId || !form.title.trim() || form.amount <= 0) return;
    setIsSubmitting(true);
    try {
      await createExpense(tripId, {
        ...form,
        title: form.title.trim(),
      });
      setForm(makeDefaultForm());
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteExpense(id);
    } finally {
      setDeletingId(null);
    }
  }

  const filtered =
    activeFilter === "all"
      ? expenses
      : expenses.filter((e) => e.category === activeFilter);

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const filteredTotal = filtered.reduce((s, e) => s + e.amount, 0);

  const byCategory = EXPENSE_CATEGORIES.map((cat) => ({
    ...cat,
    total: expenses
      .filter((e) => e.category === cat.value)
      .reduce((s, e) => s + e.amount, 0),
  })).filter((c) => c.total > 0);

  const groupedByDate: Record<string, Expense[]> = {};
  for (const exp of filtered) {
    if (!groupedByDate[exp.date]) groupedByDate[exp.date] = [];
    groupedByDate[exp.date].push(exp);
  }
  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  return (
    <div>
      <div className={layoutStyles.pageHeader}>
        <div>
          <h1 className={layoutStyles.pageTitle}>Expenses</h1>
          <p className={layoutStyles.pageSubtitle}>
            Track and manage your trip spending
          </p>
        </div>
        {activeTripId && (
          <Button onClick={() => setIsModalOpen(true)}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
              >
                add
              </span>
              Add Expense
            </span>
          </Button>
        )}
      </div>
      {activeTripId && (
        <>
          <div className={styles.summaryGrid}>
            <div className={styles.totalCard}>
              <p className={styles.totalLabel}>Total Spent</p>
              <p className={styles.totalValue}>{formatCurrency(total)}</p>
              <p className={styles.totalSub}>{expenses.length} transactions</p>
            </div>
            {byCategory.map((cat) => (
              <div
                key={cat.value}
                className={`${styles.catCard} ${activeFilter === cat.value ? styles.catCardActive : ""}`}
                onClick={() =>
                  setActiveFilter((prev) =>
                    prev === cat.value ? "all" : cat.value,
                  )
                }
              >
                <div className={styles.catIcon}>
                  <span className="material-symbols-outlined">{cat.icon}</span>
                </div>
                <div>
                  <p className={styles.catLabel}>{cat.label}</p>
                  <p className={styles.catValue}>{formatCurrency(cat.total)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.listHeader}>
            <div className={styles.filters}>
              <button
                className={`${styles.filterBtn} ${activeFilter === "all" ? styles.filterActive : ""}`}
                onClick={() => setActiveFilter("all")}
              >
                All
              </button>
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  className={`${styles.filterBtn} ${activeFilter === cat.value ? styles.filterActive : ""}`}
                  onClick={() =>
                    setActiveFilter((prev) =>
                      prev === cat.value ? "all" : cat.value,
                    )
                  }
                >
                  {cat.label}
                </button>
              ))}
            </div>
            {activeFilter !== "all" && (
              <p className={styles.filterTotal}>
                {formatCurrency(filteredTotal)} in{" "}
                {getCategoryLabel(activeFilter)}
              </p>
            )}
          </div>

          {loading ? null : filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <span className="material-symbols-outlined">receipt_long</span>
              <p>No expenses yet</p>
              <button
                className={styles.emptyAction}
                onClick={() => setIsModalOpen(true)}
              >
                Log your first expense
              </button>
            </div>
          ) : (
            <div className={styles.expenseGroups}>
              {sortedDates.map((date) => (
                <div key={date} className={styles.dateGroup}>
                  <p className={styles.dateLabel}>
                    {format(parseISO(date), "EEEE, MMMM d, yyyy")}
                  </p>
                  <div className={styles.expenseList}>
                    {groupedByDate[date].map((expense) => (
                      <div key={expense.id} className={styles.expenseRow}>
                        <div className={styles.expenseCatIcon}>
                          <span className="material-symbols-outlined">
                            {getCategoryIcon(expense.category)}
                          </span>
                        </div>
                        <div className={styles.expenseInfo}>
                          <p className={styles.expenseTitle}>{expense.title}</p>
                          <p className={styles.expenseMeta}>
                            {getCategoryLabel(expense.category)}
                            {expense.note && ` · ${expense.note}`}
                          </p>
                        </div>
                        <p className={styles.expenseAmount}>
                          {formatCurrency(expense.amount)}
                        </p>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(expense.id)}
                          disabled={deletingId === expense.id}
                          aria-label="Delete expense"
                        >
                          <span className="material-symbols-outlined">
                            delete
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      <Modal
        open={isModalOpen}
        onClose={() => {
          if (!isSubmitting) {
            setForm(makeDefaultForm());
            setIsModalOpen(false);
          }
        }}
        title="Log Expense"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>What did you spend on?</label>
            <input
              className={styles.input}
              placeholder="e.g. Dinner at rooftop restaurant"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
            />
          </div>

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Amount (₹)</label>
              <div className={styles.inputWrap}>
                <span className={styles.prefix}>₹</span>
                <input
                  className={styles.input}
                  style={{ paddingLeft: 28 }}
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={form.amount || ""}
                  onChange={(e) =>
                    updateField("amount", Number(e.target.value))
                  }
                  required
                />
              </div>
            </div>
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
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Category</label>
            <div className={styles.categoryGrid}>
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  className={`${styles.categoryBtn} ${form.category === cat.value ? styles.categoryBtnActive : ""}`}
                  onClick={() => updateField("category", cat.value)}
                >
                  <span className="material-symbols-outlined">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Note (optional)</label>
            <input
              className={styles.input}
              placeholder="Add a note..."
              value={form.note}
              onChange={(e) => updateField("note", e.target.value)}
            />
          </div>

          <div className={styles.actions}>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Expense"}
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
