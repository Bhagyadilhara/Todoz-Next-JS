"use client";

import { useSyncExternalStore } from "react";
import type { Todo } from "@/lib/types";
import { loadTodos, saveTodos } from "@/lib/storage";

// A minimal external store so the todo list can be read with
// `useSyncExternalStore`, keeping localStorage (read only in the browser)
// safely out of the render path and avoiding hydration mismatches.
const EMPTY_TODOS: Todo[] = [];

let todos: Todo[] = EMPTY_TODOS;
let isInitialized = false;
const listeners = new Set<() => void>();

function ensureInitialized() {
  if (isInitialized) return;
  todos = loadTodos();
  isInitialized = true;
}

function setTodos(next: Todo[]) {
  todos = next;
  saveTodos(todos);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  ensureInitialized();
  return todos;
}

function getServerSnapshot() {
  return EMPTY_TODOS;
}

function addTodo(title: string) {
  const trimmed = title.trim();
  if (!trimmed) return;

  ensureInitialized();
  const newTodo: Todo = {
    id: crypto.randomUUID(),
    title: trimmed,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  setTodos([...todos, newTodo]);
}

function toggleTodo(id: string) {
  ensureInitialized();
  setTodos(
    todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
  );
}

function deleteTodo(id: string) {
  ensureInitialized();
  setTodos(todos.filter((todo) => todo.id !== id));
}

function clearCompleted() {
  ensureInitialized();
  setTodos(todos.filter((todo) => !todo.completed));
}

/** Reads and mutates the todo list, kept in sync with localStorage. */
export function useTodos() {
  const currentTodos = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return { todos: currentTodos, addTodo, toggleTodo, deleteTodo, clearCompleted };
}
