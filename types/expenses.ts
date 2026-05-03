export type ExpenseCategory =
  | "food"
  | "transport"
  | "accommodation"
  | "activities"
  | "shopping"
  | "other";

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  note?: string;
  createdAt: string;
}

export interface CreateExpenseFormValues {
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  note?: string;
}

export const EXPENSE_CATEGORIES: {
  value: ExpenseCategory;
  label: string;
  icon: string;
}[] = [
  { value: "food", label: "Food & Drink", icon: "restaurant" },
  { value: "transport", label: "Transport", icon: "directions_bus" },
  { value: "accommodation", label: "Stay", icon: "hotel" },
  { value: "activities", label: "Activities", icon: "local_activity" },
  { value: "shopping", label: "Shopping", icon: "shopping_bag" },
  { value: "other", label: "Other", icon: "more_horiz" },
];
