export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  /** ISO date string (YYYY-MM-DD), or null if no due date is set. */
  dueDate: string | null;
}

export type TodoFilter = "all" | "active" | "completed";

export type TodoSort = "created" | "dueDate";
