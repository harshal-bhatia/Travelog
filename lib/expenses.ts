import { db } from "@/db";
import { nanoid } from "nanoid";
import { Expense, CreateExpenseFormValues } from "@/types/expenses";

export async function createExpense(
  tripId: string,
  data: CreateExpenseFormValues,
): Promise<Expense> {
  const expense: Expense = {
    id: nanoid(),
    tripId,
    title: data.title,
    amount: data.amount,
    category: data.category,
    date: data.date,
    note: data.note,
    createdAt: new Date().toISOString(),
  };

  await db.expenses.add(expense);
  window.dispatchEvent(new Event("expenseChanged"));
  return expense;
}

export async function getExpensesByTrip(tripId: string): Promise<Expense[]> {
  const expenses = await db.expenses
    .where("tripId")
    .equals(tripId)
    .toArray();
  return expenses.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export async function deleteExpense(id: string): Promise<void> {
  await db.expenses.delete(id);
  window.dispatchEvent(new Event("expenseChanged"));
}

export async function updateExpense(
  id: string,
  data: Partial<CreateExpenseFormValues>,
): Promise<void> {
  await db.expenses.update(id, data);
  window.dispatchEvent(new Event("expenseChanged"));
}

export async function getTotalSpentByTrip(tripId: string): Promise<number> {
  const expenses = await getExpensesByTrip(tripId);
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}
