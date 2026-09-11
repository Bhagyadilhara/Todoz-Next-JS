import type { Todo } from "./types";

const STORAGE_KEY = "todo-app-todos";

function isTodo(value: unknown): value is Todo {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.completed === "boolean" &&
    typeof candidate.createdAt === "string"
  );
}

/** Reads todos from localStorage. Returns an empty list if unavailable or invalid. */
export function loadTodos(): Todo[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isTodo);
  } catch {
    return [];
  }
}

/** Persists todos to localStorage. Fails silently if storage is unavailable. */
export function saveTodos(todos: Todo[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // Storage may be full or disabled (e.g. private browsing) — ignore.
  }
}
