import type { TodoPriority } from "./types";

export const PRIORITY_ORDER: TodoPriority[] = ["low", "medium", "high"];

export const PRIORITY_LABELS: Record<TodoPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const PRIORITY_BADGE_CLASSES: Record<TodoPriority, string> = {
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  high: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
};

export function nextPriority(priority: TodoPriority): TodoPriority {
  const index = PRIORITY_ORDER.indexOf(priority);
  return PRIORITY_ORDER[(index + 1) % PRIORITY_ORDER.length];
}
